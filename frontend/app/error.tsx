"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  React.useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-accentgreen flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border-0 overflow-hidden">
        <div className="relative">
          {/* Header Section with Gradient */}
          <div className="h-32 relative overflow-hidden bg-gradient-to-br from-red-100 to-orange-200">
            {/* Decorative pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-orange-500/10"></div>
            
            {/* Icon overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-xl">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 space-y-4">
            {/* Main Message */}
            <div className="space-y-3">
              <h1 className="text-xl font-bold text-gray-900 text-center">
                Сайт скоро возобновит работы
              </h1>
              <p className="text-gray-600 text-center text-sm">
                Что-то пошло не так. Попробуйте обновить страницу или повторить попытку.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button 
                onClick={() => window.location.reload()}
                className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Обновить
              </Button>
              <Button 
                onClick={reset}
                className="flex-1 h-12 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Повторить попытку
              </Button>
            </div>

            {/* Error Code */}
            {error?.digest && (
              <div className="text-center pt-2">
                <p className="text-xs text-gray-400">Код ошибки: {error.digest}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
