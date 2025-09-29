"use client";

interface AssignmentProcessProps {
  assignmentId: string;
  hotelName: string;
  onContinue?: () => void;
  onBack?: () => void;
  onBackToReport?: () => void;
}

export default function AssignmentProcess({ hotelName, onContinue, onBack, onBackToReport }: AssignmentProcessProps) {
  const steps = [
    {
      number: "1",
      icon: "📝",
      title: "Принять заявку",
      description: "Подтвердите участие в проверке отеля"
    },
    {
      number: "2",
      icon: "🏨",
      title: "Посетите отель",
      description: `Проведите проверку в ${hotelName}`
    },
    {
      number: "3",
      icon: "📱",
      title: "Провести проверку",
      description: "Следуйте инструкциям, отмечайте каждый пункт чек-листа и заполняйте итоговый отчёт"
    },
    {
      number: "4",
      icon: "🎁",
      title: "Получите вознаграждение",
      description: "После проверки получите бонусы"
    }
  ];

  return (
    <div className="max-w-md mx-auto px-6 py-8">
      {/* Main Heading */}
                  <div className="text-center mb-8">
                     <h1 className="text-md md:text-2xl font-bold text-accenttext mb-2">
                      Памятка Агента
                    </h1>
                    <p className="text-accenttext/70 text-sm">
                      Секретные гости проверяют качество обслуживания в отелях и других заведениях.
                      Вы получаете бонусы, а отель — честную оценку своего сервиса.
                    </p>
      </div>

      {/* Process Steps */}
      <div className="space-y-4">
        {steps.map((step) => (
          <div key={step.number} className="bg-white rounded-3xl border-0 overflow-hidden transition-all duration-300 hover:scale-[1.02] group transform-gpu">
            <div className="p-6 transform-gpu">
              <div className="flex items-center space-x-4">
                {/* Step Number */}
                <div className="w-12 h-12 bg-accenttext rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg font-bold">{step.number}</span>
                </div>

                {/* Step Icon */}
                <div className="text-3xl">
                  {step.icon}
                </div>

                {/* Step Content */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-black mb-1">
                    {step.title}
                  </h3>
                  <p className="text-black text-sm">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="text-center mt-8">
        {onBackToReport ? (
          <button
            onClick={onBackToReport}
            className="w-full h-14 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Вернуться к отчету
          </button>
        ) : onBack && onContinue ? (
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="flex-1 h-14 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Назад к предложению
            </button>
            <button
              onClick={onContinue}
              className="flex-1 h-14 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Продолжить
            </button>
          </div>
        ) : onContinue ? (
          <button
            onClick={onContinue}
            className="w-full h-14 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Продолжить
          </button>
        ) : onBack ? (
          <button
            onClick={onBack}
            className="w-full h-14 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Назад к предложению
          </button>
        ) : null}
      </div>
    </div>
  );
}
