import { api } from '@/shared/api/http'
import { ProfilesResponse, ProfilesFilters } from './types'

export const profilesApi = {
  getProfiles: async (filters: ProfilesFilters = {}): Promise<ProfilesResponse> => {
    const params = new URLSearchParams()
    
    if (filters.page) {
      params.append('page', filters.page.toString())
    }
    if (filters.limit) {
      params.append('limit', filters.limit.toString())
    }

    return await api.get<ProfilesResponse>(`/staff/profiles?${params.toString()}`, true)
  }
}
