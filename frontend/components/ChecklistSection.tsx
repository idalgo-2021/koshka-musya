"use client";
import * as React from 'react';
import ChecklistItem from './ChecklistItem';

interface MediaItem {
  name: string;
  url: string;
  media_type: string;
}

interface ChecklistSectionProps {
  section: {
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
  };
  index: number;
  isExpanded: boolean;
  sectionProgress: number;
  checks: Record<string, boolean | undefined>;
  ratings: Record<string, number>;
  comments: Record<string, string>;
  itemMedia: Record<string, MediaItem[]>;
  disabled: boolean;
  onToggleSection: (sectionId: number) => void;
  onCheckChange: (key: string, value: boolean) => void;
  onRatingChange: (key: string, value: number) => void;
  onCommentChange: (key: string, value: string) => void;
  onMediaChange: (key: string, media: MediaItem[]) => void;
  uploadProgress: Record<string, number>;
  onUploadProgressChange: (progress: Record<string, number>) => void;
}

export default function ChecklistSection({
  section,
  index,
  isExpanded,
  sectionProgress,
  checks,
  ratings,
  comments,
  itemMedia,
  disabled,
  onToggleSection,
  onCheckChange,
  onRatingChange,
  onCommentChange,
  onMediaChange,
  uploadProgress,
  onUploadProgressChange
}: ChecklistSectionProps) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Section Header */}
      <div
        className="p-3 sm:p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
        onClick={() => onToggleSection(section.id)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-blue-600">{index + 1}</span>
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-gray-900">{section.title}</h3>
            {sectionProgress > 0 && (
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-12 sm:w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${sectionProgress}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">{sectionProgress}%</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {section.items?.length ? (
              <span className="text-xs sm:text-sm text-gray-500">
                {section.items?.length} {section.items?.length === 1 ? 'пункт' : 'пунктов'}
              </span>
            ) : (
              <span className="text-xs sm:text-sm text-gray-500">
                0
              </span>
            )}
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Section Content */}
      {isExpanded && (
        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
          {section.items.map((item) => {
            const key = `item_${item.id}`;
            const checked = checks[key];
            const rating = ratings[key] ?? 0;
            const comment = comments[key] ?? '';
            const media = itemMedia[key] || [];

            return (
              <ChecklistItem
                key={key}
                item={item}
                checked={checked}
                rating={rating}
                comment={comment}
                media={media}
                disabled={disabled}
                onCheckChange={onCheckChange}
                onRatingChange={onRatingChange}
                onCommentChange={onCommentChange}
                onMediaChange={onMediaChange}
                uploadProgress={uploadProgress}
                onUploadProgressChange={onUploadProgressChange}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
