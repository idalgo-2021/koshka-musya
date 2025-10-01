"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { profilesApi, type UserFilters } from "@/shared/api/profiles";
import { listingTypesApi, type ListingType } from "@/shared/api/listing-types";
import { toast } from "sonner";

export default function FiltersPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<UserFilters>({
    city: "",
    propertyTypes: [],
    budget: "",
    dates: {
      start: "",
      end: ""
    },
    preferences: []
  });

  const [listingTypes, setListingTypes] = useState<ListingType[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const preferences = [
    "Люкс-класс",
    "Бизнес-класс", 
    "Эконом-класс",
    "Семейные объекты",
    "Романтические места",
    "Деловые центры"
  ];

  // Загружаем данные из БД при монтировании компонента
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Загружаем существующие фильтры пользователя
        const existingFilters = await profilesApi.getFilters();
        if (existingFilters) {
          setFilters(existingFilters);
        }

        // Загружаем типы объектов и города из БД
        const [types, citiesData] = await Promise.all([
          listingTypesApi.getListingTypes(),
          listingTypesApi.getCities()
        ]);

        setListingTypes(types);
        setCities(citiesData);
      } catch (error) {
        console.error('Failed to load data:', error);
        toast.error('Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handlePropertyTypeChange = (type: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      propertyTypes: checked 
        ? [...(prev.propertyTypes || []), type]
        : (prev.propertyTypes || []).filter(t => t !== type)
    }));
  };

  const handlePreferenceChange = (preference: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      preferences: checked 
        ? [...(prev.preferences || []), preference]
        : (prev.preferences || []).filter(p => p !== preference)
    }));
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      
      // Сохраняем фильтры в БД
      await profilesApi.updateFilters(filters);
      
      // Также сохраняем в localStorage для совместимости
      localStorage.setItem('userFilters', JSON.stringify(filters));
      
      toast.success('Фильтры сохранены!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to save filters:', error);
      toast.error('Ошибка сохранения фильтров');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-accentgreen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accentgreen">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl shadow-2xl border-0 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <span className="text-3xl">🎯</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-bold text-white mb-2"
            >
              УСТАНОВИТЬ
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-white/90 text-lg"
            >
              критерии фильтра для подбора
            </motion.p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* Город */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-3"
            >
              <label className="block text-sm font-semibold text-gray-700">
                Город
              </label>
              <select
                value={filters.city || ""}
                onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                disabled={loading}
              >
                <option value="">Выберите город</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </motion.div>

            {/* Типы объектов */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-3"
            >
              <label className="block text-sm font-semibold text-gray-700">
                Типы объектов
              </label>
              <div className="grid grid-cols-2 gap-3">
                {listingTypes.map((type, index) => (
                  <motion.label
                    key={type.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={filters.propertyTypes?.includes(type.name) || false}
                      onChange={(e) => handlePropertyTypeChange(type.name, e.target.checked)}
                      className="mr-3 w-4 h-4 text-orange-600 focus:ring-orange-500 rounded"
                      disabled={loading}
                    />
                    <span className="text-sm font-medium text-gray-700">{type.name}</span>
                  </motion.label>
                ))}
              </div>
            </motion.div>

            {/* Бюджет */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              className="space-y-3"
            >
              <label className="block text-sm font-semibold text-gray-700">
                Бюджет
              </label>
              <select
                value={filters.budget}
                onChange={(e) => setFilters(prev => ({ ...prev, budget: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              >
                <option value="">Выберите бюджет</option>
                <option value="low">Эконом (до 2000₽)</option>
                <option value="medium">Средний (2000-5000₽)</option>
                <option value="high">Высокий (5000₽+)</option>
              </select>
            </motion.div>

            {/* Даты */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 }}
              className="space-y-3"
            >
              <label className="block text-sm font-semibold text-gray-700">
                Период
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="date"
                    value={filters.dates?.start || ""}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      dates: { ...(prev.dates || {}), start: e.target.value }
                    }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  />
                </div>
                <div>
                  <input
                    type="date"
                    value={filters.dates?.end || ""}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      dates: { ...(prev.dates || {}), end: e.target.value }
                    }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  />
                </div>
              </div>
            </motion.div>

            {/* Предпочтения */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1 }}
              className="space-y-3"
            >
              <label className="block text-sm font-semibold text-gray-700">
                Предпочтения
              </label>
              <div className="grid grid-cols-2 gap-3">
                {preferences.map((preference, index) => (
                  <motion.label
                    key={preference}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                    className="flex items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={filters.preferences?.includes(preference) || false}
                      onChange={(e) => handlePreferenceChange(preference, e.target.checked)}
                      className="mr-3 w-4 h-4 text-orange-600 focus:ring-orange-500 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">{preference}</span>
                  </motion.label>
                ))}
              </div>
            </motion.div>

            {/* Кнопка */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
              className="pt-6"
            >
              <Button
                onClick={handleSubmit}
                disabled={loading || saving}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {saving ? 'Сохранение...' : 'Применить фильтры'}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
