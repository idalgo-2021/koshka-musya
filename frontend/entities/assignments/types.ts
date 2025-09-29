import {SGReservationGuests, SGReservationPricing} from "@/entities/sgReservations/api";

export type Assignment = {
  id: string;
  code: string;
  title?: string;
  purpose: string;
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
  pricing?: SGReservationPricing;
  created_at: string;
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
