'use client';

import React from 'react'

import AdminSidebar from '@/components/AdminSidebar'
import AdminBottomNav from "@/components/AdminBottomNav";
import AdminMobileNav from "@/components/AdminMobileNav";

import {AuthUserLayout, MainContent, Providers} from "@/components/AdminRoot";

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Providers>
      <div className="flex flex-col min-h-[100svh]">
        <AdminMobileNav/>

        <div className="flex flex-1">
          <div className="hidden md:block relative">
            <AdminSidebar/>
          </div>

          <MainContent>
            <AuthUserLayout>
              {children}
            </AuthUserLayout>
          </MainContent>
        </div>

        <AdminBottomNav/>
      </div>
    </Providers>
  )
}
