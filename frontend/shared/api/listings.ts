import { api } from './http';

export interface Listing {
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
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
}

export interface CreateListingRequest {
  code: string;
  title: string;
  description: string;
  main_picture?: string;
  listing_type_id: number;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

class ListingsApi {
  // Public endpoints
  async getPublicListings(page = 1, limit = 50): Promise<{ listings: Listing[]; page: number; total: number }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    return api.get<{ listings: Listing[]; page: number; total: number }>(`/listings?${params.toString()}`, true);
  }

  async getListingById(id: string): Promise<Listing> {
    return api.get<Listing>(`/listings/${id}`, true);
  }

}

export const listingsApi = new ListingsApi();
