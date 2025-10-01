import React, {useState} from "react";
import {Assignment} from "@/entities/assignments/types";
import {Button} from "@/components/ui/button";
import AnimatedCard from "./AnimatedCard";
import HotelImage from "./HotelImage";
import AssignmentActionButtons from "./AssignmentActionButtons";
import { formatDate } from "@/lib/date";
import {LISTING_TYPES} from "@/lib/listing-types";

interface AssignmentCarouselProps {
  assignments: Assignment[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onAccept: (id: string) => Promise<void>;
  onDecline: (id: string) => Promise<void>;
  onTake?: (id: string) => Promise<void>; // Взятие предложения
  onStartReport?: (assignmentId: string) => void;
  hotelLoading: Record<string, boolean>;
  currentUserId?: string;
  hasActiveAssignments?: boolean;
  // Фильтрация по типу объекта
  selectedListingType?: number| undefined;
  onListingTypeChange?: (type: number | undefined) => void;
}

// const listingTypes = React.useMemo(() => {
//   const types = new Set<string>();
//   assignments.forEach(assignment => {
//     if (assignment.listing.listing_type?.slug) {
//       types.add(assignment.listing.listing_type.slug);
//     }
//   });
//   return Array.from(types).sort();
// }, [assignments]);
export default function AssignmentCarousel({
  assignments,
  currentIndex,
  onIndexChange,
  onAccept,
  onDecline,
  onTake,
  onStartReport,
  hotelLoading,
  currentUserId,
  hasActiveAssignments = false,
  selectedListingType,
  onListingTypeChange
} : AssignmentCarouselProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);

  // debugger;

  // Получаем уникальные типы объектов


  // Фильтруем задания по выбранному типу
  // const filteredAssignments = React.useMemo(() => {
  //   if (!selectedListingType) return assignments;
  //   return assignments.filter(assignment =>
  //     assignment.listing.listing_type?.slug === selectedListingType
  //   );
  // }, [assignments, selectedListingType]);

  const filteredAssignments = assignments;
  const currentAssignment = filteredAssignments[currentIndex];
  const hasNext = currentIndex < filteredAssignments.length - 1;
  const hasPrev = currentIndex > 0;

  const handleNext = () => {
    if (hasNext && !isTransitioning) {
      setIsTransitioning(true);
      setTimeout(() => {
        onIndexChange(currentIndex + 1);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const handlePrev = () => {
    if (hasPrev && !isTransitioning) {
      setIsTransitioning(true);
      setTimeout(() => {
        onIndexChange(currentIndex - 1);
        setIsTransitioning(false);
      }, 150);
    }
  };
  //
  // if (filteredAssignments.length === 0 || !currentAssignment) {
  //   return null;
  // }

  const isOne = assignments.length === 1 && assignments[0]?.taked_at !== undefined;
  return (
    <div className="relative">
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-6 p-4">
        {isOne ? undefined : (
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-accenttext/80">
              {filteredAssignments?.length > 0 ? `${currentIndex + 1} из ${filteredAssignments.length}` : "0 из 0"}
            </span>
          </div>
        )}

        <div className="flex items-center space-x-4">
          {/* Кнопки навигации */}
          {filteredAssignments?.length > 1 && (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                disabled={!hasPrev || isTransitioning}
                className="border-accenttext/20 text-accenttext hover:bg-accenttext/10 hover:border-accenttext/40 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"/>
                </svg>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={!hasNext || isTransitioning}
                className="border-accenttext/20 text-accenttext hover:bg-accenttext/10 hover:border-accenttext/40 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"/>
                </svg>
              </Button>
            </div>
          )}

          {/*/!* Фильтр по типу объекта *!/*/}
          {/*{ onListingTypeChange && (*/}
          {/*  <Select className="w-32" value={selectedListingType} placeholder='Выберите тип' options={options} onChange={onListingTypeChange} />*/}
          {/*)}*/}
          { !isOne && onListingTypeChange && (
            <select
              value={selectedListingType || ''}
              onChange={(e) => {
                onListingTypeChange(e.target.value === '' ? undefined : parseInt(e.target.value))
              }}
              className="text-sm border border-accenttext/20 rounded-lg px-3 py-1.5 bg-white text-accenttext focus:outline-none focus:ring-2 focus:ring-accenttext/20 focus:border-accenttext/40 transition-all duration-200 min-w-[120px]"
            >
              <option value="">Все типы</option>
              {LISTING_TYPES.map(type => {
                return (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                );
              })}
            </select>
          )}
        </div>
      </div>

      {!filteredAssignments || filteredAssignments.length === 0 ? (
        undefined
      ): (
        <AnimatedCard
          className={`transition-all duration-200 ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}
          delay={0.1}
          direction="up"
        >
          <AssignmentCard
            assignment={currentAssignment}
            onAccept={onAccept}
            onDecline={onDecline}
            onTake={onTake}
            onStartReport={onStartReport}
            hotelLoading={hotelLoading}
            currentUserId={currentUserId}
            hasActiveAssignments={hasActiveAssignments}
          />
        </AnimatedCard>
    )}

    </div>
  );
}

function AssignmentCard({
  assignment,
  onAccept,
  onDecline,
  onTake,
  onStartReport,
  hotelLoading,
  currentUserId,
  hasActiveAssignments = false
} : {
  assignment: Assignment;
  onAccept: (id: string) => Promise<void>;
  onDecline: (id: string) => Promise<void>;
  onTake?: (id: string) => Promise<void>;
  onStartReport?: (assignmentId: string) => void;
  hotelLoading: Record<string, boolean>;
  currentUserId?: string;
  hasActiveAssignments?: boolean;
}) {

  return (
    <div
      className="bg-white rounded-3xl shadow-2xl border-0 overflow-hidden hover:shadow-3xl transition-all duration-300 hover:scale-[1.02] group">
      <div className="relative">
        {/* Hotel Image with Overlay */}
        <div className="h-48 relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          {assignment?.listing?.main_picture && (
            <HotelImage
              src={assignment?.listing?.main_picture || ''}
              alt={assignment?.listing?.title}
              width={400}
              height={192}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

          {/* Hotel name overlay on image */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h3 className="text-lg font-bold text-white mb-1 drop-shadow-2xl shadow-black/50">
              {assignment?.listing?.title}
            </h3>
            <p className="text-white text-sm leading-relaxed drop-shadow-xl shadow-black/50 font-medium">
              {assignment?.listing?.description}
            </p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">Предложение</h2>
            <p
              className="text-lg font-medium text-gray-900 mb-1">{`Тип` + (assignment?.listing?.listing_type ? `: ${assignment?.listing?.listing_type.name}` : '')}</p>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"/>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 mb-1">Цель проверки</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {assignment.purpose}
                </p>
              </div>
            </div>

            {/* Стоимость */}
            {assignment.pricing && ((assignment.pricing as any).pricing?.total > 0 || (assignment.pricing as any).pricing?.currency) && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd"
                          d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 mb-1">Стоимость</p>
                  <div className="space-y-1 flex flex-row gap-4">
                    {(assignment.pricing as any)?.pricing?.total && (assignment.pricing as any).pricing.total > 0 && (
                      <p className="text-sm text-green-600 font-semibold">
                        <span
                          className="font-medium">{(assignment.pricing as any).pricing.total?.toLocaleString('ru-RU')}</span> {(assignment.pricing as any).pricing.currency || 'руб.'}
                      </p>
                    )}
                    {(assignment.pricing as any)?.pricing?.breakdown && (assignment.pricing as any).pricing.breakdown.per_night && (assignment.pricing as any).pricing.breakdown.nights && (
                      <p className="text-sm text-gray-500">
                        {(assignment.pricing as any).pricing.breakdown.per_night?.toLocaleString('ru-RU')} {(assignment.pricing as any).pricing.currency || 'руб.'} × {(assignment.pricing as any).pricing.breakdown.nights} ноч{(assignment.pricing as any).pricing.breakdown.nights === 1 ? 'ь' : (assignment.pricing as any).pricing.breakdown.nights < 5 ? 'и' : 'ей'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"/>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 mb-1">Срок действия</p>
                <p className="text-sm text-gray-600">
                  До {formatDate(assignment.expires_at)}
                </p>
              </div>
            </div>

            {/* Гости */}
            {assignment.guests && (assignment.guests.adults > 0 || assignment.guests.children > 0) && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 mb-1">Гости</p>
                  <div className="space-y-1 flex flex-row gap-4">
                    {assignment.guests.adults > 0 && (
                      <p className="text-sm text-gray-600">
                        <span
                          className="font-medium">{assignment.guests.adults}</span> {assignment.guests.adults === 1 ? 'взрослый' : assignment.guests.adults < 5 ? 'взрослых' : 'взрослых'}
                      </p>
                    )}
                    {assignment.guests.children > 0 && (
                      <p className="text-sm text-gray-600">
                        <span
                          className="font-medium">{assignment.guests.children}</span> {assignment.guests.children === 1 ? 'ребенок' : assignment.guests.children < 5 ? 'ребенка' : 'детей'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Даты заезда и выезда */}
            {assignment.dates && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 mb-1">Даты проживания</p>
                  <div className="space-y-1 flex flex-row gap-2">
                    {assignment.dates.checkin && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Заезд:</span> {(() => {
                        try {
                          return new Date(assignment.dates.checkin).toLocaleDateString('ru-RU');
                        } catch {
                          return assignment.dates.checkin;
                        }
                      })()}
                      </p>
                    )}
                    {assignment.dates.checkout && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Выезд:</span> {(() => {
                        try {
                          return new Date(assignment.dates.checkout).toLocaleDateString('ru-RU');
                        } catch {
                          return assignment.dates.checkout;
                        }
                      })()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}


            {(assignment?.listing.city) && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-1">Адрес</p>
                  {hotelLoading[assignment?.listing?.id] ? (
                    <p className="text-sm text-gray-500">Загружаем адрес…</p>
                  ) : (
                    <div className="space-y-1">
                      <p>
                        {(assignment?.listing?.city || assignment?.listing?.country) && (
                          <span className="text-sm text-gray-500">
                          {assignment?.listing?.city}
                            {assignment?.listing?.city && assignment?.listing?.country ? ", " : ""}
                            {assignment?.listing?.country}
                        </span>
                        )}
                        {assignment?.listing?.address && (
                          <span
                            className="text-sm text-gray-600">, {assignment?.listing?.address}</span>
                        )}
                      </p>
                      {(assignment?.listing?.latitude !== undefined && assignment?.listing?.longitude !== undefined) && (
                        <a
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                          href={`https://yandex.ru/maps/?pt=${assignment?.listing?.longitude},${assignment?.listing?.latitude}&z=16&l=map`}
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
                          Показать на карте
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Divider */}
          <div className="border-t border-gray-100"></div>

          {/* Action Buttons */}
          <AssignmentActionButtons
            assignment={assignment}
            onAccept={onAccept}
            onDecline={onDecline}
            onTake={onTake}
            onStartReport={onStartReport}
            currentUserId={currentUserId}
            hasActiveAssignments={hasActiveAssignments}
          />
        </div>
      </div>
    </div>
  );
}
