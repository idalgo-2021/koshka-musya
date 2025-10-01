import { api } from './http';

export interface Reservation {
  id: string;
  listing_id: string;
  guest_name: string;
  guest_email: string;
  check_in: string;
  check_out: string;
  status: string;
  total_amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface CreateReservationRequest {
  listing_id: string;
  guest_name: string;
  guest_email: string;
  check_in: string;
  check_out: string;
  total_amount: number;
  currency: string;
}

class ReservationsApi {
  // Staff endpoints
  async getAllReservations(page = 1, limit = 50): Promise<{ reservations: Reservation[]; page: number; total: number }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    return api.get<{ reservations: Reservation[]; page: number; total: number }>(`/sg_reservations?${params.toString()}`, true);
  }

  async getReservationById(id: string): Promise<Reservation> {
    return api.get<Reservation>(`/sg_reservations/${id}`, true);
  }

  async hideReservation(id: string): Promise<{ message?: string }> {
    return api.patch<{ message?: string }>(`/sg_reservations/${id}/no-show`, undefined, true);
  }

  // Admin endpoints
  async createReservation(data: CreateReservationRequest): Promise<Reservation> {
    return api.post<Reservation>('/admin/sg_reservations', data, true);
  }
}

export const reservationsApi = new ReservationsApi();
