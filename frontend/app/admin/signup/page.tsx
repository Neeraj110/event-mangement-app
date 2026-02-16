'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/lib/stores/authStore';
import { apiClient } from '@/lib/api/apiClient';
import { User, RegisterResponse } from '@/types';
import {
    Mail, Lock, Eye, EyeOff, Loader2, Shield,
    AlertTriangle, User as UserIcon, CheckCircle2, XCircle
} from 'lucide-react';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import Link from 'next/link';

const adminSignupSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

type AdminSignupValues = z.infer<typeof adminSignupSchema>;

export default function AdminSignupPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [serverError, setServerError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [adminExists, setAdminExists] = useState<boolean | null>(null);
    const [checkingAdmin, setCheckingAdmin] = useState(true);
    const router = useRouter();
    const { isAuthenticated, user } = useAuthStore();

    // Check if admin already exists
    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const result = await apiClient<{ exists: boolean }>('/admin/check-exists');
                setAdminExists(result.exists);
            } catch {
                setAdminExists(false);
            } finally {
                setCheckingAdmin(false);
            }
        };
        checkAdmin();
    }, []);

    // Redirect if already logged in as admin
    useEffect(() => {
        if (isAuthenticated && user?.role === 'admin') {
            router.replace('/admin/dashboard');
        }
    }, [isAuthenticated, user, router]);

    const form = useForm<AdminSignupValues>({
        resolver: zodResolver(adminSignupSchema),
        defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
        mode: 'onBlur',
    });

    const onSubmit = async (data: AdminSignupValues) => {
        setServerError('');
        setIsLoading(true);
        try {
            const result = await apiClient<RegisterResponse>('/admin/register', {
                method: 'POST',
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    password: data.password,
                }),
            });

            // Store credentials and redirect
            useAuthStore
                .getState()
                .setCredentials(result.user as unknown as User, result.accessToken);

            router.push('/admin/dashboard');
        } catch (err: any) {
            setServerError(
                err?.message || err?.data?.message || 'Registration failed. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Loading state
    if (checkingAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0b0f]">
                <div className="flex items-center gap-3 text-white/50">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm">Checking admin status...</span>
                </div>
            </div>
        );
    }

    // Admin already exists — show blocked message
    if (adminExists) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0b0f] p-6">
                <div className="max-w-md w-full text-center">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
                        <XCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Admin Already Exists</h2>
                    <p className="text-white/40 text-sm mb-8 leading-relaxed">
                        An admin account has already been created for this platform.
                        Only one admin account is allowed. Please sign in with the existing admin credentials.
                    </p>
                    <Link
                        href="/admin/login"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 transition-all"
                    >
                        <Shield className="w-4 h-4" />
                        Go to Admin Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-[#0a0b0f]">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-[480px] relative overflow-hidden">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900" />

                {/* Grid overlay */}
                <div
                    className="absolute inset-0 opacity-[0.07]"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                    }}
                />

                {/* Floating orbs */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-20 right-10 w-56 h-56 bg-purple-500/20 rounded-full blur-[80px]" />

                <div className="relative z-10 flex flex-col justify-center px-12 py-16">
                    <div className="mb-12">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                                <Shield className="w-6 h-6 text-indigo-300" />
                            </div>
                            <div>
                                <span className="text-white text-xl font-bold block">Spot Admin</span>
                                <span className="text-white/40 text-[10px] uppercase tracking-[0.2em]">
                                    Initial Setup
                                </span>
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold text-white mb-4 leading-tight">
                            Set up your
                            <br />
                            <span className="bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                                admin account
                            </span>
                        </h1>
                        <p className="text-white/50 text-sm leading-relaxed max-w-[320px]">
                            Create the platform&apos;s admin account to manage users, events,
                            payments, and all platform operations.
                        </p>
                    </div>

                    {/* Info cards */}
                    <div className="space-y-4">
                        {[
                            { icon: '🔒', label: 'One-time Setup', desc: 'Only one admin account allowed' },
                            { icon: '🛡️', label: 'Full Control', desc: 'Manage the entire platform' },
                            { icon: '⚡', label: 'Instant Access', desc: 'Start managing immediately' },
                        ].map((f) => (
                            <div
                                key={f.label}
                                className="flex items-center gap-4 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06]"
                            >
                                <span className="text-lg">{f.icon}</span>
                                <div>
                                    <p className="text-sm font-medium text-white/80">{f.label}</p>
                                    <p className="text-xs text-white/35">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
                <div className="w-full max-w-md">
                    {/* Mobile brand */}
                    <div className="lg:hidden flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-white text-lg font-bold">Spot Admin Setup</span>
                    </div>

                    {/* Success badge */}
                    <div className="mb-6 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <p className="text-xs text-emerald-300">
                            No admin exists yet — you can create the admin account now.
                        </p>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2">Create Admin Account</h2>
                        <p className="text-white/40 text-sm">
                            Set up the platform&apos;s sole admin account with full privileges
                        </p>
                    </div>

                    {serverError && (
                        <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-300">{serverError}</p>
                        </div>
                    )}

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        {/* Name */}
                        <Controller
                            name="name"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel
                                        htmlFor={field.name}
                                        className="text-sm font-medium text-white/60 mb-2"
                                    >
                                        Full Name
                                    </FieldLabel>
                                    <div className="relative">
                                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                                        <input
                                            {...field}
                                            id={field.name}
                                            type="text"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Enter your full name"
                                            disabled={isLoading}
                                            className="w-full pl-11 pr-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition disabled:opacity-50 aria-[invalid=true]:border-red-500/50 aria-[invalid=true]:ring-red-500/20"
                                        />
                                    </div>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        {/* Email */}
                        <Controller
                            name="email"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel
                                        htmlFor={field.name}
                                        className="text-sm font-medium text-white/60 mb-2"
                                    >
                                        Email Address
                                    </FieldLabel>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                                        <input
                                            {...field}
                                            id={field.name}
                                            type="email"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="admin@example.com"
                                            disabled={isLoading}
                                            className="w-full pl-11 pr-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition disabled:opacity-50 aria-[invalid=true]:border-red-500/50 aria-[invalid=true]:ring-red-500/20"
                                        />
                                    </div>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        {/* Password */}
                        <Controller
                            name="password"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel
                                        htmlFor={field.name}
                                        className="text-sm font-medium text-white/60 mb-2"
                                    >
                                        Password
                                    </FieldLabel>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                                        <input
                                            {...field}
                                            id={field.name}
                                            type={showPassword ? 'text' : 'password'}
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Min. 6 characters"
                                            disabled={isLoading}
                                            className="w-full pl-11 pr-12 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition disabled:opacity-50 aria-[invalid=true]:border-red-500/50 aria-[invalid=true]:ring-red-500/20"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        {/* Confirm Password */}
                        <Controller
                            name="confirmPassword"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel
                                        htmlFor={field.name}
                                        className="text-sm font-medium text-white/60 mb-2"
                                    >
                                        Confirm Password
                                    </FieldLabel>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                                        <input
                                            {...field}
                                            id={field.name}
                                            type={showConfirm ? 'text' : 'password'}
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Re-enter your password"
                                            disabled={isLoading}
                                            className="w-full pl-11 pr-12 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition disabled:opacity-50 aria-[invalid=true]:border-red-500/50 aria-[invalid=true]:ring-red-500/20"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition"
                                        >
                                            {showConfirm ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Creating admin account...
                                </>
                            ) : (
                                <>
                                    <Shield className="w-4 h-4" />
                                    Create Admin Account
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
                        <p className="text-xs text-white/30">
                            Already have an admin account?{' '}
                            <Link
                                href="/admin/login"
                                className="text-indigo-400 hover:text-indigo-300 font-medium transition"
                            >
                                Sign in instead
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
