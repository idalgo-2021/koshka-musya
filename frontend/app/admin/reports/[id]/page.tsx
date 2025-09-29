"use client"

import * as React from 'react'
import {useCallback} from 'react'
import {useParams, useRouter} from 'next/navigation'
import Image from 'next/image';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import Link from 'next/link';
import {toast} from 'sonner'
import {StepBackIcon} from "lucide-react";

import HotelImage from "@/components/HotelImage";
import {Card, CardContent} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import ReportHeader from "@/components/ReportHeader";

import type {ChecklistSchema, Report} from '@/entities/reports/types'
import {ReportsApi} from '@/entities/reports/api'
import {formatDate} from "@/lib/date";

export default function ReportStaffDetailPage() {
  const params = useParams<{ id: string }>()
  const id = String(params?.id ?? '')
  const router = useRouter()

  const {data, isLoading, isError} = useQuery<Report>({
    queryKey: ['report_staff', id],
    enabled: Boolean(id),
    queryFn: () => ReportsApi.getById(id),
  })

  const checklistSchema: ChecklistSchema | null = (data?.checklist_schema as unknown as ChecklistSchema) ?? null

  const qc = useQueryClient()
  const approveMutation = useMutation({
    mutationFn: () => ReportsApi.approve(id),
    onSuccess: () => {
      console.log('approved')
      toast.success('Report approved')
      qc.invalidateQueries({queryKey: ['report_staff', id]})
      qc.invalidateQueries({queryKey: ['reports_staff']})
    },
    onError: () => {
      console.log('rejected');
      toast.error('Failed to approve report');
    },
  })

  const rejectMutation = useMutation({
    mutationFn: () => ReportsApi.reject(id),
    onSuccess: () => {
      toast.success('Report rejected')
      qc.invalidateQueries({queryKey: ['report_staff', id]})
      qc.invalidateQueries({queryKey: ['reports_staff']})
    },
    onError: () => toast.error('Failed to reject report'),
  })

  const onAprove = useCallback(async () => {
    try {
      const result = await approveMutation.mutateAsync();
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  }, [approveMutation]);

  return (
    <div className="container max-w-5xl py-6 space-y-4">
      <div
        className="fixed top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b p-3 -mx-3 md:-mx-4 lg:-mx-6">
        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.back()}><StepBackIcon/></Button>
             <h1 className="text-md md:text-2xl font-semibold">Отчет</h1>
          </div>
          <div className="flex items-center gap-2">
            {data?.status?.slug === 'submitted' && (
              <>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={approveMutation.isPending}
                  onClick={onAprove}
                >
                  {approveMutation.isPending ? 'Approving…' : 'Принять'}
                </Button>
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={rejectMutation.isPending}
                  onClick={() => rejectMutation.mutate()}
                >
                  {rejectMutation.isPending ? 'Rejecting…' : 'Отклонить'}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : isError || !data ? (
        <div className="text-destructive">Failed to load</div>
      ) : (
        <div className="space-y-4 mt-7">
          <div className="flex flex-col md:flex-row justify-between">
            <ReportHeader
              assignmentInfo={{
                title: `Статус (${data.status.name})` || '',
                address: data.listing.address || '',
                city: data.listing.city || '',
                country: data.listing.country || '',
                purpose: data.purpose,
              }}
              progress={0}
              checklistSchema={null}
            >
              <span className="block">Создан: {data.created_at}</span>
              {data.updated_at && (
                <span className="block">Обновлено: {formatDate(data.updated_at)}</span>
              )}
              {data.reporter && (
                <span className="block">Автор: {data.reporter?.username}</span>
              )}
            </ReportHeader>

            {data.listing && (
              <Link href={`/admin/listings/${data.listing.id}`}>
                <ListingCard
                  report={data}
                />
              </Link>
            )}
          </div>

          {/* Checklist (read-only reuse) */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <h2 className="text-lg font-semibold">Checklist</h2>
              {!checklistSchema ? (
                <div>Empty checklist</div>
              ) : (
                <div className="space-y-4">
                  {checklistSchema.sections.map((sec) => (
                    <details key={String(sec.id)} className="space-y-2" open>
                      <summary className="font-semibold cursor-pointer list-none">{sec.title}</summary>
                      {sec.items.map((it) => (
                        <div key={String(it.id)} className="rounded-md border p-3 space-y-1">
                          <div className="font-medium">{it.title}</div>
                          <div className="text-sm text-muted-foreground">Answer Type: {it.answer_types?.name}</div>
                          {it.answer?.result && (
                            <div className="text-sm"><span
                              className="text-muted-foreground">Result:</span> {it.answer.result}</div>
                          )}
                          {it.answer?.comment && (
                            <div className="text-sm"><span
                              className="text-muted-foreground">Comment:</span> {it.answer.comment}</div>
                          )}
                          {it.answer?.media && it.answer.media.length > 0 && (
                            <div className="text-sm space-y-1">
                              <div className="text-muted-foreground">Media:</div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {it.answer.media.map(m => (
                                  <a key={m.id} href={m.url} target="_blank" rel="noreferrer" className="block">
                                    <Image
                                      src={m.url}
                                      width={300} height={300}
                                      alt="media"
                                      className="w-full h-auto rounded-md border object-cover"/>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </details>
                  ))}
                  {/*{checklistSchema.sections.map((section, index: number) => {*/}
                  {/*  const isExpanded = true;*/}
                  {/*  const sectionProgress =0;*/}

                  {/*  return (*/}
                  {/*    <ChecklistSection*/}
                  {/*      key={String(section.id)}*/}
                  {/*      section={section}*/}
                  {/*      index={index}*/}
                  {/*      isExpanded={isExpanded}*/}
                  {/*      sectionProgress={sectionProgress}*/}
                  {/*      checks={{}}*/}
                  {/*      ratings={{}}*/}
                  {/*      comments={{}}*/}
                  {/*      itemMedia={{}}*/}
                  {/*      disabled={true}*/}
                  {/*      onToggleSection={noop}*/}
                  {/*      onCheckChange={noop}*/}
                  {/*      onRatingChange={noop}*/}
                  {/*      onCommentChange={noop}*/}
                  {/*      onMediaChange={noop}*/}
                  {/*      uploadProgress={noop}*/}
                  {/*      onUploadProgressChange={noop}*/}
                  {/*    />*/}
                  {/*  );*/}
                  {/*})}*/}
                </div>

              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function ListingCard({
                       report,
                     }: {
  report: Report;
}) {
  return (
    <div
      className="bg-white rounded-3xl border-0 overflow-hidden transition-all duration-300 hover:scale-[1.02] group">
      <div className="relative">
        {/* Hotel Image with Overlay */}
        <div className="h-48 relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          {report.listing?.main_picture && (
            <HotelImage
              width={300}
              height={300}
              src={report.listing?.main_picture}
              alt={report.listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

          {/* Hotel name overlay on image */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h3 className="text-lg font-bold text-white mb-1 drop-shadow-2xl shadow-black/50">
              {report.listing.title}
            </h3>
            <p className="text-white text-sm leading-relaxed drop-shadow-xl shadow-black/50 font-medium">
              {report.listing.description}
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-4">
          {/* Task Details */}
          <div className="space-y-3">
            {/* Purpose */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"/>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 mb-1">Цель проверки</p>
                <p className="text-sm text-gray-600 leading-relaxed">{report.purpose}</p>
              </div>
            </div>

            {/* Expiry Date */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"/>
                </svg>
              </div>
              {report.updated_at && (
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-1">Обновлено</p>
                  <p className="text-sm text-gray-600">
                    До {formatDate(report.updated_at)}
                  </p>
                </div>
              )}
            </div>

            {/* Address */}
            {(report.listing.address) && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-1">Адрес</p>
                  <div className="space-y-1">
                    {report.listing?.address && (
                      <p className="text-sm text-gray-600">{report.listing?.address}</p>
                    )}
                    {(report.listing?.city || report.listing?.country) && (
                      <p className="text-sm text-gray-500">
                        {report.listing?.city}
                        {report.listing?.city && report.listing?.country ? ", " : ""}
                        {report.listing?.country}
                      </p>
                    )}
                    {(report.listing?.latitude !== undefined && report.listing?.longitude !== undefined) && (
                      <button
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(`https://yandex.ru/maps/?pt=${report.listing?.longitude},${report.listing?.latitude}&z=16&l=map`, '_blank');
                        }}
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd"
                                d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z"
                                clipRule="evenodd"/>
                        </svg>
                        Показать на карте
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
