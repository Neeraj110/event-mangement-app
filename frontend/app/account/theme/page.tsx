'use client';

import { DashboardHeader } from '@/components/dashboard-header';
import { SettingsSidebar } from '@/components/settings-sidebar';
import { ThemeSettings } from '@/components/theme-settings';

export default function ThemePage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="Theme & Display" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <SettingsSidebar />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-lg border border-border p-8 animate-slide-in-up">
              <ThemeSettings />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
