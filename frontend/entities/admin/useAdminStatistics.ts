import { useQuery } from '@tanstack/react-query'
import { adminApi } from './api'

export const useAdminStatistics = () => {
  return useQuery({
    queryKey: ['admin-statistics'],
    queryFn: adminApi.getStatistics,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  })
}
