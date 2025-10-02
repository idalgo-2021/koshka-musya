import { Button } from "@/components/ui/button";
import { Assignment } from "@/entities/assignments/types";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";

// Функция для проверки, можно ли принять задание (в течение 24 часов до заселения или если заселение уже началось)
const canAcceptAssignment = (assignment: Assignment): boolean => {
  if (!assignment?.expires_at) return true;
  
  const expiresAt = new Date(assignment.expires_at);
  const now = new Date();
  const timeDiff = expiresAt.getTime() - now.getTime();
  const hoursDiff = timeDiff / (1000 * 60 * 60);
  
  // Можно принять если: в течение 24 часов до заселения ИЛИ заселение уже началось
  return hoursDiff <= 24;
};

// Функция для получения времени до заселения
const getTimeUntilCheckin = (assignment: Assignment, currentTime: Date): string => {
  if (!assignment?.expires_at) return "Время не указано";
  
  const checkinTime = new Date(assignment.expires_at);
  const timeDiff = checkinTime.getTime() - currentTime.getTime();
  
  if (timeDiff <= 0) return "Заселение уже началось";
  
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days} дн. ${hours} ч. до заселения`;
  } else if (hours > 0) {
    return `${hours} ч. ${minutes} мин. до заселения`;
  } else {
    return `${minutes} мин. до заселения`;
  }
};

export interface AssignmentActionButtonsProps {
  assignment: Assignment;
  onAccept: (id: string) => Promise<void>;
  onDecline: (id: string) => Promise<void>;
  onTake?: (id: string) => Promise<void>; // Взятие предложения (для offered заданий)
  onStartReport?: (assignmentId: string) => void;
  currentUserId?: string; // ID текущего пользователя для проверки, предложено ли задание ему
  hasActiveAssignments?: boolean; // Есть ли у пользователя активные задания
}

export default function AssignmentActionButtons({
  assignment,
  onAccept,
  onDecline,
  onTake,
  onStartReport,
  currentUserId,
  hasActiveAssignments = false
}: AssignmentActionButtonsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Обновляем время каждую минуту для актуального отображения
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Обновляем каждую минуту

    return () => clearInterval(interval);
  }, []);
  
  
  // Проверяем, можно ли принять задание по времени (в течение 24 часов до заселения)
  const canAccept = canAcceptAssignment(assignment);
  
  // Определяем статус задания
  const status = assignment.status.slug;
  
  // Проверяем, взято ли задание текущим пользователем
  const isAssignedToCurrentUser = currentUserId && 
                                 assignment.reporter?.id && 
                                 assignment.reporter.id !== null && 
                                 assignment.reporter.id !== undefined && 
                                 assignment.reporter.id !== '00000000-0000-0000-0000-000000000000' &&
                                 assignment.reporter.id === currentUserId;
  
  const handleAccept = async () => {
    
    if (isLoading || (status !== 'pending' && status !== 'offered')) {
      return;
    }
    
    // Проверяем время для принятия
    if (!canAccept) {
      // Показываем уведомление об ошибке
      toast.error('Задание можно принять за 24 часа до заселения или после начала заселения. Пожалуйста, подождите.');
      return;
    }
    
    setIsLoading(true);
    try {
      await onAccept(assignment.id);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDecline = async () => {
            if (isLoading || (status !== 'pending' && status !== 'offered')) return;
    
    setIsLoading(true);
    try {
      await onDecline(assignment.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTake = async () => {
    if (isLoading || status !== 'offered') return;
    
    setIsLoading(true);
    try {
      if (onTake) {
        await onTake(assignment.id);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStartReport = () => {
    if (onStartReport) {
      onStartReport(assignment.id);
    } else {
      // Fallback: попробуем найти отчет
      router.push(`/reports?assignment=${assignment.id}`);
    }
  };
  
  // Если задание в общем пуле (не предложено пользователю) - показываем кнопки "Взять" и "Отказаться"
  // НО если у пользователя есть активные задания, то не показываем кнопки для любых offered заданий
  if (!isAssignedToCurrentUser && status === 'offered' && !hasActiveAssignments) {
    
    return (
      <div className="flex gap-3">
        <Button 
          className="flex-1 h-14 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          onClick={handleTake}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
          ) : null}
          Взять
        </Button>
      </div>
    );
  }

  // Если у пользователя есть активные задания и это offered задание - показываем информационное сообщение
  if (hasActiveAssignments && status === 'offered') {
    return (
      <div className="space-y-3">
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-900 mb-1">У вас есть активное задание</h4>
              <p className="text-sm text-yellow-700 leading-relaxed">
                Сначала завершите текущее задание, чтобы взять новое предложение.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button 
            className="flex-1 h-14 bg-gradient-to-r from-gray-400 to-gray-500 text-white font-semibold rounded-2xl shadow-lg cursor-not-allowed opacity-60"
            disabled={true}
          >
            Взять
          </Button>
        </div>
      </div>
    );
  }

  // Если задание предложено пользователю, но еще рано для принятия (больше 24 часов до заселения)
  if (isAssignedToCurrentUser && !canAccept && (status === 'pending' || status === 'offered')) {
    return (
      <div className="space-y-3">
        {/* Информационная карточка */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">Задание взято!</h4>
              <p className="text-sm text-blue-700 leading-relaxed mb-2">
                Вы успешно взяли это задание. Принять его можно за 24 часа до заселения или после начала заселения.
              </p>
              <div className="bg-blue-100 rounded-lg px-3 py-2">
                <p className="text-sm font-medium text-blue-800">
                  ⏰ {getTimeUntilCheckin(assignment, currentTime)}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Кнопки действий */}
        <div className="flex gap-3">
          <Button 
            className="flex-1 h-14 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            onClick={handleAccept}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
            ) : null}
            Принять
          </Button>
          <Button 
            className="flex-1 h-14 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            onClick={handleDecline}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
            ) : null}
            Отказаться
          </Button>
        </div>
      </div>
    );
  }
  
  // Если задание принято
  if (status === 'accepted') {
    return (
      <div className="flex gap-3">
        <Button 
          className="flex-1 h-14 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          onClick={handleStartReport}
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Перейти к отчету
        </Button>
        <div className="flex-1 h-14 bg-green-50 border-2 border-green-200 text-green-700 font-medium rounded-2xl flex items-center justify-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Задание принято
        </div>
      </div>
    );
  }
  
  // Если задание отклонено
  if (status === 'declined') {
    return (
      <div className="flex gap-3">
        <div className="flex-1 h-14 bg-red-50 border-2 border-red-200 text-red-700 font-medium rounded-2xl flex items-center justify-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Задание отклонено
        </div>
        <div className="flex-1 h-14 bg-gray-50 border-2 border-gray-200 text-gray-500 font-medium rounded-2xl flex items-center justify-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
          </svg>
          Недоступно
        </div>
      </div>
    );
  }
  
  // Если задание предложено пользователю и можно принять (pending или offered) - в течение 24 часов
  if (isAssignedToCurrentUser && canAccept && (status === 'pending' || status === 'offered')) {
    return (
      <div className="space-y-3">
        {/* Информационная карточка */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-green-900 mb-1">Готово к принятию!</h4>
              <p className="text-sm text-green-700 leading-relaxed mb-2">
                Задание можно принять сейчас. После принятия вы сможете начать работу над отчетом.
              </p>
              <div className="bg-green-100 rounded-lg px-3 py-2">
                <p className="text-sm font-medium text-green-800">
                  ⏰ {getTimeUntilCheckin(assignment, currentTime)}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Кнопки действий */}
        <div className="flex gap-3">
          <Button 
            className="flex-1 h-14 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            onClick={handleAccept}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
            ) : null}
            Принять
          </Button>
          <Button 
            className="flex-1 h-14 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            onClick={handleDecline}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
            ) : null}
            Отказаться
          </Button>
        </div>
      </div>
    );
  }

  // Если задание принято
  if (status === 'accepted') {
    return (
      <div className="flex gap-3">
        <Button 
          className="flex-1 h-14 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          onClick={handleStartReport}
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Начать отчет
        </Button>
        <div className="flex-1 h-14 bg-gray-50 border-2 border-gray-200 text-gray-500 font-medium rounded-2xl flex items-center justify-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
          </svg>
          Недоступно
        </div>
      </div>
    );
  }

  // Fallback: если статус не определен
  return (
    <div className="flex gap-3">
      <div className="flex-1 h-14 bg-gray-50 border-2 border-gray-200 text-gray-500 font-medium rounded-2xl flex items-center justify-center">
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
        </svg>
        Недоступно
      </div>
      <div className="flex-1 h-14 bg-gray-50 border-2 border-gray-200 text-gray-500 font-medium rounded-2xl flex items-center justify-center">
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
        </svg>
        Недоступно
      </div>
    </div>
  );
}
