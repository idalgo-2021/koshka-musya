"use client";
import Image from 'next/image';

import type { Assignment } from '@/entities/assignments/types';

import { Button } from '@/components/ui/button';

// Функция для получения вознаграждения из данных задания
const getRewardInfo = (assignment: Assignment): string => {
  // Если есть данные о стоимости из pricing, используем их
  if (assignment.pricing?.total) {
    const currency = assignment.pricing.currency || 'RUB';
    const total = assignment.pricing.total;
    
    // Рассчитываем вознаграждение как процент от стоимости (например, 20%)
    const reward = Math.round(total * 0.2);
    
    if (currency === 'RUB') {
      return `${reward} ₽`;
    } else {
      return `${reward} ${currency}`;
    }
  }
  
  // Fallback на базовые суммы по типу отеля
  const listingType = assignment.listing.listing_type?.slug || 'hotel';
  const rewards: Record<string, string> = {
    'hotel': '5000 ₽',
    'apartment': '3000 ₽', 
    'hostel': '2000 ₽',
    'guest_house': '2500 ₽'
  };
  
  return rewards[listingType.toLowerCase()] || '3000 ₽';
};


interface ContinueReportCardProps {
  assignment: Assignment;
  onContinue: () => void;
  onSubmit?: () => void;
  reportId?: string;
  progress?: number;
  isStartCard?: boolean; // Флаг для отображения как "Начать заполнение"
  onShowFAQ?: () => void; // Функция для показа FAQ
}

export default function ContinueReportCard({ assignment, onContinue, onSubmit, reportId, progress = 0, isStartCard = false, onShowFAQ }: ContinueReportCardProps) {
  // Логируем данные задания для отладки
  console.log("ContinueReportCard - assignment data:", {
    id: assignment.id,
    title: assignment.listing.title,
    main_picture: assignment.listing.main_picture,
    hasImage: !!assignment.listing.main_picture,
    listing: assignment.listing
  });

  return (
    <div className="bg-white rounded-3xl shadow-2xl border-0 overflow-hidden hover:shadow-3xl transition-all duration-300 hover:scale-[1.02] group">
      <div className="relative">
        {/* Hotel Image with Overlay */}
        <div className="h-48 relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          {assignment.listing?.main_picture ? (
            <Image
              src={assignment.listing.main_picture}
              alt={assignment.listing.title || 'Отель'}
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          )}

          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

          {/* Hotel name overlay on image */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h3 className="text-lg font-bold text-white mb-1 drop-shadow-2xl shadow-black/50">
              {assignment.listing.title}
            </h3>
            <p className="text-white text-sm leading-relaxed drop-shadow-xl shadow-black/50 font-medium">
              {assignment.listing.description || 'Описание отеля'}
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-4">
          {/* Task Details */}
          <div className="space-y-3">
            {/* Purpose */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 mb-1">Цель проверки</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {assignment.purpose || 'Стандартная проверка чистоты и сервиса'}
                </p>
              </div>
            </div>

            {/* Deadline */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 mb-1">Срок действия до</p>
                <p className="text-sm text-gray-600">
                  {assignment.expires_at ? new Date(assignment.expires_at).toLocaleString('ru-RU', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'Не указан'}
                </p>
              </div>
            </div>

            {/* Address */}
            {assignment.listing?.address && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 mb-1">Адрес</p>
                  <p className="text-sm text-gray-600">
                    {assignment.listing.address}
                    {assignment.listing.city && (
                      <span className="block">{assignment.listing.city}, {assignment.listing.country}</span>
                    )}
                  </p>
                  {/* Ссылка на карту под адресом */}
                  {assignment.listing?.latitude && assignment.listing?.longitude && (
                    <a
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 mt-2"
                      href={`https://yandex.ru/maps/?pt=${assignment.listing.longitude},${assignment.listing.latitude}&z=16&l=map`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Посмотреть на карте
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Информация о вознаграждении */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 mb-1">Вознаграждение</p>
                <p className="text-sm text-gray-600 font-semibold text-green-600">
                  {getRewardInfo(assignment)}
                </p>
              </div>
            </div>

            {/* Информация о гостях (если доступна) */}
            {assignment.guests && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 mb-1">Гости</p>
                  <p className="text-sm text-gray-600">
                    {assignment.guests.adults} взросл{assignment.guests.adults === 1 ? 'ый' : assignment.guests.adults < 5 ? 'ых' : 'ых'}
                    {assignment.guests.children > 0 && (
                      <span>, {assignment.guests.children} ребён{assignment.guests.children === 1 ? 'ок' : assignment.guests.children < 5 ? 'ка' : 'ок'}</span>
                    )}
                  </p>
                </div>
              </div>
            )}


            {/* Progress */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 mb-2">Прогресс заполнения</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Заполнено</span>
                    <span className="font-semibold text-gray-900">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-4">
            {/* Main Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={onContinue}
                className="flex-1 h-14 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {isStartCard ? 'Начать заполнение' : 'Продолжить заполнение'}
              </Button>

              {onSubmit && !isStartCard && (
                <Button
                  onClick={onSubmit}
                  variant="outline"
                  className="flex-1 h-14 border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 font-semibold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Завершить
                </Button>
              )}
            </div>

            {/* FAQ Link */}
            <div className="text-center">
              <button
                onClick={() => {
                  if (onShowFAQ) {
                    onShowFAQ();
                  } else {
                    // Fallback для обратной совместимости
                    const url = reportId
                      ? `/dashboard?showFAQ=true&reportId=${reportId}&fromContinue=true`
                      : '/dashboard?showFAQ=true&fromContinue=true';
                    window.location.href = url;
                  }
                }}
                className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors duration-200"
              >
                Прочитать FAQ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
