export interface Profile {
  accepted_offers_count: number
  additional_info: Record<string, any>
  correct_reports_count: number
  email: string
  id: string
  last_active_at: string
  registered_at: string
  submitted_reports_count: number
  user_id: string
  username: string
}

export interface ProfilesResponse {
  page: number
  profiles: Profile[]
  total: number
}

export interface ProfilesFilters {
  page?: number
  limit?: number
}
