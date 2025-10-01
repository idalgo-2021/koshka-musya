export type ReportStatus = {
  id: number;
  name: string;
  slug: 'generating' | 'draft' | 'submitted' | 'approved' | 'rejected' | 'refused' | 'failed_generation'
};

export type ChecklistSchema = {
  version: string;
  sections: Array<{
    id: number;
    slug: string;
    title: string;
    sort_order: number;
    items: Array<{
      id: number;
      slug: string;
      title: string;
      description?: string;
      sort_order: number;
      answer_types: {
        slug: string;
        name: string;
        meta?: unknown;
      };
      media_requirement: string;
      media_allowed_types?: string[];
      media_max_files?: number;
      answer: {
        result?: string;
        comment?: string;
        media: Array<{
          id: string;
          url: string;
          media_type: string;
        }>;
      };
    }>;
  }>;
};

export type Listing = {
  id: string;
  title: string;
  description: string;
  code?: string;
  main_picture?: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  listing_type: {
    id: number;
    slug: string;
    name: string;
  };
};

export type Report = {
  id: string;
  assignment_id: string;
  purpose: string;
  status: ReportStatus;
  created_at: string;
  updated_at?: string;
  submitted_at?: string;
  checklist_schema?: ChecklistSchema;
  listing: Listing;
  reporter: {
    id: string;
    username: string;
  };
  // Информация о бронировании (структура от бэкенда)
  booking_details?: {
    ota_id?: string;
    booking_number?: string;
    ota_sg_reservation_id?: string;
    pricing?: {
      pricing?: {
        currency: string;
        total: number;
        breakdown?: {
          per_night: number;
          nights: number;
        };
      }
    };
    guests?: {
      adults: number;
      children: number;
    };
    checkin_date?: string;
    checkout_date?: string;
  };
};

export type MyReportsResponse = {
  reports: Report[];
  page?: number;
  total?: number;
};
