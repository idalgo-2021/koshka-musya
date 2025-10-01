"use client";
import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ChecklistSection from './ChecklistSection';

interface MediaItem {
  name: string;
  url: string;
  media_type: string;
}

interface ChecklistContainerProps {
  checklistSchema: {
    sections: Array<{
      id: number;
      title: string;
      items: Array<{
        id: number;
        title: string;
        description?: string;
        answer_types: {
          slug: string;
          meta?: unknown;
        };
        media_requirement: string;
        media_max_files?: number;
        media_allowed_types?: string[];
      }>;
    }>;
  } | null;
  expandedSections: Set<number>;
  checks: Record<string, boolean | undefined>;
  ratings: Record<string, number>;
  comments: Record<string, string>;
  itemMedia: Record<string, MediaItem[]>;
  disabled: boolean;
  currentStep: number;
  onToggleSection: (sectionId: number) => void;
  onExpandAllSections: () => void;
  onCollapseAllSections: () => void;
  onCheckChange: (key: string, value: boolean) => void;
  onRatingChange: (key: string, value: number) => void;
  onCommentChange: (key: string, value: string) => void;
  onMediaChange: (key: string, media: MediaItem[]) => void;
  uploadProgress: Record<string, number>;
  onUploadProgressChange: (progress: Record<string, number>) => void;
  calculateSectionProgress: (sectionId: number) => number;
  onNextStep: () => void;
  onPreviousStep: () => void;
  onGoToStep: (stepIndex: number) => void;
}

export default function ChecklistContainer({
  checklistSchema,
  checks,
  ratings,
  comments,
  itemMedia,
  disabled,
  currentStep,
  onToggleSection,
  onCheckChange,
  onRatingChange,
  onCommentChange,
  onMediaChange,
  uploadProgress,
  onUploadProgressChange,
  calculateSectionProgress,
  onNextStep,
  onPreviousStep,
  onGoToStep
}: ChecklistContainerProps) {
  if (!checklistSchema || !checklistSchema.sections || checklistSchema.sections.length === 0) {
    return (
      <Card className="bg-white border-0 rounded-2xl shadow-xl mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Генерация чек-листа...</p>
            <p className="text-sm text-gray-400 mt-2">Пожалуйста, подождите</p>
            {checklistSchema && checklistSchema.sections && checklistSchema.sections.length === 0 && (
              <p className="text-sm text-orange-500 mt-2">Схема пустая, ожидаем загрузки данных</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentSection = checklistSchema.sections[currentStep];
  const totalSteps = checklistSchema.sections.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <Card className="bg-white border-0 rounded-2xl shadow-xl mb-6">
      <CardContent className="p-4 sm:p-6">
        {/* Header with step indicator */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Чек-лист проверки</h2>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                disabled 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {disabled ? 'Отправлен' : 'Черновик'}
              </span>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              Шаг {currentStep + 1} из {totalSteps}
            </span>
          </div>
        </div>

        {/* Step progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Прогресс по шагам</span>
            <span className="text-sm text-gray-500">{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step navigation dots */}
        <div className="flex justify-center mb-6">
          <div className="flex space-x-2">
            {checklistSchema.sections.map((_, index) => (
              <button
                key={index}
                onClick={() => onGoToStep(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-green-600'
                    : index < currentStep
                    ? 'bg-green-300'
                    : 'bg-gray-300'
                }`}
                disabled={disabled}
              />
            ))}
          </div>
        </div>

        {/* Current section */}
        {currentSection && (
          <div className="space-y-4">
            <ChecklistSection
              key={String(currentSection.id)}
              section={currentSection}
              index={currentStep}
              isExpanded={true} // Always expanded in step mode
              sectionProgress={calculateSectionProgress(currentSection.id)}
              checks={checks}
              ratings={ratings}
              comments={comments}
              itemMedia={itemMedia}
              disabled={disabled}
              onToggleSection={onToggleSection}
              onCheckChange={onCheckChange}
              onRatingChange={onRatingChange}
              onCommentChange={onCommentChange}
              onMediaChange={onMediaChange}
              uploadProgress={uploadProgress}
              onUploadProgressChange={onUploadProgressChange}
            />
          </div>
        )}

        {/* Step navigation buttons */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <Button
            onClick={onPreviousStep}
            variant="outline"
            disabled={isFirstStep || disabled}
            className="flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Назад
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {currentSection?.title}
            </span>
          </div>

          <Button
            onClick={onNextStep}
            disabled={isLastStep || disabled}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            Далее
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
