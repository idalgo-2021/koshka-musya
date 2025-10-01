import {useState} from "react";
import {Assignment} from "@/entities/assignments/types";
import {HotelDetails} from "@/entities/assignments/api";
import {Button} from "@/components/ui/button";
import AnimatedCard from "./AnimatedCard";
import HotelImage from "./HotelImage";
import AssignmentActionButtons from "./AssignmentActionButtons";
import { formatDate } from "@/lib/date";

interface AssignmentCarouselProps {
  assignments: Assignment[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onAccept: (id: string) => Promise<void>;
  onDecline: (id: string) => Promise<void>;
  onStartReport?: (assignmentId: string) => void;
  hotelDetails: Record<string, HotelDetails>;
  hotelLoading: Record<string, boolean>;
}

export default function AssignmentCarousel({
  assignments,
  currentIndex,
  onIndexChange,
  onAccept,
  onDecline,
  onStartReport,
  hotelDetails,
  hotelLoading
} : AssignmentCarouselProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentAssignment = assignments[currentIndex];
  const hasNext = currentIndex < assignments.length - 1;
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

  if (assignments.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-accenttext/70">
            Предложение {currentIndex + 1} из {assignments.length}
          </span>
          {assignments.length > 1 && (
            <div className="flex space-x-1">
              {assignments.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                    index === currentIndex ? 'bg-accenttext' : 'bg-accenttext/30'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {assignments.length > 1 && (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={!hasPrev || isTransitioning}
              className="border-accenttext/30 text-accenttext hover:bg-accenttext/10"
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
              className="border-accenttext/30 text-accenttext hover:bg-accenttext/10"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"/>
              </svg>
            </Button>
          </div>
        )}
      </div>

      {/* Assignment Card */}
      <AnimatedCard
        className={`transition-all duration-200 ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}
        delay={0.1}
        direction="up"
      >
        <AssignmentCard
          assignment={currentAssignment}
          onAccept={onAccept}
          onDecline={onDecline}
          onStartReport={onStartReport}
          hotelDetails={hotelDetails}
          hotelLoading={hotelLoading}
        />
      </AnimatedCard>
    </div>
  );
}

function AssignmentCard({
  assignment,
  onAccept,
  onDecline,
  onStartReport,
  hotelDetails,
  hotelLoading
} : {
  assignment: Assignment;
  onAccept: (id: string) => Promise<void>;
  onDecline: (id: string) => Promise<void>;
  onStartReport?: (assignmentId: string) => void;
  hotelDetails: Record<string, HotelDetails>;
  hotelLoading: Record<string, boolean>;
}) {
  return (
    <div
      className="bg-white rounded-3xl shadow-2xl border-0 overflow-hidden hover:shadow-3xl transition-all duration-300 hover:scale-[1.02] group">
      <div className="relative">
        {/* Hotel Image with Overlay */}
        <div className="h-48 relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          {hotelDetails[assignment.listing.id]?.main_picture && (
            <HotelImage
              src={hotelDetails[assignment.listing.id]?.main_picture || ''}
              alt={assignment.listing.title}
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
              {assignment.listing.title}
            </h3>
            <p className="text-white text-sm leading-relaxed drop-shadow-xl shadow-black/50 font-medium">
              {assignment.listing.description}
            </p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-3">
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
                <p className="text-sm text-gray-600 leading-relaxed">{assignment.purpose}</p>
              </div>
            </div>

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

            {(hotelDetails[assignment.listing.id] || hotelLoading[assignment.listing.id]) && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-1">Адрес</p>
                  {hotelLoading[assignment.listing.id] ? (
                    <p className="text-sm text-gray-500">Загружаем адрес…</p>
                  ) : (
                    <div className="space-y-1">
                      {hotelDetails[assignment.listing.id]?.address && (
                        <p className="text-sm text-gray-600">{hotelDetails[assignment.listing.id]?.address}</p>
                      )}
                      {(hotelDetails[assignment.listing.id]?.city || hotelDetails[assignment.listing.id]?.country) && (
                        <p className="text-sm text-gray-500">
                          {hotelDetails[assignment.listing.id]?.city}
                          {hotelDetails[assignment.listing.id]?.city && hotelDetails[assignment.listing.id]?.country ? ", " : ""}
                          {hotelDetails[assignment.listing.id]?.country}
                        </p>
                      )}
                      {(hotelDetails[assignment.listing.id]?.latitude !== undefined && hotelDetails[assignment.listing.id]?.longitude !== undefined) && (
                        <a
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                          href={`https://yandex.ru/maps/?pt=${hotelDetails[assignment.listing.id]?.longitude},${hotelDetails[assignment.listing.id]?.latitude}&z=16&l=map`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z"
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
            onStartReport={onStartReport}
          />
        </div>
      </div>
    </div>
  );
}
