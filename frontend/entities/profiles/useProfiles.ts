import { useQuery } from '@tanstack/react-query'
import { profilesApi } from './api'
import { ProfilesFilters } from './types'

export const useProfiles = (filters: ProfilesFilters = {}) => {
  return useQuery({
    queryKey: ['profiles', filters],
    queryFn: () => profilesApi.getProfiles(filters),
    staleTime: 60 * 1000, // 30 seconds
  })
}
