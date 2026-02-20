'use client';

import { useState } from 'react';
import { Users, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormValues } from '@/lib/validations/auth';
import { useLogin } from '@/lib/hooks/useAuthQueries';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const router = useRouter();
  const loginMutation = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
  });

  const onSubmit = async (data: LoginFormValues) => {
    setServerError('');
    try {
      await loginMutation.mutateAsync({ email: data.email, password: data.password });
      router.push('/');
    } catch (err: any) {
      setServerError(err?.message || err?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-white text-2xl font-bold">Spot</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Welcome back to Spot
            </h1>
            <p className="text-blue-100 text-lg">
              Sign in to manage your events, track tickets, and connect with your community.
            </p>
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-white font-medium">50K+ Active Users</p>
                <p className="text-blue-200 text-sm">Join our growing community</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 mb-4">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold">Sign In</h2>
            <p className="text-foreground/60 mt-2">
              Enter your credentials to access your account
            </p>
          </div>

          {serverError && (
            <div className="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm">
              {serverError}
            </div>
          )}

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || ''}/users/auth/google`}
              className="w-full py-3 px-4 border border-border rounded-lg bg-muted/30 hover:bg-muted/60 flex items-center justify-center gap-3 font-medium transition"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </a>
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || ''}/users/auth/github`}
              className="w-full py-3 px-4 border border-border rounded-lg bg-muted/30 hover:bg-muted/60 flex items-center justify-center gap-3 font-medium transition"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Continue with GitHub
            </a>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-foreground/40 uppercase tracking-wider">or sign in with email</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name} className="text-sm font-medium mb-2">
                    Email
                  </FieldLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/40" />
                    <input
                      {...field}
                      id={field.name}
                      type="email"
                      aria-invalid={fieldState.invalid}
                      placeholder="name@example.com"
                      className="w-full pl-11 pr-4 py-3 border border-border rounded-lg bg-muted/30 focus:outline-none focus:ring-2 focus:ring-blue-500 aria-[invalid=true]:border-red-500 aria-[invalid=true]:ring-red-500/20"
                    />
                  </div>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Password Field */}
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name} className="text-sm font-medium mb-2">
                    Password
                  </FieldLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/40" />
                    <input
                      {...field}
                      id={field.name}
                      type={showPassword ? 'text' : 'password'}
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter your password"
                      className="w-full pl-11 pr-12 py-3 border border-border rounded-lg bg-muted/30 focus:outline-none focus:ring-2 focus:ring-blue-500 aria-[invalid=true]:border-red-500 aria-[invalid=true]:ring-red-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-border" />
                <span className="text-foreground/60">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-blue-600 hover:text-blue-700 font-medium">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition"
            >
              {loginMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-foreground/60 mt-8">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
