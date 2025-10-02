"use client";
import * as React from 'react';

import type { Report } from '@/entities/reports/types';
import { CopyToClipboard } from '@/components/CopyToClipboard';

interface AssignmentInfo {
  title: string;
  address: string;
  city: string;
  country: string;
  purpose?: string;
}

interface ReportHeaderProps {
  children?: React.ReactNode;
  report?: Report
  assignmentInfo: AssignmentInfo | null;
  progress: number;
  checklistSchema: {
    sections: Array<{
      id: number;
      title: string;
      items: Array<{
        id: number;
        title: string;
        description?: string;
        answer_types: {
          slug: string;
          meta?: unknown;
        };
        media_requirement: string;
        media_max_files?: number;
        media_allowed_types?: string[];
      }>;
    }>;
  } | null;
}

export default function ReportHeader({ report, assignmentInfo, progress, checklistSchema, children }: ReportHeaderProps) {
  if (!assignmentInfo) return null;

  return (
    <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-700 font-medium mb-1">{assignmentInfo.title}</p>
          <p className="text-xs text-gray-500">
            {assignmentInfo.address && (
              <span className="block">{assignmentInfo.address}</span>
            )}
            {assignmentInfo.city && assignmentInfo.country && (
              <span className="block">{assignmentInfo.city}, {assignmentInfo.country}</span>
            )}
            {assignmentInfo.purpose && (
              <span className="block mt-1">Цель: {assignmentInfo.purpose}</span>
            )}

            {report?.booking_details?.booking_number && (
              <span className="block mt-1">
                Номер брони: <CopyToClipboard text={report.booking_details.booking_number} />
              </span>
            )}
            {report?.booking_details?.guests && (
              <span className="block mt-1">{`Гостей: ${report?.booking_details?.guests.adults + ' взрослых и ' + report?.booking_details?.guests.children } детей`}</span>
            )}
            {report?.booking_details?.pricing?.pricing?.total && (
              <span className="block mt-1">Стоимость: {report?.booking_details?.pricing?.pricing?.total + ' ' + report?.booking_details?.pricing?.pricing.currency}</span>
            )}

            {/*{report?.booking_details?.pricing?.pricing?.currency && (*/}
            {/*  <span className="block mt-1">Всего: {report?.booking_details?.pricing?.pricing?.total + ' ' + report?.booking_details?.pricing?.pricing.currency}</span>*/}
            {/*)}*/}
            {children}
          </p>
        </div>
      </div>

      {/* Progress Bar */
      }
      {
        checklistSchema && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-700">Прогресс заполнения</h4>
              <span className="text-sm font-medium text-blue-600">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{width: `${progress}%`}}
              />
            </div>
          </div>
        )
      }
    </div>
  )
    ;
}
