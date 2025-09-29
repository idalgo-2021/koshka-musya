package models

import "errors"

// TO DO: провести ревизию ошибок

var (
	ErrSecretKeyJwt = errors.New("invalid JWT secret")
	ErrJwtLifetime  = errors.New("invalid JWT lifetime")

	ErrInvalidToken = errors.New("invalid or expired token")

	ErrUnexpected = errors.New("unexpected error occurred")

	ErrJwtSecretKey = errors.New("missing JWT secret key in config")
	ErrJwtLifitime  = errors.New("invalid token lifetimes")

	ErrUserExists         = errors.New("user with this username already exists")
	ErrEmailExists        = errors.New("user with this email already exists")
	ErrUserNotFound       = errors.New("user not found")
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrInvalidEmail       = errors.New("invalid email")
	ErrInvalidPassword    = errors.New("invalid password")
	ErrInvalidUsername    = errors.New("invalid username")

	ErrDataBaseQuery = errors.New("database query error")

	ErrAuthHeaderMissing = errors.New("authorization header is required")
	ErrAuthHeaderInvalid = errors.New("invalid authorization header format")

	ErrListingCannotBeCreated = errors.New("listing cannot be created")
	ErrListingNotFound        = errors.New("listing not found")

	ErrListingTypeNotFound = errors.New("listing type not found")

	ErrOTAReservationCannotBeCreated = errors.New("OTA reservation cannot be created")
	ErrOTAReservationNotFound        = errors.New("OTA reservation not found")

	ErrAssignmentCannotBeCreated = errors.New("assignment cannot be created")
	ErrAssignmentNotFound        = errors.New("assignment not found")

	ErrAssignmentCannotBeAccepted = errors.New("assignment cannot be accepted")
	ErrAssignmentCannotBeDeclined = errors.New("assignment cannot be declined")
	ErrAssignmentCannotBeTaken    = errors.New("assignment cannot be taken")

	ErrReportNotFound         = errors.New("report not found")
	ErrForbidden              = errors.New("forbidden")
	ErrReportNotEditable      = errors.New("report not editable")
	ErrValidationFailed       = errors.New("validation failed")
	ErrReportCannotBeApproved = errors.New("report cannot be approved")
	ErrReportCannotBeRejected = errors.New("report cannot be rejected")

	ErrInvalidChecklistSchema = errors.New("invalid checklist schema")

	ErrInvalidInput = errors.New("fileName cannot be empty")

	ErrNotFound            = errors.New("resource not found")
	ErrDuplicate           = errors.New("resource with this key already exists")
	ErrInUse               = errors.New("resource is in use and cannot be deleted")
	ErrForeignKeyViolation = errors.New("foreign key constraint violated")
)
