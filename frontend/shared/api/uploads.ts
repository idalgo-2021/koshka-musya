import { api } from './http';

export interface UploadUrlRequest {
  filename: string;
  content_type: string;
  file_size: number;
}

export interface UploadUrlResponse {
  upload_url: string;
  file_url: string;
  expires_at: string;
}

class UploadsApi {
  async generateUploadUrl(data: UploadUrlRequest): Promise<UploadUrlResponse> {
    return api.post<UploadUrlResponse>('/uploads/generate-url', data, true);
  }
}

export const uploadsApi = new UploadsApi();
