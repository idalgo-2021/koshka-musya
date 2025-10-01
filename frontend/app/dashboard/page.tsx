"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAuth } from "@/entities/auth/useAuth";
import { useAssignments } from "@/entities/assignments/useAssignments";
import { ReportsApi } from "@/entities/reports/api";

import { Card, CardContent } from "@/components/ui/card";
import DashboardHeader from "@/components/DashboardHeader";
import MainHeading from "@/components/MainHeading";

function DashboardContent() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { assignments, loading: assignmentsLoading } = useAssignments();
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);

  // Подсчитываем количество заданий каждого типа
  const availableCount = assignments.filter(assignment => {
    const isOffered = assignment.status.slug === 'offered';
    const hasNoReporter = !assignment.reporter?.id || assignment.reporter?.id === '00000000-0000-0000-0000-000000000000';
    return isOffered && hasNoReporter;
  }).length;

  const startCount = assignments.filter(assignment => {
    if (assignment.status.slug !== 'accepted') return false;
    const report = reports?.find((r: any) => r.assignment_id === assignment.id);
    return (report?.status?.slug as string) === 'generating';
  }).length;

  const continueCount = assignments.filter(assignment => {
    if (assignment.status.slug !== 'accepted') return false;
    const report = reports?.find((r: any) => r.assignment_id === assignment.id);
    return report?.status?.slug === 'draft';
  }).length;

  // Загрузка отчетов для подсчета заданий
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

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  // Проверяем, первый ли это заход пользователя
  useEffect(() => {
    if (!loading && isAuthenticated && user?.id) {
      const hasSetFilters = localStorage.getItem('userFilters');
      if (!hasSetFilters) {
        // Первый заход - перенаправляем на страницу фильтров
        router.push('/filters');
      }
    }
  }, [loading, isAuthenticated, user?.id, router]);


  const handleLogout = () => {
    logout();
    toast.success("Вы вышли из системы");
    router.push('/');
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
          {/* Main Heading */}
          <MainHeading />

          {/* Navigation Cards */}
          <div className="space-y-4">
            {/* Available Assignments */}
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
              onClick={() => router.push('/dashboard/available')}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Доступные задания</h3>
                      <p className="text-sm text-gray-600">Новые задания для принятия</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{availableCount}</div>
                    <div className="text-xs text-gray-500">заданий</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Start Assignments */}
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
              onClick={() => router.push('/dashboard/start')}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Начать заполнение</h3>
                      <p className="text-sm text-gray-600">Принятые задания для начала работы</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{startCount}</div>
                    <div className="text-xs text-gray-500">заданий</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Continue Assignments */}
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
              onClick={() => router.push('/dashboard/continue')}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Продолжить заполнение</h3>
                      <p className="text-sm text-gray-600">Задания в процессе заполнения</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600">{continueCount}</div>
                    <div className="text-xs text-gray-500">заданий</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          {assignmentsLoading ? (
            <div className="mt-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accenttext mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Загрузка заданий...</p>
            </div>
          ) : (
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Всего заданий: <span className="font-semibold">{availableCount + startCount + continueCount}</span>
              </p>
            </div>
          )}
        </div>
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
