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
  const [declinedAssignments, setDeclinedAssignments] = React.useState<Set<string>>(new Set());

  const { handleError, handleSilentError } = useErrorHandler();

  const fetchAssignments = React.useCallback(async (page = 1, limit = 20, retry = false) => {
    if (!retry) {
      setLoading(true);
      setError(null);
    }

    try {
      console.log("Fetching assignments with params:", { page, limit });

      // Логируем информацию о пользователе
      const token = localStorage.getItem('access_token');
      console.log("Current access token:", token ? `${token.substring(0, 20)}...` : 'No token');

      // Получаем предложенные задания (offered) через /assignments/my
      const offeredResponse = await AssignmentsApi.getMyAssignments(page, limit);
      console.log("=== OFFERED ASSIGNMENTS ===");
      console.log("Offered assignments:", offeredResponse.assignments);
      console.log("Offered count:", offeredResponse.assignments.length);

      // Логируем детали каждого предложенного задания
      offeredResponse.assignments.forEach((assignment, index) => {
        console.log(`Offered assignment ${index}:`, {
          id: assignment.id,
          title: assignment.listing.title,
          main_picture: assignment.listing.main_picture,
          hasImage: !!assignment.listing.main_picture,
          listing: assignment.listing
        });
      });

      // Получаем принятые задания через /reports/my (отчеты в статусе draft)
      let acceptedAssignments: Assignment[] = [];
      try {
        const reportsResponse = await ReportsApi.getMyReports(page, limit);
        console.log("=== REPORTS (ACCEPTED ASSIGNMENTS) ===");
        console.log("Reports:", reportsResponse.reports);
        console.log("Reports count:", reportsResponse.reports.length);

        // Преобразуем отчеты в формат заданий
        console.log("=== FILTERING REPORTS ===");
        console.log("All reports:", reportsResponse.reports);
        console.log("Declined assignments:", [...declinedAssignments]);

        acceptedAssignments = reportsResponse.reports
          .filter(report => {
            const hasAssignmentId = !!report.assignment_id;
            const isNotDeclined = !declinedAssignments.has(report.assignment_id || '');
            console.log(`Report ${report.id}: assignment_id=${report.assignment_id}, hasAssignmentId=${hasAssignmentId}, isNotDeclined=${isNotDeclined}`);
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
            guests: undefined,
            pricing: undefined,
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

        console.log("=== CONVERTED ACCEPTED ASSIGNMENTS ===");
        console.log("Accepted assignments:", acceptedAssignments);
        console.log("Accepted count:", acceptedAssignments.length);

        // Логируем детали каждого принятого задания
        acceptedAssignments.forEach((assignment, index) => {
          console.log(`Accepted assignment ${index}:`, {
            id: assignment.id,
            title: assignment.listing.title,
            main_picture: assignment.listing.main_picture,
            hasImage: !!assignment.listing.main_picture
          });
        });
      } catch (reportsErr) {
        console.log("No reports or error:", reportsErr);
        // Игнорируем ошибку для отчетов
      }

      // Объединяем все задания
      const allAssignments = [...offeredResponse.assignments, ...acceptedAssignments];
      console.log("=== COMBINED ASSIGNMENTS ===");
      console.log("All assignments:", allAssignments);
      console.log("Total count:", allAssignments.length);

      setAssignments(allAssignments);
      setRetryCount(0);
    } catch (err) {
      const appError = handleSilentError(err, 'fetchAssignments');
      setError(appError.message);

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
      console.log("Calling AssignmentsApi.acceptAssignment for:", id);
      console.log("Before API call - assignment status should be updated");

      // Добавляем логирование для поиска существующего отчета
      console.log("Searching for existing report with assignment_id:", id);
      console.log("Current assignments state:", assignments);

      console.log("Making API call to accept assignment...");
      const result = await AssignmentsApi.acceptAssignment(id);
      console.log("AssignmentsApi.acceptAssignment completed successfully:", result);
      console.log("Fetching updated assignments...");
      await fetchAssignments();
      console.log("fetchAssignments completed after acceptAssignment");
      console.log("Assignment status should now be 'accepted' (2) in DB");
      console.log("Assignments list should be updated in UI");
    } catch (err) {
      console.log("Error in acceptAssignment:", err);
      console.log("Error type:", typeof err);
      console.log("Error message:", err instanceof Error ? err.message : String(err));

      // Не показываем ошибку для 409/500 - это нормальное поведение для уже принятых заданий
      if (err instanceof Error && (
        err.message.includes('409') ||
        err.message.includes('500') ||
        err.message.includes('Assignment can not be accepted') ||
        err.message.includes('Internal server error')
      )) {
        console.log("Throwing error (409/500) without handling:", err.message);
        throw err;
      }

      console.log("Handling error with handleError");
      handleError(err, 'acceptAssignment');
      throw err;
    }
  }, [fetchAssignments, handleError, assignments]);

  const declineAssignment = React.useCallback(async (id: string) => {
    console.log("=== DECLINE ASSIGNMENT ===");
    console.log("Declining assignment ID:", id);

    try {
      console.log("Making API call to decline assignment...");
      await AssignmentsApi.declineAssignment(id);
      console.log("AssignmentsApi.declineAssignment completed successfully");

      // Добавляем задание в список отклоненных для локального состояния
      setDeclinedAssignments(prev => new Set([...prev, id]));
      console.log("Added assignment to declined list:", id);

      // Обновляем список заданий после успешного отклонения
      console.log("Fetching updated assignments...");
      await fetchAssignments();
      console.log("fetchAssignments completed after declineAssignment");
      console.log("Assignment status should now be 'declined' (5) in DB");
    } catch (err) {
      console.log("Error in declineAssignment:", err);
      console.log("Error type:", typeof err);
      console.log("Error message:", err instanceof Error ? err.message : String(err));

      // Не показываем ошибку для 409 - это нормальное поведение
      if (err instanceof Error && (err.message.includes('409') || err.message.includes('Assignment can not be declined'))) {
        console.log("Throwing 409 error without handling:", err.message);
        throw err;
      }

      console.log("Handling error with handleError");
      handleError(err, 'declineAssignment');
      throw err;
    }

    console.log("=== END DECLINE ASSIGNMENT ===");
  }, [fetchAssignments, handleError]);

  const retry = React.useCallback(() => {
    setRetryCount(0);
    fetchAssignments();
  }, [fetchAssignments]);


  React.useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  return {
    assignments,
    loading,
    error,
    retryCount,
    fetchAssignments,
    acceptAssignment,
    declineAssignment,
    retry,
  };
}
