"use client";
import { useEffect, useCallback } from "react";

import SecretGuestLanding from "../components/SecretGuestLanding"
import { Toaster } from "../components/ui/sonner";
import { Loader } from "@/components/Loader";

import { useAuth } from "@/entities/auth/useAuth";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();

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

  return (
    <>
      <SecretGuestLanding />
      <Toaster />
    </>
  );
}

