'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard-header';
import { EventForm } from '@/components/event-form';
import { useEventById } from '@/lib/hooks/useEventQueries';

export default function EditEventPage() {
    const params = useParams();
    const eventId = params.id as string;
    const { data: eventData, isLoading } = useEventById(eventId);

    // The hook returns { event: Event } from the API
    const event = (eventData as any)?.event || eventData;

    return (
        <div className="min-h-screen bg-background">
            <DashboardHeader title="Edit Event" />

            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-1.5 text-sm text-foreground/50 mb-6">
                    <Link
                        href="/organizer/events"
                        className="hover:text-foreground transition"
                    >
                        My Events
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-foreground font-medium">Edit</span>
                </nav>

                {/* Title */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold">Edit Event</h1>
                    <p className="text-sm text-foreground/60 mt-1">
                        Update the details of your event.
                    </p>
                </div>

                {/* Form */}
                <div className="bg-card border border-border rounded-xl p-6 sm:p-8">
                    {isLoading ? (
                        <div className="text-center py-12 text-foreground/50">
                            Loading event details...
                        </div>
                    ) : event ? (
                        <EventForm mode="edit" event={event} />
                    ) : (
                        <div className="text-center py-12 text-foreground/50">
                            Event not found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
