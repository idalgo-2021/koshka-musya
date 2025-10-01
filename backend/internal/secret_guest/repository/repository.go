package repository

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/ostrovok-hackathon-2025/koshka-musya/internal/models"
	"github.com/ostrovok-hackathon-2025/koshka-musya/pkg/logger"

	"go.uber.org/zap"
)

type SecretGuestRepository struct {
	db *pgxpool.Pool
}

func NewListingRepository(db *pgxpool.Pool) *SecretGuestRepository {
	return &SecretGuestRepository{db: db}
}

// listings
func (r *SecretGuestRepository) CreateListing(ctx context.Context, listing *models.Listing) (uuid.UUID, error) {

	log := logger.GetLoggerFromCtx(ctx)

	query := `
		INSERT INTO listings (
			code,
			title,
			description,
			listing_type_id,
			address,
			city,
			country,
			latitude,
			longitude,
			main_picture
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9 ,$10)
		RETURNING id;
	`

	row := r.db.QueryRow(ctx, query,
		listing.Code,
		listing.Title,
		listing.Description,
		listing.ListingTypeID,
		listing.Address,
		listing.City,
		listing.Country,
		listing.Latitude,
		listing.Longitude,
		listing.MainPicture,
	)

	var id uuid.UUID
	if err := row.Scan(&id); err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			if strings.Contains(pgErr.ConstraintName, "listings_code_uniq_key") {
				log.Warn(ctx, "Attempt to register listing with existent code", zap.String("code", listing.Code.String()))
				return id, models.ErrListingCannotBeCreated
			}
		}

		return id, err
	}

	return id, nil
}

type ListingsFilter struct {
	ListingTypeIDs []int
	Limit          int
	Offset         int
}

func buildListingWhereClause(filter ListingsFilter) (string, []interface{}, int) {
	conditions := []string{}
	args := []interface{}{}
	paramCount := 1

	if len(filter.ListingTypeIDs) > 0 {
		placeholders := make([]string, len(filter.ListingTypeIDs))
		for i, id := range filter.ListingTypeIDs {
			placeholders[i] = fmt.Sprintf("$%d", paramCount)
			args = append(args, id)
			paramCount++
		}
		conditions = append(conditions, fmt.Sprintf("l.listing_type_id IN (%s)", strings.Join(placeholders, ",")))
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = " WHERE " + strings.Join(conditions, " AND ")
	}

	return whereClause, args, paramCount
}

func (r *SecretGuestRepository) GetListings(ctx context.Context, filter ListingsFilter) ([]*models.Listing, int, error) {
	log := logger.GetLoggerFromCtx(ctx)

	whereClause, args, paramCount := buildListingWhereClause(filter)

	countQuery := "SELECT COUNT(*) FROM listings l" + whereClause
	var total int
	if err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total); err != nil {
		log.Error(ctx, "Failed to query total active listings count", zap.Error(err))
		return nil, 0, err
	}
	if total == 0 {
		return []*models.Listing{}, 0, nil
	}

	query := `
		SELECT
			l.id, l.code, l.title, l.description, l.main_picture, l.listing_type_id, l.address, l.city, l.country,
			l.latitude, l.longitude, l.created_at,
			lt.id as "listing_type.id",
			lt.slug as "listing_type.slug",
			lt.name as "listing_type.name"
		FROM listings l
		JOIN listing_types lt ON l.listing_type_id = lt.id
	`

	query += whereClause
	query += fmt.Sprintf(" ORDER BY l.created_at DESC LIMIT $%d OFFSET $%d", paramCount, paramCount+1)

	finalArgs := append(args, filter.Limit, filter.Offset)

	rows, err := r.db.Query(ctx, query, finalArgs...)
	if err != nil {
		log.Error(ctx, "Failed to query active listings with join", zap.Error(err))
		return nil, total, err
	}
	defer rows.Close()

	listings := make([]*models.Listing, 0)
	for rows.Next() {
		var l models.Listing
		if err := rows.Scan(
			&l.ID, &l.Code, &l.Title, &l.Description, &l.MainPicture, &l.ListingTypeID, &l.Address, &l.City, &l.Country,
			&l.Latitude, &l.Longitude, &l.CreatedAt,
			&l.ListingType.ID, &l.ListingType.Slug, &l.ListingType.Name,
		); err != nil {
			log.Error(ctx, "Failed to scan listing row with join", zap.Error(err))
			return nil, total, err
		}
		listings = append(listings, &l)
	}

	if err := rows.Err(); err != nil {
		log.Error(ctx, "Error after iterating over listing rows", zap.Error(err))
		return nil, total, err
	}

	return listings, total, nil
}

func (r *SecretGuestRepository) GetListingByID(ctx context.Context, id uuid.UUID) (*models.Listing, error) {

	log := logger.GetLoggerFromCtx(ctx)

	query := `
		SELECT
			l.id, l.code, l.title, l.description, l.main_picture, l.listing_type_id, l.address, l.city, l.country,
			l.latitude, l.longitude, l.created_at,
			lt.id as "listing_type.id",
			lt.slug as "listing_type.slug",
			lt.name as "listing_type.name"
		FROM listings l
		JOIN listing_types lt ON l.listing_type_id = lt.id
		WHERE l.id = $1;
	`
	var l models.Listing
	err := r.db.QueryRow(ctx, query, id).Scan(
		&l.ID, &l.Code, &l.Title, &l.Description, &l.MainPicture, &l.ListingTypeID, &l.Address, &l.City, &l.Country,
		&l.Latitude, &l.Longitude, &l.CreatedAt,
		&l.ListingType.ID, &l.ListingType.Slug, &l.ListingType.Name,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			log.Info(ctx, "Listing not found by ID in DB", zap.String("listing_id", id.String()))
			return nil, models.ErrListingNotFound
		}

		log.Error(ctx, "Failed to query listing by ID",
			zap.Error(err),
			zap.String("listing_id", id.String()),
		)
		return nil, err
	}

	return &l, nil
}

func (r *SecretGuestRepository) GetListingByCode(ctx context.Context, code uuid.UUID) (*models.Listing, error) {
	log := logger.GetLoggerFromCtx(ctx)

	query := `
		SELECT
			l.id, l.code, l.title, l.description, l.main_picture, l.listing_type_id, l.address, l.city, l.country,
			l.latitude, l.longitude, l.created_at,
			lt.id as "listing_type.id",
			lt.slug as "listing_type.slug",
			lt.name as "listing_type.name"
		FROM listings l
		JOIN listing_types lt ON l.listing_type_id = lt.id
		WHERE l.code = $1;
	`
	var l models.Listing
	err := r.db.QueryRow(ctx, query, code).Scan(
		&l.ID, &l.Code, &l.Title, &l.Description, &l.MainPicture, &l.ListingTypeID, &l.Address, &l.City, &l.Country,
		&l.Latitude, &l.Longitude, &l.CreatedAt,
		&l.ListingType.ID, &l.ListingType.Slug, &l.ListingType.Name,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			log.Info(ctx, "Listing not found by code in DB", zap.String("code", code.String()))
			return nil, models.ErrListingNotFound
		}

		log.Error(ctx, "Failed to query listing by code",
			zap.Error(err),
			zap.String("code", code.String()),
		)
		return nil, err
	}

	return &l, nil
}

// reservations
type OTAReservationsFilter struct {
	StatusIDs []int
	Limit     int
	Offset    int
}

func buildOTAReservationsWhereClause(filter OTAReservationsFilter) (string, []interface{}, int) {
	conditions := []string{}
	args := []interface{}{}
	paramCount := 1

	if len(filter.StatusIDs) > 0 {
		placeholders := make([]string, len(filter.StatusIDs))
		for i, id := range filter.StatusIDs {
			placeholders[i] = fmt.Sprintf("$%d", paramCount)
			args = append(args, id)
			paramCount++
		}
		conditions = append(conditions, fmt.Sprintf("r.status_id IN (%s)", strings.Join(placeholders, ",")))
	}

	whereClause := strings.Join(conditions, " AND ")

	return whereClause, args, paramCount
}

func (r *SecretGuestRepository) scanOTAReservation(row pgx.Row) (*models.OTAReservation, error) {
	var rs models.OTAReservation
	if err := row.Scan(
		&rs.ID,
		&rs.OTAID,
		&rs.BookingNumber,
		&rs.ListingID,
		&rs.CheckinDate,
		&rs.CheckoutDate,
		&rs.StatusID,
		&rs.Status.Slug,
		&rs.Status.Name,
		&rs.Pricing,
		&rs.Guests,
	); err != nil {
		return nil, err
	}

	rs.Status.ID = rs.StatusID

	return &rs, nil
}

func (r *SecretGuestRepository) CreateOTAReservation(ctx context.Context, reservation *models.OTAReservation) (uuid.UUID, error) {
	query := `
		INSERT INTO ota_sg_reservations (ota_id, booking_number, listing_id, checkin_date, checkout_date, pricing, status_id, source_msg, guests)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id;
	`

	row := r.db.QueryRow(ctx, query,
		reservation.OTAID,
		reservation.BookingNumber,
		reservation.ListingID,
		reservation.CheckinDate,
		reservation.CheckoutDate,
		reservation.Pricing,
		reservation.StatusID,
		reservation.SourceMsg,
		reservation.Guests,
	)

	var id uuid.UUID
	if err := row.Scan(&id); err != nil {
		return id, err
	}

	return id, nil
}

func (r *SecretGuestRepository) GetOTAReservations(ctx context.Context, filter OTAReservationsFilter) ([]*models.OTAReservation, int, error) {
	log := logger.GetLoggerFromCtx(ctx)

	whereClause, args, _ := buildOTAReservationsWhereClause(filter)

	countQuery := `
		SELECT COUNT(r.id) FROM ota_sg_reservations r
		JOIN ota_sg_reservation_statuses s ON r.status_id = s.id
	`
	if whereClause != "" {
		countQuery += " WHERE " + whereClause
	}

	var total int
	if err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total); err != nil {
		log.Error(ctx, "Failed to query total OTA reservations count", zap.Error(err), zap.Any("filter", filter))
		return nil, 0, err
	}

	if total == 0 {
		return []*models.OTAReservation{}, 0, nil
	}

	baseQuery := `
		SELECT r.id, r.ota_id, r.booking_number, r.listing_id, r.checkin_date, r.checkout_date, r.status_id,
			s.slug as "status_slug", s.name as "status_name", r.pricing, r.guests
		FROM ota_sg_reservations r
		JOIN ota_sg_reservation_statuses s ON r.status_id = s.id
	`

	query := baseQuery
	if whereClause != "" {
		query += " WHERE " + whereClause
	}

	query += fmt.Sprintf(" ORDER BY r.created_at DESC LIMIT %d OFFSET %d", filter.Limit, filter.Offset)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		log.Error(ctx, "Failed to query reservations with filter", zap.Error(err), zap.Any("filter", filter))
		return nil, 0, err
	}
	defer rows.Close()

	reservations := make([]*models.OTAReservation, 0, filter.Limit)

	for rows.Next() {
		var r models.OTAReservation
		if err := rows.Scan(
			&r.ID,
			&r.OTAID,
			&r.BookingNumber,
			&r.ListingID,
			&r.CheckinDate,
			&r.CheckoutDate,
			&r.StatusID,
			&r.Status.Slug,
			&r.Status.Name,
			&r.Pricing,
			&r.Guests,
		); err != nil {
			log.Error(ctx, "Failed to scan reservation row", zap.Error(err))
			// Прерываем выполнение, так как ошибка сканирования может указывать на серьезную проблему.
			return nil, total, err
		}

		r.Status.ID = r.StatusID

		reservations = append(reservations, &r)
	}

	if err := rows.Err(); err != nil {
		log.Error(ctx, "Error after iterating over reservation rows", zap.Error(err))
		return nil, total, err
	}

	return reservations, total, nil
}

func (r *SecretGuestRepository) GetOTAReservationByID(ctx context.Context, ReservationID uuid.UUID) (*models.OTAReservation, error) {
	log := logger.GetLoggerFromCtx(ctx)

	query := `
		SELECT r.id, r.ota_id, r.booking_number, r.listing_id, r.checkin_date, r.checkout_date, r.status_id,
			s.slug as "status_slug", s.name as "status_name", r.pricing, r.guests
		FROM ota_sg_reservations r
		JOIN ota_sg_reservation_statuses s ON r.status_id = s.id
		WHERE r.id = $1
	`
	row := r.db.QueryRow(ctx, query, ReservationID)

	reservation, err := r.scanOTAReservation(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			log.Info(ctx, "OTA reservation not found by ID", zap.String("reservation_id", ReservationID.String()))
			return nil, models.ErrOTAReservationNotFound
		}
		log.Error(ctx, "Failed to query OTA reservation by ID", zap.Error(err), zap.String("reservation_id", ReservationID.String()))
		return nil, err
	}

	return reservation, nil
}

func (r *SecretGuestRepository) UpdateOTAReservationStatus(ctx context.Context, reservationID uuid.UUID, statusID int) error {
	log := logger.GetLoggerFromCtx(ctx)

	query := `UPDATE ota_sg_reservations SET status_id = $1 WHERE id = $2`

	ct, err := r.db.Exec(ctx, query, statusID, reservationID)
	if err != nil {
		log.Error(ctx, "Failed to update OTA reservation status", zap.Error(err), zap.String("reservation_id", reservationID.String()))
		return err
	}

	if ct.RowsAffected() == 0 {
		log.Warn(ctx, "Attempt to update reservation status failed: reservation not found",
			zap.String("reservation_id", reservationID.String()),
		)
		return models.ErrOTAReservationNotFound
	}

	return nil
}

// assignments

type AssignmentsFilter struct {
	AssignmentID   *uuid.UUID
	ReporterID     *uuid.UUID
	StatusIDs      []int
	ListingTypeIDs []int
	Limit          int
	Offset         int
	City           string
}

func buildAssignmentWhereClause(filter AssignmentsFilter) (string, []interface{}, int) {
	conditions := []string{}
	args := []interface{}{}
	paramCount := 1

	if filter.AssignmentID != nil {
		conditions = append(conditions, fmt.Sprintf("a.id = $%d", paramCount))
		args = append(args, *filter.AssignmentID)
		paramCount++
	}

	if filter.ReporterID != nil {
		conditions = append(conditions, fmt.Sprintf("a.reporter_id = $%d", paramCount))
		args = append(args, *filter.ReporterID)
		paramCount++
	}

	if len(filter.StatusIDs) > 0 {
		placeholders := make([]string, 0, len(filter.StatusIDs))
		for _, id := range filter.StatusIDs {
			placeholders = append(placeholders, fmt.Sprintf("$%d", paramCount))
			args = append(args, id)
			paramCount++
		}
		conditions = append(conditions,
			fmt.Sprintf("a.status_id IN (%s)", strings.Join(placeholders, ",")),
		)
	}

	if len(filter.ListingTypeIDs) > 0 {
		placeholders := make([]string, 0, len(filter.ListingTypeIDs))
		for _, id := range filter.ListingTypeIDs {
			placeholders = append(placeholders, fmt.Sprintf("$%d", paramCount))
			args = append(args, id)
			paramCount++
		}
		conditions = append(conditions,
			fmt.Sprintf("l.listing_type_id IN (%s)", strings.Join(placeholders, ",")),
		)
	}

	whereClause := strings.Join(conditions, " AND ")
	return whereClause, args, paramCount
}

func (r *SecretGuestRepository) scanAssignment(row pgx.Row) (*models.Assignment, error) {
	var a models.Assignment
	if err := row.Scan(
		&a.ID,

		&a.OtaSgReservationID,
		&a.Pricing,
		&a.Guests,
		&a.CheckinDate,
		&a.CheckoutDate,

		&a.ListingID, &a.ReporterID, &a.StatusID,

		&a.Purpose,
		&a.CreatedAt,
		&a.ExpiresAt,
		&a.AcceptedAt,

		&a.TakedAt,

		&a.Listing.ID,
		&a.Listing.Code,
		&a.Listing.Title,
		&a.Listing.Description,
		&a.Listing.MainPicture,

		&a.Listing.ListingTypeID, &a.Listing.ListingTypeSlug, &a.Listing.ListingTypeName,

		&a.Listing.Address, &a.Listing.City, &a.Listing.Country,
		&a.Listing.Latitude, &a.Listing.Longitude,

		&a.Reporter.Username,

		&a.Status.Slug,
		&a.Status.Name,
	); err != nil {
		return nil, err
	}

	a.Listing.ID = a.ListingID
	a.Reporter.ID = a.ReporterID
	a.Status.ID = a.StatusID

	return &a, nil
}

func (r *SecretGuestRepository) CreateAssignment(ctx context.Context, assignment *models.Assignment) (uuid.UUID, error) {
	log := logger.GetLoggerFromCtx(ctx)

	query := `
		INSERT INTO assignments (
			ota_sg_reservation_id,
			pricing,
			guests,
			checkin_date,
			checkout_date,

			listing_id,
			purpose,
			created_at,
			expires_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id;
	`

	row := r.db.QueryRow(ctx, query,
		assignment.OtaSgReservationID,
		assignment.Pricing,
		assignment.Guests,
		assignment.CheckinDate,
		assignment.CheckoutDate,

		assignment.ListingID,
		assignment.Purpose,
		assignment.CreatedAt,
		assignment.ExpiresAt,
	)

	var id uuid.UUID
	if err := row.Scan(&id); err != nil {
		log.Error(ctx, "Failed to create assignment", zap.Error(err),
			zap.Any("assignment", assignment))
		return uuid.UUID{}, err
	}

	return id, nil
}

func (r *SecretGuestRepository) GetAssignments(ctx context.Context, filter AssignmentsFilter) ([]*models.Assignment, int, error) {

	log := logger.GetLoggerFromCtx(ctx)

	whereClause, args, paramCount := buildAssignmentWhereClause(filter)
	countQuery := `
		SELECT COUNT(a.id)
		FROM assignments a
		JOIN assignment_statuses s ON a.status_id = s.id
	`

	if len(filter.ListingTypeIDs) > 0 {
		countQuery += " JOIN listings l ON a.listing_id = l.id "
	}

	if whereClause != "" {
		countQuery += " WHERE " + whereClause
	}

	//
	var total int
	if err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total); err != nil {
		log.Error(ctx, "Failed to query total assignments count", zap.Error(err), zap.Any("filter", filter))
		return nil, 0, err
	}

	if total == 0 {
		return []*models.Assignment{}, 0, nil
	}

	baseQuery := `
		SELECT
			a.id,

			a.ota_sg_reservation_id,
			a.pricing,
			a.guests,
			a.checkin_date,
			a.checkout_date,

			a.listing_id, a.reporter_id, a.status_id,
			a.purpose,
			a.created_at,
			a.expires_at,
			a.accepted_at,

			a.taked_at,

			l.code as "listing_code",
			l.title as "listing_title",
			l.description as "listing_description",

			l.main_picture as "listing_main_picture",
			l.listing_type_id,

			lt.slug as "listing_type_slug",
			lt.name as "listing_type_name",

			l.address as "listing_address",
			l.city as "listing_city",
			l.country as "listing_country",

			l.latitude as "listing_latitude",
			l.longitude as "listing_longitude",

			COALESCE(u.username, '') as reporter_username,

			s.slug as "status_slug",
			s.name as "status_name"

		FROM assignments a
		JOIN listings l ON a.listing_id = l.id
		LEFT JOIN users u ON a.reporter_id = u.id
		JOIN listing_types lt ON l.listing_type_id = lt.id
		JOIN assignment_statuses s ON a.status_id = s.id
	`

	query := baseQuery
	if whereClause != "" {
		query += " WHERE " + whereClause
	}

	if len(filter.City) > 0 {
		query += fmt.Sprintf(" AND l.city ILIKE $%d ", paramCount)
		args = append(args, filter.City)
		paramCount++
	}
	query += fmt.Sprintf(" ORDER BY a.created_at DESC LIMIT $%d OFFSET $%d", paramCount, paramCount+1)
	args = append(args, filter.Limit, filter.Offset)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
        log.Error(ctx, "Failed to query assignments with filter", zap.Error(err), zap.Any("filter", filter))
		return nil, 0, err
	}
	defer rows.Close()

	assignments := make([]*models.Assignment, 0, filter.Limit)

	for rows.Next() {
		var a models.Assignment
		if err := rows.Scan(
			&a.ID,

			&a.OtaSgReservationID,
			&a.Pricing,
			&a.Guests,
			&a.CheckinDate,
			&a.CheckoutDate,

			&a.ListingID, &a.ReporterID, &a.StatusID,
			&a.Purpose,
			&a.CreatedAt,
			&a.ExpiresAt,
			&a.AcceptedAt,

			&a.TakedAt,

			&a.Listing.Code,
			&a.Listing.Title,
			&a.Listing.Description,

			&a.Listing.MainPicture,
			&a.Listing.ListingTypeID,
			&a.Listing.ListingTypeSlug,
			&a.Listing.ListingTypeName,

			&a.Listing.Address, &a.Listing.City, &a.Listing.Country,
			&a.Listing.Latitude,
			&a.Listing.Longitude,

			&a.Reporter.Username,

			&a.Status.Slug,
			&a.Status.Name,
		); err != nil {
			log.Error(ctx, "Failed to scan assignment row", zap.Error(err))
			// Прерываем выполнение, так как ошибка сканирования может указывать на серьезную проблему.
			return nil, total, err
		}

		a.Listing.ID = a.ListingID
		a.Reporter.ID = a.ReporterID
		a.Status.ID = a.StatusID

		assignments = append(assignments, &a)
	}

	if err := rows.Err(); err != nil {
		log.Error(ctx, "Error after iterating over assignment rows", zap.Error(err))
		return nil, total, err
	}

	return assignments, total, nil
}

func (r *SecretGuestRepository) GetFreeAssignments(ctx context.Context, filter AssignmentsFilter) ([]*models.Assignment, int, error) {
	log := logger.GetLoggerFromCtx(ctx)

	whereClause, args, paramCount := buildAssignmentWhereClause(filter)

	if whereClause != "" {
		whereClause += " AND "
	}

	whereClause += "a.reporter_id IS NULL"

	countQuery := `
		SELECT COUNT(a.id)
		FROM assignments a
		JOIN assignment_statuses s ON a.status_id = s.id
	`
	if len(filter.ListingTypeIDs) > 0 {
		countQuery += " JOIN listings l ON a.listing_id = l.id "
	}

	if whereClause != "" {
		countQuery += " WHERE " + whereClause
	}

	var total int
	if err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total); err != nil {
		log.Error(ctx, "Failed to query total free assignments count", zap.Error(err), zap.Any("filter", filter))
		return nil, 0, err
	}

	if total == 0 {
		return []*models.Assignment{}, 0, nil
	}

	baseQuery := `
		SELECT
			a.id,

			a.ota_sg_reservation_id,
			a.pricing,
			a.guests,
			a.checkin_date,
			a.checkout_date,

			a.listing_id, a.reporter_id, a.status_id,
			a.purpose,
			a.created_at,
			a.expires_at,
			a.accepted_at,

			a.taked_at,

			l.id,
			l.code as "listing_code",
			l.title as "listing_title",
			l.description as "listing_description",

			l.main_picture as "listing_main_picture",
			l.listing_type_id,

			lt.slug as "listing_type_slug",
			lt.name as "listing_type_name",

			l.address as "listing_address",
			l.city as "listing_city",
			l.country as "listing_country",

			l.latitude as "listing_latitude",
			l.longitude as "listing_longitude",

			COALESCE(u.username, '') as reporter_username,

			s.slug as "status_slug",
			s.name as "status_name"

		FROM assignments a
		JOIN listings l ON a.listing_id = l.id
		LEFT JOIN users u ON a.reporter_id = u.id
		JOIN listing_types lt ON l.listing_type_id = lt.id
		JOIN assignment_statuses s ON a.status_id = s.id
	`

	query := baseQuery
	if whereClause != "" {
		query += " WHERE " + whereClause
	}

	query += fmt.Sprintf(" ORDER BY a.created_at DESC LIMIT $%d OFFSET $%d", paramCount, paramCount+1)
	args = append(args, filter.Limit, filter.Offset)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		log.Error(ctx, "Failed to query free assignments", zap.Error(err), zap.Any("filter", filter))
		return nil, 0, err
	}
	defer rows.Close()

	assignments := make([]*models.Assignment, 0, filter.Limit)

	for rows.Next() {
		var a models.Assignment
		if err := rows.Scan(
			&a.ID,

			&a.OtaSgReservationID,
			&a.Pricing,
			&a.Guests,
			&a.CheckinDate,
			&a.CheckoutDate,

			&a.ListingID, &a.ReporterID, &a.StatusID,
			&a.Purpose,
			&a.CreatedAt,
			&a.ExpiresAt,
			&a.AcceptedAt,

			&a.TakedAt,

			&a.Listing.ID,
			&a.Listing.Code,
			&a.Listing.Title,
			&a.Listing.Description,

			&a.Listing.MainPicture,
			&a.Listing.ListingTypeID,
			&a.Listing.ListingTypeSlug,
			&a.Listing.ListingTypeName,

			&a.Listing.Address, &a.Listing.City, &a.Listing.Country,
			&a.Listing.Latitude,
			&a.Listing.Longitude,

			&a.Reporter.Username,

			&a.Status.Slug,
			&a.Status.Name,
		); err != nil {
			log.Error(ctx, "Failed to scan free assignment row", zap.Error(err))
			return nil, total, err
		}

		a.Listing.ID = a.ListingID
		a.Reporter.ID = a.ReporterID
		a.Status.ID = a.StatusID

		assignments = append(assignments, &a)
	}

	if err := rows.Err(); err != nil {
		log.Error(ctx, "Error after iterating over free assignment rows", zap.Error(err))
		return nil, total, err
	}

	return assignments, total, nil
}

func (r *SecretGuestRepository) GetAssignmentByID(ctx context.Context, assignmentID uuid.UUID) (*models.Assignment, error) {
	log := logger.GetLoggerFromCtx(ctx)
	query := `
		SELECT
			a.id,

			a.ota_sg_reservation_id,
			a.pricing,
			a.guests,
			a.checkin_date,
			a.checkout_date,

			a.listing_id, a.reporter_id, a.status_id,
			a.purpose, a.created_at, a.expires_at, a.accepted_at,
			a.taked_at,

			l.id,
			l.code as "listing_code",

			l.title as "listing_title",
			l.description as "listing_description",
			l.main_picture as "listing_main_picture",

			l.listing_type_id,
			lt.slug as "listing_type_slug",
			lt.name as "listing_type_name",

			l.address as "listing_address", l.city as "listing_city", l.country as "listing_country",
			l.latitude as "listing_latitude", l.longitude as "listing_longitude",

			COALESCE(u.username, '') as reporter_username,

			s.slug as "status_slug", s.name as "status_name"
		FROM assignments a
		JOIN listings l ON a.listing_id = l.id
		LEFT JOIN users u ON a.reporter_id = u.id
		JOIN listing_types lt ON l.listing_type_id = lt.id
		JOIN assignment_statuses s ON a.status_id = s.id
		WHERE a.id = $1
	`
	row := r.db.QueryRow(ctx, query, assignmentID)
	assignment, err := r.scanAssignment(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			log.Info(ctx, "Assignment not found by ID", zap.String("assignment_id", assignmentID.String()))
			return nil, models.ErrAssignmentNotFound
		}
		log.Error(ctx, "Failed to query assignment by ID", zap.Error(err), zap.String("assignment_id", assignmentID.String()))
		return nil, err
	}
	return assignment, nil
}

func (r *SecretGuestRepository) CancelAssignment(ctx context.Context, assignmentID uuid.UUID) error {
	log := logger.GetLoggerFromCtx(ctx)

	updateQuery := `
		UPDATE assignments SET status_id = $1 WHERE id = $2
	`

	ct, err := r.db.Exec(ctx, updateQuery,
		models.AssignmentStatusCancelled, // new assignment status
		assignmentID,
	)

	if err != nil {
		log.Error(ctx, "DB error on cancelling assignment",
			zap.Error(err),
			zap.String("assignment_id", assignmentID.String()),
		)
		return err
	}

	if ct.RowsAffected() == 0 {
		log.Warn(ctx, "Attempt to cancel assignment failed: assignment not found",
			zap.String("assignment_id", assignmentID.String()),
		)
		return models.ErrAssignmentNotFound
	}

	return nil
}

func (r *SecretGuestRepository) GetAssignmentByIDAndOwner(ctx context.Context, assignmentID, reporterID uuid.UUID) (*models.Assignment, error) {
	log := logger.GetLoggerFromCtx(ctx)
	query := `
		SELECT
			a.id,

			a.ota_sg_reservation_id,
			a.pricing,
			a.guests,
			a.checkin_date,
			a.checkout_date,

			a.listing_id, a.reporter_id, a.status_id, a.purpose, a.created_at, a.expires_at, a.accepted_at,
			a.taked_at,

			l.id,
			l.code as "listing_code",

			l.title as "listing_title", l.description as "listing_description", l.main_picture as "listing_main_picture",

			l.listing_type_id,
			lt.slug as "listing_type_slug", lt.name as "listing_type_name",

			l.address as "listing_address", l.city as "listing_city", l.country as "listing_country",
			l.latitude as "listing_latitude", l.longitude as "listing_longitude",

			COALESCE(u.username, '') as reporter_username,

			s.slug as "status_slug", s.name as "status_name"
		FROM assignments a
		JOIN listings l ON a.listing_id = l.id
		LEFT JOIN users u ON a.reporter_id = u.id
		JOIN listing_types lt ON l.listing_type_id = lt.id
		JOIN assignment_statuses s ON a.status_id = s.id
		WHERE a.id = $1 AND a.reporter_id = $2
	`
	row := r.db.QueryRow(ctx, query, assignmentID, reporterID)
	assignment, err := r.scanAssignment(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			log.Info(ctx, "Assignment not found by ID and owner", zap.String("assignment_id", assignmentID.String()), zap.String("reporter_id", reporterID.String()))
			return nil, models.ErrAssignmentNotFound
		}
		log.Error(ctx, "Failed to query assignment by ID and owner", zap.Error(err), zap.String("assignment_id", assignmentID.String()))
		return nil, err
	}
	return assignment, nil
}

func (r *SecretGuestRepository) AcceptMyAssignment(ctx context.Context, assignmentID, reporterID uuid.UUID, acceptedAt time.Time) (*models.Report, error) {

	//TODO: Переписать!!!

	log := logger.GetLoggerFromCtx(ctx)
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	updateQuery := `
		UPDATE assignments
		SET
			status_id = $1,
			accepted_at = $2
		WHERE
			id = $3
			AND reporter_id = $4
			AND status_id = $5
		RETURNING
			listing_id,
			purpose,
			ota_sg_reservation_id,
			pricing,
			guests,
			checkin_date,
			checkout_date`

	var listingID uuid.UUID
	var purpose string
	var otaSgReservationID uuid.UUID
	var pricing json.RawMessage
	var guests json.RawMessage
	var checkinDate time.Time
	var checkoutDate time.Time

	err = tx.QueryRow(ctx, updateQuery,
		models.AssignmentStatusAccepted, // new assignment status
		acceptedAt,
		assignmentID,
		reporterID,
		models.AssignmentStatusOffered, // current assignment status
	).Scan(&listingID,
		&purpose,
		&otaSgReservationID,
		&pricing,
		&guests,
		&checkinDate,
		&checkoutDate)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, models.ErrAssignmentCannotBeAccepted
		}
		return nil, err
	}

	// ДЕргаем документ-основание - бронирование из ota_sg_reservations
	var otaID uuid.UUID
	var bookingNumber string

	if otaSgReservationID != uuid.Nil {
		err = tx.QueryRow(ctx,
			`SELECT ota_id, booking_number FROM ota_sg_reservations WHERE id = $1`,
			otaSgReservationID,
		).Scan(&otaID, &bookingNumber)
		if err != nil {
			return nil, err
		}
	} else {
		log.Error(ctx, "Assignment has no linked OTA reservation", zap.String("assignment_id", assignmentID.String()))
		return nil, fmt.Errorf("assignment %s has no linked OTA reservation", assignmentID)
	}
	//////

	// Create report
	report := &models.Report{
		ID:           uuid.New(),
		AssignmentID: assignmentID,
		ListingID:    listingID,
		Purpose:      purpose,
		ReporterID:   reporterID,
		StatusID:     models.ReportStatusGenerating,
		BookingDetails: models.BookingDetails{
			OTAID:              otaID,
			BookingNumber:      bookingNumber,
			OtaSgReservationID: otaSgReservationID,
			Pricing:            pricing,
			Guests:             guests,
			CheckinDate:        checkinDate,
			CheckoutDate:       checkoutDate,
		},
	}

	insertQuery := `
		INSERT INTO reports (
			id,
			assignment_id,
			listing_id,
			purpose,
			reporter_id,
			status_id,
			ota_id,
			booking_number,
			ota_sg_reservation_id,
			pricing,
			guests,
			checkin_date,
			checkout_date
		) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
	`
	if _, err := tx.Exec(ctx, insertQuery,
		report.ID,
		report.AssignmentID,
		report.ListingID,
		report.Purpose,
		report.ReporterID,
		report.StatusID,
		report.BookingDetails.OTAID,
		report.BookingDetails.BookingNumber,
		report.BookingDetails.OtaSgReservationID,
		report.BookingDetails.Pricing,
		report.BookingDetails.Guests,
		report.BookingDetails.CheckinDate,
		report.BookingDetails.CheckoutDate,
	); err != nil {
		log.Error(ctx, "Failed to create report in transaction", zap.Error(err))
		return nil, err
	}

	// Коммитим транзакцию
	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	return report, nil
}

func (r *SecretGuestRepository) DeclineMyAssignment(ctx context.Context, assignmentID, reporterID uuid.UUID, takedAt, declinedAt time.Time) error {
	log := logger.GetLoggerFromCtx(ctx)

	tx, err := r.db.Begin(ctx)
	if err != nil {
		log.Error(ctx, "Failed to begin transaction", zap.Error(err))
		return err
	}
	defer tx.Rollback(ctx)

	// Обновляем статус задания и очищаем reporter_id
	updateQuery := `
		UPDATE assignments
		SET
			status_id   = $1,
			reporter_id = NULL,
			taked_at    = NULL
		WHERE
			id = $2
			AND reporter_id = $3
			AND status_id = $4
	`

	ct, err := tx.Exec(ctx, updateQuery,
		// models.AssignmentStatusDeclined,
		models.AssignmentStatusOffered, // Возвращаем в статус "предложено"
		assignmentID,
		reporterID,
		models.AssignmentStatusOffered,
	)
	if err != nil {
		log.Error(ctx, "DB error on declining assignment", zap.Error(err))
		return err
	}
	if ct.RowsAffected() == 0 {
		log.Warn(ctx, "Attempt to decline assignment failed: conditions not met",
			zap.String("assignment_id", assignmentID.String()),
			zap.String("reporter_id", reporterID.String()),
			zap.Int("required_status_id", models.AssignmentStatusOffered),
		)
		return models.ErrAssignmentCannotBeDeclined
	}

	// TODO: Возможно, стоит переписать всё в рамках одной транзакции.
	// Регистрируем отказ
	insertQuery := `
		INSERT INTO assignment_declines (assignment_id, reporter_id, taked_at, declined_at)
		VALUES ($1, $2, $3, $4)
	`
	_, err = tx.Exec(ctx, insertQuery, assignmentID, reporterID, takedAt, declinedAt)
	if err != nil {
		log.Error(ctx, "Failed to insert assignment decline history", zap.Error(err))
		return err
	}

	if err := tx.Commit(ctx); err != nil {
		log.Error(ctx, "Failed to commit decline transaction", zap.Error(err))
		return err
	}

	return nil
}

func (r *SecretGuestRepository) TakeFreeAssignmentsByID(ctx context.Context, assignmentID, userID uuid.UUID, takenAt time.Time) error {

	// TODO: добавить временную метку taken_at в assignments, или отдльную таблицу и т.п.

	tx, err := r.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// Проверяем, что у пользователя нет других предложений Offered
	var count int
	err = tx.QueryRow(ctx, `
		SELECT COUNT(*)
		FROM
			assignments
		WHERE
			reporter_id = $1
			AND status_id = $2
	`, userID, models.AssignmentStatusOffered).Scan(&count)
	if err != nil {
		return fmt.Errorf("failed to check existing offered assignments: %w", err)
	}
	if count > 0 {
		// return models.ErrAssignmentCannotBeTaken
		return fmt.Errorf("user %s already has %d active assignments", userID, count)
	}

	updateQuery := `
		UPDATE assignments
		SET
			reporter_id = $1,
			status_id = $2,
			taked_at = $3
		WHERE
			id = $4
		  	AND status_id = $5
		  	AND reporter_id IS NULL
		RETURNING id
	`

	var id uuid.UUID
	err = tx.QueryRow(ctx, updateQuery,
		userID,
		models.AssignmentStatusOffered, // новый статус, пока пусть тот же
		takenAt,
		assignmentID,
		models.AssignmentStatusOffered, // текущий статус
	).Scan(&id)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return models.ErrAssignmentCannotBeTaken
		}
		return fmt.Errorf("failed to update assignment: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// reports

type ReportsFilter struct {
	ReportID       *uuid.UUID
	ReporterID     *uuid.UUID
	StatusIDs      []int
	ListingTypeIDs []int
	Limit          int
	Offset         int
}

func buildReportWhereClause(filter ReportsFilter) (string, []interface{}, int) {
	conditions := []string{}
	args := []interface{}{}
	paramCount := 1

	if filter.ReportID != nil {
		conditions = append(conditions, fmt.Sprintf("r.id = $%d", paramCount))
		args = append(args, *filter.ReportID)
		paramCount++
	}

	if filter.ReporterID != nil {
		conditions = append(conditions, fmt.Sprintf("r.reporter_id = $%d", paramCount))
		args = append(args, *filter.ReporterID)
		paramCount++
	}

	if len(filter.StatusIDs) > 0 {
		placeholders := make([]string, len(filter.StatusIDs))
		for i, id := range filter.StatusIDs {
			placeholders[i] = fmt.Sprintf("$%d", paramCount)
			args = append(args, id)
			paramCount++
		}
		conditions = append(conditions, fmt.Sprintf("r.status_id IN (%s)", strings.Join(placeholders, ",")))
	}

	if len(filter.ListingTypeIDs) > 0 {
		placeholders := make([]string, 0, len(filter.ListingTypeIDs))
		for _, id := range filter.ListingTypeIDs {
			placeholders = append(placeholders, fmt.Sprintf("$%d", paramCount))
			args = append(args, id)
			paramCount++
		}
		conditions = append(conditions,
			fmt.Sprintf("l.listing_type_id IN (%s)", strings.Join(placeholders, ",")),
		)
	}

	whereClause := strings.Join(conditions, " AND ")
	return whereClause, args, paramCount
}

func (r *SecretGuestRepository) scanReport(row pgx.Row) (*models.Report, error) {
	var rep models.Report
	if err := row.Scan(
		&rep.ID,
		&rep.AssignmentID,

		&rep.BookingDetails.OTAID,
		&rep.BookingDetails.BookingNumber,
		&rep.BookingDetails.OtaSgReservationID,
		&rep.BookingDetails.Pricing,
		&rep.BookingDetails.Guests,
		&rep.BookingDetails.CheckinDate,
		&rep.BookingDetails.CheckoutDate,

		&rep.ListingID,
		&rep.ReporterID,
		&rep.StatusID,
		&rep.Purpose,
		&rep.CreatedAt,
		&rep.UpdatedAt,
		&rep.SubmittedAt,

		&rep.ChecklistSchema,

		&rep.Listing.ID,
		&rep.Listing.Code,
		&rep.Listing.Title,
		&rep.Listing.Description,
		&rep.Listing.MainPicture,

		&rep.Listing.ListingTypeID,
		&rep.Listing.ListingTypeSlug,
		&rep.Listing.ListingTypeName,

		&rep.Listing.Address, &rep.Listing.City, &rep.Listing.Country,
		&rep.Listing.Latitude, &rep.Listing.Longitude,

		&rep.Reporter.Username,

		&rep.Status.Slug,
		&rep.Status.Name,
	); err != nil {
		return nil, err
	}

	rep.Listing.ID = rep.ListingID
	rep.Reporter.ID = rep.ReporterID
	rep.Status.ID = rep.StatusID

	return &rep, nil
}

func (r *SecretGuestRepository) GetReports(ctx context.Context, filter ReportsFilter) ([]*models.Report, int, error) {
	log := logger.GetLoggerFromCtx(ctx)

	whereClause, args, paramCount := buildReportWhereClause(filter)

	countQuery := `
		SELECT COUNT(r.id)
		FROM reports r
		JOIN report_statuses s ON r.status_id = s.id
		`
	if len(filter.ListingTypeIDs) > 0 {
		countQuery += " JOIN listings l ON r.listing_id = l.id "
	}

	if whereClause != "" {
		countQuery += " WHERE " + whereClause
	}

	var total int
	if err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total); err != nil {
		log.Error(ctx, "Failed to query total reports count", zap.Error(err), zap.Any("filter", filter))
		return nil, 0, err
	}

	if total == 0 {
		return []*models.Report{}, 0, nil
	}

	baseQuery := `
		SELECT
			r.id,
			r.assignment_id,

			r.ota_id,
			r.booking_number,
			r.ota_sg_reservation_id,
			r.pricing,
			r.guests,
			r.checkin_date,
			r.checkout_date,

			r.listing_id, r.reporter_id, r.status_id,
			r.purpose,
			r.created_at,
			r.updated_at,
			r.submitted_at,

			r.checklist_schema,

			l.ID,
			l.code as "listing_code",
			l.title as "listing_title",
			l.description as "listing_description",
			l.main_picture as "listing_main_picture",

			l.listing_type_id,
			lt.slug as "listing_type_slug", lt.name as "listing_type_name",

			l.address as "listing_address", l.city as "listing_city", l.country as "listing_country",
			l.latitude as "listing_latitude", l.longitude as "listing_longitude",

			u.username as "reporter_username",

			s.slug as "status_slug",
			s.name as "status_name"

		FROM reports r
		JOIN listings l ON r.listing_id = l.id
		LEFT JOIN users u ON r.reporter_id = u.id
		JOIN report_statuses s ON r.status_id = s.id
		JOIN listing_types lt ON l.listing_type_id = lt.id
	`

	query := baseQuery
	if whereClause != "" {
		query += " WHERE " + whereClause
	}

	query += fmt.Sprintf(" ORDER BY r.created_at DESC LIMIT $%d OFFSET $%d", paramCount, paramCount+1)
	args = append(args, filter.Limit, filter.Offset)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		log.Error(ctx, "Failed to query reports with filter", zap.Error(err), zap.Any("filter", filter))
		return nil, 0, err
	}
	defer rows.Close()

	reports := make([]*models.Report, 0, filter.Limit)

	for rows.Next() {
		var r models.Report
		if err := rows.Scan(
			&r.ID,
			&r.AssignmentID,

			&r.BookingDetails.OTAID,
			&r.BookingDetails.BookingNumber,
			&r.BookingDetails.OtaSgReservationID,
			&r.BookingDetails.Pricing,
			&r.BookingDetails.Guests,
			&r.BookingDetails.CheckinDate,
			&r.BookingDetails.CheckoutDate,

			&r.ListingID, &r.ReporterID, &r.StatusID,
			&r.Purpose,
			&r.CreatedAt,
			&r.UpdatedAt,
			&r.SubmittedAt,

			&r.ChecklistSchema,

			&r.Listing.ID,
			&r.Listing.Code,
			&r.Listing.Title,
			&r.Listing.Description,
			&r.Listing.MainPicture,

			&r.Listing.ListingTypeID,
			&r.Listing.ListingTypeSlug,
			&r.Listing.ListingTypeName,

			&r.Listing.Address, &r.Listing.City, &r.Listing.Country,
			&r.Listing.Latitude, &r.Listing.Longitude,

			&r.Reporter.Username,

			&r.Status.Slug,
			&r.Status.Name,
		); err != nil {
			log.Error(ctx, "Failed to scan report  row", zap.Error(err))
			// Прерываем выполнение, так как ошибка сканирования может указывать на серьезную проблему.
			return nil, total, err
		}

		r.Listing.ID = r.ListingID
		r.Reporter.ID = r.ReporterID
		r.Status.ID = r.StatusID

		reports = append(reports, &r)
	}

	if err := rows.Err(); err != nil {
		log.Error(ctx, "Error after iterating over report rows", zap.Error(err))
		return nil, total, err
	}

	return reports, total, nil

}

func (r *SecretGuestRepository) GetReportByID(ctx context.Context, reportID uuid.UUID) (*models.Report, error) {
	log := logger.GetLoggerFromCtx(ctx)
	query := `
		SELECT
			r.id,
			r.assignment_id,

			r.ota_id,
			r.booking_number,
			r.ota_sg_reservation_id,
			r.pricing,
			r.guests,
			r.checkin_date,
			r.checkout_date,

			r.listing_id, r.reporter_id, r.status_id, r.purpose,
			r.created_at, r.updated_at, r.submitted_at, r.checklist_schema,

			l.ID,
			l.code as "listing_code",
			l.title as "listing_title", l.description as "listing_description",
			l.main_picture as "listing_main_picture",

			l.listing_type_id,
			lt.slug as "listing_type_slug",
			lt.name as "listing_type_name",

			l.address as "listing_address", l.city as "listing_city", l.country as "listing_country",
			l.latitude as "listing_latitude", l.longitude as "listing_longitude",

			u.username as "reporter_username",
			s.slug as "status_slug", s.name as "status_name"
		FROM reports r
		JOIN listings l ON r.listing_id = l.id
		JOIN users u ON r.reporter_id = u.id
		JOIN report_statuses s ON r.status_id = s.id
		JOIN listing_types lt ON l.listing_type_id = lt.id
		WHERE r.id = $1
	`
	row := r.db.QueryRow(ctx, query, reportID)
	report, err := r.scanReport(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			log.Info(ctx, "Report not found by ID", zap.String("report_id", reportID.String()))
			return nil, models.ErrReportNotFound
		}
		log.Error(ctx, "Failed to query report by ID", zap.Error(err), zap.String("report_id", reportID.String()))
		return nil, err
	}
	return report, nil
}

func (r *SecretGuestRepository) GetReportByIDAndOwner(ctx context.Context, reportID, reporterID uuid.UUID) (*models.Report, error) {
	log := logger.GetLoggerFromCtx(ctx)
	query := `
		SELECT
			r.id,
			r.assignment_id,

			r.ota_id,
			r.booking_number,
			r.ota_sg_reservation_id,
			r.pricing,
			r.guests,
			r.checkin_date,
			r.checkout_date,

			r.listing_id, r.reporter_id, r.status_id, r.purpose,
			r.created_at, r.updated_at, r.submitted_at,

			r.checklist_schema,

			l.ID,
			l.code as "listing_code",
			l.title as "listing_title",
			l.description as "listing_description",
			l.main_picture as "listing_main_picture",

			l.listing_type_id,
			lt.slug as "listing_type_slug",
			lt.name as "listing_type_name",

			l.address as "listing_address", l.city as "listing_city", l.country as "listing_country",
			l.latitude as "listing_latitude", l.longitude as "listing_longitude",

			u.username as "reporter_username",
			s.slug as "status_slug", s.name as "status_name"
		FROM reports r
		JOIN listings l ON r.listing_id = l.id
		JOIN users u ON r.reporter_id = u.id
		JOIN report_statuses s ON r.status_id = s.id
		JOIN listing_types lt ON l.listing_type_id = lt.id
		WHERE r.id = $1 AND r.reporter_id = $2
	`
	row := r.db.QueryRow(ctx, query, reportID, reporterID)
	report, err := r.scanReport(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			log.Info(ctx, "Report not found by ID and owner",
				zap.String("report_id", reportID.String()),
				zap.String("reporter_id", reporterID.String()),
			)
			return nil, models.ErrReportNotFound
		}
		log.Error(ctx, "Failed to query report by ID and owner",
			zap.Error(err),
			zap.String("report_id", reportID.String()),
			zap.String("reporter_id", reporterID.String()),
		)
		return nil, err
	}
	return report, nil
}

func (r *SecretGuestRepository) UpdateMyReportContent(ctx context.Context, reportID, reporterID uuid.UUID, currentStatusID int, schema models.ChecklistSchema) error {
	log := logger.GetLoggerFromCtx(ctx)

	query := `
		UPDATE reports
		SET
			checklist_schema = $1,
			updated_at = NOW()
		WHERE id = $2 AND reporter_id = $3 AND status_id = $4
	`

	ct, err := r.db.Exec(ctx, query,
		schema,
		reportID,
		reporterID,
		currentStatusID,
	)

	if err != nil {
		log.Error(ctx, "DB error on updating report content",
			zap.Error(err),
			zap.String("report_id", reportID.String()),
			zap.String("reporter_id", reporterID.String()),
		)
		return err
	}

	if ct.RowsAffected() == 0 {
		log.Warn(ctx, "Attempt to update report content failed: conditions not met",
			zap.String("report_id", reportID.String()),
			zap.String("reporter_id", reporterID.String()),
			zap.Int("required_status_id", currentStatusID),
		)
		return models.ErrReportNotEditable
	}

	return nil
}

func (r *SecretGuestRepository) UpdateMyReportStatus(ctx context.Context, reportID, reporterID uuid.UUID, currentStatusID, newStatusID int) error {

	query := `UPDATE reports SET status_id = $1, updated_at = NOW() WHERE id = $2 AND reporter_id = $3 AND status_id = $4`

	if newStatusID == models.ReportStatusSubmitted {
		query = `UPDATE reports SET status_id = $1, updated_at = NOW(), submitted_at = NOW() WHERE id = $2 AND reporter_id = $3 AND status_id = $4`
	}

	ct, err := r.db.Exec(ctx, query, newStatusID, reportID, reporterID, currentStatusID)
	if err != nil {
		return err
	}
	if ct.RowsAffected() == 0 {
		return models.ErrReportNotEditable
	}
	return nil
}

func (r *SecretGuestRepository) UpdateReportStatusAsStaff(ctx context.Context, reportID uuid.UUID, currentStatusID, newStatusID int) error {
	query := `UPDATE reports SET status_id = $1, updated_at = NOW() WHERE id = $2 AND status_id = $3`
	ct, err := r.db.Exec(ctx, query, newStatusID, reportID, currentStatusID)
	if err != nil {
		return err
	}
	if ct.RowsAffected() == 0 {
		switch newStatusID {
		case models.ReportStatusApproved:
			return models.ErrReportCannotBeApproved
		case models.ReportStatusRejected:
			return models.ErrReportCannotBeRejected
		default:
			return models.ErrReportNotEditable
		}
	}
	return nil
}

// answer_types

type AnswerTypesFilter struct {
	IDs   []int
	Slugs []string
}

func (r *SecretGuestRepository) GetAnswerTypes(ctx context.Context, filter AnswerTypesFilter) ([]*models.AnswerType, error) {
	log := logger.GetLoggerFromCtx(ctx)

	query := `SELECT id, slug, name, meta FROM answer_types`
	args := []interface{}{}
	conditions := []string{}
	paramCount := 1

	if len(filter.IDs) > 0 {
		placeholders := make([]string, len(filter.IDs))
		for i, id := range filter.IDs {
			placeholders[i] = fmt.Sprintf("$%d", paramCount)
			args = append(args, id)
			paramCount++
		}
		conditions = append(conditions, fmt.Sprintf("id IN (%s)", strings.Join(placeholders, ",")))
	}

	if len(filter.Slugs) > 0 {
		placeholders := make([]string, len(filter.Slugs))
		for i, slug := range filter.Slugs {
			placeholders[i] = fmt.Sprintf("$%d", paramCount)
			args = append(args, slug)
			paramCount++
		}
		conditions = append(conditions, fmt.Sprintf("slug IN (%s)", strings.Join(placeholders, ",")))
	}

	if len(conditions) > 0 {
		query += " WHERE " + strings.Join(conditions, " AND ")
	}

	query += " ORDER BY id"

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		log.Error(ctx, "Failed to query answer types", zap.Error(err), zap.Any("filter", filter))
		return nil, err
	}
	defer rows.Close()

	answerTypes, err := pgx.CollectRows(rows, pgx.RowToAddrOfStructByPos[models.AnswerType])
	if err != nil {
		log.Error(ctx, "Failed to scan answer types", zap.Error(err))
		return nil, err
	}

	return answerTypes, nil
}

func (r *SecretGuestRepository) GetAnswerTypeByID(ctx context.Context, id int) (*models.AnswerType, error) {
	log := logger.GetLoggerFromCtx(ctx)
	query := `SELECT id, slug, name, meta FROM answer_types WHERE id = $1`
	row := r.db.QueryRow(ctx, query, id)

	var at models.AnswerType
	err := row.Scan(&at.ID, &at.Slug, &at.Name, &at.Meta)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			log.Info(ctx, "Answer type not found by ID", zap.Int("id", id))
			return nil, models.ErrNotFound
		}
		log.Error(ctx, "Failed to query answer type by ID", zap.Error(err), zap.Int("id", id))
		return nil, err
	}
	return &at, nil
}

func (r *SecretGuestRepository) CreateAnswerType(ctx context.Context, at *models.AnswerType) (*models.AnswerType, error) {
	log := logger.GetLoggerFromCtx(ctx)
	query := `INSERT INTO answer_types (slug, name, meta) VALUES ($1, $2, $3) RETURNING id, slug, name, meta`

	var createdAT models.AnswerType
	err := r.db.QueryRow(ctx, query, at.Slug, at.Name, at.Meta).Scan(&createdAT.ID, &createdAT.Slug, &createdAT.Name, &createdAT.Meta)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" { // unique_violation
			log.Warn(ctx, "Attempt to create answer type with duplicate slug", zap.String("slug", at.Slug))
			return nil, models.ErrDuplicate
		}
		log.Error(ctx, "Failed to create answer type", zap.Error(err))
		return nil, err
	}
	return &createdAT, nil
}

func (r *SecretGuestRepository) UpdateAnswerType(ctx context.Context, id int, at *models.AnswerType, metaSetted bool) error {
	log := logger.GetLoggerFromCtx(ctx)

	query := "UPDATE answer_types SET"
	args := []interface{}{}
	paramCount := 1
	updates := []string{}

	if at.Slug != "" {
		updates = append(updates, fmt.Sprintf("slug = $%d", paramCount))
		args = append(args, at.Slug)
		paramCount++
	}
	if at.Name != "" {
		updates = append(updates, fmt.Sprintf("name = $%d", paramCount))
		args = append(args, at.Name)
		paramCount++
	}

	if metaSetted {
		updates = append(updates, fmt.Sprintf("meta = $%d", paramCount))
		args = append(args, at.Meta)
		paramCount++
	}

	if len(updates) == 0 {
		return nil
	}

	query += " " + strings.Join(updates, ", ") + fmt.Sprintf(" WHERE id = $%d", paramCount)
	args = append(args, id)

	ct, err := r.db.Exec(ctx, query, args...)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			log.Warn(ctx, "Attempt to update answer type with duplicate slug", zap.String("slug", at.Slug))
			return models.ErrDuplicate
		}
		log.Error(ctx, "DB error on updating answer type", zap.Error(err), zap.Int("id", id))
		return err
	}

	if ct.RowsAffected() == 0 {
		return models.ErrNotFound
	}

	return nil
}

func (r *SecretGuestRepository) DeleteAnswerType(ctx context.Context, id int) error {
	log := logger.GetLoggerFromCtx(ctx)
	ct, err := r.db.Exec(ctx, "DELETE FROM answer_types WHERE id = $1", id)
	if err != nil {
		var pgErr *pgconn.PgError
		// Код '23503' - это foreign_key_violation в PostgreSQL
		if errors.As(err, &pgErr) && pgErr.Code == "23503" {
			log.Warn(ctx, "Attempt to delete an answer type that is in use", zap.Int("id", id))
			return models.ErrInUse
		}
		log.Error(ctx, "DB error on deleting answer type", zap.Error(err), zap.Int("id", id))
		return err
	}

	if ct.RowsAffected() == 0 {
		return models.ErrNotFound
	}
	return nil
}

// media_requirements

type MediaRequirementsFilter struct {
	IDs   []int
	Slugs []string
}

func (r *SecretGuestRepository) GetMediaRequirements(ctx context.Context, filter MediaRequirementsFilter) ([]*models.MediaRequirement, error) {
	log := logger.GetLoggerFromCtx(ctx)

	query := `SELECT id, slug, name FROM media_requirements`
	args := []interface{}{}
	conditions := []string{}
	paramCount := 1

	if len(filter.IDs) > 0 {
		placeholders := make([]string, len(filter.IDs))
		for i, id := range filter.IDs {
			placeholders[i] = fmt.Sprintf("$%d", paramCount)
			args = append(args, id)
			paramCount++
		}
		conditions = append(conditions, fmt.Sprintf("id IN (%s)", strings.Join(placeholders, ",")))
	}

	if len(filter.Slugs) > 0 {
		placeholders := make([]string, len(filter.Slugs))
		for i, slug := range filter.Slugs {
			placeholders[i] = fmt.Sprintf("$%d", paramCount)
			args = append(args, slug)
			paramCount++
		}
		conditions = append(conditions, fmt.Sprintf("slug IN (%s)", strings.Join(placeholders, ",")))
	}

	if len(conditions) > 0 {
		query += " WHERE " + strings.Join(conditions, " AND ")
	}

	query += " ORDER BY id"

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		log.Error(ctx, "Failed to query media requirements", zap.Error(err), zap.Any("filter", filter))
		return nil, err
	}
	defer rows.Close()

	mediaRequirements, err := pgx.CollectRows(rows, pgx.RowToAddrOfStructByPos[models.MediaRequirement])
	if err != nil {
		log.Error(ctx, "Failed to scan media requirements", zap.Error(err))
		return nil, err
	}

	return mediaRequirements, nil
}

// listing_types

type ListingTypesFilter struct {
	IDs   []int
	Slugs []string
}

func (r *SecretGuestRepository) GetListingTypes(ctx context.Context, filter ListingTypesFilter) ([]*models.ListingType, error) {
	log := logger.GetLoggerFromCtx(ctx)

	query := `SELECT id, slug, name FROM listing_types`
	args := []interface{}{}
	conditions := []string{}
	paramCount := 1

	if len(filter.IDs) > 0 {
		placeholders := make([]string, len(filter.IDs))
		for i, id := range filter.IDs {
			placeholders[i] = fmt.Sprintf("$%d", paramCount)
			args = append(args, id)
			paramCount++
		}
		conditions = append(conditions, fmt.Sprintf("id IN (%s)", strings.Join(placeholders, ",")))
	}

	if len(filter.Slugs) > 0 {
		placeholders := make([]string, len(filter.Slugs))
		for i, slug := range filter.Slugs {
			placeholders[i] = fmt.Sprintf("$%d", paramCount)
			args = append(args, slug)
			paramCount++
		}
		conditions = append(conditions, fmt.Sprintf("slug IN (%s)", strings.Join(placeholders, ",")))
	}

	if len(conditions) > 0 {
		query += " WHERE " + strings.Join(conditions, " AND ")
	}

	query += " ORDER BY id"

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		log.Error(ctx, "Failed to query listing types", zap.Error(err), zap.Any("filter", filter))
		return nil, err
	}
	defer rows.Close()

	listingTypes, err := pgx.CollectRows(rows, pgx.RowToAddrOfStructByPos[models.ListingType])
	if err != nil {
		log.Error(ctx, "Failed to scan listing types", zap.Error(err))
		return nil, err
	}

	return listingTypes, nil
}

func (r *SecretGuestRepository) GetListingTypeByID(ctx context.Context, id int) (*models.ListingType, error) {
	log := logger.GetLoggerFromCtx(ctx)
	query := `SELECT id, slug, name FROM listing_types WHERE id = $1`
	row := r.db.QueryRow(ctx, query, id)

	var lt models.ListingType
	err := row.Scan(&lt.ID, &lt.Slug, &lt.Name)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			log.Info(ctx, "Listing type not found by ID", zap.Int("id", id))
			return nil, models.ErrNotFound
		}
		log.Error(ctx, "Failed to query listing type by ID", zap.Error(err), zap.Int("id", id))
		return nil, err
	}
	return &lt, nil
}

func (r *SecretGuestRepository) CreateListingType(ctx context.Context, lt *models.ListingType) (*models.ListingType, error) {
	log := logger.GetLoggerFromCtx(ctx)
	query := `INSERT INTO listing_types (slug, name) VALUES ($1, $2) RETURNING id, slug, name`

	var createdLT models.ListingType
	err := r.db.QueryRow(ctx, query, lt.Slug, lt.Name).Scan(&createdLT.ID, &createdLT.Slug, &createdLT.Name)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" { // unique_violation
			log.Warn(ctx, "Attempt to create listing type with duplicate slug", zap.String("slug", lt.Slug))
			return nil, models.ErrDuplicate
		}
		log.Error(ctx, "Failed to create listing type", zap.Error(err))
		return nil, err
	}
	return &createdLT, nil
}

func (r *SecretGuestRepository) UpdateListingType(ctx context.Context, id int, lt *models.ListingType) error {
	log := logger.GetLoggerFromCtx(ctx)

	updates := []string{}
	args := []interface{}{}
	paramCount := 1

	if lt.Slug != "" {
		updates = append(updates, fmt.Sprintf("slug = $%d", paramCount))
		args = append(args, lt.Slug)
		paramCount++
	}
	if lt.Name != "" {
		updates = append(updates, fmt.Sprintf("name = $%d", paramCount))
		args = append(args, lt.Name)
		paramCount++
	}
	if len(updates) == 0 {
		return nil
	}

	query := "UPDATE listing_types SET " + strings.Join(updates, ", ")
	query += fmt.Sprintf(" WHERE id = $%d", paramCount)
	args = append(args, id)

	ct, err := r.db.Exec(ctx, query, args...)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			log.Warn(ctx, "Attempt to update listing type with duplicate value", zap.Any("listing_type", lt))
			return models.ErrDuplicate
		}
		log.Error(ctx, "DB error on updating listing type", zap.Error(err), zap.Int("id", id))
		return err
	}

	if ct.RowsAffected() == 0 {
		return models.ErrNotFound
	}

	return nil
}

func (r *SecretGuestRepository) DeleteListingType(ctx context.Context, id int) error {
	log := logger.GetLoggerFromCtx(ctx)
	ct, err := r.db.Exec(ctx, "DELETE FROM listing_types WHERE id = $1", id)
	if err != nil {
		var pgErr *pgconn.PgError
		// Код '23503' - это foreign_key_violation в PostgreSQL
		if errors.As(err, &pgErr) && pgErr.Code == "23503" {
			log.Warn(ctx, "Attempt to delete a listing type that is in use", zap.Int("id", id))
			return models.ErrInUse
		}
		log.Error(ctx, "DB error on deleting listing type", zap.Error(err), zap.Int("id", id))
		return err
	}

	if ct.RowsAffected() == 0 {
		return models.ErrNotFound
	}
	return nil
}

// checklist_sections

type ChecklistSectionsFilter struct {
	IDs              []int
	Slugs            []string
	ListingTypeIDs   []int
	ListingTypeSlugs []string
}

func (r *SecretGuestRepository) GetChecklistSections(ctx context.Context, filter ChecklistSectionsFilter) ([]*models.ChecklistSection, error) {
	log := logger.GetLoggerFromCtx(ctx)

	query := `
		SELECT cs.id, cs.slug, cs.title, cs.sort_order, cs.listing_type_id, lt.slug as listing_type_slug
		FROM checklist_sections cs
		JOIN listing_types lt ON cs.listing_type_id = lt.id
	`
	args := []interface{}{}
	conditions := []string{}
	paramCount := 1

	if len(filter.IDs) > 0 {
		placeholders := make([]string, len(filter.IDs))
		for i, id := range filter.IDs {
			placeholders[i] = fmt.Sprintf("$%d", paramCount)
			args = append(args, id)
			paramCount++
		}
		conditions = append(conditions, fmt.Sprintf("cs.id IN (%s)", strings.Join(placeholders, ",")))
	}

	if len(filter.Slugs) > 0 {
		placeholders := make([]string, len(filter.Slugs))
		for i, slug := range filter.Slugs {
			placeholders[i] = fmt.Sprintf("$%d", paramCount)
			args = append(args, slug)
			paramCount++
		}
		conditions = append(conditions, fmt.Sprintf("cs.slug IN (%s)", strings.Join(placeholders, ",")))
	}

	if len(filter.ListingTypeIDs) > 0 {
		placeholders := make([]string, len(filter.ListingTypeIDs))
		for i, id := range filter.ListingTypeIDs {
			placeholders[i] = fmt.Sprintf("$%d", paramCount)
			args = append(args, id)
			paramCount++
		}
		conditions = append(conditions, fmt.Sprintf("cs.listing_type_id IN (%s)", strings.Join(placeholders, ",")))
	}

	if len(filter.ListingTypeSlugs) > 0 {
		placeholders := make([]string, len(filter.ListingTypeSlugs))
		for i, slug := range filter.ListingTypeSlugs {
			placeholders[i] = fmt.Sprintf("$%d", paramCount)
			args = append(args, slug)
			paramCount++
		}
		conditions = append(conditions, fmt.Sprintf("lt.slug IN (%s)", strings.Join(placeholders, ",")))
	}

	if len(conditions) > 0 {
		query += " WHERE " + strings.Join(conditions, " AND ")
	}

	query += " ORDER BY cs.listing_type_id, cs.sort_order"

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		log.Error(ctx, "Failed to query checklist sections", zap.Error(err), zap.Any("filter", filter))
		return nil, err
	}
	defer rows.Close()

	sections, err := pgx.CollectRows(rows, pgx.RowToAddrOfStructByPos[models.ChecklistSection])
	if err != nil {
		log.Error(ctx, "Failed to scan checklist sections", zap.Error(err))
		return nil, err
	}

	return sections, nil
}

func (r *SecretGuestRepository) GetChecklistSectionByID(ctx context.Context, id int) (*models.ChecklistSection, error) {
	log := logger.GetLoggerFromCtx(ctx)
	query := `
		SELECT cs.id, cs.slug, cs.title, cs.sort_order, cs.listing_type_id, lt.slug as listing_type_slug
		FROM checklist_sections cs
		JOIN listing_types lt ON cs.listing_type_id = lt.id
		WHERE cs.id = $1
	`
	row := r.db.QueryRow(ctx, query, id)

	var cs models.ChecklistSection
	err := row.Scan(&cs.ID, &cs.Slug, &cs.Title, &cs.SortOrder, &cs.ListingTypeID, &cs.ListingTypeSlug)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			log.Info(ctx, "Checklist section not found by ID", zap.Int("id", id))
			return nil, models.ErrNotFound
		}
		log.Error(ctx, "Failed to query checklist section by ID", zap.Error(err), zap.Int("id", id))
		return nil, err
	}
	return &cs, nil
}

func (r *SecretGuestRepository) CreateChecklistSection(ctx context.Context, cs *models.ChecklistSection) (*models.ChecklistSection, error) {
	log := logger.GetLoggerFromCtx(ctx)
	query := `
		INSERT INTO checklist_sections (listing_type_id, slug, title, sort_order)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`

	err := r.db.QueryRow(ctx, query, cs.ListingTypeID, cs.Slug, cs.Title, cs.SortOrder).Scan(&cs.ID)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			switch pgErr.Code {
			case "23505": // unique_violation
				log.Warn(ctx, "Attempt to create checklist section with duplicate slug for listing type",
					zap.String("slug", cs.Slug),
					zap.Int("listing_type_id", cs.ListingTypeID))
				return nil, models.ErrDuplicate
			case "23503": // foreign_key_violation
				log.Warn(ctx, "Attempt to create checklist section with non-existent listing_type_id",
					zap.Int("listing_type_id", cs.ListingTypeID))
				return nil, models.ErrForeignKeyViolation
			}
		}
		log.Error(ctx, "Failed to create checklist section", zap.Error(err))
		return nil, err
	}

	return r.GetChecklistSectionByID(ctx, cs.ID)
}

func (r *SecretGuestRepository) UpdateChecklistSection(ctx context.Context, id int, csUpd *models.ChecklistSectionUpdate) error {
	log := logger.GetLoggerFromCtx(ctx)

	updates := []string{}
	args := []interface{}{}
	paramCount := 1

	if csUpd.Slug != "" {
		updates = append(updates, fmt.Sprintf("slug = $%d", paramCount))
		args = append(args, csUpd.Slug)
		paramCount++
	}
	if csUpd.Title != "" {
		updates = append(updates, fmt.Sprintf("title = $%d", paramCount))
		args = append(args, csUpd.Title)
		paramCount++
	}
	if csUpd.SortOrder != nil {
		updates = append(updates, fmt.Sprintf("sort_order = $%d", paramCount))
		args = append(args, *csUpd.SortOrder)
		paramCount++
	}
	if csUpd.ListingTypeID != nil {
		updates = append(updates, fmt.Sprintf("listing_type_id = $%d", paramCount))
		args = append(args, *csUpd.ListingTypeID)
		paramCount++
	}

	if len(updates) == 0 {
		return nil
	}

	query := "UPDATE checklist_sections SET " + strings.Join(updates, ", ")
	query += fmt.Sprintf(" WHERE id = $%d", paramCount)
	args = append(args, id)

	ct, err := r.db.Exec(ctx, query, args...)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			log.Warn(ctx, "Attempt to update checklist section with duplicate slug", zap.Any("updates", csUpd))
			return models.ErrDuplicate
		} else if errors.As(err, &pgErr) && pgErr.Code == "23503" { // foreign_key_violation
			log.Warn(ctx, "Attempt to update checklist section with non-existent listing_type_id",
				zap.Any("listing_type_id", csUpd.ListingTypeID))
			return models.ErrForeignKeyViolation
		}
		log.Error(ctx, "DB error on updating checklist section", zap.Error(err), zap.Int("id", id))
		return err
	}

	if ct.RowsAffected() == 0 {
		return models.ErrNotFound
	}

	return nil
}

func (r *SecretGuestRepository) DeleteChecklistSection(ctx context.Context, id int) error {
	log := logger.GetLoggerFromCtx(ctx)
	ct, err := r.db.Exec(ctx, "DELETE FROM checklist_sections WHERE id = $1", id)
	if err != nil {
		var pgErr *pgconn.PgError
		// Код '23503' - это foreign_key_violation в PostgreSQL
		if errors.As(err, &pgErr) && pgErr.Code == "23503" {
			log.Warn(ctx, "Attempt to delete a checklist section that is in use", zap.Int("id", id))
			return models.ErrInUse
		}
		log.Error(ctx, "DB error on deleting checklist section", zap.Error(err), zap.Int("id", id))
		return err
	}

	if ct.RowsAffected() == 0 {
		return models.ErrNotFound
	}
	return nil
}

// checklist_items

type ChecklistItemsFilter struct {
	IDs              []int
	Slugs            []string
	ListingTypeIDs   []int
	ListingTypeSlugs []string
	IsActive         *bool
}

func (r *SecretGuestRepository) GetChecklistItems(ctx context.Context, filter ChecklistItemsFilter) ([]*models.ChecklistItem, error) {
	log := logger.GetLoggerFromCtx(ctx)

	query := `
		SELECT
			ci.id,
			ci.section_id,
			cs.slug as section_slug,
			cs.title as section_title,
			cs.sort_order as section_sort_order,
			ci.slug,
			ci.title,
			ci.description,
			at.id as answer_type_id,
			at.slug as answer_type_slug,
			at.name as answer_type_name,
			at.meta as answer_type_meta,
			mr.id as media_requirement_id,
			mr.slug as media_requirement_slug,
			mr.name as media_requirement_name,
			ci.media_allowed_types,
			ci.media_max_files,
			ci.sort_order,
			ci.listing_type_id,
			lt.slug as listing_type_slug,
			ci.is_active
		FROM checklist_items ci
		JOIN listing_types lt ON ci.listing_type_id = lt.id
		JOIN checklist_sections cs ON ci.section_id = cs.id
		JOIN answer_types at ON ci.answer_type_id = at.id
		JOIN media_requirements mr ON ci.media_requirement_id = mr.id
	`
	args := []interface{}{}
	conditions := []string{}
	paramCount := 1

	if len(filter.IDs) > 0 {
		placeholders := make([]string, len(filter.IDs))
		for i, id := range filter.IDs {
			placeholders[i] = fmt.Sprintf("$%d", paramCount)
			args = append(args, id)
			paramCount++
		}
		conditions = append(conditions, fmt.Sprintf("ci.id IN (%s)", strings.Join(placeholders, ",")))
	}

	if len(filter.Slugs) > 0 {
		placeholders := make([]string, len(filter.Slugs))
		for i, slug := range filter.Slugs {
			placeholders[i] = fmt.Sprintf("$%d", paramCount)
			args = append(args, slug)
			paramCount++
		}
		conditions = append(conditions, fmt.Sprintf("ci.slug IN (%s)", strings.Join(placeholders, ",")))
	}

	if len(filter.ListingTypeIDs) > 0 {
		placeholders := make([]string, len(filter.ListingTypeIDs))
		for i, id := range filter.ListingTypeIDs {
			placeholders[i] = fmt.Sprintf("$%d", paramCount)
			args = append(args, id)
			paramCount++
		}
		conditions = append(conditions, fmt.Sprintf("ci.listing_type_id IN (%s)", strings.Join(placeholders, ",")))
	}

	if len(filter.ListingTypeSlugs) > 0 {
		placeholders := make([]string, len(filter.ListingTypeSlugs))
		for i, slug := range filter.ListingTypeSlugs {
			placeholders[i] = fmt.Sprintf("$%d", paramCount)
			args = append(args, slug)
			paramCount++
		}
		conditions = append(conditions, fmt.Sprintf("lt.slug IN (%s)", strings.Join(placeholders, ",")))
	}

	if filter.IsActive != nil {
		conditions = append(conditions, fmt.Sprintf("ci.is_active = $%d", paramCount))
		args = append(args, *filter.IsActive)
		paramCount++
	}

	if len(conditions) > 0 {
		query += " WHERE " + strings.Join(conditions, " AND ")
	}

	// query += " ORDER BY ci.listing_type_id, ci.section_id, cs.sort_order, ci.sort_order"
	// Изменим сортировку, чтобы она была более предсказуемой
	query += " ORDER BY ci.listing_type_id, cs.sort_order, ci.sort_order"

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		log.Error(ctx, "Failed to query checklist items", zap.Error(err), zap.Any("filter", filter))
		return nil, err
	}
	defer rows.Close()

	items := make([]*models.ChecklistItem, 0)
	for rows.Next() {
		item, err := r.scanChecklistItem(rows)
		if err != nil {
			log.Error(ctx, "Failed to scan checklist item row", zap.Error(err))
			return nil, err
		}
		items = append(items, item)
	}

	if err := rows.Err(); err != nil {
		log.Error(ctx, "Error after iterating over checklist item rows", zap.Error(err))
		return nil, err
	}

	return items, nil
}

func (r *SecretGuestRepository) scanChecklistItem(row pgx.Row) (*models.ChecklistItem, error) {
	var i models.ChecklistItem
	err := row.Scan(
		&i.ID,
		&i.SectionID,
		&i.SectionSlug,
		&i.SectionTitle,
		&i.SectionSortOrder,
		&i.Slug,
		&i.Title,
		&i.Description,
		&i.AnswerTypeID,
		&i.AnswerTypeSlug,
		&i.AnswerTypeName,
		&i.AnswerTypeMeta,
		&i.MediaRequirementID,
		&i.MediaRequirementSlug,
		&i.MediaRequirementName,
		&i.MediaAllowedTypes,
		&i.MediaMaxFiles,
		&i.SortOrder,
		&i.ListingTypeID,
		&i.ListingTypeSlug,
		&i.IsActive,
	)
	if err != nil {
		return nil, err
	}
	return &i, nil
}

func (r *SecretGuestRepository) GetChecklistItemByID(ctx context.Context, id int) (*models.ChecklistItem, error) {
	log := logger.GetLoggerFromCtx(ctx)
	query := `
		SELECT
			ci.id, ci.section_id, cs.slug as section_slug, cs.title as section_title, cs.sort_order as section_sort_order,
			ci.slug, ci.title, ci.description,
			at.id as answer_type_id, at.slug as answer_type_slug, at.name as answer_type_name, at.meta as answer_type_meta,
			mr.id as media_requirement_id, mr.slug as media_requirement_slug, mr.name as media_requirement_name,
			ci.media_allowed_types, ci.media_max_files, ci.sort_order, ci.listing_type_id, lt.slug as listing_type_slug, ci.is_active
		FROM checklist_items ci
		JOIN listing_types lt ON ci.listing_type_id = lt.id
		JOIN checklist_sections cs ON ci.section_id = cs.id
		JOIN answer_types at ON ci.answer_type_id = at.id
		JOIN media_requirements mr ON ci.media_requirement_id = mr.id
		WHERE ci.id = $1
	`
	row := r.db.QueryRow(ctx, query, id)
	item, err := r.scanChecklistItem(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			log.Info(ctx, "Checklist item not found by ID", zap.Int("id", id))
			return nil, models.ErrNotFound
		}
		log.Error(ctx, "Failed to query checklist item by ID", zap.Error(err), zap.Int("id", id))
		return nil, err
	}
	return item, nil
}

func (r *SecretGuestRepository) CreateChecklistItem(ctx context.Context, item *models.ChecklistItem) (*models.ChecklistItem, error) {
	log := logger.GetLoggerFromCtx(ctx)
	query := `
		INSERT INTO checklist_items (
			listing_type_id, section_id, answer_type_id, media_requirement_id,
			slug, title, description, media_allowed_types, media_max_files, sort_order, is_active
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING id
	`
	err := r.db.QueryRow(ctx, query,
		item.ListingTypeID, item.SectionID, item.AnswerTypeID, item.MediaRequirementID,
		item.Slug, item.Title, item.Description, item.MediaAllowedTypes, item.MediaMaxFiles, item.SortOrder, item.IsActive,
	).Scan(&item.ID)

	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			switch pgErr.Code {
			case "23505": // unique_violation
				log.Warn(ctx, "Attempt to create checklist item with duplicate slug for listing type",
					zap.String("slug", item.Slug),
					zap.Int("listing_type_id", item.ListingTypeID))
				return nil, models.ErrDuplicate
			case "23503": // foreign_key_violation
				log.Warn(ctx, "Attempt to create checklist item with non-existent foreign key",
					zap.Int("listing_type_id", item.ListingTypeID),
					zap.Int("section_id", item.SectionID),
					zap.Int("answer_type_id", item.AnswerTypeID),
					zap.Int("media_requirement_id", item.MediaRequirementID))
				return nil, models.ErrForeignKeyViolation
			}
		}
		log.Error(ctx, "Failed to create checklist item", zap.Error(err))
		return nil, err
	}

	return r.GetChecklistItemByID(ctx, item.ID)
}

func (r *SecretGuestRepository) UpdateChecklistItem(ctx context.Context, id int, itemUpd *models.ChecklistItemUpdate) error {
	log := logger.GetLoggerFromCtx(ctx)

	updates := []string{}
	args := []interface{}{}
	paramCount := 1

	if itemUpd.ListingTypeID != nil {
		updates = append(updates, fmt.Sprintf("listing_type_id = $%d", paramCount))
		args = append(args, *itemUpd.ListingTypeID)
		paramCount++
	}
	if itemUpd.SectionID != nil {
		updates = append(updates, fmt.Sprintf("section_id = $%d", paramCount))
		args = append(args, *itemUpd.SectionID)
		paramCount++
	}
	if itemUpd.AnswerTypeID != nil {
		updates = append(updates, fmt.Sprintf("answer_type_id = $%d", paramCount))
		args = append(args, *itemUpd.AnswerTypeID)
		paramCount++
	}
	if itemUpd.MediaRequirementID != nil {
		updates = append(updates, fmt.Sprintf("media_requirement_id = $%d", paramCount))
		args = append(args, *itemUpd.MediaRequirementID)
		paramCount++
	}
	if itemUpd.Slug != nil {
		updates = append(updates, fmt.Sprintf("slug = $%d", paramCount))
		args = append(args, *itemUpd.Slug)
		paramCount++
	}
	if itemUpd.Title != nil {
		updates = append(updates, fmt.Sprintf("title = $%d", paramCount))
		args = append(args, *itemUpd.Title)
		paramCount++
	}
	if itemUpd.Description != nil {
		updates = append(updates, fmt.Sprintf("description = $%d", paramCount))
		args = append(args, *itemUpd.Description)
		paramCount++
	}
	if itemUpd.MediaAllowedTypes != nil {
		updates = append(updates, fmt.Sprintf("media_allowed_types = $%d", paramCount))
		args = append(args, itemUpd.MediaAllowedTypes)
		paramCount++
	}
	if itemUpd.MediaMaxFiles != nil {
		updates = append(updates, fmt.Sprintf("media_max_files = $%d", paramCount))
		args = append(args, *itemUpd.MediaMaxFiles)
		paramCount++
	}
	if itemUpd.SortOrder != nil {
		updates = append(updates, fmt.Sprintf("sort_order = $%d", paramCount))
		args = append(args, *itemUpd.SortOrder)
		paramCount++
	}
	if itemUpd.IsActive != nil {
		updates = append(updates, fmt.Sprintf("is_active = $%d", paramCount))
		args = append(args, *itemUpd.IsActive)
		paramCount++
	}

	if len(updates) == 0 {
		return nil
	}

	query := "UPDATE checklist_items SET " + strings.Join(updates, ", ") + fmt.Sprintf(" WHERE id = $%d", paramCount)
	args = append(args, id)

	ct, err := r.db.Exec(ctx, query, args...)
	if err != nil {
		log.Error(ctx, "DB error on updating checklist item", zap.Error(err), zap.Int("id", id))
		return err
	}

	if ct.RowsAffected() == 0 {
		return models.ErrNotFound
	}

	return nil
}

func (r *SecretGuestRepository) DeleteChecklistItem(ctx context.Context, id int) error {
	log := logger.GetLoggerFromCtx(ctx)
	ct, err := r.db.Exec(ctx, "DELETE FROM checklist_items WHERE id = $1", id)
	if err != nil {
		log.Error(ctx, "DB error on deleting checklist item", zap.Error(err), zap.Int("id", id))
		return err
	}
	if ct.RowsAffected() == 0 {
		return models.ErrNotFound
	}
	return nil
}

// users

func (r *SecretGuestRepository) GetAllUsers(ctx context.Context, limit, offset int) ([]*models.User, int, error) {
	log := logger.GetLoggerFromCtx(ctx)

	countQuery := `SELECT COUNT(*) FROM users;`
	var total int
	err := r.db.QueryRow(ctx, countQuery).Scan(&total)
	if err != nil {
		log.Error(ctx, "Failed to query total users count", zap.Error(err))
		return nil, 0, err
	}

	if total == 0 {
		return []*models.User{}, 0, nil
	}

	query := `
		SELECT
			u.id,
			u.username,
			u.email,
			u.password_hash,
			u.role_id,
			u.created_at,
			r.name as role_name
		FROM users u
		JOIN roles r ON u.role_id = r.id
		ORDER BY u.created_at DESC
		LIMIT $1 OFFSET $2;
	`

	rows, err := r.db.Query(ctx, query, limit, offset)
	if err != nil {
		log.Error(ctx, "Failed to query users", zap.Error(err))
		return nil, total, err
	}
	defer rows.Close()

	users := make([]*models.User, 0)
	for rows.Next() {
		var u models.User
		err = rows.Scan(&u.ID, &u.Username, &u.Email, &u.PasswordHash, &u.RoleID, &u.CreatedAt, &u.RoleName)
		if err != nil {
			log.Error(ctx, "Failed to scan user row with role", zap.Error(err))
			return nil, total, err
		}
		users = append(users, &u)
	}

	if err := rows.Err(); err != nil {
		log.Error(ctx, "Error after iterating over user rows", zap.Error(err))
		return nil, total, err
	}

	return users, total, nil
}

// profiles

func (r *SecretGuestRepository) GetUserProfileByID(ctx context.Context, userID uuid.UUID) (*models.UserProfile, error) {
	log := logger.GetLoggerFromCtx(ctx)
	query := `
		SELECT
			up.id,
			up.user_id,
			up.accepted_offers_count,
			up.submitted_reports_count,
			up.correct_reports_count,
			up.registered_at,
			up.last_active_at,
			up.additional_info,
			u.username,
			u.email
		FROM user_profiles up
		JOIN users u ON up.user_id = u.id
		WHERE up.user_id = $1
	`
	row := r.db.QueryRow(ctx, query, userID)

	var p models.UserProfile
	err := row.Scan(
		&p.ID,
		&p.UserID,
		&p.AcceptedOffersCount,
		&p.SubmittedReportsCount,
		&p.CorrectReportsCount,
		&p.RegisteredAt,
		&p.LastActiveAt,
		&p.AdditionalInfo,
		&p.Username,
		&p.Email,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			log.Info(ctx, "User profile not found by user ID", zap.String("user_id", userID.String()))
			return nil, models.ErrNotFound
		}
		log.Error(ctx, "Failed to query user profile by ID", zap.Error(err), zap.String("user_id", userID.String()))
		return nil, err
	}
	return &p, nil
}

func (r *SecretGuestRepository) GetAllUserProfiles(ctx context.Context, limit, offset int) ([]*models.UserProfile, int, error) {
	log := logger.GetLoggerFromCtx(ctx)

	countQuery := `SELECT COUNT(*) FROM user_profiles;`
	var total int
	err := r.db.QueryRow(ctx, countQuery).Scan(&total)
	if err != nil {
		log.Error(ctx, "Failed to query total user profiles count", zap.Error(err))
		return nil, 0, err
	}

	if total == 0 {
		return []*models.UserProfile{}, 0, nil
	}

	query := `
		SELECT
			up.id,
			up.user_id,
			up.accepted_offers_count,
			up.submitted_reports_count,
			up.correct_reports_count,
			up.registered_at,
			up.last_active_at,
			up.additional_info,
			u.username,
			u.email
		FROM user_profiles up
		JOIN users u ON up.user_id = u.id
		ORDER BY up.registered_at DESC
		LIMIT $1 OFFSET $2;
	`

	rows, err := r.db.Query(ctx, query, limit, offset)
	if err != nil {
		log.Error(ctx, "Failed to query user profiles", zap.Error(err))
		return nil, total, err
	}
	defer rows.Close()

	profiles := make([]*models.UserProfile, 0, limit)
	for rows.Next() {
		var p models.UserProfile
		err = rows.Scan(
			&p.ID,
			&p.UserID,
			&p.AcceptedOffersCount,
			&p.SubmittedReportsCount,
			&p.CorrectReportsCount,
			&p.RegisteredAt,
			&p.LastActiveAt,
			&p.AdditionalInfo,
			&p.Username,
			&p.Email,
		)
		if err != nil {
			log.Error(ctx, "Failed to scan user profile row", zap.Error(err))
			return nil, total, err
		}
		profiles = append(profiles, &p)
	}

	return profiles, total, nil
}

// statistics
func (r *SecretGuestRepository) GetStatistics(ctx context.Context) (*models.Statistics, error) {
	// TODO: только для демки. Это нужно сразу убрать!

	query := `
		SELECT
			-- OTA бронирования
			(SELECT COUNT(*) FROM ota_sg_reservations) AS total_ota_reservations,
			(SELECT COUNT(*) FROM ota_sg_reservations WHERE created_at >= NOW() - INTERVAL '24 hours') AS ota_reservations_last_24h,

			-- Предложения (assignments)
			(SELECT COUNT(*) FROM assignments) AS total_assignments,
			(SELECT COUNT(*)
				FROM assignments a
				JOIN assignment_statuses s ON a.status_id = s.id
				WHERE s.slug = 'offered' AND a.reporter_id IS NULL
			) AS open_assignments,
			(SELECT COUNT(*)
				FROM assignments a
				JOIN assignment_statuses s ON a.status_id = s.id
				WHERE s.slug = 'offered' AND a.reporter_id IS NOT NULL
			) AS pending_accept_assignments,

			-- Отказы
			(SELECT COUNT(*) FROM assignment_declines) AS total_assignment_declines,

			-- Отчёты
			(SELECT COUNT(*) FROM reports) AS total_reports,
			(SELECT COUNT(*) FROM reports WHERE created_at::date = CURRENT_DATE) AS reports_today,
			(SELECT COUNT(*) FROM reports WHERE status_id = 3) AS submitted_reports,

			-- Тайные гости (role_id = 3)
			(SELECT COUNT(*) FROM users WHERE role_id = 3) AS total_sg,
			(SELECT COUNT(*) FROM users WHERE role_id = 3 AND created_at >= NOW() - INTERVAL '24 hours') AS new_sg_last_24h
	`

	row := r.db.QueryRow(ctx, query)

	var stats models.Statistics
	err := row.Scan(
		&stats.TotalOtaReservations,
		&stats.OtaReservationsLast24h,
		&stats.TotalAssignments,
		&stats.OpenAssignments,
		&stats.PendingAcceptAssignments,
		&stats.TotalAssignmentDeclines,
		&stats.TotalReports,
		&stats.ReportsToday,
		&stats.SubmittedReports,
		&stats.TotalSg,
		&stats.NewSgLast24h,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to scan statistics: %w", err)
	}

	return &stats, nil
}

// journal

func (r *SecretGuestRepository) GetUserHistory(ctx context.Context, userID uuid.UUID, limit, offset int) ([]*models.Report, int, error) {
	log := logger.GetLoggerFromCtx(ctx)

	countQuery := `SELECT COUNT(*) FROM reports WHERE reporter_id = $1;`
	var total int
	err := r.db.QueryRow(ctx, countQuery, userID).Scan(&total)
	if err != nil {
		log.Error(ctx, "Failed to query total user history count", zap.Error(err), zap.String("user_id", userID.String()))
		return nil, 0, err
	}

	if total == 0 {
		return []*models.Report{}, 0, nil
	}

	query := `
		SELECT
			r.created_at,
			r.purpose,
			r.checkin_date,
			r.checkout_date,
			r.checklist_schema,
			s.slug as status_slug,
			l.id as listing_id,
			l.code as listing_code,
			l.title as listing_title,
			l.description as listing_description,
			l.main_picture as listing_main_picture,
			l.listing_type_id,
			lt.slug as listing_type_slug,
			lt.name as listing_type_name,
			l.address as listing_address
		FROM reports r
		JOIN listings l ON r.listing_id = l.id
		JOIN listing_types lt ON l.listing_type_id = lt.id
		JOIN report_statuses s ON r.status_id = s.id
		WHERE r.reporter_id = $1
		ORDER BY r.created_at DESC
		LIMIT $2 OFFSET $3;
	`

	rows, err := r.db.Query(ctx, query, userID, limit, offset)
	if err != nil {
		log.Error(ctx, "Failed to query user history", zap.Error(err), zap.String("user_id", userID.String()))
		return nil, total, err
	}
	defer rows.Close()

	reports := make([]*models.Report, 0, limit)
	for rows.Next() {
		var rep models.Report
		err = rows.Scan(
			&rep.CreatedAt,
			&rep.Purpose,
			&rep.BookingDetails.CheckinDate,
			&rep.BookingDetails.CheckoutDate,
			&rep.ChecklistSchema,
			&rep.Status.Slug,
			&rep.Listing.ID,
			&rep.Listing.Code,
			&rep.Listing.Title,
			&rep.Listing.Description,
			&rep.Listing.MainPicture,
			&rep.Listing.ListingTypeID,
			&rep.Listing.ListingTypeSlug,
			&rep.Listing.ListingTypeName,
			&rep.Listing.Address,
		)
		if err != nil {
			log.Error(ctx, "Failed to scan user history row", zap.Error(err))
			return nil, total, err
		}
		reports = append(reports, &rep)
	}

	return reports, total, nil
}

// ГЕнерация отчета

func (r *SecretGuestRepository) GetListingTypeID(ctx context.Context, listingID uuid.UUID) (int, error) {
	log := logger.GetLoggerFromCtx(ctx)

	query := `SELECT listing_type_id FROM listings WHERE id = $1`

	var listingTypeID int

	err := r.db.QueryRow(ctx, query, listingID).Scan(&listingTypeID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			log.Info(ctx, "Listing not found by ID when getting type ID", zap.String("listing_id", listingID.String()))
			return 0, models.ErrListingNotFound
		}
		log.Error(ctx, "DB error on getting listing type ID",
			zap.Error(err),
			zap.String("listing_id", listingID.String()),
		)
		return 0, err
	}

	return listingTypeID, nil
}

func (r *SecretGuestRepository) GetChecklistTemplate(ctx context.Context, listingTypeID int) ([]*models.ChecklistSection, []*models.ChecklistItem, error) {
	log := logger.GetLoggerFromCtx(ctx)

	sectionsQuery := `SELECT id, slug, title, sort_order FROM checklist_sections WHERE listing_type_id = $1 ORDER BY sort_order`

	rows, err := r.db.Query(ctx, sectionsQuery, listingTypeID)
	if err != nil {
		log.Error(ctx, "Failed to query checklist sections", zap.Error(err), zap.Int("listing_type_id", listingTypeID))
		return nil, nil, err
	}
	defer rows.Close()

	sections := make([]*models.ChecklistSection, 0)
	for rows.Next() {
		var s models.ChecklistSection
		if err := rows.Scan(&s.ID, &s.Slug, &s.Title, &s.SortOrder); err != nil {
			log.Error(ctx, "Failed to scan checklist section", zap.Error(err))
			return nil, nil, err
		}
		sections = append(sections, &s)
	}
	if err := rows.Err(); err != nil {
		return nil, nil, err
	}

	itemsQuery := `
		SELECT
			ci.id, ci.section_id, ci.slug, ci.title, ci.description,
			at.slug as answer_type_slug, at.name as answer_type_name, at.meta as answer_type_meta,
			mr.slug as media_requirement_slug,
			ci.media_allowed_types, ci.media_max_files, ci.sort_order
		FROM checklist_items ci
		JOIN answer_types at ON ci.answer_type_id = at.id
		JOIN media_requirements mr ON ci.media_requirement_id = mr.id
		WHERE ci.listing_type_id = $1 AND ci.is_active = true
		ORDER BY ci.section_id, ci.sort_order
	`

	rows, err = r.db.Query(ctx, itemsQuery, listingTypeID)
	if err != nil {
		log.Error(ctx, "Failed to query checklist items", zap.Error(err), zap.Int("listing_type_id", listingTypeID))
		return nil, nil, err
	}
	defer rows.Close()

	items := make([]*models.ChecklistItem, 0)
	for rows.Next() {
		var i models.ChecklistItem
		if err := rows.Scan(
			&i.ID, &i.SectionID, &i.Slug, &i.Title, &i.Description,
			&i.AnswerTypeSlug, &i.AnswerTypeName, &i.AnswerTypeMeta,
			&i.MediaRequirementSlug, &i.MediaAllowedTypes, &i.MediaMaxFiles, &i.SortOrder,
		); err != nil {
			log.Error(ctx, "Failed to scan checklist item", zap.Error(err))
			return nil, nil, err
		}
		items = append(items, &i)
	}
	if err := rows.Err(); err != nil {
		return nil, nil, err
	}

	return sections, items, nil
}

func (r *SecretGuestRepository) UpdateReportSchema(ctx context.Context, reportID uuid.UUID, schema models.ChecklistSchema) error {
	log := logger.GetLoggerFromCtx(ctx)

	query := `
		UPDATE reports
		SET checklist_schema = $1, updated_at = NOW()
		WHERE id = $2
	`

	ct, err := r.db.Exec(ctx, query, schema, reportID)
	if err != nil {
		log.Error(ctx, "DB error on updating report schema",
			zap.Error(err),
			zap.String("report_id", reportID.String()),
		)
		return err
	}

	if ct.RowsAffected() == 0 {
		log.Warn(ctx, "Attempt to update schema for a non-existent report",
			zap.String("report_id", reportID.String()),
		)
		return models.ErrReportNotFound
	}

	return nil
}
