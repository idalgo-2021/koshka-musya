import { api } from '@/shared/api/http';

export interface SGReservationListingType {
  id: number;
  name: string;
  slug: string;
}

export interface SGReservationListing {
  address: string;
  city: string;
  country: string;
  description: string;
  id: string;
  latitude: number;
  listing_type: SGReservationListingType;
  longitude: number;
  main_picture: string;
  title: string;
}

export interface SGReservationDates {
  checkIn: string;
  checkOut: string;
}

export interface SGReservationGuests {
  adults: number;
  children: number;
}

export interface SGReservationPricingBreakdown {
  nights: number;
  per_night: number;
}

export interface SGReservationPricing {
  breakdown: SGReservationPricingBreakdown;
  currency: string;
  total: number;
}

export interface SGReservationData {
  booking_number: string;
  dates: SGReservationDates;
  guests: SGReservationGuests;
  listing: SGReservationListing;
  ota_id: string;
  pricing: SGReservationPricing;
  status: string;
}

export interface CreateSGReservationRequest {
  received_at: string;
  reservation: SGReservationData;
  source: string;
}

export interface SGReservationStatus {
  id: number;
  slug: string;
  name: string;
}

export const SG_RESERVATION_STATUSES: SGReservationStatus[] = [
  { id: 1, slug: 'new', name: 'Новое' },
  { id: 2, slug: 'hold', name: 'Захолдировано' },
  { id: 3, slug: 'booked', name: 'Забронировано' },
  { id: 4, slug: 'no-show', name: 'Не обрабатывать' },
];

export const SGReservationsApi = {
  async createReservation(data: CreateSGReservationRequest): Promise<void> {
    return api.post<void>('/admin/sg_reservations', data as any, true);
  },

  getReservationStatuses(): SGReservationStatus[] {
    return SG_RESERVATION_STATUSES;
  },
};
