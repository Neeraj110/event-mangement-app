'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardHeader } from '@/components/dashboard-header';
import { PassCard } from '@/components/pass-card';
import { usePassesStore } from '@/lib/stores/passesStore';

export default function MyPassesPage() {
  const passes = usePassesStore();
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'expired'>('active');

  const currentPasses =
    activeTab === 'active'
      ? passes.activePasses
      : activeTab === 'upcoming'
        ? passes.upcomingPasses
        : passes.expiredPasses;

  const tabCounts = {
    active: passes.activePasses.length,
    upcoming: passes.upcomingPasses.length,
    expired: passes.expiredPasses.length,
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="My Passes" subtitle="Premium Access Dashboard" />

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Passes</h1>
            <p className="text-foreground/60">
              You have {tabCounts.active} active seasonal memberships.
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Buy New Pass
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-border mb-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('active')}
              className={`py-4 px-1 border-b-2 font-medium transition ${activeTab === 'active'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-foreground/60 hover:text-foreground'
                }`}
            >
              Active{' '}
              <span className={`ml-2 ${activeTab === 'active' ? 'bg-blue-600 text-white' : 'bg-muted'} px-2 py-1 rounded text-xs`}>
                {tabCounts.active}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`py-4 px-1 border-b-2 font-medium transition ${activeTab === 'upcoming'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-foreground/60 hover:text-foreground'
                }`}
            >
              Upcoming{' '}
              <span className={`ml-2 ${activeTab === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-muted'} px-2 py-1 rounded text-xs`}>
                {tabCounts.upcoming}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('expired')}
              className={`py-4 px-1 border-b-2 font-medium transition ${activeTab === 'expired'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-foreground/60 hover:text-foreground'
                }`}
            >
              Expired{' '}
              <span className={`ml-2 ${activeTab === 'expired' ? 'bg-blue-600 text-white' : 'bg-muted'} px-2 py-1 rounded text-xs`}>
                {tabCounts.expired}
              </span>
            </button>
          </div>
        </div>

        {/* Passes Grid */}
        {currentPasses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentPasses.map((pass) => (
              <PassCard key={pass.id} {...pass} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-block p-4 bg-muted rounded-lg mb-4">
              <svg className="w-12 h-12 text-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m0 0h6m0-6h6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">No {activeTab} passes</h3>
            <p className="text-foreground/60 mb-6">
              {activeTab === 'active' && 'You don\'t have any active passes yet. Explore events and purchase a pass to get started.'}
              {activeTab === 'upcoming' && 'You don\'t have any upcoming passes yet.'}
              {activeTab === 'expired' && 'You don\'t have any expired passes yet.'}
            </p>
            {activeTab === 'active' && (
              <Link href="/events">
                <Button className="bg-blue-600 hover:bg-blue-700">Explore Events</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
