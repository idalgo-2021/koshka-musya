package auth

import (
	"net/mail"
	"strings"

	"github.com/ostrovok-hackathon-2025/koshka-musya/internal/models"
)

// /////////////

type GenerateTokenRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type GenerateTokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

///////////////

type ValidateTokenRequest struct {
	AccessToken string `json:"access_token"`
}

// ВНУТРЕННЯЯ DTO для MIDDLEWARE
type ValidatedUserDTO struct {
	UserID   string
	Username string
	RoleID   int
}

type ValidateTokenResponse struct {
	UserID   string `json:"user_id"`
	Username string `json:"username"`
}

///////////////

type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token"`
}

type RefreshTokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

///////////////

type RegisterUserRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type RegisterUserResponse struct {
	Message string `json:"message" example:"User registered successfully"`
}

///////////////

func (d *RegisterUserRequest) Validate() error {
	if strings.TrimSpace(d.Username) == "" {
		return models.ErrInvalidUsername
	}
	if strings.TrimSpace(d.Password) == "" {
		return models.ErrInvalidPassword
	}
	if _, err := mail.ParseAddress(d.Email); err != nil {
		return models.ErrInvalidEmail
	}
	return nil
}

func (d *GenerateTokenRequest) Validate() error {
	if strings.TrimSpace(d.Username) == "" {
		return models.ErrInvalidUsername
	}
	if strings.TrimSpace(d.Password) == "" {
		return models.ErrInvalidPassword
	}

	return nil
}

////////

type ErrorResponse struct {
	Message string `json:"message" example:"An unexpected error occurred."`
}
