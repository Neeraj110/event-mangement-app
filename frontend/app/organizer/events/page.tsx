'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
    Plus,
    Search,
    Filter,
    Pencil,
    Trash2,
    Calendar,
    Ticket,
    DollarSign,
    BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DashboardHeader } from '@/components/dashboard-header';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useOrganizerEvents } from '@/lib/hooks/useOrganizerQueries';
import { useDeleteEvent } from '@/lib/hooks/useEventQueries';
import { Event } from '@/types';

export default function ManageEventsPage() {
    const { data: events = [], isLoading } = useOrganizerEvents();
    const deleteEventMutation = useDeleteEvent();
    const router = useRouter();

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const eventsPerPage = 8;

    // Derive event status
    const getEventStatus = (event: Event) => {
        const now = new Date();
        const start = new Date(event.startDate);
        const end = new Date(event.endDate);
        if (!event.isPublished) return 'draft';
        if (now < start) return 'upcoming';
        if (now >= start && now <= end) return 'live';
        return 'completed';
    };

    // Filter events
    const filteredEvents = events.filter((event) => {
        const matchesSearch =
            event.title.toLowerCase().includes(search.toLowerCase()) ||
            event.location?.city?.toLowerCase().includes(search.toLowerCase());
        const status = getEventStatus(event);
        const matchesStatus =
            statusFilter === 'all' || status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Pagination
    const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
    const paginatedEvents = filteredEvents.slice(
        (currentPage - 1) * eventsPerPage,
        currentPage * eventsPerPage
    );

    // Stats
    const totalEvents = events.length;
    const publishedEvents = events.filter((e) => e.isPublished).length;
    const totalCapacity = events.reduce((sum, e) => sum + (e.capacity || 0), 0);
    const totalRevenue = events.reduce(
        (sum, e) => sum + (e.price || 0) * (e.capacity || 0),
        0
    );

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteEventMutation.mutateAsync(deleteTarget._id);
            setDeleteTarget(null);
        } catch {
            // Error handled by mutation
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            live: 'bg-green-100 text-green-700 border-green-200',
            upcoming: 'bg-blue-100 text-blue-700 border-blue-200',
            draft: 'bg-amber-100 text-amber-700 border-amber-200',
            completed: 'bg-gray-100 text-gray-600 border-gray-200',
        };
        return (
            <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.draft}`}
            >
                {status === 'live' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                )}
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-background">
            <DashboardHeader title="My Events" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Title + Create Button */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold">Manage My Events</h2>
                        <p className="text-sm text-foreground/60 mt-1">
                            Review, update and monitor your active event listings.
                        </p>
                    </div>
                    <Link href="/organizer/events/new">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                            <Plus className="w-4 h-4" />
                            Create New Event
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-card border border-border rounded-xl p-5">
                        <p className="text-xs text-foreground/50 font-medium uppercase tracking-wide">
                            Total Events
                        </p>
                        <p className="text-3xl font-bold mt-2">{totalEvents}</p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-5">
                        <p className="text-xs text-foreground/50 font-medium uppercase tracking-wide">
                            Published
                        </p>
                        <p className="text-3xl font-bold mt-2 text-blue-600">
                            {publishedEvents}
                        </p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-5">
                        <p className="text-xs text-foreground/50 font-medium uppercase tracking-wide">
                            Total Capacity
                        </p>
                        <p className="text-3xl font-bold mt-2">
                            {totalCapacity.toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-5">
                        <p className="text-xs text-foreground/50 font-medium uppercase tracking-wide">
                            Est. Revenue
                        </p>
                        <p className="text-3xl font-bold mt-2 text-green-600">
                            ${totalRevenue.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Search + Filter */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
                    <div className="relative flex-1 w-full sm:max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                        <Input
                            placeholder="Search events by name..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-10"
                        />
                    </div>
                    <Select
                        value={statusFilter}
                        onValueChange={(v) => {
                            setStatusFilter(v);
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="w-[160px]">
                            <Filter className="w-4 h-4 mr-2 text-foreground/40" />
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="live">Live</SelectItem>
                            <SelectItem value="upcoming">Upcoming</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Events Table */}
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    {isLoading ? (
                        <div className="p-12 text-center text-foreground/50">
                            Loading events...
                        </div>
                    ) : paginatedEvents.length === 0 ? (
                        <div className="p-12 text-center">
                            <Calendar className="w-12 h-12 text-foreground/20 mx-auto mb-3" />
                            <p className="text-foreground/60 font-medium">No events found</p>
                            <p className="text-sm text-foreground/40 mt-1">
                                {search || statusFilter !== 'all'
                                    ? 'Try adjusting your filters.'
                                    : 'Create your first event to get started!'}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/30">
                                            <th className="px-6 py-3.5 text-left text-xs font-semibold text-foreground/50 uppercase tracking-wider">
                                                Event Details
                                            </th>
                                            <th className="px-6 py-3.5 text-left text-xs font-semibold text-foreground/50 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3.5 text-left text-xs font-semibold text-foreground/50 uppercase tracking-wider">
                                                Date & Time
                                            </th>
                                            <th className="px-6 py-3.5 text-left text-xs font-semibold text-foreground/50 uppercase tracking-wider">
                                                Price / Cap
                                            </th>
                                            <th className="px-6 py-3.5 text-right text-xs font-semibold text-foreground/50 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {paginatedEvents.map((event) => {
                                            const status = getEventStatus(event);
                                            return (
                                                <tr
                                                    key={event._id}
                                                    className="hover:bg-muted/30 transition"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                                                                {event.coverImage && (
                                                                    <img
                                                                        src={event.coverImage}
                                                                        alt={event.title}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-semibold truncate max-w-[200px]">
                                                                    {event.title}
                                                                </p>
                                                                <p className="text-xs text-foreground/50">
                                                                    {event.location?.city || 'No location'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {getStatusBadge(status)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm">
                                                            {new Date(event.startDate).toLocaleDateString(
                                                                'en-US',
                                                                {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric',
                                                                }
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-foreground/50">
                                                            {new Date(event.startDate).toLocaleTimeString(
                                                                'en-US',
                                                                {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                }
                                                            )}
                                                        </p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm font-semibold">
                                                            ${event.price}
                                                        </p>
                                                        <p className="text-xs text-foreground/50">
                                                            {event.capacity} spots
                                                        </p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() =>
                                                                    router.push(
                                                                        `/organizer/events/${event._id}/edit`
                                                                    )
                                                                }
                                                                className="gap-1.5"
                                                            >
                                                                <Pencil className="w-3.5 h-3.5" />
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setDeleteTarget(event)}
                                                                className="gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                                Delete
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                                    <p className="text-sm text-foreground/50">
                                        Showing {(currentPage - 1) * eventsPerPage + 1} to{' '}
                                        {Math.min(
                                            currentPage * eventsPerPage,
                                            filteredEvents.length
                                        )}{' '}
                                        of {filteredEvents.length} events
                                    </p>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage((p) => p - 1)}
                                        >
                                            ‹
                                        </Button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                                            (page) => (
                                                <Button
                                                    key={page}
                                                    variant={
                                                        currentPage === page ? 'default' : 'outline'
                                                    }
                                                    size="sm"
                                                    onClick={() => setCurrentPage(page)}
                                                    className={
                                                        currentPage === page
                                                            ? 'bg-blue-600 text-white'
                                                            : ''
                                                    }
                                                >
                                                    {page}
                                                </Button>
                                            )
                                        )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage((p) => p + 1)}
                                        >
                                            ›
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Event</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete{' '}
                            <strong>{deleteTarget?.title}</strong>? This action cannot be
                            undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteTarget(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDelete}
                            disabled={deleteEventMutation.isPending}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {deleteEventMutation.isPending ? 'Deleting...' : 'Delete Event'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
