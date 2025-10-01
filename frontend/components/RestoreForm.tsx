"use client";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().email("Введите корректный mail"),
});

type RestoreData = z.infer<typeof schema>;
type AuthTab = "login" | "register" | "restore";

export function RestoreForm({ onSwitchTab }: { onSwitchTab?: (tab: AuthTab) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RestoreData>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<RestoreData> = () => {
    toast.success("Письмо с инструкциями отправлено на ваш mail");
    onSwitchTab?.("login");
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      {/* Заголовок формы */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">
          Восстановление пароля
        </h2>
        <p className="text-gray-500 text-sm">
          Введите mail для восстановления доступа
        </p>
      </div>

      {/* Поле mail */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
          Mail
        </Label>
        <Input
          id="email"
          type="email"
          autoFocus
          {...register("email")}
          className={`h-12 px-4 text-base border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all rounded-xl ${
            errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""
          }`}
          placeholder="Введите ваш mail"
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Кнопка восстановления */}
      <Button
        type="submit"
        className="w-full h-14 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Отправка..." : "Восстановить пароль"}
      </Button>

      {/* Ссылка на вход */}
      <div className="text-center pt-2">
        <span className="text-gray-500 text-sm">Вспомнили пароль? </span>
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
