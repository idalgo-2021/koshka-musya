package imagekit

import (
	"context"
	"fmt"
	"strconv"

	"github.com/ostrovok-hackathon-2025/koshka-musya/internal/storage"

	ik "github.com/imagekit-developer/imagekit-go"
)

type ImageKitProvider struct {
	sdk       *ik.ImageKit
	cfg       StorageConfig
	publicKey string
	uploadURL string
}

type StorageConfig struct {
	PublicKey   string
	PrivateKey  string
	UrlEndpoint string
	UploadURL   string
}

func NewStorageProvider(ctx context.Context, cfg StorageConfig) (storage.FileStorageProvider, error) {

	// TO DO: продумать вариант инициализации imagekit(ik) значениями .env, чтобы ловить ошибку конструктора
	// NewParams() - Кажется более правильным, но громоздким. Не возвращает ошибку(но наверное возвращает nil?). Плюс нужна валидация параметров(наверное?)
	// New() - Возвращает ошибку, и короче, и не нужно думать про валидацию(наверное?)), но читает переменные окружения(IMAGEKIT_PRIVATE_KEY, IMAGEKIT_PUBLIC_KEY, IMAGEKIT_ENDPOINT)

	// params := ik.NewParams{
	// 	PrivateKey:  cfg.PrivateKey,
	// 	PublicKey:   cfg.PublicKey,
	// 	UrlEndpoint: cfg.UrlEndpoint,
	// }
	// // sdk := ik.NewFromParams(params)
	// return &ImageKitProvider{sdk: sdk}, nil

	sdk, err := ik.New()
	if err != nil {
		return nil, fmt.Errorf("failed to initialize ImageKit SDK: %w", err)
	}

	return &ImageKitProvider{
		sdk:       sdk,
		cfg:       cfg,
		publicKey: cfg.PublicKey,
		uploadURL: cfg.UploadURL,
	}, nil
}

func (p *ImageKitProvider) GenerateUploadURL(ctx context.Context, params storage.UploadParams) (*storage.UploadResponse, error) {

	rsToken := p.sdk.SignToken(ik.SignTokenParam{}) //Expires по умолчанию 30 мин
	// rsToken := p.sdk.SignToken(ik.SignTokenParam{
	// 	Token:   "token-string",
	// 	Expires: 1655379249,
	// })

	formData := storage.UploadFormData{
		Token:     rsToken.Token,
		Expire:    strconv.FormatInt(rsToken.Expires, 10),
		Signature: rsToken.Signature,
		PublicKey: p.publicKey,

		FileName: params.FileName, //
		Folder:   params.Path,     //
		Tags:     params.UserID,   //
	}

	return &storage.UploadResponse{
		UploadURL: p.uploadURL, // p.cfg.UploadURL,
		Method:    "POST",
		FormData:  formData,
		Headers:   map[string]string{},
		FileURL:   "",
	}, nil

}
