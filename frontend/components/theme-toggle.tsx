'use client';

import { useTheme } from '@/lib/theme-context';
import { Moon, Sun } from 'lucide-react';
import { useState } from 'react';

export function ThemeToggle() {
  const { effectiveTheme, toggleTheme, mounted } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    toggleTheme();
    setTimeout(() => setIsAnimating(false), 600);
  };

  if (!mounted) {
    return (
      <button className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 transition-colors" disabled>
        <Sun className="w-5 h-5 text-slate-600 dark:text-slate-300" />
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className={`relative p-2 rounded-lg transition-all duration-300 overflow-hidden group ${
        effectiveTheme === 'dark'
          ? 'bg-slate-800 hover:bg-slate-700 shadow-lg shadow-slate-900/50'
          : 'bg-slate-100 hover:bg-slate-200 shadow-sm shadow-slate-400/20'
      }`}
      aria-label="Toggle theme"
      title={`Switch to ${effectiveTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {/* Animated background shimmer */}
      {isAnimating && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer pointer-events-none" />
      )}

      {/* Sun Icon (visible in light mode) */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
          effectiveTheme === 'dark'
            ? 'opacity-0 scale-50 -rotate-180'
            : 'opacity-100 scale-100 rotate-0'
        } ${isAnimating ? 'animate-icon-flip' : ''}`}
      >
        <Sun className="w-5 h-5 text-amber-500 drop-shadow-md" />
      </div>

      {/* Moon Icon (visible in dark mode) */}
      <div
        className={`flex items-center justify-center transition-all duration-500 ${
          effectiveTheme === 'dark'
            ? 'opacity-100 scale-100 rotate-0'
            : 'opacity-0 scale-50 rotate-180'
        } ${isAnimating ? 'animate-icon-flip' : ''}`}
      >
        <Moon className="w-5 h-5 text-slate-300 drop-shadow-md" />
      </div>

      {/* Glow effect on toggle */}
      {isAnimating && (
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-400/30 to-purple-400/30 dark:from-blue-500/30 dark:to-purple-500/30 animate-pulse pointer-events-none" />
      )}
    </button>
  );
}

export function ThemeToggleCompact() {
  const { effectiveTheme, toggleTheme, mounted } = useTheme();

  if (!mounted) return null;

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 text-sm font-medium ${
        effectiveTheme === 'dark'
          ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
      }`}
      aria-label="Toggle theme"
    >
      {effectiveTheme === 'dark' ? (
        <>
          <Moon className="w-4 h-4" />
          <span>Dark</span>
        </>
      ) : (
        <>
          <Sun className="w-4 h-4" />
          <span>Light</span>
        </>
      )}
    </button>
  );
}
