"use client"

import * as React from 'react'
import type {PropsWithChildren} from 'react'
import {useForm} from 'react-hook-form'
import {z} from 'zod'
import {zodResolver} from '@hookform/resolvers/zod'
import {useMutation, useQuery} from '@tanstack/react-query'
import {toast} from "sonner";
import { useRouter } from 'next/navigation'

import {Input} from '@/components/ui/input'
import {Button} from '@/components/ui/button'
import Select from '@/components/ui/select'
import {ListingsApi} from '@/entities/listings/api'
import {YMaps, Map, Placemark} from '@pbe/react-yandex-maps'
import {Label} from '@/components/ui/label'
import {StepBackIcon} from "lucide-react";

type LatLng = { lat: number; lng: number }

const schema = z.object({
  title: z.string().min(1, 'Required'),
  description: z.string().min(1, 'Required'),
  code: z.string().min(1, 'Required'),
  address: z.string().min(1, 'Required'),
  city: z.string().min(1, 'Required'),
  country: z.string().min(1, 'Required'),
  listing_type_id: z.number().min(1, 'Select type'),
  latitude: z.number(),
  longitude: z.number(),
})
// const apiKey = process.env.NEXT_PUBLIC_YANDEX_API_KEY || 'd61fb33d-8398-44b6-93ea-142d6fc628c2';
const apiKey = '299bad8b-4e18-48ee-8c94-52ff86a5fa40'

type FormValues = z.infer<typeof schema>

export default function NewListingPage() {
  const form = useForm<FormValues>({resolver: zodResolver(schema), defaultValues: {} as Partial<FormValues>})
  const router = useRouter()

  React.useEffect(() => {
    const current = form.getValues('code')
    if (!current) {
      const id = (globalThis as unknown as { crypto?: Crypto }).crypto?.randomUUID?.()
        || generateUuidFallback()
      form.setValue('code', id)
    }
  }, [form])

  const typesQuery = useQuery({
    queryKey: ['listing_types'],
    queryFn: () => ListingsApi.getListingTypes(),
  })

  const createMutation = useMutation({
    mutationFn: (values: FormValues) => ListingsApi.createListing(values),
    onSuccess: () => {
      toast.success('Объект успешно создан')
      form.reset();
      router.push('/admin/listings');
    },
    onError: () => {
     toast.error('Не удалось сохранить объект');
    }
  })

  const onMapClick = (e: { latlng: LatLng }) => {
    form.setValue('latitude', e.latlng.lat as unknown as number, {shouldValidate: true})
    form.setValue('longitude', e.latlng.lng as unknown as number, {shouldValidate: true})
  }

  const errors = form.formState.errors

  return (
    <div className="container max-w-2xl py-6">
      <div className="mb-4 flex items-center gap-3">
        <Button variant="outline" onClick={() => router.back()}><StepBackIcon/></Button>
        <h1 className="text-md md:text-2xl font-semibold">Создание объекта</h1>
      </div>
      <form onSubmit={form.handleSubmit((values: FormValues) => createMutation.mutate(values))} className="space-y-6">
        <FormFieldValue title="Название" error={errors.title}>
          <Input placeholder="Название" {...form.register('title')} />
        </FormFieldValue>

        <FormFieldValue title="Описание" error={errors.description}>
          <Input type="text" placeholder="Описание" {...form.register('description')} />
        </FormFieldValue>

        <FormFieldValue title="Тип объекта" error={errors.listing_type_id}>
          <Select
            value={form.watch('listing_type_id')}
            onChange={(value) => form.setValue('listing_type_id', value ? Number(value) : 0)}
            placeholder="Выбрать"
            options={[
              { value: '', label: 'Выбрать' },
              ...(typesQuery.data?.listing_types || []).map(t => ({
                value: t.id.toString(),
                label: t.name
              }))
            ]}
          />
        </FormFieldValue>

        <div className="space-y-2">
          <Label>Локация (выберите позицию на карте)</Label>
          <div className="h-96 w-full rounded-md overflow-hidden border">
            <YMaps query={{apikey: apiKey}}>
              <Map
                defaultState={{center: [55.751244, 37.618423], zoom: 5}}
                width="100%"
                height="100%"
                onClick={async (e: any) => {
                  const coords = e.get('coords') as [number, number]
                  if (!coords) return
                  const [lat, lng] = coords
                  onMapClick({latlng: {lat, lng}})
                  try {
                    const geocodeRes = await fetch(`https://geocode-maps.yandex.ru/1.x/?format=json&geocode=${lng},${lat}&apikey=${apiKey}`)
                    const json = await geocodeRes.json()
                    const member = json?.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject
                    const components: Array<{
                      kind: string;
                      name: string
                    }> = member?.metaDataProperty?.GeocoderMetaData?.Address?.Components || []
                    const cityComp = components.find(c => ['locality', 'area', 'city', 'district', 'town'].includes(c.kind))
                    const countryComp = components.find(c => c.kind === 'country')
                    if (cityComp?.name) form.setValue('city', cityComp.name)
                    if (countryComp?.name) form.setValue('country', countryComp.name)
                    const addressLine = member?.metaDataProperty?.GeocoderMetaData?.text
                    if (addressLine) form.setValue('address', addressLine)
                  } catch {
                  }
                }}
              >
                {/*<SearchControl />*/}
                {form.watch('latitude') != null && form.watch('longitude') != null && (
                  <Placemark geometry={[form.watch('latitude') as number, form.watch('longitude') as number]}/>
                )}
              </Map>
            </YMaps>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormFieldValue title={'Широта'} error={errors.latitude}>
              <Input type="number" disabled step="any" {...form.register('latitude', {valueAsNumber: true})} />
            </FormFieldValue>
            <FormFieldValue title={'Долгота'} error={errors.longitude}>
              <Input type="number" disabled step="any" {...form.register('longitude', {valueAsNumber: true})} />
            </FormFieldValue>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormFieldValue title={'Город'} error={errors.city}>
            <Input disabled placeholder="Город" {...form.register('city')} />
          </FormFieldValue>

          <FormFieldValue title={'Страна'} error={errors.country}>
            <Input disabled placeholder="Страна" {...form.register('country')} />
          </FormFieldValue>
        </div>

        <FormFieldValue title={'Адрес'} error={errors.address}>
          <Input disabled placeholder="Адрес" {...form.register('address')} />
        </FormFieldValue>

        <FormFieldValue title={'Код'} error={errors.code}>
          <Input placeholder="Код" {...form.register('code')} />
        </FormFieldValue>
        <div className="flex gap-3">
          <Button type="submit"
                  disabled={createMutation.isPending}>{createMutation.isPending ? 'Submitting...' : 'Создать объект'}</Button>
        </div>
      </form>
      {createMutation.isError && (
        <p className="text-red-600 text-sm">{(createMutation.error as Error)?.message || 'Failed to create listing'}</p>
      )}
      {createMutation.isSuccess && (
        <p className="text-green-600 text-sm">Listing created</p>
      )}
    </div>
  )
}

const FormFieldValue = ({title, error, children}: PropsWithChildren<{ title: string; error: any }>) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">{title}</Label>
      {children}
      {error && (
        <p className="text-red-500 text-xs mt-1">{error.message}</p>
      )}
    </div>
  )
}

function generateUuidFallback() {
  // RFC4122 v4-ish fallback using Math.random (non-crypto)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}


