import * as React from 'react';
import { AssignmentsApi } from './api';
import { ReportsApi } from '../reports/api';
import type { Assignment } from './types';
import { useErrorHandler } from '@/hooks/useErrorHandler';

export function useAssignments() {
  const [assignments, setAssignments] = React.useState<Assignment[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [retryCount, setRetryCount] = React.useState(0);

  // Загружаем отклоненные задания из localStorage при инициализации
  const [declinedAssignments, setDeclinedAssignments] = React.useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        return new Set();
      } catch (error) {
        console.error('Error loading declined assignments from localStorage:', error);
        return new Set();
      }
    }
    return new Set();
  });

  const { handleError, handleSilentError } = useErrorHandler();

  // Функция для сохранения отклоненных заданий в localStorage
  const saveDeclinedAssignments = React.useCallback((declinedSet: Set<string>) => {
    if (typeof window !== 'undefined') {
      try {
        // Saved declined assignments to localStorage
      } catch (error) {
        console.error('Error saving declined assignments to localStorage:', error);
      }
    }
  }, []);

  const fetchAssignments = React.useCallback(async (page = 1, limit = 20, retry = false, city?: string) => {
    if (!retry) {
      setLoading(true);
      setError(null);
    }

    try {
      // Логируем информацию о пользователе
      const token = localStorage.getItem('access_token');

      // Получаем свободные задания (offered) через /assignments (без фильтра по пользователю)
      const offeredResponse = await AssignmentsApi.getAvailableAssignments(page, limit, undefined, city);

      // Фильтруем отклоненные задания из доступных
      const filteredOfferedAssignments = offeredResponse.assignments.filter(assignment =>
        !declinedAssignments.has(assignment.id)
      );
      // Получаем мои assignments (принятые мной) через /assignments/my
      let myAssignments: Assignment[] = [];
      try {
        const myAssignmentsResponse = await AssignmentsApi.getMyAssignments(page, limit);
        myAssignments = myAssignmentsResponse.assignments;
      } catch (myAssignmentsErr) {
        // Игнорируем ошибку для моих assignments
      }

      // Получаем принятые задания через /reports/my (отчеты в статусе draft)
      let acceptedAssignments: Assignment[] = [];
      try {
        const reportsResponse = await ReportsApi.getMyReports(page, limit);

        // Преобразуем отчеты в формат заданий
        acceptedAssignments = reportsResponse.reports
          .filter(report => {
            const hasAssignmentId = !!report.assignment_id;
            const isNotDeclined = !declinedAssignments.has(report.assignment_id || '');
            return hasAssignmentId && isNotDeclined;
          })
          .map(report => ({
            id: report.assignment_id!,
            code: report.id, // Используем ID отчета как код
            status: {
              id: 2, // accepted
              slug: 'accepted',
              name: 'Принято'
            },
            listing: {
              id: report.listing?.id || '',
              title: report.listing?.title || '',
              description: report.listing?.description || '',
              address: report.listing?.address || '',
              city: report.listing?.city || '',
              country: report.listing?.country || '',
              latitude: report.listing?.latitude || 0,
              longitude: report.listing?.longitude || 0,
              main_picture: report.listing?.main_picture || '',
              listing_type: report.listing?.listing_type || {
                id: 1,
                slug: 'hotel',
                name: 'Отель'
              }
            },
            purpose: report.purpose || '',
            reporter: {
              id: 'current-user', // Заглушка, так как в Report нет reporter
              username: 'current-user'
            },
            created_at: report.created_at || new Date().toISOString(),
            expires_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString() // +10 дней
          }));

      } catch (reportsErr) {
        // No reports or error
        // Игнорируем ошибку для отчетов
      }

      // Проверяем, есть ли у пользователя активные задания
      const hasActiveAssignments = myAssignments.length > 0 || acceptedAssignments.length > 0;

      // Объединяем задания: если есть активные, то только их, иначе добавляем предложения
      const allAssignments = hasActiveAssignments
        ? [...myAssignments, ...acceptedAssignments] // Только активные задания
        : [...filteredOfferedAssignments, ...myAssignments, ...acceptedAssignments]; // Все задания

      // Combined assignments logic

      setAssignments(allAssignments);
      setRetryCount(0);
    } catch (err) {
      const appError = handleSilentError(err, 'fetchAssignments');
      setError(appError.message);

      // alert(err);
      // Автоматический retry для сетевых ошибок
      if (appError.status === 0 || (appError.status && appError.status >= 500)) {
        setRetryCount(prev => {
          if (prev < 3) {
            setTimeout(() => {
              fetchAssignments(page, limit, true);
            }, 1000 * Math.pow(2, prev)); // Экспоненциальная задержка
            return prev + 1;
          }
          return prev;
        });
        return;
      }

      // Не показываем ошибку для 409 - это нормальное поведение
      if (appError.status === 409) {
        setError(null);
        return;
      }
    } finally {
      setLoading(false);
    }
  }, [handleSilentError, declinedAssignments]);

  const acceptAssignment = React.useCallback(async (id: string) => {
    try {

      // Сначала проверяем, является ли assignment свободным
      const assignment = assignments.find(a => a.id === id);
      if (!assignment) {
        throw new Error("Assignment not found");
      }

      // Если assignment свободный (нет reporter_id или нулевой UUID), только "берем" его
      const isUnassigned = !assignment.reporter?.id || assignment.reporter?.id === '00000000-0000-0000-0000-000000000000';
      if (isUnassigned) {
        await AssignmentsApi.takeFreeAssignment(id);
        // Для свободных заданий не нужно вызывать acceptAssignment
        await fetchAssignments();
        return;
      }

      // Если assignment уже назначен пользователю, принимаем его
      const result = await AssignmentsApi.acceptAssignment(id);

      await fetchAssignments();
    } catch (err) {
      // Не показываем ошибку для 409/500 - это нормальное поведение для уже принятых заданий
      const errorMessage = err instanceof Error ? err.message : String(err);

      if (err instanceof Error && (
        errorMessage.includes('409') ||
        errorMessage.includes('500') ||
        errorMessage.includes('Assignment can not be accepted') ||
        errorMessage.includes('Internal server error') ||
        errorMessage.includes('already has') ||
        errorMessage.includes('accept is allowed only within 24 hours before check-in')
      )) {
        throw err;
      }

      handleError(err, 'acceptAssignment');
      throw err;
    }
  }, [fetchAssignments, handleError, assignments]);

  const declineAssignment = React.useCallback(async (id: string) => {

    // Находим задание для проверки его статуса
    const assignment = assignments.find(a => a.id === id);
    const isUnassigned = !assignment?.reporter?.id || assignment?.reporter?.id === '00000000-0000-0000-0000-000000000000';

    if (isUnassigned) {
      // Для незанятых заданий просто скрываем их локально
      // const newDeclinedSet = new Set([...declinedAssignments, id]);
      // setDeclinedAssignments(newDeclinedSet);
      // saveDeclinedAssignments(newDeclinedSet);
      return;
    }

    try {
      await AssignmentsApi.declineAssignment(id);

      // Добавляем задание в список отклоненных для локального состояния
      // const newDeclinedSet = new Set([...declinedAssignments, id]);
      // setDeclinedAssignments(newDeclinedSet);
      // saveDeclinedAssignments(newDeclinedSet);

      await fetchAssignments();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);

      if (err instanceof Error && (
        errorMessage.includes('409') ||
        errorMessage.includes('Assignment can not be declined')
      )) {
        // Если задание нельзя отклонить через API, скрываем его локально
        // const newDeclinedSet = new Set([...declinedAssignments, id]);
        // setDeclinedAssignments(newDeclinedSet);
        // saveDeclinedAssignments(newDeclinedSet);
        return;
      }

      handleError(err, 'declineAssignment');
      throw err;
    }
  }, [assignments, declinedAssignments, fetchAssignments, handleError, saveDeclinedAssignments]);

  const retry = React.useCallback(() => {
    setRetryCount(0);
    fetchAssignments();
  }, [fetchAssignments]);

  // Функция для очистки отклоненных заданий (например, при выходе из системы)
  const clearDeclinedAssignments = React.useCallback(() => {
    setDeclinedAssignments(new Set());
    if (typeof window !== 'undefined') {
      try {
        // Cleared declined assignments from localStorage
      } catch (error) {
        console.error('Error clearing declined assignments from localStorage:', error);
      }
    }
  }, []);


  React.useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);


  React.useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  return {
    setLoading,
    setError,
    setAssignments,
    assignments,
    loading,
    error,
    retryCount,
    fetchAssignments,
    acceptAssignment,
    declineAssignment,
    retry,
    clearDeclinedAssignments,
  };
}
