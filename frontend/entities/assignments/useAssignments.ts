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
        const stored = localStorage.getItem('declinedAssignments');
        return stored ? new Set(JSON.parse(stored)) : new Set();
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
        localStorage.setItem('declinedAssignments', JSON.stringify([...declinedSet]));
        console.log('Saved declined assignments to localStorage:', [...declinedSet]);
      } catch (error) {
        console.error('Error saving declined assignments to localStorage:', error);
      }
    }
  }, []);

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
      
      // Получаем свободные задания (offered) через /assignments (без фильтра по пользователю)
      const offeredResponse = await AssignmentsApi.getAvailableAssignments(page, limit);
      console.log("=== AVAILABLE ASSIGNMENTS ===");
      console.log("Available assignments:", offeredResponse.assignments);
      console.log("Available count:", offeredResponse.assignments.length);
      
      // Фильтруем отклоненные задания из доступных
      const filteredOfferedAssignments = offeredResponse.assignments.filter(assignment => 
        !declinedAssignments.has(assignment.id)
      );
      console.log("Filtered available assignments:", filteredOfferedAssignments);
      console.log("Filtered available count:", filteredOfferedAssignments.length);
      
      // Логируем детали каждого предложенного задания (только отфильтрованных)
      filteredOfferedAssignments.forEach((assignment, index) => {
        console.log(`Offered assignment ${index}:`, {
          id: assignment.id,
          title: assignment.listing.title,
          main_picture: assignment.listing.main_picture,
          hasImage: !!assignment.listing.main_picture,
          status: assignment.status,
          reporter: assignment.reporter,
          listing: assignment.listing
        });
      });
      
      // Получаем мои assignments (принятые мной) через /assignments/my
      let myAssignments: Assignment[] = [];
      try {
        const myAssignmentsResponse = await AssignmentsApi.getMyAssignments(page, limit);
        console.log("=== MY ASSIGNMENTS ===");
        console.log("My assignments:", myAssignmentsResponse.assignments);
        console.log("My assignments count:", myAssignmentsResponse.assignments.length);
        myAssignments = myAssignmentsResponse.assignments;
      } catch (myAssignmentsErr) {
        console.log("No my assignments or error:", myAssignmentsErr);
        // Игнорируем ошибку для моих assignments
      }

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
      
      // Объединяем все задания: доступные (отфильтрованные) + мои + принятые (из отчетов)
      const allAssignments = [...filteredOfferedAssignments, ...myAssignments, ...acceptedAssignments];
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
      console.log("=== ACCEPT ASSIGNMENT ===");
      console.log("Accepting assignment ID:", id);
      console.log("Current assignments state:", assignments);
      
      // Сначала проверяем, является ли assignment свободным
      const assignment = assignments.find(a => a.id === id);
      if (!assignment) {
        throw new Error("Assignment not found");
      }
      
      // Если assignment свободный (нет reporter_id или нулевой UUID), сначала "берем" его
      const isUnassigned = !assignment.reporter?.id || assignment.reporter?.id === '00000000-0000-0000-0000-000000000000';
      if (isUnassigned) {
        console.log("Assignment is free, taking it first...");
        await AssignmentsApi.takeFreeAssignment(id);
        console.log("Assignment taken successfully");
      }
      
      // Теперь принимаем assignment
      console.log("Making API call to accept assignment...");
      const result = await AssignmentsApi.acceptAssignment(id);
      console.log("AssignmentsApi.acceptAssignment completed successfully:", result);
      
      // Обновляем список assignments
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
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.log("Checking error message:", errorMessage);
      
      if (err instanceof Error && (
        errorMessage.includes('409') || 
        errorMessage.includes('500') ||
        errorMessage.includes('Assignment can not be accepted') ||
        errorMessage.includes('Internal server error') ||
        errorMessage.includes('already has') ||
        errorMessage.includes('accept is allowed only within 24 hours before check-in')
      )) {
        console.log("Throwing error (409/500/time limit) without handling:", errorMessage);
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
    
    // Находим задание для проверки его статуса
    const assignment = assignments.find(a => a.id === id);
    const isUnassigned = !assignment?.reporter?.id || assignment?.reporter?.id === '00000000-0000-0000-0000-000000000000';
    
    if (isUnassigned) {
      console.log("Assignment is unassigned, hiding locally without API call");
      // Для незанятых заданий просто скрываем их локально
      const newDeclinedSet = new Set([...declinedAssignments, id]);
      setDeclinedAssignments(newDeclinedSet);
      saveDeclinedAssignments(newDeclinedSet);
      console.log("Added assignment to declined list:", id);
      return;
    }
    
    try {
      console.log("Making API call to decline assignment...");
      await AssignmentsApi.declineAssignment(id);
      console.log("AssignmentsApi.declineAssignment completed successfully");
      
      // Добавляем задание в список отклоненных для локального состояния
      const newDeclinedSet = new Set([...declinedAssignments, id]);
      setDeclinedAssignments(newDeclinedSet);
      saveDeclinedAssignments(newDeclinedSet);
      console.log("Added assignment to declined list:", id);
      
      // Не нужно вызывать fetchAssignments() - задание уже скрыто локально
      console.log("Assignment hidden locally, no need to refetch");
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
  }, [handleError, assignments, declinedAssignments, saveDeclinedAssignments]);

  const retry = React.useCallback(() => {
    setRetryCount(0);
    fetchAssignments();
  }, [fetchAssignments]);

  // Функция для очистки отклоненных заданий (например, при выходе из системы)
  const clearDeclinedAssignments = React.useCallback(() => {
    setDeclinedAssignments(new Set());
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('declinedAssignments');
        console.log('Cleared declined assignments from localStorage');
      } catch (error) {
        console.error('Error clearing declined assignments from localStorage:', error);
      }
    }
  }, []);


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
    clearDeclinedAssignments,
  };
}
