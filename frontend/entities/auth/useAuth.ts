import * as React from 'react';
import { AuthApi } from './api';
import { tokenStorage, type TokenInput } from './types';
import { jwtDecode } from "jwt-decode";
import { SessionContextType } from '@/entities/auth/SessionContext';

export const USER_ROLE = {
  Admin: 1,
  Staff: 2,
  User: 3,
};

export type UserRole = 1 | 2 | 3;

const getUserRole = (): UserRole | undefined=> {
  const token = localStorage.getItem('access_token');
  if (!token) {
    return undefined;
  }
  const payload = jwtDecode(token);

  // @ts-ignore
  return payload.role_id;
}

export const roleToString = (role: UserRole | undefined) => {
  switch (role) {
    case USER_ROLE.Admin:
      return 'админ';
    case USER_ROLE.Staff:
      return 'модератор';
    case USER_ROLE.User:
      return 'Пользователь';
    default:
      return '';
  }
}
export type User = { id: string; username: string, role: UserRole | undefined };

export function useAuth() {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  const validate = React.useCallback(async () => {
    if (!tokenStorage.access) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const me = await AuthApi.validate();
      setUser({ id: me.user_id, username: me.username, role: getUserRole() });
      setIsAuthenticated(true);
    } catch {
      // Token is invalid, clear it
      tokenStorage.clear();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { void validate(); }, [validate]);

  return {
    user,
    loading,
    isAuthenticated,
    login: async (input: TokenInput) => {
      setLoading(true);
      try {
        await AuthApi.token(input);
        const me = await AuthApi.validate();
        const role = getUserRole();
        setUser({ id: me.user_id, username: me.username, role, });
        setIsAuthenticated(true);
        setTimeout(() => {
          window.location.href = (role === USER_ROLE.User) ? '/dashboard' : '/admin';
        }, 100);
      } catch (error) {
        tokenStorage.clear();
        setUser(null);
        setIsAuthenticated(false);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    register: AuthApi.register,
    logout: () => {
      AuthApi.logout();
      setUser(null);
      setIsAuthenticated(false);
    },
    validate,
  };
}

// Create session context value from useAuth
export function useSessionContextValue(): SessionContextType {
  const auth = useAuth();

  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.loading,
    login: auth.login,
    logout: auth.logout,
    validate: auth.validate,
  };
}
//
// // Higher-order component to provide session context
// export function withSessionProvider<T extends object>(Component: React.ComponentType<T>) {
//   return function SessionWrappedComponent(props: T) {
//     const sessionValue = useSessionContextValue();
//
//     return (
//       <SessionProvider value={sessionValue}>
//         <Component {...props} />
//       </SessionProvider>
//     );
//   };
// }
