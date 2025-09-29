import { api } from '@/shared/api/http';

export type GenerateUrlInput = {
  filename: string;
  content_type: string;
};

export type GenerateUrlResponse = {
  upload_url: string;
  method: 'PUT' | 'POST';
  form_data?: {
    token: string;
    expire: string;
    signature: string;
    publicKey: string;
    fileName: string;
    folder: string;
    tags: string;
  };
  headers?: Record<string, string>;
  public_url?: string; // в некоторых провайдерах приходит сразу
};

export const UploadsApi = {
  async generateUrl(input: GenerateUrlInput): Promise<GenerateUrlResponse> {
    return api.post<GenerateUrlResponse>('/uploads/generate-url', input, true);
  },
};
