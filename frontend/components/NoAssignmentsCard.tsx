"use client";

import Image from 'next/image';

export default function NoAssignmentsCard() {

  return (
    <div className="bg-white rounded-3xl shadow-2xl border-0 overflow-hidden hover:shadow-3xl transition-all duration-300 hover:scale-[1.02] group">
      <div className="relative">
        {/* Header Section with Animated Gradient */}
        <div className="h-40 relative overflow-hidden bg-gradient-to-br from-accentgreen/20 via-accenttext/10 to-accentgreen/30">
          {/* Animated background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-accenttext/5 via-transparent to-accentgreen/10 animate-pulse"></div>
          
          
          {/* Main icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Outer ring */}
              <div className="w-24 h-24 bg-gradient-to-br from-accentgreen to-accenttext/20 rounded-full flex items-center justify-center shadow-xl animate-pulse overflow-hidden">
                {/* Cat image */}
                <Image
                  src="/chill.jpg"
                  alt="Котик"
                  width={192}
                  height={192}
                  className="w-full h-full object-cover rounded-full"
                  quality={100}
                  priority
                  sizes="(max-width: 768px) 96px, 192px"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 space-y-6">
          {/* Main Message */}
          <div className="text-center space-y-4">
            <h3 className="text-xl font-bold text-gray-900 whitespace-nowrap text-center">У Вас нет доступных предложений</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Предложения появятся в ближайшее время
            </p>
          </div>


          {/* Action Buttons */}
          <div className="flex justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-accenttext to-accenttext/80 hover:from-accenttext/90 hover:to-accenttext/70 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Обновить</span>
              </div>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
