import { api } from './http';

export interface ChecklistSection {
  id: number;
  name: string;
  description?: string;
  order: number;
}

export interface CreateChecklistSectionRequest {
  name: string;
  description?: string;
  order: number;
}

export interface UpdateChecklistSectionRequest {
  name?: string;
  description?: string;
  order?: number;
}

class ChecklistSectionsApi {
  async getChecklistSections(): Promise<ChecklistSection[]> {
    const response = await api.get<{ checklist_sections: ChecklistSection[] }>('/checklist_sections', true);
    return response.checklist_sections;
  }

  async getChecklistSectionById(id: number): Promise<ChecklistSection> {
    return api.get<ChecklistSection>(`/checklist_sections/${id}`, true);
  }

  async createChecklistSection(data: CreateChecklistSectionRequest): Promise<ChecklistSection> {
    return api.post<ChecklistSection>('/checklist_sections', data, true);
  }

  async updateChecklistSection(id: number, data: UpdateChecklistSectionRequest): Promise<ChecklistSection> {
    return api.patch<ChecklistSection>(`/checklist_sections/${id}`, data, true);
  }

  async deleteChecklistSection(id: number): Promise<void> {
    return api.delete<void>(`/checklist_sections/${id}`, true);
  }
}

export const checklistSectionsApi = new ChecklistSectionsApi();
