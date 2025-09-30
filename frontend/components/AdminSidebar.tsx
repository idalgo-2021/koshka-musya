"use client"

import {usePathname, useRouter} from 'next/navigation'
import * as React from 'react'
import {cn} from '@/lib/utils'
import {roleToString, useAuth, User} from "@/entities/auth/useAuth";
import {ProfileIcon} from "@/components/icons/ProfileIcon";

const navItems = [
  {href: '/admin', label: 'Дашборд'},
  {href: '/admin/listings', label: 'Объекты размещения'},
  {href: '/admin/listingTypes', label: 'Типы объектов'},
  {href: '/admin/assignments', label: 'Предложения'},
  // { href: '/admin/answerTypes', label: 'Типы ответов' },
  {href: '/admin/reports', label: 'Отчеты'},
  {href: '/admin/checklists', label: 'Настройка анкет'},
  {href: '/admin/mediaRequirements', label: 'Media Requirements'},
  {href: '/admin/users', label: 'Пользователи'},
  {href: '/admin/profiles', label: 'Статистика пользователей'},
  {href: '/admin/sg_reservations', label: 'SG Reservations'},
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
  const {user} = useAuth();

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
      <UserCard user={user}/>
      {/*<div className="px-4 py-4 text-sm font-semibold text-muted-foreground">{formatUser(user)}</div>*/}
      <nav className="flex flex-col gap-0.5">
        {navItems.map(item => {
          const active = pathname === item.href || pathname?.startsWith(item.href + '/')
          return (
            <NavItem href={item.href} key={item.href} active={active}>
              {item.label}
            </NavItem>
            // <Link
            //   key={item.href}
            //   href={item.href}
            //   className={cn(
            //     'rounded-md px-3 py-2 text-sm transition-colors',
            //     active
            //       ? 'bg-accent text-accent-foreground'
            //       : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            //   )}
            // >
            //   {item.label}
            // </Link>
          )
        })}
        <button
          className="justify-start pointer-events-auto group cursor-default rounded-lg px-3.5 py-2.5 focus:outline-hidden sm:px-3 sm:py-1.5 text-left text-base/6 text-zinc-950 sm:text-sm/6 dark:text-white forced-colors:text-[CanvasText] data-focus:bg-blue-500 data-focus:text-white data-disabled:opacity-50 forced-color-adjust-none forced-colors:data-focus:bg-[Highlight] forced-colors:data-focus:text-[HighlightText] forced-colors:data-focus:*:data-[slot=icon]:text-[HighlightText] col-span-full grid grid-cols-[auto_1fr_1.5rem_0.5rem_auto] items-center supports-[grid-template-columns:subgrid]:grid-cols-subgrid *:data-[slot=icon]:col-start-1 *:data-[slot=icon]:row-start-1 *:data-[slot=icon]:mr-2.5 *:data-[slot=icon]:-ml-0.5 *:data-[slot=icon]:size-5 sm:*:data-[slot=icon]:mr-2 sm:*:data-[slot=icon]:size-4 *:data-[slot=icon]:text-zinc-500 data-focus:*:data-[slot=icon]:text-white dark:*:data-[slot=icon]:text-zinc-400 dark:data-focus:*:data-[slot=icon]:text-white *:data-[slot=avatar]:mr-2.5 *:data-[slot=avatar]:-ml-1 *:data-[slot=avatar]:size-6 sm:*:data-[slot=avatar]:mr-2 sm:*:data-[slot=avatar]:size-5"
          type="button"
          onClick={onLogout}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"
               data-slot="icon">
            <path fill-rule="evenodd"
                  d="M2 4.75A2.75 2.75 0 0 1 4.75 2h3a2.75 2.75 0 0 1 2.75 2.75v.5a.75.75 0 0 1-1.5 0v-.5c0-.69-.56-1.25-1.25-1.25h-3c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h3c.69 0 1.25-.56 1.25-1.25v-.5a.75.75 0 0 1 1.5 0v.5A2.75 2.75 0 0 1 7.75 14h-3A2.75 2.75 0 0 1 2 11.25v-6.5Zm9.47.47a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1 0 1.06l-2.25 2.25a.75.75 0 1 1-1.06-1.06l.97-.97H5.25a.75.75 0 0 1 0-1.5h7.19l-.97-.97a.75.75 0 0 1 0-1.06Z"
                  clip-rule="evenodd"></path>
          </svg>
          <div data-slot="label" className="col-start-2 row-start-1">Выйти</div>
        </button>
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
  href, children, active
} : React.PropsWithChildren<{ href: string; active: boolean }>) {
  return (
    // <div data-slot="section" className="max-lg:hidden flex flex-col gap-0.5">
    //   <h3 className="mb-1 px-2 text-xs/6 font-medium text-zinc-500 dark:text-zinc-400">Upcoming Events</h3>
    <span className="relative">
      <a
        className={cn(
          "flex w-full items-center gap-3 rounded-lg hover:bg-gray-10 px-2 py-2.5 text-left text-base/6 font-medium text-zinc-950 sm:py-2 sm:text-sm/5 *:data-[slot=icon]:size-6 *:data-[slot=icon]:shrink-0 *:data-[slot=icon]:fill-zinc-500 sm:*:data-[slot=icon]:size-5 *:last:data-[slot=icon]:ml-auto *:last:data-[slot=icon]:size-5 sm:*:last:data-[slot=icon]:size-4 *:data-[slot=avatar]:-m-0.5 *:data-[slot=avatar]:size-7 sm:*:data-[slot=avatar]:size-6 data-hover:bg-zinc-950/5 data-hover:*:data-[slot=icon]:fill-zinc-950 data-active:bg-zinc-950/5 data-active:*:data-[slot=icon]:fill-zinc-950 data-current:*:data-[slot=icon]:fill-zinc-950 dark:text-white dark:*:data-[slot=icon]:fill-zinc-400 dark:data-hover:bg-white/5 dark:data-hover:*:data-[slot=icon]:fill-white dark:data-active:bg-white/5 dark:data-active:*:data-[slot=icon]:fill-white dark:data-current:*:data-[slot=icon]:fill-white",
          active && 'bg-gray-50 text-accent-foreground'
        )}
        type="button" data-headlessui-state="" href={href}
      >
        <span
          className="absolute top-1/2 left-1/2 size-[max(100%,2.75rem)] -translate-x-1/2 -translate-y-1/2 pointer-fine:hidden"
          aria-hidden="true"></span>
        {children}
      </a>
    </span>
    // </div>
  )
}
