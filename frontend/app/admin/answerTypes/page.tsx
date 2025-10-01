"use client"

import * as React from 'react'
import Link from 'next/link'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnswerTypesApi, type AnswerType } from '@/entities/answerTypes/api'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import {Edit, StepBackIcon, Trash2} from 'lucide-react'
import {USER_ROLE} from "@/entities/auth/useAuth";
import ConfirmationModal from '@/components/ConfirmationModal'
import {useUser} from "@/entities/auth/SessionContext";

export default function AnswerTypesListPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false)
  const [itemToDelete, setItemToDelete] = React.useState<AnswerType | null>(null)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['answer_types'],
    queryFn: async () => await AnswerTypesApi.list(),
  })

  const removeMutation = useMutation({
    mutationFn: (id: number) => AnswerTypesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['answer_types'] })
      setDeleteModalOpen(false)
      setItemToDelete(null)
    },
  })

  const items: AnswerType[] = (data?.answer_types as AnswerType[]) || []
  const user = useUser();
  const isAdmin = user?.role === USER_ROLE.Admin;

  const handleDeleteClick = (item: AnswerType) => {
    setItemToDelete(item)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      removeMutation.mutate(itemToDelete.id)
    }
    return true
  }

  const handleCancelDelete = () => {
    setDeleteModalOpen(false)
    setItemToDelete(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.back()}><StepBackIcon/></Button>
           <h1 className="text-md md:text-2xl font-semibold">Тип ответов</h1>
        </div>
        { isAdmin && (
          <Button asChild>
            <Link href="/admin/answerTypes/new">Создать Новый тип</Link>
          </Button>
        )}
      </div>

      {isLoading && <div>Loading...</div>}
      {isError && <div className="text-sm text-red-600">{(error as Error)?.message || 'Failed to load'}</div>}

      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-3 py-2 text-left font-medium">ID</th>
              <th className="px-3 py-2 text-left font-medium">Название</th>
              <th className="px-3 py-2 text-left font-medium">Slug</th>
              <th className="px-3 py-2 text-left font-medium">Действия</th>
            </tr>
          </thead>

          <tbody>
            {items.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="px-3 py-2">{t.id}</td>
                <td className="px-3 py-2">{t.name}</td>
                <td className="px-3 py-2">{t.slug}</td>
                <td className="px-3 py-2 flex items-center gap-2">
                  {/*{isAdmin && (*/}
                    <>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/answerTypes/${t.id}`}>
                          <Edit />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={removeMutation.isPending}
                        onClick={() => handleDeleteClick(t)}
                      >
                        <Trash2 />
                      </Button>
                    </>
                  {/*)}*/}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      {deleteModalOpen && itemToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <ConfirmationModal
            title="Удалить тип ответа"
            message={`Вы уверены, что хотите удалить тип ответа "${itemToDelete.name}"? Это действие нельзя отменить.`}
            type="danger"
            confirmText="Удалить"
            cancelText="Отмена"
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
            isLoading={removeMutation.isPending}
          />
        </div>
      )}
    </div>
  )
}


