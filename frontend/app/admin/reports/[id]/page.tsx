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
import {Button} from '@/components/ui/button'
import ReportHeader from "@/components/ReportHeader";
import { useImageViewer } from '@/hooks/useImageViewer';

import type {ChecklistSchema, Report} from '@/entities/reports/types'
import {ReportsApi} from '@/entities/reports/api'
import {formatDate} from "@/lib/date";

export default function ReportStaffDetailPage() {
  const params = useParams<{ id: string }>()
  const id = String(params?.id ?? '')
  const router = useRouter()
  const { openImages } = useImageViewer()

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
      toast.success('Report approved')
      qc.invalidateQueries({queryKey: ['report_staff', id]})
      qc.invalidateQueries({queryKey: ['reports_staff']})
    },
    onError: () => {
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
    } catch (error) {
      // Error handling is done by the mutation
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
                  {approveMutation.isPending ? 'Обработка…' : 'Принять'}
                </Button>
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={rejectMutation.isPending}
                  onClick={() => rejectMutation.mutate()}
                >
                  {rejectMutation.isPending ? 'Обработка…' : 'Отклонить'}
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
              report={data}
              assignmentInfo={{
                title: data.listing.title || 'Отчет о проверке',
                address: data.listing.address || '',
                city: data.listing.city || '',
                country: data.listing.country || '',
                purpose: data.purpose,
              }}
              progress={0}
              checklistSchema={null}
            />

            {data.listing && (
              <Link href={`/admin/listings/${data.listing.id}`}>
                <ListingCard
                  report={data}
                />
              </Link>
            )}
          </div>

          {/* Checklist (read-only reuse) */}
          <div className="overflow-hidden border-0 shadow-none py-0 my-0">
            {/* <CardContent className="p-0 px-0 py-0 my-0 mx-0"> */}
              {/* Checklist Header */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Ответы</h2>
                    <p className="text-sm text-gray-600">Детали проверки и ответы</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
              {!checklistSchema ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Checklist пуст</h3>
                  <p className="text-gray-600">Нет данных для отображения</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {checklistSchema.sections.map((sec) => (
                    <div key={String(sec.id)} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      {/* Section Header */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">{sec.title}</h3>
                        </div>
                      </div>

                      {/* Section Items */}
                      <div className="p-6 space-y-4">
                        {sec.items.map((it) => (
                          <div key={String(it.id)} className="bg-gray-50/50 rounded-lg border border-gray-100 p-4 hover:shadow-sm transition-shadow duration-200">
                            {/* Item Header */}
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-1">{it.title}</h4>
                                {it.description && (
                                  <p className="text-sm text-gray-600 mb-2">{it.description}</p>
                                )}
                                <div className="flex items-center gap-2">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {it.answer_types?.name}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Answer Content */}
                            <div className="space-y-3">
                              {/* Result */}
                              {it.answer?.result && (
                                <div className="bg-white rounded-lg border border-gray-200 p-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                      <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">Результат</span>
                                  </div>
                                  <p className="text-sm text-gray-900 font-medium">{it.answer.result}</p>
                                </div>
                              )}

                              {/* Comment */}
                              {it.answer?.comment && (
                                <div className="bg-white rounded-lg border border-gray-200 p-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                                      <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                      </svg>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">Комментарий</span>
                                  </div>
                                  <p className="text-sm text-gray-900 leading-relaxed">{it.answer.comment}</p>
                                </div>
                              )}

                              {/* Media */}
                              {it.answer?.media && it.answer?.media?.length > 0 && (
                                <div className="bg-white rounded-lg border border-gray-200 p-3">
                                  <div className="flex items-center gap-2 mb-3">
                                    <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                                      <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">Медиа файлы</span>
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                      {it.answer.media.length}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {it.answer.media.map((m, index) => (
                                      <button
                                        key={m.id}
                                        onClick={() => openImages(
                                          it.answer.media.map(media => ({
                                            url: media.url,
                                            title: `${it.title} - ${media.media_type}`,
                                            id: media.id
                                          })),
                                          index
                                        )}
                                        className="group block relative overflow-hidden rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                      >
                                        <div className="aspect-square relative">
                                          <Image
                                            src={m.url}
                                            width={300}
                                            height={300}
                                            alt="media"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                          />
                                          {/* Overlay */}
                                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                              <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                                                <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                                </svg>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        {/* Media type badge */}
                                        <div className="absolute top-2 right-2">
                                          <span className="text-xs bg-black/70 text-white px-2 py-1 rounded-full">
                                            {m.media_type}
                                          </span>
                                        </div>
                                        {/* Click hint */}
                                        <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                          <span className="text-xs bg-white/90 text-gray-700 px-2 py-1 rounded-full font-medium">
                                            Нажмите для просмотра
                                          </span>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* No Answer State */}
                              {!it.answer?.result && !it.answer?.comment && (!it.answer?.media || it.answer.media.length === 0) && (
                                <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 text-center">
                                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                  </div>
                                  <p className="text-sm text-gray-500">Ответ не предоставлен</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
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
              </div>
            {/* </CardContent> */}
          </div>
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
  if (!report) return null;
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
            {(report?.listing?.address) && (
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
