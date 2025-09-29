import type { ChecklistSchema } from '@/entities/reports/types';

/**
 * Рассчитывает процент заполнения отчета на основе checklist_schema
 * Логика должна точно соответствовать calculateProgress в reports/[id]/page.tsx
 */
export function calculateReportProgress(checklistSchema?: ChecklistSchema): number {
  if (!checklistSchema) return 0;

  let totalItems = 0;
  let completedItems = 0;

  checklistSchema.sections.forEach(section => {
    section.items?.forEach(item => {
      totalItems++;

      // Проверяем заполненность в зависимости от типа ответа
      let isItemCompleted = false;

      if (item.answer_types.slug === 'boolean') {
        isItemCompleted = item.answer?.result !== undefined && item.answer.result !== '';
      } else if (item.answer_types.slug.startsWith('rating_')) {
        isItemCompleted = item.answer?.result !== undefined && item.answer.result !== '' && parseInt(item.answer.result) > 0;
      } else if (item.answer_types.slug === 'text') {
        isItemCompleted = !!(item.answer?.result && item.answer.result.trim().length > 0);
      }

      // Проверяем медиа требования - если медиа обязательны, то пункт не заполнен без них
      if (isItemCompleted && item.media_requirement === 'required' && item.media_max_files) {
        const mediaCount = item.answer?.media?.length || 0;
        isItemCompleted = mediaCount >= item.media_max_files;
      }

      if (isItemCompleted) {
        completedItems++;
      }
    });
  });

  return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
}
