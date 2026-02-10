'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Bell, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/lib/hooks';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const user = useAppSelector((state) => state.auth.user);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="border-b border-border bg-background sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">◆</span>
            </div>
            <span>Spot</span>
          </Link>
          <div className="hidden md:block border-l border-border pl-4">
            <p className="text-sm text-foreground/60">{title}</p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-muted rounded-lg transition">
            <Bell className="w-5 h-5" />
          </button>
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white font-semibold hover:opacity-90 transition"
            >
              {user?.firstName.charAt(0)}
            </button>
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-2 z-50">
                <div className="px-4 py-2 border-b border-border">
                  <p className="font-semibold text-sm">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-foreground/60">{user?.email}</p>
                </div>
                <Link href="/account">
                  <button className="w-full text-left px-4 py-2 hover:bg-muted transition text-sm">
                    Account Settings
                  </button>
                </Link>
                <button className="w-full text-left px-4 py-2 hover:bg-muted transition text-sm flex items-center gap-2 text-red-600">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
