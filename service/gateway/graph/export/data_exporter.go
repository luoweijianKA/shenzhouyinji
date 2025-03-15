package export

import "context"

type DataExporter interface {
	Export(ctx context.Context) ([]byte, error)
}
