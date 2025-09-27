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
	ReportStatusSubmitted        = 3 // Сдан на проверку
	ReportStatusApproved         = 4 // Одобрен
	ReportStatusRejected         = 5 // Отклонен
	ReportStatusGenerationFailed = 6 // Ошибка генерации
)
