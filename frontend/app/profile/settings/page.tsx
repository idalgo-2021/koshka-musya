  "use client";
import { useAuth } from "@/entities/auth/useAuth";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: '',
    phone: '',
    telegram: '',
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

  const handleSavePersonal = () => {
    console.log("Saving personal settings:", formData);
    setIsEditingPersonal(false);
    // TODO: Отправить данные на сервер
  };

  const handleCancelPersonal = () => {
    setFormData({
      username: user?.username || '',
      email: '',
      phone: '',
      telegram: '',
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
            Настройки профиля
          </motion.h1>
          
          <div className="space-y-6">
            {/* Личная информация */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-blue-800 text-lg flex items-center">
                  <span className="mr-3">👤</span>
                  Личная информация
                </h3>
                {!isEditingPersonal && (
                  <button
                    onClick={() => setIsEditingPersonal(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg text-sm"
                  >
                    Редактировать
                  </button>
                )}
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">
                    Имя пользователя
                  </label>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  ) : (
                    <p className="text-blue-900 text-lg font-medium">{user?.username}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">
                    Mail
                  </label>
                  {isEditingPersonal ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  ) : (
                    <p className="text-blue-900 text-lg font-medium">user@example.com</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">
                    Телефон
                  </label>
                  {isEditingPersonal ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="+7 (999) 123-45-67"
                    />
                  ) : (
                    <p className="text-blue-900 text-lg font-medium">+7 (999) 123-45-67</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">
                    Telegram
                  </label>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={formData.telegram}
                      onChange={(e) => setFormData({...formData, telegram: e.target.value})}
                      className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="@username"
                    />
                  ) : (
                    <p className="text-blue-900 text-lg font-medium">@username</p>
                  )}
                </div>
              </div>

              {/* Кнопки действий для личной информации */}
              {isEditingPersonal && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex space-x-4 pt-4 border-t border-blue-200"
                >
                  <Button
                    onClick={handleSavePersonal}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Сохранить
                  </Button>
                  <Button
                    onClick={handleCancelPersonal}
                    variant="outline"
                    className="border-blue-300 text-blue-700 hover:bg-blue-50 font-semibold py-2 px-6 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    Отмена
                  </Button>
                </motion.div>
              )}
            </motion.div>

            {/* Уведомления */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
            >
              <h3 className="font-bold text-blue-800 text-lg mb-6 flex items-center">
                <span className="mr-3">🔔</span>
                Уведомления
              </h3>
              
              <div className="space-y-4">
                <label className="flex items-center p-3 bg-white/50 rounded-xl hover:bg-white/70 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.notifications}
                    onChange={(e) => setFormData({...formData, notifications: e.target.checked})}
                    className="mr-3 w-5 h-5 text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <span className="text-blue-700 font-medium">Получать уведомления о новых заданиях</span>
                </label>

                <label className="flex items-center p-3 bg-white/50 rounded-xl hover:bg-white/70 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.emailNotifications}
                    onChange={(e) => setFormData({...formData, emailNotifications: e.target.checked})}
                    className="mr-3 w-5 h-5 text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <span className="text-blue-700 font-medium">Mail уведомления</span>
                </label>

                <label className="flex items-center p-3 bg-white/50 rounded-xl hover:bg-white/70 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.smsNotifications}
                    onChange={(e) => setFormData({...formData, smsNotifications: e.target.checked})}
                    className="mr-3 w-5 h-5 text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <span className="text-blue-700 font-medium">SMS уведомления</span>
                </label>

                <label className="flex items-center p-3 bg-white/50 rounded-xl hover:bg-white/70 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.telegramNotifications}
                    onChange={(e) => setFormData({...formData, telegramNotifications: e.target.checked})}
                    className="mr-3 w-5 h-5 text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <span className="text-blue-700 font-medium">Telegram уведомления</span>
                </label>
              </div>

            </motion.div>

            {/* Безопасность */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
            >
              <h3 className="font-bold text-red-800 text-lg mb-6 flex items-center">
                <span className="mr-3">🛡️</span>
                Безопасность
              </h3>
              
              <div className="space-y-6">
                {/* Password Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-red-700">
                      Пароль
                    </h4>
                    <button
                      onClick={() => setShowChangePassword(!showChangePassword)}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-lg transition-all duration-300 text-sm"
                    >
                      {showChangePassword ? "Отмена" : "Изменить"}
                    </button>
                  </div>
                  
                  <p className="text-red-600 text-sm mb-3">
                    Последнее изменение: {securitySettings.passwordLastChanged}
                  </p>
                  
                  {showChangePassword && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 pt-3 border-t border-red-200"
                    >
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                        className="w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                        placeholder="Текущий пароль"
                      />
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                        className="w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                        placeholder="Новый пароль"
                      />
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                        className="w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                        placeholder="Подтвердите пароль"
                      />
                      <button
                        onClick={handleSavePassword}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 text-sm"
                      >
                        Сохранить пароль
                      </button>
                    </motion.div>
                  )}
                </div>

                {/* Two-Factor Authentication */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-red-700">
                      Двухфакторная аутентификация
                    </h4>
                    <p className="text-red-600 text-sm">
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
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>

                {/* Security Info */}
                <div className="pt-3 border-t border-red-200">
                  <h4 className="font-semibold text-red-700 mb-3">
                    Информация о безопасности
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-red-600">Последний вход:</span>
                      <span className="text-red-700 font-medium">{securitySettings.lastLogin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-600">Активные сессии:</span>
                      <span className="text-red-700 font-medium">{securitySettings.activeSessions} устройств</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-600">Уровень защиты:</span>
                      <span className="text-red-700 font-medium">
                        {securitySettings.twoFactorAuth ? "Высокий" : "Средний"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </motion.div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
