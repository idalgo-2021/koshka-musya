import { api } from '@/shared/api/http'
import { camelCaseKeysDeep } from '@/lib/utils'

export type AnswerType = {
  id: number
  name: string
  slug: string
  meta?: Record<string, unknown>
}

export type AnswerTypesResponse = {
  answer_types: AnswerType[]
}

export type UpsertAnswerTypeRequest = {
  name: string
  slug: string
  meta?: Record<string, unknown>
}

export const AnswerTypesApi = {
  async list(): Promise<AnswerTypesResponse> {
    const res = await api.get<AnswerTypesResponse>('/answer_types', true)
    return res
  },

  async getById(id: number): Promise<AnswerType> {
    const res = await api.get<AnswerType>(`/answer_types/${id}`, true)
    return res
  },

  async create(payload: UpsertAnswerTypeRequest): Promise<AnswerType> {
    const res = await api.post<AnswerType>('/answer_types', payload, true)
    return res
  },

  async update(id: number, payload: UpsertAnswerTypeRequest): Promise<AnswerType> {
    const res = await api.patch<AnswerType>(`/answer_types/${id}`, payload, true)
    return res
  },

  async remove(id: number): Promise<{ success?: boolean }> {
    // Use the shared API delete method
    await api.delete<void>(`/answer_types/${id}`, true)
    return { success: true }
  },
}


