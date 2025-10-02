"use client";
import * as React from 'react';
import {
  MapPin,
  Calendar,
  User,
  Target,
  CreditCard,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText
} from 'lucide-react';

import type { Report } from '@/entities/reports/types';
import { CopyToClipboard } from '@/components/CopyToClipboard';
import { ReportStatusBadge } from '@/components/ReportStatusBadge';
import { formatDate } from '@/lib/date';

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

export default function ReportHeaderAdmin({ report, assignmentInfo, progress, checklistSchema, children }: ReportHeaderProps) {
  if (!assignmentInfo) return null;

  const getStatusIcon = (slug: string) => {
    switch (slug) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
      case 'failed_generation':
        return <AlertCircle className="w-4 h-4" />;
      case 'submitted':
        return <FileText className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 rounded-2xl border border-gray-200/60 shadow-lg backdrop-blur-sm overflow-hidden">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-100/80">
        <div className="flex items-start justify-between gap-4">
          {/* Main Info */}
          <div className="flex items-start gap-4 flex-1">
            {/* Status Icon */}
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                {report?.status && getStatusIcon(report.status.slug)}
              </div>
              {report?.status && (
                <div className="absolute -top-1 -right-1">
                  <ReportStatusBadge status={report.status} className="text-xs px-2 py-0.5" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                {assignmentInfo.title}
              </h1>

              {/* Location */}
              <div className="flex items-center gap-2 text-gray-600 mb-3">
                <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <div className="text-sm">
                  {assignmentInfo.address && (
                    <div className="font-medium">{assignmentInfo.address}</div>
                  )}
                  {assignmentInfo.city && assignmentInfo.country && (
                    <div className="text-gray-500">
                      {assignmentInfo.city}, {assignmentInfo.country}
                    </div>
                  )}
                </div>
              </div>

              {/* Purpose */}
              {assignmentInfo.purpose && (
                <div className="flex items-start gap-2 text-gray-600 mb-3">
                  <Target className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Цель:</span> {assignmentInfo.purpose}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="p-6 space-y-4">
        {/* Booking Details */}
        {report?.booking_details && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Booking Number */}
            {report.booking_details.booking_number && (
              <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg border border-gray-100">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 mb-1">Номер брони</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900 truncate">
                      {report.booking_details.booking_number}
                    </span>
                    <CopyToClipboard text={report.booking_details.booking_number} />
                  </div>
                </div>
              </div>
            )}

            {/* Guests */}
            {report.booking_details.guests && (
              <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg border border-gray-100">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 mb-1">Гости</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {report.booking_details.guests.adults} взрослых
                    {report.booking_details.guests.children > 0 &&
                      `, ${report.booking_details.guests.children} детей`
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Pricing */}
            {report.booking_details.pricing?.pricing?.total && (
              <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg border border-gray-100">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 mb-1">Стоимость</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {report.booking_details.pricing.pricing.total} {report.booking_details.pricing.pricing.currency}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Report Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Created Date */}
          <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg border border-gray-100">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 mb-1">Создан</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatDate(report?.created_at || '')}
              </p>
            </div>
          </div>

          {/* Updated Date */}
          {report?.updated_at && (
            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg border border-gray-100">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 mb-1">Обновлено</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatDate(report.updated_at)}
                </p>
              </div>
            </div>
          )}

          {/* Reporter */}
          {report?.reporter && (
            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg border border-gray-100">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 mb-1">Автор</p>
                <p className="text-sm font-semibold text-gray-900">
                  {report.reporter.username}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Custom Children */}
        {children && (
          <div className="pt-2">
            {children}
          </div>
        )}

        {/* Progress Bar */}
        {checklistSchema && (
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Прогресс заполнения
              </h4>
              <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                {progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-700 ease-out shadow-sm"
                style={{width: `${progress}%`}}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
