"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { LISTING_TYPES } from "@/lib/listing-types";

interface ApplicationFormProps {
  onBack: () => void;
  initialData?: {
    city?: string;
    propertyTypes?: string[];
    preferredDays?: string[];
    preferredTime?: string;
    maxDistance?: string;
    languages?: string[];
    notifications?: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    specialRequirements?: string;
  };
}

export default function ApplicationForm({ onBack, initialData }: ApplicationFormProps) {
  
  const [formData, setFormData] = useState({
    email: "",
    experience: "",
    motivation: "",
    city: initialData?.city || "",
    propertyTypes: initialData?.propertyTypes || [],
    // Новые поля для предпочтений
    preferredDays: initialData?.preferredDays || [],
    preferredTime: initialData?.preferredTime || "",
    maxDistance: initialData?.maxDistance || "",
    // Каналы уведомлений
    notifications: initialData?.notifications || {
      email: true,
      sms: false,
      push: true
    },
    // Дополнительные предпочтения
    languages: initialData?.languages || [],
    specialRequirements: initialData?.specialRequirements || ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Обновляем форму при изменении initialData
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        city: initialData.city || prev.city,
        propertyTypes: initialData.propertyTypes || prev.propertyTypes,
        preferredDays: initialData.preferredDays || prev.preferredDays,
        preferredTime: initialData.preferredTime || prev.preferredTime,
        maxDistance: initialData.maxDistance || prev.maxDistance,
        languages: initialData.languages || prev.languages,
        notifications: initialData.notifications || prev.notifications,
        specialRequirements: initialData.specialRequirements || prev.specialRequirements
      }));
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePropertyTypeChange = (propertyType: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      propertyTypes: checked 
        ? [...prev.propertyTypes, propertyType]
        : prev.propertyTypes.filter(type => type !== propertyType)
    }));
  };

  const handlePreferredDayChange = (day: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      preferredDays: checked 
        ? [...prev.preferredDays, day]
        : prev.preferredDays.filter(d => d !== day)
    }));
  };

  const handleLanguageChange = (language: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      languages: checked 
        ? [...prev.languages, language]
        : prev.languages.filter(l => l !== language)
    }));
  };

  const handleNotificationChange = (type: 'email' | 'sms' | 'push', checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: checked
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Здесь будет API вызов для отправки заявки
      // Пока симулируем отправку
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSubmitted(true);
      toast.success("Заявка успешно отправлена!");
    } catch {
      toast.error("Ошибка при отправке заявки. Попробуйте еще раз.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-accentgreen overflow-y-auto">
        <div className="w-full max-w-md mx-auto px-4 py-12 min-h-screen flex flex-col justify-center">
          {/* Заголовок */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-accenttext font-accent mb-2">
              Secret Guest
            </h1>
            <p className="text-accenttext/70 text-sm">
              Заявка успешно отправлена
            </p>
          </div>
          
          {/* Основная карточка */}
          <div className="bg-white rounded-3xl border-0 overflow-hidden p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Заголовок формы */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-accenttext rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-1">
            Заявка отправлена!
          </h2>
                <p className="text-gray-500 text-sm">
                  Спасибо за интерес к программе &quot;Тайный гость&quot;
                </p>
              </div>

              {/* Информационный блок */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 text-center">
              <strong>Что дальше?</strong><br />
                  Проверьте почту <span className="text-accenttext font-medium">{formData.email}</span> - мы отправим уведомление о статусе заявки.
            </p>
          </div>
          
              {/* Кнопка */}
          <button
            onClick={onBack}
                className="w-full bg-accenttext hover:bg-accenttext/90 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200"
          >
            Вернуться на главную
          </button>
      </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-accentgreen overflow-y-auto">
      <div className="w-full max-w-md mx-auto px-4 py-12 min-h-screen flex flex-col justify-center">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-accenttext font-accent mb-2">
            Secret Guest
          </h1>
          <p className="text-accenttext/70 text-sm">
            Подача заявки на участие
          </p>
        </div>

        {/* Основная карточка */}
        <div className="bg-white rounded-3xl border-0 overflow-hidden p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
      >
            {/* Кнопка назад */}
            <div className="mb-4">
          <button
            onClick={onBack}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
                <span className="text-sm">Назад</span>
          </button>
        </div>

            {/* Заголовок формы */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-1">
              Подать заявку
              </h2>
              <p className="text-gray-500 text-sm">
              Станьте участником программы &quot;Тайный гость&quot;
              </p>
          </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accenttext focus:border-accenttext transition-all duration-200"
                  placeholder="your@email.com"
                />
              </div>

              {/* Город */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Город *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accenttext focus:border-accenttext transition-all duration-200"
                  placeholder="Москва"
                />
              </div>

              {/* Тип проверки */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Тип проверки *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {LISTING_TYPES.map((type) => (
                    <label key={type.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.propertyTypes.includes(type.slug)}
                        onChange={(e) => handlePropertyTypeChange(type.slug, e.target.checked)}
                        className="w-4 h-4 text-accenttext border-gray-300 rounded focus:ring-accenttext focus:ring-2"
                      />
                      <span className="text-sm text-gray-700">{type.name}</span>
                    </label>
                  ))}
              </div>
            </div>

              {/* Опыт работы */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                Опыт работы в сфере гостеприимства
              </label>
              <select
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accenttext focus:border-accenttext transition-all duration-200"
              >
                <option value="">Выберите опыт</option>
                <option value="no">Нет опыта</option>
                <option value="1-2">1-2 года</option>
                <option value="3-5">3-5 лет</option>
                <option value="5+">Более 5 лет</option>
              </select>
            </div>

              {/* Мотивация */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                Почему хотите стать тайным гостем? *
              </label>
              <textarea
                name="motivation"
                value={formData.motivation}
                onChange={handleInputChange}
                required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accenttext focus:border-accenttext transition-all duration-200 resize-none"
                placeholder="Расскажите о вашей мотивации..."
              />
            </div>

              {/* Предпочтения по дням недели */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Предпочтительные дни для проверок
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'monday', label: 'Понедельник' },
                    { value: 'tuesday', label: 'Вторник' },
                    { value: 'wednesday', label: 'Среда' },
                    { value: 'thursday', label: 'Четверг' },
                    { value: 'friday', label: 'Пятница' },
                    { value: 'saturday', label: 'Суббота' },
                    { value: 'sunday', label: 'Воскресенье' }
                  ].map((day) => (
                    <label key={day.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.preferredDays.includes(day.value)}
                        onChange={(e) => handlePreferredDayChange(day.value, e.target.checked)}
                        className="w-4 h-4 text-accenttext border-gray-300 rounded focus:ring-accenttext focus:ring-2"
                      />
                      <span className="text-sm text-gray-700">{day.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Предпочтительное время */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Предпочтительное время для проверок
                </label>
                <select
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accenttext focus:border-accenttext transition-all duration-200"
                >
                  <option value="">Любое время</option>
                  <option value="morning">Утром (8:00 - 12:00)</option>
                  <option value="afternoon">Днем (12:00 - 18:00)</option>
                  <option value="evening">Вечером (18:00 - 22:00)</option>
                  <option value="night">Поздно вечером (22:00 - 24:00)</option>
                </select>
              </div>

              {/* Максимальное расстояние */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Максимальное расстояние от дома (км)
                </label>
                <select
                  name="maxDistance"
                  value={formData.maxDistance}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accenttext focus:border-accenttext transition-all duration-200"
                >
                  <option value="">Любое расстояние</option>
                  <option value="5">До 5 км</option>
                  <option value="10">До 10 км</option>
                  <option value="20">До 20 км</option>
                  <option value="50">До 50 км</option>
                  <option value="100">До 100 км</option>
                </select>
              </div>

              {/* Языки */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Владение языками
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'russian', label: 'Русский' },
                    { value: 'english', label: 'Английский' },
                    { value: 'german', label: 'Немецкий' },
                    { value: 'french', label: 'Французский' },
                    { value: 'spanish', label: 'Испанский' },
                    { value: 'chinese', label: 'Китайский' }
                  ].map((language) => (
                    <label key={language.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.languages.includes(language.value)}
                        onChange={(e) => handleLanguageChange(language.value, e.target.checked)}
                        className="w-4 h-4 text-accenttext border-gray-300 rounded focus:ring-accenttext focus:ring-2"
                      />
                      <span className="text-sm text-gray-700">{language.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Каналы уведомлений */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Каналы уведомлений
                </label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.notifications.email}
                      onChange={(e) => handleNotificationChange('email', e.target.checked)}
                      className="w-4 h-4 text-accenttext border-gray-300 rounded focus:ring-accenttext focus:ring-2"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Email уведомления</span>
                      <p className="text-xs text-gray-500">Новые задания, статусы отчетов</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.notifications.sms}
                      onChange={(e) => handleNotificationChange('sms', e.target.checked)}
                      className="w-4 h-4 text-accenttext border-gray-300 rounded focus:ring-accenttext focus:ring-2"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">SMS уведомления</span>
                      <p className="text-xs text-gray-500">Срочные уведомления о заданиях</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.notifications.push}
                      onChange={(e) => handleNotificationChange('push', e.target.checked)}
                      className="w-4 h-4 text-accenttext border-gray-300 rounded focus:ring-accenttext focus:ring-2"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Push уведомления</span>
                      <p className="text-xs text-gray-500">Уведомления в браузере</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Специальные требования */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Специальные требования или пожелания
                </label>
                <textarea
                  name="specialRequirements"
                  value={formData.specialRequirements}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accenttext focus:border-accenttext transition-all duration-200 resize-none"
                  placeholder="Укажите любые особые требования или пожелания..."
                />
              </div>

              {/* Информационный блок */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 text-center leading-relaxed">
                  После подачи заявки модератор рассмотрит её и отправит уведомление на указанную почту.
                  При одобрении вы сможете зарегистрироваться в системе.
                </p>
              </div>

              {/* Кнопка отправки */}
              <button
              type="submit"
              disabled={isSubmitting}
                className="w-full bg-accenttext hover:bg-accenttext/90 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Отправляем...
                </div>
              ) : (
                "Подать заявку"
              )}
              </button>
          </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
