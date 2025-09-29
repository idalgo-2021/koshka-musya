"use client"

import Link from 'next/link'

export default function MapLink({ longitude, latitude, children }: { longitude: number; latitude: number; children?: React.ReactNode }) {
  const ll = `${encodeURIComponent(String(longitude))}%2C${encodeURIComponent(String(latitude))}`
  const pt = `${encodeURIComponent(String(longitude))},${encodeURIComponent(String(latitude))},pm2rdm`
  const href = `https://yandex.ru/maps/?ll=${ll}&z=16&pt=${pt}`
  return (
    <Link className="text-primary underline underline-offset-4" href={href} target="_blank" rel="noopener noreferrer">
      {children ?? 'View on map'}
    </Link>
  )
}


