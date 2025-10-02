export const reportStatusOptions = [
  { id: '', slug: 'all', name: 'Все' },
  { id: 1, slug: 'generating', name: 'Генерация' },
  { id: 2, slug: 'draft', name: 'Черновик' },
  { id: 3, slug: 'submitted', name: 'Сдан на проверку' },
  { id: 4, slug: 'approved', name: 'Одобрен' },
  { id: 5, slug: 'rejected', name: 'Отклонен' },
  { id: 6, slug: 'failed_generation', name: 'Ошибка генерации' }
]


export const isValidReportId = (reporterId: string) => {
  return (reporterId &&
    reporterId !== null &&
    reporterId !== undefined &&
    reporterId !== '00000000-0000-0000-0000-000000000000');
}
