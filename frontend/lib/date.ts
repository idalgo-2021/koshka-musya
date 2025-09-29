export function formatDate(date: string) {
  return new Date(date).toLocaleString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}


export const toDate = (date: string) => {
  return new Date(`${date}T00:00:00`).toISOString()
}
