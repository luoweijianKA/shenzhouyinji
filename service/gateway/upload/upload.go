package upload

import (
	"bytes"
	"crypto/sha1"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"

	_ "image/jpeg"
	_ "image/png"

	"github.com/disintegration/imaging"
	"github.com/go-chi/render"
	uuid "github.com/satori/go.uuid"
)

const (
	RESOURCES_NAME   = "resources"
	UPLOADS          = "uploads"
	UPLOADS_ORIGINAL = "uploads_original"
)

func newFilename(filename string) string {
	ext := filename[strings.LastIndex(filename, "."):]
	h := sha1.New()
	h.Write([]byte(uuid.NewV4().String()))

	return hex.EncodeToString(h.Sum(nil)) + ext
}

func mkdirAll(name string) error {
	if _, err := os.Stat(name); errors.Is(err, os.ErrNotExist) {
		return os.MkdirAll(name, os.ModePerm)
	}
	return nil
}

// Handler responsible for upload the files
func Handler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Add("Content-Type", "application/json; charset=UTF-8")

		// Maximum upload of 10 MB files
		r.ParseMultipartForm(10 << 20)

		// Get handler for filename, size and headers
		file, handler, err := r.FormFile("file")
		if err != nil {
			fmt.Println("Error Retrieving the File")
			fmt.Println(err)
			return
		}
		defer file.Close()
		fmt.Printf("Uploaded File: %+v\n", handler.Filename)
		fmt.Printf("File Size: %+v\n", handler.Size)
		fmt.Printf("MIME Header: %+v\n", handler.Header)

		name := time.Now().Format("20060102")
		tag := r.FormValue("tag")
		if len(tag) > 0 {
			name = fmt.Sprintf("%s/%s", tag, name)
		}
		if err := mkdirAll(fmt.Sprintf("%s/%s/%s", RESOURCES_NAME, UPLOADS_ORIGINAL, name)); err != nil {
			fmt.Println(err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		filename := newFilename(handler.Filename)

		// Create file
		dst, err := os.Create(fmt.Sprintf("%s/%s/%s/%s", RESOURCES_NAME, UPLOADS_ORIGINAL, name, filename))
		defer dst.Close()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Copy the uploaded file to the created file on the filesystem
		if _, err := io.Copy(dst, file); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		rawURI := fmt.Sprintf("/%s/%s/%s", UPLOADS_ORIGINAL, name, filename)
		previewURI := ""

		preview := r.FormValue("preview")
		contentType := handler.Header.Values("Content-Type")[0]
		if bool(preview == "true") && strings.HasPrefix(contentType, "image") && !strings.HasSuffix(strings.ToLower(filename), ".gif") {
			dst.Seek(0, 0)
			if err := mkdirAll(fmt.Sprintf("%s/%s/%s", RESOURCES_NAME, UPLOADS, name)); err != nil {
				fmt.Println(err)
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			if content, err := io.ReadAll(dst); err == nil {
				// Generate a thumbnail file
				thumbnailFilename := fmt.Sprintf("%s/%s/%s/%s", RESOURCES_NAME, UPLOADS, name, filename)
				img, err := imaging.Decode(bytes.NewBuffer(content))
				if err != nil {
					fmt.Println("Error image decoding", err)
				}
				if img != nil {
					thumbnail := imaging.Resize(img, 512, 0, imaging.Lanczos)
					err := imaging.Save(thumbnail, thumbnailFilename)
					if err != nil {
						fmt.Println("Error thumbnail creating", thumbnailFilename, err)
					}
					if err == nil {
						previewURI = fmt.Sprintf("/%s/%s/%s", UPLOADS, name, filename)
					}
				}
			}
		}

		render.Status(r, http.StatusOK)
		render.Render(w, r, &FileResponse{
			File: &File{
				Name:       handler.Filename,
				RawURI:     rawURI,
				PreviewURI: previewURI,
			},
		})
	}
}
