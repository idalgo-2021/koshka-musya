import { api } from './http';

export interface JournalEntry {
  created_at: string;
  listing: {
    id: string;
    code: string;
    title: string;
    description: string;
    main_picture?: string;
    listing_type: {
      id: number;
      slug: string;
      name: string;
    };
    address?: string;
  };
  purpose: string;
  checkin_date: string;
  checkout_date: string;
  checklist_schema: any;
  status_slug: string;
}

export interface JournalResponse {
  entries: JournalEntry[];
  total: number;
  page: number;
}

class JournalApi {
  async getMyHistory(page = 1, limit = 20): Promise<JournalResponse> {
    return api.get<JournalResponse>(`/journal/my?page=${page}&limit=${limit}`, true);
  }
}

export const journalApi = new JournalApi();
