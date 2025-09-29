// Утилиты для обработки ошибок

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
}

export class AppError extends Error {
  public readonly status?: number;
  public readonly code?: string;
  public readonly details?: unknown;

  constructor(message: string, status?: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Обработка ошибок API
export function handleApiError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    // Парсим сообщение об ошибке из API
    let message = error.message;
    let status: number | undefined;
    let code: string | undefined;

    // Пытаемся извлечь информацию из сообщения
    if (message.includes('HTTP')) {
      const statusMatch = message.match(/HTTP (\d+)/);
      if (statusMatch) {
        status = parseInt(statusMatch[1]);
      }
    }

    // Определяем пользовательское сообщение на основе статуса
    switch (status) {
      case 400:
        message = 'Некорректные данные запроса';
        break;
      case 401:
        message = 'Необходима авторизация';
        break;
      case 403:
        message = 'Доступ запрещен';
        break;
      case 404:
        message = 'Ресурс не найден';
        break;
      case 409:
        message = 'Задание уже было принято или отклонено';
        break;
      case 422:
        message = 'Ошибка валидации данных';
        break;
      case 429:
        message = 'Слишком много запросов. Попробуйте позже';
        break;
      case 500:
        message = 'Внутренняя ошибка сервера';
        break;
      case 502:
      case 503:
      case 504:
        message = 'Сервер временно недоступен';
        break;
      default:
        if (status && status >= 400) {
          message = 'Произошла ошибка при выполнении запроса';
        } else {
          message = 'Ошибка сети. Проверьте подключение к интернету';
        }
    }

    return new AppError(message, status, code);
  }

  // Неизвестная ошибка
  return new AppError('Произошла неизвестная ошибка');
}

// Обработка ошибок сети
export function handleNetworkError(error: unknown): AppError {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new AppError('Ошибка сети. Проверьте подключение к интернету', 0, 'NETWORK_ERROR');
  }

  return handleApiError(error);
}

// Логирование ошибок
export function logError(error: AppError, context?: string) {
  // Не логируем ошибки для 409 - это нормальное поведение
  if (error.status === 409) {
    return;
  }
  
  const errorInfo = {
    message: error.message,
    status: error.status,
    code: error.code,
    details: error.details,
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  console.error('Application Error:', errorInfo);

  // В продакшене можно отправлять ошибки в сервис мониторинга
  if (process.env.NODE_ENV === 'production') {
    // TODO: Интеграция с Sentry, LogRocket или другим сервисом
    // sendErrorToMonitoring(errorInfo);
  }
}

// Retry логика для API запросов
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: AppError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = handleApiError(error);
      
      // Не повторяем для определенных типов ошибок
      if (lastError.status && [400, 401, 403, 404, 409, 422].includes(lastError.status)) {
        throw lastError;
      }

      if (attempt === maxRetries) {
        throw lastError;
      }

      // Экспоненциальная задержка
      const retryDelay = delay * Math.pow(2, attempt - 1);
      console.warn(`Attempt ${attempt} failed, retrying in ${retryDelay}ms...`, lastError.message);
      
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  throw lastError!;
}

// Валидация ошибок
export function isRetryableError(error: AppError): boolean {
  if (!error.status) return true; // Сетевые ошибки
  return error.status >= 500 || error.status === 429;
}

// Пользовательские сообщения об ошибках
export function getUserFriendlyMessage(error: AppError): string {
  // Специальные случаи для известных ошибок
  if (error.code === 'NETWORK_ERROR') {
    return 'Проверьте подключение к интернету и попробуйте снова';
  }

  if (error.status === 401) {
    return 'Сессия истекла. Пожалуйста, войдите в систему заново';
  }

  if (error.status === 403) {
    return 'У вас нет прав для выполнения этого действия';
  }

  if (error.status === 404) {
    return 'Запрашиваемый ресурс не найден';
  }

  if (error.status === 409) {
    return 'Задание уже было принято или отклонено';
  }

  if (error.status === 422) {
    return 'Проверьте правильность введенных данных';
  }

  if (error.status && error.status >= 500) {
    return 'Сервер временно недоступен. Попробуйте позже';
  }

  return error.message;
}
