import {api} from '@/shared/api/http';
import type {Assignment, AssignmentsResponse, AssignmentActionResponse} from './types';

// Тип для полной информации об отеле
export interface HotelDetails {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  main_picture?: string;
  listing_type: {
    id: number;
    slug: string;
    name: string;
  };
}

// Removed ListingDto as it's no longer needed

export const AssignmentsApi = {
  async getMyAssignments(page = 1, limit = 20, status?: string): Promise<AssignmentsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    if (status) {
      params.append('status', status);
    }

    return api.get<AssignmentsResponse>(`/assignments/my?${params.toString()}`, true);
  },

  async getAssignmentById(id: string): Promise<Assignment> {
    return api.get<Assignment>(`/assignments/my/${id}`, true);
  },

  async acceptAssignment(id: string): Promise<AssignmentActionResponse> {
    return api.patch<AssignmentActionResponse>(`/assignments/my/${id}/accept`, undefined, true);
  },

  async declineAssignment(id: string): Promise<AssignmentActionResponse> {
    return api.patch<AssignmentActionResponse>(`/assignments/my/${id}/decline`, undefined, true);
  },

  // Получить детальную информацию об отеле
  async getHotelDetails(hotelId: string): Promise<HotelDetails> {
    return api.get<HotelDetails>(`/listings/${hotelId}`, true);
  },

  // Get all available assignments (free assignments that can be taken)
  async getAvailableAssignments(page = 1, limit = 50, listingTypeId?: number): Promise<AssignmentsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (listingTypeId) {
      params.append('listing_type_id', listingTypeId.toString())
    }
    return api.get<AssignmentsResponse>(`/assignments?${params.toString()}`, true);
  },

  // Staff: Get all assignments with filters (same endpoint as available assignments)
  async getAllAssignmentsStaff(params: { page?: number; limit?: number; reporter_id?: string; status_id?: number[] } = {}): Promise<AssignmentsResponse> {
    const sp = new URLSearchParams();
    sp.set('page', String(params.page ?? 1));
    sp.set('limit', String(params.limit ?? 50));
    if (params.reporter_id) sp.set('reporter_id', params.reporter_id);
    if (params.status_id && params.status_id.length > 0) {
      // backend expects array in query: status_id=1&status_id=2
      sp.delete('status_id');
      params.status_id.forEach((id) => sp.append('status_id', String(id)));
    }
    return api.get<AssignmentsResponse>(`/assignments?${sp.toString()}`, true);
  },

  // Staff: Get assignment by ID
  async getAssignmentByIdStaff(id: string): Promise<Assignment> {
    return api.get<Assignment>(`/assignments/${id}`, true);
  },

  // Take free assignment
  async takeFreeAssignment(id: string): Promise<AssignmentActionResponse> {
    return api.patch<AssignmentActionResponse>(`/assignments/${id}/take`, undefined, true);
  },

  // Staff: Cancel assignment
  async cancelAssignment(id: string): Promise<AssignmentActionResponse> {
    return api.patch<AssignmentActionResponse>(`/staff/assignments/${id}/cancel`, undefined, true);
  },
};
