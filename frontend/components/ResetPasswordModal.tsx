"use client"

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMutation } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'
import { Loader } from '@/components/Loader'

import { UsersApi } from '@/entities/users/api'

const resetPasswordSchema = z.object({
  new_password: z.string().min(8, 'Пароль должен содержать минимум 8 символов'),
  confirm_password: z.string().min(8, 'Подтверждение пароля обязательно'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Пароли не совпадают",
  path: ["confirm_password"],
})

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

interface ResetPasswordModalProps {
  userId: string
  username: string
  onSuccess: () => void
  onCancel: () => void
  isLoading?: boolean
}

export default function ResetPasswordModal({
  userId,
  username,
  onSuccess,
  onCancel,
  isLoading = false
}: ResetPasswordModalProps) {
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      new_password: '',
      confirm_password: '',
    },
  })

  const resetPasswordMutation = useMutation({
    mutationFn: (data: { new_password: string }) =>
      UsersApi.resetUserPassword(userId, data),
    onSuccess: () => {
      form.reset()
      onSuccess()
    },
    onError: (error) => {
      console.error('Error resetting password:', error)
      alert('Ошибка при сбросе пароля')
    },
  })

  const onSubmit = (data: ResetPasswordFormValues) => {
    resetPasswordMutation.mutate({
      new_password: data.new_password
    })
  }

  const isSubmitting = isLoading || resetPasswordMutation.isPending

  return (
    <Modal isOpen size='sm' onClose={onCancel}>
      <Card className="w-full max-w-md border-0 shadow-none mx-auto">
        <CardHeader>
          <CardTitle>
            Сброс пароля для пользователя: <strong>{username}</strong>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new_password">Новый пароль</Label>
                <Input
                  id="new_password"
                  type="password"
                  {...form.register('new_password')}
                  placeholder="Введите новый пароль"
                />
                {form.formState.errors.new_password && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.new_password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password">Подтверждение пароля</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  {...form.register('confirm_password')}
                  placeholder="Подтвердите новый пароль"
                />
                {form.formState.errors.confirm_password && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.confirm_password.message}
                  </p>
                )}
              </div>

              <div className="flex justify-start gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <Loader />
                      Сброс...
                    </div>
                  ) : (
                    'Сбросить пароль'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </Modal>
  )
}
