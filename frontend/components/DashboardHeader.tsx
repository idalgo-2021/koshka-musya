"use client";
import Link from "next/link";
import UserProfileMenu from "./UserProfileMenu";

interface DashboardHeaderProps {
  username?: string;
  onLogout: () => void;
}

export default function DashboardHeader({ username, onLogout }: DashboardHeaderProps) {
  return (
    <header className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-white/20 relative z-50">
      <div className="max-w-md mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/dashboard">
               <h1 className="text-md md:text-2xl font-bold text-accenttext font-accent">
                Secret Guest
              </h1>
            </Link>
          </div>
          <div className="flex items-center">
            {username && <UserProfileMenu username={username} onLogout={onLogout} />}
          </div>
        </div>
      </div>
    </header>
  );
}
