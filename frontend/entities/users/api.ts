import { api } from '@/shared/api/http';

export interface User {
  id: string;
  username: string;
  email: string;
  role_id: 1 | 2 | 3;
  role_name: string;
  created_at: string;
}

export interface UsersResponse {
  page: number;
  total: number;
  users: User[];
}

export const UsersApi = {
  async getAllUsers(page = 1, limit = 20): Promise<UsersResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    return api.get<UsersResponse>(`/users?${params.toString()}`, true);
  },
};
