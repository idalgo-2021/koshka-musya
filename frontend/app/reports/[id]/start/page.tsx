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

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await ReportsApi.getMyReportById(reportId);
        if (!mounted) return;
        setReport(r);
      } catch {
        toast.error('Не удалось загрузить отчет');
        router.push('/dashboard');
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
