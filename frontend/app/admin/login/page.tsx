'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormValues } from '@/lib/validations/auth';
import { useLogin } from '@/lib/hooks/useAuthQueries';
import { useAuthStore } from '@/lib/stores/authStore';
import { Mail, Lock, Eye, EyeOff, Loader2, Shield, AlertTriangle } from 'lucide-react';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import Link from 'next/link';

export default function AdminLoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [serverError, setServerError] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const loginMutation = useLogin();
    const { isAuthenticated, user } = useAuthStore();

    // Check if already logged in as admin
    useEffect(() => {
        if (isAuthenticated && user?.role === 'admin') {
            router.replace('/admin/dashboard');
        }
    }, [isAuthenticated, user, router]);

    // Check for forbidden error from guard redirect
    useEffect(() => {
        if (searchParams.get('error') === 'forbidden') {
            setServerError('Access denied. Admin privileges are required.');
        }
    }, [searchParams]);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
        mode: 'onBlur',
    });

    const onSubmit = async (data: LoginFormValues) => {
        setServerError('');
        try {
            const result = await loginMutation.mutateAsync({
                email: data.email,
                password: data.password,
            });

            // Check if user has admin role
            if (result.user.role !== 'admin') {
                // Clear the non-admin credentials
                useAuthStore.getState().clearCredentials();
                setServerError('Access denied. This login is for admin accounts only.');
                return;
            }

            router.push('/admin/dashboard');
        } catch (err: any) {
            setServerError(
                err?.message || err?.data?.message || 'Login failed. Please try again.'
            );
        }
    };

    const isLoading = loginMutation.isPending;

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
                                    Control Panel
                                </span>
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold text-white mb-4 leading-tight">
                            Manage your
                            <br />
                            <span className="bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                                entire platform
                            </span>
                        </h1>
                        <p className="text-white/50 text-sm leading-relaxed max-w-[320px]">
                            Access the admin dashboard to manage users, events, payments, and
                            platform operations.
                        </p>
                    </div>

                    {/* Features */}
                    <div className="space-y-4">
                        {[
                            { label: 'User Management', desc: 'View & manage all users' },
                            { label: 'Event Oversight', desc: 'Monitor & moderate events' },
                            { label: 'Payment Tracking', desc: 'Track all transactions' },
                        ].map((f) => (
                            <div
                                key={f.label}
                                className="flex items-center gap-4 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06]"
                            >
                                <div className="w-2 h-2 rounded-full bg-indigo-400" />
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
                        <span className="text-white text-lg font-bold">Spot Admin</span>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2">Admin Sign In</h2>
                        <p className="text-white/40 text-sm">
                            Enter your admin credentials to access the control panel
                        </p>
                    </div>

                    {serverError && (
                        <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-300">{serverError}</p>
                        </div>
                    )}

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                                            placeholder="Enter your password"
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

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In to Admin Panel'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/[0.06] text-center space-y-3">
                        <p className="text-xs text-white/30">
                            First time setup?{' '}
                            <Link
                                href="/admin/signup"
                                className="text-indigo-400 hover:text-indigo-300 font-medium transition"
                            >
                                Create admin account
                            </Link>
                        </p>
                        <p className="text-xs text-white/30">
                            Not an admin?{' '}
                            <Link
                                href="/login"
                                className="text-indigo-400 hover:text-indigo-300 font-medium transition"
                            >
                                Go to regular login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
