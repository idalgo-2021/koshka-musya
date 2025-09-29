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

export interface ChangeUserRoleRequest {
  role_id: number;
}

export interface ResetPasswordRequest {
  new_password: string;
}

export interface BlockUserRequest {
  blocked: boolean;
}

export const UsersApi = {
  async getAllUsers(page = 1, limit = 20, username?: string, role_id?: number): Promise<UsersResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    if (username) {
      params.append('username', username);
    }
    if (role_id) {
      params.append('role_id', role_id.toString());
    }

    return api.get<UsersResponse>(`/users?${params.toString()}`, true);
  },

  async changeUserRole(userId: string, data: ChangeUserRoleRequest): Promise<void> {
    return api.patch<void>(`/users/${userId}/change-role`, data as any, true);
  },

  async resetUserPassword(userId: string, data: ResetPasswordRequest): Promise<void> {
    return api.post<void>(`/users/${userId}/reset-password`, data as any, true);
  },

  async blockUser(userId: string, data: BlockUserRequest): Promise<void> {
    return api.patch<void>(`/users/${userId}/block`, data as any, true);
  },
};
