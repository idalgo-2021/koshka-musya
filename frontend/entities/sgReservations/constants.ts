import { SgReservationStatus } from './types'

export const SG_RESERVATION_STATUSES: SgReservationStatus[] = [
  { id: 1, slug: 'new', name: 'Новое' },
  { id: 2, slug: 'hold', name: 'Захолдировано' },
  { id: 3, slug: 'booked', name: 'Забронировано' },
  { id: 4, slug: 'no-show', name: 'Не обрабатывать' }
]

export const STATUS_COLORS = {
  'new': 'bg-blue-100 text-blue-800',
  'hold': 'bg-yellow-100 text-yellow-800',
  'booked': 'bg-green-100 text-green-800',
  'no-show': 'bg-red-100 text-red-800'
} as const

export const STATUS_ICONS = {
  'new': '🆕',
  'hold': '⏸️',
  'booked': '✅',
  'no-show': '❌'
} as const
