// components/AdminBottomNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building, List, FileText, Settings, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Home', href: '/admin', icon: Home },
  { name: 'Hotels', href: '/admin/listings', icon: Building },
  { name: 'Tasks', href: '/admin/assignments', icon: List },
  { name: 'Reports', href: '/admin/reports', icon: FileText },
  { name: 'Forms', href: '/admin/checklists/editor', icon: Settings },
];

export default function AdminBottomNav() {
  const pathname = usePathname();


  return (
    <nav className="fixed bg-white border-t border-gray-200 bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="flex flex-1 flex-row px-2 pt-2 pb-3 sm:px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          
          const active = item.href === '/admin' ? pathname === item.href : (pathname === item.href || pathname?.startsWith(item.href + '/'));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 px-2 py-2 rounded-lg text-xs font-medium transition-colors",
                active 
                  ? "text-blue-600 bg-blue-50" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-center leading-tight">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
