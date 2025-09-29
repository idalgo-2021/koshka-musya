"use client"

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AnswerTypesApi } from '@/entities/answerTypes/api'
import { useParams, useRouter } from 'next/navigation'
import {StepBackIcon} from "lucide-react";

const schema = z.object({
  name: z.string().min(1, 'Required'),
  slug: z.string().min(1, 'Required'),
  meta: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function EditAnswerTypePage() {
  const params = useParams<{ id: string }>()
  const id = Number(params?.id)
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: '', slug: '', meta: '{}' } })
  const queryClient = useQueryClient()
  const router = useRouter()

  const { isLoading } = useQuery({
    queryKey: ['answer_type', id],
    enabled: Number.isFinite(id),
    queryFn: async () => {
      const data = await AnswerTypesApi.getById(id)
      form.reset({ name: data.name, slug: data.slug, meta: JSON.stringify(data.meta ?? {}) })
      return data
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      let meta: Record<string, unknown> | undefined
      try { meta = values.meta ? JSON.parse(values.meta) : undefined } catch { meta = undefined }
      return AnswerTypesApi.update(id, { name: values.name, slug: values.slug, meta })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['answer_types'] })
      router.push('/admin/answerTypes')
    },
  })

  return (
    <div className="container max-w-xl py-6">
      <div className="mb-4 flex items-center gap-3">
         <Button variant="outline" onClick={() => router.back()}><StepBackIcon/></Button>
         <h1 className="text-md md:text-2xl font-semibold">Edit Answer Type</h1>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <form onSubmit={form.handleSubmit(values => updateMutation.mutate(values))} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input {...form.register('name')} placeholder="Name" />
          </div>
          <div className="space-y-2">
            <Label>Slug</Label>
            <Input {...form.register('slug')} placeholder="Slug" />
          </div>
          <div className="space-y-2">
            <Label>Meta (JSON)</Label>
            <Input {...form.register('meta')} placeholder="{}" />
          </div>

          <Button type="submit" disabled={updateMutation.isPending}>{updateMutation.isPending ? 'Saving...' : 'Save'}</Button>
        </form>
      )}
    </div>
  )
}


