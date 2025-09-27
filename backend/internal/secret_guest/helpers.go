package secret_guest

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/ostrovok-hackathon-2025/koshka-musya/pkg/logger"
	"go.uber.org/zap"
)

func (h *SecretGuestHandler) writeJSONResponse(ctx context.Context, w http.ResponseWriter, statusCode int, data interface{}) {
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

func (h *SecretGuestHandler) decodeJSONBody(ctx context.Context, r *http.Request, v interface{}) error {
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

func (h *SecretGuestHandler) writeErrorResponse(ctx context.Context, w http.ResponseWriter, statusCode int, message string) {
	// log := logger.GetLoggerFromCtx(ctx)
	// log.Info(ctx, message)

	response := ErrorResponse{Message: message}
	h.writeJSONResponse(ctx, w, statusCode, response)
}
