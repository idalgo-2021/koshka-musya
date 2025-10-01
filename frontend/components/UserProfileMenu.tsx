"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/entities/auth/useUserProfile";
import UserRatingBadge from "./UserRatingBadge";

interface UserProfileMenuProps {
  username: string;
  onLogout: () => void;
}

export default function UserProfileMenu({ username, onLogout }: UserProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { profile } = useUserProfile();

  // Закрытие меню при клике вне его
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMenuClick = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  const menuItems = [
    {
      label: "Статус участия",
      path: "/profile/status",
      icon: "📊"
    },
    {
      label: "История",
      path: "/profile/history",
      icon: "✈️"
    },
    {
      label: "Памятка",
      path: "/profile/memo",
      icon: "❓"
    },
    {
      label: "Настройки профиля",
      path: "/profile/settings",
      icon: "⚙️"
    }
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* Кнопка с никнеймом */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-accenttext/70 hover:text-accenttext transition-colors cursor-pointer"
      >
        <div className="w-8 h-8 bg-accenttext rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">
            {username?.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex flex-col items-start cursor-pointer">
          <span className="text-sm font-medium text-accenttext">{username}</span>
          {profile && (
            <UserRatingBadge profile={profile} size="sm" starsOnly={true} />
          )}
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Выпадающее меню */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[99999]">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">Личный кабинет</p>
            <p className="text-xs text-gray-500 mt-1">{username}</p>
          </div>

          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleMenuClick(item.path)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3 cursor-pointer"
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm text-gray-700">{item.label}</span>
            </button>
          ))}

          <div className="border-t border-gray-100 mt-2 pt-2">
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3 cursor-pointer"
            >
              <span className="text-lg">🚪</span>
              <span className="text-sm text-red-600">Выйти</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
