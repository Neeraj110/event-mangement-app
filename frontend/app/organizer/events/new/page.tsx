'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard-header';
import { EventForm } from '@/components/event-form';

export default function CreateEventPage() {
    return (
        <div className="min-h-screen bg-background">
            <DashboardHeader title="Create Event" />

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
                    <span className="text-foreground font-medium">New Event</span>
                </nav>

                {/* Title */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold">Create New Event</h1>
                    <p className="text-sm text-foreground/60 mt-1">
                        Fill in the details below to publish your event to the community.
                    </p>
                </div>

                {/* Form */}
                <div className="bg-card border border-border rounded-xl p-6 sm:p-8">
                    <EventForm mode="create" />
                </div>
            </div>
        </div>
    );
}
