"use client"

import * as React from 'react'
import { X, FilterX } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { type SectionFilters, ChecklistApi } from '@/entities/checklist/api'
import { type ListingType } from '@/entities/listings/api'
import {useThrottledFilter} from "@/hooks/useThrottledValue";

interface ChecklistFilterPanelProps {
  filters: SectionFilters
  listingTypes: ListingType[]
  onUpdateFilter: (key: keyof SectionFilters, value: any) => void
  onClearFilters: () => void
  onClose: () => void
  sectionsCount: number
  hasActiveFilters: boolean
}


function ChecklistFilterPanel({
  filters,
  listingTypes,
  onUpdateFilter,
  onClearFilters,
  onClose,
  sectionsCount,
  hasActiveFilters
} : ChecklistFilterPanelProps) {
  // Fetch sections data
  const { data: sectionsData } = useQuery({
    queryKey: ['checklist-sections'],
    queryFn: () => ChecklistApi.getSectionsFull(),
  })

  const sections = sectionsData?.checklist_sections || []

  // Parser functions
  const parseSlugs = React.useCallback((value: string) => {
    const slugs = value
      .split(',')
      .map(slug => slug.trim())
      .filter(slug => slug.length > 0)
    return slugs.length > 0 ? slugs : undefined
  }, [])

  // Handle section multi-select
  const handleSectionChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValues = Array.from(e.target.selectedOptions, option => parseInt(option.value))
    onUpdateFilter('id', selectedValues.length > 0 ? selectedValues : undefined)
  }, [onUpdateFilter])

  const [sectionSlugs, setSectionSlugs] = useThrottledFilter(
    filters.slug?.join(',') || '',
    React.useCallback((value) => onUpdateFilter('slug', value), [onUpdateFilter]),
    parseSlugs
  )

  const [listingTypeSlugs, setListingTypeSlugs] = useThrottledFilter(
    filters.listing_type_slug?.join(',') || '',
    React.useCallback((value) => onUpdateFilter('listing_type_slug', value), [onUpdateFilter]),
    parseSlugs
  )

  // Handle listing type multi-select (no throttling needed for select)
  const handleListingTypeChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValues = Array.from(e.target.selectedOptions, option => parseInt(option.value))
    onUpdateFilter('listing_type_id', selectedValues.length > 0 ? selectedValues : undefined)
  }, [onUpdateFilter])

  return (
    <Card className="animate-in fade-in-0 slide-in-from-top-4 duration-150 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Фильтры</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="filter-listing-type">Тип объекта</Label>
            <select
              id="filter-listing-type"
              multiple
              value={filters.listing_type_id?.map(String) || []}
              onChange={handleListingTypeChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px]"
            >
              {listingTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              Hold Ctrl/Cmd to select multiple
            </p>
          </div>

          <div>
            <Label htmlFor="filter-section-ids">Секция</Label>
            <select
              id="filter-section-ids"
              multiple
              value={filters.id?.map(String) || []}
              onChange={handleSectionChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px]"
            >
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.title}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              Удерживайте Ctrl/Cmd для выбора нескольких
            </p>
          </div>

          <div>
            <Label htmlFor="filter-section-slugs">Фильтр по slug секций</Label>
            <Input
              id="filter-section-slugs"
              placeholder="например, section-1,section-2"
              value={sectionSlugs}
              onChange={(e) => setSectionSlugs(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Список slug секций через запятую
            </p>
          </div>

          <div>
            <Label htmlFor="filter-listing-type-slugs">Фильтр по slug типов объектов</Label>
            <Input
              id="filter-listing-type-slugs"
              placeholder="например, hotel,apartment"
              value={listingTypeSlugs}
              onChange={(e) => setListingTypeSlugs(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Список slug типов объектов через запятую
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
          >
            <FilterX className="w-4 h-4 mr-2" />
            Сбросить
          </Button>

          {hasActiveFilters && (
            <div className="text-sm text-muted-foreground ml-auto">
              Найдено {sectionsCount} секци{sectionsCount === 1 ? 'я' : sectionsCount < 5 ? 'и' : 'й'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default React.memo(ChecklistFilterPanel);

