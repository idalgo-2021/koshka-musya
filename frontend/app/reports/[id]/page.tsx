"use client";
import * as React from 'react';
import {redirect, useParams, useRouter} from 'next/navigation';
import {toast} from 'sonner';
import {useMutation} from "@tanstack/react-query";

import {useAuth, USER_ROLE} from '@/entities/auth/useAuth';
import {ReportsApi} from '@/entities/reports/api';
import type {ChecklistSchema, Report} from '@/entities/reports/types';
import { useConfirmation } from '@/entities/modals/ModalContext';

import DashboardHeader from '@/components/DashboardHeader';
import ReportHeader from '@/components/ReportHeader';
import ErrorState from '@/components/ErrorState';
import ChecklistContainer from '@/components/ChecklistContainer';
import ReportActions from '@/components/ReportActions';
import UploadProgressIndicator from '@/components/UploadProgressIndicator';

// Функция для парсинга meta данных answer_types
const parseAnswerTypeMeta = (meta: unknown): { min: number; max: number } => {
  try {
    const parsed = typeof meta === 'string' ? JSON.parse(meta) : meta;
    return {
      min: parsed?.min || 1,
      max: parsed?.max || 5
    };
  } catch (e) {
    console.warn('Failed to parse answer_types meta:', e);
    return { min: 1, max: 5 };
  }
};


function parseCommentValue(it: any,  resultValue: string | undefined, comment: string) {
  // Комментарии нужны не  для всех типов
  const isBool = it.answer_types.slug === 'boolean';
  return isBool && resultValue === 'false' ? comment : undefined;
}

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = String(params?.id ?? '');
  const { user, logout } = useAuth();
  const { confirm, closeModal } = useConfirmation();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [report, setReport] = React.useState<Report | null>(null);
  const [assignmentInfo, setAssignmentInfo] = React.useState<{title: string; address: string; city: string; country: string; purpose?: string} | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [checks, setChecks] = React.useState<Record<string, boolean | undefined>>({});
  const [ratings, setRatings] = React.useState<Record<string, number>>({});
  const [comments, setComments] = React.useState<Record<string, string>>({});
  // Медиа теперь храним по itemKey: { [itemKey]: Array<{name,url,media_type}> }
  const [itemMedia, setItemMedia] = React.useState<Record<string, Array<{ name: string; url: string; media_type: string }>>>({});
  const [checklistSchema, setChecklistSchema] = React.useState<ChecklistSchema | null>(null);
  const [submitted, setSubmitted] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState<Record<string, number>>({});
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [expandedSections, setExpandedSections] = React.useState<Set<number>>(new Set());
  const [currentStep, setCurrentStep] = React.useState(0);

  // Функция для расчета прогресса заполнения
  const calculateProgress = React.useCallback(() => {
    if (!checklistSchema) return 0;

    let totalItems = 0;
    let completedItems = 0;

    checklistSchema.sections.forEach(section => {
      section.items?.forEach(item => {
        totalItems++;
        const key = `item_${item.id}`;

        // Проверяем заполненность в зависимости от типа ответа
        let isItemCompleted = false;

        if (item.answer_types.slug === 'boolean') {
          isItemCompleted = checks[key] !== undefined;
        } else if (item.answer_types.slug.startsWith('rating_')) {
          isItemCompleted = ratings[key] !== undefined && ratings[key] > 0;
        } else if (item.answer_types.slug === 'text') {
          isItemCompleted = !!(comments[key] && comments[key].trim().length > 0);
        }

        // Проверяем медиа требования - если медиа обязательны, то пункт не заполнен без них
        if (isItemCompleted && item.media_requirement === 'required' && item.media_max_files) {
          const mediaCount = itemMedia[key]?.length || 0;
          isItemCompleted = mediaCount >= item.media_max_files;
        }

        if (isItemCompleted) {
          completedItems++;
        }
      });
    });

    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  }, [checklistSchema, checks, ratings, comments, itemMedia]);

  // Обновляем прогресс при изменении данных
  React.useEffect(() => {
    setProgress(calculateProgress());
  }, [calculateProgress]);

  // Функции для управления раскрытием секций
  const toggleSection = (sectionId: number) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const expandAllSections = () => {
    if (!checklistSchema) return;
    const allSectionIds = new Set(checklistSchema.sections.map((s: { id: number }) => s.id));
    setExpandedSections(allSectionIds);
  };

  const collapseAllSections = () => {
    setExpandedSections(new Set());
  };

  // Step navigation functions
  const goToNextStep = () => {
    if (checklistSchema && currentStep < checklistSchema.sections.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    if (checklistSchema && stepIndex >= 0 && stepIndex < checklistSchema.sections.length) {
      setCurrentStep(stepIndex);
    }
  };

  // Функции для управления состоянием чеклиста
  const handleCheckChange = (key: string, value: boolean) => {
    setChecks(prev => ({ ...prev, [key]: value }));
  };

  const handleRatingChange = (key: string, value: number) => {
    setRatings(prev => ({ ...prev, [key]: value }));
  };

  const handleCommentChange = (key: string, value: string) => {
    setComments(prev => ({ ...prev, [key]: value }));
  };

  const handleMediaChange = (key: string, media: Array<{ name: string; url: string; media_type: string }>) => {
    setItemMedia(prev => ({ ...prev, [key]: media }));
  };

  const handleUploadProgressChange = (progress: Record<string, number>) => {
    setUploadProgress(progress);
  };

  // Функция для расчета прогресса секции
  const calculateSectionProgress = (sectionId: number): number => {
    if (!checklistSchema) return 0;

    const section = checklistSchema.sections.find(s => s.id === sectionId);
    if (!section) return 0;

    if (!section?.items?.length) return 0;

    let completedItems = 0;
    const totalItems = section.items.length;

    section.items?.forEach(item => {
      const key = `item_${item.id}`;
      let itemCompleted = false;

      // Проверяем заполненность в зависимости от типа ответа
      if (item.answer_types.slug === 'boolean') {
        itemCompleted = checks[key] === true || checks[key] === false;
      } else if (item.answer_types.slug.startsWith('rating_')) {
        // Проверяем рейтинг с учетом meta данных
        const { min } = parseAnswerTypeMeta(item.answer_types.meta);
        itemCompleted = ratings[key] !== undefined && ratings[key] >= min;
      } else if (item.answer_types.slug === 'text') {
        itemCompleted = !!(comments[key] && comments[key].trim().length > 0);
      }

      // Проверяем медиа требования
      if (item.media_requirement === 'required' && item.media_max_files) {
        const mediaCount = itemMedia[key]?.length || 0;
        itemCompleted = itemCompleted && mediaCount >= item.media_max_files;
      }

      if (itemCompleted) completedItems++;
    });

    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  };

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await ReportsApi.getMyReportById(reportId);
        if (!mounted) return;

        setReport(r);
        // Сохраняем информацию о задании отдельно
        if (r.listing) {
          setAssignmentInfo({
            title: r.listing.title,
            address: r.listing.address,
            city: r.listing.city,
            country: r.listing.country,
            purpose: r.purpose
          });
        }
        setError(null);

        // Загружаем существующие данные чек-листа
        if (r.checklist_schema && Object.keys(r.checklist_schema).length > 0) {
          setChecklistSchema(r.checklist_schema);

          // Восстанавливаем состояние из схемы
          const restoredChecks: Record<string, boolean | undefined> = {};
          const restoredRatings: Record<string, number> = {};
          const restoredComments: Record<string, string> = {};
          const restoredMedia: Record<string, Array<{ name: string; url: string; media_type: string }>> = {};

          r.checklist_schema.sections.forEach(section => {
            section.items?.forEach(item => {
              const key = `item_${item.id}`;
              if (item.answer?.result) {
                if (item.answer_types.slug === 'boolean') {
                  const ok = item.answer.result === 'true';
                  restoredComments[key] = !ok ? (item.answer.comment || '') : '';
                  restoredChecks[key] = ok;
                } else if (item.answer_types.slug.startsWith('rating_')) {
                  restoredRatings[key] = parseInt(item.answer.result);
                } else if (item.answer_types.slug === 'text') {
                  // Для текстового типа result - это основной ответ
                  restoredComments[key] = item.answer.result;
                }
              }
              // Комментарии не восстанавливаются для всех типов
              if (item.answer?.media && item.answer.media.length > 0) {
                restoredMedia[key] = item.answer.media.map(m => ({
                  name: `media_${m.id}`,
                  url: m.url,
                  media_type: m.media_type
                }));
              }
            });
          });

          setChecks(restoredChecks);
          setRatings(restoredRatings);
          setComments(restoredComments);
          setItemMedia(restoredMedia);
        } else {
          // Если схема еще не сгенерирована, ждем и перезагружаем
          console.log('Checklist schema not ready, waiting...');
          setTimeout(() => {
            if (mounted) {
              // Перезагружаем отчет через 2 секунды
              ReportsApi.getMyReportById(reportId).then((updatedReport) => {
                if (mounted && updatedReport.checklist_schema && Object.keys(updatedReport.checklist_schema).length > 0) {
                  setChecklistSchema(updatedReport.checklist_schema);
                }
              }).catch((err) => {
                console.error('Error reloading report:', err);
                setError('Не удалось загрузить чек-лист');
              });
            }
          }, 2000);
        }
      } catch (err) {
        console.error('Error loading report:', err);
        setError('Не удалось загрузить отчет');
        toast.error('Не удалось загрузить отчет');
        // Не перенаправляем сразу, даем пользователю возможность повторить
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [reportId, router]);

// Debounce autosave
  React.useEffect(() => {
    if (loading || !checklistSchema) return;

    const handle = setTimeout(async () => {
      try {
        setSaving(true);

        // Обновляем схему с ответами пользователя (не генерируем новую)
        const updatedSchema = {
          ...checklistSchema,
          sections: checklistSchema.sections.map((sec) => ({
            ...sec,
            items: sec.items.map((it) => {
              const key = `item_${it.id}`;
              const resultValue = getItemValueById(it, key)
              const commentValue = parseCommentValue(it, resultValue, comments[key]);

              return {
                ...it,
                answer: {
                  result: resultValue,
                  comment: commentValue,
                  media: (itemMedia[key] || []).map((m) => ({ id: crypto.randomUUID(), url: m.url, media_type: m.media_type })),
                },
              };
            }),
          }))
        };

        const payload = {
          checklist_schema: updatedSchema
        };

        const updated = await ReportsApi.saveDraft(reportId, payload);
        // Обновляем отчет, но сохраняем информацию о задании отдельно
        setReport(updated);
        setError(null);
      } catch (err) {
        console.error('Error saving draft:', err);
        setError('Не удалось сохранить черновик');
        toast.error('Не удалось сохранить черновик');
      } finally {
        setSaving(false);
      }
    }, 1000); // Увеличиваем задержку для лучшей производительности

    return () => clearTimeout(handle);
  }, [checks, ratings, comments, itemMedia, checklistSchema, loading, reportId]);

  const handleLogout = () => {
    logout();
    toast.success("Вы вышли из системы");
    router.push('/');
  };

  // сервис плох
  const handleRetry = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await ReportsApi.getMyReportById(reportId);
      setReport(r);
      // Сохраняем информацию о задании отдельно
      if (r.listing) {
        setAssignmentInfo({
          title: r.listing.title,
          address: r.listing.address,
          city: r.listing.city,
          country: r.listing.country,
          purpose: r.purpose
        });
      }

      if (r.checklist_schema && Object.keys(r.checklist_schema).length > 0) {
        setChecklistSchema(r.checklist_schema);
      }
    } catch (err) {
      console.error('Error retrying:', err);
      setError('Не удалось загрузить отчет');
    } finally {
      setLoading(false);
    }
  };

  const refuseReportMutation = useMutation({
    mutationFn: async (reportId: string) => {
      return await ReportsApi.rejectReportByUser(reportId);
    },
    onError: (error) => {
      console.log(error);
      toast.error(error instanceof Error ? error.message : 'Не удалось отказаться от отчета');
      closeModal();
    },
    onSuccess: () => {
      console.log('success refuse report');
      toast.success('Успешно отказались от отчета');
      router.push('/dashboard');
    }
  });

  const handleRefuseReport = async (reportId: string | undefined) => {
    if (!reportId) {
      toast.error('Ошибка при поиске отчета');
      return;
    }
    // if (refuseReportMutation.isPending) {
    //   return;
    // }
    try {
      await refuseReportMutation.mutateAsync (reportId);
    } catch (error) {
      console.error('Error rejecting report:', error);
      toast.error('Ошибка при отклонении отчета');
    }
  }

  const handleComplete = async () => {
    try {
      await ReportsApi.submit(reportId);
      toast.success('Отчёт завершён и отправлен');
      setSubmitted(true);
      router.push('/dashboard');
    } catch (err) {
      console.error('Error completing report:', err);
      toast.error('Не удалось завершить отчёт');
    }
  };
  function getItemValueById(item: any , key: string) {
    if (item.answer_types.slug === 'boolean') {
      return checks[key] !== undefined ? String(checks[key]) : undefined;
    } else if (item.answer_types.slug.startsWith('rating_')) {
      return ratings[key] !== undefined ? String(ratings[key]) : undefined;
    } else if (item.answer_types.slug === 'text') {
      return comments[key] || undefined;
    }
    return undefined;
  }

  const handleSave = async () => {
    try {
      setSaving(true);

      // Сборка checklist_schema
      if (!checklistSchema) {
        toast.error('Чек-лист не загружен');
        return;
      }

      // Обновляем схему с ответами пользователя (не генерируем новую)
      const updatedSchema = {
        ...checklistSchema,
        sections: checklistSchema.sections.map((sec) => ({
          ...sec,
          items: sec.items.map((it) => {
            const key = `item_${it.id}`;
            const resultValue = getItemValueById(it, key)
            const commentValue = parseCommentValue(it, resultValue, comments[key]);

            return {
              ...it,
              answer: {
                result: resultValue,
                comment: commentValue,
                media: (itemMedia[key] || []).map((m) => ({ id: crypto.randomUUID(), url: m.url, media_type: m.media_type })),
              },
            };
          }),
        }))
      };

      const payload = {
        checklist_schema: updatedSchema
      };

      await ReportsApi.saveDraft(reportId, payload);
      toast.success('Отчёт сохранён');

      // Перенаправляем на дашборд после успешного сохранения
      router.push('/dashboard');
    } catch (err) {
      console.error('Error saving report:', err);
      toast.error('Не удалось сохранить отчёт');
    } finally {
      setSaving(false);
    }
  };

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
  if (user?.role === USER_ROLE.Admin || user?.role === USER_ROLE.Staff) {
    return redirect('/admin')
  }
  const disabled = submitted;

  return (
    <div className="min-h-screen bg-accentgreen">
      {/* Header */}
      <DashboardHeader username={user?.username} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Assignment Info with Progress */}
          <ReportHeader
            assignmentInfo={assignmentInfo}
            progress={progress}
            checklistSchema={checklistSchema}
          />

        {/* Error State */}
          <ErrorState error={error} onRetry={handleRetry} />

        {/* Checklist */}
          <ChecklistContainer
            checklistSchema={checklistSchema}
            expandedSections={expandedSections}
            checks={checks}
            ratings={ratings}
            comments={comments}
            itemMedia={itemMedia}
            disabled={disabled}
            currentStep={currentStep}
            onToggleSection={toggleSection}
            onExpandAllSections={expandAllSections}
            onCollapseAllSections={collapseAllSections}
            onCheckChange={handleCheckChange}
            onRatingChange={handleRatingChange}
            onCommentChange={handleCommentChange}
            onMediaChange={handleMediaChange}
            uploadProgress={uploadProgress}
            onUploadProgressChange={handleUploadProgressChange}
            calculateSectionProgress={calculateSectionProgress}
            onNextStep={goToNextStep}
            onPreviousStep={goToPreviousStep}
            onGoToStep={goToStep}
          />

        {/* Action Buttons */}
          <ReportActions
            disabled={disabled}
            saving={saving}
            progress={progress}
            isPendingRefuse={refuseReportMutation.isPending}
            onRefuse={() => {
              confirm(
                'Отказ от отчета',
                'Вы действительно хотите отказать от заполнения отчета?',
                () => handleRefuseReport(reportId),
                {
                  type: 'warning',
                  confirmText: 'Отказаться',
                  cancelText: 'Отмена'
                }
              );
            }}
            onSave={handleSave}
            onComplete={handleComplete}
          />

          {/* Upload Progress Indicator */}
          <UploadProgressIndicator uploadProgress={uploadProgress} />
      </div>
      </main>
    </div>
  );
}
