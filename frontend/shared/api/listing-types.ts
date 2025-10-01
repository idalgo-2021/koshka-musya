import { api } from './http';

export interface ListingType {
  id: number;
  slug: string;
  name: string;
}

export interface Listing {
  id: string;
  code: string;
  title: string;
  description: string;
  main_picture?: string;
  listing_type: ListingType;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

class ListingTypesApi {
  async getListings(): Promise<Listing[]> {
    const response = await api.get<{ listings: Listing[]; page: number; total: number }>('/listings', true);
    return response.listings;
  }

  async getListingById(id: string): Promise<Listing> {
    const response = await api.get<Listing>(`/listings/${id}`, true);
    return response;
  }

  // Получаем типы объектов из API
  async getListingTypes(): Promise<ListingType[]> {
    const response = await api.get<{ listing_types: ListingType[] }>('/listing_types', true);
    return response.listing_types;
  }

  async getListingTypeById(id: number): Promise<ListingType> {
    return api.get<ListingType>(`/listing_types/${id}`, true);
  }

  async createListingType(data: { name: string; slug: string }): Promise<ListingType> {
    return api.post<ListingType>('/listing_types', data, true);
  }

  async updateListingType(id: number, data: { name: string; slug: string }): Promise<ListingType> {
    return api.patch<ListingType>(`/listing_types/${id}`, data, true);
  }

  async deleteListingType(id: number): Promise<void> {
    return api.delete<void>(`/listing_types/${id}`, true);
  }

  // Получаем уникальные города из списка listings
  async getCities(): Promise<string[]> {
    const listings = await this.getListings();
    const cities = new Set<string>();
    
    listings.forEach(listing => {
      if (listing.city) {
        cities.add(listing.city);
      }
    });
    
    return Array.from(cities).sort();
  }
}

export const listingTypesApi = new ListingTypesApi();
