"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { useAuth } from "@/entities/auth/useAuth";
import { useAssignments } from "@/entities/assignments/useAssignments";
import { AssignmentsApi, type HotelDetails } from "@/entities/assignments/api";
import { ReportsApi } from "@/entities/reports/api";
import type { Report } from "@/entities/reports/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AssignmentProcess from "@/components/AssignmentProcess";
import AssignmentCarousel from "@/components/AssignmentCarousel";
import AssignmentSkeleton from "@/components/AssignmentSkeleton";
import NoAssignmentsCard from "@/components/NoAssignmentsCard";
import ContinueReportCard from "@/components/ContinueReportCard";
import DashboardHeader from "@/components/DashboardHeader";
import MainHeading from "@/components/MainHeading";

import { calculateReportProgress } from "@/lib/report-progress";

interface AppError {
  message?: string;
  status?: number;
  code?: string;
  details?: unknown;
}

function DashboardContent() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { assignments, loading: assignmentsLoading, error: assignmentsError, retry, acceptAssignment, declineAssignment, fetchAssignments } = useAssignments();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [acceptedAssignment, setAcceptedAssignment] = useState<string | null>(null);
  const [storedHotelName, setStoredHotelName] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [startLoading, setStartLoading] = useState(false);
  const [fromReportCard, setFromReportCard] = useState<boolean>(false);
  const [reportId, setReportId] = useState<string | null>(null);
  const [hotelDetails, setHotelDetails] = useState<Record<string, HotelDetails>>({});
  const [hotelLoading, setHotelLoading] = useState<Record<string, boolean>>({});
  const [currentAssignmentIndex, setCurrentAssignmentIndex] = useState(0);
  const [reports, setReports] = useState<Report[]>([]);

  // Показываем активные задания (pending или offered)
  const displayAssignments = assignments.filter(assignment =>
    assignment.status.slug === 'pending' || assignment.status.slug === 'offered'
  );

  // Показываем принятые задания для продолжения заполнения
  const acceptedAssignments = assignments.filter(assignment =>
    assignment.status.slug === 'accepted'
  );

  // Логируем для отладки
  console.log("=== DASHBOARD DEBUG ===");
  console.log("Current user:", user);
  console.log("User ID:", user?.id);
  console.log("Is authenticated:", isAuthenticated);
  console.log("All assignments:", assignments);
  console.log("All assignments count:", assignments.length);
  console.log("Display assignments:", displayAssignments);
  console.log("Accepted assignments:", acceptedAssignments);
  console.log("Assignments details:", assignments.map(a => ({
    id: a.id,
    status: a.status.slug,
    statusId: a.status.id,
    statusName: a.status.name
  })));
  console.log("=== END DASHBOARD DEBUG ===");

  // Обработка параметров showFAQ и reportId из URL
  useEffect(() => {
    const showFAQ = searchParams.get('showFAQ');
    const reportIdParam = searchParams.get('reportId');
    const fromContinue = searchParams.get('fromContinue'); // Новый параметр для различения источника

    if (showFAQ === 'true') {
      // Показываем FAQ как общую инструкцию (без привязки к конкретному заданию)
      setAcceptedAssignment(null);
      setStoredHotelName(null);
      setShowInstructions(true);
      setFromReportCard(true); // Отмечаем, что пришли с карточки отчета
      setReportId(reportIdParam); // Сохраняем ID отчета

      // Сохраняем информацию о том, откуда пришли
      if (fromContinue === 'true') {
        // Пришли с карточки "Продолжить заполнение"
        localStorage.setItem('faqFromContinue', 'true');
      } else {
        // Пришли с карточки "Начать заполнение" или другого места
        localStorage.removeItem('faqFromContinue');
      }

      // Убираем параметры из URL
      router.replace('/dashboard');
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  // Проверяем, есть ли принятые задания после загрузки пользователя
  useEffect(() => {
    if (loading || !isAuthenticated || !user?.id || assignmentsLoading) return;

    // Не показываем инструкции автоматически - только при явном переходе к FAQ

    // Сбрасываем индекс при изменении списка заданий
    setCurrentAssignmentIndex(0);
  }, [loading, isAuthenticated, user?.id, assignmentsLoading, assignments]);

  // Загрузка отчетов для принятых заданий
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const loadReports = async () => {
      try {
        const my = await ReportsApi.getMyReports(1, 50);
        setReports(my.reports);
      } catch (error) {
        console.error('Failed to load reports:', error);
      }
    };

    loadReports();
  }, [isAuthenticated, user?.id]);

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

  const handleBackToReport = () => {
    const fromContinue = localStorage.getItem('faqFromContinue');

    console.log("=== HANDLE BACK TO REPORT ===");
    console.log("fromContinue:", fromContinue);
    console.log("reportId:", reportId);
    console.log("Current showInstructions:", showInstructions);
    console.log("Current fromReportCard:", fromReportCard);

    if (fromContinue === 'true') {
      // Возвращаемся к карточке "Продолжить заполнение"
      console.log("Returning to Continue Report Card");
      localStorage.removeItem('faqFromContinue');
      setShowInstructions(false); // Сбрасываем показ FAQ
      setFromReportCard(false); // Сбрасываем флаг
      router.push('/dashboard');
    } else if (reportId) {
      // Возвращаемся к карточке "Начать заполнение"
      console.log("Returning to Start Report Card");
      router.push(`/reports/${reportId}/start`);
    }
    console.log("=== END HANDLE BACK TO REPORT ===");
  };

  const handleContinueReport = async (assignmentId: string) => {
    try {
      // Ищем отчет для этого задания
      const my = await ReportsApi.getMyReports();
      const report = my.reports.find(r => r.assignment_id === assignmentId);

      if (report) {
        router.push(`/reports/${report.id}`);
      } else {
        toast.error('Отчет не найден');
      }
    } catch (error) {
      console.error('Error finding report:', error);
      toast.error('Ошибка при поиске отчета');
    }
  };


  const handleSubmitReport = async (assignmentId: string) => {
    console.log("=== HANDLE SUBMIT REPORT ===");
    console.log("Submitting report for assignment ID:", assignmentId);

    try {
      // Ищем отчет для этого задания
      const my = await ReportsApi.getMyReports();
      const report = my.reports.find(r => r.assignment_id === assignmentId);

      if (report) {
        console.log("Found report:", report.id, "Status:", report.status);

        // Отправляем отчет на проверку
        console.log("Calling ReportsApi.submit...");
        await ReportsApi.submit(report.id);
        console.log("Report submitted successfully");

        toast.success('Отчет отправлен на проверку');

        // Обновляем список заданий после отправки
        console.log("Refreshing assignments after submit...");
        await fetchAssignments();
      } else {
        console.log("Report not found for assignment:", assignmentId);
        toast.error('Отчет не найден');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      console.log("Error type:", typeof error);
      console.log("Error message:", error instanceof Error ? error.message : String(error));
      toast.error('Ошибка при отправке отчета');
    }

    console.log("=== END HANDLE SUBMIT REPORT ===");
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

      // Не показываем ошибку для 409 - это нормальное поведение
      if ((error as AppError)?.status !== 409) {
        toast.error("Ошибка при отклонении задания");
      }
    }
  };

  const handleConfirmAcceptance = async (assignmentId: string) => {
    console.log("Starting handleConfirmAcceptance for assignment:", assignmentId);

    try {
      // Сначала проверяем, есть ли уже отчет для этого задания
      console.log("Checking if report already exists...");
      const my = await ReportsApi.getMyReports(1, 50);
      console.log("All reports from API:", my.reports.map(r => ({
        id: r.id,
        assignment_id: r.assignment_id,
        status: r.status || 'unknown'
      })));
      console.log("Looking for assignment_id:", assignmentId);
      const existingReport = my.reports.find(r => r.assignment_id === assignmentId);
      console.log("Found existing report:", existingReport);

      if (existingReport) {
        console.log("Report already exists, assignment is already accepted");
        console.log("Existing report ID:", existingReport.id);
        console.log("Assignment ID:", assignmentId);
        console.log("This means assignment should have status 'accepted' (2) in DB");
        console.log("Redirecting to existing report:", existingReport.id);
        toast.success("Переходим к заполнению отчета...");
        // Сбрасываем состояние перед переходом
        setAcceptedAssignment(null);
        setShowInstructions(false);
        setFromReportCard(false);
        router.push(`/reports/${existingReport.id}/start`);
        return;
      }

      console.log("No existing report found, calling acceptAssignment...");
      console.log("Assignment ID:", assignmentId);
      await acceptAssignment(assignmentId);
      console.log("acceptAssignment completed successfully");

      // Обновляем список заданий после принятия
      console.log("Assignment accepted, status should be updated in DB");
      console.log("Waiting for assignments list to update...");

      toast.success("Задание принято! Переходим к заполнению отчета...");

      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      // После принятия задания, ждем немного и ищем отчет
      setTimeout(async () => {
        try {
          console.log("Searching for report...");
          const my = await ReportsApi.getMyReports(1, 50);
          console.log("All reports:", my.reports.map(r => ({ id: r.id, assignment_id: r.assignment_id })));
          const report = my.reports.find(r => r.assignment_id === assignmentId);

          if (report) {
            console.log("Report found, redirecting to:", report.id);
            // Сбрасываем состояние перед переходом
            setAcceptedAssignment(null);
            setShowInstructions(false);
            router.push(`/reports/${report.id}/start`);
          } else {
            console.log("Report not found, retrying...");
            // Если отчет не найден, попробуем еще раз через секунду
            setTimeout(async () => {
              try {
                const myRetry = await ReportsApi.getMyReports(1, 50);
                console.log("All reports on retry:", myRetry.reports.map(r => ({ id: r.id, assignment_id: r.assignment_id })));
                const reportRetry = myRetry.reports.find(r => r.assignment_id === assignmentId);

                if (reportRetry) {
                  console.log("Report found on retry, redirecting to:", reportRetry.id);
                  // Сбрасываем состояние перед переходом
                  setAcceptedAssignment(null);
                  setShowInstructions(false);
                  router.push(`/reports/${reportRetry.id}/start`);
                } else {
                  console.log("Report still not found after retry");
                  toast.error('Отчёт не найден. Обратитесь к администратору.');
                }
              } catch (error) {
                console.error('Error finding report on retry:', error);
                toast.error('Ошибка при поиске отчёта');
              }
            }, 2000);
          }
        } catch (error) {
          console.error('Error finding report:', error);
          toast.error('Ошибка при поиске отчёта');
        }
      }, 1000);

    } catch (error: unknown) {
      console.error("Error accepting assignment:", error);
      console.error("Error details:", {
        message: (error as AppError)?.message,
        status: (error as AppError)?.status,
        code: (error as AppError)?.code,
        details: (error as AppError)?.details
      });

      // Если это ошибка дубликата отчета, попробуем найти существующий отчет
      if ((error as AppError)?.message?.includes('duplicate key') || (error as AppError)?.message?.includes('23505')) {
        console.log("Duplicate report error detected, searching for existing report...");
        try {
          const my = await ReportsApi.getMyReports(1, 50);
          const existingReport = my.reports.find(r => r.assignment_id === assignmentId);

          if (existingReport) {
            console.log("Found existing report, redirecting to:", existingReport.id);
            toast.success("Переходим к заполнению отчета...");
            // Сбрасываем состояние перед переходом
            setAcceptedAssignment(null);
            setShowInstructions(false);
            router.push(`/reports/${existingReport.id}/start`);
            return;
          }
        } catch (searchError) {
          console.error('Error searching for existing report:', searchError);
        }
      }

      // Не показываем ошибку для 409 - это нормальное поведение
      if ((error as AppError)?.status !== 409) {
        toast.error(`Ошибка при принятии задания: ${(error as AppError)?.message || 'Неизвестная ошибка'}`);
      }

      setAcceptedAssignment(null);
      setShowInstructions(false);
      setFromReportCard(false);
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

        {/* Main Content - Hotel Check Proposal */}
        <main className="min-h-screen">
          {acceptedAssignment ? (
            <AssignmentProcess
              assignmentId={acceptedAssignment}
              hotelName={
                displayAssignments.find(a => a.id === acceptedAssignment)?.listing.title ||
                storedHotelName ||
                "отель"
              }
              onContinue={async () => {
                if (!acceptedAssignment) return;
                if (startLoading) return;
                setStartLoading(true);
                try {
                  await handleConfirmAcceptance(acceptedAssignment);
                } finally {
                  setStartLoading(false);
                }
              }}
              onBack={fromReportCard ? undefined : () => {
                setAcceptedAssignment(null);
                setShowInstructions(false);
              }}
            />
          ) : showInstructions ? (
            <AssignmentProcess
              assignmentId={acceptedAssignment || ''}
              hotelName={displayAssignments[0]?.listing.title || storedHotelName || 'отеля'}
              onContinue={acceptedAssignment ? async () => {
                if (startLoading) return;
                setStartLoading(true);
                try {
                  await handleConfirmAcceptance(acceptedAssignment);
                } finally {
                  setStartLoading(false);
                }
              } : undefined}
              onBack={fromReportCard ? undefined : () => {
                setShowInstructions(false);
                setFromReportCard(false); // Сбрасываем флаг при возврате к предложениям
              }}
              onBackToReport={fromReportCard && reportId ? handleBackToReport : undefined}
            />
          ) : (
            <div className="max-w-md mx-auto px-6 py-8">
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

              {/* Assignments from DB */}
              {!assignmentsLoading && displayAssignments.length > 0 && (
                <AssignmentCarousel
                  assignments={displayAssignments}
                  currentIndex={currentAssignmentIndex}
                  onIndexChange={setCurrentAssignmentIndex}
                  onAccept={handleAcceptAssignment}
                  onDecline={handleDeclineAssignment}
                  onStartReport={(assignmentId) => {
                    // Логика для перехода к отчету
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

              {/* Accepted Assignments - Continue Reports */}
              {(() => {
                const shouldShow = !assignmentsLoading && acceptedAssignments.length > 0 && displayAssignments.length === 0 && !showInstructions && !acceptedAssignment;
                console.log("=== CONTINUE CARD CONDITIONS ===");
                console.log("assignmentsLoading:", assignmentsLoading);
                console.log("acceptedAssignments.length:", acceptedAssignments.length);
                console.log("displayAssignments.length:", displayAssignments.length);
                console.log("showInstructions:", showInstructions);
                console.log("acceptedAssignment:", acceptedAssignment);
                console.log("shouldShow:", shouldShow);
                console.log("=== END CONTINUE CARD CONDITIONS ===");
                return shouldShow;
              })() && (
                <div className="space-y-4">
                  {acceptedAssignments.map((assignment) => {
                    // Находим соответствующий отчет для этого задания
                    const report = reports?.find(r => r.assignment_id === assignment.id);
                    // Рассчитываем прогресс заполнения отчета
                    const progress = calculateReportProgress(report?.checklist_schema);
                    return (
                      <ContinueReportCard
                        key={assignment.id}
                        assignment={assignment}
                        reportId={report?.id}
                        progress={progress}
                        onContinue={() => handleContinueReport(assignment.id)}
                        onSubmit={() => handleSubmitReport(assignment.id)}
                      />
                    );
                  })}
                </div>
              )}

              {/* No Tasks Message */}
              {!assignmentsLoading && displayAssignments.length === 0 && acceptedAssignments.length === 0 && !showInstructions && !acceptedAssignment && !storedHotelName && (
                <NoAssignmentsCard />
              )}
            </div>
          )}
        </main>
      </div>
    );
  }

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-accentgreen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accenttext mx-auto mb-4"></div>
          <p className="text-accenttext">Загрузка...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
