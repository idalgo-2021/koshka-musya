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

const schema = z.object({
  username: z.string().min(3, "Минимум 3 символа"),
  email: z.string().email("Введите корректный email"),
  password: z.string().min(1, "Введите пароль"),
});

type RegisterData = z.infer<typeof schema>;
type AuthTab = "login" | "register";

export function RegisterForm({ onSwitchTab }: { onSwitchTab?: (tab: AuthTab) => void }) {
  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData>({ resolver: zodResolver(schema) });

  const onSubmit: SubmitHandler<RegisterData> = async ({ username, email, password }) => {
    try {
      await registerUser({ username, email, password });
      toast.success("Регистрация успешна! Войдите под своим email.");
      onSwitchTab?.("login");
    } catch (e) {
      const err = e as ApiError | Error;
      toast.error("message" in err ? err.message : "Не удалось зарегистрироваться");
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      {/* Заголовок формы */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">
          Создать аккаунт
        </h2>
        <p className="text-gray-500 text-sm">
          Заполните форму для регистрации
        </p>
      </div>

      {/* Поле имени пользователя */}
      <div className="space-y-2">
        <Label htmlFor="username" className="text-sm font-medium text-gray-700">
          Имя пользователя
        </Label>
        <Input 
          id="username" 
          {...register("username")} 
          autoFocus 
          className="h-12 px-4 text-base border-gray-200 focus:border-accenttext focus:ring-2 focus:ring-accenttext/20 transition-all"
          placeholder="Введите имя пользователя"
        />
        {errors.username && (
          <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
        )}
      </div>

      {/* Поле email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email
        </Label>
        <Input 
          id="email" 
          type="email"
          {...register("email")} 
          className="h-12 px-4 text-base border-gray-200 focus:border-accenttext focus:ring-2 focus:ring-accenttext/20 transition-all"
          placeholder="Введите ваш email"
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
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
          className="h-12 px-4 text-base border-gray-200 focus:border-accenttext focus:ring-2 focus:ring-accenttext/20 transition-all"
          placeholder="Введите пароль"
        />
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* Кнопка регистрации */}
      <Button
        type="submit"
        className="w-full h-12 bg-accenttext hover:bg-accenttext/90 text-white font-medium text-base rounded-lg transition-all shadow-lg hover:shadow-xl"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Регистрация..." : "Зарегистрироваться"}
      </Button>

      {/* Ссылка на вход */}
      <div className="text-center pt-2">
        <span className="text-gray-500 text-sm">Уже есть аккаунт? </span>
        <button 
          type="button" 
          className="text-accenttext text-sm font-medium hover:text-accenttext/80 transition-colors"
          onClick={() => onSwitchTab?.("login")}
        >
          Войти
        </button>
      </div>
    </form>
  );
}
