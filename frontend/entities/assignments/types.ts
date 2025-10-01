import { SgReservationPricing, SGReservationGuests} from "@/entities/sgReservations/types";

export type Assignment = {
  id: string;
  code: string;
  booking_number?: string;
  title?: string;
  purpose: string;
  pricing?: {
    currency: string;
    total: number;
    breakdown?: {
      per_night: number;
      nights: number;
    };
  };
  guests?: {
    adults: number;
    children: number;
  };
  checkin_date?: string;
  checkout_date?: string;
  // Новые поля для дат и резервации
  dates?: {
    checkin?: string;
    checkout?: string;
  };
  reservation_id?: string;
  listing: {
    id: string;
    title: string;
    description: string;
    code?: string;
    // Дополнительные поля будут загружены отдельно через getHotelDetails
    address?: string;
    city?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    main_picture?: string;
    listing_type?: {
      id: number;
      slug: string;
      name: string;
    };
  };
  reporter: {
    id: string;
    username: string;
  };
  status: {
    id: number;
    slug: string;
    name: string;
  };
  guests?: SGReservationGuests;
  pricing?: SgReservationPricing;
  created_at: string;
  taked_at?: string;
  accepted_at?: string;
  expires_at: string;
  deadline?: string;
};

export type AssignmentsResponse = {
  assignments: Assignment[];
  total: number;
  page: number;
};

export type AssignmentActionResponse = {
  message: string;
};
