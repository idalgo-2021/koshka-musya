import { api } from '@/shared/api/http'
import { SgReservationsResponse, SgReservationsFilters, SgReservationStatus, CreateSGReservationRequest } from './types'
import { SG_RESERVATION_STATUSES } from './constants'

export const sgReservationsApi = {
  getReservations: async (filters: SgReservationsFilters = {}): Promise<SgReservationsResponse> => {
    const params = new URLSearchParams()

    if (filters.status_id) {
      params.append('status_id', filters.status_id.toString())
    }
    if (filters.page) {
      params.append('page', filters.page.toString())
    }
    if (filters.limit) {
      params.append('limit', filters.limit.toString())
    }

    return await api.get<SgReservationsResponse>(`/staff/sg_reservations?${params.toString()}`, true);
  },

  getStatuses: async (): Promise<SgReservationStatus[]> => {
    // Return hardcoded statuses
    return Promise.resolve(SG_RESERVATION_STATUSES)
  },

  markAsNoShow: async (id: string): Promise<void> => {
    await api.patch(`/staff/sg_reservations/${id}/no-show`, {}, true);
  },

  createReservation: async (data: CreateSGReservationRequest): Promise<void> => {
    await api.post('/staff/sg_reservations', data, true);
  }
}
