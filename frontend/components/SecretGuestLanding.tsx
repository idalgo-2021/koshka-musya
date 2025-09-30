"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LISTING_TYPES } from "@/lib/listing-types";

export default function SecretGuestLanding() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    city: "",
    propertyTypes: [] as string[]
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const handleSubmitApplication = () => {
    // Передаем данные в URL параметрах
    const params = new URLSearchParams();
    if (formData.city) params.set('city', formData.city);
    if (formData.propertyTypes.length > 0) {
      params.set('propertyTypes', formData.propertyTypes.join(','));
    }
    
    router.push(`/application?${params.toString()}`);
  };



  const features = [
    {
      icon: "🔍",
      title: "Тайные проверки"
    },
    {
      icon: "📱",
      title: "Удобное приложение"
    },
    {
      icon: "💰",
      title: "Приятное вознаграждение"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Подача заявки",
      description: "Заполните форму и отправьте заявку на участие"
    },
    {
      number: "02", 
      title: "Модерация",
      description: "Модератор рассмотрит вашу заявку"
    },
    {
      number: "03",
      title: "Одобрение",
      description: "Получите уведомление об одобрении на почту"
    },
    {
      number: "04",
      title: "Регистрация",
      description: "Зарегистрируйтесь в системе и начните работу"
    }
  ];



  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-2xl font-bold text-accenttext font-accent"
            >
              Secret Guest
            </motion.div>
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              onClick={() => router.push('/login')}
              className="bg-accenttext hover:bg-accenttext/90 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Войти
            </motion.button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-accentgreen py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-12"
            >
              <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                Станьте
                <br />
                <span className="text-accenttext">Тайным гостем</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
                Присоединяйтесь к программе тайных проверок и получайте достойную оплату 
                за оценку качества сервиса в отелях и ресторанах
              </p>
            </motion.div>

            {/* Search-like Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="bg-card rounded-3xl shadow-2xl p-6 max-w-4xl mx-auto mb-8"
            >
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Город для проверок</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Введите город"
                    className="w-full px-4 py-3 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-accenttext"
                  />
                </div>
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Тип проверки</label>
                  <div className="grid grid-cols-2 gap-2 p-3 border border-input rounded-xl bg-background">
                    {LISTING_TYPES.map((type) => (
                      <label key={type.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.propertyTypes.includes(type.slug)}
                          onChange={(e) => handlePropertyTypeChange(type.slug, e.target.checked)}
                          className="w-4 h-4 text-accenttext border-gray-300 rounded focus:ring-accenttext focus:ring-2"
                        />
                        <span className="text-sm text-foreground">{type.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleSubmitApplication}
                  className="bg-accenttext hover:bg-accenttext/90 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Подать заявку
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-accentgreen/3 via-transparent to-accentgreen/3"></div>
        <div className="absolute top-10 right-20 w-24 h-24 bg-accentgreen/10 rounded-full blur-2xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="inline-block"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 relative">
                Наши преимущества
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                  viewport={{ once: true }}
                  className="absolute bottom-0 left-0 h-1 bg-accentgreen rounded-full"
                />
              </h2>
            </motion.div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.2,
                  type: "spring",
                  stiffness: 100
                }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <motion.div 
                  className="relative mb-8"
                  whileHover={{ 
                    scale: 1.1,
                    rotate: [0, -5, 5, 0],
                    transition: { duration: 0.6 }
                  }}
                >
                  
                  {/* Icon container */}
                  <div className="relative w-20 h-20 bg-accentgreen rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:shadow-2xl transition-all duration-300">
                    <span className="text-3xl">{feature.icon}</span>
                    
                    {/* Animated ring */}
                    <motion.div
                      className="absolute inset-0 border-2 border-accenttext/30 rounded-full"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0, 0.5]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.5
                      }}
                    />
                  </div>
                </motion.div>
                
                <motion.h3 
                  className="text-2xl font-bold text-foreground group-hover:text-accenttext transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                >
                  {feature.title}
                </motion.h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-20 bg-accentgreen relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-accentgreen/5 via-transparent to-accenttext/5"></div>
        <div className="absolute top-20 left-10 w-32 h-32 bg-accentgreen/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-accenttext/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="inline-block"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 relative">
                Как это работает
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                  viewport={{ once: true }}
                  className="absolute bottom-0 left-0 h-1 bg-accenttext rounded-full"
                />
              </h2>
            </motion.div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Простой путь от подачи заявки до получения первых результатов
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, rotateY: -15 }}
                whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.2,
                  type: "spring",
                  stiffness: 100
                }}
                viewport={{ once: true }}
                className="relative group"
              >
                {/* Connection line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-8 h-0.5 bg-accenttext/30 transform -translate-x-4 z-0">
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      transition={{ duration: 1, delay: index * 0.2 + 0.5 }}
                      viewport={{ once: true }}
                      className="h-full bg-accenttext origin-left"
                    />
                  </div>
                )}
                
                <div className="bg-card rounded-3xl p-8 text-center shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.05] hover:-translate-y-2 relative overflow-hidden">
                  
                  <div className="relative z-10">
                    <motion.div 
                      className="w-16 h-16 bg-accenttext text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold shadow-lg group-hover:shadow-xl transition-all duration-300"
                      whileHover={{ 
                        scale: 1.1,
                        rotate: 360,
                        transition: { duration: 0.6 }
                      }}
                    >
                      {step.number}
                    </motion.div>
                    
                    <h3 className="text-xl font-bold text-card-foreground mb-4">
                      {step.title}
                    </h3>
                    
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Готовы начать?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Присоединяйтесь к тысячам тайных гостей, которые уже получают 
              стабильный доход и развивают свои навыки
            </p>
            <button
              onClick={() => router.push('/application')}
              className="bg-accenttext hover:bg-accenttext/90 text-white font-semibold py-4 px-12 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Подать заявку
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              © 2024 Secret Guest. Все права защищены.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
