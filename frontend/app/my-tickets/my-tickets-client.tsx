'use client';

import { useState } from 'react';
import Link from 'next/link';
// @ts-ignore
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardHeader } from '@/components/dashboard-header';
import { TicketCard } from '@/components/ticket-card';
import { useTicketsStore } from '@/lib/stores/ticketsStore';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function MyTicketsContent() {
    const tickets = useTicketsStore();
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    const [searchQuery, setSearchQuery] = useState('');
    const searchParams = useSearchParams();

    const currentTickets = activeTab === 'upcoming' ? tickets.upcoming : tickets.past;

    const filteredTickets = currentTickets.filter(
        (ticket) =>
            ticket.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const tabCounts = {
        upcoming: tickets.upcoming.length,
        past: tickets.past.length,
    };

    return (
        <div className="min-h-screen bg-background">
            <DashboardHeader title="My Tickets" subtitle="Manage your bookings and access passes" />

            {/* Main Content */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div>
                    <h1 className="text-3xl font-bold mb-2">My Tickets</h1>
                    <p className="text-foreground/60 mb-8">
                        Manage your bookings and access your entry passes.
                    </p>
                </div>

                {/* Tabs */}
                <div className="border-b border-border mb-8">
                    <div className="flex gap-8">
                        <button
                            onClick={() => setActiveTab('upcoming')}
                            className={`py-4 px-1 border-b-2 font-medium transition ${activeTab === 'upcoming'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-foreground/60 hover:text-foreground'
                                }`}
                        >
                            Upcoming ({tabCounts.upcoming})
                        </button>
                        <button
                            onClick={() => setActiveTab('past')}
                            className={`py-4 px-1 border-b-2 font-medium transition ${activeTab === 'past'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-foreground/60 hover:text-foreground'
                                }`}
                        >
                            Past Events ({tabCounts.past})
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-8">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                        <input
                            type="text"
                            placeholder="Search by event name or ticket ID..."
                            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Tickets Grid */}
                {filteredTickets.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTickets.map((ticket) => (
                            <TicketCard key={ticket.id} {...ticket} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="inline-block p-4 bg-muted rounded-lg mb-4">
                            <svg className="w-12 h-12 text-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m0 0h6m0-6h6" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">
                            No {activeTab === 'upcoming' ? 'upcoming' : 'past'} tickets
                        </h3>
                        <p className="text-foreground/60 mb-6">
                            {activeTab === 'upcoming'
                                ? 'You don\'t have any upcoming events. Explore and book tickets now.'
                                : 'No past events found.'}
                        </p>
                        {activeTab === 'upcoming' && (
                            <Link href="/events">
                                <Button className="bg-blue-600 hover:bg-blue-700">Browse Events</Button>
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export function MyTicketsClient() {
    return (
        <Suspense fallback={<div>Loading tickets...</div>}>
            <MyTicketsContent />
        </Suspense>
    );
}
