import { api } from './http';

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login_at?: string;
}

class UsersApi {
  // Staff endpoints
  async getAllUsers(page = 1, limit = 50): Promise<{ users: User[]; page: number; total: number }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    return api.get<{ users: User[]; page: number; total: number }>(`/users?${params.toString()}`, true);
  }
}

export const usersApi = new UsersApi();
