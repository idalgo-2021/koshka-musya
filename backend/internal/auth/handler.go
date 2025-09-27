package auth

import (
	"net/http"

	"errors"
	"strings"

	"github.com/ostrovok-hackathon-2025/koshka-musya/internal/models"
	"github.com/ostrovok-hackathon-2025/koshka-musya/pkg/logger"
	"go.uber.org/zap"
)

type AuthHandlers struct {
	service *AuthService
}

func NewAuthHandlers(service *AuthService) *AuthHandlers {
	return &AuthHandlers{
		service: service,
	}
}

// GenerateToken
// @Summary Generate a new access token
// @Description Generates a new JWT access token for authentication.
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        credentials body auth.GenerateTokenRequest true "User Credentials"
// @Success      200 {object} auth.GenerateTokenResponse
// @Failure      400 {object} auth.ErrorResponse "Invalid request body or validation error"
// @Failure      401 {object} auth.ErrorResponse "Invalid username or password"
// @Failure      500 {object} auth.ErrorResponse "Internal server error"
// @Router       /auth/token [post]
func (h *AuthHandlers) GenerateToken(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	var dto GenerateTokenRequest

	if err := h.decodeJSONBody(ctx, r, &dto); err != nil {
		log.Warn(ctx, "Failed to decode generate token request", zap.Error(err))
		h.writeErrorResponse(ctx, w, http.StatusBadRequest, "Failed to decode generate token request")
		return
	}

	dto.Username = strings.TrimSpace(dto.Username)

	tokenResp, err := h.service.GenerateToken(ctx, dto)
	if err != nil {
		h.handleServiceError(w, r, err, dto.Username)
		return
	}

	h.writeJSONResponse(ctx, w, http.StatusOK, tokenResp)
}

// ValidateToken
// @Summary Validate an access token
// @Description Validates the provided JWT access token.
// @Tags         auth
// @Produce      json
// @Security     BearerAuth
// @Param Authorization header string true "Bearer Access Token"
// @Success      200 {object} auth.ValidateTokenResponse
// @Failure      401 {object} auth.ErrorResponse "Unauthorized or invalid token"
// @Failure      500 {object} auth.ErrorResponse "Internal server error"
// @Router       /auth/validate [post]
func (h *AuthHandlers) ValidateToken(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	accessToken, err := extractBearerToken(r)
	if err != nil {
		log.Warn(ctx, "Failed to extract bearer token", zap.Error(err))
		h.writeErrorResponse(ctx, w, http.StatusUnauthorized, "Failed to extract bearer token")
		return
	}

	dto := ValidateTokenRequest{
		AccessToken: accessToken,
	}

	validatedUser, err := h.service.ValidateToken(r.Context(), dto)
	if err != nil {
		h.handleServiceError(w, r, err)
		return
	}

	publicResponse := &ValidateTokenResponse{
		UserID:   validatedUser.UserID,
		Username: validatedUser.Username,
	}

	h.writeJSONResponse(ctx, w, http.StatusOK, publicResponse)
}

// RefreshToken
// @Summary Refresh an existing JWT token
// @Description Refresh a JWT token using a refresh token
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        input body auth.RefreshTokenRequest true "Refresh Token"
// @Success      200 {object} auth.RefreshTokenResponse
// @Failure      400 {object} auth.ErrorResponse "Invalid request body"
// @Failure      401 {object} auth.ErrorResponse "Invalid or expired refresh token"
// @Failure      500 {object} auth.ErrorResponse "Internal server error"
// @Router       /auth/refresh [post]
func (h *AuthHandlers) RefreshToken(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	var dto RefreshTokenRequest
	if err := h.decodeJSONBody(ctx, r, &dto); err != nil {
		log.Warn(ctx, "Failed to decode refresh token request", zap.Error(err))
		h.writeErrorResponse(ctx, w, http.StatusBadRequest, "Invalid request body")
		return
	}

	resp, err := h.service.RefreshToken(r.Context(), dto)
	if err != nil {
		h.handleServiceError(w, r, err)
		return
	}

	h.writeJSONResponse(ctx, w, http.StatusOK, resp)
}

// RegisterUser
// @Summary Register a new user
// @Description Register a user with username, password, and email
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        input body auth.RegisterUserRequest true "User Registration Info"
// @Success      201 {object} auth.RegisterUserResponse "message: User registered successfully"
// @Failure      400 {object} auth.ErrorResponse "Invalid request body or validation error"
// @Failure      409 {object} auth.ErrorResponse "User with this username or email already exists"
// @Failure      500 {object} auth.ErrorResponse "Internal server error"
// @Router       /auth/register [post]
func (h *AuthHandlers) RegisterUser(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	var dto RegisterUserRequest

	if err := h.decodeJSONBody(ctx, r, &dto); err != nil {
		log.Warn(ctx, "Failed to decode register user request", zap.Error(err))
		h.writeErrorResponse(ctx, w, http.StatusBadRequest, "Invalid request body")
		return
	}

	dto.Username = strings.TrimSpace(dto.Username)
	dto.Email = strings.TrimSpace(dto.Email)

	err := h.service.RegisterUser(ctx, dto)
	if err != nil {
		h.handleServiceError(w, r, err, dto.Username)
		return
	}

	resp := RegisterUserResponse{Message: "User registered successfully"}
	h.writeJSONResponse(ctx, w, http.StatusCreated, resp)
}

func (h *AuthHandlers) handleServiceError(w http.ResponseWriter, r *http.Request, err error, logInfo ...string) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	logFields := []zap.Field{zap.Error(err)}
	if len(logInfo) > 0 {
		logFields = append(logFields, zap.String("username", logInfo[0]))
	}

	switch {

	// 400 Bad Request - Ошибки валидации
	case errors.Is(err, models.ErrInvalidUsername),
		errors.Is(err, models.ErrInvalidPassword),
		errors.Is(err, models.ErrInvalidEmail):
		log.Info(ctx, "Request validation failed", logFields...)
		h.writeErrorResponse(ctx, w, http.StatusBadRequest, err.Error())

	// 401 Unauthorized - Ошибки аутентификации
	case errors.Is(err, models.ErrInvalidCredentials):
		log.Info(ctx, "Invalid credentials provided", logFields...)
		h.writeErrorResponse(ctx, w, http.StatusUnauthorized, "Invalid username or password")
	case errors.Is(err, models.ErrInvalidToken):
		log.Info(ctx, "Invalid token provided", logFields...)
		h.writeErrorResponse(ctx, w, http.StatusUnauthorized, "Invalid or expired token")

	// 409 Conflict - Конфликт ресурсов
	case errors.Is(err, models.ErrUserExists), errors.Is(err, models.ErrEmailExists):
		log.Warn(ctx, "User registration conflict", logFields...)
		h.writeErrorResponse(ctx, w, http.StatusConflict, err.Error())

	default:
		log.Error(ctx, "Unexpected service error", logFields...)
		h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "An internal server error occurred")
	}
}
