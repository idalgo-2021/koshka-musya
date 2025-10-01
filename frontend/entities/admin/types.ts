export interface AdminStatistic {
  key: string
  value: number
  description: string
}

export interface AdminStatisticsResponse {
  statistics: AdminStatistic[]
}

export interface StatisticCard {
  key: string
  value: number
  description: string
  icon: string
  color: string
}
