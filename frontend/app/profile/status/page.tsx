"use client";
import { motion } from "framer-motion";
import { useUserProfile } from "@/entities/auth/useUserProfile";
import { useAuth } from "@/entities/auth/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import HomeButton from "@/components/HomeButton";

export default function ProfileStatusPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, error } = useUserProfile();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || profileLoading) {
    return (
      <main className="max-w-2xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-3xl shadow-2xl border-0 overflow-hidden">
          <div className="p-8 space-y-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accenttext mx-auto mb-4"></div>
              <p className="text-accenttext">Загрузка...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-2xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-3xl shadow-2xl border-0 overflow-hidden">
          <div className="p-8 space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Ошибка загрузки профиля
              </h3>
              <p className="text-red-600 mb-4">{error}</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="max-w-2xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-3xl shadow-2xl border-0 overflow-hidden">
          <div className="p-8 space-y-6">
            <div className="text-center">
              <p className="text-gray-600">Профиль не найден</p>
            </div>
          </div>
        </div>
      </main>
    );
  }
  return (
    <main className="max-w-4xl mx-auto px-4 pb-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-3xl shadow-2xl border-0 overflow-hidden"
      >
        {/* Header Section */}
        <div className="bg-gradient-to-r from-accenttext to-accenttext/80 p-8 text-white relative">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-3xl font-bold mb-2">Статус участия</h1>
            <p className="text-white/90 text-lg">
              Ваша активность в программе
            </p>
          </motion.div>
          
          {/* Home Button - Desktop */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="absolute top-6 right-6 hidden md:block"
          >
            <HomeButton variant="floating" size="sm" />
          </motion.div>
          
          {/* Home Button - Mobile White */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="absolute top-6 right-6 md:hidden"
          >
            <HomeButton variant="mobile-white" size="sm" />
          </motion.div>
        </div>

        <div className="p-8">
          
          <div className="space-y-4">
            {/* Status Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 hover:border-accenttext/30"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">✅</span>
                    <h3 className="font-bold text-gray-800 text-lg">Активный участник</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Ваш аккаунт активен и вы можете принимать участие в программе тайных гостей.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 hover:border-accenttext/30"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">📋</span>
                      <h3 className="font-bold text-gray-800 text-lg">Принятые задания</h3>
                    </div>
                    <div className="text-3xl font-bold text-accenttext mb-1">
                      {profile.accepted_offers_count}
                    </div>
                    <p className="text-gray-500 text-sm">всего</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 hover:border-accenttext/30"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">✅</span>
                      <h3 className="font-bold text-gray-800 text-lg">Завершенные отчеты</h3>
                    </div>
                    <div className="text-3xl font-bold text-accenttext mb-1">
                      {profile.correct_reports_count}
                    </div>
                    <p className="text-gray-500 text-sm">всего</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Rating Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 hover:border-accenttext/30"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">⭐</span>
                    <h3 className="font-bold text-gray-800 text-lg">Рейтинг</h3>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <motion.span 
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.9 + i * 0.1 }}
                          className={`text-lg ${i < Math.min(5, Math.floor(profile.points / 20)) ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          ★
                        </motion.span>
                      ))}
                    </div>
                    <span className="text-accenttext font-semibold text-lg">
                      {profile.rank}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm">
                    {profile.points} очков
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
