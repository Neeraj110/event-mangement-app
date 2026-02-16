'use client';

import Link from 'next/link';
import { LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { useAuthStore } from '@/lib/stores/authStore';
import { useLogout } from '@/lib/hooks/useAuthQueries';
import { useRouter } from 'next/navigation';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

export function DashboardHeader({ title }: DashboardHeaderProps) {
  const user = useAuthStore((state) => state.user);
  const clearCredentials = useAuthStore((state) => state.clearCredentials);
  const logoutMutation = useLogout();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch {
      // Even if logout API fails, clear local state
      clearCredentials();
    }
    router.push('/login');
  };

  const getInitials = () => {
    if (!user?.name) return '?';
    const parts = user.name.split(' ');
    if (parts.length > 1) {
      return parts[0].charAt(0) + parts[parts.length - 1].charAt(0);
    }
    return parts[0].charAt(0);
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-lg font-bold hidden sm:inline">Spot</span>
            </Link>
            <span className="text-foreground/40 hidden sm:inline">|</span>
            <h1 className="text-lg font-semibold hidden sm:inline">{title}</h1>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">


            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
                {getInitials()}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium">{user?.name || 'User'}</p>
                <p className="text-xs text-foreground/60">{user?.role || ''}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-foreground/40" />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">
                {logoutMutation.isPending ? 'Signing Out...' : 'Sign Out'}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
