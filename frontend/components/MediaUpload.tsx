"use client";
import * as React from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { UploadsApi } from '@/entities/uploads/api';

interface MediaItem {
  name: string;
  url: string;
  media_type: string;
}

interface MediaUploadProps {
  itemKey: string;
  media: MediaItem[];
  mediaRequirement: string;
  mediaMaxFiles?: number;
  mediaAllowedTypes?: string[];
  disabled: boolean;
  onMediaChange: (key: string, media: MediaItem[]) => void;
  uploadProgress: Record<string, number>;
  onUploadProgressChange: (progress: Record<string, number>) => void;
}

export default function MediaUpload({
  itemKey,
  media,
  mediaRequirement,
  mediaMaxFiles,
  mediaAllowedTypes,
  disabled,
  onMediaChange,
  uploadProgress,
  onUploadProgressChange
}: MediaUploadProps) {
  // Функция сжатия изображений
  const compressImage = async (inputFile: File): Promise<Blob> => {
    try {
      const dataUrl: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(inputFile);
      });

      const img = document.createElement('img');
      const loaded: HTMLImageElement = await new Promise((res, rej) => {
        img.onload = () => res(img);
        img.onerror = rej;
        img.src = dataUrl;
      });

      // Увеличиваем максимальный размер для лучшего качества
      const maxSize = 2560;
      const ratio = Math.min(1, maxSize / Math.max(loaded.width, loaded.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(loaded.width * ratio);
      canvas.height = Math.round(loaded.height * ratio);
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return inputFile;
      
      // Включаем высокое качество сглаживания
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      ctx.drawImage(loaded, 0, 0, canvas.width, canvas.height);
      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.95)
      );

      return blob ?? inputFile;
    } catch {
      return inputFile;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    // Проверяем лимит файлов
    if (mediaMaxFiles && media.length + files.length > mediaMaxFiles) {
      toast.error(`Максимум ${mediaMaxFiles} файлов`);
      return;
    }

    // Загружаем файлы
    for (const file of files) {
      const upKey = `${file.name}-${Date.now()}`;
      onUploadProgressChange({ ...uploadProgress, [upKey]: 1 });

      try {
        // Сжатие изображения
        const compressed = await compressImage(file);
        const contentType = (compressed as Blob).type || file.type || 'image/jpeg';
        const presigned = await UploadsApi.generateUrl({ filename: file.name, content_type: contentType });

        let publicUrl = presigned.public_url;

        if (presigned.method === 'POST' && presigned.form_data) {
          const form = new FormData();
          Object.entries(presigned.form_data).forEach(([k, v]) => form.append(k, String(v)));
          form.append('file', compressed, file.name);

          const response = await fetch(presigned.upload_url, { method: 'POST', body: form });
          const uploadResult = await response.json();

          // Upload completed

          // ImageKit возвращает информацию о загруженном файле в ответе
          if (uploadResult.url) {
            publicUrl = uploadResult.url;
          } else if (uploadResult.filePath) {
            // Если есть filePath, формируем URL
            publicUrl = `https://ik.imagekit.io/lvqrkmlwi${uploadResult.filePath}`;
          }
        } else {
          await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', presigned.upload_url);
            if (presigned.headers) {
              Object.entries(presigned.headers).forEach(([h, v]) => xhr.setRequestHeader(h, v));
            }
            xhr.upload.onprogress = (evt) => {
              if (evt.lengthComputable) {
                const percent = Math.round((evt.loaded / evt.total) * 100);
                onUploadProgressChange({ ...uploadProgress, [upKey]: percent });
              }
            };
            xhr.onerror = () => reject(new Error('upload error'));
            xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(String(xhr.status))));
            xhr.send(compressed);
          });
        }

        // Fallback если URL не получен
        if (!publicUrl) {
          console.warn('No public URL received from upload, using filename as fallback');
          publicUrl = `https://ik.imagekit.io/lvqrkmlwi/placeholder/${file.name}`;
        }

        // Определяем тип медиа по расширению файла
        const mediaType = file.type.startsWith('video/') ? 'video' : 'image';

        onMediaChange(itemKey, [
          ...media,
          { name: file.name, url: publicUrl, media_type: mediaType }
        ]);
      } catch (err) {
        console.error('Upload error:', err);
        toast.error(`Не удалось загрузить ${file.name}`);
      } finally {
        const newProgress = { ...uploadProgress };
        delete newProgress[upKey];
        onUploadProgressChange(newProgress);
      }
    }
  };

  const removeMedia = (index: number) => {
    const newMedia = media.filter((_, i) => i !== index);
    onMediaChange(itemKey, newMedia);
  };

  if (mediaRequirement === 'none') return null;

  // Проверяем, достигнуто ли максимальное количество медиа файлов
  const isMaxFilesReached = mediaMaxFiles && media.length >= mediaMaxFiles;

  return (
    <div>
      <input
        type="file"
        accept={mediaAllowedTypes?.includes('video') ? "image/*,video/*" : "image/*"}
        multiple
        onChange={handleFileUpload}
        disabled={disabled}
        className="hidden"
        id={`file-${itemKey}`}
      />
      {!isMaxFilesReached && (
        <label
          htmlFor={`file-${itemKey}`}
          className={`inline-flex items-center gap-1 px-3 py-1 rounded text-sm cursor-pointer transition-colors duration-200 ${
            mediaRequirement === 'required' 
              ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' 
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {mediaAllowedTypes?.includes('video') 
            ? `Добавить медиа (${media.length}/${mediaMaxFiles})`
            : `Добавить фото (${media.length}/${mediaMaxFiles})`
          }
        </label>
      )}

      {/* Upload Progress Indicator */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="mt-4 space-y-2">
          {Object.entries(uploadProgress).map(([key, progress]) => (
            <div key={key} className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          ))}
        </div>
      )}

      {/* Media Preview */}
      {media.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-3">
          {media.map((mediaItem, idx) => (
            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
              {mediaItem.media_type === 'video' ? (
                <video
                  src={mediaItem.url}
                  className="w-full h-full object-cover"
                  controls
                  preload="metadata"
                />
              ) : (
                <Image
                  src={mediaItem.url}
                  alt={mediaItem.name}
                  fill
                  sizes="(max-width: 768px) 150px, 200px"
                  className="object-cover"
                  quality={95}
                  priority={idx < 2}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                  onError={() => {
                    console.error('Image load error:', mediaItem.url);
                  }}
                />
              )}
              {!disabled && (
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors duration-200"
                  onClick={() => removeMedia(idx)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
