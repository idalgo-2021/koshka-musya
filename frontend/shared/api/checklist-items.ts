import { api } from './http';

export interface ChecklistItem {
  id: number;
  name: string;
  description?: string;
  checklist_section_id: number;
  order: number;
  is_required: boolean;
}

export interface CreateChecklistItemRequest {
  name: string;
  description?: string;
  checklist_section_id: number;
  order: number;
  is_required: boolean;
}

export interface UpdateChecklistItemRequest {
  name?: string;
  description?: string;
  checklist_section_id?: number;
  order?: number;
  is_required?: boolean;
}

class ChecklistItemsApi {
  async getChecklistItems(): Promise<ChecklistItem[]> {
    const response = await api.get<{ checklist_items: ChecklistItem[] }>('/checklist_items', true);
    return response.checklist_items;
  }

  async getChecklistItemById(id: number): Promise<ChecklistItem> {
    return api.get<ChecklistItem>(`/checklist_items/${id}`, true);
  }

  async createChecklistItem(data: CreateChecklistItemRequest): Promise<ChecklistItem> {
    return api.post<ChecklistItem>('/checklist_items', data, true);
  }

  async updateChecklistItem(id: number, data: UpdateChecklistItemRequest): Promise<ChecklistItem> {
    return api.patch<ChecklistItem>(`/checklist_items/${id}`, data, true);
  }

  async deleteChecklistItem(id: number): Promise<void> {
    return api.delete<void>(`/checklist_items/${id}`, true);
  }
}

export const checklistItemsApi = new ChecklistItemsApi();
