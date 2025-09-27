package storage

import "context"

type UploadFormData struct {
	Token     string
	Expire    string
	Signature string
	PublicKey string
	FileName  string
	Folder    string
	Tags      string
}

type UploadResponse struct {

	// URL, на который нужно отправить файл.
	UploadURL string

	// Метод HTTP-запроса (например, POST).
	Method string

	// Данные для отправки в виде multipart/form-data.
	FormData UploadFormData

	// Заголовки, которые нужно прикрепить к запросу.
	Headers map[string]string

	// URL файла после успешной загрузки.
	FileURL string
}

type UploadParams struct {
	FileName string
	Path     string
	UserID   string
}

type FileStorageProvider interface {
	GenerateUploadURL(ctx context.Context, params UploadParams) (*UploadResponse, error)
}
