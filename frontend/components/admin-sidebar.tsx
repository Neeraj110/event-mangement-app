'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    CalendarDays,
    CreditCard,
    Shield,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const NAV_ITEMS = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/events', label: 'Events', icon: CalendarDays },
    { href: '/admin/payments', label: 'Payments', icon: CreditCard },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside
            className={`hidden md:flex flex-col bg-[#0f1117] border-r border-white/[0.06] transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-[260px]'
                }`}
        >
            {/* Brand */}
            <div className="flex items-center gap-3 px-5 h-16 border-b border-white/[0.06]">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-white" />
                </div>
                {!collapsed && (
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-white tracking-wide">Spot Admin</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest">Control Panel</p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 space-y-1">
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive
                                    ? 'bg-indigo-500/15 text-indigo-400'
                                    : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                                }`}
                            title={collapsed ? item.label : undefined}
                        >
                            <Icon
                                className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-indigo-400' : 'text-white/40 group-hover:text-white/70'
                                    }`}
                            />
                            {!collapsed && <span>{item.label}</span>}
                            {isActive && !collapsed && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Collapse Toggle */}
            <div className="p-3 border-t border-white/[0.06]">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="flex items-center justify-center w-full py-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-all"
                >
                    {collapsed ? (
                        <ChevronRight className="w-4 h-4" />
                    ) : (
                        <>
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            <span className="text-xs">Collapse</span>
                        </>
                    )}
                </button>
            </div>
        </aside>
    );
}
