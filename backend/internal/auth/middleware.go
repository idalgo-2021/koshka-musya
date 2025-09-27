package auth

import (
	"context"
	"net/http"

	"github.com/ostrovok-hackathon-2025/koshka-musya/pkg/logger"
	"go.uber.org/zap"
)

type AuthenticatedUser struct {
	ID       string
	Username string
	RoleID   int
}

type userKey struct{}

var UserKey = userKey{}

func (h *AuthHandlers) AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		log := logger.GetLoggerFromCtx(ctx)

		accessToken, err := extractBearerToken(r)
		if err != nil {
			log.Warn(ctx, "Failed to extract token", zap.Error(err))
			h.writeErrorResponse(ctx, w, http.StatusUnauthorized, err.Error())
			return
		}

		dto := ValidateTokenRequest{AccessToken: accessToken}

		validatedUser, err := h.service.ValidateToken(ctx, dto)
		if err != nil {
			h.handleServiceError(w, r, err)
			return
		}

		authUserInfo := AuthenticatedUser{
			ID:       validatedUser.UserID,
			Username: validatedUser.Username,
			RoleID:   validatedUser.RoleID,
		}
		ctxWithUser := context.WithValue(ctx, UserKey, authUserInfo)

		next.ServeHTTP(w, r.WithContext(ctxWithUser))
	})
}

func (h *AuthHandlers) RoleRequiredMiddleware(allowedRoleIDs ...int) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := r.Context()
			log := logger.GetLoggerFromCtx(ctx)

			user, ok := ctx.Value(UserKey).(AuthenticatedUser)
			if !ok {
				log.Error(ctx, "Authenticated user not found in context for a role-protected route")
				h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error: user context missing")
				return
			}

			isAllowed := false
			for _, allowedRoleID := range allowedRoleIDs {
				if user.RoleID == allowedRoleID {
					isAllowed = true
					break
				}
			}

			if !isAllowed {
				log.Warn(ctx, "Forbidden access attempt by user",
					zap.String("user_id", user.ID),
					zap.Int("user_role_id", user.RoleID),
					zap.String("path", r.URL.Path),
				)
				h.writeErrorResponse(ctx, w, http.StatusForbidden, "Forbidden: You do not have the required permissions")
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
