export interface SgReservationStatus {
  id: number
  slug: string
  name: string
}

export interface SgReservationPricing {
  total: number
  currency: string
  breakdown: {
    nights: number
    per_night: number
  }
}

export interface SgReservation {
  id: string
  ota_id: string
  BookingNumber: string
  ListingID: string
  CheckinDate: string
  CheckoutDate: string
  status: SgReservationStatus
  pricing: {
    pricing: SgReservationPricing
  }
  guests: any | null
}

export interface SgReservationsResponse {
  reservations: SgReservation[]
  page: number
  total: number
}

export interface SgReservationsFilters {
  status_id?: number
  page?: number
  limit?: number
}

export interface SGReservationGuests {
  adults: number;
  children: number;
}

export interface CreateSGReservationRequest {
  source: string
  received_at: string
  reservation: {
    booking_number: string
    dates: {
      checkin: string
      checkout: string
    }
    guests: SGReservationGuests;
    ota_id: string
    status: string
    listing: {
      id: string
      city: string
      title: string
      address: string
      country: string
      latitude: number
      longitude: number
      description: string
      listing_type: {
        id: number
        name: string
        slug: string
      }
      main_picture: string
    }
    pricing: SgReservationPricing
  }
}
