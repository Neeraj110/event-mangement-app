'use client';

import { useAllEventsAdmin, useDeleteEventAdmin, useToggleEventPublish } from '@/lib/hooks/useAdminQueries';
import { useState, useMemo } from 'react';
import { Search, Loader2, Trash2, CalendarDays, AlertTriangle, X, Eye, EyeOff } from 'lucide-react';

export default function AdminEventsPage() {
    const { data: eventsData, isLoading, error } = useAllEventsAdmin();
    const deleteEventMutation = useDeleteEventAdmin();
    const togglePublishMutation = useToggleEventPublish();
    const [search, setSearch] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

    const events = Array.isArray(eventsData) ? eventsData : (eventsData as any)?.events || [];

    const filteredEvents = useMemo(() => {
        if (!search) return events;
        return events.filter(
            (event: any) =>
                event.title?.toLowerCase().includes(search.toLowerCase()) ||
                event.category?.toLowerCase().includes(search.toLowerCase())
        );
    }, [events, search]);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteEventMutation.mutateAsync(deleteTarget.id);
            setDeleteTarget(null);
        } catch (err) {
            console.error('Failed to delete event:', err);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-sm text-white/40">Loading events...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <p className="text-sm text-red-400">Failed to load events. Please try again.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#14151a] border border-white/[0.08] rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-500/15 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-red-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white">Delete Event</h3>
                        </div>
                        <p className="text-sm text-white/50 mb-1">
                            Are you sure you want to delete this event?
                        </p>
                        <p className="text-sm font-medium text-white/80 mb-6">
                            &quot;{deleteTarget.title}&quot;
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white/60 bg-white/[0.06] hover:bg-white/[0.1] transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteEventMutation.isPending}
                                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-500 transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {deleteEventMutation.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Trash2 className="w-4 h-4" />
                                )}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Events</h1>
                <p className="text-sm text-white/40 mt-1">
                    {events.length} total event{events.length !== 1 ? 's' : ''} on the platform
                </p>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <input
                    type="text"
                    placeholder="Search by title or category..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/30 transition"
                />
            </div>

            {/* Table */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/[0.06]">
                                <th className="px-5 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                                    Event
                                </th>
                                <th className="px-5 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-5 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-5 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                                    Price
                                </th>
                                <th className="px-5 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                                    Organizer
                                </th>
                                <th className="px-5 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-5 py-3 text-right text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {filteredEvents.map((event: any) => (
                                <tr key={event._id} className="hover:bg-white/[0.02] transition">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                {event.coverImage ? (
                                                    <img
                                                        src={event.coverImage}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <CalendarDays className="w-4 h-4 text-white/30" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-white/80 truncate max-w-[200px]">
                                                    {event.title}
                                                </p>
                                                <p className="text-xs text-white/30 truncate max-w-[200px]">
                                                    {event.location?.city || 'No location'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className="text-xs font-medium text-white/50 bg-white/[0.06] px-2.5 py-1 rounded-full">
                                            {event.category || '—'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-sm text-white/40">
                                        {event.startDate
                                            ? new Date(event.startDate).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })
                                            : '—'}
                                    </td>
                                    <td className="px-5 py-3.5 text-sm font-medium text-white/60">
                                        {event.price ? `₹${event.price}` : 'Free'}
                                    </td>
                                    <td className="px-5 py-3.5 text-sm text-white/40">
                                        {typeof event.organizerId === 'object'
                                            ? event.organizerId?.name || event.organizerId?.email
                                            : event.organizerId?.slice(0, 8) + '...'}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span
                                            className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${event.isPublished
                                                ? 'bg-emerald-500/15 text-emerald-400'
                                                : 'bg-white/[0.06] text-white/30'
                                                }`}
                                        >
                                            {event.isPublished ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => togglePublishMutation.mutate(event._id)}
                                                disabled={togglePublishMutation.isPending}
                                                className={`p-2 rounded-lg transition flex items-center gap-1.5 text-xs font-medium ${event.isPublished
                                                    ? 'text-amber-400 hover:bg-amber-500/10'
                                                    : 'text-emerald-400 hover:bg-emerald-500/10'
                                                    }`}
                                                title={event.isPublished ? 'Unpublish event' : 'Publish event'}
                                            >
                                                {togglePublishMutation.isPending ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : event.isPublished ? (
                                                    <EyeOff className="w-4 h-4" />
                                                ) : (
                                                    <Eye className="w-4 h-4" />
                                                )}
                                                <span className="hidden sm:inline">
                                                    {event.isPublished ? 'Unpublish' : 'Publish'}
                                                </span>
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setDeleteTarget({ id: event._id, title: event.title })
                                                }
                                                className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition"
                                                title="Delete event"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredEvents.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <CalendarDays className="w-10 h-10 text-white/10 mb-3" />
                        <p className="text-sm text-white/30">No events found</p>
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="text-xs text-indigo-400 mt-2 hover:text-indigo-300 transition"
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
