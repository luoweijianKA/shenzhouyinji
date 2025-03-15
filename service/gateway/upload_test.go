package main

import (
	"os"
	"testing"

	gqlclient "github.com/99designs/gqlgen/client"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/stretchr/testify/require"

	"gateway/graph/generated"
	"gateway/graph/model"
	"gateway/graph/resolver"
)

func TestUpload(t *testing.T) {
	resolver := &resolver.Resolver{}
	srv := handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: resolver}))
	gql := gqlclient.New(srv, gqlclient.Path("/query"))

	img, _ := os.ReadFile("./testfiles/1037.jpeg")
	txtFile, _ := os.CreateTemp(os.TempDir(), "helloworld.txt")
	defer os.Remove(txtFile.Name())
	txtFile.Write(img)

	imgFile, _ := os.CreateTemp(os.TempDir(), "1037.jpeg")
	defer os.Remove(imgFile.Name())
	imgFile.Write(img)

	t.Run("valid file list upload", func(t *testing.T) {
		mutation := `mutation($files: [Upload!]!) {
			uploadFiles(files: $files) {
				name
				content
				contentType
			}
		}`
		var result struct {
			UploadFiles []*model.File
		}

		err := gql.Post(mutation, &result, gqlclient.Var("files", []*os.File{txtFile}), gqlclient.WithFiles())
		require.Nil(t, err)
		require.Equal(t, "helloworld", result.UploadFiles[0].Name)
		// for _, file := range result.UploadFiles {
		// 	if file.Name == "helloworld" {
		// 		require.Equal(t, "Hello World!", file.Content)
		// 	}
		// 	require.Equal(t, "text/plain; charset=utf-8", file.ContentType)
		// }
	})

	t.Run("upload image and generate a thumbnail", func(t *testing.T) {
		mutation := `mutation($payload: [UploadFile!]!) {
			uploadWithPayload(payload: $payload) {
				name
				content
				contentType
			}
		}`
		var result struct {
			UploadWithPayload []*model.File
		}

		payload := []map[string]interface{}{
			{"file": imgFile, "preview": true, "tag": "avatar"},
		}

		err := gql.Post(mutation, &result, gqlclient.Var("payload", payload), gqlclient.WithFiles())
		require.Nil(t, err)
		require.Equal(t, "202209301458264922", result.UploadWithPayload[0].Name)
		// for _, file := range result.UploadWithPayload {
		// 	if file.Name == "helloworld" {
		// 		require.Equal(t, "Hello World!", file.Content)
		// 	}
		// 	require.Equal(t, "text/plain; charset=utf-8", file.ContentType)
		// }
	})
}
