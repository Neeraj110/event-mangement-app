'use client';

import Link from 'next/link';
import { Bell, LogOut, ChevronDown, Plus, ArrowUpCircle, Menu, X } from 'lucide-react';
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close desktop dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when mobile nav is open
  useEffect(() => {
    if (mobileNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileNavOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    setMobileNavOpen(false);
    try {
      await logoutMutation.mutateAsync();
    } catch {
      useAuthStore.getState().clearCredentials();
    }
    router.push('/login');
  };

  const handleUpgrade = async () => {
    setMenuOpen(false);
    setMobileNavOpen(false);
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
              {/* Create Event (organizers only) — desktop */}
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

              {/* Desktop User Menu */}
              <div className="relative hidden md:block" ref={menuRef}>
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

                {/* Desktop Dropdown Menu */}
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

              {/* Mobile Hamburger — logged in */}
              <button
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="md:hidden p-2 hover:bg-muted rounded-lg transition"
                aria-label="Toggle mobile menu"
              >
                {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </>
          ) : (
            <>
              {/* Desktop auth buttons */}
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

              {/* Mobile Hamburger — logged out */}
              <button
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="md:hidden p-2 hover:bg-muted rounded-lg transition"
                aria-label="Toggle mobile menu"
              >
                {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ─── Mobile Navigation Panel ─── */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 md:hidden ${mobileNavOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setMobileNavOpen(false)}
      />

      {/* Slide-down panel */}
      <div
        className={`fixed top-16 left-0 right-0 bg-background border-b border-border shadow-xl z-50 transition-all duration-300 ease-in-out md:hidden overflow-y-auto ${mobileNavOpen
            ? 'max-h-[calc(100vh-4rem)] opacity-100 translate-y-0'
            : 'max-h-0 opacity-0 -translate-y-2 pointer-events-none'
          }`}
      >
        <div className="px-5 py-4 space-y-1">
          {/* Nav Links */}
          <Link
            href="/events"
            onClick={() => setMobileNavOpen(false)}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-foreground/80 hover:bg-muted hover:text-foreground font-medium transition"
          >
            Events
          </Link>
          <Link
            href="/locations"
            onClick={() => setMobileNavOpen(false)}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-foreground/80 hover:bg-muted hover:text-foreground font-medium transition"
          >
            Locations
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileNavOpen(false)}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-foreground/80 hover:bg-muted hover:text-foreground font-medium transition"
          >
            About
          </Link>

          <div className="border-t border-border my-3" />

          {isLoggedIn ? (
            <>
              {/* User Info */}
              <div className="flex items-center gap-3 px-3 py-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                  {getInitials()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold truncate">{user?.name}</p>
                  <p className="text-xs text-foreground/50 truncate">{user?.email}</p>
                </div>
              </div>

              <div className="border-t border-border my-3" />

              {/* Create Event (organizers) */}
              {user?.role === 'organizer' && (
                <Link
                  href="/organizer/events/new"
                  onClick={() => setMobileNavOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-blue-600 hover:bg-blue-50 font-medium transition"
                >
                  <Plus className="w-5 h-5" />
                  Create Event
                </Link>
              )}

              {/* Organizer Dashboard */}
              {user?.role === 'organizer' && (
                <Link
                  href="/organizer/dashboard"
                  onClick={() => setMobileNavOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-foreground/80 hover:bg-muted hover:text-foreground font-medium transition"
                >
                  Organizer Dashboard
                </Link>
              )}

              <Link
                href="/account"
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-foreground/80 hover:bg-muted hover:text-foreground font-medium transition"
              >
                Account Settings
              </Link>
              <Link
                href="/my-tickets"
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-foreground/80 hover:bg-muted hover:text-foreground font-medium transition"
              >
                My Tickets
              </Link>

              {/* Upgrade to organizer */}
              {user?.role === 'user' && (
                <button
                  onClick={handleUpgrade}
                  disabled={upgradeMutation.isPending}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-blue-600 hover:bg-blue-50 font-medium transition"
                >
                  <ArrowUpCircle className="w-5 h-5" />
                  {upgradeMutation.isPending ? 'Upgrading...' : 'Become an Organizer'}
                </button>
              )}

              <div className="border-t border-border my-3" />

              <button
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium transition"
              >
                <LogOut className="w-5 h-5" />
                {logoutMutation.isPending ? 'Signing out...' : 'Sign Out'}
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link href="/login" onClick={() => setMobileNavOpen(false)}>
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setMobileNavOpen(false)}>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
