'use client';

import React from "react"
import Link from 'next/link';
import { useState } from 'react';
import { Mail, Lock, Music, Code, Palette, Users, Utensils, Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupFormValues } from '@/lib/validations/auth';
import { useRegister } from '@/lib/hooks/useAuthQueries';
import { Field, FieldLabel, FieldError, FieldDescription } from '@/components/ui/field';

const CATEGORIES = [
  { id: 'music', label: 'Music', icon: Music },
  { id: 'tech', label: 'Tech', icon: Code },
  { id: 'arts', label: 'Art', icon: Palette },
  { id: 'networking', label: 'Networking', icon: Users },
  { id: 'food', label: 'Food', icon: Utensils },
  { id: 'sports', label: 'Sports', icon: Zap },
];

export default function SignUpPage() {
  const [serverError, setServerError] = useState('');
  const registerMutation = useRegister();
  const router = useRouter();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      userType: 'user',
      interests: [],
    },
    mode: 'onBlur',
  });

  const selectedInterests = form.watch('interests');
  const userType = form.watch('userType');

  const toggleInterest = (id: string) => {
    const current = form.getValues('interests');
    const updated = current.includes(id)
      ? current.filter(i => i !== id)
      : [...current, id];
    form.setValue('interests', updated);
  };

  const onSubmit = async (values: SignupFormValues) => {
    setServerError('');

    try {
      const data = new FormData();
      data.append('name', values.username);
      data.append('email', values.email);
      data.append('password', values.password);
      data.append('role', values.userType);

      values.interests.forEach(interest => {
        data.append('interests', interest);
      });

      await registerMutation.mutateAsync(data);

      toast.success('Account created successfully!');
      router.push('/');
    } catch (err: any) {
      console.error('Registration failed:', err);
      setServerError(err?.message || err?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const isLoading = registerMutation.isPending;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-xs">◆</span>
          </div>
          <span className="text-foreground font-semibold text-lg">Spot</span>
        </Link>
        <Link href="/login" className="text-primary hover:text-primary/80 text-sm font-medium transition">
          Already have an account? <span className="font-bold">Log in</span>
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          <div className="bg-card border border-border rounded-[2rem] p-8 shadow-lg">
            {/* Title */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-2">Create your account</h1>
              <p className="text-muted-foreground">
                Join the Spot community to explore and organize events.
              </p>
            </div>

            {serverError && (
              <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
                {serverError}
              </div>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* OAuth Buttons */}
              <div className="space-y-3">
                <a
                  href={`${process.env.NEXT_PUBLIC_API_URL || ''}/users/auth/google`}
                  className="w-full py-3 px-4 border border-border rounded-xl bg-background hover:bg-secondary/80 flex items-center justify-center gap-3 font-medium transition"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Sign up with Google
                </a>
                <a
                  href={`${process.env.NEXT_PUBLIC_API_URL || ''}/users/auth/github`}
                  className="w-full py-3 px-4 border border-border rounded-xl bg-background hover:bg-secondary/80 flex items-center justify-center gap-3 font-medium transition"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  Sign up with GitHub
                </a>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">or continue with email</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              {/* User Type Selection */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 block">
                  I AM JOINING AS A...
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['user', 'organizer'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => form.setValue('userType', type)}
                      className={`px-4 py-2.5 rounded-full font-semibold transition-all ${userType === type
                        ? 'bg-primary text-white shadow-lg shadow-primary/25'
                        : 'bg-secondary text-foreground hover:bg-secondary/80 border border-border'
                        }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Username Field */}
              <Controller
                name="username"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name} className="text-sm font-semibold">
                      Unique Name
                    </FieldLabel>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-muted-foreground font-semibold">@</span>
                      <input
                        {...field}
                        id={field.name}
                        type="text"
                        aria-invalid={fieldState.invalid}
                        placeholder="yourname"
                        className={`w-full pl-8 pr-4 py-3 bg-background border rounded-xl text-foreground placeholder:text-muted-foreground transition-all ${fieldState.invalid
                          ? 'border-destructive ring-2 ring-destructive/20'
                          : 'border-border hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20'
                          }`}
                        disabled={isLoading}
                      />
                    </div>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              {/* Email Field */}
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name} className="text-sm font-semibold">
                      Email
                    </FieldLabel>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3 w-5 h-5 text-muted-foreground" />
                      <input
                        {...field}
                        id={field.name}
                        type="email"
                        aria-invalid={fieldState.invalid}
                        placeholder="email@example.com"
                        className={`w-full pl-12 pr-4 py-3 bg-background border rounded-xl text-foreground placeholder:text-muted-foreground transition-all ${fieldState.invalid
                          ? 'border-destructive ring-2 ring-destructive/20'
                          : 'border-border hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20'
                          }`}
                        disabled={isLoading}
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
                    <FieldLabel htmlFor={field.name} className="text-sm font-semibold">
                      Password
                    </FieldLabel>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3 w-5 h-5 text-muted-foreground" />
                      <input
                        {...field}
                        id={field.name}
                        type="password"
                        aria-invalid={fieldState.invalid}
                        placeholder="••••••••"
                        className={`w-full pl-12 pr-4 py-3 bg-background border rounded-xl text-foreground placeholder:text-muted-foreground transition-all ${fieldState.invalid
                          ? 'border-destructive ring-2 ring-destructive/20'
                          : 'border-border hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20'
                          }`}
                        disabled={isLoading}
                      />
                    </div>
                    <FieldDescription>Minimum 6 characters.</FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              {/* Interests Selection */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-4">
                  What are you interested in?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map(category => {
                    const Icon = category.icon;
                    const isSelected = selectedInterests.includes(category.id);
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => toggleInterest(category.id)}
                        className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all flex items-center justify-center gap-2 ${isSelected
                          ? 'bg-primary text-white shadow-lg shadow-primary/25'
                          : 'bg-secondary text-foreground hover:bg-secondary/80 border border-border'
                          }`}
                      >
                        <Icon className="w-4 h-4" />
                        {category.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Create Account Button */}
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-full transition-all duration-200 mt-8 shadow-lg hover:shadow-primary/25"
                disabled={isLoading}
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Creating account...</>
                ) : (
                  'Create Account'
                )}
              </Button>

              {/* Terms */}
              <p className="text-xs text-muted-foreground text-center mt-6">
                By clicking &quot;Create Account&quot;, you agree to our{' '}
                <Link href="#" className="text-primary hover:text-primary/80 font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="#" className="text-primary hover:text-primary/80 font-medium">
                  Privacy Policy
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-muted-foreground text-xs">
        © 2024 Spot Platform. All rights reserved.
      </footer>
    </div>
  );
}
