"use client";
import * as React from 'react';
import MediaUpload from './MediaUpload';

interface MediaItem {
  name: string;
  url: string;
  media_type: string;
}

interface ChecklistItemProps {
  item: {
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
  };
  checked: boolean | undefined;
  rating: number;
  comment: string;
  media: MediaItem[];
  disabled: boolean;
  onCheckChange: (key: string, value: boolean) => void;
  onRatingChange: (key: string, value: number) => void;
  onCommentChange: (key: string, value: string) => void;
  onMediaChange: (key: string, media: MediaItem[]) => void;
  uploadProgress: Record<string, number>;
  onUploadProgressChange: (progress: Record<string, number>) => void;
}

export default function ChecklistItem({
  item,
  checked,
  rating,
  comment,
  media,
  disabled,
  onCheckChange,
  onRatingChange,
  onCommentChange,
  onMediaChange,
  uploadProgress,
  onUploadProgressChange
}: ChecklistItemProps) {
  const key = `item_${item.id}`;

  // Функция для парсинга meta данных answer_types
  const parseAnswerTypeMeta = (meta: unknown): { min: number; max: number } => {
    try {
      const parsed = typeof meta === 'string' ? JSON.parse(meta) : meta;
      return {
        min: parsed?.min || 1,
        max: parsed?.max || 5
      };
    } catch (e) {
      console.warn('Failed to parse answer_types meta:', e);
      return { min: 1, max: 5 };
    }
  };

  // Функция для определения размера кнопок рейтинга
  const getRatingButtonSize = (max: number): { size: string; textSize: string } => {
    if (max <= 3) return { size: 'w-10 h-10', textSize: 'text-sm' };
    if (max <= 5) return { size: 'w-8 h-8', textSize: '' };
    if (max <= 7) return { size: 'w-7 h-7', textSize: 'text-xs' };
    return { size: 'w-6 h-6', textSize: 'text-xs' };
  };

  return (
    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
      {/* Question */}
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-900 cursor-pointer">
            {item.title}
          </label>
          {item.description && !item.answer_types.slug.startsWith('rating_') && (
            <p className="text-xs text-gray-600 mt-1">
              {item.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1">
            {item.media_requirement === 'required' && item.media_max_files && (
              <span className="text-xs text-orange-600">
                📷 Требуется {item.media_max_files} {item.media_allowed_types?.includes('video') ? 'медиа' : 'фото'}
              </span>
            )}
            {item.media_requirement === 'optional' && item.media_max_files && (
              <span className="text-xs text-gray-500">
                📷 Можно добавить до {item.media_max_files} {item.media_allowed_types?.includes('video') ? 'медиа' : 'фото'} (не обязательно)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Boolean Answer - кнопки Да/Нет */}
      {item.answer_types.slug === 'boolean' && (
        <>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs sm:text-sm text-gray-600">Ответ:</span>
            <div className="flex gap-1 sm:gap-2">
              <button
                type="button"
                className={`px-3 py-1 rounded border transition-all duration-200 text-sm ${
                  checked === true
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-white border-gray-300 text-gray-600 hover:border-blue-300'
                }`}
                onClick={() => onCheckChange(key, true)}
                disabled={disabled}
              >
                Да
              </button>
              <button
                type="button"
                className={`px-3 py-1 rounded border transition-all duration-200 text-sm ${
                  checked === false
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-white border-gray-300 text-gray-600 hover:border-blue-300'
                }`}
                onClick={() => onCheckChange(key, false)}
                disabled={disabled}
              >
                Нет
              </button>
            </div>
          </div>
          {(checked === true || checked === false) && (
            <div>
              <textarea
                value={comment}
                onChange={(e) => onCommentChange(key, e.target.value)}
                placeholder={checked === true ? "Комментарий..." : "Комментарий.."}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                disabled={disabled}
              />
            </div>
          )}
        </>
      )}

      {/* Rating - динамический на основе meta */}
      {item.answer_types.slug.startsWith('rating_') && (() => {
        const {min, max} = parseAnswerTypeMeta(item.answer_types.meta);
        const ratingRange = Array.from({length: max - min + 1}, (_, i) => min + i);
        const {size: buttonSize, textSize} = getRatingButtonSize(max);

        return (
          <>
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-xs sm:text-sm text-gray-600">
                Оценка ({min}-{max}):
              </span>
              {ratingRange.map(n => (
                <button
                  key={n}
                  type="button"
                  className={`${buttonSize} rounded-full border-2 transition-all duration-200 ${textSize} ${
                    rating >= n
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-white border-gray-300 text-gray-400 hover:border-blue-300'
                  }`}
                  onClick={() => onRatingChange(key, n)}
                  disabled={disabled}
                >
                  {n}
                </button>
              ))}
            </div>
            {rating > 0 && (
              <div>
                <textarea
                  value={comment}
                  onChange={(e) => onCommentChange(key, e.target.value)}
                  placeholder="Комментарий к оценке..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  disabled={disabled}
                />
              </div>
            )}
          </>
        );
      })()}

      {/* Text Answer */}
      {item.answer_types.slug === 'text' && (
        <div>
          <textarea
            value={comment}
            onChange={(e) => onCommentChange(key, e.target.value)}
            placeholder="Введите ответ..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
            disabled={disabled}
          />
        </div>
      )}

      {/* Media Upload */}
      <MediaUpload
        itemKey={key}
        media={media}
        mediaRequirement={item.media_requirement}
        mediaMaxFiles={item.media_max_files}
        mediaAllowedTypes={item.media_allowed_types}
        disabled={disabled}
        onMediaChange={onMediaChange}
        uploadProgress={uploadProgress}
        onUploadProgressChange={onUploadProgressChange}
      />
    </div>
  );
}
