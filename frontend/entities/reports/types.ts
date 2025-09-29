export type ReportStatus = {
  id: number;
  name: string;
  slug: 'draft' | 'submitted' | 'approved' | 'rejected'
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
};

export type MyReportsResponse = {
  reports: Report[];
  page?: number;
  total?: number;
};
