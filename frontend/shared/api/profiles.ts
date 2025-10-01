import { api } from './http';

export interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  email: string;
  accepted_offers_count: number;
  submitted_reports_count: number;
  correct_reports_count: number;
  registered_at: string;
  last_active_at?: string;
  additional_info?: any;
  points: number;
  rank: string;
}

export interface UserFilters {
  city?: string;
  propertyTypes?: string[];
  budget?: string;
  dates?: {
    start?: string;
    end?: string;
  };
  preferences?: string[];
}

class ProfilesApi {
  // User endpoints
  async getMyProfile(): Promise<UserProfile> {
    return api.get<UserProfile>('/profiles/my', true);
  }

  // Staff endpoints
  async getAllProfiles(page = 1, limit = 50): Promise<{ profiles: UserProfile[]; page: number; total: number }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    return api.get<{ profiles: UserProfile[]; page: number; total: number }>(`/staff/profiles?${params.toString()}`, true);
  }

  async getProfileByUserId(userId: string): Promise<UserProfile> {
    return api.get<UserProfile>(`/staff/profiles/${userId}`, true);
  }

  async updateFilters(filters: UserFilters): Promise<void> {
    // Поскольку нет endpoint для обновления профиля,
    // мы просто сохраняем фильтры в localStorage
    // В реальном приложении здесь был бы вызов API для обновления additional_info
    localStorage.setItem('userFilters', JSON.stringify(filters));

    // Имитируем успешное сохранение
    return Promise.resolve();
  }

  async getFilters(): Promise<UserFilters | null> {
    try {
      // Сначала проверяем localStorage
      const localFilters = localStorage.getItem('userFilters');
      if (localFilters) {
        return JSON.parse(localFilters);
      }

      // Если нет в localStorage, пытаемся получить из профиля
      try {
        const profile = await this.getMyProfile();
        return profile.additional_info?.filters || null;
      } catch {
        // Если профиль не найден, возвращаем null
        return null;
      }
    } catch (error) {
      console.error('Failed to get filters:', error);
      return null;
    }
  }
}

export const profilesApi = new ProfilesApi();
