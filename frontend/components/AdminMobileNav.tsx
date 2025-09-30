"use client"

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Menu, X, Home, FileText, Settings, Building, Users, List, BarChart3, LogOut, Tag, Image } from 'lucide-react'
import { cn } from '@/lib/utils'
// import { useAuth, roleToString } from '@/entities/auth/useAuth'
import { ProfileIcon } from '@/components/icons/ProfileIcon'
import {useUser} from "@/entities/auth/SessionContext";
import {roleToString} from "@/entities/auth/useAuth";

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

export default function AdminMobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const user = useUser()

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  const handleLogout = () => {
    try {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    } catch {
      // Handle error silently
    }
    window.location.href = '/'
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Открыть меню"
            >
              {isOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Админ панель</h1>
          </div>

          {/* User Avatar */}
          <div className="flex items-center gap-3">
            {/*{isOpen ? (*/}
              <div>
                <p className="font-medium text-gray-900">{user?.username}</p>
                <p className="text-sm text-gray-500">{roleToString(user?.role)}</p>
              </div>
            {/*) : undefined}*/}
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <ProfileIcon/>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 0 bg-black/50 backdrop-blur" onClick={closeMenu}>
          <div className="absolute top-0 left-0 right-0 bg-white shadow-lg">
            {/* User Info */}
            <div className="px-4 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <ProfileIcon />
                </div>
              </div>
            </div>

            {/* Navigation Items */}
            <nav className="px-4 py-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = pathname === item.href || pathname?.startsWith(item.href + '/')

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors",
                      active && "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Logout Button */}
            <div className="px-4 py-2 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full text-left"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Выйти</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
