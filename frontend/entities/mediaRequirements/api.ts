import { api } from '@/shared/api/http'

export type MediaRequirement = {
  id: number
  name: string
  slug: string
}

export type MediaRequirementsResponse = {
  media_requirements: MediaRequirement[]
}

export const MediaRequirementsApi = {
  async list(): Promise<MediaRequirementsResponse> {
    return api.get<MediaRequirementsResponse>('/staff/media_requirements', true)
  },
}


