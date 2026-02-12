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
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                Forgot password?
              </a>
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
