import { api } from '@/shared/api/http'

export type ChecklistSection = {
  id: number
  title: string
  slug: string
  sort_order: number
  listing_type_id?: number;
}

export type AnswerType = {
  id: number
  name: string
  slug: string
  meta?: Record<string, unknown>
}

export type MediaRequirement = {
  id: number
  name: string
  slug: string
}

export type ChecklistItem = {
  id: number
  title: string
  description: string
  slug: string
  sort_order: number
  is_active: boolean
  listing_type_id: number
  listing_type_slug: string
  media_max_files: number
  media_allowed_types: string[]
  answer_type: AnswerType
  media_requirement: MediaRequirement
  section: ChecklistSection
}

export type ChecklistItemFull = ChecklistItem

export type ChecklistSectionsResponse = {
  checklist_sections: ChecklistSection[]
}

export type ChecklistItemsResponse = {
  checklist_items: ChecklistItem[]
}

export type CreateSectionRequest = {
  title: string
  slug: string
  sort_order: number
}

export type CreateItemRequest = {
  title: string
  description: string
  slug: string
  sort_order: number
  is_active: boolean
  listing_type_id: number
  media_max_files: number
  media_allowed_types: string[]
  answer_type_id: number
  media_requirement_id: number
  section_id: number
}

export type UpdateItemRequest = Partial<CreateItemRequest>

export type SectionFilters = {
  id?: number[]
  slug?: string[]
  listing_type_id?: number[]
  listing_type_slug?: string[]
}

export const ChecklistApi = {
  // Sections
  async getSectionsFull(filters?: SectionFilters): Promise<ChecklistSectionsResponse> {
    let url = '/staff/checklist_sections'

    if (filters) {
      const params = new URLSearchParams()

      if (filters.id?.length) {
        filters.id.forEach(id => params.append('id', id.toString()))
      }

      if (filters.slug?.length) {
        filters.slug.forEach(slug => params.append('slug', slug))
      }

      if (filters.listing_type_id?.length) {
        filters.listing_type_id.forEach(id => params.append('listing_type_id', id.toString()))
      }

      if (filters.listing_type_slug?.length) {
        filters.listing_type_slug.forEach(slug => params.append('listing_type_slug', slug))
      }

      if (params.toString()) {
        url += `?${params.toString()}`
      }
    }

    return api.get<ChecklistSectionsResponse>(url, true)
  },

  async getSectionById(id: number): Promise<ChecklistSection> {
    return api.get<ChecklistSection>(`/staff/checklist_sections/${id}`, true)
  },

  async createSection(data: Partial<ChecklistSection>): Promise<ChecklistSection> {
    return api.post<ChecklistSection>('/staff/checklist_sections', data, true)
  },

  async updateSection(id: number, data: Partial<ChecklistSection>): Promise<ChecklistSection> {
    return api.patch<ChecklistSection>(`/staff/checklist_sections/${id}`, data, true)
  },

  async deleteSection(id: number): Promise<{ success?: boolean }> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/staff/checklist_sections/${id}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        Authorization: (() => {
          const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
          return token ? `Bearer ${token}` : ''
        })(),
      },
    })
    if (!res.ok && res.status !== 204) {
      const text = await res.text()
      throw new Error(text || `Failed to delete section ${id}`)
    }
    return { success: true }
  },

  // Items
  async getItemsFull(): Promise<ChecklistItemsResponse> {
    return api.get<ChecklistItemsResponse>('/staff/checklist_items', true)
  },

  async getItemById(id: number): Promise<ChecklistItem> {
    return api.get<ChecklistItem>(`/staff/checklist_items/${id}`, true)
  },

  async createItem(data: CreateItemRequest): Promise<ChecklistItem> {
    return api.post<ChecklistItem>('/staff/checklist_items', data, true)
  },

  async updateItem(id: number, data: UpdateItemRequest): Promise<ChecklistItem> {
    return api.patch<ChecklistItem>(`/staff/checklist_items/${id}`, data, true)
  },

  async deleteItem(id: number): Promise<{ success?: boolean }> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/staff/checklist_items/${id}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        Authorization: (() => {
          const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
          return token ? `Bearer ${token}` : ''
        })(),
      },
    })
    if (!res.ok && res.status !== 204) {
      const text = await res.text()
      throw new Error(text || `Failed to delete item ${id}`)
    }
    return { success: true }
  },
}
