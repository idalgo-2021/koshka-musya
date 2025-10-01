export type Tab = 'login' | 'register' | 'restore';

export type RegisterInput = {
  username: string;
  email: string;
  password: string;
  phone?: string;
  telegram?: string;
};

export type RegisterResponse = { message: string }; // 201

export type TokenInput = {
  username: string;
  password: string;
};

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
}; // 200

export type ValidateResponse = {
  user_id: string;
  username: string;
}; // 200

export type RefreshInput = {
  refresh_token: string;
};

export type RefreshResponse = {
  access_token: string;
  refresh_token?: string;
};

export type ApiError = { message: string };

export const tokenStorage = {
  get access() { return localStorage.getItem('access_token'); },
  set access(v: string | null) {
    if (v) localStorage.setItem('access_token', v);
    else localStorage.removeItem('access_token');
  },
  get refresh() { return localStorage.getItem('refresh_token'); },
  set refresh(v: string | null) {
    if (v) localStorage.setItem('refresh_token', v);
    else localStorage.removeItem('refresh_token');
  },
  clear() {
    this.access = null;
    this.refresh = null;
  }
};
