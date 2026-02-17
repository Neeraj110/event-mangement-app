'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardHeader } from '@/components/dashboard-header';
import { TicketCard } from '@/components/ticket-card';
import { useUserTickets } from '@/lib/hooks/useTicketQueries';
import { Suspense } from 'react';

function MyTicketsContent() {
    const { data: tickets, isLoading, error } = useUserTickets();
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    const [searchQuery, setSearchQuery] = useState('');

    const { upcoming, past } = useMemo(() => {
        if (!tickets || tickets.length === 0) return { upcoming: [], past: [] };

        const now = new Date();
        const upcomingTickets: any[] = [];
        const pastTickets: any[] = [];

        tickets.forEach((ticket: any) => {
            const event = ticket.eventId;
            if (!event) return;
            const eventDate = new Date(event.startDate);
            if (eventDate >= now && ticket.status !== 'cancelled') {
                upcomingTickets.push(ticket);
            } else {
                pastTickets.push(ticket);
            }
        });

        return { upcoming: upcomingTickets, past: pastTickets };
    }, [tickets]);

    const currentTickets = activeTab === 'upcoming' ? upcoming : past;

    const filteredTickets = currentTickets.filter((ticket: any) => {
        const event = ticket.eventId;
        const query = searchQuery.toLowerCase();
        return (
            event?.title?.toLowerCase().includes(query) ||
            ticket.ticketCode?.toLowerCase().includes(query)
        );
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <DashboardHeader title="My Tickets" subtitle="Manage your bookings and access passes" />
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background">
                <DashboardHeader title="My Tickets" subtitle="Manage your bookings and access passes" />
                <div className="flex items-center justify-center py-20">
                    <p className="text-red-500">Failed to load tickets. Please try again.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <DashboardHeader title="My Tickets" subtitle="Manage your bookings and access passes" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
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
                            Upcoming ({upcoming.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('past')}
                            className={`py-4 px-1 border-b-2 font-medium transition ${activeTab === 'past'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-foreground/60 hover:text-foreground'
                                }`}
                        >
                            Past Events ({past.length})
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
                        {filteredTickets.map((ticket: any) => (
                            <TicketCard key={ticket._id} ticket={ticket} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="inline-block p-4 bg-muted rounded-lg mb-4">
                            <svg className="w-12 h-12 text-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
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
