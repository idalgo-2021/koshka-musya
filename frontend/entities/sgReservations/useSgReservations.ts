import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sgReservationsApi } from './api'
import { SgReservationsFilters } from './types'

export const useSgReservations = (filters: SgReservationsFilters = {}) => {
  return useQuery({
    queryKey: ['sg-reservations', filters],
    queryFn: () => sgReservationsApi.getReservations(filters),
    staleTime: 30 * 1000, // 30 seconds
  })
}

export const useMarkAsNoShow = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => sgReservationsApi.markAsNoShow(id),
    onSuccess: () => {
      // Invalidate all sg-reservations queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['sg-reservations'] })
    },
  })
}
