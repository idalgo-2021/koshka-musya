"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAuth } from "@/entities/auth/useAuth";
import { useAssignments } from "@/entities/assignments/useAssignments";
import { AssignmentsApi, type HotelDetails } from "@/entities/assignments/api";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AssignmentCarousel from "@/components/AssignmentCarousel";
import AssignmentSkeleton from "@/components/AssignmentSkeleton";
import NoAssignmentsCard from "@/components/NoAssignmentsCard";
import DashboardHeader from "@/components/DashboardHeader";
import MainHeading from "@/components/MainHeading";

interface AppError {
  message?: string;
  status?: number;
  code?: string;
  details?: unknown;
}

function AvailableAssignmentsContent() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { assignments, loading: assignmentsLoading, error: assignmentsError, retry, acceptAssignment, declineAssignment } = useAssignments();
  const router = useRouter();
  const [acceptedAssignment, setAcceptedAssignment] = useState<string | null>(null);
  const [storedHotelName, setStoredHotelName] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [startLoading, setStartLoading] = useState(false);
  const [hotelDetails, setHotelDetails] = useState<Record<string, HotelDetails>>({});
  const [hotelLoading, setHotelLoading] = useState<Record<string, boolean>>({});
  const [currentAssignmentIndex, setCurrentAssignmentIndex] = useState(0);

  // Показываем доступные задания (offered) - свободные для взятия
  const displayAssignments = assignments.filter(assignment => {
    const isOffered = assignment.status.slug === 'offered';
    const hasNoReporter = !assignment.reporter?.id || assignment.reporter?.id === '00000000-0000-0000-0000-000000000000';
    const shouldShow = isOffered && hasNoReporter;
    
    console.log(`Assignment ${assignment.id}:`, {
      status_slug: assignment.status.slug,
      reporter_id: assignment.reporter?.id,
      isOffered,
      hasNoReporter,
      shouldShow
    });
    
    return shouldShow;
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  // Подгрузка деталей локации
  useEffect(() => {
    if (!assignments || assignments.length === 0) return;

    const ids = assignments.map(a => a.listing.id);
    const idsToLoad = ids.filter(id => !hotelDetails[id] && !hotelLoading[id]);

    if (idsToLoad.length === 0) return;

    idsToLoad.forEach(async (id) => {
      setHotelLoading(prev => ({ ...prev, [id]: true }));
      try {
        const d = await AssignmentsApi.getHotelDetails(id);
        setHotelDetails(prev => ({ ...prev, [id]: d }));
      } catch (error) {
        console.error('Failed to load hotel details:', error);
      } finally {
        setHotelLoading(prev => ({ ...prev, [id]: false }));
      }
    });
  }, [assignments, hotelDetails, hotelLoading]);

  const handleLogout = () => {
    logout();
    toast.success("Вы вышли из системы");
    router.push('/');
  };

  const handleAcceptAssignment = async (assignmentId: string) => {
    // Не принимаем задание сразу, только показываем FAQ
    setAcceptedAssignment(assignmentId);
    setShowInstructions(true);
    toast.success("Переходим к памятке...");

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const current = displayAssignments.find(a => a.id === assignmentId);
    if (current?.listing?.title) {
      setStoredHotelName(current.listing.title);
    }
  };

  const handleDeclineAssignment = async (assignmentId: string) => {
    try {
      await declineAssignment(assignmentId);
      setAcceptedAssignment(null);
      setStoredHotelName(null);
      setShowInstructions(false);
      toast.success("Задание отклонено");
    } catch (error: unknown) {
      console.error("Error declining assignment:", error);
      if ((error as AppError)?.status !== 409) {
        toast.error("Ошибка при отклонении задания");
      }
    }
  };

  const handleConfirmAcceptance = async (assignmentId: string) => {
    console.log("Starting handleConfirmAcceptance for assignment:", assignmentId);

    try {
      await acceptAssignment(assignmentId);
      console.log("acceptAssignment completed successfully");

      toast.success("Задание принято! Переходим к заполнению отчета...");

      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      // После принятия задания, ждем немного и ищем отчет
      setTimeout(async () => {
        try {
          console.log("Searching for report...");
          // Здесь будет логика поиска отчета и перехода к нему
          router.push('/dashboard/start');
        } catch (error) {
          console.error('Error finding report:', error);
          toast.error('Ошибка при поиске отчёта');
        }
      }, 1000);

    } catch (error: unknown) {
      console.error("Error accepting assignment:", error);
      
      const errorMessage = (error as AppError)?.message || 'Неизвестная ошибка';
      
      if (errorMessage.includes('accept is allowed only within 24 hours before check-in')) {
        toast.error('Задание можно принять только в течение 24 часов до заезда');
      } else if ((error as AppError)?.status !== 409) {
        toast.error(`Ошибка при принятии задания: ${errorMessage}`);
      }

      setAcceptedAssignment(null);
      setShowInstructions(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accentgreen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accenttext mx-auto mb-4"></div>
          <p className="text-accenttext">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-accentgreen">
      {/* Header */}
      <DashboardHeader username={user?.username} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="min-h-screen">
        {acceptedAssignment ? (
          <div className="max-w-md mx-auto px-6 py-8">
            <MainHeading />
            
            {/* Assignment Process Component would go here */}
            <Card className="mb-6">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-4">Инструкции по выполнению задания</h3>
                <p className="text-gray-600 mb-6">
                  Ознакомьтесь с памяткой перед началом работы
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={() => handleConfirmAcceptance(acceptedAssignment)}
                    disabled={startLoading}
                    className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-2xl"
                  >
                    {startLoading ? "Принимаем задание..." : "Принять задание"}
                  </Button>
                  <Button
                    onClick={() => {
                      setAcceptedAssignment(null);
                      setShowInstructions(false);
                    }}
                    variant="outline"
                    className="w-full h-12 border-2 border-gray-300 text-gray-600 hover:bg-gray-50 font-semibold rounded-2xl"
                  >
                    Назад к заданиям
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-md mx-auto px-6 py-8">
            {/* Navigation */}
            <div className="mb-6">
              <Button
                onClick={() => router.push('/dashboard')}
                variant="outline"
                className="mb-4"
              >
                ← Назад к дашборду
              </Button>
            </div>

            {/* Main Heading */}
            <MainHeading />

            {/* Error State */}
            {assignmentsError && !assignmentsLoading && (
              <Card className="mb-6 bg-red-50 border-red-200">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-red-800 mb-2">
                    Ошибка загрузки заданий
                  </h3>
                  <p className="text-red-600 mb-4">{assignmentsError}</p>
                  <Button
                    onClick={retry}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Попробовать снова
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Available Assignments */}
            {!assignmentsLoading && displayAssignments.length > 0 && (
              <AssignmentCarousel
                assignments={displayAssignments}
                currentIndex={currentAssignmentIndex}
                onIndexChange={setCurrentAssignmentIndex}
                onAccept={handleAcceptAssignment}
                onDecline={handleDeclineAssignment}
                onStartReport={(assignmentId) => {
                  router.push(`/reports?assignment=${assignmentId}`);
                }}
                hotelDetails={hotelDetails}
                hotelLoading={hotelLoading}
              />
            )}

            {/* Loading State */}
            {assignmentsLoading && (
              <div className="space-y-6">
                <AssignmentSkeleton />
                <AssignmentSkeleton />
              </div>
            )}

            {/* No Tasks Message */}
            {!assignmentsLoading && displayAssignments.length === 0 && (
              <NoAssignmentsCard />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function AvailableAssignments() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-accentgreen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accenttext mx-auto mb-4"></div>
          <p className="text-accenttext">Загрузка...</p>
        </div>
      </div>
    }>
      <AvailableAssignmentsContent />
    </Suspense>
  );
}
