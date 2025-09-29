declare module '@pbe/react-yandex-maps' {
  import * as React from 'react'
  export interface YMapsProps { query?: Record<string, string | undefined> }
  export const YMaps: React.FC<React.PropsWithChildren<YMapsProps>>
  export interface MapProps {
    defaultState?: { center: [number, number]; zoom: number }
    state?: { center: [number, number]; zoom: number }
    width?: number | string
    height?: number | string
    onClick?: (e: any) => void
  }
  export const Map: React.FC<React.PropsWithChildren<MapProps>>
  export interface PlacemarkProps { geometry: [number, number] }
  export const Placemark: React.FC<PlacemarkProps>
  export const SearchControl: React.FC
}


