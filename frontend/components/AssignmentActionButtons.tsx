import { Button } from "@/components/ui/button";
import { Assignment } from "@/entities/assignments/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Функция для проверки, можно ли принять задание (в течение 24 часов до заселения)
const canAcceptAssignment = (assignment: Assignment): boolean => {
  if (!assignment.expires_at) return true;
  
  const expiresAt = new Date(assignment.expires_at);
  const now = new Date();
  const timeDiff = expiresAt.getTime() - now.getTime();
  const hoursDiff = timeDiff / (1000 * 60 * 60);
  
  return hoursDiff <= 24 && hoursDiff > 0;
};

interface AssignmentActionButtonsProps {
  assignment: Assignment;
  onAccept: (id: string) => Promise<void>;
  onDecline: (id: string) => Promise<void>;
  onStartReport?: (assignmentId: string) => void;
}

export default function AssignmentActionButtons({
  assignment,
  onAccept,
  onDecline,
  onStartReport
}: AssignmentActionButtonsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Проверяем, истек ли срок действия
  const isExpired = new Date(assignment.expires_at) < new Date();
  
  // Проверяем, можно ли принять задание по времени
  const canAccept = canAcceptAssignment(assignment);
  
  // Определяем статус задания
  const status = assignment.status.slug;
  
  const handleAccept = async () => {
    if (isLoading || isExpired || !canAccept || (status !== 'pending' && status !== 'offered')) return;
    
    setIsLoading(true);
    try {
      await onAccept(assignment.id);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDecline = async () => {
    if (isLoading || isExpired || (status !== 'pending' && status !== 'offered')) return;
    
    setIsLoading(true);
    try {
      await onDecline(assignment.id);
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
  
  // Если срок истек
  if (isExpired) {
    return (
      <div className="flex gap-3">
        <div className="flex-1 h-14 bg-orange-50 border-2 border-orange-200 text-orange-700 font-medium rounded-2xl flex items-center justify-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          Срок действия истек
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

  // Если задание нельзя принять по времени (не в течение 24 часов до заселения)
  if (!canAccept && (status === 'pending' || status === 'offered')) {
    return (
      <div className="flex gap-3">
        <div className="flex-1 h-14 bg-gray-50 border-2 border-gray-200 text-gray-500 font-medium rounded-2xl flex items-center justify-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
          </svg>
          Недоступно
        </div>
        <Button 
          className="flex-1 h-14 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          onClick={handleDecline}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
          ) : (
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" clipRule="evenodd" />
            </svg>
          )}
          Отказаться
        </Button>
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
  
  // Если задание в ожидании (pending или offered)
  return (
    <div className="flex gap-3">
      <Button 
        className="flex-1 h-14 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
        onClick={handleAccept}
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
        ) : (
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
        Принять
      </Button>
      <Button 
        className="flex-1 h-14 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
        onClick={handleDecline}
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
        ) : (
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" clipRule="evenodd" />
          </svg>
        )}
        Отказаться
      </Button>
    </div>
  );
}
