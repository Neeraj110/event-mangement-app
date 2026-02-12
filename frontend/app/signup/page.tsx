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
