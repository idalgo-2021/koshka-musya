"use client"

import * as React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ToggleButton } from '@/components/ToggleButton'
import { useResponsiveToggle } from '@/hooks/useResponsiveToggle'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Select from '@/components/ui/select'
import { Dropdown, DropdownItem } from '@/components/ui/dropdown'

import { type User, UsersApi } from '@/entities/users/api'
import { useUsersQuery } from '@/entities/users/query'
import { getRoleBadgeVariant, getRoleDisplayName } from "@/entities/users/util"
import { useConfirmation, useResetPassword } from '@/entities/modals/ModalContext'
import { MoreVertical, ChevronDown } from 'lucide-react'
import { UserAvatar } from "@/components/UserAvatar"
import {useAuth, USER_ROLE} from "@/entities/auth/useAuth";
import ProfileTab from '../profiles/ProfileTab'
import { Tabs } from '@/components/ui/tabs'

function UsersTab() {
  const [page, setPage] = React.useState(1)
  const limit = 12
  const [isShow, setIsShow] = useResponsiveToggle(false, 'users-view-mode')
  const [searchUsername, setSearchUsername] = React.useState('')
  const [searchRoleId, setSearchRoleId] = React.useState<number | undefined>(undefined)

  const queryClient = useQueryClient()
  const { confirm } = useConfirmation()
  const { openResetPasswordModal } = useResetPassword()

  const { data, isLoading, isError, error } = useUsersQuery(page, limit, searchUsername || undefined, searchRoleId)

  // Mutations for user management
  const changeRoleMutation = useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: number }) =>
      UsersApi.changeUserRole(userId, { role_id: roleId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error) => {
      console.error('Error changing user role:', error)
      alert('Ошибка при изменении роли пользователя')
    },
  })

  const blockUserMutation = useMutation({
    mutationFn: ({ userId, blocked }: { userId: string; blocked: boolean }) =>
      UsersApi.blockUser(userId, { blocked }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error) => {
      console.error('Error blocking user:', error)
      alert('Ошибка при блокировке пользователя')
    },
  })

  // User management functions
  const handleRoleChange = (userId: string, newRoleId: number) => {
    confirm(
      'Изменить роль пользователя',
      'Вы уверены, что хотите изменить роль этого пользователя?',
      () => {
        changeRoleMutation.mutate({ userId, roleId: newRoleId })
        return true
      }
    )
  }
  const { user } = useAuth()
  const isAdmin = user?.role === USER_ROLE.Admin;

  const handleResetPassword = (userId: string, username: string) => {
    openResetPasswordModal(
      userId,
      username,
      () => {
        queryClient.invalidateQueries({ queryKey: ['users'] })
      },
      () => {}
    )
  }

  const handleBlockUser = (userId: string, blocked: boolean) => {
    const action = blocked ? 'заблокировать' : 'разблокировать'
    confirm(
      `${action.charAt(0).toUpperCase() + action.slice(1)} пользователя`,
      `Вы уверены, что хотите ${action} этого пользователя?`,
      () => {
        blockUserMutation.mutate({ userId, blocked })
        return true
      }
    )
  }

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
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground hidden sm:block">Страница {page} / {totalPages}</div>
        </div>
      </div>

      {/* Search Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="search-username">Поиск по имени пользователя</Label>
          <Input
            id="search-username"
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
            placeholder="Введите имя пользователя"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="search-role">Фильтр по роли</Label>
          <Select
            value={searchRoleId?.toString() || ''}
            onChange={(value) => setSearchRoleId(value ? Number(value) : undefined)}
            placeholder="Все роли"
            options={[
              { value: '', label: 'Все роли' },
              { value: '1', label: 'Администратор' },
              { value: '2', label: 'Модератор' },
              { value: '3', label: 'Пользователь' },
            ]}
          />
        </div>
      </div>

      <ToggleButton checked={isShow} onToggle={setIsShow} />

      {isShow ? (
        // Table View
        <div className="rounded-md border">
          <div className="">
            <table className="w-full">
              <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-12 px-2 md:px-4 text-left align-middle font-medium text-muted-foreground">Имя пользователя</th>
                <th className="h-12 px-2 md:px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                <th className="h-12 px-2 md:px-4 text-left align-middle font-medium text-muted-foreground hidden sm:table-cell">Email</th>
                <th className="h-12 px-2 md:px-4 text-left align-middle font-medium text-muted-foreground hidden md:table-cell">Роль</th>
                <th className="h-12 px-2 md:px-4 text-left align-middle font-medium text-muted-foreground hidden lg:table-cell">Дата создания</th>
                <th className="h-12 px-2 md:px-4 text-left align-middle font-medium text-muted-foreground">Действия</th>
              </tr>
              </thead>
              <tbody>
              {users.map((user: User) => (
                <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                  <td className="p-2 md:p-4 align-middle">
                    <div className="flex items-center gap-2">
                      <UserAvatar size="md" />
                      <div>
                        <div className="font-medium">{user.username}</div>
                        <div className="text-xs text-muted-foreground sm:hidden">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-2 md:p-4 align-middle text-sm font-mono">
                    {user.id}
                  </td>
                  <td className="p-2 md:p-4 align-middle text-sm text-muted-foreground hidden sm:table-cell">
                    {user.email}
                  </td>
                  <td className="p-2 md:p-4 align-middle hidden md:table-cell">
                    <Dropdown
                      trigger={
                        <div className="inline-flex items-center gap-1 cursor-pointer">
                          <Badge variant={getRoleBadgeVariant(user.role_id)} className="cursor-pointer">
                            {getRoleDisplayName(user.role_id, user.role_name)}
                          </Badge>
                          <ChevronDown className="h-3 w-3 text-muted-foreground" />
                        </div>
                      }
                    >
                      <DropdownItem onClick={() => handleRoleChange(user.id, 1)}>
                        Администратор
                      </DropdownItem>
                      <DropdownItem onClick={() => handleRoleChange(user.id, 2)}>
                        Модератор
                      </DropdownItem>
                      <DropdownItem onClick={() => handleRoleChange(user.id, 3)}>
                        Секретный гость
                      </DropdownItem>
                    </Dropdown>
                  </td>
                  <td className="p-2 md:p-4 align-middle text-sm text-muted-foreground hidden lg:table-cell">
                    {new Date(user.created_at).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="p-2 md:p-4 align-middle">
                    { isAdmin ? (
                      <Dropdown
                        trigger={
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        }
                      >
                        <DropdownItem onClick={() => handleResetPassword(user.id, user.username)}>
                          Сброс пароля
                        </DropdownItem>
                        <DropdownItem
                          onClick={() => handleBlockUser(user.id, true)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          Заблокировать
                        </DropdownItem>
                      </Dropdown>
                    ) : undefined}
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
            <Card key={user.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserAvatar size="md" />
                    <CardTitle className="text-lg">{user.username}</CardTitle>
                  </div>
                  <Dropdown
                    trigger={
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    }
                  >
                    <DropdownItem onClick={() => handleResetPassword(user.id, user.username)}>
                      Сброс пароля
                    </DropdownItem>
                    <DropdownItem
                      onClick={() => handleBlockUser(user.id, true)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      Заблокировать
                    </DropdownItem>
                  </Dropdown>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">{user.email}</div>
                {isAdmin ? (
                  <Dropdown
                    trigger={
                      <div className="inline-flex items-center gap-1 cursor-pointer">
                        <Badge variant={getRoleBadgeVariant(user.role_id)} className="cursor-pointer">
                          {getRoleDisplayName(user.role_id, user.role_name)}
                        </Badge>
                        <ChevronDown className="h-3 w-3 text-muted-foreground"/>
                      </div>
                    }
                  >
                    <DropdownItem onClick={() => handleRoleChange(user.id, 1)}>
                      Администратор
                    </DropdownItem>
                    <DropdownItem onClick={() => handleRoleChange(user.id, 2)}>
                      Модератор
                    </DropdownItem>
                    <DropdownItem onClick={() => handleRoleChange(user.id, 3)}>
                      Секретный гость
                    </DropdownItem>
                  </Dropdown>
                ) : (
                  <div className="inline-flex items-center gap-1 cursor-pointer">
                    <Badge variant={getRoleBadgeVariant(user.role_id)} className="cursor-pointer">
                      {getRoleDisplayName(user.role_id, user.role_name)}
                    </Badge>
                    <ChevronDown className="h-3 w-3 text-muted-foreground"/>
                  </div>
                )}

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

export default function UsersPage() {
  return (
    <div className="space-y-8">
      <Tabs items={[
        { id: 'users', label: 'Пользователи', content: <UsersTab /> },
        { id: 'stats', label: 'Статистика пользователей', content: <ProfileTab /> },
    ]} />
    </div>
  )
}
