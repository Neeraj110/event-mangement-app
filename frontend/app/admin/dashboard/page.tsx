'use client';

import { useAllUsers, useAllEventsAdmin, useAllPayments } from '@/lib/hooks/useAdminQueries';
import { Users, CalendarDays, DollarSign, TrendingUp, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
    const { data: usersData, isLoading: usersLoading } = useAllUsers();
    const { data: eventsData, isLoading: eventsLoading } = useAllEventsAdmin();
    const { data: paymentsData, isLoading: paymentsLoading } = useAllPayments();

    const users = Array.isArray(usersData) ? usersData : (usersData as any)?.users || [];
    const events = Array.isArray(eventsData) ? eventsData : (eventsData as any)?.events || [];
    const payments = Array.isArray(paymentsData) ? paymentsData : (paymentsData as any)?.payments || [];

    const totalRevenue = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    const platformFees = payments.reduce((sum: number, p: any) => sum + (p.platformFee || 0), 0);

    const isLoading = usersLoading || eventsLoading || paymentsLoading;

    const stats = [
        {
            label: 'Total Users',
            value: users.length,
            icon: Users,
            color: 'from-blue-500 to-blue-600',
            bg: 'bg-blue-500/10',
            iconColor: 'text-blue-400',
            link: '/admin/users',
        },
        {
            label: 'Total Events',
            value: events.length,
            icon: CalendarDays,
            color: 'from-emerald-500 to-emerald-600',
            bg: 'bg-emerald-500/10',
            iconColor: 'text-emerald-400',
            link: '/admin/events',
        },
        {
            label: 'Total Revenue',
            value: `$${totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            color: 'from-amber-500 to-amber-600',
            bg: 'bg-amber-500/10',
            iconColor: 'text-amber-400',
            link: '/admin/payments',
        },
        {
            label: 'Platform Fees',
            value: `$${platformFees.toLocaleString()}`,
            icon: TrendingUp,
            color: 'from-purple-500 to-purple-600',
            bg: 'bg-purple-500/10',
            iconColor: 'text-purple-400',
            link: '/admin/payments',
        },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-sm text-white/40">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-sm text-white/40 mt-1">Platform overview and analytics</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Link
                            key={stat.label}
                            href={stat.link}
                            className="group relative bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-300"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-medium text-white/40 uppercase tracking-wider">
                                        {stat.label}
                                    </p>
                                    <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
                                </div>
                                <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                                    <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                                </div>
                            </div>
                            <div className="mt-3 h-1 w-full bg-white/[0.04] rounded-full overflow-hidden">
                                <div
                                    className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-500 group-hover:w-full`}
                                    style={{ width: '60%' }}
                                />
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Recent Users & Events */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Users */}
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl">
                    <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
                        <h3 className="text-sm font-semibold text-white">Recent Users</h3>
                        <Link
                            href="/admin/users"
                            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition"
                        >
                            View All →
                        </Link>
                    </div>
                    <div className="divide-y divide-white/[0.04]">
                        {users.slice(0, 5).map((user: any) => (
                            <div key={user._id} className="flex items-center gap-3 px-5 py-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                                    {user.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white/80 truncate">{user.name}</p>
                                    <p className="text-xs text-white/35 truncate">{user.email}</p>
                                </div>
                                <span
                                    className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${user.role === 'admin'
                                            ? 'bg-red-500/15 text-red-400'
                                            : user.role === 'organizer'
                                                ? 'bg-amber-500/15 text-amber-400'
                                                : 'bg-blue-500/15 text-blue-400'
                                        }`}
                                >
                                    {user.role}
                                </span>
                            </div>
                        ))}
                        {users.length === 0 && (
                            <p className="text-sm text-white/30 text-center py-8">No users found</p>
                        )}
                    </div>
                </div>

                {/* Recent Events */}
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl">
                    <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
                        <h3 className="text-sm font-semibold text-white">Recent Events</h3>
                        <Link
                            href="/admin/events"
                            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition"
                        >
                            View All →
                        </Link>
                    </div>
                    <div className="divide-y divide-white/[0.04]">
                        {events.slice(0, 5).map((event: any) => (
                            <div key={event._id} className="flex items-center gap-3 px-5 py-3">
                                <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                                    <CalendarDays className="w-4 h-4 text-white/40" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white/80 truncate">{event.title}</p>
                                    <p className="text-xs text-white/35">
                                        {event.startDate
                                            ? new Date(event.startDate).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })
                                            : 'No date'}
                                    </p>
                                </div>
                                <span className="text-xs font-medium text-white/50">
                                    ${event.price || 0}
                                </span>
                            </div>
                        ))}
                        {events.length === 0 && (
                            <p className="text-sm text-white/30 text-center py-8">No events found</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
