// components/AdminBottomNav.tsx
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Building, List, FileText, Settings, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  refreshListings,
  refreshAssignments,
  refreshReports
} from '@/utils/eventBus';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const navItems = [
  { name: 'Домой', href: '/admin', icon: Home, refreshFn: null },
  { name: 'Отели', href: '/admin/listings', icon: Building, refreshFn: refreshListings },
  { name: 'Предложения', href: '/admin/assignments', icon: List, refreshFn: refreshAssignments },
  { name: 'Отчеты', href: '/admin/reports', icon: FileText, refreshFn: refreshReports },
  { name: 'Анкеты', href: '/admin/checklists/editor', icon: Settings, refreshFn: null },
];

export default function AdminBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const scrollToTop = useScrollToTop();

  const handleNavClick = (item: typeof navItems[0]) => {
    const isActive = item.href === '/admin' ? pathname === item.href : (pathname === item.href || pathname?.startsWith(item.href + '/'));
    const scrollPosition = window.scrollY;

    if (isActive && scrollPosition > 10) {
      // If tab is active and scrolled more than 10px, scroll to top and refresh
      scrollToTop();
      if (item.refreshFn) {
        item.refreshFn();
      }
    } else {
      // If tab is inactive, just navigate
      router.push(item.href);
    }
  };

  return (
    <nav className="fixed bg-white border-t border-gray-200 bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="flex flex-1 flex-row px-2 pt-2 pb-3 sm:px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.href === '/admin' ? pathname === item.href : (pathname === item.href || pathname?.startsWith(item.href + '/'));

          return (
            <button
              key={item.href}
              onClick={() => handleNavClick(item)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 px-2 py-2 rounded-lg text-xs font-medium transition-colors",
                active
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-center leading-tight">{item.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}


