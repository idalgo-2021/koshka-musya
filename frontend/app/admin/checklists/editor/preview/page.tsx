"use client"

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import ChecklistContainer from '@/components/ChecklistContainer'
import { ChecklistApi } from '@/entities/checklist/api'
import { ListingsApi } from '@/entities/listings/api'
import type { ChecklistSchema } from '@/entities/reports/types'
import { Loader } from '@/components/Loader'

export default function ChecklistPreviewPage() {
  const router = useRouter()

  const sectionsQuery = useQuery({
    queryKey: ['checklist_sections_full'],
    queryFn: () => ChecklistApi.getSectionsFull(),
  })

  const itemsQuery = useQuery({
    queryKey: ['checklist_items_full'],
    queryFn: () => ChecklistApi.getItemsFull(),
  })

  const listingTypesQuery = useQuery({
    queryKey: ['listing_types'],
    queryFn: () => ListingsApi.getListingTypes(),
  })

  const [expandedSections, setExpandedSections] = React.useState<Set<number>>(new Set())
  const [checks, setChecks] = React.useState<Record<string, boolean | undefined>>({})
  const [ratings, setRatings] = React.useState<Record<string, number>>({})
  const [comments, setComments] = React.useState<Record<string, string>>({})
  const [itemMedia, setItemMedia] = React.useState<Record<string, Array<{ name: string; url: string; media_type: string }>>>({})
  const [disabled] = React.useState(false)
  const [currentStep, setCurrentStep] = React.useState(0)
  const [uploadProgress, setUploadProgress] = React.useState<Record<string, number>>({})

  const [filters, setFilters] = React.useState<{ listing_type_id?: number[] }>({})

  const checklistSchema: ChecklistSchema | null = React.useMemo(() => {
    if (!sectionsQuery.data?.checklist_sections || !itemsQuery.data?.checklist_items) return null

    let filteredSections = sectionsQuery.data.checklist_sections
    if (filters.listing_type_id && filters.listing_type_id.length > 0) {
      filteredSections = sectionsQuery.data.checklist_sections.filter(section =>
        section.listing_type_id && filters.listing_type_id!.includes(section.listing_type_id)
      )
    }

    return {
      version: '1.0',
      sections: filteredSections.map(section => ({
        id: section.id,
        slug: section.slug,
        title: section.title,
        sort_order: section.sort_order,
        items: itemsQuery.data.checklist_items
          .filter(item => item.section.id === section.id)
          .map(item => ({
            id: item.id,
            slug: item.slug,
            title: item.title,
            description: item.description,
            sort_order: item.sort_order,
            answer_types: {
              slug: item.answer_type.slug,
              name: item.answer_type.name,
              meta: item.answer_type.meta
            },
            media_requirement: item.media_requirement.name,
            media_max_files: item.media_max_files,
            media_allowed_types: item.media_allowed_types,
            answer: {
              result: '',
              comment: '',
              media: []
            }
          }))
      }))
    }
  }, [sectionsQuery.data, itemsQuery.data, filters.listing_type_id])

  // Reset currentStep when checklistSchema changes
  React.useEffect(() => {
    if (checklistSchema?.sections && checklistSchema.sections.length > 0) {
      setCurrentStep(0)
    }
  }, [checklistSchema])

  // Navigation functions
  const goToNextStep = React.useCallback(() => {
    if (checklistSchema?.sections && currentStep < checklistSchema.sections.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }, [currentStep, checklistSchema?.sections])

  const goToPreviousStep = React.useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])

  const goToStep = React.useCallback((step: number) => {
    if (checklistSchema?.sections && step >= 0 && step < checklistSchema.sections.length) {
      setCurrentStep(step)
    }
  }, [checklistSchema?.sections])

  // Section toggle functions
  const toggleSection = React.useCallback((sectionId: number) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }, [])

  const expandAllSections = React.useCallback(() => {
    if (checklistSchema?.sections) {
      setExpandedSections(new Set(checklistSchema.sections.map(s => s.id)))
    }
  }, [checklistSchema?.sections])

  const collapseAllSections = React.useCallback(() => {
    setExpandedSections(new Set())
  }, [])

  // Form handlers
  const handleCheckChange = React.useCallback((itemKey: string, checked: boolean) => {
    setChecks(prev => ({ ...prev, [itemKey]: checked }))
  }, [])

  const handleRatingChange = React.useCallback((itemKey: string, rating: number) => {
    setRatings(prev => ({ ...prev, [itemKey]: rating }))
  }, [])

  const handleCommentChange = React.useCallback((itemKey: string, comment: string) => {
    setComments(prev => ({ ...prev, [itemKey]: comment }))
  }, [])

  const handleMediaChange = React.useCallback((itemKey: string, media: Array<{ name: string; url: string; media_type: string }>) => {
    setItemMedia(prev => ({ ...prev, [itemKey]: media }))
  }, [])

  const handleUploadProgressChange = React.useCallback((progress: Record<string, number>) => {
    setUploadProgress(progress)
  }, [])

  // Calculate section progress
  const calculateSectionProgress = React.useCallback((sectionId: number) => {
    if (!checklistSchema?.sections) return 0

    const section = checklistSchema.sections.find(s => s.id === sectionId)
    if (!section) return 0

    const totalItems = section.items.length
    if (totalItems === 0) return 100

    let completedItems = 0
    section.items.forEach(item => {
      const itemKey = `${sectionId}-${item.id}`
      const hasCheck = checks[itemKey] !== undefined
      const hasRating = ratings[itemKey] !== undefined
      const hasComment = comments[itemKey] && comments[itemKey].trim() !== ''
      const hasMedia = itemMedia[itemKey] && itemMedia[itemKey].length > 0

      // Consider item completed if it has at least one form of input
      if (hasCheck || hasRating || hasComment || hasMedia) {
        completedItems++
      }
    })

    return Math.round((completedItems / totalItems) * 100)
  }, [checklistSchema?.sections, checks, ratings, comments, itemMedia])
  const onBack = React.useCallback(() => router.push('/admin/checklists/editor'), [router]);

  if (sectionsQuery.isLoading || itemsQuery.isLoading || listingTypesQuery.isLoading) {
    return (
      <Loader />
    );
  }

  if (sectionsQuery.isError || itemsQuery.isError || listingTypesQuery.isError || !checklistSchema) {
    return (
      <div className="container max-w-4xl py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Ошибка загрузки</h1>
          <p className="text-gray-600 mb-4">Не удалось загрузить схему чек-листа</p>
          <Button onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Предварительный просмотр</h1>
          <p className="text-gray-600">Просмотр формы как её увидят пользователи</p>
        </div>
      </div>

      {/* Listing Type Filter */}
      {listingTypesQuery.data?.listing_types ? (
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={!filters.listing_type_id ? "default" : "ghost"}
            size="sm"
            onClick={() => {
              const newFilters = {...filters}
              delete newFilters.listing_type_id
              setFilters(newFilters)
            }}
          >
            Все
          </Button>
          {listingTypesQuery.data.listing_types.map((type) => (
            <Button
              key={type.id}
              variant={filters.listing_type_id?.includes(type.id) ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                const currentTypes = filters.listing_type_id || []
                const isSelected = currentTypes.includes(type.id)

                setFilters({
                  ...filters,
                  listing_type_id: isSelected ? undefined : [type.id]
                })
              }}
            >
              {type.name}
            </Button>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
          >
          </Button>
        </div>
      )}

      {/* Checklist Form */}
      {checklistSchema?.sections && checklistSchema.sections.length > 0 ? (
        <ChecklistContainer
          checklistSchema={checklistSchema}
          expandedSections={expandedSections}
          checks={checks}
          ratings={ratings}
          comments={comments}
          itemMedia={itemMedia}
          disabled={disabled}
          currentStep={currentStep}
          onToggleSection={toggleSection}
          onExpandAllSections={expandAllSections}
          onCollapseAllSections={collapseAllSections}
          onCheckChange={handleCheckChange}
          onRatingChange={handleRatingChange}
          onCommentChange={handleCommentChange}
          onMediaChange={handleMediaChange}
          uploadProgress={uploadProgress}
          onUploadProgressChange={handleUploadProgressChange}
          calculateSectionProgress={calculateSectionProgress}
          onNextStep={goToNextStep}
          onPreviousStep={goToPreviousStep}
          onGoToStep={goToStep}
        />
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600">Нет секций для отображения</p>
        </div>
      )}
    </div>
  )
}
