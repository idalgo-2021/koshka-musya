"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUserHistory } from "@/entities/auth/useUserHistory";
import { useAuth } from "@/entities/auth/useAuth";
import { useEffect, useState, useMemo } from "react";
import HomeButton from "@/components/HomeButton";

export default function ProfileHistoryPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { entries, loading: historyLoading, error, total } = useUserHistory();
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'title'>('date');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  // Filter and sort entries
  const filteredAndSortedEntries = useMemo(() => {
    let filtered = entries;
    
    // Apply filter
    if (filter !== 'all') {
      filtered = entries.filter(entry => {
        if (filter === 'approved') return entry.status_slug === 'approved';
        if (filter === 'pending') return entry.status_slug !== 'approved' && entry.status_slug !== 'rejected';
        if (filter === 'rejected') return entry.status_slug === 'rejected';
        return true;
      });
    }
    
    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          if (!a?.created_at || !b?.created_at) return 0;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'status':
          const statusOrder = { 'approved': 3, 'pending': 2, 'rejected': 1 };
          return (statusOrder[b.status_slug as keyof typeof statusOrder] || 0) - 
                 (statusOrder[a.status_slug as keyof typeof statusOrder] || 0);
        case 'title':
          return a.listing.title.localeCompare(b.listing.title);
        default:
          return 0;
      }
    });
  }, [entries, filter, sortBy]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'approved':
        return { label: 'Завершено', color: 'bg-green-100 text-green-800', icon: '✅' };
      case 'rejected':
        return { label: 'Отклонено', color: 'bg-red-100 text-red-800', icon: '❌' };
      default:
        return { label: 'В процессе', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' };
    }
  };

  if (authLoading || historyLoading) {
    return (
      <main className="max-w-2xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-3xl shadow-2xl border-0 overflow-hidden">
          <div className="p-8 space-y-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accenttext mx-auto mb-4"></div>
              <p className="text-accenttext">Загрузка истории...</p>
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
                Ошибка загрузки истории
              </h3>
              <p className="text-red-600 mb-4">{error}</p>
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
            <h1 className="text-3xl font-bold mb-2">История поездок</h1>
            <p className="text-white/90 text-lg">
              Всего заданий: <span className="font-semibold">{total}</span>
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
          {entries.length === 0 ? (
            /* Enhanced Empty State */
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center py-16"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                className="text-8xl mb-8"
              >
                🏨
              </motion.div>
              <motion.h3 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-2xl font-bold text-gray-800 mb-4"
              >
                Начните свою историю
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed"
              >
                Выполните первое задание и получите бесплатное проживание в отеле. 
                Ваша история поездок будет отображаться здесь.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="space-y-4"
              >
                <button
                  onClick={() => router.push('/dashboard')}
                  className="bg-gradient-to-r from-accenttext to-accenttext/80 hover:from-accenttext/90 hover:to-accenttext/70 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl text-lg"
                >
                  Найти доступные задания
                </button>
                <p className="text-sm text-gray-500">
                  Получайте бонусы за каждое выполненное задание
                </p>
              </motion.div>
            </motion.div>
          ) : (
            /* Enhanced History with Filters */
            <div className="space-y-6">
              {/* Filter and Sort Controls */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white border border-gray-200 rounded-xl p-4"
              >
                <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
                  {/* Filter Buttons */}
                  <div className="flex flex-wrap gap-1">
                    {[
                      { key: 'all', label: 'Все', count: entries.length },
                      { key: 'approved', label: 'Завершено', count: entries.filter(e => e.status_slug === 'approved').length },
                      { key: 'pending', label: 'В процессе', count: entries.filter(e => e.status_slug !== 'approved' && e.status_slug !== 'rejected').length },
                      { key: 'rejected', label: 'Отклонено', count: entries.filter(e => e.status_slug === 'rejected').length }
                    ].map(({ key, label, count }) => (
                      <button
                        key={key}
                        onClick={() => setFilter(key as any)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                          filter === key
                            ? 'bg-accenttext text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {label} {count > 0 && `(${count})`}
                      </button>
                    ))}
                  </div>
                  
                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Сортировка:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-2 py-1.5 rounded-md border border-gray-200 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-accenttext/20"
                    >
                      <option value="date">По дате</option>
                      <option value="status">По статусу</option>
                      <option value="title">По названию</option>
                    </select>
                  </div>
                </div>
              </motion.div>

              {/* Results Summary */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center"
              >
                <p className="text-gray-600">
                  Показано: <span className="font-semibold text-accenttext">{filteredAndSortedEntries.length}</span> из {total} заданий
                </p>
              </motion.div>
              
              {/* History Entries Grid */}
              <div className="grid gap-4">
                {filteredAndSortedEntries.map((entry, index) => {
                  const statusInfo = getStatusInfo(entry.status_slug);
                  return (
                    <motion.div 
                      key={entry.created_at}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 hover:border-accenttext/30"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 text-lg">{entry.listing.title}</h4>
                          <p className="text-sm text-gray-500">{entry.listing.listing_type.name}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <span className="text-lg">{statusInfo.icon}</span>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                        {entry.listing.address && (
                          <div className="flex items-center">
                            <span className="mr-1">📍</span>
                            <span className="truncate">{entry.listing.address}</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <span className="mr-1">📅</span>
                          <span>{new Date(entry.checkin_date).toLocaleDateString('ru-RU')} - {new Date(entry.checkout_date).toLocaleDateString('ru-RU')}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-1">📝</span>
                          <span>Создано: {new Date(entry.created_at).toLocaleDateString('ru-RU')}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-1">🎯</span>
                          <span className="truncate">{entry.purpose}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              
              {filteredAndSortedEntries.length === 0 && filter !== 'all' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-center py-12"
                >
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">
                    Ничего не найдено
                  </h3>
                  <p className="text-gray-500 mb-4">
                    По выбранному фильтру нет заданий
                  </p>
                  <button
                    onClick={() => setFilter('all')}
                    className="text-accenttext hover:text-accenttext/80 font-medium"
                  >
                    Показать все задания
                  </button>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </main>
  );
}
