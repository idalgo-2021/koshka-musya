import { useState, useEffect, useCallback } from 'react';
import { profilesApi, type UserProfile } from '@/shared/api/profiles';
import { useAuth } from './useAuth';

export function useUserProfile() {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setProfile(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const profileData = await profilesApi.getMyProfile();
      setProfile(profileData);
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setError(err instanceof Error ? err.message : 'Ошибка загрузки профиля');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile
  };
}
