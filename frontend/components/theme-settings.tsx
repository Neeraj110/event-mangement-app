'use client';

import React from "react"

import { useTheme } from '@/lib/theme-context';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';

export function ThemeSettings() {
  const { theme, effectiveTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const themes: Array<{
    id: 'light' | 'dark' | 'system';
    label: string;
    icon: React.ReactNode;
    description: string;
  }> = [
    {
      id: 'light',
      label: 'Light',
      icon: <Sun className="w-5 h-5" />,
      description: 'Always use light theme',
    },
    {
      id: 'dark',
      label: 'Dark',
      icon: <Moon className="w-5 h-5" />,
      description: 'Always use dark theme',
    },
    {
      id: 'system',
      label: 'System',
      icon: <Monitor className="w-5 h-5" />,
      description: 'Follow system preferences',
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Theme</h3>
        <p className="text-sm text-foreground/60 mb-4">
          Choose how you want Spot to look. Select a single theme, or let it match your system settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {themes.map(({ id, label, icon, description }) => (
          <button
            key={id}
            onClick={() => setTheme(id)}
            className={`p-4 rounded-lg border-2 transition-all duration-300 text-left group ${
              theme === id
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-950'
                : 'border-border hover:border-blue-400 dark:hover:border-blue-600'
            }`}
          >
            <div className={`flex items-center gap-3 mb-2 ${theme === id ? 'text-blue-600' : 'text-foreground'}`}>
              {icon}
              <span className="font-semibold">{label}</span>
            </div>
            <p className={`text-sm ${theme === id ? 'text-blue-600' : 'text-foreground/60'}`}>
              {description}
            </p>
            {theme === id && (
              <div className="mt-3 text-xs font-semibold text-blue-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                Currently selected
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <strong>Current theme:</strong> {effectiveTheme === 'dark' ? 'Dark' : 'Light'}
          {theme === 'system' && ' (following system preferences)'}
        </p>
      </div>
    </div>
  );
}
