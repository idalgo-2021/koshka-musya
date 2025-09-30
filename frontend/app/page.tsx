"use client";
import { useEffect, useCallback } from "react";

import AuthForm from "../components/AuthForm"
import { Toaster } from "@/components/ui/sonner";
import { Loader } from "@/components/Loader";

import {useAuth, USER_ROLE} from "@/entities/auth/useAuth";
import {redirect} from "next/navigation";

export default function Home() {
  const { isAuthenticated, loading, user } = useAuth();

  const checkAuth = useCallback(() => {
    console.log('Home useEffect triggered:', JSON.stringify({
      loading: loading,
      isAuthenticated: isAuthenticated,
      loadingType: typeof loading,
      isAuthenticatedType: typeof isAuthenticated
    }));

    if (!loading && isAuthenticated) {
      console.log('Conditions met! Redirecting to dashboard...');
      // Используем setTimeout для небольшой задержки, чтобы состояние успело обновиться
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 100);
    } else {
      console.log('Conditions not met:', JSON.stringify({
        '!loading': !loading,
        'isAuthenticated': isAuthenticated,
        'both': !loading && isAuthenticated
      }));
    }
  }, [isAuthenticated, loading]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Дополнительная проверка при изменении isAuthenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('isAuthenticated changed to true, checking auth...');
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
      <AuthForm />
      <Toaster />
    </div>
  );
}

