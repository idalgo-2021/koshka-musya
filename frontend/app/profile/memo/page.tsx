"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import HomeButton from "@/components/HomeButton";

export default function ProfileMemoPage() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    program: false,
    critical: false,
    preparation: false,
    during: false,
    report: false,
    problems: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
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
            <h1 className="text-3xl font-bold mb-2">Памятка</h1>
            <p className="text-white/90 text-lg">
              Руководство для тайных гостей
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
            {/* Введение о программе */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 hover:border-accenttext/30"
            >
              <button
                onClick={() => toggleSection('program')}
                className="w-full flex items-center justify-between gap-2 mb-3 text-left"
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-800 text-lg">О программе &quot;Памятка Агента&quot;</h3>
                </div>
                <motion.span
                  animate={{ rotate: expandedSections.program ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-accenttext"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9,18 15,12 9,6"></polyline>
                  </svg>
                </motion.span>
              </button>
              <AnimatePresence>
                {expandedSections.program && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      <strong>Секретные гости</strong> проверяют качество обслуживания в отелях и других заведениях. 
                      Вы получаете <strong>бонусы</strong>, а отель — <strong>честную оценку</strong> своего сервиса.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <h4 className="font-semibold text-gray-800 mb-2">
                          Ваша выгода
                        </h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Получение бонусов за проверки</li>
                          <li>• Бесплатное проживание в отелях</li>
                          <li>• Опыт работы в сфере гостеприимства</li>
                          <li>• Возможность путешествовать</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <h4 className="font-semibold text-gray-800 mb-2">
                          Польза для отеля
                        </h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Честная оценка качества сервиса</li>
                          <li>• Выявление проблем до гостей</li>
                          <li>• Рекомендации по улучшению</li>
                          <li>• Повышение рейтинга и репутации</li>
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 hover:border-accenttext/30"
            >
              <button
                onClick={() => toggleSection('critical')}
                className="w-full flex items-center justify-between gap-2 mb-3 text-left"
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-800 text-lg">КРИТИЧЕСКИ ВАЖНО</h3>
                </div>
                <motion.span
                  animate={{ rotate: expandedSections.critical ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-accenttext"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9,18 15,12 9,6"></polyline>
                  </svg>
                </motion.span>
              </button>
              <AnimatePresence>
                {expandedSections.critical && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <ul className="text-gray-600 text-sm space-y-2">
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
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 hover:border-accenttext/30"
            >
              <button
                onClick={() => toggleSection('preparation')}
                className="w-full flex items-center justify-between gap-2 mb-3 text-left"
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-800 text-lg">Подготовка к проверке</h3>
                </div>
                <motion.span
                  animate={{ rotate: expandedSections.preparation ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-accenttext"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9,18 15,12 9,6"></polyline>
                  </svg>
                </motion.span>
              </button>
              <AnimatePresence>
                {expandedSections.preparation && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <ul className="text-gray-600 text-sm space-y-2">
                      <li className="flex items-start">
                        <span className="text-accenttext mr-2 mt-1">•</span>
                        <span>Изучите чек-лист заранее</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-accenttext mr-2 mt-1">•</span>
                        <span>Подготовьте план проверки</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-accenttext mr-2 mt-1">•</span>
                        <span>Зарядите телефон и освободите место для фото</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-accenttext mr-2 mt-1">•</span>
                        <span>Возьмите блокнот для заметок (скрытно)</span>
                      </li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 hover:border-accenttext/30"
            >
              <button
                onClick={() => toggleSection('during')}
                className="w-full flex items-center justify-between gap-2 mb-3 text-left"
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-800 text-lg">Во время проверки</h3>
                </div>
                <motion.span
                  animate={{ rotate: expandedSections.during ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-accenttext"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9,18 15,12 9,6"></polyline>
                  </svg>
                </motion.span>
              </button>
              <AnimatePresence>
                {expandedSections.during && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <ul className="text-gray-600 text-sm space-y-2">
                      <li className="flex items-start">
                        <span className="text-accenttext mr-2 mt-1">•</span>
                        <span>Проверяйте все пункты чек-листа последовательно</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-accenttext mr-2 mt-1">•</span>
                        <span>Делайте фотографии для подтверждения</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-accenttext mr-2 mt-1">•</span>
                        <span>Записывайте детали сразу (в туалете или номере)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-accenttext mr-2 mt-1">•</span>
                        <span>Ведите себя естественно и не привлекайте внимание</span>
                      </li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 hover:border-accenttext/30"
            >
              <button
                onClick={() => toggleSection('report')}
                className="w-full flex items-center justify-between gap-2 mb-3 text-left"
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-800 text-lg">Заполнение отчета</h3>
                </div>
                <motion.span
                  animate={{ rotate: expandedSections.report ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-accenttext"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9,18 15,12 9,6"></polyline>
                  </svg>
                </motion.span>
              </button>
              <AnimatePresence>
                {expandedSections.report && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <ul className="text-gray-600 text-sm space-y-2">
                      <li className="flex items-start">
                        <span className="text-accenttext mr-2 mt-1">•</span>
                        <span>Заполняйте отчет в течение 24 часов</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-accenttext mr-2 mt-1">•</span>
                        <span>Будьте объективны и честны</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-accenttext mr-2 mt-1">•</span>
                        <span>Прикрепляйте качественные фотографии</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-accenttext mr-2 mt-1">•</span>
                        <span>Детально описывайте все наблюдения</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-accenttext mr-2 mt-1">•</span>
                        <span>После одобрения отчета вы получите бонусы</span>
                      </li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 hover:border-accenttext/30"
            >
              <button
                onClick={() => toggleSection('problems')}
                className="w-full flex items-center justify-between gap-2 mb-3 text-left"
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-800 text-lg">Что делать в проблемных ситуациях</h3>
                </div>
                <motion.span
                  animate={{ rotate: expandedSections.problems ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-accenttext"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9,18 15,12 9,6"></polyline>
                  </svg>
                </motion.span>
              </button>
              <AnimatePresence>
                {expandedSections.problems && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <ul className="text-gray-600 text-sm space-y-2">
                      <li className="flex items-start">
                        <span className="text-accenttext mr-2 mt-1">•</span>
                        <span>Если вас заподозрили - не паникуйте, ведите себя естественно</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-accenttext mr-2 mt-1">•</span>
                        <span>При конфликтах с персоналом - не раскрывайте свою роль</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-accenttext mr-2 mt-1">•</span>
                        <span>В экстренных ситуациях - звоните в поддержку</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-accenttext mr-2 mt-1">•</span>
                        <span>При технических проблемах - делайте скриншоты</span>
                      </li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
