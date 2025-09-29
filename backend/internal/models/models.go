package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// User - основная модель пользователя
type User struct {
	ID           uuid.UUID `json:"id"`
	Username     string    `json:"username"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"password_hash"`
	RoleID       int       `json:"role_id"`
	CreatedAt    time.Time `json:"created_at"`
	RoleName     string    `json:"role_name" db:"role_name"`
}

//================================

// Listing - объект размещения
type Listing struct {
	ID            uuid.UUID   `db:"id"`
	Code          uuid.UUID   `db:"code"` // UUID код объекта размещения во внешней платформе (Островок)
	Title         string      `db:"title"`
	Description   string      `db:"description"`
	MainPicture   *string     `db:"main_picture"`
	ListingTypeID int         `db:"listing_type_id"`
	Address       string      `db:"address"`
	City          string      `db:"city"`
	Country       string      `db:"country"`
	Latitude      float64     `db:"latitude"`
	Longitude     float64     `db:"longitude"`
	CreatedAt     time.Time   `db:"created_at"`
	ListingType   ListingType `db:"-"`
}

// ListingType - тип объекта размещения
type ListingType struct {
	ID   int    `db:"id"`
	Slug string `db:"slug"`
	Name string `db:"name"`
}

//================================

// Reservation - бронирование
type OTAReservation struct {
	ID            uuid.UUID       `db:"ota_id"`
	OTAID         uuid.UUID       `db:"ota_id"`
	BookingNumber string          `db:"booking_number"`
	ListingID     uuid.UUID       `db:"listing_id"`
	CheckinDate   time.Time       `db:"checkin_date"`
	CheckoutDate  time.Time       `db:"checkout_date"`
	StatusID      int             `db:"status_id"`
	SourceMsg     json.RawMessage `db:"source_msg"`

	Pricing json.RawMessage `db:"pricing"`
	Guests  json.RawMessage `db:"guests"`
	// Adults        int     `db:"adults"`
	// Children      int     `db:"children"`
	// PricePerNight float64 `db:"price_per_night"`
	// TotalPrice    float64 `db:"total_price"`
	// PriceCurrency string  `db:"price_currency"`
	// Nights        int     `db:"nights"`

	Status StatusInfo `db:"-"`
}

//================================

//================================

// Assignment - задание(предложения) быть ТГ и провести обследование объекта
type Assignment struct {
	ID uuid.UUID `db:"id"`

	OtaSgReservationID uuid.UUID       `db:"ota_sg_reservation_id"`
	Pricing            json.RawMessage `db:"pricing"`
	Guests             json.RawMessage `db:"guests"`

	Purpose    string     `db:"purpose"`
	CreatedAt  time.Time  `db:"created_at"`
	ExpiresAt  time.Time  `db:"expires_at"`
	AcceptedAt *time.Time `db:"accepted_at"`
	DeclinedAt *time.Time `db:"declined_at"`
	Deadline   *time.Time `db:"deadline"`

	Listing  ListingShortInfo `db:"-"`
	Reporter UserShortInfo    `db:"-"`
	Status   StatusInfo       `db:"-"`

	ListingID  uuid.UUID `db:"listing_id"`
	ReporterID uuid.UUID `db:"reporter_id"`
	StatusID   int       `db:"status_id"`
}

// ================================
type ListingShortInfo struct {
	ID              uuid.UUID `db:"listing_id"`
	Code            uuid.UUID `db:"listing_code"`
	Title           string    `db:"listing_title"`
	Description     string    `db:"listing_description"`
	MainPicture     *string   `db:"listing_main_picture"`
	ListingTypeID   int       `db:"listing_type_id"`
	ListingTypeSlug string    `db:"listing_type_slug"`
	ListingTypeName string    `db:"listing_type_name"`
	Address         string    `db:"listing_address"`
	City            string    `db:"listing_city"`
	Country         string    `db:"listing_country"`
	Latitude        float64   `db:"listing_latitude"`
	Longitude       float64   `db:"listing_longitude"`
}

type UserShortInfo struct {
	ID       uuid.UUID `db:"reporter_id"`
	Username string    `db:"reporter_username"`
	// Username sql.NullString `db:"reporter_username"`
}

type StatusInfo struct {
	ID   int    `db:"status_id"`
	Slug string `db:"status_slug"`
	Name string `db:"status_name"`
}

//================================

// Report - отчет ТГ
type Report struct {
	ID           uuid.UUID  `db:"id"`
	AssignmentID uuid.UUID  `db:"assignment_id"`
	Purpose      string     `db:"purpose"`
	CreatedAt    time.Time  `db:"created_at"`
	UpdatedAt    *time.Time `db:"updated_at"`
	SubmittedAt  *time.Time `db:"submitted_at"`

	Listing  ListingShortInfo `db:"-"`
	Reporter UserShortInfo    `db:"-"`
	Status   StatusInfo       `db:"-"`

	// ChecklistSchema *json.RawMessage `db:"checklist_schema"`
	ChecklistSchema ChecklistSchema `db:"checklist_schema"`

	ListingID  uuid.UUID `db:"listing_id"`
	ReporterID uuid.UUID `db:"reporter_id"`
	StatusID   int       `db:"status_id"`
}

////

type AnswerType struct {
	ID   int             `db:"id"`
	Slug string          `db:"slug"`
	Name string          `db:"name"`
	Meta json.RawMessage `db:"meta"`
}

type MediaRequirement struct {
	ID   int    `db:"id"`
	Slug string `db:"slug"`
	Name string `db:"name"`
}

type ChecklistSection struct {
	ID              int    `db:"id"`
	Slug            string `db:"slug"`
	Title           string `db:"title"`
	SortOrder       int    `db:"sort_order"`
	ListingTypeID   int    `db:"listing_type_id"`
	ListingTypeSlug string `db:"listing_type_slug"`
}

type ChecklistItem struct {
	ID                   int             `db:"id"`
	SectionID            int             `db:"section_id"`
	SectionSlug          string          `db:"section_slug"`
	SectionTitle         string          `db:"section_title"`
	SectionSortOrder     int             `db:"section_sort_order"`
	Slug                 string          `db:"slug"`
	Title                string          `db:"title"`
	Description          *string         `db:"description"`
	AnswerTypeID         int             `db:"answer_type_id"`
	AnswerTypeSlug       string          `db:"answer_type_slug"`
	AnswerTypeName       string          `db:"answer_type_name"`
	AnswerTypeMeta       json.RawMessage `db:"answer_type_meta"`
	MediaRequirementID   int             `db:"media_requirement_id"`
	MediaRequirementSlug string          `db:"media_requirement_slug"`
	MediaRequirementName string          `db:"media_requirement_name"`
	MediaAllowedTypes    []string        `db:"media_allowed_types"`
	MediaMaxFiles        int16           `db:"media_max_files"`
	SortOrder            int             `db:"sort_order"`
	ListingTypeID        int             `db:"listing_type_id"`
	ListingTypeSlug      string          `db:"listing_type_slug"`
	IsActive             bool            `db:"is_active"`
}

type ChecklistSectionUpdate struct {
	Slug          string `db:"slug"`
	Title         string `db:"title"`
	SortOrder     *int   `db:"sort_order"`
	ListingTypeID *int   `db:"listing_type_id"`
}

type ChecklistItemUpdate struct {
	ListingTypeID      *int     `db:"listing_type_id"`
	SectionID          *int     `db:"section_id"`
	AnswerTypeID       *int     `db:"answer_type_id"`
	MediaRequirementID *int     `db:"media_requirement_id"`
	Slug               *string  `db:"slug"`
	Title              *string  `db:"title"`
	Description        *string  `db:"description"`
	MediaAllowedTypes  []string `db:"media_allowed_types"`
	MediaMaxFiles      *int16   `db:"media_max_files"`
	SortOrder          *int     `db:"sort_order"`
	IsActive           *bool    `db:"is_active"`
}

////

type ChecklistSchema map[string]interface{}

////

// MediaRequirementSlugs - константы для слагов требований к медиафайлам.
const (
	MediaRequirementNone     = "none"
	MediaRequirementOptional = "optional"
	MediaRequirementRequired = "required"
)
