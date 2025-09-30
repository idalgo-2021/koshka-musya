'use client';

import React from "react";
import {useAuth, USER_ROLE, useSessionActionContextValue, useSessionContextValue} from "@/entities/auth/useAuth";
import {SessionProvider, useSessionContext} from "@/entities/auth/SessionContext";
import {SessionActionProvider} from "@/entities/auth/SessionActionContext";
import {ModalProvider} from "@/entities/modals/ModalContext";
import {SidebarProvider, useSidebar} from "@/state/contexts/SidebarContext";
import {AdminLayout as AdminLayoutComponent} from "@/components/AdminLayout";
import {AdminLoader} from "@/components/AdminLoader";
import {redirect} from "next/navigation";

export function Providers({
                     children,
                   }: Readonly<{ children: React.ReactNode }>) {
  const auth = useAuth();
  const sessionValue = useSessionContextValue(auth);
  const sessionActionValue = useSessionActionContextValue(auth);

  return (
    <SessionProvider value={sessionValue}>
      <SessionActionProvider value={sessionActionValue}>
        <ModalProvider>
          <SidebarProvider>
            <AdminLayoutComponent>
              {children}
            </AdminLayoutComponent>
          </SidebarProvider>
        </ModalProvider>
      </SessionActionProvider>
    </SessionProvider>
  )
}


export function MainContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar()

  return (
    <main className={`flex-1 p-4 mb-24 md:p-6 lg:p-8 overflow-auto transition-all duration-300 ${
      isCollapsed ? 'md:ml-16' : 'md:ml-60'
    }`}>
      {children}
    </main>
  )
}

export const AuthUserLayout = ({children}: { children: React.ReactNode }) => {
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

