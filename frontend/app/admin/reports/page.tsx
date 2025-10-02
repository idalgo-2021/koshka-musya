"use client"

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { ReportsApi } from '@/entities/reports/api'
import type { Report } from '@/entities/reports/types'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import SelectRow from '@/components/ui/select-row'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ToggleButton } from '@/components/ToggleButton'
import { useResponsiveToggle } from '@/hooks/useResponsiveToggle'
import HotelImage from "@/components/HotelImage";
import {reportStatusOptions} from "@/entities/reports/const";
import {ChevronLeftIcon, ChevronRightIcon, Eye} from "lucide-react";
import {formatDate} from "@/lib/date";
import { ReportStatusBadge } from '@/components/ReportStatusBadge';

const isValidReportId = (reporterId: string) => {
  return (reporterId &&
    reporterId !== null &&
    reporterId !== undefined &&
    reporterId !== '00000000-0000-0000-0000-000000000000');
}

export default function ReportsStaffPage() {
  const [page, setPage] = React.useState(1)
  const [limit] = React.useState(50)
  const [statusId, setStatusId] = React.useState<string>('')
  const [isShow, setIsShow] = useResponsiveToggle(false, 'reports-view-mode');

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['reports_staff', page, limit, statusId],
    queryFn: () => {
      const statusIdNum = statusId ? Number(statusId) : undefined
      return ReportsApi.getAllReports(page, limit, statusIdNum)
    },
  })

  const qc = useQueryClient()
  const approveMutation = useMutation({
    mutationFn: (id: string) => ReportsApi.approve(id),
    onSuccess: () => {
      toast.success('Report approved')
      qc.invalidateQueries({ queryKey: ['reports_staff'] })
    },
    onError: (e: unknown) => {
      toast.error('Failed to approve report')
      console.error(e)
    }
  })

  const rejectMutation = useMutation({
    mutationFn: (id: string) => ReportsApi.reject(id),
    onSuccess: () => {
      toast.success('Report rejected')
      qc.invalidateQueries({ queryKey: ['reports_staff'] })
    },
    onError: (e: unknown) => {
      toast.error('Failed to reject report')
      console.error(e)
    }
  })

  const reports = data?.reports ?? []

  // const reports: Report[] = [
  //   {...report, id: "1", listing: {...report.listing, main_picture: undefined}, status: {...report.status, slug: "submitted"}},
  //   {...report, id: "2", status: {...report.status, slug: "draft"}},
  //   {...report, id: "3", status: {...report.status, slug: "rejected"}},
  //   {...report, id: "4", status: {...report.status, slug: "approved"}},
  // ]
  const total = data?.total ?? 0

  const canPrev = page > 1
  const canNext = reports.length === limit || (total ? page * limit < total : true)




  return (
    <div className="container max-w-8xl py-6 space-y-4">
      <div className="flex items-center justify-between">
         <h1 className="text-md md:text-2xl font-semibold">Отчеты</h1>
        <div className="flex items-center gap-2">
          {/* <div className="hidden md:block text-sm text-muted-foreground">Page</div> */}
          {/* <Input className="w-20" type="number" min={1} value={page} onChange={(e) => setPage(Math.max(1, Number(e.target.value) || 1))} /> */}
          {/* <div className="hidden md:block text-sm text-muted-foreground">Limit</div> */}
          {/* <Input className="w-24" type="number" min={1} value={limit} onChange={(e) => setLimit(Math.max(1, Number(e.target.value) || 1))} /> */}
          <Button variant="outline" disabled={!canPrev} onClick={() => setPage((p) => Math.max(1, p - 1))}><ChevronLeftIcon/></Button>
          <Button variant="outline" disabled={!canNext} onClick={() => setPage((p) => p + 1)}><ChevronRightIcon/></Button>
        </div>
        <ToggleButton checked={isShow} onToggle={setIsShow}/>
      </div>

      <div className="flex items-center gap-3">
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Статус</div>
          <SelectRow
            value={statusId}
            onChange={(value) => setStatusId(value ? String(value) : '')}
            placeholder="Все статусы"
            variant='select'
            options={reportStatusOptions.map((status) => ({
              value: status.id.toString(),
              label: status.name
            }))}
          />
        </div>
      </div>

      {isLoading || isFetching ? (
        <div>Loading...</div>
      ) : isError ? (
        <div className="text-destructive">Failed to load</div>
      ) : (
        <>
        {isShow ? (
          // Table View
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">ID</th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">Задание</th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground hidden sm:table-cell">Автор отчета</th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground hidden md:table-cell">Статус</th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground hidden lg:table-cell">Создан</th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground hidden xl:table-cell">Обновлен</th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground hidden xl:table-cell">Объект</th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">Действия</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r: Report) => (
                  <tr key={r.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-3 align-middle">
                      <Link href={`/admin/reports/${r.id}`} className="font-medium text-xs hover:underline break-all">
                        {r.id}
                      </Link>
                    </td>
                    <td className="p-3 align-middle text-sm">
                      <Link href={`/admin/assignments/${r.assignment_id}`} className="hover:underline">
                        {r.assignment_id}
                      </Link>
                    </td>
                    <td className="p-3 align-middle text-sm hidden sm:table-cell">
                      {isValidReportId(r.reporter?.id) ? (
                        <>
                          <div>{r.reporter?.username}</div>
                        </>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td className="p-3 align-middle hidden lg:table-cell">
                      {r.status && <ReportStatusBadge status={r.status} />}
                    </td>
                    <td className="p-3 align-middle hidden lg:table-cell">
                      <span
                        className="inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 border-gray-200">
                        {r.created_at ? formatDate(r.created_at) : '-'}
                      </span>
                    </td>
                    <td className="p-3 align-middle hidden lg:table-cell ">
                      <span
                        className="inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 border-gray-200">
                        {r.updated_at ? formatDate(r.updated_at) : '-'}
                      </span>
                    </td>

                    <td className="p-3 align-middle text-sm hidden lg:table-cell">
                      {r.listing?.id ? (
                        <Link href={`/admin/listings/${r.listing.id}`} className="hover:underline">
                          {r.listing.title}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">{r.listing?.title || '-'}</span>
                      )}
                    </td>
                    <td className="p-3 align-middle">
                      <div className="flex items-center gap-2">
                        {r.status?.slug === 'submitted' && (
                          <>
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white "
                              disabled={approveMutation.isPending}
                              onClick={() => approveMutation.mutate(r.id)}
                            >
                              {approveMutation.isPending ? 'Обработка…' : 'Принять'}
                            </Button>
                            <Button
                              size="sm"
                              className="bg-red-600 hover:bg-red-700 text-white"
                              disabled={rejectMutation.isPending}
                              onClick={() => rejectMutation.mutate(r.id)}
                            >
                              {rejectMutation.isPending ? 'Обработка…' : 'Принять'}
                            </Button>
                          </>
                        )}
                        <Link href={`/admin/reports/${r.id}`} className="text-sm text-primary hover:underline">
                          <Eye  className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {reports.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">Не найдено отчетов.</div>
            )}
          </div>
        ) : (
          // Card View
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {reports.map((r: Report) => (
              <Card key={r.id} className="py-0 overflow-hidden">
                <CardContent className="p-0">
                  <Link href={`/admin/reports/${r.id}`}>
                    {r.listing?.main_picture ? (
                      <HotelImage
                        width={300}
                        height={300}
                        src={r.listing?.main_picture}
                        alt={r.listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-36 bg-muted"></div>
                    )}
                    <div className="flex flex-col gap-2 p-3">
                      <div className="text-sm text-muted-foreground">Reporter {r.reporter?.username}</div>
                      <div className="text-sm text-muted-foreground">
                        Статус {r.status && <ReportStatusBadge status={r.status} />}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {r.listing?.title}
                      </div>
                      {r.status?.slug === 'submitted' && (
                        <div className="flex items-center justify-start gap-2">
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            disabled={approveMutation.isPending}
                            onClick={(e) => {
                              e.preventDefault()
                              approveMutation.mutate(r.id)
                            }}
                          >
                            {approveMutation.isPending ? 'Обработка…' : 'Принять'}
                          </Button>
                          <Button
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white"
                            disabled={rejectMutation.isPending}
                            onClick={(e) => {
                              e.preventDefault()
                              rejectMutation.mutate(r.id)
                            }}
                          >
                            {rejectMutation.isPending ? 'Обработка…' : 'Отклонить'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))}
            {reports.length === 0 && (
              <div className="col-span-full text-center py-8 text-sm text-muted-foreground">
                Отчеты не найдены
              </div>
            )}
          </div>
        )}
        </>
      )}
    </div>
  )
}


