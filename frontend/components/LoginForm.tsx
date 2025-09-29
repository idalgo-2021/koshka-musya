"use client";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/entities/auth/useAuth";
import type { ApiError } from "@/entities/auth/types";

/** ───────────── future: login by email ─────────────
const emailSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(6, "Минимум 6 символов"),
});
type EmailLoginData = z.infer<typeof emailSchema>;
──────────────────────────────────────────────────── */

/** текущий вариант: логин по username */
const schema = z.object({
  username: z.string().min(3, "Минимум 3 символа"),
  password: z.string().min(1, "Введите пароль"),
});
type LoginData = z.infer<typeof schema>;

type AuthTab = "login" | "register" | "restore";

export function LoginForm({ onSwitchTab }: { onSwitchTab?: (tab: AuthTab) => void }) {
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({ resolver: zodResolver(schema) });

  const onSubmit: SubmitHandler<LoginData> = async ({ username, password }) => {
    try {
      await login({ username, password });
      toast.success("Вход выполнен!");
      // Redirect will be handled by the main page component
    } catch (e) {
      const err = e as ApiError | Error;
      toast.error("message" in err ? err.message : "Не удалось войти");
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      {/* Заголовок формы */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">
          Вход в систему
        </h2>
        <p className="text-gray-500 text-sm">
          Введите свои данные для входа
        </p>
      </div>

      {/* Поле логина */}
      <div className="space-y-2">
        <Label htmlFor="username" className="text-sm font-medium text-gray-700">
          Логин
        </Label>
        <Input 
          id="username" 
          {...register("username")} 
          autoFocus 
          autoComplete="username"
          className="h-12 px-4 text-base border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all rounded-xl"
          placeholder="Введите ваш логин"
        />
        {errors.username && (
          <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
        )}
      </div>

      {/* Поле пароля */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
          Пароль
        </Label>
        <Input 
          id="password" 
          type="password" 
          {...register("password")} 
          autoComplete="current-password"
          className="h-12 px-4 text-base border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all rounded-xl"
          placeholder="Введите ваш пароль"
        />
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* Кнопка входа */}
      <Button
        type="submit"
        className="w-full h-14 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Вход..." : "Войти"}
      </Button>

      {/* Ссылки */}
      <div className="text-center pt-2">
        <span className="text-gray-500 text-sm">Нет аккаунта? </span>
        <button
          type="button"
          className="text-accenttext text-sm font-medium hover:text-accenttext/80 transition-colors"
          onClick={() => onSwitchTab?.("register")}
        >
          Зарегистрироваться
        </button>
      </div>
    </form>
  );
}
