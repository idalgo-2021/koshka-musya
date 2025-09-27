package auth

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/ostrovok-hackathon-2025/koshka-musya/internal/models"
	"github.com/ostrovok-hackathon-2025/koshka-musya/pkg/logger"
	"go.uber.org/zap"
)

func extractBearerToken(r *http.Request) (string, error) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return "", models.ErrAuthHeaderMissing
	}

	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
		return "", models.ErrAuthHeaderInvalid
	}

	return strings.TrimSpace(parts[1]), nil
}

func (h *AuthHandlers) writeJSONResponse(ctx context.Context, w http.ResponseWriter, statusCode int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)

	if data == nil {
		return
	}

	if err := json.NewEncoder(w).Encode(data); err != nil {
		log := logger.GetLoggerFromCtx(ctx)
		log.Error(ctx, "Failed to encode and write JSON response", zap.Error(err))
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}

func (h *AuthHandlers) decodeJSONBody(ctx context.Context, r *http.Request, v interface{}) error {
	err := json.NewDecoder(r.Body).Decode(v)
	if err != nil {
		log := logger.GetLoggerFromCtx(ctx)
		log.Warn(ctx,
			"Failed to decode JSON request body",
			zap.Error(err),
		)
		return err
	}
	return nil
}

func (s *AuthService) claimsFromToken(ctx context.Context, tokenString string) (*JWTClaims, error) {
	log := logger.GetLoggerFromCtx(ctx)
	token := strings.TrimSpace(tokenString)

	if token == "" {
		log.Info(ctx, "Token validation failed: provided token is empty")
		return nil, models.ErrInvalidToken
	}

	claims, err := s.JWTService.ValidateToken(token)
	if err != nil {
		log.Warn(ctx,
			"Token signature or claims validation failed",
			zap.Error(err),
		)
		return nil, models.ErrInvalidToken
	}

	if claims.UserID == "" {
		log.Warn(ctx, "Token validation failed: user_id claim is empty", zap.Any("claims", claims))
		return nil, models.ErrInvalidToken
	}

	if claims.RoleID <= 0 {
		log.Warn(ctx, "Token validation failed: role_id claim is missing or invalid", zap.Any("claims", claims))
		return nil, models.ErrInvalidToken
	}

	// ... другие дополнительные проверки claims

	return claims, nil
}

func (h *AuthHandlers) writeErrorResponse(ctx context.Context, w http.ResponseWriter, statusCode int, message string) {
	// log := logger.GetLoggerFromCtx(ctx)
	// log.Info(ctx, message)

	response := ErrorResponse{Message: message}
	h.writeJSONResponse(ctx, w, statusCode, response)
}
