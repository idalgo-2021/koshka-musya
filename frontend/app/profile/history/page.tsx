"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ProfileHistoryPage() {
  const router = useRouter();

  return (
    <main className="max-w-2xl mx-auto px-4 pb-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-3xl shadow-2xl border-0 overflow-hidden hover:shadow-3xl transition-all duration-500"
      >

        <div className="p-8 space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-accenttext text-center"
          >
            История
          </motion.h1>
          
          <div className="space-y-6">
            {/* Empty State */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center py-12"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                className="text-6xl mb-6"
              >
                ✈️
              </motion.div>
              <motion.h3 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-xl font-bold text-gray-700 mb-3"
              >
                Пока нет поездок
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-gray-500 mb-8 leading-relaxed"
              >
                Ваша история поездок будет отображаться здесь после завершения первых заданий.
              </motion.p>
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                onClick={() => router.push('/dashboard')}
                className="bg-gradient-to-r from-accenttext to-accenttext/80 hover:from-accenttext/90 hover:to-accenttext/70 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              >
                Найти задания
              </motion.button>
            </motion.div>

            {/* Example Trip */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="border-t border-gray-200 pt-6"
            >
              <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center">
                <span className="mr-2">📋</span>
                Пример поездки
              </h3>
                <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl p-6 opacity-80 hover:opacity-90 transition-opacity duration-300">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-gray-800 text-lg">Отель &quot;Пример&quot;</h4>
                  <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">Завершено</span>
                </div>
                <p className="text-sm text-gray-600 mb-2 flex items-center">
                  <span className="mr-2">📍</span>
                  Москва, Россия
                </p>
                <p className="text-sm text-gray-500 mb-4 flex items-center">
                  <span className="mr-2">📅</span>
                  Дата: 15-17 января 2024
                </p>
                <div className="flex items-center">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <motion.span 
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1 + i * 0.1 }}
                        className="text-sm drop-shadow-sm"
                      >
                        ★
                      </motion.span>
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600 font-medium">Отличный сервис</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
