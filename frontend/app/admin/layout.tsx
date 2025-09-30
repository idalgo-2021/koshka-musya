'use client';

import React from 'react'
import { redirect } from "next/navigation";

import AdminSidebar from '@/components/AdminSidebar'
import AdminBottomNav from "@/components/AdminBottomNav";
import AdminMobileNav from "@/components/AdminMobileNav";
import { ModalProvider } from "@/entities/modals/ModalContext";
import { AdminLayout as AdminLayoutComponent } from "@/components/AdminLayout";

import { useAuth, USER_ROLE } from "@/entities/auth/useAuth";
import {AdminLoader} from "@/components/AdminLoader";

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {

  return (
    <ModalProvider>
      <AdminLayoutComponent>
        <div className="flex flex-col min-h-[100svh]">
          {/* Mobile Navigation */}
          <AdminMobileNav />

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
      </AdminLayoutComponent>
    </ModalProvider>
  )
}


const AuthUserLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) {
    return (
      <AdminLoader />
    );
  }
  if (user && user.role === USER_ROLE.User) {
    return redirect('/dashboard');
  }
  return children;
}

