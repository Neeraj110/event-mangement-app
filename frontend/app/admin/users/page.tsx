'use client';

import { useAllUsers } from '@/lib/hooks/useAdminQueries';
import { useState, useMemo } from 'react';
import { Search, Loader2, Users, Crown } from 'lucide-react';

export default function AdminUsersPage() {
    const { data: usersData, isLoading, error } = useAllUsers();
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');

    const users = Array.isArray(usersData) ? usersData : (usersData as any)?.users || [];

    const filteredUsers = useMemo(() => {
        return users.filter((user: any) => {
            const matchesSearch =
                !search ||
                user.name?.toLowerCase().includes(search.toLowerCase()) ||
                user.email?.toLowerCase().includes(search.toLowerCase());
            const matchesRole = roleFilter === 'all' || user.role === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [users, search, roleFilter]);

    const roleCounts = useMemo(() => {
        const counts: Record<string, number> = { all: users.length };
        users.forEach((u: any) => {
            counts[u.role] = (counts[u.role] || 0) + 1;
        });
        return counts;
    }, [users]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-sm text-white/40">Loading users...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <p className="text-sm text-red-400">Failed to load users. Please try again.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Users</h1>
                    <p className="text-sm text-white/40 mt-1">
                        {users.length} total user{users.length !== 1 ? 's' : ''} registered
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/30 transition"
                    />
                </div>

                {/* Role Filter */}
                <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] rounded-lg p-1">
                    {['all', 'user', 'organizer', 'admin'].map((role) => (
                        <button
                            key={role}
                            onClick={() => setRoleFilter(role)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${roleFilter === role
                                    ? 'bg-indigo-500/20 text-indigo-300'
                                    : 'text-white/40 hover:text-white/60'
                                }`}
                        >
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                            <span className="ml-1 text-white/20">({roleCounts[role] || 0})</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/[0.06]">
                                <th className="px-5 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-5 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-5 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-5 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                                    Premium
                                </th>
                                <th className="px-5 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                                    Joined
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {filteredUsers.map((user: any) => (
                                <tr
                                    key={user._id}
                                    className="hover:bg-white/[0.02] transition"
                                >
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                                                {user.name?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                            <span className="text-sm font-medium text-white/80">
                                                {user.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 text-sm text-white/50">{user.email}</td>
                                    <td className="px-5 py-3.5">
                                        <span
                                            className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${user.role === 'admin'
                                                    ? 'bg-red-500/15 text-red-400'
                                                    : user.role === 'organizer'
                                                        ? 'bg-amber-500/15 text-amber-400'
                                                        : 'bg-blue-500/15 text-blue-400'
                                                }`}
                                        >
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        {user.isPremium ? (
                                            <Crown className="w-4 h-4 text-amber-400" />
                                        ) : (
                                            <span className="text-xs text-white/20">—</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3.5 text-sm text-white/40">
                                        {user.createdAt
                                            ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })
                                            : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Users className="w-10 h-10 text-white/10 mb-3" />
                        <p className="text-sm text-white/30">No users found</p>
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
