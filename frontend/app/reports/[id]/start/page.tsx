"use client";
import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';

import { useAuth } from '@/entities/auth/useAuth';
import { ReportsApi } from '@/entities/reports/api';
import type { Report } from '@/entities/reports/types';

import { Button } from '@/components/ui/button';
import DashboardHeader from '@/components/DashboardHeader';
import ReportStartCard from '@/components/ReportStartCard';

export default function ReportStartPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = String(params?.id ?? '');
  const { user, logout } = useAuth();

  const [report, setReport] = React.useState<Report | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Убираем автоматический редирект - start страница должна показываться даже с пустой схемой
  // React.useEffect(() => {
  //   if (report && (!report.checklist_schema || !report.checklist_schema.sections || report.checklist_schema.sections.length === 0)) {
  //     router.replace(`/reports/${reportId}`);
  //   }
  // }, [report, router, reportId]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await ReportsApi.getMyReportById(reportId);
        if (!mounted) return;
        setReport(r);
      } catch (error) {
        console.error('Error loading report in start page:', error);
        const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
        
        if (errorMessage.includes('500') || errorMessage.includes('Internal server error')) {
          console.log('Trying alternative method - loading from reports list...');
          try {
            // Пробуем загрузить отчет из списка отчетов
            const myReports = await ReportsApi.getMyReports(1, 50);
            const reportFromList = myReports.reports.find(r => r.id === reportId);
            
            if (reportFromList && mounted) {
              console.log('Found report in list, using it');
              setReport(reportFromList);
              return;
            }
          } catch (listError) {
            console.error('Failed to load from reports list:', listError);
          }
          
          toast.error('Ошибка сервера при загрузке отчета. Попробуйте позже.');
        } else {
          toast.error('Не удалось загрузить отчет');
        }
        
        // Перенаправляем на дашборд через 2 секунды
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [reportId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accentgreen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accenttext mx-auto mb-4"></div>
          <p className="text-accenttext">Загрузка отчёта...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accentgreen">
        <div className="text-center">
          <p className="text-accenttext">Отчёт не найден</p>
          <Button
            onClick={() => router.push('/dashboard')}
            className="mt-4 bg-accenttext hover:bg-accenttext/90 text-white"
          >
            Вернуться к заданиям
          </Button>
        </div>
      </div>
    );
  }

  // Убираем проверку на пустую схему - показываем карточку "Начать заполнение" всегда
  // if (!report.checklist_schema || !report.checklist_schema.sections || report.checklist_schema.sections.length === 0) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-accentgreen">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accenttext mx-auto mb-4"></div>
  //         <p className="text-accenttext">Переход к отчету...</p>
  //       </div>
  //     </div>
  //   );
  // }

  const handleStartFilling = () => {
    router.push(`/reports/${reportId}`);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleBackToFAQ = () => {
    // Переходим на dashboard с параметрами, чтобы показать FAQ и передать ID отчета
    router.push(`/dashboard?showFAQ=true&reportId=${reportId}`);
  };

  return (
    <div className="min-h-screen bg-accentgreen">
      {/* Dashboard Header */}
      <DashboardHeader username={user?.username} onLogout={handleLogout} />

      <div className="max-w-md mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
           <h1 className="text-md md:text-2xl font-bold text-accenttext mb-2">
            Выполните инструкцию по проверке
          </h1>
        </div>

        {/* Hotel Card */}
        <ReportStartCard
          report={report}
          onStartFilling={handleStartFilling}
          onBackToFAQ={handleBackToFAQ}
        />
      </div>
    </div>
  );
}
