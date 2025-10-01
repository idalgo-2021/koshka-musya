package secret_guest

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/ostrovok-hackathon-2025/koshka-musya/internal/auth"
	"github.com/ostrovok-hackathon-2025/koshka-musya/internal/config"
	"github.com/ostrovok-hackathon-2025/koshka-musya/internal/models"
	"github.com/ostrovok-hackathon-2025/koshka-musya/pkg/logger"
	"go.uber.org/zap"
)

var validation = validator.New()

type SecretGuestHandler struct {
	service *SecretGuestService
	cfg     *config.Config
}

func NewSecretGuestHandler(service *SecretGuestService, cfg *config.Config) *SecretGuestHandler {
	return &SecretGuestHandler{service: service, cfg: cfg}
}

// helpers

func (h *SecretGuestHandler) parseUserAndID(w http.ResponseWriter, r *http.Request) (uuid.UUID, bool) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	user, ok := ctx.Value(auth.UserKey).(auth.AuthenticatedUser)
	if !ok {
		log.Error(ctx, "User information missing from context in a protected handler")
		h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		return uuid.Nil, false
	}

	userID, err := uuid.Parse(user.ID)
	if err != nil {
		log.Error(ctx, "Invalid user ID format in context", zap.String("user_id", user.ID))
		h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		return uuid.Nil, false
	}

	return userID, true
}

func (h *SecretGuestHandler) parseUUIDFromPath(w http.ResponseWriter, r *http.Request, key string) (uuid.UUID, bool) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	vars := mux.Vars(r)
	idStr, ok := vars[key]
	if !ok {
		log.Error(ctx, "URL path parameter is missing", zap.String("key", key))
		h.writeErrorResponse(ctx, w, http.StatusBadRequest, fmt.Sprintf("URL path parameter '%s' is missing", key))
		return uuid.Nil, false
	}

	parsedUUID, err := uuid.Parse(idStr)
	if err != nil {
		log.Warn(ctx, "Invalid UUID format in URL path",
			zap.String("key", key),
			zap.String("value", idStr),
			zap.Error(err),
		)
		h.writeErrorResponse(ctx, w, http.StatusBadRequest, fmt.Sprintf("Invalid %s format in URL", key))
		return uuid.Nil, false
	}

	return parsedUUID, true
}

func (h *SecretGuestHandler) parseIntFromPath(w http.ResponseWriter, r *http.Request, key string) (int, bool) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	vars := mux.Vars(r)
	idStr, ok := vars[key]
	if !ok {
		log.Error(ctx, "URL path parameter is missing", zap.String("key", key))
		h.writeErrorResponse(ctx, w, http.StatusBadRequest, fmt.Sprintf("URL path parameter '%s' is missing", key))
		return 0, false
	}

	parsedInt, err := strconv.Atoi(idStr)
	if err != nil {
		log.Warn(ctx, "Invalid integer format in URL path", zap.String("key", key), zap.String("value", idStr), zap.Error(err))
		h.writeErrorResponse(ctx, w, http.StatusBadRequest, fmt.Sprintf("Invalid %s format in URL", key))
		return 0, false
	}

	return parsedInt, true
}

func (h *SecretGuestHandler) parsePagination(r *http.Request) (page, limit int) {
	queryParams := r.URL.Query()
	var err error
	page, err = strconv.Atoi(queryParams.Get("page"))
	if err != nil || page < 1 {
		page = 1
	}
	limit, err = strconv.Atoi(queryParams.Get("limit"))
	if err != nil || limit < 1 {
		limit = h.cfg.DefaultPageLimit
	}
	return page, limit
}

func (h *SecretGuestHandler) parseFilterParams(r *http.Request) (*uuid.UUID, []int, []int) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)
	queryParams := r.URL.Query()

	var reporterID *uuid.UUID
	reporterIDFromQuery := queryParams.Get("reporter_id")
	if reporterIDFromQuery != "" {
		parsedUUID, err := uuid.Parse(reporterIDFromQuery)
		if err != nil {
			log.Warn(ctx, "Invalid reporter_id format in query param, filter ignored", zap.String("reporter_id", reporterIDFromQuery))
		} else {
			reporterID = &parsedUUID
		}
	}

	var statusIDs []int
	if statusIDStrings, ok := queryParams["status_id"]; ok {
		statusIDs = make([]int, 0, len(statusIDStrings))
		for _, idStr := range statusIDStrings {
			parsedInt, err := strconv.Atoi(idStr)
			if err != nil {
				log.Warn(ctx, "Invalid status_id value in query parameter, value ignored",
					zap.String("status_id", idStr),
					zap.Error(err),
				)
				continue
			}
			statusIDs = append(statusIDs, parsedInt)
		}
	}

	var listingTypeIDs []int
	if listingTypeIDStrings, ok := queryParams["listing_type_id"]; ok {
		listingTypeIDs = make([]int, 0, len(listingTypeIDStrings))
		for _, idStr := range listingTypeIDStrings {
			parsedInt, err := strconv.Atoi(idStr)
			if err != nil {
				log.Warn(ctx, "Invalid listing_type_id value in query parameter, value ignored",
					zap.String("listing_type_id", idStr),
					zap.Error(err),
				)
				continue
			}
			listingTypeIDs = append(listingTypeIDs, parsedInt)
		}
	}

	return reporterID, statusIDs, listingTypeIDs
}

// listings

// @Summary      Create new Listing (Admin)
// @Security     BearerAuth
// @Description  Creates new listing object. Available for admin only.
// @Tags         Listings (Admin)
// @Accept       json
// @Produce      json
// @Param        input body secret_guest.CreateListingRequestDTO true "Listing Payload"
// @Param        Authorization header string true "Bearer Access Token"
// @Success      201 {object} secret_guest.ListingResponseDTO "Created"
// @Failure      400 {object} ErrorResponse "Invalid payload"
// @Failure      401 {object} ErrorResponse "Unauthorized"
// @Failure      403 {object} ErrorResponse "Forbidden"
// @Failure      409 {object} ErrorResponse "Listing cannot be created (e.g., duplicate listing or conflict)"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /admin/listings [post]
func (h *SecretGuestHandler) CreateListing(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	var dto CreateListingRequestDTO
	if err := h.decodeJSONBody(ctx, r, &dto); err != nil {
		log.Warn(ctx, "Failed to decode create listing request", zap.Error(err))
		h.writeErrorResponse(ctx, w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := validation.StructCtx(ctx, &dto); err != nil {
		log.Warn(ctx, "Failed to validate create listing request", zap.Error(err))
		h.writeErrorResponse(ctx, w, http.StatusBadRequest, "Invalid request body")
		return
	}

	listing, err := h.service.CreateListing(ctx, dto)
	if err != nil {
		switch {
		case errors.Is(err, models.ErrListingCannotBeCreated):
			log.Info(ctx, "Listing can not be created", zap.Error(err))
			h.writeErrorResponse(ctx, w, http.StatusConflict, "Listing can not be created")
		default:
			log.Error(ctx, "Failed to create listing", zap.Error(err))
			h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		}
		return
	}

	h.writeJSONResponse(ctx, w, http.StatusCreated, listing)
}

// @Summary      Get Public Listings
// @Description  Returns a paginated list of all active listings.
// @Tags         Listings (Public)
// @Produce      json
// @Param        page query int false "Page number for pagination" default(1) min(1)
// @Param        limit query int false "Number of items per page" default(20) min(1)
// @Param        listing_type_id query []int false "Filter by one or more listing type IDs (invalid IDs are ignored)" collectionFormat(multi)
// @Success      200 {object} secret_guest.ListingsResponse
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /listings [get]
func (h *SecretGuestHandler) GetListings(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)
	queryParams := r.URL.Query()

	page, limit := h.parsePagination(r)

	var listingTypeIDs []int
	if idStrings, ok := queryParams["listing_type_id"]; ok {
		for _, idStr := range idStrings {
			parsedInt, err := strconv.Atoi(idStr)
			if err != nil {
				log.Warn(ctx, "Invalid listing_type_id value in query parameter, value ignored", zap.String("listing_type_id", idStr), zap.Error(err))
				continue
			}
			listingTypeIDs = append(listingTypeIDs, parsedInt)
		}
	}

	dto := GetListingsRequestDTO{
		Page:           page,
		Limit:          limit,
		ListingTypeIDs: listingTypeIDs,
	}

	listings, err := h.service.GetListings(ctx, dto)
	if err != nil {
		log.Error(ctx, "Failed to get listings", zap.Error(err))
		h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		return
	}

	h.writeJSONResponse(ctx, w, http.StatusOK, listings)
}

// @Summary      Get Listing By ID
// @Description  Returns detailed information about a single active listing.
// @Tags         Listings (Public)
// @Produce      json
// @Param        id path string true "Listing ID" format(uuid)
// @Success      200 {object} secret_guest.ListingResponseDTO
// @Failure      400 {object} ErrorResponse "Invalid listing ID format"
// @Failure      404 {object} ErrorResponse "Listing not found"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /listings/{id} [get]
func (h *SecretGuestHandler) GetListingByID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	listingID, ok := h.parseUUIDFromPath(w, r, "id")
	if !ok {
		return
	}

	listing, err := h.service.GetListingByID(ctx, listingID)
	if err != nil {
		if errors.Is(err, models.ErrListingNotFound) {
			log.Info(ctx, "Listing not found by ID", zap.String("listing_id", listingID.String()))
			h.writeErrorResponse(ctx, w, http.StatusNotFound, "Listing not found")
		} else {
			log.Error(ctx, "Failed to get listing by ID",
				zap.Error(err),
				zap.String("listing_id", listingID.String()),
			)
			h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		}
		return
	}

	h.writeJSONResponse(ctx, w, http.StatusOK, listing)
}

// reservations

// @Summary      Handles OTA Reservations Events (Admin)
// @Security     BearerAuth
// @Description  Handles OTA Reservations Events. Available for admin only.
// @Tags         Reservations (Admin)
// @Accept       json
// @Produce      json
// @Param        input body secret_guest.OTAReservationRequestDTO true "OTA Reservation Payload"
// @Param        Authorization header string true "Bearer Access Token"
// @Success      200 {object} string "OK"
// @Failure      400 {object} ErrorResponse "Invalid payload"
// @Failure      401 {object} ErrorResponse "Unauthorized"
// @Failure      403 {object} ErrorResponse "Forbidden"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /admin/sg_reservations [post]
func (h *SecretGuestHandler) CreateOTAReservation(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	var dto OTAReservationRequestDTO
	if err := h.decodeJSONBody(ctx, r, &dto); err != nil {
		log.Warn(ctx, "Failed to decode create OTA reservation request", zap.Error(err))
		h.writeErrorResponse(ctx, w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := validation.StructCtx(ctx, &dto); err != nil {
		log.Warn(ctx, "Failed to validate create OTA reservation request", zap.Error(err))
		h.writeErrorResponse(ctx, w, http.StatusBadRequest, "Invalid request body")
		return
	}

	err := h.service.HandleOTAReservation(ctx, dto)
	if err != nil {
		if errors.Is(err, models.ErrListingTypeNotFound) {
			log.Info(ctx, "Listing type not found", zap.String("listing_type_id", strconv.Itoa(dto.Reservation.Listing.ListingType.ID)))
			h.writeErrorResponse(ctx, w, http.StatusBadRequest, "Listing type not found")
		} else {
			log.Error(ctx, "Failed to handle OTA reservation", zap.Error(err))
			h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		}

		return
	}

	h.writeJSONResponse(ctx, w, http.StatusOK, "OK")
}

// @Summary      Get All OTA Reservations (Staff)
// @Security     BearerAuth
// @Description  Returns a paginated list of all OTA reservations. Available for staff only.
// @Tags         Reservations (Staff)
// @Produce      json
// @Param        page query int false "Page number for pagination" default(1)
// @Param        limit query int false "Number of items per page" default(50)
// @Param        status_id query []int false "Filter by one or more status IDs" collectionFormat(multi)
// @Param Authorization header string true "Bearer Access Token"
// @Success      200 {object} secret_guest.AssignmentsResponse
// @Failure      401 {object} ErrorResponse "Unauthorized"
// @Failure      403 {object} ErrorResponse "Forbidden"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /sg_reservations [get]
func (h *SecretGuestHandler) GetAllOTAReservations(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	page, limit := h.parsePagination(r)
	_, statusIDs, _ := h.parseFilterParams(r)

	dto := GetAllOTAReservationsRequestDTO{
		StatusIDs: statusIDs,
		Page:      page,
		Limit:     limit,
	}

	reservations, err := h.service.GetAllOTAReservations(ctx, dto)
	if err != nil {
		log.Error(ctx, "Failed to get all OTA reservations", zap.Error(err))
		h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		return
	}

	h.writeJSONResponse(ctx, w, http.StatusOK, reservations)
}

// @Summary      Get OTA Reservation By ID
// @Description  Returns detailed information about a single OTA reservation.
// @Tags         Reservations (Staff)
// @Produce      json
// @Param        id path string true "OTA Reservation ID" format(uuid)
// @Param Authorization header string true "Bearer Access Token"
// @Success      200 {object} secret_guest.OTAReservationResponseDTO
// @Failure      400 {object} ErrorResponse "Invalid OTA Reservation ID format"
// @Failure      401 {object} ErrorResponse "Unauthorized"
// @Failure      404 {object} ErrorResponse "OTA Reservation not found"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /sg_reservations/{id} [get]
func (h *SecretGuestHandler) GetOTAReservationByID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	reservationID, ok := h.parseUUIDFromPath(w, r, "id")
	if !ok {
		return
	}

	reservation, err := h.service.GetOTAReservationByID(ctx, reservationID)
	if err != nil {
		if errors.Is(err, models.ErrOTAReservationNotFound) {
			log.Info(ctx, "OTA reservation not found by ID", zap.String("reservation_id", reservationID.String()))
			h.writeErrorResponse(ctx, w, http.StatusNotFound, "Assignment not found")
		} else {
			log.Error(ctx, "Failed to get OTA reservation by ID", zap.Error(err))
			h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		}
		return
	}

	h.writeJSONResponse(ctx, w, http.StatusOK, reservation)
}

// @Summary      Hide an OTA Reservation (Staff)
// @Security     BearerAuth
// @Description  Changes OTA Reservation status to NoShow. Available for staff only.
// @Tags         Reservations (Staff)
// @Param        id path string true "Reservation ID" format(uuid)
// @Param Authorization header string true "Bearer Access Token"
// @Success      204 "No Content"
// @Failure      400 {object} ErrorResponse "Invalid reservation ID format"
// @Failure      401 {object} ErrorResponse "Unauthorized"
// @Failure      403 {object} ErrorResponse "Forbidden"
// @Failure      404 {object} ErrorResponse "Reservation not found"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /sg_reservations/{id}/no-show [patch]
func (h *SecretGuestHandler) UpdateOTAReservationStatusNoShow(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	reservationID, ok := h.parseUUIDFromPath(w, r, "id")
	if !ok {
		return
	}

	err := h.service.UpdateOTAReservationStatusNoShow(ctx, reservationID)
	if err != nil {
		if errors.Is(err, models.ErrOTAReservationNotFound) {
			log.Info(ctx, "OTA reservation not found by ID", zap.String("reservation_id", reservationID.String()))
			h.writeErrorResponse(ctx, w, http.StatusNotFound, "Assignment not found")
		} else {
			log.Error(ctx, "Failed to update OTA reservation status", zap.Error(err))
			h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		}
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// assignments

// func (h *SecretGuestHandler) CreateAssignment(w http.ResponseWriter, r *http.Request) {
// 	ctx := r.Context()
// 	log := logger.GetLoggerFromCtx(ctx)
//
// 	var dto CreateAssignmentRequestDTO
// 	if err := h.decodeJSONBody(ctx, r, &dto); err != nil {
// 		log.Warn(ctx, "Failed to decode create assignment request", zap.Error(err))
// 		h.writeErrorResponse(ctx, w, http.StatusBadRequest, "Invalid request body")
// 		return
// 	}
//
// 	if err := validation.StructCtx(ctx, &dto); err != nil {
// 		log.Warn(ctx, "Failed to validate create assignment request", zap.Error(err))
// 		h.writeErrorResponse(ctx, w, http.StatusBadRequest, "Invalid request body")
// 		return
// 	}
//
// 	assignment, err := h.service.CreateAssignment(ctx, dto)
// 	if err != nil {
// 		switch {
// 		case errors.Is(err, models.ErrListingCannotBeCreated):
// 			log.Info(ctx, "Assignment can not be created", zap.Error(err))
// 			h.writeErrorResponse(ctx, w, http.StatusConflict, "Assignment can not be created")
// 		default:
// 			log.Error(ctx, "Failed to create assignment", zap.Error(err))
// 			h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
// 		}
// 		return
// 	}
//
// 	h.writeJSONResponse(ctx, w, http.StatusCreated, assignment)
// }

// @Summary      Get Free Assignments
// @Security     BearerAuth
// @Description  Returns a paginated list of "free" assignments that can be taken by any user.
// @Tags         Assignments (User)
// @Produce      json
// @Param        page query int false "Page number for pagination" default(1)
// @Param        limit query int false "Number of items per page" default(20)
// @Param        listing_type_id query []int false "Filter by one or more listing type IDs" collectionFormat(multi)
// @Param Authorization header string true "Bearer Access Token"
// @Success      200 {object} secret_guest.AssignmentsResponse
// @Failure      401 {object} ErrorResponse "Unauthorized"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /assignments [get]
func (h *SecretGuestHandler) GetFreeAssignments(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	page, limit := h.parsePagination(r)
	_, _, listingTypeIDs := h.parseFilterParams(r)

	dto := GetFreeAssignmentsRequestDTO{
		Page:           page,
		Limit:          limit,
		ListingTypeIDs: listingTypeIDs,
	}

	assignments, err := h.service.GetFreeAssignments(ctx, dto)
	if err != nil {
		log.Error(ctx, "Failed to get free assignments", zap.Error(err))
		h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		return
	}

	h.writeJSONResponse(ctx, w, http.StatusOK, assignments)
}

// @Summary      Get Free Assignment By ID
// @Security     BearerAuth
// @Description  Returns details of a specific "free" assignment that can be taken.
// @Tags         Assignments (User)
// @Produce      json
// @Param        id path string true "Assignment ID" format(uuid)
// @Param Authorization header string true "Bearer Access Token"
// @Success      200 {object} secret_guest.AssignmentResponseDTO
// @Failure      400 {object} ErrorResponse "Invalid assignment ID format"
// @Failure      401 {object} ErrorResponse "Unauthorized"
// @Failure      404 {object} ErrorResponse "Assignment not found or is not available"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /assignments/{id} [get]
func (h *SecretGuestHandler) GetFreeAssignmentsByID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	assignmentID, ok := h.parseUUIDFromPath(w, r, "id")
	if !ok {
		return
	}

	assignment, err := h.service.GetFreeAssignmentsByID(ctx, assignmentID)
	if err != nil {
		if errors.Is(err, models.ErrAssignmentNotFound) {
			log.Info(ctx, "Assignment not found by ID", zap.String("assignment_id", assignmentID.String()))
			h.writeErrorResponse(ctx, w, http.StatusNotFound, "Assignment not found")
		} else {
			log.Error(ctx, "Failed to get assignment by ID as secret guest", zap.Error(err))
			h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		}
		return
	}

	h.writeJSONResponse(ctx, w, http.StatusOK, assignment)
}

// @Summary      Get My Assignments
// @Security     BearerAuth
// @Description  Returns a paginated list of assignments for the current user.
// @Tags         Assignments (User)
// @Produce      json
// @Param        page query int false "Page number for pagination" default(1)
// @Param        limit query int false "Number of items per page" default(20)
// @Param Authorization header string true "Bearer Access Token"
// @Success      200 {object} secret_guest.AssignmentsResponse
// @Failure      401 {object} ErrorResponse "Unauthorized"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /assignments/my [get]
func (h *SecretGuestHandler) GetMyAssignments(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	userID, ok := h.parseUserAndID(w, r)
	if !ok {
		return
	}

	page, limit := h.parsePagination(r)
	dto := GetMyAssignmentsRequestDTO{
		UserID: userID,
		Page:   page,
		Limit:  limit,
	}

	assignments, err := h.service.GetMyActiveAssignments(ctx, dto)
	if err != nil {
		log.Error(ctx, "Failed to get my assignments", zap.Error(err))
		h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		return
	}

	h.writeJSONResponse(ctx, w, http.StatusOK, assignments)
}

// @Summary      Get All Assignments (Staff)
// @Security     BearerAuth
// @Description  Returns a paginated list of all assignments with optional filters. Available for staff only.
// @Tags         Assignments (Staff)
// @Produce      json
// @Param        page query int false "Page number for pagination" default(1)
// @Param        limit query int false "Number of items per page" default(50)
// @Param        reporter_id query string false "Filter by reporter (user) ID" format(uuid)
// @Param        status_id query []int false "Filter by one or more status IDs" collectionFormat(multi)
// @Param Authorization header string true "Bearer Access Token"
// @Success      200 {object} secret_guest.AssignmentsResponse
// @Failure      401 {object} ErrorResponse "Unauthorized"
// @Failure      403 {object} ErrorResponse "Forbidden"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /assignments [get]
func (h *SecretGuestHandler) GetAllAssignments(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	page, limit := h.parsePagination(r)
	reporterID, statusIDs, listingTypeIDs := h.parseFilterParams(r)

	dto := GetAllAssignmentsRequestDTO{
		Page:           page,
		Limit:          limit,
		ReporterID:     reporterID,
		StatusIDs:      statusIDs,
		ListingTypeIDs: listingTypeIDs,
	}

	assignments, err := h.service.GetAllAssignments(ctx, dto)
	if err != nil {
		log.Error(ctx, "Failed to get all assignments", zap.Error(err))
		h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		return
	}

	h.writeJSONResponse(ctx, w, http.StatusOK, assignments)
}

// @Summary      Get My Assignment By ID
// @Security     BearerAuth
// @Description  Returns details of a specific assignment belonging to the current user.
// @Tags         Assignments (User)
// @Produce      json
// @Param        id path string true "Assignment ID" format(uuid)
// @Param Authorization header string true "Bearer Access Token"
// @Success      200 {object} secret_guest.AssignmentResponseDTO
// @Failure      400 {object} ErrorResponse "Invalid assignment ID format"
// @Failure      401 {object} ErrorResponse "Unauthorized"
// @Failure      404 {object} ErrorResponse "Assignment not found or does not belong to user"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /assignments/my/{id} [get]
func (h *SecretGuestHandler) GetMyAssignmentByID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	userID, ok := h.parseUserAndID(w, r)
	if !ok {
		return
	}

	assignmentID, ok := h.parseUUIDFromPath(w, r, "id")
	if !ok {
		return
	}

	assignment, err := h.service.GetMyAssignmentByID(ctx, userID, assignmentID)
	if err != nil {
		if errors.Is(err, models.ErrAssignmentNotFound) {
			log.Info(ctx, "Assignment not found by ID", zap.String("assignment_id", assignmentID.String()))
			h.writeErrorResponse(ctx, w, http.StatusNotFound, "Assignment not found")
		} else {
			log.Error(ctx, "Failed to get user assignment by ID", zap.Error(err))
			h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		}
		return
	}

	h.writeJSONResponse(ctx, w, http.StatusOK, assignment)
}

// @Summary      Get Assignment By ID (Staff)
// @Security     BearerAuth
// @Description  Returns details of any assignment. Available for staff only.
// @Tags         Assignments (Staff)
// @Produce      json
// @Param        id path string true "Assignment ID" format(uuid)
// @Param Authorization header string true "Bearer Access Token"
// @Success      200 {object} secret_guest.AssignmentResponseDTO
// @Failure      400 {object} ErrorResponse "Invalid assignment ID format"
// @Failure      401 {object} ErrorResponse "Unauthorized"
// @Failure      403 {object} ErrorResponse "Forbidden"
// @Failure      404 {object} ErrorResponse "Assignment not found"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /assignments/{id} [get]
func (h *SecretGuestHandler) GetAssignmentByID_AsStaff(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	assignmentID, ok := h.parseUUIDFromPath(w, r, "id")
	if !ok {
		return
	}

	assignment, err := h.service.GetAssignmentByID_AsStaff(ctx, assignmentID)
	if err != nil {
		if errors.Is(err, models.ErrAssignmentNotFound) {
			log.Info(ctx, "Assignment not found by ID", zap.String("assignment_id", assignmentID.String()))
			h.writeErrorResponse(ctx, w, http.StatusNotFound, "Assignment not found")
		} else {
			log.Error(ctx, "Failed to get assignment by ID as staff", zap.Error(err))
			h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		}
		return
	}

	h.writeJSONResponse(ctx, w, http.StatusOK, assignment)
}

// @Summary      Accept My Assignment
// @Security     BearerAuth
// @Description  Accept an assignment offer. This will start an asynchronous process to generate a report.
// @Tags         Assignments (User)
// @Param        id path string true "Assignment ID" format(uuid)
// @Param Authorization header string true "Bearer Access Token"
// @Success      202 "Accepted"
// @Failure      400 {object} ErrorResponse "Invalid assignment ID format"
// @Failure      401 {object} ErrorResponse "Unauthorized"
// @Failure      404 {object} ErrorResponse "Assignment not found or does not belong to user"
// @Failure      409 {object} ErrorResponse "Assignment cannot be accepted (e.g., wrong status)"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /assignments/my/{id}/accept [patch]
func (h *SecretGuestHandler) AcceptMyAssignment(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	userID, ok := h.parseUserAndID(w, r)
	if !ok {
		return
	}

	assignmentID, ok := h.parseUUIDFromPath(w, r, "id")
	if !ok {
		return
	}

	err := h.service.AcceptMyAssignment(ctx, userID, assignmentID)
	if err != nil {
		if err.Error() == fmt.Sprintf("accept is allowed only within %d hours before check-in", h.cfg.AssignmentDeadlineHours) {
			h.writeErrorResponse(ctx, w, http.StatusConflict, err.Error())
			return
		}
		switch {
		case errors.Is(err, models.ErrAssignmentNotFound), errors.Is(err, models.ErrForbidden):
			log.Info(ctx, "Assignment not found by ID", zap.String("report_id", assignmentID.String()))
			h.writeErrorResponse(ctx, w, http.StatusNotFound, "Assignment not found or access denied")
		case errors.Is(err, models.ErrAssignmentCannotBeAccepted):
			log.Info(ctx, "Assignment can not be accepted", zap.Error(err))
			h.writeErrorResponse(ctx, w, http.StatusConflict, "Assignment can not be accepted")
		default:
			log.Error(ctx, "Failed to accept assignment", zap.Error(err))
			h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		}
		return
	}

	// Не возвращаем пользователю никакого идентификатора, т.к.: генерация схемы может потребовать много времени, или может произойти ошибка(не показываем это).
	// Пользователь потом (в каком-то смысле асинхронно) получит информацию о наличии отчета(который ему нужно будет заполнить).

	w.WriteHeader(http.StatusAccepted)
}

// @Summary      Decline My Assignment
// @Security     BearerAuth
// @Description  Decline an assignment offer.
// @Tags         Assignments (User)
// @Param        id path string true "Assignment ID" format(uuid)
// @Param Authorization header string true "Bearer Access Token"
// @Success      204 "No Content"
// @Failure      400 {object} ErrorResponse "Invalid assignment ID format"
// @Failure      401 {object} ErrorResponse "Unauthorized"
// @Failure      404 {object} ErrorResponse "Assignment not found or does not belong to user"
// @Failure      409 {object} ErrorResponse "Assignment cannot be declined (e.g., wrong status)"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /assignments/my/{id}/decline [patch]
func (h *SecretGuestHandler) DeclineMyAssignment(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	userID, ok := h.parseUserAndID(w, r)
	if !ok {
		return
	}

	assignmentID, ok := h.parseUUIDFromPath(w, r, "id")
	if !ok {
		return
	}

	err := h.service.DeclineMyAssignment(ctx, userID, assignmentID)
	if err != nil {
		switch {
		case errors.Is(err, models.ErrAssignmentNotFound), errors.Is(err, models.ErrForbidden):
			log.Info(ctx, "Assignment not found by ID", zap.String("assignment_id", assignmentID.String()))
			h.writeErrorResponse(ctx, w, http.StatusNotFound, "Assignment not found or access denied")
		case errors.Is(err, models.ErrAssignmentCannotBeDeclined):
			log.Info(ctx, "Assignment can not be declined", zap.Error(err))
			h.writeErrorResponse(ctx, w, http.StatusConflict, "Assignment can not be declined")
		default:
			log.Error(ctx, "Failed to decline assignment", zap.Error(err))
			h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		}

		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// @Summary      Take a Free Assignment
// @Security     BearerAuth
// @Description  Allows a user to take a free assignment, assigning it to themselves. The assignment status becomes 'offered' to this specific user.
// @Tags         Assignments (User)
// @Param        id path string true "Assignment ID" format(uuid)
// @Param Authorization header string true "Bearer Access Token"
// @Success      204 "No Content"
// @Failure      400 {object} ErrorResponse "Invalid assignment ID format"
// @Failure      401 {object} ErrorResponse "Unauthorized"
// @Failure      404 {object} ErrorResponse "Assignment not found or not available"
// @Failure      409 {object} ErrorResponse "Assignment cannot be taken (e.g., already taken, or user has other active offers)"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /assignments/{id}/take [patch]
func (h *SecretGuestHandler) TakeFreeAssignmentsByID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	userID, ok := h.parseUserAndID(w, r)
	if !ok {
		return
	}

	assignmentID, ok := h.parseUUIDFromPath(w, r, "id")
	if !ok {
		return
	}

	err := h.service.TakeFreeAssignmentsByID(ctx, userID, assignmentID)
	if err != nil {
		switch {
		case errors.Is(err, models.ErrAssignmentNotFound), errors.Is(err, models.ErrForbidden):
			log.Info(ctx, "Assignment not found by ID", zap.String("assignment_id", assignmentID.String()))
			h.writeErrorResponse(ctx, w, http.StatusNotFound, "Assignment not found or access denied")
		case errors.Is(err, models.ErrAssignmentCannotBeDeclined):
			log.Info(ctx, "Assignment can not be taked", zap.Error(err))
			h.writeErrorResponse(ctx, w, http.StatusConflict, "Assignment can not be taked")

		case strings.Contains(err.Error(), "already has"):
			log.Info(ctx, "User already has active assignments", zap.Error(err))
			h.writeErrorResponse(ctx, w, http.StatusConflict, "User already has active assignments")

		default:
			log.Info(ctx, "Failed to take assignment", zap.Error(err))
			h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		}

		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// @Summary      Cancel Assignment
// @Security     BearerAuth
// @Description  Cancel an assignment offer.
// @Tags         Assignments (Staff)
// @Param        id path string true "Assignment ID" format(uuid)
// @Param Authorization header string true "Bearer Access Token"
// @Success      204 "No Content"
// @Failure      400 {object} ErrorResponse "Invalid assignment ID format"
// @Failure      401 {object} ErrorResponse "Unauthorized"
// @Failure      404 {object} ErrorResponse "Assignment not found or does not belong to user"
// @Failure      409 {object} ErrorResponse "Assignment cannot be cancelled"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /staff/assignments/{id}/cancel [patch]
func (h *SecretGuestHandler) CancelAssignment(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	assignmentID, ok := h.parseUUIDFromPath(w, r, "id")
	if !ok {
		return
	}

	err := h.service.CancelAssignment(ctx, assignmentID)
	if err != nil {
		switch {
		case errors.Is(err, models.ErrAssignmentNotFound), errors.Is(err, models.ErrForbidden):
			log.Info(ctx, "Assignment not found by ID", zap.String("assignment_id", assignmentID.String()))
			h.writeErrorResponse(ctx, w, http.StatusNotFound, "Assignment not found or access denied")
		default:
			log.Error(ctx, "Failed to cancel assignment", zap.Error(err))
			h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		}

		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// reports

// @Summary      Get My Reports
// @Security     BearerAuth
// @Description  Returns a paginated list of reports for the current user that are in progress.
// @Tags         Reports (User)
// @Produce      json
// @Param        page query int false "Page number for pagination" default(1)
// @Param        limit query int false "Number of items per page" default(20)
// @Param Authorization header string true "Bearer Access Token"
// @Success      200 {object} secret_guest.ReportsResponse
// @Failure      401 {object} ErrorResponse "Unauthorized"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /reports/my [get]
func (h *SecretGuestHandler) GetMyReports(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	userID, ok := h.parseUserAndID(w, r)
	if !ok {
		return
	}

	page, limit := h.parsePagination(r)
	dto := GetMyReportsRequestDTO{
		UserID: userID,
		Page:   page,
		Limit:  limit,
	}

	reports, err := h.service.GetMyReports(ctx, dto)
	if err != nil {
		log.Error(ctx, "Failed to get my reports", zap.Error(err))
		h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		return
	}

	h.writeJSONResponse(ctx, w, http.StatusOK, reports)
}

// @Summary      Get My Report By ID
// @Security     BearerAuth
// @Description  Returns a specific report with its schema and answers for the current user to fill out.
// @Tags         Reports (User)
// @Produce      json
// @Param        id path string true "Report ID" format(uuid)
// @Param Authorization header string true "Bearer Access Token"
// @Success      200 {object} secret_guest.ReportResponseDTO
// @Failure      400 {object} ErrorResponse "Invalid report ID format"
// @Failure      401 {object} ErrorResponse "Unauthorized"
// @Failure      404 {object} ErrorResponse "Report not found or does not belong to user"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /reports/my/{id} [get]
func (h *SecretGuestHandler) GetMyReportByID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	userID, ok := h.parseUserAndID(w, r)
	if !ok {
		return
	}

	reportID, ok := h.parseUUIDFromPath(w, r, "id")
	if !ok {
		return
	}

	report, err := h.service.GetMyReportByID(ctx, userID, reportID)
	if err != nil {
		if errors.Is(err, models.ErrReportNotFound) {
			log.Info(ctx, "Report not found by ID", zap.String("report_id", reportID.String()))
			h.writeErrorResponse(ctx, w, http.StatusNotFound, "Report not found")
		} else {
			log.Error(ctx, "Failed to get user report by ID", zap.Error(err))
			h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		}
		return
	}

	h.writeJSONResponse(ctx, w, http.StatusOK, report)
}

// @Summary      Update My Report (Save Draft)
// @Security     BearerAuth
// @Description  Saves the current state of a report draft.
// @Tags         Reports (User)
// @Accept       json
// @Param        id path string true "Report ID" format(uuid)
// @Param        input body secret_guest.UpdateReportRequestDTO true "Updated checklist schema with answers"
// @Param Authorization header string true "Bearer Access Token"
// @Success      204 "No Content"
// @Failure      400 {object} ErrorResponse "Invalid request body or report ID"
// @Failure      401 {object} ErrorResponse "Unauthorized"
// @Failure      404 {object} ErrorResponse "Report not found or does not belong to user"
// @Failure      409 {object} ErrorResponse "Report is not in a draft state and cannot be edited"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /reports/my/{id} [post]
func (h *SecretGuestHandler) UpdateMyReport(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	userID, ok := h.parseUserAndID(w, r)
	if !ok {
		return
	}

	reportID, ok := h.parseUUIDFromPath(w, r, "id")
	if !ok {
		return
	}

	var dto UpdateReportRequestDTO

	if err := h.decodeJSONBody(ctx, r, &dto); err != nil {
		log.Warn(ctx, "Failed to decode update my report", zap.Error(err))
		h.writeErrorResponse(ctx, w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := dto.Validate(); err != nil {
		log.Warn(ctx, "Failed to validate checklist schema", zap.Error(err))
		h.writeErrorResponse(ctx, w, http.StatusBadRequest, "Failed to validate checklist schema")
		return
	}

	err := h.service.UpdateMyReport(ctx, userID, reportID, dto)
	if err != nil {
		if errors.Is(err, models.ErrReportNotFound) || errors.Is(err, models.ErrForbidden) {
			log.Info(ctx, "Report not found by ID", zap.String("report_id", reportID.String()))
			h.writeErrorResponse(ctx, w, http.StatusNotFound, "Report not found or access denied")
		} else if errors.Is(err, models.ErrReportNotEditable) {
			log.Info(ctx, "Report is not in a draft state and cannot be edited", zap.String("report_id", reportID.String()))
			h.writeErrorResponse(ctx, w, http.StatusConflict, "Report is not in a draft state and cannot be edited")
		} else {
			log.Error(ctx, "Failed to update my report", zap.Error(err))
			h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		}
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// @Summary      Submit My Report
// @Security     BearerAuth
// @Description  Submits a completed report for review. The report can no longer be edited after this.
// @Tags         Reports (User)
// @Param        id path string true "Report ID" format(uuid)
// @Param Authorization header string true "Bearer Access Token"
// @Success      204 "No Content"
// @Failure      400 {object} ErrorResponse "Invalid report ID or report is not complete"
// @Failure      401 {object} ErrorResponse "Unauthorized"
// @Failure      404 {object} ErrorResponse "Report not found or does not belong to user"
// @Failure      409 {object} ErrorResponse "Report is not in a draft state"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /reports/my/{id}/submit [patch]
func (h *SecretGuestHandler) SubmitMyReport(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	userID, ok := h.parseUserAndID(w, r)
	if !ok {
		return
	}

	reportID, ok := h.parseUUIDFromPath(w, r, "id")
	if !ok {
		return
	}

	err := h.service.SubmitMyReport(ctx, userID, reportID)
	if err != nil {
		if errors.Is(err, models.ErrReportNotFound) || errors.Is(err, models.ErrForbidden) {
			log.Info(ctx, "Report not found by ID", zap.String("report_id", reportID.String()))
			h.writeErrorResponse(ctx, w, http.StatusNotFound, "Report not found or access denied")
		} else if errors.Is(err, models.ErrReportNotEditable) {
			log.Info(ctx, "Report is not in a draft state and cannot be submitted", zap.String("report_id", reportID.String()))
			h.writeErrorResponse(ctx, w, http.StatusConflict, "Report is not in a draft state and cannot be submitted")
		} else {
			log.Error(ctx, "Failed to submit my report", zap.Error(err))
			h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		}
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// @Summary      Refuse My Report
// @Security     BearerAuth
// @Description  Refuses a report, setting its status to 'refused'. The report can no longer be edited after this.
// @Tags         Reports (User)
// @Param        id path string true "Report ID" format(uuid)
// @Param Authorization header string true "Bearer Access Token"
// @Success      204 "No Content"
// @Failure      400 {object} ErrorResponse "Invalid report ID"
// @Failure      401 {object} ErrorResponse "Unauthorized"
// @Failure      404 {object} ErrorResponse "Report not found or does not belong to user"
// @Failure      409 {object} ErrorResponse "Report is not in a draft state"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /reports/my/{id}/refuse [patch]
func (h *SecretGuestHandler) RefuseMyReport(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	userID, ok := h.parseUserAndID(w, r)
	if !ok {
		return
	}

	reportID, ok := h.parseUUIDFromPath(w, r, "id")
	if !ok {
		return
	}

	err := h.service.RefuseMyReport(ctx, userID, reportID)
	if err != nil {
		switch {
		case errors.Is(err, models.ErrReportNotFound), errors.Is(err, models.ErrForbidden):
			log.Info(ctx, "Report not found or access denied on refuse", zap.String("report_id", reportID.String()))
			h.writeErrorResponse(ctx, w, http.StatusNotFound, "Report not found or access denied")
		case errors.Is(err, models.ErrReportNotEditable):
			log.Info(ctx, "Report is not in a draft state and cannot be refused", zap.String("report_id", reportID.String()))
			h.writeErrorResponse(ctx, w, http.StatusConflict, "Report is not in a draft state and cannot be refused")
		default:
			log.Error(ctx, "Failed to refuse my report", zap.Error(err))
			h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		}
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// @Summary      Get All Reports (Staff)
// @Security     BearerAuth
// @Description  Returns a paginated list of all reports. Available for staff only.
// @Tags         Reports (Staff)
// @Produce      json
// @Param        page query int false "Page number for pagination" default(1)
// @Param        limit query int false "Number of items per page" default(50)
// @Param        reporter_id query string false "Filter by reporter (user) ID" format(uuid)
// @Param        status_id query []int false "Filter by one or more status IDs" collectionFormat(multi)
// @Param Authorization header string true "Bearer Access Token"
// @Success      200 {object} secret_guest.ReportsResponse
// @Failure      401 {object} ErrorResponse "Unauthorized"
// @Failure      403 {object} ErrorResponse "Forbidden"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /reports [get]
func (h *SecretGuestHandler) GetAllReports(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	page, limit := h.parsePagination(r)
	reporterID, statusIDs, listingTypeIDs := h.parseFilterParams(r)

	dto := GetAllReportsRequestDTO{
		Page:           page,
		Limit:          limit,
		ReporterID:     reporterID,
		StatusIDs:      statusIDs,
		ListingTypeIDs: listingTypeIDs,
	}

	reports, err := h.service.GetAllReports(ctx, dto)
	if err != nil {
		log.Error(ctx, "Failed to get all reports", zap.Error(err))
		h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		return
	}

	h.writeJSONResponse(ctx, w, http.StatusOK, reports)
}

// @Summary      Get Report By ID (Staff)
// @Security     BearerAuth
// @Description  Returns details of any report. Available for staff only.
// @Tags         Reports (Staff)
// @Produce      json
// @Param        id path string true "Report ID" format(uuid)
// @Param Authorization header string true "Bearer Access Token"
// @Success      200 {object} secret_guest.ReportResponseDTO
// @Failure      400 {object} ErrorResponse "Invalid report ID format"
// @Failure      401 {object} ErrorResponse "Unauthorized"
// @Failure      403 {object} ErrorResponse "Forbidden"
// @Failure      404 {object} ErrorResponse "Report not found"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /reports/{id} [get]
func (h *SecretGuestHandler) GetReportByID_AsStaff(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	reportID, ok := h.parseUUIDFromPath(w, r, "id")
	if !ok {
		return
	}

	report, err := h.service.GetReportByID_AsStaff(ctx, reportID)
	if err != nil {
		if errors.Is(err, models.ErrReportNotFound) {
			log.Info(ctx, "Report not found by ID", zap.String("report_id", reportID.String()))
			h.writeErrorResponse(ctx, w, http.StatusNotFound, "Report not found")
		} else {
			log.Error(ctx, "Failed to get report by ID as staff", zap.Error(err))
			h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		}
		return
	}

	h.writeJSONResponse(ctx, w, http.StatusOK, report)
}

// @Summary      Approve a Report (Staff)
// @Security     BearerAuth
// @Description  Approves a submitted secret guest report. Available for staff only.
// @Tags         Reports (Staff)
// @Param        id path string true "Report ID" format(uuid)
// @Param Authorization header string true "Bearer Access Token"
// @Success      204 "No Content"
// @Failure      400 {object} ErrorResponse "Invalid report ID format"
// @Failure      401 {object} ErrorResponse "Unauthorized"
// @Failure      403 {object} ErrorResponse "Forbidden"
// @Failure      404 {object} ErrorResponse "Report not found"
// @Failure      409 {object} ErrorResponse "Report cannot be approved (e.g., wrong status)"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /staff/reports/{id}/approve [patch]
func (h *SecretGuestHandler) ApproveReport(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	staffID, ok := h.parseUserAndID(w, r)
	if !ok {
		return
	}

	reportID, ok := h.parseUUIDFromPath(w, r, "id")
	if !ok {
		return
	}

	err := h.service.ApproveReport(ctx, staffID, reportID)
	if err != nil {
		switch {
		case errors.Is(err, models.ErrReportNotFound):
			log.Info(ctx, "Report not found by ID", zap.String("report_id", reportID.String()))
			h.writeErrorResponse(ctx, w, http.StatusNotFound, "Report not found")
		case errors.Is(err, models.ErrReportCannotBeApproved):
			log.Info(ctx, "Report can not be approved", zap.Error(err))
			h.writeErrorResponse(ctx, w, http.StatusConflict, "Report can not be approved")
		default:
			log.Error(ctx, "Failed to approve report", zap.Error(err), zap.String("report_id", reportID.String()))
			h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		}
		return
	}

	w.WriteHeader(http.StatusNoContent)

}

// @Summary      Reject a Report (Staff)
// @Security     BearerAuth
// @Description  Rejects a submitted secret guest report. Available for staff only. This action does not require a request body.
// @Tags         Reports (Staff)
// @Param        id path string true "Report ID" format(uuid)
// @Param Authorization header string true "Bearer Access Token"
// @Success      204 "No Content"
// @Failure      400 {object} ErrorResponse "Invalid report ID format"
// @Failure      401 {object} ErrorResponse "Unauthorized"
// @Failure      403 {object} ErrorResponse "Forbidden"
// @Failure      404 {object} ErrorResponse "Report not found"
// @Failure      409 {object} ErrorResponse "Report cannot be rejected (e.g., wrong status)"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /staff/reports/{id}/reject [patch]
func (h *SecretGuestHandler) RejectReport(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	staffID, ok := h.parseUserAndID(w, r)
	if !ok {
		return
	}

	reportID, ok := h.parseUUIDFromPath(w, r, "id")
	if !ok {
		return
	}

	// TO DO: нужно ли проверять указание причины отклонения?
	//
	// var dto RejectReportRequestDTO
	//
	// if err := h.decodeJSONBody(ctx, r, &dto); err != nil {
	// 	log.Warn(ctx, "Failed to decode rejected report", zap.Error(err))
	// 	http.Error(w, "Invalid request body", http.StatusBadRequest)
	// 	return
	// }
	//
	// if err := dto.Validate(); err != nil {
	// 	http.Error(w, err.Error(), http.StatusBadRequest)
	// 	return
	// }
	// if err := h.service.RejectReport(ctx, staffID, reportID, dto); err != nil {
	// 	// ...
	// }

	err := h.service.RejectReport(ctx, staffID, reportID)
	if err != nil {
		switch {
		case errors.Is(err, models.ErrReportNotFound):
			log.Info(ctx, "Report not found by ID", zap.String("report_id", reportID.String()))
			h.writeErrorResponse(ctx, w, http.StatusNotFound, "Report not found")
		case errors.Is(err, models.ErrReportCannotBeRejected):
			log.Info(ctx, "Report can not be rejected", zap.Error(err))
			h.writeErrorResponse(ctx, w, http.StatusConflict, "Report can not be rejected")
		default:
			log.Error(ctx, "Failed to reject report", zap.Error(err))
			h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		}
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// answer_types

// @Summary      Get Answer Types (Staff)
// @Security     BearerAuth
// @Description  Returns a list of all Answer Types with optional filtering.
// @Tags         Answer Types (Staff)
// @Produce      json
// @Param        id query []int false "Filter by one or more Answer Type IDs" collectionFormat(multi)
// @Param        slug query []string false "Filter by one or more Answer Type slugs" collectionFormat(multi)
// @Param        Authorization header string true "Bearer Access Token"
// @Success      200 {object} secret_guest.AnswerTypesResponse
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /answer_types [get]
func (h *SecretGuestHandler) GetAnswerTypes(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	queryParams := r.URL.Query()
	var answerTypeIDs []int
	if answerTypeIDStrings, ok := queryParams["id"]; ok {
		answerTypeIDs = make([]int, 0, len(answerTypeIDStrings))
		for _, idStr := range answerTypeIDStrings {
			parsedInt, err := strconv.Atoi(idStr)
			if err != nil {
				log.Warn(ctx, "Invalid answer_type id value in query parameter, value ignored",
					zap.String("id", idStr),
					zap.Error(err),
				)
				continue
			}
			answerTypeIDs = append(answerTypeIDs, parsedInt)
		}
	}

	var answerTypeSlugs []string
	if slugStrings, ok := queryParams["slug"]; ok {
		answerTypeSlugs = append(answerTypeSlugs, slugStrings...)
	}

	dto := GetAnswerTypesRequestDTO{
		AnswerTypeIDs:   answerTypeIDs,
		AnswerTypeSlugs: answerTypeSlugs,
	}

	answerTypes, err := h.service.GetAnswerTypes(ctx, dto)
	if err != nil {
		log.Error(ctx, "Failed to get answer types", zap.Error(err))
		h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		return
	}

	h.writeJSONResponse(ctx, w, http.StatusOK, answerTypes)
}

// @Summary      Get Answer Type By ID (Staff)
// @Security     BearerAuth
// @Description  Returns a single Answer Type by its ID.
// @Tags         Answer Types (Staff)
// @Produce      json
// @Param        id path int true "Answer Type ID"
// @Param        Authorization header string true "Bearer Access Token"
// @Success      200 {object} secret_guest.AnswerTypeResponse
// @Failure      400 {object} ErrorResponse "Invalid ID format"
// @Failure      404 {object} ErrorResponse "Answer Type not found"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /answer_types/{id} [get]
func (h *SecretGuestHandler) GetAnswerTypeByID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	id, ok := h.parseIntFromPath(w, r, "id")
	if !ok {
		return
	}

	at, err := h.service.GetAnswerTypeByID(ctx, id)
	if err != nil {
		if errors.Is(err, models.ErrNotFound) {
			h.writeErrorResponse(ctx, w, http.StatusNotFound, "Answer type not found")
		} else {
			log.Error(ctx, "Failed to get answer type by ID", zap.Error(err), zap.Int("id", id))
			h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		}
		return
	}

	h.writeJSONResponse(ctx, w, http.StatusOK, at)
}

// @Summary      Create Answer Type (Staff)
// @Security     BearerAuth
// @Description  Creates a new Answer Type.
// @Tags         Answer Types (Staff)
// @Accept       json
// @Produce      json
// @Param        input body secret_guest.CreateAnswerTypeRequestDTO true "Answer Type Payload"
// @Param        Authorization header string true "Bearer Access Token"
// @Success      201 {object} secret_guest.AnswerTypeResponse "Created"
// @Failure      400 {object} ErrorResponse "Invalid payload"
// @Failure      409 {object} ErrorResponse "Duplicate slug"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /answer_types [post]
func (h *SecretGuestHandler) CreateAnswerType(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	var dto CreateAnswerTypeRequestDTO
	if err := h.decodeJSONBody(ctx, r, &dto); err != nil {
		h.writeErrorResponse(ctx, w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := validation.StructCtx(ctx, &dto); err != nil {
		log.Warn(ctx, "Validation failed for create answer type", zap.Error(err))
		h.writeErrorResponse(ctx, w, http.StatusBadRequest, "Invalid request body: "+err.Error())
		return
	}

	at, err := h.service.CreateAnswerType(ctx, dto)
	if err != nil {
		if errors.Is(err, models.ErrDuplicate) {
			h.writeErrorResponse(ctx, w, http.StatusConflict, "Answer type with this slug already exists")
		} else {
			log.Error(ctx, "Failed to create answer type", zap.Error(err))
			h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		}
		return
	}

	h.writeJSONResponse(ctx, w, http.StatusCreated, at)
}

// @Summary      Update Answer Type (Staff)
// @Security     BearerAuth
// @Description  Updates an existing Answer Type.
// @Tags         Answer Types (Staff)
// @Accept       json
// @Produce      json
// @Param        id path int true "Answer Type ID"
// @Param        input body secret_guest.UpdateAnswerTypeRequestDTO true "Answer Type Payload"
// @Param        Authorization header string true "Bearer Access Token"
// @Success      200 {object} secret_guest.AnswerTypeResponse "Updated"
// @Failure      400 {object} ErrorResponse "Invalid payload or ID"
// @Failure      404 {object} ErrorResponse "Answer Type not found"
// @Failure      409 {object} ErrorResponse "Duplicate slug"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /answer_types/{id} [patch]
func (h *SecretGuestHandler) UpdateAnswerType(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	id, ok := h.parseIntFromPath(w, r, "id")
	if !ok {
		return
	}

	var dto UpdateAnswerTypeRequestDTO

	// TO DO: Подумать о необходимости для поля "meta" иметь тип JSONB. Возникает трудность, что стандартный парсинг не отличает
	// ситуацию отсутствия в теле ключа "meta" и ситуации когда "meta":nill - что важно для PATCH-запросов.
	// Поэтому костылим кастомный парсинг и заполнение UpdateAnswerTypeRequestDTO

	// Кастомный парсинг
	var rawUpdates map[string]json.RawMessage
	if err := h.decodeJSONBody(ctx, r, &rawUpdates); err != nil {
		h.writeErrorResponse(ctx, w, http.StatusBadRequest, "Invalid request body: could not decode JSON")
		return
	}

	if val, ok := rawUpdates["slug"]; ok {
		if err := json.Unmarshal(val, &dto.Slug); err != nil {
			h.writeErrorResponse(ctx, w, http.StatusBadRequest, "Invalid format for 'slug' field")
			return
		}
	}

	if val, ok := rawUpdates["name"]; ok {
		if err := json.Unmarshal(val, &dto.Name); err != nil {
			h.writeErrorResponse(ctx, w, http.StatusBadRequest, "Invalid format for 'name' field")
			return
		}
	}

	if val, ok := rawUpdates["meta"]; ok {
		dto.Meta = &val
	}

	///

	at, err := h.service.UpdateAnswerType(ctx, id, dto)
	if err != nil {
		log.Error(ctx, "Failed to update answer type", zap.Error(err))
		h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		return
	}

	h.writeJSONResponse(ctx, w, http.StatusOK, at)
}

// @Summary      Delete Answer Type (Staff)
// @Security     BearerAuth
// @Description  Deletes an existing Answer Type. Deletion will fail if the type is used in any checklist items.
// @Tags         Answer Types (Staff)
// @Param        id path int true "Answer Type ID"
// @Param        Authorization header string true "Bearer Access Token"
// @Success      204 "No Content"
// @Failure      400 {object} ErrorResponse "Invalid ID"
// @Failure      404 {object} ErrorResponse "Answer Type not found"
// @Failure      409 {object} ErrorResponse "Answer Type is in use and cannot be deleted"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /answer_types/{id} [delete]
func (h *SecretGuestHandler) DeleteAnswerType(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	id, ok := h.parseIntFromPath(w, r, "id")
	if !ok {
		return
	}

	err := h.service.DeleteAnswerType(ctx, id)
	if err != nil {
		switch {
		case errors.Is(err, models.ErrNotFound):
			h.writeErrorResponse(ctx, w, http.StatusNotFound, "Answer type not found")
		case errors.Is(err, models.ErrInUse):
			h.writeErrorResponse(ctx, w, http.StatusConflict, "Answer type is in use and cannot be deleted")
		default:
			log.Error(ctx, "Failed to delete answer type", zap.Error(err), zap.Int("id", id))
			h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		}
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// media_requirements

// @Summary      Get Media Requirements (Staff)
// @Security     BearerAuth
// @Description  Returns a paginated list of all Media Requirements.
// @Tags         Media Requirements (Staff)
// @Produce      json
// @Param        id query []int false "Filter by one or more Media Requirements IDs" collectionFormat(multi)
// @Param        slug query []string false "Filter by one or more Media Requirements slugs" collectionFormat(multi)
// @Param Authorization header string true "Bearer Access Token"
// @Success      200 {object} secret_guest.MediaRequirementsResponse
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /media_requirements [get]
func (h *SecretGuestHandler) GetMediaRequirements(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	queryParams := r.URL.Query()
	var mediaReqIDs []int
	if mediaReqIDStrings, ok := queryParams["id"]; ok {
		mediaReqIDs = make([]int, 0, len(mediaReqIDStrings))
		for _, idStr := range mediaReqIDStrings {
			parsedInt, err := strconv.Atoi(idStr)
			if err != nil {
				log.Warn(ctx, "Invalid media_requirement id value in query parameter, value ignored",
					zap.String("id", idStr),
					zap.Error(err),
				)
				continue
			}
			mediaReqIDs = append(mediaReqIDs, parsedInt)
		}
	}

	var mediaReqSlugs []string
	if slugStrings, ok := queryParams["slug"]; ok {
		mediaReqSlugs = append(mediaReqSlugs, slugStrings...)
	}

	dto := GetMediaRequirementsRequestDTO{
		MediaRequirementIDs:   mediaReqIDs,
		MediaRequirementSlugs: mediaReqSlugs,
	}

	mediaRequirements, err := h.service.GetMediaRequirements(ctx, dto)
	if err != nil {
		log.Error(ctx, "Failed to get media requirements", zap.Error(err))
		h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		return
	}

	h.writeJSONResponse(ctx, w, http.StatusOK, mediaRequirements)
}

// listing_types

// @Summary      Get Listing Types (Staff)
// @Security     BearerAuth
// @Description  Returns a list of all Listing Types.
// @Tags         Listing Types (Staff)
// @Produce      json
// @Param        id query []int false "Filter by one or more Listing Type IDs" collectionFormat(multi)
// @Param        slug query []string false "Filter by one or more Listing Type slugs" collectionFormat(multi)
// @Param Authorization header string true "Bearer Access Token"
// @Success      200 {object} secret_guest.ListingTypesResponse
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /listing_types [get]
func (h *SecretGuestHandler) GetListingTypes(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	queryParams := r.URL.Query()
	var listingTypeIDs []int
	if listingTypeIDStrings, ok := queryParams["id"]; ok {
		listingTypeIDs = make([]int, 0, len(listingTypeIDStrings))
		for _, idStr := range listingTypeIDStrings {
			parsedInt, err := strconv.Atoi(idStr)
			if err != nil {
				log.Warn(ctx, "Invalid listing_type id value in query parameter, value ignored",
					zap.String("id", idStr),
					zap.Error(err),
				)
				continue
			}
			listingTypeIDs = append(listingTypeIDs, parsedInt)
		}
	}

	var listingTypeSlugs []string
	if slugStrings, ok := queryParams["slug"]; ok {
		listingTypeSlugs = append(listingTypeSlugs, slugStrings...)
	}

	dto := GetListingTypesRequestDTO{
		ListingTypeIDs:   listingTypeIDs,
		ListingTypeSlugs: listingTypeSlugs,
	}

	listingTypes, err := h.service.GetListingTypes(ctx, dto)
	if err != nil {
		log.Error(ctx, "Failed to get listing types", zap.Error(err))
		h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		return
	}

	h.writeJSONResponse(ctx, w, http.StatusOK, listingTypes)
}

// @Summary      Get Listing Type By ID (Staff)
// @Security     BearerAuth
// @Description  Returns a single Listing Type by its ID.
// @Tags         Listing Types (Staff)
// @Produce      json
// @Param        id path int true "Listing Type ID"
// @Param        Authorization header string true "Bearer Access Token"
// @Success      200 {object} secret_guest.ListingTypeResponse
// @Failure      400 {object} ErrorResponse "Invalid ID format"
// @Failure      404 {object} ErrorResponse "Listing Type not found"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /listing_types/{id} [get]
func (h *SecretGuestHandler) GetListingTypeByID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	id, ok := h.parseIntFromPath(w, r, "id")
	if !ok {
		return
	}

	lt, err := h.service.GetListingTypeByID(ctx, id)
	if err != nil {
		if errors.Is(err, models.ErrNotFound) {
			h.writeErrorResponse(ctx, w, http.StatusNotFound, "Listing type not found")
		} else {
			log.Error(ctx, "Failed to get listing type by ID", zap.Error(err), zap.Int("id", id))
			h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		}
		return
	}

	h.writeJSONResponse(ctx, w, http.StatusOK, lt)
}

// @Summary      Create Listing Type (Staff)
// @Security     BearerAuth
// @Description  Creates a new Listing Type.
// @Tags         Listing Types (Staff)
// @Accept       json
// @Produce      json
// @Param        input body secret_guest.CreateListingTypeRequestDTO true "Listing Type Payload"
// @Param        Authorization header string true "Bearer Access Token"
// @Success      201 {object} secret_guest.ListingTypeResponse "Created"
// @Failure      400 {object} ErrorResponse "Invalid payload"
// @Failure      409 {object} ErrorResponse "Duplicate slug"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /listing_types [post]
func (h *SecretGuestHandler) CreateListingType(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	var dto CreateListingTypeRequestDTO
	if err := h.decodeJSONBody(ctx, r, &dto); err != nil {
		h.writeErrorResponse(ctx, w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := validation.StructCtx(ctx, &dto); err != nil {
		log.Warn(ctx, "Validation failed for create listing type", zap.Error(err))
		h.writeErrorResponse(ctx, w, http.StatusBadRequest, "Invalid request body: "+err.Error())
		return
	}

	lt, err := h.service.CreateListingType(ctx, dto)
	if err != nil {
		if errors.Is(err, models.ErrDuplicate) {
			h.writeErrorResponse(ctx, w, http.StatusConflict, "Listing type with this slug already exists")
		} else {
			log.Error(ctx, "Failed to create listing type", zap.Error(err))
			h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		}
		return
	}

	h.writeJSONResponse(ctx, w, http.StatusCreated, lt)
}

// @Summary      Update Listing Type (Staff)
// @Security     BearerAuth
// @Description  Updates an existing Listing Type.
// @Tags         Listing Types (Staff)
// @Accept       json
// @Produce      json
// @Param        id path int true "Listing Type ID"
// @Param        input body secret_guest.UpdateListingTypeRequestDTO true "Listing Type Payload"
// @Param        Authorization header string true "Bearer Access Token"
// @Success      200 {object} secret_guest.ListingTypeResponse "Updated"
// @Failure      400 {object} ErrorResponse "Invalid payload or ID"
// @Failure      404 {object} ErrorResponse "Listing Type not found"
// @Failure      409 {object} ErrorResponse "Duplicate slug"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /listing_types/{id} [patch]
func (h *SecretGuestHandler) UpdateListingType(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	id, ok := h.parseIntFromPath(w, r, "id")
	if !ok {
		return
	}

	var dto UpdateListingTypeRequestDTO
	if err := h.decodeJSONBody(ctx, r, &dto); err != nil {
		h.writeErrorResponse(ctx, w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := validation.StructCtx(ctx, &dto); err != nil {
		log.Warn(ctx, "Validation failed for update listing type", zap.Error(err))
		h.writeErrorResponse(ctx, w, http.StatusBadRequest, "Invalid request body: "+err.Error())
		return
	}

	lt, err := h.service.UpdateListingType(ctx, id, dto)
	if err != nil {
		switch {
		case errors.Is(err, models.ErrNotFound):
			h.writeErrorResponse(ctx, w, http.StatusNotFound, "Listing type not found")
		case errors.Is(err, models.ErrDuplicate):
			h.writeErrorResponse(ctx, w, http.StatusConflict, "Listing type with this slug already exists")
		default:
			log.Error(ctx, "Failed to update listing type", zap.Error(err))
			h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		}
		return
	}

	h.writeJSONResponse(ctx, w, http.StatusOK, lt)
}

// @Summary      Delete Listing Type (Staff)
// @Security     BearerAuth
// @Description  Deletes an existing Listing Type. Deletion will fail if the type is used in any listings.
// @Tags         Listing Types (Staff)
// @Param        id path int true "Listing Type ID"
// @Param        Authorization header string true "Bearer Access Token"
// @Success      204 "No Content"
// @Failure      400 {object} ErrorResponse "Invalid ID"
// @Failure      404 {object} ErrorResponse "Listing Type not found"
// @Failure      409 {object} ErrorResponse "Listing Type is in use and cannot be deleted"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /listing_types/{id} [delete]
func (h *SecretGuestHandler) DeleteListingType(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	id, ok := h.parseIntFromPath(w, r, "id")
	if !ok {
		return
	}

	err := h.service.DeleteListingType(ctx, id)
	if err != nil {
		switch {
		case errors.Is(err, models.ErrNotFound):
			h.writeErrorResponse(ctx, w, http.StatusNotFound, "Listing type not found")
		case errors.Is(err, models.ErrInUse):
			h.writeErrorResponse(ctx, w, http.StatusConflict, "Listing type is in use and cannot be deleted")
		default:
			log.Error(ctx, "Failed to delete listing type", zap.Error(err), zap.Int("id", id))
			h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		}
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// checklist_sections

// @Summary      Get Checklist Sections (Staff)
// @Security     BearerAuth
// @Description  Returns a list of all Checklist Sections.
// @Tags         Checklist Sections (Staff)
// @Produce      json
// @Param        id query []int false "Filter by one or more Checklist Section IDs" collectionFormat(multi)
// @Param        slug query []string false "Filter by one or more Checklist Section slugs" collectionFormat(multi)
// @Param        listing_type_id query []int false "Filter by one or more Listing Type IDs" collectionFormat(multi)
// @Param        listing_type_slug query []string false "Filter by one or more Listing Type slugs" collectionFormat(multi)
// @Param Authorization header string true "Bearer Access Token"
// @Success      200 {object} secret_guest.ChecklistSectionsResponse
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /checklist_sections [get]
func (h *SecretGuestHandler) GetChecklistSections(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	queryParams := r.URL.Query()
	var ids []int
	if idStrings, ok := queryParams["id"]; ok {
		for _, idStr := range idStrings {
			parsedInt, err := strconv.Atoi(idStr)
			if err != nil {
				log.Warn(ctx, "Invalid checklist_section id value in query parameter, value ignored", zap.String("id", idStr), zap.Error(err))
				continue
			}
			ids = append(ids, parsedInt)
		}
	}

	var slugs []string
	if slugStrings, ok := queryParams["slug"]; ok {
		slugs = append(slugs, slugStrings...)
	}

	var listingTypeIDs []int
	if idStrings, ok := queryParams["listing_type_id"]; ok {
		for _, idStr := range idStrings {
			parsedInt, err := strconv.Atoi(idStr)
			if err != nil {
				log.Warn(ctx, "Invalid listing_type_id value in query parameter, value ignored", zap.String("listing_type_id", idStr), zap.Error(err))
				continue
			}
			listingTypeIDs = append(listingTypeIDs, parsedInt)
		}
	}

	var listingTypeSlugs []string
	if slugStrings, ok := queryParams["listing_type_slug"]; ok {
		listingTypeSlugs = append(listingTypeSlugs, slugStrings...)
	}

	dto := GetChecklistSectionsRequestDTO{
		IDs:              ids,
		Slugs:            slugs,
		ListingTypeIDs:   listingTypeIDs,
		ListingTypeSlugs: listingTypeSlugs,
	}

	checklistSections, err := h.service.GetChecklistSections(ctx, dto)
	if err != nil {
		log.Error(ctx, "Failed to get checklist sections", zap.Error(err))
		h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		return
	}

	h.writeJSONResponse(ctx, w, http.StatusOK, checklistSections)
}

// @Summary      Get Checklist Section By ID (Staff)
// @Security     BearerAuth
// @Description  Returns a single Checklist Section by its ID.
// @Tags         Checklist Sections (Staff)
// @Produce      json
// @Param        id path int true "Checklist Section ID"
// @Param        Authorization header string true "Bearer Access Token"
// @Success      200 {object} secret_guest.ChecklistSectionResponse
// @Failure      400 {object} ErrorResponse "Invalid ID format"
// @Failure      404 {object} ErrorResponse "Checklist Section not found"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /checklist_sections/{id} [get]
func (h *SecretGuestHandler) GetChecklistSectionByID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	id, ok := h.parseIntFromPath(w, r, "id")
	if !ok {
		return
	}

	cs, err := h.service.GetChecklistSectionByID(ctx, id)
	if err != nil {
		if errors.Is(err, models.ErrNotFound) {
			h.writeErrorResponse(ctx, w, http.StatusNotFound, "Checklist section not found")
		} else {
			log.Error(ctx, "Failed to get checklist section by ID", zap.Error(err), zap.Int("id", id))
			h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		}
		return
	}

	h.writeJSONResponse(ctx, w, http.StatusOK, cs)
}

// @Summary      Create Checklist Section (Staff)
// @Security     BearerAuth
// @Description  Creates a new Checklist Section.
// @Tags         Checklist Sections (Staff)
// @Accept       json
// @Produce      json
// @Param        input body secret_guest.CreateChecklistSectionRequestDTO true "Checklist Section Payload"
// @Param        Authorization header string true "Bearer Access Token"
// @Success      201 {object} secret_guest.ChecklistSectionResponse "Created"
// @Failure      400 {object} ErrorResponse "Invalid payload or non-existent listing_type_id"
// @Failure      409 {object} ErrorResponse "Duplicate slug for this listing type"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /checklist_sections [post]
func (h *SecretGuestHandler) CreateChecklistSection(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	var dto CreateChecklistSectionRequestDTO
	if err := h.decodeJSONBody(ctx, r, &dto); err != nil {
		h.writeErrorResponse(ctx, w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := validation.StructCtx(ctx, &dto); err != nil {
		log.Warn(ctx, "Validation failed for create checklist section", zap.Error(err))
		h.writeErrorResponse(ctx, w, http.StatusBadRequest, "Invalid request body: "+err.Error())
		return
	}

	cs, err := h.service.CreateChecklistSection(ctx, dto)
	if err != nil {
		switch {
		case errors.Is(err, models.ErrDuplicate):
			h.writeErrorResponse(ctx, w, http.StatusConflict, "Checklist section with this slug already exists for the given listing type")
		case errors.Is(err, models.ErrForeignKeyViolation):
			h.writeErrorResponse(ctx, w, http.StatusBadRequest, "The specified listing_type_id does not exist")
		default:
			log.Error(ctx, "Failed to create checklist section", zap.Error(err))
			h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		}
		return
	}

	h.writeJSONResponse(ctx, w, http.StatusCreated, cs)
}

// @Summary      Update Checklist Section (Staff)
// @Security     BearerAuth
// @Description  Updates an existing Checklist Section.
// @Tags         Checklist Sections (Staff)
// @Accept       json
// @Produce      json
// @Param        id path int true "Checklist Section ID"
// @Param        input body secret_guest.UpdateChecklistSectionRequestDTO true "Checklist Section Payload"
// @Param        Authorization header string true "Bearer Access Token"
// @Success      200 {object} secret_guest.ChecklistSectionResponse "Updated"
// @Failure      400 {object} ErrorResponse "Invalid payload or ID"
// @Failure      404 {object} ErrorResponse "Checklist Section not found"
// @Failure      409 {object} ErrorResponse "Duplicate slug for this listing type"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /checklist_sections/{id} [patch]
func (h *SecretGuestHandler) UpdateChecklistSection(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	id, ok := h.parseIntFromPath(w, r, "id")
	if !ok {
		return
	}

	var dto UpdateChecklistSectionRequestDTO
	if err := h.decodeJSONBody(ctx, r, &dto); err != nil {
		h.writeErrorResponse(ctx, w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := validation.StructCtx(ctx, &dto); err != nil {
		log.Warn(ctx, "Validation failed for update checklist section", zap.Error(err))
		h.writeErrorResponse(ctx, w, http.StatusBadRequest, "Invalid request body: "+err.Error())
		return
	}

	cs, err := h.service.UpdateChecklistSection(ctx, id, dto)
	if err != nil {
		switch {
		case errors.Is(err, models.ErrNotFound):
			h.writeErrorResponse(ctx, w, http.StatusNotFound, "Checklist section not found")
		case errors.Is(err, models.ErrDuplicate):
			h.writeErrorResponse(ctx, w, http.StatusConflict, "Checklist section with this slug already exists for the given listing type")
		default:
			log.Error(ctx, "Failed to update checklist section", zap.Error(err), zap.Int("id", id))
			h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		}
		return
	}

	h.writeJSONResponse(ctx, w, http.StatusOK, cs)
}

// @Summary      Delete Checklist Section (Staff)
// @Security     BearerAuth
// @Description  Deletes an existing Checklist Section. Deletion will fail if the section is used in any checklist items.
// @Tags         Checklist Sections (Staff)
// @Param        id path int true "Checklist Section ID"
// @Param        Authorization header string true "Bearer Access Token"
// @Success      204 "No Content"
// @Failure      400 {object} ErrorResponse "Invalid ID"
// @Failure      404 {object} ErrorResponse "Checklist Section not found"
// @Failure      409 {object} ErrorResponse "Checklist Section is in use and cannot be deleted"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /checklist_sections/{id} [delete]
func (h *SecretGuestHandler) DeleteChecklistSection(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	id, ok := h.parseIntFromPath(w, r, "id")
	if !ok {
		return
	}

	err := h.service.DeleteChecklistSection(ctx, id)
	if err != nil {
		switch {
		case errors.Is(err, models.ErrNotFound):
			h.writeErrorResponse(ctx, w, http.StatusNotFound, "Checklist section not found")
		case errors.Is(err, models.ErrInUse):
			h.writeErrorResponse(ctx, w, http.StatusConflict, "Checklist section is in use and cannot be deleted")
		default:
			log.Error(ctx, "Failed to delete checklist section", zap.Error(err), zap.Int("id", id))
			h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		}
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// checklist_items

// @Summary      Get Checklist Items (Staff)
// @Security     BearerAuth
// @Description  Returns a list of all Checklist Items.
// @Tags         Checklist Items (Staff)
// @Produce      json
// @Param        id query []int false "Filter by one or more Checklist Item IDs" collectionFormat(multi)
// @Param        slug query []string false "Filter by one or more Checklist Item slugs" collectionFormat(multi)
// @Param        listing_type_id query []int false "Filter by one or more Listing Type IDs" collectionFormat(multi)
// @Param        listing_type_slug query []string false "Filter by one or more Listing Type slugs" collectionFormat(multi)
// @Param        is_active query boolean false "Filter by active status"
// @Param Authorization header string true "Bearer Access Token"
// @Success      200 {object} secret_guest.ChecklistItemsResponse
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /checklist_items [get]
func (h *SecretGuestHandler) GetChecklistItems(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	queryParams := r.URL.Query()
	var ids []int
	if idStrings, ok := queryParams["id"]; ok {
		for _, idStr := range idStrings {
			parsedInt, err := strconv.Atoi(idStr)
			if err != nil {
				log.Warn(ctx, "Invalid checklist_item id value in query parameter, value ignored", zap.String("id", idStr), zap.Error(err))
				continue
			}
			ids = append(ids, parsedInt)
		}
	}

	var slugs []string
	if slugStrings, ok := queryParams["slug"]; ok {
		slugs = append(slugs, slugStrings...)
	}

	var listingTypeIDs []int
	if idStrings, ok := queryParams["listing_type_id"]; ok {
		for _, idStr := range idStrings {
			parsedInt, err := strconv.Atoi(idStr)
			if err != nil {
				log.Warn(ctx, "Invalid listing_type_id value in query parameter, value ignored", zap.String("listing_type_id", idStr), zap.Error(err))
				continue
			}
			listingTypeIDs = append(listingTypeIDs, parsedInt)
		}
	}

	var listingTypeSlugs []string
	if slugStrings, ok := queryParams["listing_type_slug"]; ok {
		listingTypeSlugs = append(listingTypeSlugs, slugStrings...)
	}

	var isActive *bool
	if isActiveStr := queryParams.Get("is_active"); isActiveStr != "" {
		parsedBool, err := strconv.ParseBool(isActiveStr)
		if err == nil {
			isActive = &parsedBool
		}
	}

	dto := GetChecklistItemsRequestDTO{IDs: ids,
		Slugs:            slugs,
		ListingTypeIDs:   listingTypeIDs,
		ListingTypeSlugs: listingTypeSlugs,
		IsActive:         isActive}

	checklistItems, err := h.service.GetChecklistItems(ctx, dto)
	if err != nil {
		log.Error(ctx, "Failed to get checklist items", zap.Error(err))
		h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		return
	}

	h.writeJSONResponse(ctx, w, http.StatusOK, checklistItems)
}

// @Summary      Get Checklist Item By ID (Staff)
// @Security     BearerAuth
// @Description  Returns a single Checklist Item by its ID.
// @Tags         Checklist Items (Staff)
// @Produce      json
// @Param        id path int true "Checklist Item ID"
// @Param        Authorization header string true "Bearer Access Token"
// @Success      200 {object} secret_guest.ChecklistItemResponse
// @Failure      400 {object} ErrorResponse "Invalid ID format"
// @Failure      404 {object} ErrorResponse "Checklist Item not found"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /checklist_items/{id} [get]
func (h *SecretGuestHandler) GetChecklistItemByID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	id, ok := h.parseIntFromPath(w, r, "id")
	if !ok {
		return
	}

	item, err := h.service.GetChecklistItemByID(ctx, id)
	if err != nil {
		if errors.Is(err, models.ErrNotFound) {
			h.writeErrorResponse(ctx, w, http.StatusNotFound, "Checklist item not found")
		} else {
			log.Error(ctx, "Failed to get checklist item by ID", zap.Error(err), zap.Int("id", id))
			h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		}
		return
	}

	h.writeJSONResponse(ctx, w, http.StatusOK, item)
}

// @Summary      Create Checklist Item (Staff)
// @Security     BearerAuth
// @Description  Creates a new Checklist Item.
// @Tags         Checklist Items (Staff)
// @Accept       json
// @Produce      json
// @Param        input body secret_guest.CreateChecklistItemRequestDTO true "Checklist Item Payload"
// @Param        Authorization header string true "Bearer Access Token"
// @Success      201 {object} secret_guest.ChecklistItemResponse "Created"
// @Failure      400 {object} ErrorResponse "Invalid payload or non-existent foreign key"
// @Failure      409 {object} ErrorResponse "Duplicate slug for this listing type"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /checklist_items [post]
func (h *SecretGuestHandler) CreateChecklistItem(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	var dto CreateChecklistItemRequestDTO
	if err := h.decodeJSONBody(ctx, r, &dto); err != nil {
		h.writeErrorResponse(ctx, w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := validation.StructCtx(ctx, &dto); err != nil {
		log.Warn(ctx, "Validation failed for create checklist item", zap.Error(err))
		h.writeErrorResponse(ctx, w, http.StatusBadRequest, "Invalid request body: "+err.Error())
		return
	}

	item, err := h.service.CreateChecklistItem(ctx, dto)
	if err != nil {
		switch {
		case errors.Is(err, models.ErrDuplicate):
			h.writeErrorResponse(ctx, w, http.StatusConflict, "Checklist item with this slug already exists for the given listing type")
		case errors.Is(err, models.ErrForeignKeyViolation):
			h.writeErrorResponse(ctx, w, http.StatusBadRequest, "The specified foreign key (e.g., section_id, listing_type_id) does not exist")
		default:
			log.Error(ctx, "Failed to create checklist item", zap.Error(err))
			h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		}
		return
	}

	h.writeJSONResponse(ctx, w, http.StatusCreated, item)
}

// @Summary      Update Checklist Item (Staff)
// @Security     BearerAuth
// @Description  Updates an existing Checklist Item.
// @Tags         Checklist Items (Staff)
// @Accept       json
// @Produce      json
// @Param        id path int true "Checklist Item ID"
// @Param        input body secret_guest.UpdateChecklistItemRequestDTO true "Checklist Item Payload"
// @Param        Authorization header string true "Bearer Access Token"
// @Success      200 {object} secret_guest.ChecklistItemResponse "Updated"
// @Failure      400 {object} ErrorResponse "Invalid payload or ID"
// @Failure      404 {object} ErrorResponse "Checklist Item not found"
// @Failure      409 {object} ErrorResponse "Duplicate slug or other constraint violation"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /checklist_items/{id} [patch]
func (h *SecretGuestHandler) UpdateChecklistItem(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	id, ok := h.parseIntFromPath(w, r, "id")
	if !ok {
		return
	}

	var dto UpdateChecklistItemRequestDTO
	if err := h.decodeJSONBody(ctx, r, &dto); err != nil {
		h.writeErrorResponse(ctx, w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := validation.StructCtx(ctx, &dto); err != nil {
		log.Warn(ctx, "Validation failed for update checklist item", zap.Error(err))
		h.writeErrorResponse(ctx, w, http.StatusBadRequest, "Invalid request body: "+err.Error())
		return
	}

	item, err := h.service.UpdateChecklistItem(ctx, id, dto)
	if err != nil {
		switch {
		case errors.Is(err, models.ErrNotFound):
			h.writeErrorResponse(ctx, w, http.StatusNotFound, "Checklist item not found")
		case errors.Is(err, models.ErrDuplicate), errors.Is(err, models.ErrForeignKeyViolation):
			h.writeErrorResponse(ctx, w, http.StatusConflict, "Update failed due to a constraint violation (e.g., duplicate slug)")
		default:
			log.Error(ctx, "Failed to update checklist item", zap.Error(err), zap.Int("id", id))
			h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		}
		return
	}

	h.writeJSONResponse(ctx, w, http.StatusOK, item)
}

// @Summary      Delete Checklist Item (Staff)
// @Security     BearerAuth
// @Description  Deletes an existing Checklist Item.
// @Tags         Checklist Items (Staff)
// @Param        id path int true "Checklist Item ID"
// @Param        Authorization header string true "Bearer Access Token"
// @Success      204 "No Content"
// @Failure      400 {object} ErrorResponse "Invalid ID"
// @Failure      404 {object} ErrorResponse "Checklist Item not found"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /checklist_items/{id} [delete]
func (h *SecretGuestHandler) DeleteChecklistItem(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	id, ok := h.parseIntFromPath(w, r, "id")
	if !ok {
		return
	}

	err := h.service.DeleteChecklistItem(ctx, id)
	if err != nil {
		if errors.Is(err, models.ErrNotFound) {
			h.writeErrorResponse(ctx, w, http.StatusNotFound, "Checklist item not found")
		} else {
			log.Error(ctx, "Failed to delete checklist item", zap.Error(err), zap.Int("id", id))
			h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		}
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

/////////////////////////

// UPLOADS

// @Summary      Generate Upload URL
// @Security     BearerAuth
// @Description  Generates a presigned URL and form data for uploading a file directly to the file storage.
// @Tags         Uploads
// @Accept       json
// @Produce      json
// @Param        input body secret_guest.GenerateUploadURLRequest true "File information"
// @Param Authorization header string true "Bearer Access Token"
// @Success      200 {object} secret_guest.GenerateUploadURLResponse
// @Failure      400 {object} ErrorResponse "Invalid request body or file name"
// @Failure      401 {object} ErrorResponse "Unauthorized"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /uploads/generate-url [post]
func (h *SecretGuestHandler) GenerateUploadURL(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	userID, ok := h.parseUserAndID(w, r)
	if !ok {
		return
	}

	var dto GenerateUploadURLRequest
	if err := h.decodeJSONBody(ctx, r, &dto); err != nil {
		log.Warn(ctx, "Failed to decode generate upload url", zap.Error(err))
		h.writeErrorResponse(ctx, w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := dto.Validate(); err != nil {
		log.Warn(ctx, "Failed to validate generate upload url", zap.Error(err))
		h.writeErrorResponse(ctx, w, http.StatusBadRequest, err.Error())
		return
	}

	resp, err := h.service.GenerateUploadURL(ctx, userID, dto)
	if err != nil {
		log.Error(ctx, "Failed to generate upload URL", zap.Error(err))
		h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Failed to generate upload URL")
		return
	}

	h.writeJSONResponse(ctx, w, http.StatusOK, resp)
}

// users

// @Summary      Get All Users (Staff)
// @Security     BearerAuth
// @Description  Returns a paginated list of all users. Available for staff only.
// @Tags         Users (Staff)
// @Produce      json
// @Param        page query int false "Page number for pagination" default(1)
// @Param        limit query int false "Number of items per page" default(50)
// @Param Authorization header string true "Bearer Access Token"
// @Success      200 {object} secret_guest.UsersResponse
// @Failure      401 {object} ErrorResponse "Unauthorized"
// @Failure      403 {object} ErrorResponse "Forbidden"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /users [get]
func (h *SecretGuestHandler) GetAllUsers(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	page, limit := h.parsePagination(r)
	dto := GetAllUsersRequestDTO{
		Page:  page,
		Limit: limit,
	}

	users, err := h.service.GetAllUsers(ctx, dto)
	if err != nil {
		log.Error(ctx, "Failed to get all users", zap.Error(err))
		h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		return
	}

	h.writeJSONResponse(ctx, w, http.StatusOK, users)
}

// profiles

// @Summary      Get My Profile
// @Security     BearerAuth
// @Description  Returns the profile information for the currently authenticated user.
// @Tags         Profiles (User)
// @Produce      json
// @Param        Authorization header string true "Bearer Access Token"
// @Success      200 {object} secret_guest.ProfileResponseDTO
// @Failure      401 {object} ErrorResponse "Unauthorized"
// @Failure      404 {object} ErrorResponse "Profile not found"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /profiles/my [get]
func (h *SecretGuestHandler) GetMyProfile(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	userID, ok := h.parseUserAndID(w, r)
	if !ok {
		return
	}

	profile, err := h.service.GetMyProfile(ctx, userID)
	if err != nil {
		if errors.Is(err, models.ErrNotFound) {
			h.writeErrorResponse(ctx, w, http.StatusNotFound, "Profile not found")
		} else {
			log.Error(ctx, "Failed to get my profile", zap.Error(err), zap.String("user_id", userID.String()))
			h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		}
		return
	}

	h.writeJSONResponse(ctx, w, http.StatusOK, profile)
}

// @Summary      Get All Profiles (Staff)
// @Security     BearerAuth
// @Description  Returns a paginated list of all user profiles. Available for staff only.
// @Tags         Profiles (Staff)
// @Produce      json
// @Param        page query int false "Page number for pagination" default(1)
// @Param        limit query int false "Number of items per page" default(50)
// @Param        Authorization header string true "Bearer Access Token"
// @Success      200 {object} secret_guest.ProfilesResponse
// @Failure      401 {object} ErrorResponse "Unauthorized"
// @Failure      403 {object} ErrorResponse "Forbidden"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /staff/profiles [get]
func (h *SecretGuestHandler) GetAllProfiles(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	page, limit := h.parsePagination(r)
	dto := GetAllProfilesRequestDTO{
		Page:  page,
		Limit: limit,
	}

	profiles, err := h.service.GetAllProfiles(ctx, dto)
	if err != nil {
		log.Error(ctx, "Failed to get all profiles", zap.Error(err))
		h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		return
	}

	h.writeJSONResponse(ctx, w, http.StatusOK, profiles)
}

// @Summary      Get Profile By User ID (Staff)
// @Security     BearerAuth
// @Description  Returns a single user profile by their user ID. Available for staff only.
// @Tags         Profiles (Staff)
// @Produce      json
// @Param        id path string true "User ID" format(uuid)
// @Param        Authorization header string true "Bearer Access Token"
// @Success      200 {object} secret_guest.ProfileResponseDTO
// @Failure      400 {object} ErrorResponse "Invalid User ID format"
// @Failure      401 {object} ErrorResponse "Unauthorized"
// @Failure      403 {object} ErrorResponse "Forbidden"
// @Failure      404 {object} ErrorResponse "Profile not found"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /staff/profiles/{id} [get]
func (h *SecretGuestHandler) GetProfileByUserID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	userID, ok := h.parseUUIDFromPath(w, r, "user_id")
	if !ok {
		return
	}

	profile, err := h.service.GetMyProfile(ctx, userID) // Reusing the same service method as for GetMyProfile
	if err != nil {
		if errors.Is(err, models.ErrNotFound) {
			h.writeErrorResponse(ctx, w, http.StatusNotFound, "Profile not found")
		} else {
			log.Error(ctx, "Failed to get profile by user ID", zap.Error(err), zap.String("user_id", userID.String()))
			h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		}
		return
	}

	h.writeJSONResponse(ctx, w, http.StatusOK, profile)
}

// @Summary      Get Statistics (Staff)
// @Security     BearerAuth
// @Description  Returns basic statistics about the system
// @Tags         Statistics (Staff)
// @Produce      json
// @Param        Authorization header string true "Bearer Access Token"
// @Success      200 {object} secret_guest.StatisticsResponseDTO
// @Failure      401 {object} ErrorResponse "Unauthorized"
// @Failure      403 {object} ErrorResponse "Forbidden"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /staff/statistics [get]
func (h *SecretGuestHandler) GetStatistics(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	stats, err := h.service.GetStatistics(ctx)
	if err != nil {
		log.Error(ctx, "Failed to get statistics", zap.Error(err))
		h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		return
	}

	h.writeJSONResponse(ctx, w, http.StatusOK, stats)
}

// @Summary      Get My History
// @Security     BearerAuth
// @Description  Returns a chronological history of the user's reports.
// @Tags         Journal (User)
// @Produce      json
// @Param        page query int false "Page number for pagination" default(1)
// @Param        limit query int false "Number of items per page" default(20)
// @Param        Authorization header string true "Bearer Access Token"
// @Success      200 {object} secret_guest.JournalResponse
// @Failure      401 {object} ErrorResponse "Unauthorized"
// @Failure      500 {object} ErrorResponse "Internal server error"
// @Router       /journal/my [get]
func (h *SecretGuestHandler) GetMyHistory(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	log := logger.GetLoggerFromCtx(ctx)

	userID, ok := h.parseUserAndID(w, r)
	if !ok {
		return
	}

	page, limit := h.parsePagination(r)
	dto := GetMyHistoryRequestDTO{
		UserID: userID,
		Page:   page,
		Limit:  limit,
	}

	journal, err := h.service.GetMyHistory(ctx, dto)
	if err != nil {
		log.Error(ctx, "Failed to get my history", zap.Error(err))
		h.writeErrorResponse(ctx, w, http.StatusInternalServerError, "Internal server error")
		return
	}

	h.writeJSONResponse(ctx, w, http.StatusOK, journal)
}
