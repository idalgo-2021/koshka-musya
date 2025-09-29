"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface DashboardHeaderProps {
  username?: string;
  onLogout: () => void;
}

export default function DashboardHeader({ username, onLogout }: DashboardHeaderProps) {
  return (
    <header className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-white/20">
      <div className="max-w-md mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/dashboard">
               <h1 className="text-md md:text-2xl font-bold text-accenttext font-accent">
                Secret Guest
              </h1>
            </Link>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-accenttext/70">
              <div className="w-8 h-8 bg-accenttext rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium text-accenttext">{username}</span>
            </div>
            <Button
              onClick={onLogout}
              variant="outline"
              className="border-accenttext/30 text-accenttext/70 hover:text-accenttext hover:bg-accenttext/20 hover:border-accenttext/50 text-sm px-3 py-1.5 bg-white/10"
            >
              Выйти
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
