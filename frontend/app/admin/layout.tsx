'use client';

import React from 'react'
import { redirect } from "next/navigation";

import AdminSidebar from '@/components/AdminSidebar'
import AdminBottomNav from "@/components/AdminBottomNav";
import { Loader } from "@/components/Loader";
import { ModalProvider } from "@/entities/modals/ModalContext";
import { AdminLayout as AdminLayoutComponent } from "@/components/AdminLayout";

import { useAuth, USER_ROLE } from "@/entities/auth/useAuth";

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user } = useAuth();
  if (!user) {
    return (
      <Loader />
    );
  }
  if (user && user.role === USER_ROLE.User) {
    return redirect('/dashboard');
  }

  return (
    <ModalProvider>
      <AdminLayoutComponent>
        <div className="flex flex-col min-h-[100svh]">
          {/*<AdminNavbar/>*/}

          <div className="flex flex-1 overflow-hidden">
            <div className="hidden md:block relative">
              <AdminSidebar/>
            </div>

            <main className="flex-1 p-4 mb-24 md:p-6 lg:p-8 overflow-auto md:ml-60 ">
              {children}
            </main>
          </div>

          <AdminBottomNav/>
        </div>
      </AdminLayoutComponent>
    </ModalProvider>
  )
}


