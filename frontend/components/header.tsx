'use client';

import Link from 'next/link';
import { Bell, LogOut, ChevronDown, Plus, ArrowUpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/stores/authStore';
import { useLogout, useUpgradeToOrganizer } from '@/lib/hooks/useAuthQueries';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';

export function Header() {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isLoggedIn = !!accessToken && !!user;
  const logoutMutation = useLogout();
  const upgradeMutation = useUpgradeToOrganizer();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    try {
      await logoutMutation.mutateAsync();
    } catch {
      useAuthStore.getState().clearCredentials();
    }
    router.push('/login');
  };

  const handleUpgrade = async () => {
    setMenuOpen(false);
    try {
      await upgradeMutation.mutateAsync();
      toast.success('You are now an organizer! You can create events.');
    } catch {
      toast.error('Failed to upgrade. Please try again.');
    }
  };

  const getInitials = () => {
    if (!user?.name) return '?';
    const parts = user.name.trim().split(' ');
    if (parts.length > 1) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return parts[0].charAt(0).toUpperCase();
  };

  return (
    <header className="border-b border-border bg-background sticky top-0 z-40">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-xs">◆</span>
          </div>
          <span>Spot</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/events" className="text-foreground/70 hover:text-foreground transition">
            Events
          </Link>
          <Link href="/locations" className="text-foreground/70 hover:text-foreground transition">
            Locations
          </Link>
          <Link href="/about" className="text-foreground/70 hover:text-foreground transition">
            About
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              {/* Create Event (organizers only) */}
              {user?.role === 'organizer' && (
                <Link href="/organizer/events/new">
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 hidden sm:flex"
                  >
                    <Plus className="w-4 h-4" />
                    Create Event
                  </Button>
                </Link>
              )}

              {/* Notification Bell */}
              <button className="p-2 hover:bg-muted rounded-lg transition relative">
                <Bell className="w-5 h-5" />
              </button>

              {/* User Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 hover:bg-muted rounded-lg px-2 py-1.5 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                    {getInitials()}
                  </div>
                  <span className="hidden md:block text-sm font-medium max-w-[120px] truncate">
                    {user?.name}
                  </span>
                  <ChevronDown className="w-4 h-4 text-foreground/50 hidden md:block" />
                </button>

                {/* Dropdown Menu */}
                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-semibold truncate">{user?.name}</p>
                      <p className="text-xs text-foreground/50 truncate">{user?.email}</p>
                    </div>
                    <Link
                      href="/account"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground/70 hover:bg-muted hover:text-foreground transition"
                    >
                      Account Settings
                    </Link>
                    {user?.role === 'organizer' && (
                      <Link
                        href="/organizer/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground/70 hover:bg-muted hover:text-foreground transition"
                      >
                        Organizer Dashboard
                      </Link>
                    )}
                    <Link
                      href="/my-tickets"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground/70 hover:bg-muted hover:text-foreground transition"
                    >
                      My Tickets
                    </Link>
                    {user?.role === 'user' && (
                      <button
                        onClick={handleUpgrade}
                        disabled={upgradeMutation.isPending}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 transition"
                      >
                        <ArrowUpCircle className="w-4 h-4" />
                        {upgradeMutation.isPending ? 'Upgrading...' : 'Become an Organizer'}
                      </button>
                    )}
                    <div className="border-t border-border mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        disabled={logoutMutation.isPending}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        {logoutMutation.isPending ? 'Signing out...' : 'Sign Out'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden md:block">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup" className="hidden md:block">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Sign Up
                </Button>
              </Link>
              <button className="p-2 hover:bg-muted rounded-lg transition">
                <Bell className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
