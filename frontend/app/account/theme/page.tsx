'use client';

import { DashboardHeader } from '@/components/dashboard-header';
import { SettingsSidebar } from '@/components/settings-sidebar';
import { Sun } from 'lucide-react';

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
            <div className="bg-card rounded-lg border border-border p-8">
              <h3 className="text-lg font-semibold mb-2">Theme</h3>
              <p className="text-sm text-foreground/60 mb-6">
                Your app is set to light mode.
              </p>
              <div className="inline-flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-blue-600 bg-blue-50">
                <Sun className="w-5 h-5 text-blue-600" />
                <div>
                  <span className="font-semibold text-blue-600">Light</span>
                  <p className="text-sm text-blue-600">Currently active</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
