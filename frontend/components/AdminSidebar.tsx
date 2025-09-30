"use client"

import {usePathname, useRouter} from 'next/navigation'
import * as React from 'react'
import {cn} from '@/lib/utils'
import {roleToString, useAuth, User} from "@/entities/auth/useAuth";
import {ProfileIcon} from "@/components/icons/ProfileIcon";
import {Home, FileText, Settings, Building, Users, List, BarChart3, Tag, Image, LogOut} from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Дашборд', icon: Home },
  { href: '/admin/reports', label: 'Отчеты', icon: FileText },
  { href: '/admin/checklists/editor', label: 'Настройка анкет', icon: Settings },
  { href: '/admin/listings', label: 'Объекты размещения', icon: Building },
  { href: '/admin/assignments', label: 'Предложения', icon: List },
  { href: '/admin/sg_reservations', label: 'SG Reservations', icon: BarChart3 },
  { href: '/admin/users', label: 'Пользователи', icon: Users },
  { href: '/admin/listingTypes', label: 'Типы объектов', icon: Tag },
  { href: '/admin/mediaRequirements', label: 'Media Requirements', icon: Image },
]

// function formatUser(user: User | null) {
//   if (!user?.username || !user?.role) {
//     return '';
//   }
//   return (user?.username || '') + ' - ' + roleToString(user?.role);
// }

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  // const {user} = useAuth();

  const onLogout = () => {
    try {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    } catch {
    }
    router.push('/');
  }

  return (
    <aside className="lg:bg-zinc-100 dark:bg-zinc-900 dark:lg:bg-zinc-950 w-60 shrink-0 border-r bg-background/50 flex flex-col h-[100svh] overflow-auto p-4 fixed top-0">
      {/*<UserCard user={user}/>*/}
      {/*<div className="px-4 py-4 text-sm font-semibold text-muted-foreground">{formatUser(user)}</div>*/}
      <nav className="flex flex-col gap-2">
        {navItems.map(item => {
          const active = pathname === item.href || pathname?.startsWith(item.href + '/')
          return (
            <NavItem href={item.href} key={item.href} active={active} icon={item.icon}>
              {item.label}
            </NavItem>
          )
        })}
        <div className="py-2 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full text-left"
          >
            <LogOut className="w-5 h-5"/>
            <span className="font-medium">Выйти</span>
          </button>
        </div>
      </nav>
    </aside>
  )
}

function UserCard({user}: { user: User | null }) {
  return (
    <div
      className="flex flex-col border-t border-zinc-950/5 p-4 dark:border-white/5 [&amp;>[data-slot=section]+[data-slot=section]]:mt-2.5">
      <div data-slot="section" className="flex flex-col gap-0.5">
        <span className="relative">
          <button id="headlessui-menu-button-_R_fpivaivb_" type="button" aria-haspopup="menu" aria-expanded="false"
                  data-headlessui-state=""
                  className="cursor-default flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-base/6 font-medium text-zinc-950 sm:py-2 sm:text-sm/5 *:data-[slot=icon]:size-6 *:data-[slot=icon]:shrink-0 *:data-[slot=icon]:fill-zinc-500 sm:*:data-[slot=icon]:size-5 *:last:data-[slot=icon]:ml-auto *:last:data-[slot=icon]:size-5 sm:*:last:data-[slot=icon]:size-4 *:data-[slot=avatar]:-m-0.5 *:data-[slot=avatar]:size-7 sm:*:data-[slot=avatar]:size-6 data-hover:bg-zinc-950/5 data-hover:*:data-[slot=icon]:fill-zinc-950 data-active:bg-zinc-950/5 data-active:*:data-[slot=icon]:fill-zinc-950 data-current:*:data-[slot=icon]:fill-zinc-950 dark:text-white dark:*:data-[slot=icon]:fill-zinc-400 dark:data-hover:bg-white/5 dark:data-hover:*:data-[slot=icon]:fill-white dark:data-active:bg-white/5 dark:data-active:*:data-[slot=icon]:fill-white dark:data-current:*:data-[slot=icon]:fill-white">
            <span
              className="absolute top-1/2 left-1/2 size-[max(100%,2.75rem)] -translate-x-1/2 -translate-y-1/2 pointer-fine:hidden"
              aria-hidden="true">

          </span>
            <span className="flex min-w-0 items-center gap-3">
              <span data-slot="avatar"
                    className="size-10 [--avatar-radius:20%] outline -outline-offset-1 outline-black/10 dark:outline-white/10 rounded-(--avatar-radius) *:rounded-(--avatar-radius) flex  items-center justify-center overflow-hidden">
                <ProfileIcon/>
                {/*<img className="size-full" src="/profile-photo.jpg" alt=""/>*/}
                </span>
              <span className="min-w-0">
                <span
                  className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-white">{user?.username}</span>
                <span
                  className="block truncate text-xs/5 font-normal text-zinc-500 dark:text-zinc-400">{roleToString(user?.role)}</span>
              </span>
            </span>
            {/*<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"*/}
            {/*     data-slot="icon">*/}
            {/*  <path fill-rule="evenodd"*/}
            {/*        d="M11.78 9.78a.75.75 0 0 1-1.06 0L8 7.06 5.28 9.78a.75.75 0 0 1-1.06-1.06l3.25-3.25a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06Z"*/}
            {/*        clip-rule="evenodd"></path>*/}
            {/*</svg>*/}
          </button>
        </span>
      </div>
    </div>
  )
}

function NavItem({
  href, children, active, icon: Icon
} : React.PropsWithChildren<{ href: string; active: boolean; icon: React.ComponentType<{ className?: string }> }>) {
  return (
    <span className="relative">
      <a
        className={cn(
          "flex w-full items-center gap-3 rounded-lg hover:bg-gray-200 px-2 py-2.5 text-left text-base/6 font-medium text-zinc-950 sm:py-2 sm:text-sm/5 transition-colors",
          active && 'bg-gray-200 text-accent-foreground'
        )}
        href={href}
      >
        <span
          className="absolute top-1/2 left-1/2 size-[max(100%,2.75rem)] -translate-x-1/2 -translate-y-1/2 pointer-fine:hidden"
          aria-hidden="true"></span>
        <Icon className="w-5 h-5 shrink-0" />
        {children}
      </a>
    </span>
  )
}
