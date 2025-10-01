"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAuth } from "@/entities/auth/useAuth";
import { useAssignments } from "@/entities/assignments/useAssignments";
import { ReportsApi } from "@/entities/reports/api";
import { calculateReportProgress } from "@/lib/report-progress";

import { Button } from "@/components/ui/button";
import ContinueReportCard from "@/components/ContinueReportCard";
import DashboardHeader from "@/components/DashboardHeader";
import MainHeading from "@/components/MainHeading";

function StartAssignmentsContent() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { assignments, loading: assignmentsLoading } = useAssignments();
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);

  // Показываем принятые задания для начала заполнения
  // Те, у которых отчет в статусе generating (1) - еще не начатые
  const startAssignments = assignments.filter(assignment => {
    if (assignment.status.slug !== 'accepted') return false;
    
    // Находим соответствующий отчет
    const report = reports?.find(r => r.assignment_id === assignment.id);
    
    console.log(`Assignment ${assignment.id} startAssignments check:`, {
      reportStatus: report?.status,
      statusSlug: report?.status?.slug,
      statusId: report?.status?.id,
      statusName: report?.status?.name,
      isGenerating: (report?.status?.slug as string) === 'generating'
    });
    
    // Показываем только если отчет в статусе generating (1) - еще не начатый
    return (report?.status?.slug as string) === 'generating';
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

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

  const handleLogout = () => {
    logout();
    toast.success("Вы вышли из системы");
    router.push('/');
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
        // await fetchAssignments();
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

          {/* Start Assignments - Начать заполнение */}
          {(() => {
            const shouldShow = !assignmentsLoading && startAssignments.length > 0;
            console.log("=== START CARD CONDITIONS ===");
            console.log("assignmentsLoading:", assignmentsLoading);
            console.log("startAssignments.length:", startAssignments.length);
            console.log("shouldShow:", shouldShow);
            console.log("=== END START CARD CONDITIONS ===");
            return shouldShow;
          })() && (
            <div className="space-y-4">
              {startAssignments.map((assignment) => {
                // Находим соответствующий отчет для этого задания
                const report = reports?.find(r => r.assignment_id === assignment.id);
                return (
                  <ContinueReportCard
                    key={assignment.id}
                    assignment={assignment}
                    reportId={report?.id}
                    progress={0} // Для новых отчетов прогресс 0
                    onContinue={() => handleContinueReport(assignment.id)}
                    onSubmit={() => handleSubmitReport(assignment.id)}
                    isStartCard={true} // Флаг для отображения как "Начать заполнение"
                  />
                );
              })}
            </div>
          )}

          {/* No Start Assignments Message */}
          {!assignmentsLoading && startAssignments.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Нет заданий для начала
              </h3>
              <p className="text-gray-600 mb-6">
                У вас нет заданий, готовых к началу заполнения
              </p>
              <Button
                onClick={() => router.push('/dashboard/available')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Посмотреть доступные задания
              </Button>
            </div>
          )}

          {/* Loading State */}
          {assignmentsLoading && (
            <div className="space-y-6">
              <div className="animate-pulse">
                <div className="bg-white rounded-3xl shadow-2xl h-96"></div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function StartAssignments() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-accentgreen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accenttext mx-auto mb-4"></div>
          <p className="text-accenttext">Загрузка...</p>
        </div>
      </div>
    }>
      <StartAssignmentsContent />
    </Suspense>
  );
}
