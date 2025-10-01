  "use client";
import { useAuth } from "@/entities/auth/useAuth";
import { useUserProfile } from "@/entities/auth/useUserProfile";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HomeButton from "@/components/HomeButton";

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  useUserProfile();
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: 'user@example.com',
    phone: '+7 (999) 123-45-67',
    telegram: '@username',
    notifications: true,
    emailNotifications: true,
    smsNotifications: false,
    telegramNotifications: false
  });


  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginNotifications: true,
    sessionTimeout: 30, // minutes
    passwordLastChanged: "2024-01-15",
    lastLogin: "2024-01-20 14:30",
    activeSessions: 2
  });

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [expandedSections, setExpandedSections] = useState({
    notifications: false,
    security: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSavePersonal = () => {
    console.log("Saving personal settings:", formData);
    setIsEditingPersonal(false);
    // TODO: Отправить данные на сервер
  };

  const handleCancelPersonal = () => {
    setFormData({
      username: user?.username || '',
      email: 'user@example.com',
      phone: '+7 (999) 123-45-67',
      telegram: '@username',
      notifications: true,
      emailNotifications: true,
      smsNotifications: false,
      telegramNotifications: false
    });
    setIsEditingPersonal(false);
  };





  const handlePasswordChange = (field: string, value: string) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSavePassword = () => {
    // Здесь будет логика сохранения пароля
    console.log("Saving password...");
    setShowChangePassword(false);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };

  const handleToggle2FA = () => {
    setSecuritySettings(prev => ({
      ...prev,
      twoFactorAuth: !prev.twoFactorAuth
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
            <h1 className="text-3xl font-bold mb-2">Настройки профиля</h1>
            <p className="text-white/90 text-lg">
              Управление аккаунтом и безопасностью
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
            {/* Личная информация */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 hover:border-accenttext/30"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800 text-lg">
                  Личная информация
                </h3>
                {!isEditingPersonal && (
                  <button
                    onClick={() => setIsEditingPersonal(true)}
                    className="bg-accenttext hover:bg-accenttext/80 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 text-sm"
                  >
                    Редактировать
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Имя пользователя
                  </label>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accenttext/20 focus:border-accenttext transition-all"
                    />
                  ) : (
                    <p className="text-gray-800 text-sm">{user?.username}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  {isEditingPersonal ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accenttext/20 focus:border-accenttext transition-all"
                    />
                  ) : (
                    <p className="text-gray-800 text-sm">{formData.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Телефон
                  </label>
                  {isEditingPersonal ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accenttext/20 focus:border-accenttext transition-all"
                      placeholder="+7 (999) 123-45-67"
                    />
                  ) : (
                    <p className="text-gray-800 text-sm">{formData.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telegram
                  </label>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={formData.telegram}
                      onChange={(e) => setFormData({...formData, telegram: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accenttext/20 focus:border-accenttext transition-all"
                      placeholder="@username"
                    />
                  ) : (
                    <p className="text-gray-800 text-sm">{formData.telegram}</p>
                  )}
                </div>
              </div>

              {/* Кнопки действий для личной информации */}
              {isEditingPersonal && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex space-x-3 pt-4 border-t border-gray-200"
                >
                  <button
                    onClick={handleSavePersonal}
                    className="bg-accenttext hover:bg-accenttext/80 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 text-sm"
                  >
                    Сохранить
                  </button>
                  <button
                    onClick={handleCancelPersonal}
                    className="border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-2 px-4 rounded-lg transition-all duration-300 text-sm"
                  >
                    Отмена
                  </button>
                </motion.div>
              )}
            </motion.div>

            {/* Уведомления */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 hover:border-accenttext/30"
            >
              <button
                onClick={() => toggleSection('notifications')}
                className="w-full flex items-center justify-between gap-2 mb-3 text-left"
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-800 text-lg">Уведомления</h3>
                </div>
                <motion.span
                  animate={{ rotate: expandedSections.notifications ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-accenttext"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9,18 15,12 9,6"></polyline>
                  </svg>
                </motion.span>
              </button>
              
              <AnimatePresence>
                {expandedSections.notifications && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-3">
                      <label className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.notifications}
                          onChange={(e) => setFormData({...formData, notifications: e.target.checked})}
                          className="mr-3 w-4 h-4 text-accenttext focus:ring-accenttext/20 rounded"
                        />
                        <span className="text-gray-700 text-sm">Получать уведомления о новых заданиях</span>
                      </label>

                      <label className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.emailNotifications}
                          onChange={(e) => setFormData({...formData, emailNotifications: e.target.checked})}
                          className="mr-3 w-4 h-4 text-accenttext focus:ring-accenttext/20 rounded"
                        />
                        <span className="text-gray-700 text-sm">Email уведомления</span>
                      </label>

                      <label className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.smsNotifications}
                          onChange={(e) => setFormData({...formData, smsNotifications: e.target.checked})}
                          className="mr-3 w-4 h-4 text-accenttext focus:ring-accenttext/20 rounded"
                        />
                        <span className="text-gray-700 text-sm">SMS уведомления</span>
                      </label>

                      <label className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.telegramNotifications}
                          onChange={(e) => setFormData({...formData, telegramNotifications: e.target.checked})}
                          className="mr-3 w-4 h-4 text-accenttext focus:ring-accenttext/20 rounded"
                        />
                        <span className="text-gray-700 text-sm">Telegram уведомления</span>
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Безопасность */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 hover:border-accenttext/30"
            >
              <button
                onClick={() => toggleSection('security')}
                className="w-full flex items-center justify-between gap-2 mb-3 text-left"
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-800 text-lg">Безопасность</h3>
                </div>
                <motion.span
                  animate={{ rotate: expandedSections.security ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-accenttext"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9,18 15,12 9,6"></polyline>
                  </svg>
                </motion.span>
              </button>
              
              <AnimatePresence>
                {expandedSections.security && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-4">
                {/* Password Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800">
                      Пароль
                    </h4>
                    <button
                      onClick={() => setShowChangePassword(!showChangePassword)}
                      className="bg-accenttext hover:bg-accenttext/80 text-white font-semibold py-1 px-3 rounded-lg transition-all duration-300 text-sm"
                    >
                      {showChangePassword ? "Отмена" : "Изменить"}
                    </button>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3">
                    Последнее изменение: {securitySettings.passwordLastChanged}
                  </p>
                  
                  {showChangePassword && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 pt-3 border-t border-gray-200"
                    >
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accenttext/20 focus:border-accenttext text-sm"
                        placeholder="Текущий пароль"
                      />
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accenttext/20 focus:border-accenttext text-sm"
                        placeholder="Новый пароль"
                      />
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accenttext/20 focus:border-accenttext text-sm"
                        placeholder="Подтвердите пароль"
                      />
                      <button
                        onClick={handleSavePassword}
                        className="w-full bg-accenttext hover:bg-accenttext/80 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 text-sm"
                      >
                        Сохранить пароль
                      </button>
                    </motion.div>
                  )}
                </div>

                {/* Two-Factor Authentication */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Двухфакторная аутентификация
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {securitySettings.twoFactorAuth 
                        ? "Включена - дополнительная защита активна"
                        : "Отключена - включите для большей безопасности"
                      }
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={securitySettings.twoFactorAuth}
                      onChange={handleToggle2FA}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accenttext/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accenttext"></div>
                  </label>
                </div>

                {/* Security Info */}
                <div className="pt-3 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Информация о безопасности
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Последний вход:</span>
                      <span className="text-gray-800 font-medium">{securitySettings.lastLogin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Активные сессии:</span>
                      <span className="text-gray-800 font-medium">{securitySettings.activeSessions} устройств</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Уровень защиты:</span>
                      <span className="text-gray-800 font-medium">
                        {securitySettings.twoFactorAuth ? "Высокий" : "Средний"}
                      </span>
                    </div>
                  </div>
                </div>
                    </div>
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
