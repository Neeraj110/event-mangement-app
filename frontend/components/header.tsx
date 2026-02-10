'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';


export function Header() {
  const [isOpen, setIsOpen] = useState(false);

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
        <div className="flex items-center gap-4">
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
          <button className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white font-semibold">
            A
          </button>
        </div>
      </nav>
    </header>
  );
}
