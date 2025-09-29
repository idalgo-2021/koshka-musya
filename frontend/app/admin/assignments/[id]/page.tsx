"use client"

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { AssignmentsApi } from '@/entities/assignments/api'
import type { Assignment } from '@/entities/assignments/types'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image';
import ReportHeader from "@/components/ReportHeader";
import {formatDate} from "@/lib/date";
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
        <div>Loading...</div>
      ) : isError || !data ? (
        <div className="text-destructive">Failed to load</div>
      ) : (
        <div className="space-y-3">
          <ReportHeader
            assignmentInfo={{
              title: data.title || '',
              address: data.listing.address || '',
              city: data.listing.city || '',
              country: data.listing.country || '',
              purpose: data.purpose,
            }}
            progress={0}
            checklistSchema={null}
          >
            <span className="block">Дедлайн: {data.deadline}</span>
            <span className="block">
              Срок действия До {formatDate(data.expires_at)}
            </span>
          </ReportHeader>

          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="text-lg font-semibold">{data.listing?.listing_type?.name}</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  {/*<div className="text-sm text-muted-foreground">Title</div>*/}
                  <div className="font-medium break-all">
                    {data.listing?.id ? (
                      <Link href={`/admin/listings/${data.listing.id}`} className="underline underline-offset-2">
                        {data.listing?.title}
                      </Link>
                    ) : (
                      data.listing?.title
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Код</div>
                  <div className="font-medium break-all">{data.listing?.code}</div>
                </div>
                {/*<div>*/}
                {/*  <div className="text-sm text-muted-foreground">Listing Type</div>*/}
                {/*  <div className="font-medium break-all">{data.listing?.listing_type?.name} (#{data.listing?.listing_type?.id})</div>*/}
                {/*</div>*/}
                {data.listing?.main_picture && (
                  <div className="md:col-span-3">
                    <div className="mt-1 overflow-hidden rounded-md border">
                      <Image src={data.listing.main_picture}
                             width={300}
                             height={300}
                             alt={data.listing.title || 'Listing image'} className="w-20 h-auto object-cover" />
                    </div>
                  </div>
                )}
                <div className="md:col-span-3">
                  {/*<div className="text-sm text-muted-foreground">Address</div>*/}
                  <div className="font-medium break-all">{[data.listing?.address, data.listing?.city, data.listing?.country].filter(Boolean).join(', ')}</div>
                </div>
                <div className="md:col-span-3">
                  <div className="text-sm text-muted-foreground">Описание</div>
                  <div className="font-medium break-all">{data.listing?.description}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

