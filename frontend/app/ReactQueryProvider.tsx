'use client'
import {QueryClientProvider} from '@tanstack/react-query'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {getQueryClient} from './react-query';
import type * as React from 'react'
import {Suspense} from "react";

export default function Providers({children}: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <Suspense>
        {children}
      </Suspense>
      {/*<ReactQueryDevtools />*/}
    </QueryClientProvider>
  )
}
