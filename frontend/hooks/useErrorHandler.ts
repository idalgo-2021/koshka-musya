import { useCallback } from 'react';
import { toast } from 'sonner';
import { handleApiError, handleNetworkError, logError, getUserFriendlyMessage, AppError } from '@/lib/error-handler';

export function useErrorHandler() {
  const handleError = useCallback((error: unknown, context?: string): AppError => {
    const appError = error instanceof AppError ? error : handleApiError(error);
    
    // Логируем ошибку
    logError(appError, context);
    
    // Не показываем toast для 409 - это нормальное поведение
    if (appError.status !== 409) {
      // Показываем пользователю понятное сообщение
      const userMessage = getUserFriendlyMessage(appError);
      toast.error(userMessage);
    }
    
    return appError;
  }, []);

  const handleNetworkErrorCallback = useCallback((error: unknown, context?: string): AppError => {
    const appError = handleNetworkError(error);
    logError(appError, context);
    
    // Не показываем toast для 409 - это нормальное поведение
    if (appError.status !== 409) {
      const userMessage = getUserFriendlyMessage(appError);
      toast.error(userMessage);
    }
    
    return appError;
  }, []);

  const handleSilentError = useCallback((error: unknown, context?: string): AppError => {
    const appError = error instanceof AppError ? error : handleApiError(error);
    
    // Не логируем ошибки для 409 - это нормальное поведение
    if (appError.status !== 409) {
      logError(appError, context);
    }
    
    return appError;
  }, []);

  return {
    handleError,
    handleNetworkError: handleNetworkErrorCallback,
    handleSilentError,
  };
}
