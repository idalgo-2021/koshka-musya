"use client";
import * as React from 'react';
import { Button } from '@/components/ui/button';

interface ReportActionsProps {
  disabled: boolean;
  saving: boolean;
  isPendingRefuse: boolean;
  progress: number;
  onRefuse: VoidFunction;
  onSave: () => void;
  onComplete: () => void;
}

export default function ReportActions({
  disabled,
  saving,
  progress,
  isPendingRefuse,
  onSave,
  onRefuse,
  onComplete
}: ReportActionsProps) {
  return (
    <>
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-6 sm:mt-8">
        <Button
          onClick={onRefuse}
          disabled={disabled || saving || isPendingRefuse}
          variant="outline"
          className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isPendingRefuse ? 'Отказывается...' : 'Отказаться'}
        </Button>
        {/* Save Button */}
        <Button
          onClick={onSave}
          disabled={disabled || saving}
          variant="outline"
          className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {saving ? 'Сохранение...' : 'Сохранить'}
        </Button>

        {/* Complete Button */}
        <Button
          onClick={onComplete}
          disabled={disabled}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {disabled ? 'Отчёт завершён' : 'Завершить'}
        </Button>
      </div>

      {/* Progress Info */}
      {progress < 100 && !disabled && (
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">
            Для отправки отчёта необходимо заполнить все обязательные поля ({progress}% готово)
          </p>
        </div>
      )}
    </>
  );
}
