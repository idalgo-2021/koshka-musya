import { api } from './http';

export interface AuthToken {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface ValidateRequest {
  access_token: string;
}

class AuthApi {
  async login(credentials: LoginRequest): Promise<AuthToken> {
    return api.post<AuthToken>('/auth/token', credentials, false);
  }

  async register(userData: RegisterRequest): Promise<AuthToken> {
    return api.post<AuthToken>('/auth/register', userData, false);
  }

  async refreshToken(refreshData: RefreshRequest): Promise<AuthToken> {
    return api.post<AuthToken>('/auth/refresh', refreshData, false);
  }

  async validateToken(tokenData: ValidateRequest): Promise<{ valid: boolean }> {
    return api.post<{ valid: boolean }>('/auth/validate', tokenData, false);
  }
}

export const authApi = new AuthApi();
