// components/AdminNavbar.js
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Hotels', href: '/admin/listings' },
  { name: 'Tasks', href: '/admin/assignments' },
  { name: 'Reports', href: '/admin/reports' },
  { name: 'Forms', href: '/admin/checklists' },
  { name: 'Media', href: '/admin/mediaRequirements' },
];

export default function AdminBottomNav() {
  const pathname = usePathname();


  return (
    <nav className="fixed bg-white justify-between bottom-0 left-0 right-0 z-50">
        <div className="md:hidden">
          <div className="flex flex-1 flex-row px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === item.href
                    ? 'bg-gray-900 text-white'
                    : 'text-black hover:bg-gray-700'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      {/*)}*/}
    </nav>
  );
}
