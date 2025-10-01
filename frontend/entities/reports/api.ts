import { api } from '@/shared/api/http';
import type { MyReportsResponse, Report } from './types';

export const ReportsApi = {
  async getMyReports(page = 1, limit = 20): Promise<MyReportsResponse> {
    return api.get<MyReportsResponse>(`/reports/my?page=${page}&limit=${limit}`, true);
  },

  async getAllReports(page = 1, limit = 50, status_id?: number): Promise<MyReportsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    if (status_id) {
      params.append('status_id', status_id.toString());
    }

    return api.get<MyReportsResponse>(`/staff/reports?${params.toString()}`, true);
  },

  async getMyReportById(id: string): Promise<Report> {
    return api.get<Report>(`/reports/my/${id}`, true);
  },


  async saveDraft(id: string, data: unknown): Promise<Report> {
    return api.post<Report>(`/reports/my/${id}`, data as Record<string, unknown>, true);
  },

  async submit(id: string): Promise<{ message?: string } & Report> {
    return api.patch<{ message?: string } & Report>(`/reports/my/${id}/submit`, undefined, true);
  },

  async rejectReportByUser(id: string): Promise<{ message?: string } & Report> {
    return api.patch<{ message?: string } & Report>(`/reports/my/${id}/refuse`, undefined, true);
  },

  // Staff actions
  async approve(id: string): Promise<{ message?: string }> {
    return api.patch<{ message?: string }>(`/staff/reports/${id}/approve`, undefined, true);
  },

  async reject(id: string): Promise<{ message?: string }> {
    return api.patch<{ message?: string }>(`/staff/reports/${id}/reject`, undefined, true);
  },

  // Staff: get report by ID
  async getById(id: string): Promise<Report> {
    return api.get<Report>(`/staff/reports/${id}`, true);
  },
};
