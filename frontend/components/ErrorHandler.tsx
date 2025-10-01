"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Интерфейсы для разных режимов использования
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

interface ErrorStateProps {
  error: string | null;
  onRetry: () => void;
  onBackToDashboard?: () => void;
}

// Компонент для отображения ошибок (заменяет ErrorState)
function ErrorState({ error, onRetry, onBackToDashboard }: ErrorStateProps) {
  if (!error) return null;

  return (
    <Card className="mb-6 bg-red-50 border-red-200">
      <CardContent className="p-4 text-center">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-red-600 mb-4">{error}</p>
        <div className="flex gap-3 justify-center">
          <Button
            onClick={onRetry}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Попробовать снова
          </Button>
          {onBackToDashboard && (
            <Button
              onClick={onBackToDashboard}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              Вернуться на дашборд
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Компонент границы ошибок (заменяет ErrorBoundary)
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} retry={this.handleRetry} />;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-accentgreen p-4">
          <Card className="max-w-md w-full shadow-xl border-0 rounded-2xl overflow-hidden bg-white">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Что-то пошло не так
              </h2>
              <p className="text-gray-600 mb-6">
                Произошла неожиданная ошибка. Попробуйте обновить страницу или обратитесь в поддержку.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={this.handleRetry}
                  className="w-full bg-accenttext hover:bg-accenttext/90 text-white"
                >
                  Попробовать снова
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="w-full"
                >
                  Обновить страницу
                </Button>
              </div>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    Детали ошибки (разработка)
                  </summary>
                  <pre className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Экспорт компонентов
export default ErrorBoundary;
export { ErrorState };
