import { api } from './http';

export interface MediaRequirement {
  id: number;
  name: string;
  description?: string;
  file_type: string;
  max_size: number;
  dimensions?: {
    width: number;
    height: number;
  };
  is_required: boolean;
}

class MediaRequirementsApi {
  async getMediaRequirements(): Promise<MediaRequirement[]> {
    const response = await api.get<{ media_requirements: MediaRequirement[] }>('/media_requirements', true);
    return response.media_requirements;
  }
}

export const mediaRequirementsApi = new MediaRequirementsApi();
