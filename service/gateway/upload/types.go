package upload

import (
	"net/http"
)

type File struct {
	Name       string `json:"name"`
	RawURI     string `json:"rawUri"`
	PreviewURI string `json:"previewUri"`
}

type FileResponse struct {
	*File `json:"file"`
}

func (m *FileResponse) Render(w http.ResponseWriter, r *http.Request) error {
	return nil
}
