'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { Loader2, ShieldAlert } from 'lucide-react';

export function AdminGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        // Wait for hydration
        const timeout = setTimeout(() => setChecked(true), 100);
        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        if (!checked) return;
        if (!isAuthenticated) {
            router.replace('/admin/login');
        } else if (user?.role !== 'admin') {
            router.replace('/admin/login?error=forbidden');
        }
    }, [checked, isAuthenticated, user, router]);

    if (!checked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0f1117]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (!isAuthenticated || user?.role !== 'admin') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f1117] text-white gap-4">
                <ShieldAlert className="w-12 h-12 text-red-500" />
                <p className="text-lg font-semibold">Access Denied</p>
                <p className="text-sm text-white/50">Redirecting...</p>
            </div>
        );
    }

    return <>{children}</>;
}
