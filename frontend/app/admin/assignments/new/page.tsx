"use client"

import * as React from 'react'
import {PropsWithChildren} from 'react'
import {useForm} from 'react-hook-form'
import {useRouter} from "next/navigation";
import {z} from 'zod'
import {zodResolver} from '@hookform/resolvers/zod'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'

import {Input} from '@/components/ui/input'
import {Button} from '@/components/ui/button'
import {Label} from "@/components/ui/label";

import {AssignmentsApi} from '@/entities/assignments/api'
import { StepBackIcon } from 'lucide-react';

const schema = z.object({
  listing_id: z.string().min(1, 'Select a listing'),
  expires_at: z.string().min(1, 'Select expiration date'),
  code: z.string().min(1, 'Enter code'),
  purpose: z.string().min(1, 'Enter purpose'),
  reporter_id: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function NewAssignmentPage() {
  const form = useForm<FormValues>({resolver: zodResolver(schema), defaultValues: {code: '', purpose: ''}});
  const queryClient = useQueryClient();
  const router = useRouter();

  const listingsQuery = useQuery({
    queryKey: ['listings', {page: 1, limit: 100}],
    queryFn: async () => await AssignmentsApi.getAvailableAssignments(1, 100),
    select: (data) => {
      console.log(data);
      return data?.assignments || []
    }
  });

  const listings = listingsQuery.data || [];
  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      console.log({values});
      // TODO: API doesn't support creating assignments yet
      throw new Error('Creating assignments is not supported by the API yet');
      // return await AssignmentsApi.createAssignment({
      //   code: 'a1891b4f-3944-4e84-99f9-94305558e5b3',
      //   expires_at: toDate(values.expires_at),
      //   listing_id: values.listing_id,
      //   purpose: values.purpose,
      //   reporter_id: values.reporter_id || 'a1891b4f-3944-4e84-99f9-94305558e5b3',
      // })
    },
    onSuccess: () => {
      form.reset()
      queryClient.invalidateQueries({queryKey: ['assignments']})
    },
  });

  const onSubmitForm = async (values: any) => {
    if (createMutation.isPending) {
      return;
    }
    try {
      const data = await createMutation.mutateAsync(values);
      console.log(data)
    } catch (e) {
      console.error(e);
    }
  };
  const errors = form.formState.errors;

  return (
    <div className="container max-w-2xl py-6">
      <div className="mb-4 flex  gap-3">
         <Button variant="outline" onClick={() => router.back()}><StepBackIcon/></Button>
         <h1 className="text-md md:text-2xl font-semibold mb-4">Создать предложения для оценки</h1>
      </div>
      {listingsQuery.isLoading ? (
        <p>Loading...</p>
      ) : (
        <form  className="flex flex-col gap-4" {...form} onSubmit={form.handleSubmit(onSubmitForm)}>
          {createMutation.isSuccess && (
            <p className="text-green-600 text-sm">Предложение создано</p>
          )}
          <FormFieldValue title={'Объект'} error={errors.listing_id}>
            <select
              {...form.register('listing_id')}
              className="border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              <option value="">Выберите объект</option>
              {listings.map(l => (
                <option key={l.id} value={l.id}>{l.title}</option>
              ))}
            </select>
          </FormFieldValue>

          <FormFieldValue title={'Истекает'} error={errors.expires_at}>
            <Input
              type="date"
              {...form.register('expires_at')}
            />
          </FormFieldValue>

          <FormFieldValue title={'Код'} error={errors.code}>
            <Input placeholder="Code"
                   {...form.register('code')}
            />

          </FormFieldValue>

          <FormFieldValue title={'Цель'} error={errors.purpose}>
            <Input placeholder="Purpose"    {...form.register('purpose')} />
          </FormFieldValue>
          {createMutation.isError && (
            <p className="text-red-600 text-sm">
              {(createMutation.error as Error)?.message || 'Failed to create assignment'}
            </p>
          )}

          <div className="flex gap-3">
            <Button type="submit" onClick={form.handleSubmit(onSubmitForm)}
                    disabled={createMutation.isPending}>{createMutation.isPending ? 'Создается...' : 'Создать'}</Button>
          </div>
        </form>
      )}
    </div>
  )
}


const FormFieldValue = ({
                          title,
                          error,
                          children,
                        }: PropsWithChildren<{ title: string, error: any }>) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="username" className="text-sm font-medium text-gray-700">
        {title}
      </Label>
      {children}
      {error && (
        <p className="text-red-500 text-xs mt-1">{error.message}</p>
      )}
    </div>
  )
}
