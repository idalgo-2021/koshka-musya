"use client"

import {usePathname} from 'next/navigation'
import * as React from 'react'
import {cn} from '@/lib/utils'
import {roleToString, User} from "@/entities/auth/useAuth";
import {ProfileIcon} from "@/components/icons/ProfileIcon";
import {Home, FileText, Settings, Building, Users, List, BarChart3, Tag, Image, LogOut, ChevronLeft, ChevronRight} from 'lucide-react'
import {useUser} from "@/entities/auth/SessionContext";
import {useLogout} from "@/entities/auth/SessionActionContext";
import { useSidebar } from '@/state/contexts/SidebarContext';

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

export default function AdminSidebar() {
  const pathname = usePathname()
  const user = useUser();
  const onLogout = useLogout()
  const { isCollapsed, toggleCollapse } = useSidebar()

  return (
    <aside className={cn(
      "lg:bg-zinc-100 dark:bg-zinc-900 dark:lg:bg-zinc-950 shrink-0 border-r z-1000 bg-background/50 flex flex-col h-[100svh] fixed top-0 transition-all duration-300 ease-in-out",
      isCollapsed ? "w-16 p-2" : "w-60 p-4"
    )}>
      {/* Collapse Toggle Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={toggleCollapse}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors relative group"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={`${isCollapsed ? "Expand" : "Collapse"} sidebar (Press [ to toggle)`}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}

          {/* Keyboard shortcut badge */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-[8px] text-white font-bold">[</span>
          </div>

          {/* Tooltip with shortcut info */}
          <div className="absolute z-50 left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            {isCollapsed ? "Expand" : "Collapse"} sidebar
            <div className="text-gray-300 text-xs mt-1">
              Press <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">[</kbd> to toggle
            </div>
            <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-r-4 border-r-gray-900 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
          </div>
        </button>
      </div>

      <UserCard user={user} isCollapsed={isCollapsed}/>
      <nav className="flex flex-col gap-2">
        {navItems.map(item => {
          const active = pathname === item.href || pathname?.startsWith(item.href + '/')
          return (
            <NavItem
              href={item.href}
              key={item.href}
              active={active}
              icon={item.icon}
              isCollapsed={isCollapsed}
            >
              {item.label}
            </NavItem>
          )
        })}
        <div className="py-2 border-t border-gray-200">
          <button
            onClick={onLogout}
            className={cn(
              "flex items-center rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full text-left",
              isCollapsed ? "px-3 py-3 justify-center" : "gap-3 px-3 py-3"
            )}
            title={isCollapsed ? "Выйти" : undefined}
          >
            <LogOut className="w-5 h-5"/>
            {!isCollapsed && <span className="font-medium">Выйти</span>}
          </button>
        </div>
      </nav>
    </aside>
  )
}

function UserCard({user, isCollapsed}: { user: User | null; isCollapsed: boolean }) {
  return (
    <div className={cn(
      "flex border-t border-zinc-950/5 dark:border-white/5 transition-all duration-300",
      isCollapsed ? "flex-col items-center p-2" : "flex-col p-4"
    )}>
      <div className={cn(
        "flex items-center transition-all duration-300",
        isCollapsed ? "flex-col gap-2" : "gap-3"
      )}>
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <ProfileIcon />
        </div>
        {!isCollapsed && (
          <div className="transition-all duration-300">
            <p className="text-sm font-medium text-gray-900">{user?.username}</p>
            <p className="text-xs text-gray-500">{roleToString(user?.role)}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function NavItem({
  href, children, active, icon: Icon, isCollapsed
} : React.PropsWithChildren<{
  href: string;
  active: boolean;
  icon: React.ComponentType<{ className?: string }>;
  isCollapsed: boolean;
}>) {
  return (
    <span className="relative">
      <a
        className={cn(
          "flex w-full items-center rounded-lg hover:bg-gray-200 text-left text-base/6 font-medium text-zinc-950 sm:text-sm/5 transition-all duration-300",
          active && 'bg-gray-200 text-accent-foreground',
          isCollapsed ? "px-2 py-2.5 justify-center" : "gap-3 px-2 py-2.5"
        )}
        href={href}
        title={isCollapsed ? children as string : undefined}
      >
        <span
          className="absolute top-1/2 left-1/2 size-[max(100%,2.75rem)] -translate-x-1/2 -translate-y-1/2 pointer-fine:hidden"
          aria-hidden="true"></span>
        <Icon className="w-5 h-5 shrink-0" />
        {!isCollapsed && (
          <span className="transition-all duration-300">
            {children}
          </span>
        )}
      </a>
    </span>
  )
}
