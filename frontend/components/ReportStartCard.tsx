"use client";
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import type { Report } from '@/entities/reports/types';



interface ReportStartCardProps {
  report: Report;
  onStartFilling: () => void;
  onBackToFAQ?: () => void;
}

export default function ReportStartCard({ report, onStartFilling, onBackToFAQ }: ReportStartCardProps) {
  return (
    <div className="bg-white rounded-3xl shadow-2xl border-0 overflow-hidden hover:shadow-3xl transition-all duration-300 hover:scale-[1.02] group">
      <div className="relative">
        {/* Hotel Image with Overlay */}
        <div className="h-48 relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          {report.listing?.main_picture ? (
                <Image
                  src={report.listing.main_picture}
                  alt={report.listing.title || 'Отель'}
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
              {report.listing?.title || 'Отель'}
            </h3>
            <p className="text-white text-sm leading-relaxed drop-shadow-xl shadow-black/50 font-medium">
              {report.listing?.description || 'Описание отеля'}
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-4">
          {/* Task Details */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">Отчет</h2>
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
                  {report.purpose || 'Стандартная проверка чистоты и сервиса'}
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
                      {report.created_at ? new Date(report.created_at)?.toLocaleString('ru-RU', {
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
            {report.listing?.address && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 mb-1">Адрес</p>
                  <p className="text-sm text-gray-600">
                    {report.listing.address}
                    {report.listing.city && (
                      <span className="block">{report.listing.city}, {report.listing.country}</span>
                    )}
                  </p>
                  {/* Ссылка на карту под адресом */}
                  {report.listing?.latitude && report.listing?.longitude && (
                    <a
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 mt-2"
                      href={`https://yandex.ru/maps/?pt=${report.listing.longitude},${report.listing.latitude}&z=16&l=map`}
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

            {/* Номер бронирования */}
            {report.booking_details?.booking_number && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 mb-1">Номер бронирования 1</p>
                  <p className="text-sm text-gray-600 font-mono">
                    {report.booking_details.booking_number}
                  </p>
                </div>
              </div>
            )}

            {/* Информация о гостях */}
            {report.booking_details?.guests && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 mb-1">Гости</p>
                  <p className="text-sm text-gray-600">
                    {report.booking_details.guests.adults} взросл{report.booking_details.guests.adults === 1 ? 'ый' : report.booking_details.guests.adults < 5 ? 'ых' : 'ых'}
                    {report.booking_details.guests.children > 0 && (
                      <span>, {report.booking_details.guests.children} ребён{report.booking_details.guests.children === 1 ? 'ок' : report.booking_details.guests.children < 5 ? 'ка' : 'ок'}</span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Стоимость */}
            {report.booking_details?.pricing?.pricing && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 mb-1">Стоимость</p>
                  <p className="text-sm text-green-600 font-semibold">
                    {report.booking_details.pricing?.pricing.total ? report.booking_details.pricing?.pricing?.total?.toLocaleString('ru-RU') : 'Не указана'} {report.booking_details.pricing?.pricing.currency || 'руб.'}
                    {report.booking_details.pricing?.pricing.breakdown && report.booking_details.pricing?.pricing?.breakdown.per_night && (
                      <span className="block text-xs text-gray-500 mt-1">
                        {report.booking_details.pricing?.pricing?.breakdown?.per_night?.toLocaleString('ru-RU')} {report.booking_details.pricing?.pricing.currency || 'руб.'} × {report.booking_details.pricing?.pricing.breakdown.nights} ноч{report.booking_details.pricing?.pricing.breakdown.nights === 1 ? 'ь' : report.booking_details.pricing?.pricing.breakdown.nights < 5 ? 'и' : 'ей'}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}


          </div>

          {/* Action Button */}
          <div className="pt-2">
            <Button
              onClick={onStartFilling}
              className="w-full h-14 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Начать заполнение
            </Button>

            {/* Back to FAQ Link */}
            {onBackToFAQ && (
              <div className="text-center mt-4">
                <button
                  onClick={onBackToFAQ}
                  className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors duration-200"
                >
                  Назад к FAQ
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
