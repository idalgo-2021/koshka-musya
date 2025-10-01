"use client"

import { Profile } from '@/entities/profiles/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail, Calendar, Activity, CheckCircle, FileText, Award } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProfileCardProps {
  profile: Profile
  className?: string
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getActivityStatus = (lastActiveAt: string) => {
  const lastActive = new Date(lastActiveAt)
  const now = new Date()
  const diffHours = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60)

  if (diffHours < 1) return { label: 'Онлайн', color: 'bg-green-100 text-green-800' }
  if (diffHours < 24) return { label: 'Недавно', color: 'bg-yellow-100 text-yellow-800' }
  if (diffHours < 168) return { label: 'На этой неделе', color: 'bg-blue-100 text-blue-800' }
  return { label: 'Давно', color: 'bg-gray-100 text-gray-800' }
}

export default function ProfileCard({ profile, className }: ProfileCardProps) {
  const activityStatus = getActivityStatus(profile.last_active_at)

  return (
    <Card className={cn("hover:shadow-md transition-shadow duration-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
              {profile.username}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4" />
              <span>{profile.email}</span>
            </div>
          </div>
          <Badge className={cn("text-xs font-medium", activityStatus.color)}>
            {activityStatus.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* User ID */}
        <div className="text-sm text-gray-500">
          <span className="font-medium">ID:</span> {profile.user_id}
        </div>

        {/* Registration Date */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-gray-600">
            Зарегистрирован: {formatDate(profile.registered_at)}
          </span>
        </div>

        {/* Last Active */}
        {profile.last_active_at && (
          <div className="flex items-center gap-2 text-sm">
            <Activity className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">
              Последняя активность: {formatDate(profile.last_active_at)}
            </span>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-1">
              <Award className="w-4 h-4" />
              <span>Принято</span>
            </div>
            <div className="text-lg font-bold text-green-600">
              {profile.accepted_offers_count}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-1">
              <FileText className="w-4 h-4" />
              <span>Отчетов</span>
            </div>
            <div className="text-lg font-bold text-blue-600">
              {profile.submitted_reports_count}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-1">
              <CheckCircle className="w-4 h-4" />
              <span>Правильных</span>
            </div>
            <div className="text-lg font-bold text-purple-600">
              {profile.correct_reports_count}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        {profile.additional_info && Object.keys(profile.additional_info).length > 0 && (
          <div className="pt-2 border-t">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Доп. информация:</span>
              <div className="mt-1 text-xs text-gray-500">
                {Object.entries(profile.additional_info).map(([key, value]) => (
                  <div key={key}>
                    {key}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
