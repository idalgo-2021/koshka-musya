package models

const (
	AdminRoleID     = 1
	ModeratorRoleID = 2
	GuestRoleID     = 3
)

const (
	AssignmentStatusOffered   = 1 // Предложено
	AssignmentStatusAccepted  = 2 // Принято клиентом
	AssignmentStatusCancelled = 3 // Отменено стафом
	AssignmentStatusDeclined  = 4 // Отклонено клиентом
	AssignmentStatusExpired   = 5 // Просрочено

)

const (
	ReportStatusGenerating       = 1 // Генерация
	ReportStatusDraft            = 2 // Черновик
	ReportStatusSubmitted        = 3 // Сдан клиентом на проверку
	ReportStatusRefused          = 4 // Отказ клиента продолжать заполнение
	ReportStatusApproved         = 5 // Одобрен
	ReportStatusRejected         = 6 // Отклонен
	ReportStatusGenerationFailed = 7 // Ошибка генерации
)

const (
	OTAReservationStatusNew    = 1 // Новое
	OTAReservationStatusHold   = 2 // Зарезервировано
	OTAReservationStatusBooked = 3 // Забронировано
	OTAReservationStatusNoShow = 4 // Скрыто
)
