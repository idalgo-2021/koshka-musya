"use client"

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { AssignmentsApi } from '@/entities/assignments/api'
import type { Assignment } from '@/entities/assignments/types'
import { Button } from '@/components/ui/button'
import { AssignmentDetailCard } from '@/components/AssignmentDetailCard'
import { StepBackIcon } from 'lucide-react'

export default function AssignmentDetailPage() {
  const params = useParams<{ id: string }>()
  const id = String(params?.id ?? '')
  const router = useRouter()

  const { data, isLoading, isError } = useQuery<Assignment>({
    queryKey: ['assignment_staff', id],
    enabled: Boolean(id),
    queryFn: () => AssignmentsApi.getAssignmentByIdStaff(id),
  })

  return (
    <div className="container max-w-4xl py-6 space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => router.back()}><StepBackIcon/></Button>
         <h1 className="text-md md:text-2xl font-semibold">Предложение для оценки</h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Загрузка...</p>
          </div>
        </div>
      ) : isError || !data ? (
        <div className="text-center py-12">
          <div className="text-destructive text-lg font-medium mb-2">Ошибка загрузки</div>
          <p className="text-muted-foreground">Не удалось загрузить данные о задании</p>
        </div>
      ) : (
        <AssignmentDetailCard assignment={data} />
      )}
    </div>
  )
}

