import { api } from '@/shared/api/http';
import {toast} from "sonner";

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

    return api.get<UsersResponse>(`/staff/users?${params.toString()}`, true);
  },

  async changeUserRole(userId: string, data: ChangeUserRoleRequest): Promise<void> {
    toast.error('mock change user role' + userId + data.role_id)
    // return api.patch<void>(`/staff/users/${userId}/change-role`, data as any, true);
  },

  async resetUserPassword(userId: string, data: ResetPasswordRequest): Promise<void> {
    toast.error('mock reset user password' + userId + data.new_password)
    // return api.post<void>(`/staff/users/${userId}/reset-password`, data as any, true);
  },

  async blockUser(userId: string, data: BlockUserRequest): Promise<void> {
    toast.error('mock block user' + userId + data.blocked)
    // return api.patch<void>(`/staff/users/${userId}/block`, data as any, true);
  },
};
