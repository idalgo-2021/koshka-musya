"use client"

import * as React from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ToggleButton, useToggleWithStorage } from '@/components/ToggleButton'
import { Badge } from '@/components/ui/badge'

import { type User } from '@/entities/users/api'
import { useUsersQuery } from '@/entities/users/query'
import {getRoleBadgeVariant, getRoleDisplayName} from "@/entities/users/util";

export default function UsersPage() {
  const [page, setPage] = React.useState(1)
  const limit = 12
  const [isShow, setIsShow] = useToggleWithStorage(false, 'users-view-mode');

  const { data, isLoading, isError, error } = useUsersQuery(page, limit)

  if (isLoading) return <div className="p-6">Loading...</div>
  if (isError) return <div className="p-6 text-red-600 text-sm">{(error as Error)?.message || 'Failed to load users'}</div>

  const users = data?.users || []
  const total = data?.total || 0
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const canPrev = page > 1
  const canNext = page < totalPages

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-md md:text-2xl font-semibold">Пользователи</h1>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground hidden sm:block">Страница {page} / {totalPages}</div>
        </div>
      </div>
      <ToggleButton checked={isShow} onToggle={setIsShow} />

      {isShow ? (
        // Table View
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-12 px-2 md:px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                  <th className="h-12 px-2 md:px-4 text-left align-middle font-medium text-muted-foreground">Имя пользователя</th>
                  <th className="h-12 px-2 md:px-4 text-left align-middle font-medium text-muted-foreground hidden sm:table-cell">Email</th>
                  <th className="h-12 px-2 md:px-4 text-left align-middle font-medium text-muted-foreground hidden md:table-cell">Роль</th>
                  <th className="h-12 px-2 md:px-4 text-left align-middle font-medium text-muted-foreground hidden lg:table-cell">Дата создания</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: User) => (
                  <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-2 md:p-4 align-middle text-sm font-mono">
                      {user.id}
                    </td>
                    <td className="p-2 md:p-4 align-middle">
                      <div className="font-medium">{user.username}</div>
                      <div className="text-xs text-muted-foreground sm:hidden">{user.email}</div>
                    </td>
                    <td className="p-2 md:p-4 align-middle text-sm text-muted-foreground hidden sm:table-cell">
                      {user.email}
                    </td>
                    <td className="p-2 md:p-4 align-middle hidden md:table-cell">
                      <Badge variant={getRoleBadgeVariant(user.role_id)}>
                        {getRoleDisplayName(user.role_id, user.role_name)}
                      </Badge>
                    </td>
                    <td className="p-2 md:p-4 align-middle text-sm text-muted-foreground hidden lg:table-cell">
                      {new Date(user.created_at).toLocaleDateString('ru-RU')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Card View
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {users.map((user: User) => (
            <Card key={user.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg">{user.username}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">{user.email}</div>
                <Badge variant={getRoleBadgeVariant(user.role_id)}>
                  {getRoleDisplayName(user.role_id, user.role_name)}
                </Badge>
                <div className="text-xs text-muted-foreground">
                  ID: {user.id}
                </div>
                <div className="text-xs text-muted-foreground">
                  Создан: {new Date(user.created_at).toLocaleDateString('ru-RU')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={!canPrev || isLoading}
        >
          Назад
        </button>
        <div className="text-sm text-muted-foreground">{(page - 1) * limit + 1}-{Math.min(page * limit, total)} из {total}</div>
        <button
          className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
          onClick={() => setPage((p) => (canNext ? p + 1 : p))}
          disabled={!canNext || isLoading}
        >
          Вперед
        </button>
      </div>
    </div>
  )
}
