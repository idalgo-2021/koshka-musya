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
import {tree} from "next/dist/build/templates/app-page";
import {AssignmentsResponse} from "@/entities/assignments/types";


interface AppError {
  message?: string;
  status?: number;
  code?: string;
  details?: unknown;
}

function DashboardContent() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { assignments, loading: assignmentsLoading, setError, setLoading, error: assignmentsError, retry, acceptAssignment, declineAssignment, fetchAssignments, setAssignments } = useAssignments();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [acceptedAssignment, setAcceptedAssignment] = useState<string | null>(null);
  const [storedHotelName, setStoredHotelName] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [startLoading, setStartLoading] = useState(false);
  const [reportSearchLoading, setReportSearchLoading] = useState(false);
  const [fromReportCard, setFromReportCard] = useState<boolean>(false);
  const [reportId, setReportId] = useState<string | null>(null);
  const [hotelDetails, setHotelDetails] = useState<Record<string, HotelDetails>>({});
  const [hotelLoading, setHotelLoading] = useState<Record<string, boolean>>({});
  const [currentAssignmentIndex, setCurrentAssignmentIndex] = useState(0);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedListingType, setSelectedListingType] = useState<string>('');

  // Обработчик изменения типа объекта
  const handleListingTypeChange = async (newTypeId: number | undefined) => {
    try {
      setSelectedListingType(newTypeId)
      setLoading(true)
      // debugger;
      const offeredResponse: AssignmentsResponse = await AssignmentsApi.getAvailableAssignments(1, 20, newTypeId);
      setAssignments(offeredResponse.assignments);
      // debugger;
      setLoading(false)
    } catch (error) {
      setLoading(false)

    }
    setCurrentAssignmentIndex(0); // Сбрасываем индекс при смене фильтра
  };

  // Показываем принятые задания для продолжения заполнения
  const acceptedAssignments = assignments.filter(assignment =>
    assignment.status.slug === 'accepted'
  );

  // Показываем взятые задания (pending) - взятые пользователем, но еще не принятые
  const takenAssignments = assignments.filter(assignment =>
    assignment.status.slug === 'pending' && assignment.reporter?.id === user?.id
  );

  // Показываем предложения (offered) - теперь useAssignments уже фильтрует их
  const displayAssignments = assignments.filter(assignment =>
    assignment.status.slug === 'offered'
  );

  console.log({displayAssignments });

  // Проверяем, есть ли активные задания
  const hasActiveAssignments = acceptedAssignments.length > 0 || takenAssignments.length > 0;

  // Логируем для отладки
  console.log("=== DASHBOARD DEBUG ===");
  console.log("Current user:", user);
  console.log("User ID:", user?.id);
  console.log("Is authenticated:", isAuthenticated);
  console.log("All assignments:", assignments);
  console.log("All assignments count:", assignments.length);
  console.log("Display assignments:", displayAssignments);
  console.log("Accepted assignments:", acceptedAssignments);
  console.log("Taken assignments:", takenAssignments);
  console.log("Has active assignments:", hasActiveAssignments);
  console.log("Assignments details:", assignments.map(a => ({
    id: a.id,
    status: a.status.slug,
    statusId: a.status.id,
    statusName: a.status.name
  })));
  console.log("Current user ID for AssignmentCarousel:", user?.id);
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

      // Убираем параметры из URL только если мы не в процессе показа FAQ
      if (!showInstructions) {
        router.replace('/dashboard');
      }
    }
  }, [searchParams, router, showInstructions]);

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
      // Возвращаемся к карточке "Продолжить заполнение" или "Начать заполнение"
      console.log("Returning to Report Card");
      localStorage.removeItem('faqFromContinue');
      setShowInstructions(false); // Сбрасываем показ FAQ
      setFromReportCard(false); // Сбрасываем флаг
      // Не делаем router.push, просто скрываем FAQ - карточка уже отображается
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
        console.log('Navigating to report:', report.id);

        // Проверяем статус отчета (generating и draft считаем рабочими статусами)
        if (report.status?.slug === 'draft' || report.status?.slug === 'generating') {
          // Для новых отчетов (без checklist_schema) используем start страницу
          if (!report.checklist_schema || Object.keys(report.checklist_schema).length === 0) {
            console.log('New report detected, using start page');
            router.push(`/reports/${report.id}/start`);
          } else {
            console.log('Existing report detected, using main page');
            router.push(`/reports/${report.id}`);
          }
        } else {
          const statusName = report.status?.name || report.status?.slug || 'неизвестный';
          toast.error(`Отчет в статусе "${statusName}". Загрузка недоступна.`);
        }
      } else {
        console.log('Report not found for assignment:', assignmentId);
        toast.error('Отчет не найден');
      }
    } catch (error) {
      console.error('Error finding report:', error);
      console.error('Error details:', error);

      // Показываем более детальную ошибку
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      if (errorMessage.includes('500') || errorMessage.includes('Internal server error')) {
        toast.error('Ошибка сервера при загрузке отчета. Попробуйте позже.');
      } else {
        toast.error(`Ошибка при поиске отчета: ${errorMessage}`);
      }
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
    console.log("=== HANDLE ACCEPT ASSIGNMENT ===");
    console.log("Assignment ID:", assignmentId);
    console.log("Display assignments:", displayAssignments);

    const current = displayAssignments.find(a => a.id === assignmentId);
    console.log("Current assignment:", current);
    console.log("Current assignment reporter:", current?.reporter);
    console.log("Current assignment reporter ID:", current?.reporter?.id);
    console.log("Reporter ID type:", typeof current?.reporter?.id);
    console.log("Reporter ID === null:", current?.reporter?.id === null);
    console.log("Reporter ID === undefined:", current?.reporter?.id === undefined);
    console.log("Reporter ID === '00000000-0000-0000-0000-000000000000':", current?.reporter?.id === '00000000-0000-0000-0000-000000000000');

    // Проверяем, взято ли задание текущим пользователем
    const isAssignedToCurrentUser = current?.reporter?.id &&
                                   current.reporter.id !== null &&
                                   current.reporter.id !== undefined &&
                                   current.reporter.id !== '00000000-0000-0000-0000-000000000000' &&
                                   current.reporter.id === user?.id;

    console.log("Is assigned to current user:", isAssignedToCurrentUser);

    if (isAssignedToCurrentUser) {
      // Если задание уже взято пользователем - показываем Памятку Агента
      console.log("Assignment is taken by user, showing agent instructions");
      setAcceptedAssignment(assignmentId);
      setShowInstructions(true);
    } else {
      // Если задание в общем пуле - просто берем его через API
      console.log("Assignment is in general pool, taking it via API");
      try {
        await acceptAssignment(assignmentId);
        toast.success("Задание успешно взято!");
        await fetchAssignments();
      } catch (error) {
        console.error('Error taking assignment:', error);
        toast.error('Ошибка при взятии задания');
      }
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

  const handleTakeAssignment = async (assignmentId: string) => {
    console.log("=== HANDLE TAKE ASSIGNMENT ===");
    console.log("Assignment ID:", assignmentId);

    try {
      // Используем API для взятия предложения
      await AssignmentsApi.takeFreeAssignment(assignmentId);
      toast.success("Предложение успешно взято!");
      await fetchAssignments();
    } catch (error) {
      console.error('Error taking assignment:', error);
      toast.error('Ошибка при взятии предложения');
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
        setReportSearchLoading(false);

        // Проверяем, есть ли checklist_schema для определения правильного маршрута
        if (!existingReport.checklist_schema || Object.keys(existingReport.checklist_schema).length === 0) {
          console.log('Existing report without schema, using start page');
          router.push(`/reports/${existingReport.id}/start`);
        } else {
          console.log('Existing report with schema, using main page');
          router.push(`/reports/${existingReport.id}`);
        }
        return;
      }

      console.log("No existing report found, calling acceptAssignment...");
      console.log("Assignment ID:", assignmentId);
      await acceptAssignment(assignmentId);
      console.log("acceptAssignment completed successfully");

      // Обновляем список заданий после принятия
      await fetchAssignments();

      toast.success("Задание принято! Переходим к заполнению отчета...");

      // Показываем загрузку поиска отчета
      setReportSearchLoading(true);

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
            setFromReportCard(false);
            setReportSearchLoading(false);
            // Для нового отчета всегда используем start страницу (карточка "Начать заполнение")
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
                  setFromReportCard(false);
                  setReportSearchLoading(false);
                  // Для нового отчета всегда используем start страницу (карточка "Начать заполнение")
                  router.push(`/reports/${reportRetry.id}/start`);
                } else {
                  console.log("Report still not found after retry");
                  setReportSearchLoading(false);
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
          setReportSearchLoading(false);
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
            setFromReportCard(false);
            setReportSearchLoading(false);
            router.push(`/reports/${existingReport.id}/start`);
            return;
          }
        } catch (searchError) {
          console.error('Error searching for existing report:', searchError);
        }
      }

      // Обрабатываем разные типы ошибок
      const errorMessage = (error as AppError)?.message || 'Неизвестная ошибка';

      if ((error as AppError)?.status === 409) {
        // Специальная обработка для ошибки времени
        if (errorMessage.includes('24 hours before check-in')) {
          toast.error('Задание можно принять только в течение 24 часов до заселения');
        } else if (errorMessage.includes('already has') || errorMessage.includes('duplicate')) {
          toast.error('Задание уже принято другим пользователем');
        } else {
          toast.error('Задание недоступно для принятия');
        }
      } else {
        toast.error(`Ошибка при принятии задания: ${errorMessage}`);
      }

      setAcceptedAssignment(null);
      setShowInstructions(false);
      setFromReportCard(false);
      setReportSearchLoading(false);
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
    return <p>sdfasf</p>;
  }

  return (
      <div className="min-h-screen bg-accentgreen">
        {/* Header */}
        <DashboardHeader username={user?.username} onLogout={handleLogout} />

        {/* Main Content - Hotel Check Proposal */}
        <main className="min-h-screen">
          {reportSearchLoading ? (
            <div className="min-h-screen flex items-center justify-center bg-accentgreen">
              <div className="text-center max-w-md mx-auto px-6">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-accenttext border-t-transparent mx-auto mb-6"></div>
                <h2 className="text-xl font-bold text-accenttext mb-3">Создаем отчет...</h2>
                <p className="text-accenttext/70 text-sm leading-relaxed">
                  Пожалуйста, подождите. Мы создаем отчет для вашего задания и подготавливаем все необходимое для заполнения.
                </p>
                <div className="mt-6 bg-white/20 rounded-2xl p-4">
                  <div className="flex items-center justify-center space-x-2 text-accenttext/80">
                    <div className="w-2 h-2 bg-accenttext rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-accenttext rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-accenttext rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          ) : acceptedAssignment ? (
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
                  // Сразу переходим к созданию отчета, минуя промежуточные страницы
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
                  // Переходим к отчету без изменения статуса задания
                  router.push(`/reports?assignment=${acceptedAssignment}`);
                } finally {
                  setStartLoading(false);
                }
              } : fromReportCard ? undefined : undefined}
              onBack={fromReportCard ? undefined : () => {
                setShowInstructions(false);
                setFromReportCard(false); // Сбрасываем флаг при возврате к предложениям
              }}
              onBackToReport={fromReportCard ? handleBackToReport : undefined}
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
              {!assignmentsLoading && displayAssignments.length >= 0 && (
                <AssignmentCarousel
                  assignments={displayAssignments}
                  currentIndex={currentAssignmentIndex}
                  onIndexChange={setCurrentAssignmentIndex}
                  onAccept={handleAcceptAssignment}
                  onDecline={handleDeclineAssignment}
                  onTake={handleTakeAssignment}
                  onStartReport={(assignmentId) => {
                    // Логика для перехода к отчету
                    router.push(`/reports?assignment=${assignmentId}`);
                  }}
                  hotelDetails={hotelDetails}
                  hotelLoading={hotelLoading}
                  currentUserId={user?.id}
                  hasActiveAssignments={hasActiveAssignments}
                  selectedListingType={selectedListingType}
                  onListingTypeChange={handleListingTypeChange}
                />
              )}

              {/*{displayAssignments.length === 0 && (*/}
              {/*  <p>empty state</p>*/}
              {/*)}*/}

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
                    // Определяем, является ли это новым заданием
                    // "Начать заполнение" - только если отчета вообще нет
                    // "Продолжить заполнение" - если отчет существует (даже с прогрессом 0%)
                    const isStartCard = !report;
                    return (
                      <ContinueReportCard
                        key={assignment.id}
                        assignment={assignment}
                        report={report}
                        reportId={report?.id}
                        progress={progress}
                        isStartCard={isStartCard}
                        onContinue={() => handleContinueReport(assignment.id)}
                        onSubmit={() => handleSubmitReport(assignment.id)}
                        onShowFAQ={() => {
                          // Показываем FAQ без перезагрузки страницы
                          setShowInstructions(true);
                          setAcceptedAssignment(null);
                          setStoredHotelName(null);
                          setFromReportCard(true); // Отмечаем, что пришли с карточки отчета
                          setReportId(report?.id || null); // Сохраняем ID отчета
                          // Сохраняем информацию о том, что пришли с карточки
                          localStorage.setItem('faqFromContinue', 'true');
                        }}
                      />
                    );
                  })}
                </div>
              )}

              {/* Taken Assignments (pending) */}
              {takenAssignments.length > 0 && (
                <div className="space-y-4">
                  {takenAssignments.map((assignment) => (
                    <div key={assignment.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800 mb-2">{assignment.listing.title}</h3>
                          <p className="text-gray-600 text-sm mb-2">{assignment.listing.address}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>📅 {assignment.checkin_date && assignment.checkout_date ? `${new Date(assignment.checkin_date).toLocaleDateString('ru-RU')} - ${new Date(assignment.checkout_date).toLocaleDateString('ru-RU')}` : 'Даты не указаны'}</span>
                            <span>🏨 {assignment.listing.listing_type?.name || 'Тип не указан'}</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                            Взято
                          </span>
                        </div>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-800 text-sm">
                          <strong>Задание взято!</strong> Принять его можно будет за 24 часа до заселения.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/*{displayAssignments.length === 0 }*/}
              {/* No Tasks Message */}
              {!assignmentsLoading && displayAssignments.length === 0&&  acceptedAssignments.length === 0 && takenAssignments.length === 0 && !showInstructions && !acceptedAssignment && !storedHotelName && (
                <NoAssignmentsCard
                  title={displayAssignments.length === 0 ? 'Не найдены предложения' : undefined}
                  descr={displayAssignments.length === 0 ? 'Попробуйте другой тип объекта' : undefined}
                />
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
