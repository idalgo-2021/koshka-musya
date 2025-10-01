"use client";
import { motion } from "framer-motion";

export default function ProfileMemoPage() {
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
            Памятка
          </motion.h1>
          
          <div className="space-y-6">
            {/* Введение о программе */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
            >
              <h3 className="font-bold text-indigo-800 text-lg mb-4 flex items-center">
                <span className="mr-3">🎯</span>
                О программе &quot;Памятка Агента&quot;
              </h3>
              <div className="text-indigo-700 text-sm space-y-3">
                <p className="leading-relaxed">
                  <strong>Секретные гости</strong> проверяют качество обслуживания в отелях и других заведениях. 
                  Вы получаете <strong>бонусы</strong>, а отель — <strong>честную оценку</strong> своего сервиса.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-white/50 rounded-xl p-4">
                    <h4 className="font-semibold text-indigo-800 mb-2 flex items-center">
                      <span className="mr-2">💰</span>
                      Ваша выгода
                    </h4>
                    <ul className="text-sm space-y-1">
                      <li>• Получение бонусов за проверки</li>
                      <li>• Бесплатное проживание в отелях</li>
                      <li>• Опыт работы в сфере гостеприимства</li>
                      <li>• Возможность путешествовать</li>
                    </ul>
                  </div>
                  <div className="bg-white/50 rounded-xl p-4">
                    <h4 className="font-semibold text-indigo-800 mb-2 flex items-center">
                      <span className="mr-2">🏨</span>
                      Польза для отеля
                    </h4>
                    <ul className="text-sm space-y-1">
                      <li>• Честная оценка качества сервиса</li>
                      <li>• Выявление проблем до гостей</li>
                      <li>• Рекомендации по улучшению</li>
                      <li>• Повышение рейтинга и репутации</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
            >
              <h3 className="font-bold text-red-800 text-lg mb-4 flex items-center">
                <span className="mr-3">🚨</span>
                КРИТИЧЕСКИ ВАЖНО
              </h3>
              <ul className="text-red-700 text-sm space-y-3">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2 mt-1">•</span>
                  <span>НИКОГДА не раскрывайте, что вы тайный гость</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2 mt-1">•</span>
                  <span>Ведите себя как обычный постоялец</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2 mt-1">•</span>
                  <span>Не делайте заметки на виду у персонала</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2 mt-1">•</span>
                  <span>Не фотографируйте открыто - используйте скрытую съемку</span>
                </li>
              </ul>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
            >
              <h3 className="font-bold text-blue-800 text-lg mb-4 flex items-center">
                <span className="mr-3">📝</span>
                Подготовка к проверке
              </h3>
              <ul className="text-blue-700 text-sm space-y-3">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 mt-1">•</span>
                  <span>Изучите чек-лист заранее</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 mt-1">•</span>
                  <span>Подготовьте план проверки</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 mt-1">•</span>
                  <span>Зарядите телефон и освободите место для фото</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 mt-1">•</span>
                  <span>Возьмите блокнот для заметок (скрытно)</span>
                </li>
              </ul>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
            >
              <h3 className="font-bold text-green-800 text-lg mb-4 flex items-center">
                <span className="mr-3">✅</span>
                Во время проверки
              </h3>
              <ul className="text-green-700 text-sm space-y-3">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">•</span>
                  <span>Проверяйте все пункты чек-листа последовательно</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">•</span>
                  <span>Делайте фотографии для подтверждения</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">•</span>
                  <span>Записывайте детали сразу (в туалете или номере)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">•</span>
                  <span>Ведите себя естественно и не привлекайте внимание</span>
                </li>
              </ul>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
            >
              <h3 className="font-bold text-yellow-800 text-lg mb-4 flex items-center">
                <span className="mr-3">📊</span>
                Заполнение отчета
              </h3>
              <ul className="text-yellow-700 text-sm space-y-3">
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2 mt-1">•</span>
                  <span>Заполняйте отчет в течение 24 часов</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2 mt-1">•</span>
                  <span>Будьте объективны и честны</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2 mt-1">•</span>
                  <span>Прикрепляйте качественные фотографии</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2 mt-1">•</span>
                  <span>Детально описывайте все наблюдения</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2 mt-1">•</span>
                  <span>После одобрения отчета вы получите бонусы</span>
                </li>
              </ul>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
            >
              <h3 className="font-bold text-purple-800 text-lg mb-4 flex items-center">
                <span className="mr-3">🆘</span>
                Что делать в проблемных ситуациях
              </h3>
              <ul className="text-purple-700 text-sm space-y-3">
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2 mt-1">•</span>
                  <span>Если вас заподозрили - не паникуйте, ведите себя естественно</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2 mt-1">•</span>
                  <span>При конфликтах с персоналом - не раскрывайте свою роль</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2 mt-1">•</span>
                  <span>В экстренных ситуациях - звоните в поддержку</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2 mt-1">•</span>
                  <span>При технических проблемах - делайте скриншоты</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
