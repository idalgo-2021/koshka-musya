'use client';

import React from 'react'
import { redirect } from "next/navigation";

import AdminSidebar from '@/components/AdminSidebar'
import AdminBottomNav from "@/components/AdminBottomNav";
import AdminMobileNav from "@/components/AdminMobileNav";
import { ModalProvider } from "@/entities/modals/ModalContext";
import { AdminLayout as AdminLayoutComponent } from "@/components/AdminLayout";

import { useAuth, USER_ROLE, useSessionContextValue, useSessionActionContextValue } from "@/entities/auth/useAuth";
import { AdminLoader } from "@/components/AdminLoader";
import { SessionProvider, useSessionContext } from '@/entities/auth/SessionContext';
import { SessionActionProvider } from '@/entities/auth/SessionActionContext';

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Providers>
      <div className="flex flex-col min-h-[100svh]">
        <AdminMobileNav/>

        <div className="flex flex-1 overflow-hidden">
          <div className="hidden md:block relative">
            <AdminSidebar/>
          </div>

          <main className="flex-1 p-4 mb-24 md:p-6 lg:p-8 overflow-auto md:ml-60 ">
            <AuthUserLayout>
              {children}
            </AuthUserLayout>
          </main>
        </div>

        <AdminBottomNav/>
      </div>
    </Providers>
  )
}

function Providers({
                     children,
                   }: Readonly<{ children: React.ReactNode }>) {
  const auth = useAuth();
  const sessionValue = useSessionContextValue(auth);
  const sessionActionValue = useSessionActionContextValue(auth);

  return (
    <SessionProvider value={sessionValue}>
      <SessionActionProvider value={sessionActionValue}>
        <ModalProvider>
          <AdminLayoutComponent>
            {children}
          </AdminLayoutComponent>
        </ModalProvider>
      </SessionActionProvider>
    </SessionProvider>
  )
}


const AuthUserLayout = ({children}: { children: React.ReactNode }) => {
  const { user, isLoading } =  useSessionContext();

  if (isLoading) {
    return <AdminLoader />;
  }

  if (!user) {
    return <AdminLoader />;
  }

  if (user && user.role === USER_ROLE.User) {
    return redirect('/dashboard');
  }

  return children;
}

