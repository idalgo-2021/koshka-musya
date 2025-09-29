"use client";
import * as React from 'react';

interface UploadProgressIndicatorProps {
  uploadProgress: Record<string, number>;
}

export default function UploadProgressIndicator({ uploadProgress }: UploadProgressIndicatorProps) {
  if (Object.keys(uploadProgress).length === 0) return null;

  return (
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
  );
}
