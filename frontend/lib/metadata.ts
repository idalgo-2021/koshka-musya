import { Metadata } from 'next';

const baseTitle = 'Secret Guest';
const baseDescription = 'Платформа для тайных гостей - проверка качества отелей';


export function createMetadata({
  title,
  description,
  keywords,
}: {
  title?: string;
  description?: string;
  keywords?: string[];
}): Metadata {
  const fullTitle = title ? `${title} | ${baseTitle}` : baseTitle;
  const fullDescription = description || baseDescription;
  const fullKeywords = keywords ? [...keywords, 'koshka musya', 'secret guest', 'mystery shopper', 'hotels', 'apartments', 'quality assessment', 'тайный гость', 'проверка отелей'] : undefined;

  return {
    title: fullTitle,
    description: fullDescription,
    keywords: fullKeywords,
    authors: [{ name: "Koshka Musya Team" }],
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' }
      ],
    },
    openGraph: {
      title: fullTitle,
      description: fullDescription,
      type: "website",
    },
  };
}

// Предустановленные метаданные для разных страниц
export const pageMetadata = {
  dashboard: createMetadata({
    title: 'Панель',
    description: 'Просматривайте доступные задания, принимайте их и отслеживайте прогресс',
    keywords: ['assignments', 'dashboard', 'secret guest', 'koshka musya', 'задания']
  }),
  
  reports: createMetadata({
    title: 'Мои отчеты',
    description: 'Просматривайте и редактируйте ваши отчеты о посещениях отелей',
    keywords: ['отчеты', 'посещения', 'оценки', 'отели', 'качество']
  }),

  admin: createMetadata({
    title: 'Админ-панель',
    description: 'Управление заданиями, отчетами и пользователями в системе',
    keywords: ['admin', 'управление', 'администратор', 'koshka musya']
  }),

  login: createMetadata({
    title: 'Вход в систему',
    description: 'Войдите в систему для работы с заданиями тайного гостя',
    keywords: ['вход', 'авторизация', 'login', 'koshka musya']
  }),

};
