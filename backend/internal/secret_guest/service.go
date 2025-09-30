package secret_guest

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/ostrovok-hackathon-2025/koshka-musya/internal/config"
	"github.com/ostrovok-hackathon-2025/koshka-musya/internal/models"
	"github.com/ostrovok-hackathon-2025/koshka-musya/internal/secret_guest/repository"
	"github.com/ostrovok-hackathon-2025/koshka-musya/internal/storage"
	"github.com/ostrovok-hackathon-2025/koshka-musya/pkg/logger"
	"go.uber.org/zap"
)

type SecretGuestRepository interface {

	// listings
	CreateListing(ctx context.Context, listing *models.Listing) (uuid.UUID, error)
	GetListings(ctx context.Context, filter repository.ListingsFilter) ([]*models.Listing, int, error)
	GetListingByID(ctx context.Context, id uuid.UUID) (*models.Listing, error)
	GetListingByCode(ctx context.Context, code uuid.UUID) (*models.Listing, error)

	// reservations
	CreateOTAReservation(ctx context.Context, reservation *models.OTAReservation) (uuid.UUID, error)
	GetOTAReservations(ctx context.Context, filter repository.OTAReservationsFilter) ([]*models.OTAReservation, int, error)
	GetOTAReservationByID(ctx context.Context, id uuid.UUID) (*models.OTAReservation, error)
	UpdateOTAReservationStatus(ctx context.Context, reservationID uuid.UUID, statusID int) error

	// assignments
	CreateAssignment(ctx context.Context, assignment *models.Assignment) (uuid.UUID, error)
	GetAssignments(ctx context.Context, filter repository.AssignmentsFilter) ([]*models.Assignment, int, error)
	GetAssignmentByID(ctx context.Context, assignmentID uuid.UUID) (*models.Assignment, error)
	GetFreeAssignments(ctx context.Context, filter repository.AssignmentsFilter) ([]*models.Assignment, int, error)
	GetAssignmentByIDAndOwner(ctx context.Context, assignmentID, reporterID uuid.UUID) (*models.Assignment, error)
	CancelAssignment(ctx context.Context, assignmentID uuid.UUID) error
	AcceptMyAssignment(ctx context.Context, assignmentID, reporterID uuid.UUID, acceptedAt time.Time) (*models.Report, error)
	DeclineMyAssignment(ctx context.Context, assignmentID, reporterID uuid.UUID, takedAt, declinedAt time.Time) error
	TakeFreeAssignmentsByID(ctx context.Context, assignmentID, userID uuid.UUID, takenAt time.Time) error

	// reports
	GetReports(ctx context.Context, filter repository.ReportsFilter) ([]*models.Report, int, error)
	GetReportByID(ctx context.Context, reportID uuid.UUID) (*models.Report, error)
	GetReportByIDAndOwner(ctx context.Context, reportID, reporterID uuid.UUID) (*models.Report, error)
	UpdateMyReportContent(ctx context.Context, reportID, reporterID uuid.UUID, currentStatusID int, schema models.ChecklistSchema) error
	UpdateMyReportStatus(ctx context.Context, reportID, reporterID uuid.UUID, currentStatusID, newStatusID int) error
	UpdateReportStatusAsStaff(ctx context.Context, reportID uuid.UUID, currentStatusID, newStatusID int) error

	/////
	GetListingTypeID(ctx context.Context, listingID uuid.UUID) (int, error)
	GetChecklistTemplate(ctx context.Context, listingTypeID int) ([]*models.ChecklistSection, []*models.ChecklistItem, error)
	UpdateReportSchema(ctx context.Context, reportID uuid.UUID, schema models.ChecklistSchema) error

	/////

	// answer_types
	GetAnswerTypes(ctx context.Context, filter repository.AnswerTypesFilter) ([]*models.AnswerType, error)
	GetAnswerTypeByID(ctx context.Context, id int) (*models.AnswerType, error)
	CreateAnswerType(ctx context.Context, at *models.AnswerType) (*models.AnswerType, error)
	UpdateAnswerType(ctx context.Context, id int, at *models.AnswerType, metaSetted bool) error
	DeleteAnswerType(ctx context.Context, id int) error

	// media_requirements
	GetMediaRequirements(ctx context.Context, filter repository.MediaRequirementsFilter) ([]*models.MediaRequirement, error)

	// listing_types
	GetListingTypes(ctx context.Context, filter repository.ListingTypesFilter) ([]*models.ListingType, error)
	GetListingTypeByID(ctx context.Context, id int) (*models.ListingType, error)
	CreateListingType(ctx context.Context, lt *models.ListingType) (*models.ListingType, error)
	UpdateListingType(ctx context.Context, id int, lt *models.ListingType) error
	DeleteListingType(ctx context.Context, id int) error

	// checklist_sections
	GetChecklistSections(ctx context.Context, filter repository.ChecklistSectionsFilter) ([]*models.ChecklistSection, error)
	GetChecklistSectionByID(ctx context.Context, id int) (*models.ChecklistSection, error)
	CreateChecklistSection(ctx context.Context, cs *models.ChecklistSection) (*models.ChecklistSection, error)
	UpdateChecklistSection(ctx context.Context, id int, csUpd *models.ChecklistSectionUpdate) error
	DeleteChecklistSection(ctx context.Context, id int) error

	// checklist_items
	GetChecklistItems(ctx context.Context, filter repository.ChecklistItemsFilter) ([]*models.ChecklistItem, error)
	GetChecklistItemByID(ctx context.Context, id int) (*models.ChecklistItem, error)
	CreateChecklistItem(ctx context.Context, item *models.ChecklistItem) (*models.ChecklistItem, error)
	UpdateChecklistItem(ctx context.Context, id int, item *models.ChecklistItemUpdate) error
	DeleteChecklistItem(ctx context.Context, id int) error

	// users
	GetAllUsers(ctx context.Context, limit, offset int) ([]*models.User, int, error)
}

type SecretGuestService struct {
	repo            SecretGuestRepository
	storageProvider storage.FileStorageProvider
	cfg             *config.Config
	wg              *sync.WaitGroup
}

func NewSecretGuestService(cfg *config.Config, repo SecretGuestRepository, storageProvider storage.FileStorageProvider) *SecretGuestService {
	return &SecretGuestService{
		repo:            repo,
		storageProvider: storageProvider,
		cfg:             cfg,
		wg:              &sync.WaitGroup{},
	}
}

// Wait ждет завершения всех фоновых задач, запущенных сервисом.
func (s *SecretGuestService) Wait() {
	s.wg.Wait()
}

// listings

func (s *SecretGuestService) CreateListing(ctx context.Context, dto CreateListingRequestDTO) (*ListingResponseDTO, error) {

	listing := models.Listing{
		Code:          dto.Code,
		Title:         dto.Title,
		Description:   dto.Description,
		ListingTypeID: dto.ListingTypeID,
		Address:       dto.Address,
		City:          dto.City,
		Country:       dto.Country,
		Latitude:      dto.Latitude,
		Longitude:     dto.Longitude,
	}

	listingID, err := s.repo.CreateListing(ctx, &listing)
	if err != nil {
		return nil, fmt.Errorf("failed to create listing in repository: %w", err)
	}

	dbListing, err := s.repo.GetListingByID(ctx, listingID)
	if err != nil {
		return nil, fmt.Errorf("failed to get listing by id %s from repository: %w", listingID.String(), err)
	}

	return toListingResponseDTO(dbListing), nil
}

func (s *SecretGuestService) GetListings(ctx context.Context, dto GetListingsRequestDTO) (*ListingsResponse, error) {

	filter := repository.ListingsFilter{
		ListingTypeIDs: dto.ListingTypeIDs,
		Limit:          dto.Limit,
		Offset:         (dto.Page - 1) * dto.Limit,
	}

	dbListings, total, err := s.repo.GetListings(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to get listings from repository: %w", err)
	}

	responseDTOs := make([]*ListingResponseDTO, 0, len(dbListings))
	for _, l := range dbListings {
		responseDTOs = append(responseDTOs, toListingResponseDTO(l))
	}

	response := &ListingsResponse{
		Listings: responseDTOs,
		Total:    total,
		Page:     dto.Page,
	}
	return response, nil

}

func (s *SecretGuestService) GetListingByID(ctx context.Context, id uuid.UUID) (*ListingResponseDTO, error) {

	dbListing, err := s.repo.GetListingByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get listing by id %s from repository: %w", id.String(), err)
	}

	return toListingResponseDTO(dbListing), nil
}

func toListingResponseDTO(l *models.Listing) *ListingResponseDTO {
	if l == nil {
		return nil
	}
	return &ListingResponseDTO{
		ID:          l.ID,
		Code:        l.Code,
		Title:       l.Title,
		Description: l.Description,
		MainPicture: l.MainPicture,
		ListingType: ListingTypeResponse{
			ID:   l.ListingType.ID,
			Slug: l.ListingType.Slug,
			Name: l.ListingType.Name,
		},
		Address:   l.Address,
		City:      l.City,
		Country:   l.Country,
		Latitude:  l.Latitude,
		Longitude: l.Longitude,
	}
}

// =================================================================================================

// assignments

// func (s *SecretGuestService) CreateAssignment(ctx context.Context, dto CreateAssignmentRequestDTO) (*AssignmentResponseDTO, error) {
//
// 	assignment := models.Assignment{
// 		Purpose:    dto.Purpose,
// 		ListingID:  dto.ListingID,
// 		ReporterID: dto.ReporterID,
// 		ExpiresAt:  dto.ExpiresAt,
// 	}
//
// 	assignmentID, err := s.repo.CreateAssignment(ctx, &assignment)
// 	if err != nil {
// 		return nil, fmt.Errorf("failed to create assignment in repository: %w", err)
// 	}
//
// 	dbAssignment, err := s.repo.GetAssignmentByID(ctx, assignmentID)
// 	if err != nil {
// 		return nil, fmt.Errorf("failed to get assignment by id %s from repository: %w", assignmentID.String(), err)
// 	}
//
// 	return toAssignmentResponseDTO(dbAssignment), nil
// }

func (s *SecretGuestService) GetFreeAssignments(ctx context.Context, dto GetFreeAssignmentsRequestDTO) (*AssignmentsResponse, error) {

	filter := repository.AssignmentsFilter{
		StatusIDs:      []int{models.AssignmentStatusOffered}, // только Offered
		ListingTypeIDs: dto.ListingTypeIDs,
		Limit:          dto.Limit,
		Offset:         (dto.Page - 1) * dto.Limit,
	}

	// return s.getAssignmentsWithFilter(ctx, filter, dto.Page)

	dbAssignments, total, err := s.repo.GetFreeAssignments(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to get free assignments with filter: %w", err)
	}

	responseDTOs := make([]*AssignmentResponseDTO, 0, len(dbAssignments))
	for _, a := range dbAssignments {
		responseDTOs = append(responseDTOs, toAssignmentResponseDTO(a))
	}

	response := &AssignmentsResponse{
		Assignments: responseDTOs,
		Total:       total,
		Page:        dto.Page,
	}
	return response, nil

}

func (s *SecretGuestService) GetFreeAssignmentsByID(ctx context.Context, assignmentID uuid.UUID) (*AssignmentResponseDTO, error) {
	assignment, err := s.repo.GetAssignmentByID(ctx, assignmentID)
	if err != nil {
		return nil, fmt.Errorf("failed to get assignment by id %s: %w", assignmentID.String(), err)
	}

	// TO DO: Правильнее передавать в репозиторий статус, чтобы не делать проверку здесь.
	// Чекаем, что предложение действительно свободное
	if assignment.ReporterID != uuid.Nil || assignment.StatusID != models.AssignmentStatusOffered {
		return nil, models.ErrAssignmentNotFound
	}

	return toAssignmentResponseDTO(assignment), nil

}

func (s *SecretGuestService) TakeFreeAssignmentsByID(ctx context.Context, userID, assignmentID uuid.UUID) error {

	err := s.repo.TakeFreeAssignmentsByID(ctx, assignmentID, userID, time.Now())
	if err != nil {
		return fmt.Errorf("failed to take assignment %s for user %s: %w", assignmentID.String(), userID.String(), err)
	}
	return nil
}

func (s *SecretGuestService) GetMyActiveAssignments(ctx context.Context, dto GetMyAssignmentsRequestDTO) (*AssignmentsResponse, error) {

	activeStatuses := []int{models.AssignmentStatusOffered} // only offered

	filter := repository.AssignmentsFilter{
		ReporterID: &dto.UserID,
		StatusIDs:  activeStatuses,
		Limit:      dto.Limit,
		Offset:     (dto.Page - 1) * dto.Limit,
	}

	return s.getAssignmentsWithFilter(ctx, filter, dto.Page)
}

func (s *SecretGuestService) GetAllAssignments(ctx context.Context, dto GetAllAssignmentsRequestDTO) (*AssignmentsResponse, error) {

	filter := repository.AssignmentsFilter{
		ReporterID:     dto.ReporterID,
		StatusIDs:      dto.StatusIDs,
		ListingTypeIDs: dto.ListingTypeIDs,
		Limit:          dto.Limit,
		Offset:         (dto.Page - 1) * dto.Limit,
	}

	return s.getAssignmentsWithFilter(ctx, filter, dto.Page)
}

func (s *SecretGuestService) getAssignmentsWithFilter(ctx context.Context, filter repository.AssignmentsFilter, page int) (*AssignmentsResponse, error) {

	dbAssignments, total, err := s.repo.GetAssignments(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to get assignments with filter: %w", err)
	}

	responseDTOs := make([]*AssignmentResponseDTO, 0, len(dbAssignments))
	for _, a := range dbAssignments {
		responseDTOs = append(responseDTOs, toAssignmentResponseDTO(a))
	}

	response := &AssignmentsResponse{
		Assignments: responseDTOs,
		Total:       total,
		Page:        page,
	}
	return response, nil
}

///

func toAssignmentResponseDTO(a *models.Assignment) *AssignmentResponseDTO {
	if a == nil {
		return nil
	}
	return &AssignmentResponseDTO{
		ID: a.ID,

		OtaSgReservationID: a.OtaSgReservationID,
		Pricing:            a.Pricing,
		Guests:             a.Guests,
		Dates: AssignmentReservationDates{
			Checkin:  a.CheckinDate,
			Checkout: a.CheckoutDate,
		},

		Purpose: a.Purpose,
		Listing: ListingShortResponse{
			ID:          a.Listing.ID,
			Code:        a.Listing.Code,
			Title:       a.Listing.Title,
			Description: a.Listing.Description,
			MainPicture: a.Listing.MainPicture,
			ListingType: ListingTypeResponse{
				ID:   a.Listing.ListingTypeID,
				Slug: a.Listing.ListingTypeSlug,
				Name: a.Listing.ListingTypeName,
			},
			Address:   a.Listing.Address,
			City:      a.Listing.City,
			Country:   a.Listing.Country,
			Latitude:  a.Listing.Latitude,
			Longitude: a.Listing.Longitude,
		},
		Reporter: ReporterResponse{
			ID:       a.Reporter.ID,
			Username: a.Reporter.Username,
		},
		Status: StatusResponse{
			ID:   a.Status.ID,
			Slug: a.Status.Slug,
			Name: a.Status.Name,
		},
		CreatedAt:  a.CreatedAt,
		AcceptedAt: a.AcceptedAt,
		ExpiresAt:  a.ExpiresAt,
		TakedAt:    a.TakedAt,
	}
}

func (s *SecretGuestService) GetMyAssignmentByID(ctx context.Context, userID, assignmentID uuid.UUID) (*AssignmentResponseDTO, error) {

	assignment, err := s.repo.GetAssignmentByIDAndOwner(ctx, assignmentID, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get assignment by id %s for owner %s: %w", assignmentID.String(), userID.String(), err)
	}

	// TO DO: Правильнее передавать в репозиторий статус, чтобы не делать проверку здесь.
	if assignment.StatusID != models.AssignmentStatusOffered {
		return nil, models.ErrAssignmentNotFound
	}

	return toAssignmentResponseDTO(assignment), nil

}

func (s *SecretGuestService) GetAssignmentByID_AsStaff(ctx context.Context, assignmentID uuid.UUID) (*AssignmentResponseDTO, error) {

	assignment, err := s.repo.GetAssignmentByID(ctx, assignmentID)
	if err != nil {
		return nil, fmt.Errorf("failed to get assignment by id %s: %w", assignmentID.String(), err)
	}
	return toAssignmentResponseDTO(assignment), nil
}

func (s *SecretGuestService) AcceptMyAssignment(ctx context.Context, userID, assignmentID uuid.UUID) error {

	// как в GetMyAssignmentByID
	assignment, err := s.repo.GetAssignmentByIDAndOwner(ctx, assignmentID, userID)
	if err != nil {
		return fmt.Errorf("failed to get assignment by id %s for owner %s: %w", assignmentID.String(), userID.String(), err)
	}
	if assignment.StatusID != models.AssignmentStatusOffered {
		return models.ErrAssignmentNotFound
	}

	now := time.Now()
	maxBeforeCheckin := time.Duration(s.cfg.AssignmentDeadlineHours) * time.Hour
	timeUntilCheckin := assignment.ExpiresAt.Sub(now)
	if timeUntilCheckin > maxBeforeCheckin {
		return fmt.Errorf("accept is allowed only within %d hours before check-in", s.cfg.AssignmentDeadlineHours)
	}

	report, err := s.repo.AcceptMyAssignment(ctx, assignmentID, userID, now)
	if err != nil {
		return fmt.Errorf("failed to accept assignment %s for user %s: %w", assignmentID.String(), userID.String(), err)
	}

	// Генерация схемы отчета
	s.generateChecklistSchemaForReport(ctx, report)
	return nil
}

func (s *SecretGuestService) DeclineMyAssignment(ctx context.Context, userID, assignmentID uuid.UUID) error {

	// как в GetMyAssignmentByID
	assignment, err := s.repo.GetAssignmentByIDAndOwner(ctx, assignmentID, userID)
	if err != nil {
		return fmt.Errorf("failed to get assignment by id %s for owner %s: %w", assignmentID.String(), userID.String(), err)
	}
	if assignment.StatusID != models.AssignmentStatusOffered {
		return models.ErrAssignmentNotFound
	}

	takedAt := assignment.TakedAt
	declinedAt := time.Now()

	err = s.repo.DeclineMyAssignment(ctx, assignmentID, userID, *takedAt, declinedAt)
	if err != nil {
		return fmt.Errorf("failed to decline assignment %s for user %s: %w", assignmentID.String(), userID.String(), err)
	}
	return nil
}

func (s *SecretGuestService) CancelAssignment(ctx context.Context, assignmentID uuid.UUID) error {

	err := s.repo.CancelAssignment(ctx, assignmentID)
	if err != nil {
		return fmt.Errorf("failed to cancel assignment %s: %w", assignmentID.String(), err)
	}
	return nil
}

// OTA reservations

func (s *SecretGuestService) HandleOTAReservation(ctx context.Context, dto OTAReservationRequestDTO) error {
	var listingID uuid.UUID

	listing, err := s.repo.GetListingByCode(ctx, dto.Reservation.OTAID)
	if errors.Is(err, models.ErrListingNotFound) {
		// search listing type
		listingType, err := s.repo.GetListingTypeByID(ctx, dto.Reservation.Listing.ListingType.ID)
		if err != nil {
			if errors.Is(err, models.ErrNotFound) {
				return models.ErrListingTypeNotFound
			}

			// TODO: условились, что во всех бронях от OTA типы объектов согласованы и у нас есть все их коды.
			// Если типа не обнаружено, то правильнее сообщения перекидывать в DLQ

			return fmt.Errorf("failed to get listing type: %w", err)
		}

		// register listing object
		listingID, err = s.repo.CreateListing(ctx, &models.Listing{
			Code:          dto.Reservation.OTAID,
			Title:         dto.Reservation.Listing.Title,
			Description:   dto.Reservation.Listing.Description,
			ListingTypeID: listingType.ID,
			Address:       dto.Reservation.Listing.Address,
			City:          dto.Reservation.Listing.City,
			Country:       dto.Reservation.Listing.Country,
			Latitude:      dto.Reservation.Listing.Latitude,
			Longitude:     dto.Reservation.Listing.Longitude,
			MainPicture:   dto.Reservation.Listing.MainPicture,
		})
		if err != nil {
			return fmt.Errorf("failed to create listing %s: %w", dto.Reservation.OTAID.String(), err)
		}
	} else if err != nil {
		return fmt.Errorf("failed to get listing by code %s from repository: %w", dto.Reservation.OTAID.String(), err)
	} else {
		listingID = listing.ID
	}

	otaSourceMsg, err := json.Marshal(&dto)
	if err != nil {
		return fmt.Errorf("failed to marshal OTA source msg: %w", err)
	}

	otaPricing, err := json.Marshal(&dto.Reservation.Pricing)
	if err != nil {
		return fmt.Errorf("failed to marshal OTA pricing: %w", err)
	}

	otaGuests, err := json.Marshal(&dto.Reservation.Guests)
	if err != nil {
		return fmt.Errorf("failed to marshal OTA guests: %w", err)
	}

	var reservationStatusID int
	switch dto.Reservation.Status {
	case "reserved":
		reservationStatusID = models.OTAReservationStatusNew
	default:
		reservationStatusID = models.OTAReservationStatusNoShow
	}

	otaReservation := models.OTAReservation{
		OTAID:         dto.Reservation.OTAID,
		BookingNumber: dto.Reservation.BookingNumber,
		ListingID:     listingID,
		CheckinDate:   dto.Reservation.Dates.Checkin,
		CheckoutDate:  dto.Reservation.Dates.Checkout,
		StatusID:      reservationStatusID,
		SourceMsg:     otaSourceMsg,
		Pricing:       otaPricing,
		Guests:        otaGuests,
	}

	reservationID, err := s.repo.CreateOTAReservation(ctx, &otaReservation)
	if err != nil {
		return fmt.Errorf("failed to create OTA reservation in repository: %w", err)
	}

	// TODO: Нужно вынести создание предложения в отдельную фоновую задачу
	if dto.Reservation.Status == "reserved" {
		s.createAssignmentFromOTAReservation(ctx, reservationID)
	} else {
		log := logger.GetLoggerFromCtx(ctx)
		log.Info(ctx, "OTA reservation status is not reserved(assignment not created)", zap.Error(err))
	}

	return nil
}

func (s *SecretGuestService) createAssignmentFromOTAReservation(ctx context.Context, reservationID uuid.UUID) {
	s.wg.Add(1)
	go func() {
		defer s.wg.Done()

		bgCtx := context.Background()
		bgCtx = logger.ContextWithLogger(bgCtx, logger.GetLoggerFromCtx(ctx))
		log := logger.GetLoggerFromCtx(bgCtx)

		taskCtx, cancel := context.WithTimeout(bgCtx, 1*time.Minute)
		defer cancel()

		log.Info(taskCtx, "Starting background creation of assignment from OTA reservation",
			zap.String("reservation_id", reservationID.String()),
		)

		otaReservation, err := s.repo.GetOTAReservationByID(taskCtx, reservationID)
		if err != nil {
			log.Error(taskCtx, "failed to get OTA reservation by id for assignment creation",
				zap.String("reservation_id", reservationID.String()),
				zap.Error(err),
			)
			return
		}

		assignment := models.Assignment{
			OtaSgReservationID: reservationID,
			Pricing:            otaReservation.Pricing,
			Guests:             otaReservation.Guests,
			ListingID:          otaReservation.ListingID,
			CheckinDate:        otaReservation.CheckinDate,
			CheckoutDate:       otaReservation.CheckoutDate,

			Purpose:   "Проверка объекта по бронированию от OTA",
			CreatedAt: time.Now(),
			ExpiresAt: otaReservation.CheckinDate,
		}

		assignmentID, err := s.repo.CreateAssignment(taskCtx, &assignment)
		if err != nil {
			log.Error(taskCtx, "Failed to create assignment from OTA reservation", zap.Error(err))
			return
		}

		log.Info(taskCtx, "Successfully created assignment from OTA reservation",
			zap.String("assignment_id", assignmentID.String()),
			zap.String("reservation_id", reservationID.String()),
		)
	}()
}

func (s *SecretGuestService) GetAllOTAReservations(ctx context.Context, dto GetAllOTAReservationsRequestDTO) (*OTAReservationsResponse, error) {
	filter := repository.OTAReservationsFilter{
		StatusIDs: dto.StatusIDs,
		Limit:     dto.Limit,
		Offset:    (dto.Page - 1) * dto.Limit,
	}

	return s.getOTAReservationsWithFilter(ctx, filter, dto.Page)
}

func (s *SecretGuestService) GetOTAReservationByID(ctx context.Context, reservationID uuid.UUID) (*OTAReservationResponseDTO, error) {
	reservation, err := s.repo.GetOTAReservationByID(ctx, reservationID)
	if err != nil {
		return nil, fmt.Errorf("failed to get OTA reservation by id %s: %w", reservationID.String(), err)
	}

	return toOTAReservationResponseDTO(reservation), nil
}

func (s *SecretGuestService) UpdateOTAReservationStatusNoShow(ctx context.Context, reservationID uuid.UUID) error {
	err := s.repo.UpdateOTAReservationStatus(ctx, reservationID, models.OTAReservationStatusNoShow)
	if err != nil {
		return fmt.Errorf("failed to update OTA reservation status by id %s: %w", reservationID.String(), err)
	}

	return nil
}

func (s *SecretGuestService) getOTAReservationsWithFilter(ctx context.Context, filter repository.OTAReservationsFilter, page int) (*OTAReservationsResponse, error) {
	dbReservations, total, err := s.repo.GetOTAReservations(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to get OTA reservations with filter: %w", err)
	}

	responseDTOs := make([]*OTAReservationResponseDTO, 0, len(dbReservations))
	for _, r := range dbReservations {
		responseDTOs = append(responseDTOs, toOTAReservationResponseDTO(r))
	}

	return &OTAReservationsResponse{
		Reservations: responseDTOs,
		Total:        total,
		Page:         page,
	}, nil
}

func toOTAReservationResponseDTO(r *models.OTAReservation) *OTAReservationResponseDTO {
	return &OTAReservationResponseDTO{
		ID:            r.ID,
		OTAID:         r.OTAID,
		BookingNumber: r.BookingNumber,
		ListingID:     r.ListingID,
		CheckinDate:   r.CheckinDate,
		CheckoutDate:  r.CheckoutDate,
		Status: StatusResponse{
			ID:   r.StatusID,
			Slug: r.Status.Slug,
			Name: r.Status.Name,
		},
		Pricing: r.Pricing,
		Guests:  r.Guests,
	}
}

// reports

func (s *SecretGuestService) getReportsWithFilter(ctx context.Context, filter repository.ReportsFilter, page int) (*ReportsResponse, error) {

	dbReports, total, err := s.repo.GetReports(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to get reports with filter: %w", err)
	}

	responseDTOs := make([]*ReportResponseDTO, 0, len(dbReports))
	for _, r := range dbReports {
		responseDTOs = append(responseDTOs, toReportResponseDTO(r))
	}

	response := &ReportsResponse{
		Reports: responseDTOs,
		Total:   total,
		Page:    page,
	}
	return response, nil
}

func (s *SecretGuestService) GetMyReports(ctx context.Context, dto GetMyReportsRequestDTO) (*ReportsResponse, error) {

	workStatuses := []int{models.ReportStatusDraft} // only draft

	filter := repository.ReportsFilter{
		ReporterID: &dto.UserID,
		StatusIDs:  workStatuses,
		Limit:      dto.Limit,
		Offset:     (dto.Page - 1) * dto.Limit,
	}

	return s.getReportsWithFilter(ctx, filter, dto.Page)
}

func (s *SecretGuestService) GetAllReports(ctx context.Context, dto GetAllReportsRequestDTO) (*ReportsResponse, error) {

	filter := repository.ReportsFilter{
		ReporterID:     dto.ReporterID,
		StatusIDs:      dto.StatusIDs,
		ListingTypeIDs: dto.ListingTypeIDs,
		Limit:          dto.Limit,
		Offset:         (dto.Page - 1) * dto.Limit,
	}

	return s.getReportsWithFilter(ctx, filter, dto.Page)
}

func toReportResponseDTO(r *models.Report) *ReportResponseDTO {
	if r == nil {
		return nil
	}
	return &ReportResponseDTO{
		ID:           r.ID,
		AssignmentID: r.AssignmentID,
		Purpose:      r.Purpose,

		BookingDetails: ReportBookingDetails{
			OTAID:              r.BookingDetails.OTAID,
			BookingNumber:      r.BookingDetails.BookingNumber,
			OtaSgReservationID: r.BookingDetails.OtaSgReservationID,
			Pricing:            r.BookingDetails.Pricing,
			Guests:             r.BookingDetails.Guests,
			CheckinDate:        r.BookingDetails.CheckinDate,
			CheckoutDate:       r.BookingDetails.CheckoutDate,
		},

		Listing: ListingShortResponse{
			ID:          r.Listing.ID,
			Code:        r.Listing.Code,
			Title:       r.Listing.Title,
			Description: r.Listing.Description,
			MainPicture: r.Listing.MainPicture,
			ListingType: ListingTypeResponse{
				ID:   r.Listing.ListingTypeID,
				Slug: r.Listing.ListingTypeSlug,
				Name: r.Listing.ListingTypeName,
			},
			Address:   r.Listing.Address,
			City:      r.Listing.City,
			Country:   r.Listing.Country,
			Latitude:  r.Listing.Latitude,
			Longitude: r.Listing.Longitude,
		},
		Reporter: ReporterResponse{
			ID:       r.Reporter.ID,
			Username: r.Reporter.Username,
		},
		Status: StatusResponse{
			ID:   r.Status.ID,
			Slug: r.Status.Slug,
			Name: r.Status.Name,
		},
		CreatedAt:       r.CreatedAt,
		UpdatedAt:       r.UpdatedAt,
		SubmittedAt:     r.SubmittedAt,
		ChecklistSchema: r.ChecklistSchema,
	}
}

func (s *SecretGuestService) GetMyReportByID(ctx context.Context, userID, reportID uuid.UUID) (*ReportResponseDTO, error) {
	report, err := s.repo.GetReportByIDAndOwner(ctx, reportID, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get report by id %s for owner %s: %w", reportID.String(), userID.String(), err)
	}

	// TO DO: Возможно передавать в репозиторий статус, чтобы не делать проверку здесь?
	if report.StatusID != models.ReportStatusDraft {
		return nil, models.ErrReportNotFound
	}

	return toReportResponseDTO(report), nil
}

func (s *SecretGuestService) UpdateMyReport(ctx context.Context, userID, reportID uuid.UUID, dto UpdateReportRequestDTO) error {

	err := s.repo.UpdateMyReportContent(
		ctx,
		reportID,
		userID,
		models.ReportStatusDraft,
		dto.ChecklistSchema,
	)

	if err != nil {
		return fmt.Errorf("failed to update report content for report %s by user %s: %w", reportID.String(), userID.String(), err)
	}
	return nil
}

func (s *SecretGuestService) SubmitMyReport(ctx context.Context, userID, reportID uuid.UUID) error {

	// TODO: Валидация, что отчет заполнен

	// ЗАсабмитить можно только отчет в статусе "Черновик"
	err := s.repo.UpdateMyReportStatus(ctx, reportID, userID, models.ReportStatusDraft, models.ReportStatusSubmitted)
	if err != nil {
		return fmt.Errorf("failed to submit report %s by user %s: %w", reportID.String(), userID.String(), err)
	}
	return nil
}

func (s *SecretGuestService) RefuseMyReport(ctx context.Context, userID, reportID uuid.UUID) error {

	// Отказаться можно только от отчета в статусе "Черновик"
	err := s.repo.UpdateMyReportStatus(ctx, reportID, userID, models.ReportStatusDraft, models.ReportStatusRefused)
	if err != nil {
		return fmt.Errorf("failed to refuse report %s by user %s: %w", reportID.String(), userID.String(), err)
	}
	return nil
}

func (s *SecretGuestService) GetReportByID_AsStaff(ctx context.Context, reportID uuid.UUID) (*ReportResponseDTO, error) {
	report, err := s.repo.GetReportByID(ctx, reportID)
	if err != nil {
		return nil, fmt.Errorf("failed to get report by id %s: %w", reportID.String(), err)
	}

	return toReportResponseDTO(report), nil
}

func (s *SecretGuestService) ApproveReport(ctx context.Context, staffID, reportID uuid.UUID) error {
	err := s.repo.UpdateReportStatusAsStaff(ctx, reportID, models.ReportStatusSubmitted, models.ReportStatusApproved)
	if err != nil {
		return fmt.Errorf("failed to approve report %s by staff %s: %w", reportID.String(), staffID.String(), err)
	}
	return nil
}

func (s *SecretGuestService) RejectReport(ctx context.Context, staffID, reportID uuid.UUID) error {
	err := s.repo.UpdateReportStatusAsStaff(ctx, reportID, models.ReportStatusSubmitted, models.ReportStatusRejected)
	if err != nil {
		return fmt.Errorf("failed to reject report %s by staff %s: %w", reportID.String(), staffID.String(), err)
	}
	return nil
}

// answer_types

func (s *SecretGuestService) GetAnswerTypes(ctx context.Context, dto GetAnswerTypesRequestDTO) (*AnswerTypesResponse, error) {

	filter := repository.AnswerTypesFilter{
		IDs:   dto.AnswerTypeIDs,
		Slugs: dto.AnswerTypeSlugs,
	}

	dbAnswerTypes, err := s.repo.GetAnswerTypes(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to get answer types from repository: %w", err)
	}

	responseDTOs := make([]*AnswerTypeResponse, 0, len(dbAnswerTypes))
	for _, at := range dbAnswerTypes {
		responseDTOs = append(responseDTOs, toAnswerTypeResponseDTO(at))
	}

	return &AnswerTypesResponse{AnswerTypes: responseDTOs}, nil
}

func toAnswerTypeResponseDTO(at *models.AnswerType) *AnswerTypeResponse {
	return &AnswerTypeResponse{
		ID:   at.ID,
		Slug: at.Slug,
		Name: at.Name,
		Meta: at.Meta,
	}
}

func (s *SecretGuestService) GetAnswerTypeByID(ctx context.Context, id int) (*AnswerTypeResponse, error) {
	at, err := s.repo.GetAnswerTypeByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get answer type by id from repository: %w", err)
	}
	return toAnswerTypeResponseDTO(at), nil
}

func (s *SecretGuestService) CreateAnswerType(ctx context.Context, dto CreateAnswerTypeRequestDTO) (*AnswerTypeResponse, error) {
	answerType := &models.AnswerType{
		Slug: dto.Slug,
		Name: dto.Name,
		Meta: dto.Meta,
	}

	createdAnswerType, err := s.repo.CreateAnswerType(ctx, answerType)
	if err != nil {
		return nil, fmt.Errorf("failed to create answer type in repository: %w", err)
	}

	return toAnswerTypeResponseDTO(createdAnswerType), nil
}

func (s *SecretGuestService) UpdateAnswerType(ctx context.Context, id int, dto UpdateAnswerTypeRequestDTO) (*AnswerTypeResponse, error) {

	// TO DO: Подумать о необходимости для поля "meta" иметь тип JSONB (см. хендлер UpdateAnswerType)
	updateModel := &models.AnswerType{}

	metaSetted := false

	if dto.Slug != nil {
		updateModel.Slug = *dto.Slug
	}
	if dto.Name != nil {
		updateModel.Name = *dto.Name
	}
	if dto.Meta != nil {
		metaSetted = true
		// Проверяем, хочет ли клиент именно очистить поле (передав JSON null)
		if string(*dto.Meta) == "null" {
			updateModel.Meta = nil
		} else {
			updateModel.Meta = *dto.Meta // Иначе записываем переданный JSON
		}
	}

	if err := s.repo.UpdateAnswerType(ctx, id, updateModel, metaSetted); err != nil {
		return nil, fmt.Errorf("failed to update answer type in repository: %w", err)
	}
	return s.GetAnswerTypeByID(ctx, id)
}

func (s *SecretGuestService) DeleteAnswerType(ctx context.Context, id int) error {
	return s.repo.DeleteAnswerType(ctx, id)
}

// media_requirements

func (s *SecretGuestService) GetMediaRequirements(ctx context.Context, dto GetMediaRequirementsRequestDTO) (*MediaRequirementsResponse, error) {

	filter := repository.MediaRequirementsFilter{
		IDs:   dto.MediaRequirementIDs,
		Slugs: dto.MediaRequirementSlugs,
	}

	dbMediaRequirements, err := s.repo.GetMediaRequirements(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to get media requirement from repository: %w", err)
	}

	responseDTOs := make([]*MediaRequirementResponse, 0, len(dbMediaRequirements))
	for _, at := range dbMediaRequirements {
		responseDTOs = append(responseDTOs, toMediaRequirementResponseDTO(at))
	}

	return &MediaRequirementsResponse{MediaRequirements: responseDTOs}, nil
}

func toMediaRequirementResponseDTO(at *models.MediaRequirement) *MediaRequirementResponse {
	return &MediaRequirementResponse{
		ID:   at.ID,
		Slug: at.Slug,
		Name: at.Name,
	}
}

// listing_types

func (s *SecretGuestService) GetListingTypes(ctx context.Context, dto GetListingTypesRequestDTO) (*ListingTypesResponse, error) {

	filter := repository.ListingTypesFilter{
		IDs:   dto.ListingTypeIDs,
		Slugs: dto.ListingTypeSlugs,
	}

	dbListingTypes, err := s.repo.GetListingTypes(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to get listing types from repository: %w", err)
	}

	responseDTOs := make([]*ListingTypeResponse, 0, len(dbListingTypes))
	for _, lt := range dbListingTypes {
		responseDTOs = append(responseDTOs, toListingTypeResponse(lt))
	}

	return &ListingTypesResponse{ListingTypes: responseDTOs}, nil
}

func toListingTypeResponse(lt *models.ListingType) *ListingTypeResponse {
	return &ListingTypeResponse{
		ID:   lt.ID,
		Slug: lt.Slug,
		Name: lt.Name,
	}
}

func (s *SecretGuestService) GetListingTypeByID(ctx context.Context, id int) (*ListingTypeResponse, error) {
	lt, err := s.repo.GetListingTypeByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get listing type by id from repository: %w", err)
	}
	return toListingTypeResponse(lt), nil
}

func (s *SecretGuestService) CreateListingType(ctx context.Context, dto CreateListingTypeRequestDTO) (*ListingTypeResponse, error) {
	listingType := &models.ListingType{
		Slug: dto.Slug,
		Name: dto.Name,
	}

	createdListingType, err := s.repo.CreateListingType(ctx, listingType)
	if err != nil {
		return nil, fmt.Errorf("failed to create listing type in repository: %w", err)
	}

	return toListingTypeResponse(createdListingType), nil
}

func (s *SecretGuestService) UpdateListingType(ctx context.Context, id int, dto UpdateListingTypeRequestDTO) (*ListingTypeResponse, error) {
	updateModel := &models.ListingType{}

	if dto.Slug != nil {
		updateModel.Slug = *dto.Slug
	}
	if dto.Name != nil {
		updateModel.Name = *dto.Name
	}

	if err := s.repo.UpdateListingType(ctx, id, updateModel); err != nil {
		return nil, fmt.Errorf("failed to update listing type in repository: %w", err)
	}
	return s.GetListingTypeByID(ctx, id)
}

func (s *SecretGuestService) DeleteListingType(ctx context.Context, id int) error {
	return s.repo.DeleteListingType(ctx, id)
}

// checklist_sections

func (s *SecretGuestService) GetChecklistSections(ctx context.Context, dto GetChecklistSectionsRequestDTO) (*ChecklistSectionsResponse, error) {
	filter := repository.ChecklistSectionsFilter{
		IDs:              dto.IDs,
		Slugs:            dto.Slugs,
		ListingTypeIDs:   dto.ListingTypeIDs,
		ListingTypeSlugs: dto.ListingTypeSlugs,
	}

	dbSections, err := s.repo.GetChecklistSections(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to get checklist sections from repository: %w", err)
	}

	responseDTOs := make([]*ChecklistSectionResponse, 0, len(dbSections))
	for _, section := range dbSections {
		responseDTOs = append(responseDTOs, toChecklistSectionResponse(section))
	}

	return &ChecklistSectionsResponse{ChecklistSections: responseDTOs}, nil
}

func toChecklistSectionResponse(s *models.ChecklistSection) *ChecklistSectionResponse {
	return &ChecklistSectionResponse{
		ID:              s.ID,
		Slug:            s.Slug,
		Title:           s.Title,
		SortOrder:       s.SortOrder,
		ListingTypeID:   s.ListingTypeID,
		ListingTypeSlug: s.ListingTypeSlug,
	}
}

func (s *SecretGuestService) GetChecklistSectionByID(ctx context.Context, id int) (*ChecklistSectionResponse, error) {
	cs, err := s.repo.GetChecklistSectionByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get checklist section by id from repository: %w", err)
	}
	return toChecklistSectionResponse(cs), nil
}

func (s *SecretGuestService) CreateChecklistSection(ctx context.Context, dto CreateChecklistSectionRequestDTO) (*ChecklistSectionResponse, error) {
	section := &models.ChecklistSection{
		ListingTypeID: dto.ListingTypeID,
		Slug:          dto.Slug,
		Title:         dto.Title,
		SortOrder:     dto.SortOrder,
	}

	createdSection, err := s.repo.CreateChecklistSection(ctx, section)
	if err != nil {
		return nil, fmt.Errorf("failed to create checklist section in repository: %w", err)
	}

	return toChecklistSectionResponse(createdSection), nil
}

func (s *SecretGuestService) UpdateChecklistSection(ctx context.Context, id int, dto UpdateChecklistSectionRequestDTO) (*ChecklistSectionResponse, error) {
	updateModel := &models.ChecklistSectionUpdate{}

	if dto.Slug != nil {
		updateModel.Slug = *dto.Slug
	}
	if dto.Title != nil {
		updateModel.Title = *dto.Title
	}
	if dto.SortOrder != nil {
		updateModel.SortOrder = dto.SortOrder
	}
	if dto.ListingTypeID != nil {
		updateModel.ListingTypeID = dto.ListingTypeID
	}

	if err := s.repo.UpdateChecklistSection(ctx, id, updateModel); err != nil {
		return nil, fmt.Errorf("failed to update checklist section in repository: %w", err)
	}
	return s.GetChecklistSectionByID(ctx, id)
}

func (s *SecretGuestService) DeleteChecklistSection(ctx context.Context, id int) error {
	return s.repo.DeleteChecklistSection(ctx, id)
}

// checklist_items

func (s *SecretGuestService) GetChecklistItems(ctx context.Context, dto GetChecklistItemsRequestDTO) (*ChecklistItemsResponse, error) {
	filter := repository.ChecklistItemsFilter{
		IDs:              dto.IDs,
		Slugs:            dto.Slugs,
		ListingTypeIDs:   dto.ListingTypeIDs,
		ListingTypeSlugs: dto.ListingTypeSlugs,
		IsActive:         dto.IsActive,
	}

	dbItems, err := s.repo.GetChecklistItems(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to get checklist items from repository: %w", err)
	}

	responseDTOs := make([]*ChecklistItemResponse, 0, len(dbItems))
	for _, item := range dbItems {
		responseDTOs = append(responseDTOs, toChecklistItemResponse(item))
	}

	return &ChecklistItemsResponse{ChecklistItems: responseDTOs}, nil
}

func toChecklistItemResponse(i *models.ChecklistItem) *ChecklistItemResponse {
	return &ChecklistItemResponse{
		ID:          i.ID,
		Slug:        i.Slug,
		Title:       i.Title,
		Description: i.Description,
		Section: ChecklistItemSectionInfo{
			ID:        i.SectionID,
			Slug:      i.SectionSlug,
			Title:     i.SectionTitle,
			SortOrder: i.SectionSortOrder,
		},
		SortOrder: i.SortOrder,
		AnswerType: ChecklistItemAnswerTypeInfo{
			ID:   i.AnswerTypeID,
			Slug: i.AnswerTypeSlug,
			Name: i.AnswerTypeName,
			Meta: i.AnswerTypeMeta,
		},
		MediaRequirement: ChecklistItemMediaRequirementInfo{
			ID:   i.MediaRequirementID,
			Slug: i.MediaRequirementSlug,
			Name: i.MediaRequirementName,
		},
		MediaAllowedTypes: i.MediaAllowedTypes,
		MediaMaxFiles:     i.MediaMaxFiles,
		ListingTypeID:     i.ListingTypeID,
		ListingTypeSlug:   i.ListingTypeSlug,
		IsActive:          i.IsActive,
	}
}

func (s *SecretGuestService) GetChecklistItemByID(ctx context.Context, id int) (*ChecklistItemResponse, error) {
	item, err := s.repo.GetChecklistItemByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get checklist item by id from repository: %w", err)
	}
	return toChecklistItemResponse(item), nil
}

func (s *SecretGuestService) CreateChecklistItem(ctx context.Context, dto CreateChecklistItemRequestDTO) (*ChecklistItemResponse, error) {
	item := &models.ChecklistItem{
		ListingTypeID:      dto.ListingTypeID,
		SectionID:          dto.SectionID,
		AnswerTypeID:       dto.AnswerTypeID,
		MediaRequirementID: dto.MediaRequirementID,
		Slug:               dto.Slug,
		Title:              dto.Title,
		Description:        dto.Description,
		MediaAllowedTypes:  dto.MediaAllowedTypes,
		MediaMaxFiles:      dto.MediaMaxFiles,
		SortOrder:          dto.SortOrder,
	}

	if dto.IsActive != nil {
		item.IsActive = *dto.IsActive
	} else {
		item.IsActive = true // Default to true
	}

	createdItem, err := s.repo.CreateChecklistItem(ctx, item)
	if err != nil {
		return nil, fmt.Errorf("failed to create checklist item in repository: %w", err)
	}

	return toChecklistItemResponse(createdItem), nil
}

func (s *SecretGuestService) UpdateChecklistItem(ctx context.Context, id int, dto UpdateChecklistItemRequestDTO) (*ChecklistItemResponse, error) {
	updateModel := &models.ChecklistItemUpdate{
		ListingTypeID:      dto.ListingTypeID,
		SectionID:          dto.SectionID,
		AnswerTypeID:       dto.AnswerTypeID,
		MediaRequirementID: dto.MediaRequirementID,
		Slug:               dto.Slug,
		Title:              dto.Title,
		Description:        dto.Description,
		MediaAllowedTypes:  dto.MediaAllowedTypes,
		MediaMaxFiles:      dto.MediaMaxFiles,
		SortOrder:          dto.SortOrder,
		IsActive:           dto.IsActive,
	}

	if err := s.repo.UpdateChecklistItem(ctx, id, updateModel); err != nil {
		return nil, fmt.Errorf("failed to update checklist item in repository: %w", err)
	}
	return s.GetChecklistItemByID(ctx, id)
}

func (s *SecretGuestService) DeleteChecklistItem(ctx context.Context, id int) error {
	err := s.repo.DeleteChecklistItem(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to delete checklist item in repository: %w", err)
	}
	return nil
}

// users

func (s *SecretGuestService) GetAllUsers(ctx context.Context, dto GetAllUsersRequestDTO) (*UsersResponse, error) {

	offset := (dto.Page - 1) * dto.Limit

	dbUsers, total, err := s.repo.GetAllUsers(ctx, dto.Limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get users from repository: %w", err)
	}

	responseDTOs := make([]*UserResponseDTO, 0, len(dbUsers))
	for _, u := range dbUsers {
		responseDTOs = append(responseDTOs, toUserResponseDTO(u))
	}

	response := &UsersResponse{
		Users: responseDTOs,
		Total: total,
		Page:  dto.Page,
	}
	return response, nil
}

func toUserResponseDTO(u *models.User) *UserResponseDTO {
	if u == nil {
		return nil
	}

	var email *string
	if u.Email != "" {
		email = &u.Email
	}

	return &UserResponseDTO{
		ID:        u.ID,
		Username:  u.Username,
		Email:     email,
		RoleID:    u.RoleID,
		RoleName:  u.RoleName,
		CreatedAt: u.CreatedAt,
	}
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// Генерация схемы отчета

func (s *SecretGuestService) generateChecklistSchemaForReport(ctx context.Context, report *models.Report) {
	s.wg.Add(1)
	go func() {
		defer s.wg.Done()

		bgCtx := context.Background()
		bgCtx = logger.ContextWithLogger(bgCtx, logger.GetLoggerFromCtx(ctx))
		log := logger.GetLoggerFromCtx(bgCtx)

		taskCtx, cancel := context.WithTimeout(bgCtx, 1*time.Minute)
		defer cancel()

		log.Info(taskCtx, "Starting background generation of checklist schema", zap.String("report_id", report.ID.String()))

		// Вспомогательная функция для обработки сбоев
		handleFailure := func(err error, message string) {
			log.Error(taskCtx, message, zap.Error(err), zap.String("report_id", report.ID.String()))

			updateErr := s.repo.UpdateReportStatusAsStaff(taskCtx, report.ID, models.ReportStatusGenerating, models.ReportStatusGenerationFailed)
			if updateErr != nil {
				log.Error(taskCtx, "Failed to update report status to generation_failed", zap.Error(updateErr), zap.String("report_id", report.ID.String()))
			}
		}

		listingTypeID, err := s.repo.GetListingTypeID(taskCtx, report.ListingID)
		if err != nil {
			handleFailure(err, "Failed to get listing type ID for schema generation")
			return
		}

		dbSections, dbItems, err := s.repo.GetChecklistTemplate(taskCtx, listingTypeID)
		if err != nil {
			handleFailure(err, "Failed to get checklist template from repo")
			return
		}

		itemsBySection := make(map[int][]*ItemSchema)
		for _, dbItem := range dbItems {
			answer := &Answer{}
			item := &ItemSchema{
				ID:          dbItem.ID,
				Slug:        dbItem.Slug,
				Title:       dbItem.Title,
				Description: dbItem.Description,
				AnswerTypes: &AnswerTypesSchema{
					Slug: dbItem.AnswerTypeSlug,
					Name: dbItem.AnswerTypeName,
					Meta: dbItem.AnswerTypeMeta,
				},
				MediaRequirement: dbItem.MediaRequirementSlug,
				SortOrder:        dbItem.SortOrder,
				Answer:           answer,
			}

			emptyString := ""
			answer.Result = &emptyString
			answer.Comment = &emptyString

			if dbItem.MediaRequirementSlug != models.MediaRequirementNone {
				item.MediaAllowedTypes = dbItem.MediaAllowedTypes
				maxFiles := dbItem.MediaMaxFiles
				item.MediaMaxFiles = &maxFiles
				answer.Media = []*MediaFile{}
			}

			itemsBySection[dbItem.SectionID] = append(itemsBySection[dbItem.SectionID], item)
		}

		// Собираем секции, добавляя в них сгруппированные пункты
		schemaSections := make([]*SectionSchema, 0, len(dbSections))
		for _, dbSection := range dbSections {
			section := &SectionSchema{
				ID:        dbSection.ID,
				Slug:      dbSection.Slug,
				Title:     dbSection.Title,
				SortOrder: dbSection.SortOrder,
				Items:     itemsBySection[dbSection.ID],
			}
			schemaSections = append(schemaSections, section)
		}

		finalSchema := &ChecklistSchema{
			Version:  "1.0",
			Sections: schemaSections,
		}

		schemaBytes, err := json.Marshal(finalSchema)
		if err != nil {
			handleFailure(err, "Failed to marshal checklist schema to JSON")
			return
		}

		// для мапы
		var schemaForDB models.ChecklistSchema
		if err := json.Unmarshal(schemaBytes, &schemaForDB); err != nil {
			handleFailure(err, "Failed to unmarshal checklist schema to map for DB")
			return
		}
		if err := s.repo.UpdateReportSchema(taskCtx, report.ID, schemaForDB); err != nil {
			handleFailure(err, "Failed to save checklist schema to DB")
			return
		}

		// Всё ОК, установим 'draft'
		if err := s.repo.UpdateReportStatusAsStaff(taskCtx, report.ID, models.ReportStatusGenerating, models.ReportStatusDraft); err != nil {
			log.Error(taskCtx, "Failed to update report status to draft after schema generation", zap.Error(err))
			// В этом случае не вызываем handleFailure, так как схема уже сохранена.
			// Это критическая ошибка, которую нужно мониторить, но отчет уже не в 'generating'.
			return
		}

		log.Info(taskCtx, "Checklist schema generated and saved successfully", zap.String("report_id", report.ID.String()))
	}()
}

// Загрузка файлов

func (s *SecretGuestService) GenerateUploadURL(ctx context.Context, userID uuid.UUID, dto GenerateUploadURLRequest) (*GenerateUploadURLResponse, error) {

	log := logger.GetLoggerFromCtx(ctx)

	// TO DO: Хз, нужно ли нам? Оставил для универсальности
	params := storage.UploadParams{
		FileName: dto.FileName,
		Path:     fmt.Sprintf("users/%s", userID.String()), // Файлы по папкам пользователей
		UserID:   userID.String(),
	}

	uploadData, err := s.storageProvider.GenerateUploadURL(ctx, params)
	if err != nil {
		log.Error(ctx, "Failed to generate upload URL from storage provider", zap.Error(err))
		return nil, fmt.Errorf("could not generate upload URL: %w", err)
	}

	return toGenerateUploadURLResponseDTO(uploadData), nil
}

func toGenerateUploadURLResponseDTO(s *storage.UploadResponse) *GenerateUploadURLResponse {
	if s == nil {
		return nil
	}

	return &GenerateUploadURLResponse{
		UploadURL: s.UploadURL,
		Method:    s.Method,
		FormData:  UploadFormDataDTO(s.FormData),
		Headers:   s.Headers,
	}
}
