'use client';

import { AdminGuard } from '@/components/admin-guard';
import { AdminSidebar } from '@/components/admin-sidebar';
import { useAuthStore } from '@/lib/stores/authStore';
import { useLogout } from '@/lib/hooks/useAuthQueries';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, Shield, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

function GuardedLayout({ children }: { children: React.ReactNode }) {
    const user = useAuthStore((s) => s.user);
    const clearCredentials = useAuthStore((s) => s.clearCredentials);
    const logoutMutation = useLogout();
    const router = useRouter();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logoutMutation.mutateAsync();
        } catch {
            clearCredentials();
        }
        router.push('/admin/login');
    };

    const mobileNavItems = [
        { href: '/admin/dashboard', label: 'Dashboard' },
        { href: '/admin/users', label: 'Users' },
        { href: '/admin/events', label: 'Events' },
        { href: '/admin/payments', label: 'Payments' },
    ];

    return (
        <AdminGuard>
            <div className="flex h-screen bg-[#0a0b0f] text-white overflow-hidden">
                <AdminSidebar />

                <div className="flex-1 flex flex-col min-w-0">
                    {/* Top Bar */}
                    <header className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-white/[0.06] bg-[#0f1117] flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <button
                                className="md:hidden p-2 rounded-lg hover:bg-white/[0.06] transition"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                            <div className="md:hidden flex items-center gap-2">
                                <div className="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                    <Shield className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-sm font-bold">Admin</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xs font-bold">
                                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white/90">{user?.name || 'Admin'}</p>
                                    <p className="text-[10px] text-white/40 uppercase tracking-wider">{user?.role}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                disabled={logoutMutation.isPending}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition disabled:opacity-50"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">
                                    {logoutMutation.isPending ? 'Signing out...' : 'Sign Out'}
                                </span>
                            </button>
                        </div>
                    </header>

                    {/* Mobile Nav */}
                    {mobileMenuOpen && (
                        <div className="md:hidden bg-[#0f1117] border-b border-white/[0.06] px-4 py-3 space-y-1">
                            {mobileNavItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition ${pathname === item.href
                                        ? 'bg-indigo-500/15 text-indigo-400'
                                        : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Page Content */}
                    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </AdminGuard>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Don't wrap login/signup pages with guard/sidebar
    if (pathname === '/admin/login' || pathname === '/admin/signup') {
        return <>{children}</>;
    }

    return <GuardedLayout>{children}</GuardedLayout>;
}
