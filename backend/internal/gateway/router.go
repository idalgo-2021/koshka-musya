package gateway

import (
	"context"
	"net/http"

	"github.com/ostrovok-hackathon-2025/koshka-musya/internal/config"

	"github.com/google/uuid"
	"github.com/ostrovok-hackathon-2025/koshka-musya/internal/auth"
	"github.com/ostrovok-hackathon-2025/koshka-musya/internal/models"
	"github.com/ostrovok-hackathon-2025/koshka-musya/internal/secret_guest"
	"github.com/ostrovok-hackathon-2025/koshka-musya/pkg/logger"
	"go.uber.org/zap"

	"github.com/gorilla/mux"
	httpSwagger "github.com/swaggo/http-swagger"
)

func NewRouter(ctx context.Context, cfg *config.Config, authHandlers *auth.AuthHandlers, secretGuestHandler *secret_guest.SecretGuestHandler) *mux.Router {

	r := mux.NewRouter()
	r.Use(requestContextMiddleware, newCorsMiddleware(cfg))

	// Глобальный preflight handler для OPTIONS
	r.Methods(http.MethodOptions).HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	})

	// - - - - AUTH routes
	r.HandleFunc("/auth/token", authHandlers.GenerateToken).Methods(http.MethodPost)
	r.HandleFunc("/auth/validate", authHandlers.ValidateToken).Methods(http.MethodPost)
	r.HandleFunc("/auth/refresh", authHandlers.RefreshToken).Methods(http.MethodPost)
	r.HandleFunc("/auth/register", authHandlers.RegisterUser).Methods(http.MethodPost)

	// - - - -  PUBLIC
	r.HandleFunc("/listings", secretGuestHandler.GetListings).Methods(http.MethodGet)         // listings
	r.HandleFunc("/listings/{id}", secretGuestHandler.GetListingByID).Methods(http.MethodGet) // listings

	// - - - -  FOR AUTHENTICATED
	protectedRouter := r.PathPrefix("/").Subrouter()
	protectedRouter.Use(authHandlers.AuthMiddleware)

	protectedRouter.HandleFunc("/hellouser", secretGuestHandler.HelloUser).Methods(http.MethodGet)
	protectedRouter.HandleFunc("/assignments/my", secretGuestHandler.GetMyAssignments).Methods(http.MethodGet)                  // assignments
	protectedRouter.HandleFunc("/assignments/my/{id}", secretGuestHandler.GetMyAssignmentByID).Methods(http.MethodGet)          // assignments
	protectedRouter.HandleFunc("/assignments/my/{id}/accept", secretGuestHandler.AcceptMyAssignment).Methods(http.MethodPost)   // assignments
	protectedRouter.HandleFunc("/assignments/my/{id}/decline", secretGuestHandler.DeclineMyAssignment).Methods(http.MethodPost) // assignments

	protectedRouter.HandleFunc("/reports/my", secretGuestHandler.GetMyReports).Methods(http.MethodGet)                // reports
	protectedRouter.HandleFunc("/reports/my/{id}", secretGuestHandler.GetMyReportByID).Methods(http.MethodGet)        // reports
	protectedRouter.HandleFunc("/reports/my/{id}", secretGuestHandler.UpdateMyReport).Methods(http.MethodPatch)       // reports
	protectedRouter.HandleFunc("/reports/my/{id}/submit", secretGuestHandler.SubmitMyReport).Methods(http.MethodPost) // reports

	// - - - - UPLOADS
	protectedRouter.HandleFunc("/uploads/generate-url", secretGuestHandler.GenerateUploadURL).Methods(http.MethodPost)

	// - - - - FOR STUFF
	staffRouter := protectedRouter.PathPrefix("/").Subrouter()
	staffRouter.Use(authHandlers.RoleRequiredMiddleware(models.AdminRoleID, models.ModeratorRoleID))

	staffRouter.HandleFunc("/assignments", secretGuestHandler.GetAllAssignments).Methods(http.MethodGet)              // assignments
	staffRouter.HandleFunc("/assignments/{id}", secretGuestHandler.GetAssignmentByID_AsStaff).Methods(http.MethodGet) // assignments
	staffRouter.HandleFunc("/assignments/{id}/cancel", secretGuestHandler.CancelAssignment).Methods(http.MethodPost)  // assignments

	staffRouter.HandleFunc("/reports", secretGuestHandler.GetAllReports).Methods(http.MethodGet)               // reports
	staffRouter.HandleFunc("/reports/{id}", secretGuestHandler.GetReportByID_AsStaff).Methods(http.MethodGet)  // reports
	staffRouter.HandleFunc("/reports/{id}/approve", secretGuestHandler.ApproveReport).Methods(http.MethodPost) // reports
	staffRouter.HandleFunc("/reports/{id}/reject", secretGuestHandler.RejectReport).Methods(http.MethodPost)   // reports

	///

	staffRouter.HandleFunc("/answer_types", secretGuestHandler.GetAnswerTypes).Methods(http.MethodGet)                  // answer_types
	staffRouter.HandleFunc("/answer_types/{id:[0-9]+}", secretGuestHandler.GetAnswerTypeByID).Methods(http.MethodGet)   // answer_types
	staffRouter.HandleFunc("/answer_types", secretGuestHandler.CreateAnswerType).Methods(http.MethodPost)               // answer_types
	staffRouter.HandleFunc("/answer_types/{id:[0-9]+}", secretGuestHandler.UpdateAnswerType).Methods(http.MethodPatch)  // answer_types
	staffRouter.HandleFunc("/answer_types/{id:[0-9]+}", secretGuestHandler.DeleteAnswerType).Methods(http.MethodDelete) // answer_types

	staffRouter.HandleFunc("/media_requirements", secretGuestHandler.GetMediaRequirements).Methods(http.MethodGet) // media_requirements

	staffRouter.HandleFunc("/listing_types", secretGuestHandler.GetListingTypes).Methods(http.MethodGet)                  // listing_types
	staffRouter.HandleFunc("/listing_types/{id:[0-9]+}", secretGuestHandler.GetListingTypeByID).Methods(http.MethodGet)   // listing_types
	staffRouter.HandleFunc("/listing_types", secretGuestHandler.CreateListingType).Methods(http.MethodPost)               // listing_types
	staffRouter.HandleFunc("/listing_types/{id:[0-9]+}", secretGuestHandler.UpdateListingType).Methods(http.MethodPatch)  // listing_types
	staffRouter.HandleFunc("/listing_types/{id:[0-9]+}", secretGuestHandler.DeleteListingType).Methods(http.MethodDelete) // listing_types

	staffRouter.HandleFunc("/checklist_sections", secretGuestHandler.GetChecklistSections).Methods(http.MethodGet)                  // checklist_sections
	staffRouter.HandleFunc("/checklist_sections/{id:[0-9]+}", secretGuestHandler.GetChecklistSectionByID).Methods(http.MethodGet)   // checklist_sections
	staffRouter.HandleFunc("/checklist_sections", secretGuestHandler.CreateChecklistSection).Methods(http.MethodPost)               // checklist_sections
	staffRouter.HandleFunc("/checklist_sections/{id:[0-9]+}", secretGuestHandler.UpdateChecklistSection).Methods(http.MethodPatch)  // checklist_sections
	staffRouter.HandleFunc("/checklist_sections/{id:[0-9]+}", secretGuestHandler.DeleteChecklistSection).Methods(http.MethodDelete) // checklist_sections

	staffRouter.HandleFunc("/checklist_items", secretGuestHandler.GetChecklistItems).Methods(http.MethodGet)                  // checklist_items
	staffRouter.HandleFunc("/checklist_items/{id:[0-9]+}", secretGuestHandler.GetChecklistItemByID).Methods(http.MethodGet)   // checklist_items
	staffRouter.HandleFunc("/checklist_items", secretGuestHandler.CreateChecklistItem).Methods(http.MethodPost)               // checklist_items
	staffRouter.HandleFunc("/checklist_items/{id:[0-9]+}", secretGuestHandler.UpdateChecklistItem).Methods(http.MethodPatch)  // checklist_items
	staffRouter.HandleFunc("/checklist_items/{id:[0-9]+}", secretGuestHandler.DeleteChecklistItem).Methods(http.MethodDelete) // checklist_items

	///

	// - - - - FOR ONLY ADMINS
	adminRouter := protectedRouter.PathPrefix("/admin").Subrouter()
	adminRouter.Use(authHandlers.RoleRequiredMiddleware(models.AdminRoleID))

	adminRouter.HandleFunc("/listings", secretGuestHandler.CreateListing).Methods(http.MethodPost)       // listings
	adminRouter.HandleFunc("/assignments", secretGuestHandler.CreateAssignment).Methods(http.MethodPost) // assignments

	r.PathPrefix("/swagger/").Handler(httpSwagger.WrapHandler)

	return r
}

func newCorsMiddleware(cfg *config.Config) mux.MiddlewareFunc {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", cfg.FrontendURL)
			w.Header().Set("Access-Control-Allow-Credentials", "true")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

func requestContextMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		// 1. Генерируем уникальный ID для этого запроса.
		requestID := uuid.New().String()

		// 2. Создаем новый контекст, который содержит ТОЛЬКО что сгенерированный requestID.
		// Логгер уже лежит в r.Context() из main.go.
		ctxWithID := context.WithValue(r.Context(), logger.RequestIDKey, requestID)

		// 3. Логируем входящий запрос, используя новый контекст.
		// GetLoggerFromCtx извлечет базовый логгер из контекста,
		// а метод .Info() извлечет requestID из того же контекста.
		// Все работает автоматически!
		log := logger.GetLoggerFromCtx(ctxWithID)
		log.Info(ctxWithID, "Incoming request",
			zap.String("method", r.Method),
			zap.String("path", r.URL.Path),
			zap.String("remote_addr", r.RemoteAddr),
		)

		next.ServeHTTP(w, r.WithContext(ctxWithID))
	})
}
