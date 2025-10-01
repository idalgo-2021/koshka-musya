"use client";
import { useEffect, useCallback } from "react";

import { Toaster } from "@/components/ui/sonner";
import { Loader } from "@/components/Loader";

import {useAuth, USER_ROLE} from "@/entities/auth/useAuth";
import {redirect} from "next/navigation";
import SecretGuestLanding from "@/components/SecretGuestLanding";

export default function Home() {
  const { isAuthenticated, loading, user } = useAuth();

  const checkAuth = useCallback(() => {
    if (!loading && isAuthenticated) {
      // Используем setTimeout для небольшой задержки, чтобы состояние успело обновиться
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 100);
    } else {
    }
  }, [isAuthenticated, loading]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Дополнительная проверка при изменении isAuthenticated
  useEffect(() => {
    if (isAuthenticated) {
      checkAuth();
    }
  }, [isAuthenticated, checkAuth]);

  if (loading) {
    return (
      <Loader />
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect to dashboard
  }
  if (user?.role === USER_ROLE.Admin || user?.role === USER_ROLE.Staff) {
    return redirect('/admin')
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-accentgreen">
      <SecretGuestLanding />
      <Toaster />
    </div>
  );
}

