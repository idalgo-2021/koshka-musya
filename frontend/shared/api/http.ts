import { AppError, handleApiError, handleNetworkError } from '@/lib/error-handler';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

// const BASE_URL = 'https://3.122.120.231/api';
type Json = Record<string, unknown>;

async function http<T>(path: string, opts: RequestInit & { auth?: boolean } = {}): Promise<T> {
  try {
    const headers = new Headers(opts.headers ?? {});
    headers.set('Accept', 'application/json');

    if (opts.body && !(opts.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    if (opts.auth) {
      const token = localStorage.getItem('access_token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
    }

    const url = `${BASE_URL}${path}`;
    console.log(`Making HTTP request to: ${url}`);
    console.log(`Method: ${opts.method || 'GET'}`);
    console.log(`Headers:`, Object.fromEntries(headers.entries()));
    console.log(`Body:`, opts.body);

    const res = await fetch(url, { ...opts, headers });

    console.log(`Response status: ${res.status}`);
    console.log(`Response headers:`, Object.fromEntries(res.headers.entries()));

    if (res.ok) {
      if (res.status === 204) return undefined as unknown as T;
      if (res.status === 202) {
        // 202 Accepted может не содержать тело ответа
        const text = await res.text();
        if (text.trim() === '') {
          return undefined as unknown as T;
        }
        try {
          return JSON.parse(text) as T;
        } catch {
          return undefined as unknown as T;
        }
      }
      return (await res.json()) as T;
    }

    // Если 401 и был включён auth — попробуем рефреш
    if (res.status === 401 && opts.auth) {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const rr = await fetch(`${BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ refresh_token: refresh }),
          });

          if (rr.ok) {
            const json = (await rr.json()) as { access_token: string; refresh_token?: string };
            localStorage.setItem('access_token', json.access_token);
            if (json.refresh_token) localStorage.setItem('refresh_token', json.refresh_token);
            return await http<T>(path, opts);
          } else {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            throw new AppError(
              'Сессия истекла. Пожалуйста, войдите в систему заново',
              401,
              'AUTH_EXPIRED',
            );
          }
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          throw new AppError(
            'Сессия истекла. Пожалуйста, войдите в систему заново',
            401,
            'AUTH_EXPIRED',
          );
        }
      } else {
        throw new AppError('Необходима авторизация', 401, 'AUTH_REQUIRED');
      }
    }

    let message = `HTTP ${res.status}`;
    let details: unknown;

    try {
      const errorData = await res.json();
      if (errorData?.message) {
        message = errorData.message;
      }
      details = errorData;
    } catch {
      // Ignore JSON parsing errors
    }

    throw new AppError(message, res.status, undefined, details);
  } catch (error) {
    console.log(`HTTP request failed:`, error);
    console.log(`Error type:`, typeof error);
    console.log(`Error message:`, error instanceof Error ? error.message : String(error));

    if (error instanceof AppError) {
      console.log(`AppError thrown:`, error.message);
      throw error;
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.log(`Network error detected:`, error.message);
      throw handleNetworkError(error);
    }

    console.log(`Generic API error:`, error);
    throw handleApiError(error);
  }
}

export const api = {
  post: <T>(path: string, body?: Json, auth = false) =>
    http<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined, auth }),
  get: <T>(path: string, auth = false) => http<T>(path, { method: 'GET', auth }),
  patch: <T>(path: string, body?: Json, auth = false) =>
    http<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined, auth }),
  delete: <T>(path: string, auth = false) => http<T>(path, { method: 'DELETE', auth }),
};
