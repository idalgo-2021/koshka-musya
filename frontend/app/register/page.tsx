"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { RegisterForm } from "@/components/RegistrationForm";
import { LoginForm } from "@/components/LoginForm";
import { RestoreForm } from "@/components/RestoreForm";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"login" | "register" | "restore">("register");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Проверяем наличие токена одобрения в URL
    const approvalToken = searchParams.get('token');
    const email = searchParams.get('email');
    
    if (!approvalToken || !email) {
      // Если нет токена или mail, перенаправляем на главную
      router.push('/');
      return;
    }

    // Здесь можно добавить проверку токена на сервере
    // Пока что просто устанавливаем авторизацию
    setIsAuthorized(true);
    setIsLoading(false);
  }, [searchParams, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-accentgreen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accenttext mx-auto mb-4"></div>
          <p className="text-accenttext">Проверка доступа...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Перенаправление уже произошло
  }

  return (
    <div className="min-h-screen bg-accentgreen flex items-center justify-center py-12">
      <div className="w-full max-w-sm mx-auto px-4">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-accenttext font-accent mb-2">
            Secret Guest
          </h1>
          <p className="text-accenttext/70 text-sm">
            Система тайных проверок
          </p>
        </div>

        {/* Основная карточка */}
        <div className="bg-white rounded-3xl border-0 overflow-hidden p-6">
          <AnimatePresence mode="wait">
            {tab === "login" && (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <LoginForm onSwitchTab={setTab} />
              </motion.div>
            )}
            {tab === "register" && (
              <motion.div
                key="register"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <RegisterForm onSwitchTab={setTab} />
              </motion.div>
            )}
            {tab === "restore" && (
              <motion.div
                key="restore"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <RestoreForm onSwitchTab={setTab} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
