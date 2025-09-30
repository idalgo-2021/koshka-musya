"use client";
import { motion } from "framer-motion";

export default function ProfileStatusPage() {
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
            Статус участия
          </motion.h1>
          
          <div className="space-y-6">
            {/* Status Card */}
             <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.4 }}
               className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 mb-8"
             >
               <div className="flex items-center mb-3">
                 <span className="text-green-800 font-bold text-lg">Активный участник</span>
               </div>
               <p className="text-green-700 text-sm leading-relaxed">
                 Ваш аккаунт активен и вы можете принимать участие в программе тайных гостей.
               </p>
             </motion.div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-blue-800 text-lg">Принятые задания</h3>
                  <span className="text-2xl">📋</span>
                </div>
                <motion.p 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                  className="text-4xl font-bold text-blue-600 mb-1"
                >
                  0
                </motion.p>
                <p className="text-blue-600 text-sm font-medium">всего</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-blue-800 text-lg">Завершенные отчеты</h3>
                  <span className="text-2xl">✅</span>
                </div>
                <motion.p 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                  className="text-4xl font-bold text-blue-600 mb-1"
                >
                  0
                </motion.p>
                <p className="text-blue-600 text-sm font-medium">всего</p>
              </motion.div>
            </div>

            {/* Rating Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-yellow-800 text-lg">Рейтинг качества</h3>
                <span className="text-2xl">⭐</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <motion.span 
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.9 + i * 0.1 }}
                      className="text-2xl drop-shadow-sm"
                    >
                      ★
                    </motion.span>
                  ))}
                </div>
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="text-yellow-700 font-semibold"
                >
                  Новый участник
                </motion.span>
              </div>
            </motion.div>

          </div>
        </div>
      </motion.div>
    </main>
  );
}
