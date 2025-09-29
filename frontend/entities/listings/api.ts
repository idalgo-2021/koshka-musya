import { api } from '@/shared/api/http'
import {camelCaseKeysDeep} from "@/lib/utils";

export type ListingType = {
  id: number;
  name: string;
  slug: string;
}

export type ListingTypesResponse = {
  listing_types: ListingType[];
}

export type CreateListingRequest = {
  address: string;
  city: string;
  code: string;
  country: string;
  description: string;
  latitude: number;
  listing_type_id: number;
  longitude: number;
  title: string;
}

export type CreateListingTypeRequest = {
  name: string;
  slug: string;
}

export type UpdateListingTypeRequest = {
  name?: string;
  slug?: string;
}

export const ListingsApi = {
  async getPublicListings(page = 1, limit = 20): Promise<{ listings: Array<{ id: string; title: string; description: string; code: string; address: string; city: string; country: string; latitude: number; longitude: number; mainPicture?: string; listing_type: { id: number; name: string; slug: string } }>; page: number; total: number }> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    const data = await api.get(`/listings?${params.toString()}`, true);
    // data = camelCaseKeysDeep(data);
    // @ts-ignore
    return data;
  },
  async getListingById(id: string): Promise<{ id: string; title: string; description: string; code: string; address: string; city: string; country: string; latitude: number; longitude: number; mainPicture?: string; listing_type: { id: number; name: string; slug: string } }>{
    let data = await api.get(`/listings/${id}`, true);
    data = camelCaseKeysDeep(data);
    // @ts-ignore
    return data;
  },
  async getListingTypes(): Promise<ListingTypesResponse> {
    return api.get<ListingTypesResponse>('/listing_types', true)
  },

  async createListingType(payload: CreateListingTypeRequest): Promise<ListingType> {
    return api.post<ListingType>('/listing_types', payload as unknown as Record<string, unknown>, true)
  },

  async updateListingType(id: number, payload: UpdateListingTypeRequest): Promise<ListingType> {
    return api.patch<ListingType>(`/listing_types/${id}`, payload as unknown as Record<string, unknown>, true)
  },

  async deleteListingType(id: number): Promise<void> {
    return api.delete<void>(`/listing_types/${id}`, true)
  },

  async createListing(payload: CreateListingRequest): Promise<unknown> {
    return api.post<unknown>('/admin/listings', payload as unknown as Record<string, unknown>, true)
  },
}


