// import { api } from '@/shared/api/http'

export interface AdminStatistic {
  key: string
  value: number
  description: string
}

export interface AdminStatisticsResponse {
  statistics: AdminStatistic[]
}

const mockStats = JSON.parse(`{
  "statistics": [
    {
      "key": "total_ota_reservations",
      "value": 3,
      "description": "Всего бронирований от OTA"
    },
    {
      "key": "ota_reservations_last_24h",
      "value": 3,
      "description": "Новых бронирований от OTA за 24 часа"
    },
    {
      "key": "total_assignments",
      "value": 2,
      "description": "Всего предложений"
    },
    {
      "key": "open_assignments",
      "value": 2,
      "description": "Свободных предложений"
    },
    {
      "key": "pending_accept_assignments",
      "value": 0,
      "description": "Предложений, ожидающих принятия"
    },
    {
      "key": "total_assignment_declines",
      "value": 0,
      "description": "Всего отказов от предложений"
    },
    {
      "key": "total_reports",
      "value": 0,
      "description": "Всего отчетов"
    },
    {
      "key": "reports_today",
      "value": 0,
      "description": "Отчетов создано сегодня"
    },
    {
      "key": "submitted_reports",
      "value": 0,
      "description": "Ждут модерации"
    },
    {
      "key": "total_sg",
      "value": 10,
      "description": "Всего тайных гостей"
    },
    {
      "key": "new_sg_last_24h",
      "value": 10,
      "description": "Новых тайных гостей за 24 часа"
    }
  ]
}`);
export const adminApi = {
  // getStatistics: async (): Promise<AdminStatisticsResponse> => {
  getStatistics: (): AdminStatisticsResponse => {
    return mockStats;
    // return new Promise(resolve => mockStats)
    // return await api.get<AdminStatisticsResponse>('/admin/statistics')
  }
}
