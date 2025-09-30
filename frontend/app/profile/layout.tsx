"use client";
import { useAuth } from "@/entities/auth/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DashboardHeader from "@/components/DashboardHeader";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accentgreen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accenttext mx-auto mb-4"></div>
          <p className="text-accenttext">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-accentgreen">
      <DashboardHeader username={user?.username} onLogout={handleLogout} />
      <div className="max-w-2xl mx-auto px-4 py-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center space-x-2 text-accenttext/70 hover:text-accenttext transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Главная страница</span>
        </button>
      </div>
      {children}
    </div>
  );
}
