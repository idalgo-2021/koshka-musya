"use client"

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { AssignmentsApi } from '@/entities/assignments/api'
import type { Assignment } from '@/entities/assignments/types'
import { Input } from '@/components/ui/input'
import {Button} from "@/components/ui/button";
import Select from '@/components/ui/select'
import SelectRowMulti from '@/components/ui/select-row-multi'
import { ToggleButton } from '@/components/ToggleButton'
import { useResponsiveToggle } from '@/hooks/useResponsiveToggle'
import AssignmentCard from '@/components/AssignmentCard'
import { AssignmentTable } from '@/components/AssignmentTable'
import {ChevronFirstIcon, ChevronLastIcon, ChevronLeft, ChevronRight, Eye, Loader} from 'lucide-react'
import {assignmentStatusOptions} from "@/entities/assignments/const";
import { ListingsApi } from '@/entities/listings/api'


export default function AssignmentsStaffPage() {
  const [page, setPage] = React.useState(1)
  const [limit] = React.useState(50)
  const [reporterId, setReporterId] = React.useState('')
  const [statusIds, setStatusIds] = React.useState<string>('')
  const [listingTypesIds, setListingTypesIds] = React.useState<(string | number)[]>([])
  const [isShow, setIsShow] = useResponsiveToggle(false, 'assignments-view-mode') // false = card view, true = table view

  // Fetch listing types for filter
  const { data: listingTypesData } = useQuery({
    queryKey: ['listing_types'],
    queryFn: () => ListingsApi.getListingTypes(),
  })

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['assignments_staff', page, limit, reporterId, statusIds, listingTypesIds],
    queryFn: async () => {
      const statusId = statusIds ? Number(statusIds) : undefined
      // Filter out 'all' and convert to numbers, or use undefined if 'all' is selected or no types selected
      const listingTypesIdsNumbers = listingTypesIds.length > 0 && !listingTypesIds.includes('all')
        ? listingTypesIds.filter(id => id !== 'all').map(id => Number(id))
        : undefined
      return AssignmentsApi.getAllAssignmentsStaff({
        page,
        limit,
        reporter_id: reporterId || undefined,
        status_id: statusId ? [statusId] : undefined,
        listing_types_ids: listingTypesIdsNumbers
      })
    },
  })

  const assignments = data?.assignments ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const canPrev = page > 1
  const canNext = page < totalPages

  return (
    <div className="container max-w-6xl py-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-md md:text-2xl font-semibold">Предложения на оценку</h1>
        <div className="flex items-center gap-3">
          <ToggleButton checked={isShow} onToggle={setIsShow} />
          {/*{user?.role === USER_ROLE.Admin  && (*/}
          {/*  <Button asChild>*/}
          {/*    <Link href="/admin/assignments/new">*/}
          {/*      <Plus className="w-4 h-4 mr-2" />*/}
          {/*       Предложение*/}
          {/*    </Link>*/}
          {/*  </Button>*/}
          {/*)}*/}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Reporter ID (uuid)</div>
          <Input value={reporterId} onChange={(e) => setReporterId(e.target.value)} placeholder="optional" />
        </div>
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Статус</div>
          <Select
            value={statusIds}
            onChange={(value) => setStatusIds(value ? String(value) : '')}
            placeholder="Все"
            options={[
              { value: '', label: 'Все' },
              ...assignmentStatusOptions.map((status) => ({
                value: status.id.toString(),
                label: status.name
              }))
            ]}
          />
        </div>
      </div>

      <div className="space-y-1">
        {/* <div className="text-sm text-muted-foreground">Типы объектов</div> */}
        <SelectRowMulti
          value={listingTypesIds}
          onChange={setListingTypesIds}
          options={[
            { value: 'all', label: 'Все' },
            ...(listingTypesData?.listing_types?.map((type) => ({
              value: type.id,
              label: type.name
            })) || [])
          ]}
          placeholder="Выберите типы объектов"
        />
      </div>

      {isLoading || isFetching ? (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader className="w-4 h-4 animate-spin"/>
            <span>Loading...</span>
          </div>
        </div>
      ) : isError ? (
        <div className="text-destructive">Failed to load</div>
      ) : (
        <>
        {isShow ? (
          // Table View
          <AssignmentTable assignments={assignments} />
        ) : (
            // Card View - Google Search Results Style
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignments.map((assignment: Assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
              {assignments.length === 0 && (
                <div className="col-span-full text-center py-8 text-sm text-muted-foreground">
                  No assignments found.
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Pagination Navigation */}
      {!isLoading && !isError && assignments.length > 0 && (
        <div className="flex items-center justify-between gap-3 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(1)}
              disabled={!canPrev}
            >
              <ChevronFirstIcon />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={!canPrev}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Назад
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Старинца {page}/{totalPages}
            </span>
            <span className="text-sm text-muted-foreground">
              ({total} Всего
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={!canNext}
            >
              Вперед
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(totalPages)}
              disabled={!canNext}
            >
              <ChevronLastIcon />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}


