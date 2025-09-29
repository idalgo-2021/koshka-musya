//
// Модели для передачи входящих данных(хендлеры -> сервисный слой)
///////////////////////////////////////////////////////////////////

package secret_guest

import (
	"encoding/json"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/ostrovok-hackathon-2025/koshka-musya/internal/models"
)

type ListingTypeResponse struct {
	ID   int    `json:"id"`
	Slug string `json:"slug"`
	Name string `json:"name"`
}

//================================

type CreateListingRequestDTO struct {
	Code          uuid.UUID `json:"code" validate:"required,uuid"`
	Title         string    `json:"title" validate:"required"`
	Description   string    `json:"description" validate:"required"`
	MainPicture   *string   `json:"main_picture,omitempty"`
	ListingTypeID int       `json:"listing_type_id" validate:"required,gt=0"`
	Address       string    `json:"address" validate:"required"`
	City          string    `json:"city" validate:"required"`
	Country       string    `json:"country" validate:"required"`
	Latitude      float64   `json:"latitude" validate:"required,gt=0"`
	Longitude     float64   `json:"longitude" validate:"required,gt=0"`
}

type GetListingsRequestDTO struct {
	Page           int
	Limit          int
	ListingTypeIDs []int
}

type ListingResponseDTO struct {
	ID          uuid.UUID           `json:"id" db:"id"`
	Code        uuid.UUID           `json:"code" db:"code"`
	Title       string              `json:"title" db:"title"`
	Description string              `json:"description" db:"description"`
	MainPicture *string             `json:"main_picture,omitempty" db:"main_picture"`
	ListingType ListingTypeResponse `json:"listing_type"`
	Address     string              `json:"address" db:"address"`
	City        string              `json:"city" db:"city"`
	Country     string              `json:"country" db:"country"`
	Latitude    float64             `json:"latitude" db:"latitude"`
	Longitude   float64             `json:"longitude" db:"longitude"`
}

type ListingsResponse struct {
	Listings []*ListingResponseDTO `json:"listings"`
	Total    int                   `json:"total"`
	Page     int                   `json:"page"`
}

// ================================
type OTAReservationRequestDTO struct {
	Reservation OTAReservationDTO `json:"reservation" validate:"required"`
	Source      string            `json:"source" validate:"required"`
	ReceivedAt  time.Time         `json:"received_at" validate:"required"`
}

type OTAReservationDTO struct {
	OTAID         uuid.UUID                `json:"ota_id" validate:"required,uuid"`
	BookingNumber string                   `json:"booking_number" validate:"required"`
	Status        string                   `json:"status" validate:"required"`
	Listing       OTAReservationListingDTO `json:"listing" validate:"required"`
	Dates         OTAReservationDates      `json:"dates" validate:"required"`
	Guests        OTAReservationGuests     `json:"guests" validate:"required"`
	Pricing       OTAReservationPricing    `json:"pricing" validate:"required"`
}

type OTAReservationListingDTO struct {
	ID          uuid.UUID           `json:"id" validate:"required,uuid"`
	Title       string              `json:"title" validate:"required"`
	Description string              `json:"description" validate:"required"`
	MainPicture string              `json:"main_picture" validate:"required"`
	ListingType ListingTypeResponse `json:"listing_type" validate:"required"`
	Address     string              `json:"address" validate:"required"`
	City        string              `json:"city" validate:"required"`
	Country     string              `json:"country" validate:"required"`
	Latitude    float64             `json:"latitude" validate:"required"`
	Longitude   float64             `json:"longitude" validate:"required"`
}

type OTAReservationDates struct {
	Checkin  time.Time `json:"checkin" validate:"required"`
	Checkout time.Time `json:"checkout" validate:"required"`
}

type OTAReservationGuests struct {
	// Adults   int `json:"adults" validate:"required,gte=0"`
	// Children int `json:"children" validate:"required,gte=0"`
	Adults   int `json:"adults" validate:"gte=0"`
	Children int `json:"children" validate:"gte=0"`
}

type OTAReservationPricing struct {
	Currency  string                         `json:"currency" validate:"required"`
	Total     int                            `json:"total" validate:"required,gte=0"`
	Breakdown OTAReservationPricingBreakdown `json:"breakdown" validate:"required"`
}

type OTAReservationPricingBreakdown struct {
	PerNight int `json:"per_night" validate:"required,gte=0"`
	Nights   int `json:"nights" validate:"required,gte=0"`
}

type GetAllOTAReservationsRequestDTO struct {
	StatusIDs []int
	Page      int
	Limit     int
}

type OTAReservationResponseDTO struct {
	ID            uuid.UUID       `json:"id" db:"ota_id"`
	OTAID         uuid.UUID       `json:"ota_id" validate:"required,uuid"`
	BookingNumber string          `db:"booking_number"`
	ListingID     uuid.UUID       `db:"listing_id"`
	CheckinDate   time.Time       `db:"checkin_date"`
	CheckoutDate  time.Time       `db:"checkout_date"`
	Status        StatusResponse  `json:"status"`
	Pricing       json.RawMessage `json:"pricing" swaggertype:"object"`
	Guests        json.RawMessage `json:"guests" swaggertype:"object"`
}

type OTAReservationsResponse struct {
	Reservations []*OTAReservationResponseDTO `json:"reservations"`
	Total        int                          `json:"total"`
	Page         int                          `json:"page"`
}

// ================================
type CreateAssignmentRequestDTO struct {
	Code       uuid.UUID `json:"code" validate:"required,uuid"`
	ListingID  uuid.UUID `json:"listing_id" validate:"required,uuid"`
	ReporterID uuid.UUID `json:"reporter_id" validate:"required,uuid"`
	Purpose    string    `json:"purpose" validate:"required"`
	ExpiresAt  time.Time `json:"expires_at" validate:"required"`
}

type GetMyAssignmentsRequestDTO struct {
	UserID uuid.UUID
	Page   int
	Limit  int
}

type GetFreeAssignmentsRequestDTO struct {
	Page           int
	Limit          int
	ListingTypeIDs []int
}

type GetAllAssignmentsRequestDTO struct {
	Page           int
	Limit          int
	ReporterID     *uuid.UUID
	StatusIDs      []int
	ListingTypeIDs []int
}

type AssignmentResponseDTO struct {
	ID uuid.UUID `json:"id"`

	OtaSgReservationID uuid.UUID       `json:"reservation_id"`
	Pricing            json.RawMessage `json:"pricing" swaggertype:"object"`
	Guests             json.RawMessage `json:"guests" swaggertype:"object"`

	Purpose  string               `json:"purpose"`
	Listing  ListingShortResponse `json:"listing"`
	Reporter ReporterResponse     `json:"reporter"`
	Status   StatusResponse       `json:"status"`

	CreatedAt  time.Time  `json:"created_at"`
	AcceptedAt *time.Time `json:"accepted_at,omitempty"`

	ExpiresAt time.Time  `json:"expires_at"`
	Deadline  *time.Time `json:"deadline,omitempty"`
}

type AssignmentsResponse struct {
	Assignments []*AssignmentResponseDTO `json:"assignments"`
	Total       int                      `json:"total"`
	Page        int                      `json:"page"`
}

//================================

type ListingShortResponse struct {
	ID          uuid.UUID           `json:"id"`
	Code        uuid.UUID           `json:"code"`
	Title       string              `json:"title"`
	Description string              `json:"description"`
	MainPicture *string             `json:"main_picture,omitempty"`
	ListingType ListingTypeResponse `json:"listing_type"`
	Address     string              `json:"address"`
	City        string              `json:"city"`
	Country     string              `json:"country"`
	Latitude    float64             `json:"latitude"`
	Longitude   float64             `json:"longitude"`
}

type ReporterResponse struct {
	ID       uuid.UUID `json:"id"`
	Username string    `json:"username"`
}

type StatusResponse struct {
	ID   int    `json:"id"`
	Slug string `json:"slug"`
	Name string `json:"name"`
}

//================================

type GetMyReportsRequestDTO struct {
	UserID uuid.UUID
	Page   int
	Limit  int
}

type GetAllReportsRequestDTO struct {
	Page       int
	Limit      int
	ReporterID *uuid.UUID
	StatusIDs  []int
}

type ReportResponseDTO struct {
	ID           uuid.UUID            `json:"id"`
	AssignmentID uuid.UUID            `json:"assignment_id"`
	Purpose      string               `json:"purpose"`
	Listing      ListingShortResponse `json:"listing"`
	Reporter     ReporterResponse     `json:"reporter"`
	Status       StatusResponse       `json:"status"`

	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   *time.Time `json:"updated_at"`
	SubmittedAt *time.Time `json:"submitted_at"`

	ChecklistSchema models.ChecklistSchema `json:"checklist_schema"`
}

type ReportsResponse struct {
	Reports []*ReportResponseDTO `json:"reports"`
	Total   int                  `json:"total"`
	Page    int                  `json:"page"`
}

//////

type UpdateReportRequestDTO struct {
	ChecklistSchema models.ChecklistSchema `json:"checklist_schema"`
}

// //////////////////////
type ChecklistSchema struct {
	Version  string           `json:"version"`
	Sections []*SectionSchema `json:"sections"`
}

type SectionSchema struct {
	ID        int           `json:"id"`
	Slug      string        `json:"slug"`
	Title     string        `json:"title"`
	SortOrder int           `json:"sort_order"`
	Items     []*ItemSchema `json:"items"`
}

type ItemSchema struct {
	ID                int                `json:"id"`
	Slug              string             `json:"slug"`
	Title             string             `json:"title"`
	Description       *string            `json:"description,omitempty"`
	AnswerTypes       *AnswerTypesSchema `json:"answer_types"`
	MediaRequirement  string             `json:"media_requirement"`
	MediaAllowedTypes []string           `json:"media_allowed_types,omitempty"`
	MediaMaxFiles     *int16             `json:"media_max_files,omitempty"`
	SortOrder         int                `json:"sort_order"`
	Answer            *Answer            `json:"answer"`
}

type AnswerTypesSchema struct {
	Slug string          `json:"slug"`
	Name string          `json:"name"`
	Meta json.RawMessage `json:"meta,omitempty" swaggertype:"object"`
}

type Answer struct {
	// Text    *string      `json:"text,omitempty"`
	// Rating  *int         `json:"rating,omitempty"`
	// Boolean *bool        `json:"boolean,omitempty"`
	Result  *string      `json:"result,omitempty"`
	Media   []*MediaFile `json:"media"`
	Comment *string      `json:"comment,omitempty"`
}

type MediaFile struct {
	ID        uuid.UUID `json:"id"`
	URL       string    `json:"url"`
	MediaType string    `json:"media_type"` // image, video
}

////////////////////////

type ErrorResponse struct {
	Message string `json:"message" example:"An unexpected error occurred."`
}

////////////////////////

func (d *UpdateReportRequestDTO) Validate() error {

	// наличие поля
	if d.ChecklistSchema == nil {
		return models.ErrInvalidChecklistSchema
	}

	// поле не пустое
	if len(d.ChecklistSchema) == 0 {
		return models.ErrInvalidChecklistSchema
	}

	return nil

}

/////////////////////////

type GenerateUploadURLRequest struct {
	FileName string `json:"fileName"`
}

func (r *GenerateUploadURLRequest) Validate() error {
	if strings.TrimSpace(r.FileName) == "" {
		return models.ErrInvalidInput
	}
	return nil
}

type UploadFormDataDTO struct {
	Token     string `json:"token"`
	Expire    string `json:"expire"`
	Signature string `json:"signature"`
	PublicKey string `json:"publicKey"`
	FileName  string `json:"fileName"`
	Folder    string `json:"folder"`
	Tags      string `json:"tags"`
}

type GenerateUploadURLResponse struct {
	UploadURL string            `json:"upload_url"`
	Method    string            `json:"method"`
	FormData  UploadFormDataDTO `json:"form_data"`
	Headers   map[string]string `json:"headers"`
}

//////

type GetAnswerTypesRequestDTO struct {
	AnswerTypeIDs   []int
	AnswerTypeSlugs []string
}

type AnswerTypeResponse struct {
	ID   int             `json:"id"`
	Slug string          `json:"slug"`
	Name string          `json:"name"`
	Meta json.RawMessage `json:"meta,omitempty" swaggertype:"object"`
}

type AnswerTypesResponse struct {
	AnswerTypes []*AnswerTypeResponse `json:"answer_types"`
}

type CreateAnswerTypeRequestDTO struct {
	Slug string          `json:"slug" validate:"required"`
	Name string          `json:"name" validate:"required"`
	Meta json.RawMessage `json:"meta" swaggertype:"object"` // Meta может быть null
}

type UpdateAnswerTypeRequestDTO struct {
	Slug *string `json:"slug,omitempty"`
	Name *string `json:"name,omitempty"`
	// Для обновления/очистки meta передаем либо новый JSON, либо null
	Meta *json.RawMessage `json:"meta" swaggertype:"object"`
}

// ////
type GetMediaRequirementsRequestDTO struct {
	MediaRequirementIDs   []int
	MediaRequirementSlugs []string
}

type MediaRequirementResponse struct {
	ID   int    `json:"id"`
	Slug string `json:"slug"`
	Name string `json:"name"`
}

type MediaRequirementsResponse struct {
	MediaRequirements []*MediaRequirementResponse `json:"media_requirements"`
}

// ////

type GetListingTypesRequestDTO struct {
	ListingTypeIDs   []int
	ListingTypeSlugs []string
}

type ListingTypesResponse struct {
	ListingTypes []*ListingTypeResponse `json:"listing_types"`
}

type CreateListingTypeRequestDTO struct {
	Slug string `json:"slug" validate:"required"`
	Name string `json:"name" validate:"required"`
}

type UpdateListingTypeRequestDTO struct {
	Slug *string `json:"slug,omitempty"`
	Name *string `json:"name,omitempty"`
}

// ////

type GetChecklistSectionsRequestDTO struct {
	IDs              []int
	Slugs            []string
	ListingTypeIDs   []int
	ListingTypeSlugs []string
}

type ChecklistSectionResponse struct {
	ID              int    `json:"id"`
	Slug            string `json:"slug"`
	Title           string `json:"title"`
	SortOrder       int    `json:"sort_order"`
	ListingTypeID   int    `json:"listing_type_id"`
	ListingTypeSlug string `json:"listing_type_slug"`
}

type ChecklistSectionsResponse struct {
	ChecklistSections []*ChecklistSectionResponse `json:"checklist_sections"`
}

type CreateChecklistSectionRequestDTO struct {
	ListingTypeID int    `json:"listing_type_id" validate:"required,gt=0"`
	Slug          string `json:"slug" validate:"required"`
	Title         string `json:"title" validate:"required"`
	SortOrder     int    `json:"sort_order" validate:"gte=0"`
}

type UpdateChecklistSectionRequestDTO struct {
	Slug          *string `json:"slug,omitempty"`
	Title         *string `json:"title,omitempty"`
	SortOrder     *int    `json:"sort_order,omitempty" validate:"omitempty,gte=0"`
	ListingTypeID *int    `json:"listing_type_id,omitempty" validate:"omitempty,gt=0"`
}

// ////

type GetChecklistItemsRequestDTO struct {
	IDs              []int
	Slugs            []string
	ListingTypeIDs   []int
	ListingTypeSlugs []string
	IsActive         *bool
}

type ChecklistItemSectionInfo struct {
	ID        int    `json:"id"`
	Slug      string `json:"slug"`
	Title     string `json:"title"`
	SortOrder int    `json:"sort_order"`
}

type ChecklistItemAnswerTypeInfo struct {
	ID   int             `json:"id"`
	Slug string          `json:"slug"`
	Name string          `json:"name"`
	Meta json.RawMessage `json:"meta,omitempty" swaggertype:"object"`
}

type ChecklistItemMediaRequirementInfo struct {
	ID   int    `json:"id"`
	Slug string `json:"slug"`
	Name string `json:"name"`
}

type ChecklistItemResponse struct {
	ID                int                               `json:"id"`
	Slug              string                            `json:"slug"`
	Title             string                            `json:"title"`
	Description       *string                           `json:"description,omitempty"`
	Section           ChecklistItemSectionInfo          `json:"section"`
	SortOrder         int                               `json:"sort_order"`
	AnswerType        ChecklistItemAnswerTypeInfo       `json:"answer_type"`
	MediaRequirement  ChecklistItemMediaRequirementInfo `json:"media_requirement"`
	MediaAllowedTypes []string                          `json:"media_allowed_types,omitempty"`
	MediaMaxFiles     int16                             `json:"media_max_files,omitempty"`
	ListingTypeID     int                               `json:"listing_type_id"`
	ListingTypeSlug   string                            `json:"listing_type_slug"`
	IsActive          bool                              `json:"is_active"`
}

type ChecklistItemsResponse struct {
	ChecklistItems []*ChecklistItemResponse `json:"checklist_items"`
}

type CreateChecklistItemRequestDTO struct {
	ListingTypeID      int      `json:"listing_type_id" validate:"required,gt=0"`
	SectionID          int      `json:"section_id" validate:"required,gt=0"`
	AnswerTypeID       int      `json:"answer_type_id" validate:"required,gt=0"`
	MediaRequirementID int      `json:"media_requirement_id" validate:"required,gt=0"`
	Slug               string   `json:"slug" validate:"required"`
	Title              string   `json:"title" validate:"required"`
	Description        *string  `json:"description,omitempty"`
	MediaAllowedTypes  []string `json:"media_allowed_types"`
	MediaMaxFiles      int16    `json:"media_max_files" validate:"gte=0"`
	SortOrder          int      `json:"sort_order" validate:"gte=0"`
	IsActive           *bool    `json:"is_active"`
}

type UpdateChecklistItemRequestDTO struct {
	ListingTypeID      *int     `json:"listing_type_id,omitempty" validate:"omitempty,gt=0"`
	SectionID          *int     `json:"section_id,omitempty" validate:"omitempty,gt=0"`
	AnswerTypeID       *int     `json:"answer_type_id,omitempty" validate:"omitempty,gt=0"`
	MediaRequirementID *int     `json:"media_requirement_id,omitempty" validate:"omitempty,gt=0"`
	Slug               *string  `json:"slug,omitempty"`
	Title              *string  `json:"title,omitempty"`
	Description        *string  `json:"description,omitempty"`
	MediaAllowedTypes  []string `json:"media_allowed_types,omitempty"`
	MediaMaxFiles      *int16   `json:"media_max_files,omitempty" validate:"omitempty,gte=0"`
	SortOrder          *int     `json:"sort_order,omitempty" validate:"omitempty,gte=0"`
	IsActive           *bool    `json:"is_active,omitempty"`
}

// ================================

type GetAllUsersRequestDTO struct {
	Page  int
	Limit int
}

type UserResponseDTO struct {
	ID        uuid.UUID `json:"id"`
	Username  string    `json:"username"`
	Email     *string   `json:"email"`
	RoleID    int       `json:"role_id"`
	RoleName  string    `json:"role_name"`
	CreatedAt time.Time `json:"created_at"`
}

type UsersResponse struct {
	Users []*UserResponseDTO `json:"users"`
	Total int                `json:"total"`
	Page  int                `json:"page"`
}
