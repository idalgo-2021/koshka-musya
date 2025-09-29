"use client"

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { AnswerTypesApi } from '@/entities/answerTypes/api'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'
import {StepBackIcon} from "lucide-react";

const JsonEditor = dynamic(() => import('json-edit-react').then(m => m.JsonEditor), { ssr: false })

export default function ViewAnswerTypePage() {
  const params = useParams<{ id: string }>()
  const id = Number(params?.id)
  const router = useRouter()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['answer_type', id],
    enabled: Number.isFinite(id),
    queryFn: () => AnswerTypesApi.getById(id),
  })

  return (
    <div className="container max-w-3xl py-4">
      <div className="mb-4 flex items-center gap-3">
         <Button variant="outline" onClick={() => router.back()}><StepBackIcon/></Button>
         <h1 className="text-md md:text-2xl font-semibold">Answer Type</h1>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : isError || !data ? (
        <div className="text-destructive">Failed to load</div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <div className="text-sm text-muted-foreground">Name</div>
              <div className="text-base font-medium break-all">{data.name}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Slug</div>
              <div className="text-base font-medium break-all">{data.slug}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Meta</div>
            <React.Suspense fallback={<div className="text-sm text-muted-foreground">Loading editor…</div>}>
            <div className="rounded-md border p-1 pointer-events-none">
                <JsonEditor
                  data={data.meta ?? {}}
                  setData={() => { /* view-only; no-op */ }}
                  rootName="meta"
                />
              </div>
            </React.Suspense>
          </div>
        </div>
      )}
    </div>
  )
}


