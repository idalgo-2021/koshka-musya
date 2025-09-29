import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { UsersApi } from './api';

export const useUsersQuery = (page: number, limit: number, username?: string, role_id?: number) => {
  return useQuery({
    queryKey: ['users', { page, limit, username, role_id }],
    queryFn: () => UsersApi.getAllUsers(page, limit, username, role_id),
    placeholderData: keepPreviousData,
  });
};
