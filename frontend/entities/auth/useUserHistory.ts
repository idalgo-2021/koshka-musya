import { useState, useEffect, useCallback } from 'react';
import { journalApi, type JournalEntry } from '@/shared/api/journal';
import { useAuth } from './useAuth';

export function useUserHistory() {
  const { user, isAuthenticated } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchHistory = useCallback(async (page = 1, limit = 20) => {
    if (!isAuthenticated || !user?.id) {
      setEntries([]);
      setTotal(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await journalApi.getMyHistory(page, limit);
      setEntries(response.entries);
      setTotal(response.total);
    } catch (err) {
      console.error('Failed to fetch user history:', err);
      setError(err instanceof Error ? err.message : 'Ошибка загрузки истории');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    entries,
    loading,
    error,
    total,
    refetch: fetchHistory
  };
}
