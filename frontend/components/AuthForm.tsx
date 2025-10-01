"use client";
import { useState } from "react";
import { RegisterForm } from "./RegistrationForm";
import { LoginForm } from "./LoginForm";
import { RestoreForm } from "./RestoreForm";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthForm() {
  const [tab, setTab] = useState<"login" | "register" | "restore">("login");

  return (
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
  );
}
