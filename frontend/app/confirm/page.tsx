"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";

export default function ConfirmPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      setStatus("error");
      setMessage("Неверная ссылка подтверждения");
      return;
    }

    // Здесь будет API вызов для подтверждения регистрации
    // Пока симулируем успешное подтверждение
    setTimeout(() => {
      setStatus("success");
      setMessage("Регистрация успешно подтверждена! Теперь вы можете войти в систему.");
    }, 2000);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-accentgreen flex items-center justify-center py-12">
      <div className="w-full max-w-md mx-auto px-4">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-accenttext font-accent mb-2">
            Secret Guest
          </h1>
          <p className="text-accenttext/70 text-sm">
            Подтверждение регистрации
          </p>
        </div>

        {/* Основная карточка */}
        <div className="bg-white rounded-3xl border-0 overflow-hidden p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center">
              {status === "loading" && (
                <>
                  <div className="w-16 h-16 bg-accenttext rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    Подтверждение регистрации
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Проверяем вашу ссылку...
                  </p>
                </>
              )}

              {status === "success" && (
                <>
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    Успешно!
                  </h2>
                  <p className="text-gray-600 text-sm mb-6">
                    {message}
                  </p>
                  <a
                    href="/login"
                    className="w-full bg-accenttext hover:bg-accenttext/90 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 inline-block"
                  >
                    Войти в систему
                  </a>
                </>
              )}

              {status === "error" && (
                <>
                  <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    Ошибка
                  </h2>
                  <p className="text-gray-600 text-sm mb-6">
                    {message}
                  </p>
                  <a
                    href="/register"
                    className="w-full bg-accenttext hover:bg-accenttext/90 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 inline-block"
                  >
                    Зарегистрироваться
                  </a>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
