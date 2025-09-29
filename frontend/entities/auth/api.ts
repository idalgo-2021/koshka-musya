import { api } from '@/shared/api/http';
import type {
  RegisterInput, RegisterResponse,
  TokenInput, TokenResponse,
  ValidateResponse, RefreshInput, RefreshResponse
} from './types';
import { tokenStorage } from './types';

export const AuthApi = {
  async register(input: RegisterInput) {
    return api.post<RegisterResponse>('/auth/register', input);
  },

  async token(input: TokenInput) {
    const res = await api.post<TokenResponse>('/auth/token', input);
    tokenStorage.access = res.access_token;
    tokenStorage.refresh = res.refresh_token;
    return res;
  },

  async validate() {
    return api.post<ValidateResponse>('/auth/validate', {}, true);
  },

  async refresh(input: RefreshInput) {
    const res = await api.post<RefreshResponse>('/auth/refresh', input);
    tokenStorage.access = res.access_token;
    if (res.refresh_token) tokenStorage.refresh = res.refresh_token;
    return res;
  },

  logout() {
    tokenStorage.clear();
  }
};
