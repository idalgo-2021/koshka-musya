package config

import (
	"github.com/ilyakaznacheev/cleanenv"
)

type Config struct {
	HTTPServerAddress string `env:"HTTP_SERVER_ADDRESS" env-default:"localhost"`
	HTTPServerPort    int    `env:"HTTP_SERVER_PORT" env-default:"8080"`

	JWTSecretKey            string `env:"JWT_SECRET_KEY" env-default:""`
	JWTAccessTokenLifetime  int    `env:"JWT_ACCESS_TOKEN_LIFETIME_SECONDS" env-default:"900"`
	JWTRefreshTokenLifetime int    `env:"JWT_REFRESH_TOKEN_LIFETIME_SECONDS" env-default:"604800"`

	PostgresHost     string `env:"POSTGRES_HOST" env-default:"localhost"`
	PostgresPort     int    `env:"POSTGRES_PORT" env-default:"5432"`
	PostgresUser     string `env:"POSTGRES_USER" env-default:"myuser"`
	PostgresPassword string `env:"POSTGRES_PASSWORD" env-default:"mypass"`
	PostgresDB       string `env:"POSTGRES_DB" env-default:"mydb"`

	AssignmentAcceptanceHours int `env:"ASSIGNMENT_ACCEPTANCE_HOURS" env-default:"48"`
	AssignmentDeadlineDays    int `env:"ASSIGNMENT_DEADLINE_DAYS" env-default:"7"`

	DefaultPageLimit int `env:"DEFAULT_PAGE_LIMIT" env-default:"20"`

	FrontendURL string `env:"FRONTEND_URL" env-default:"http://localhost:3000"`

	ImagekitPublicKey   string `env:"IMAGEKIT_PUBLIC_KEY"`
	ImagekitPrivateKey  string `env:"IMAGEKIT_PRIVATE_KEY"`
	ImagekitUrlEndpoint string `env:"IMAGEKIT_ENDPOINT"`
	ImagekitUploadURL   string `env:"IMAGEKIT_UPLOAD_URL" env-default:"https://upload.imagekit.io/api/v1/files/upload"`
}

func New() (*Config, error) {
	cfg := Config{}
	err := cleanenv.ReadEnv(&cfg)
	if err != nil {
		return nil, err
	}
	return &cfg, nil
}
