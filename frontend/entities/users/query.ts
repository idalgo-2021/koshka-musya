import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { UsersApi } from './api';

export const useUsersQuery = (page: number, limit: number) => {
  return useQuery({
    queryKey: ['users', { page, limit }],
    queryFn: () => UsersApi.getAllUsers(page, limit),
    placeholderData: keepPreviousData,
  });
};
