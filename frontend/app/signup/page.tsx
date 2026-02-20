'use client';

import React from "react"
import Link from 'next/link';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Mail, Lock, Music, Code, Palette, Users, Utensils, Zap, Loader2, ArrowLeft, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupFormValues } from '@/lib/validations/auth';
import { useRegister, useVerifyOTP, useResendOTP } from '@/lib/hooks/useAuthQueries';
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
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const registerMutation = useRegister();
  const verifyOTPMutation = useVerifyOTP();
  const resendOTPMutation = useResendOTP();
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

  // Countdown timer for resend OTP cooldown
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Focus first OTP input when step changes to OTP
  useEffect(() => {
    if (step === 'otp') {
      inputRefs.current[0]?.focus();
    }
  }, [step]);

  const toggleInterest = (id: string) => {
    const current = form.getValues('interests');
    const updated = current.includes(id)
      ? current.filter(i => i !== id)
      : [...current, id];
    form.setValue('interests', updated);
  };

  // Step 1: Submit form → sends OTP
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

      const result = await registerMutation.mutateAsync(data);
      setRegisteredEmail(result.email);
      setStep('otp');
      setCountdown(60);
      toast.success('OTP sent to your email!');
    } catch (err: any) {
      console.error('Registration failed:', err?.message, err?.data, err);
      const msg = err?.message || err?.data?.message || 'Registration failed. Please try again.';
      setServerError(msg);
    }
  };

  // OTP input handlers
  const handleOTPChange = useCallback((index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // only digits
    const newValues = [...otpValues];
    newValues[index] = value.slice(-1); // only 1 digit
    setOtpValues(newValues);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [otpValues]);

  const handleOTPKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }, [otpValues]);

  const handleOTPPaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newValues = [...otpValues];
    for (let i = 0; i < 6; i++) {
      newValues[i] = pasted[i] || '';
    }
    setOtpValues(newValues);
    // Focus the last filled input or the next empty one
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  }, [otpValues]);

  // Step 2: Verify OTP → creates user
  const handleVerifyOTP = async () => {
    const otp = otpValues.join('');
    if (otp.length !== 6) {
      setServerError('Please enter all 6 digits');
      return;
    }

    setServerError('');

    try {
      await verifyOTPMutation.mutateAsync({ email: registeredEmail, otp });
      toast.success('Account created successfully!');
      router.push('/');
    } catch (err: any) {
      const msg = err?.message || err?.data?.message || 'Invalid OTP. Please try again.';
      setServerError(msg);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setServerError('');
    try {
      await resendOTPMutation.mutateAsync({ email: registeredEmail, purpose: 'signup' });
      setOtpValues(['', '', '', '', '', '']);
      setCountdown(60);
      toast.success('OTP resent to your email!');
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setServerError(err?.message || 'Failed to resend OTP.');
    }
  };

  const isLoading = registerMutation.isPending;
  const isVerifying = verifyOTPMutation.isPending;

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
          <div className="bg-card border border-border rounded-xl sm:rounded-[2rem] p-5 sm:p-8 shadow-lg">

            {step === 'form' ? (
              /* ─── STEP 1: Registration Form ─── */
              <>
                <div className="mb-8">
                  <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-2">Create your account</h1>
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

                  {/* OAuth Buttons */}
                  <div className="space-y-3">
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_URL || ''}/users/auth/google?role=${userType}`}
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
                      href={`${process.env.NEXT_PUBLIC_API_URL || ''}/users/auth/github?role=${userType}`}
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
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Sending OTP...</>
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
              </>
            ) : (
              /* ─── STEP 2: OTP Verification ─── */
              <>
                <button
                  onClick={() => { setStep('form'); setServerError(''); setOtpValues(['', '', '', '', '', '']); }}
                  className="flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground mb-6 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to form
                </button>

                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-blue-600" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Verify your email</h1>
                  <p className="text-muted-foreground">
                    We sent a 6-digit code to <strong className="text-foreground">{registeredEmail}</strong>
                  </p>
                </div>

                {serverError && (
                  <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm text-center">
                    {serverError}
                  </div>
                )}

                {/* OTP Input Grid */}
                <div className="flex justify-center gap-3 mb-8">
                  {otpValues.map((val, i) => (
                    <input
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={val}
                      onChange={(e) => handleOTPChange(i, e.target.value)}
                      onKeyDown={(e) => handleOTPKeyDown(i, e)}
                      onPaste={i === 0 ? handleOTPPaste : undefined}
                      className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-xl border-2 border-border bg-background text-foreground focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                      disabled={isVerifying}
                    />
                  ))}
                </div>

                {/* Verify Button */}
                <Button
                  onClick={handleVerifyOTP}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-full transition-all shadow-lg hover:shadow-blue-600/25"
                  disabled={isVerifying || otpValues.join('').length !== 6}
                >
                  {isVerifying ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Verifying...</>
                  ) : (
                    'Verify & Create Account'
                  )}
                </Button>

                {/* Resend OTP */}
                <div className="text-center mt-6">
                  <p className="text-sm text-muted-foreground mb-2">Didn&apos;t receive the code?</p>
                  {countdown > 0 ? (
                    <p className="text-sm text-foreground/50">
                      Resend in <span className="font-mono font-semibold text-blue-600">{countdown}s</span>
                    </p>
                  ) : (
                    <button
                      onClick={handleResendOTP}
                      disabled={resendOTPMutation.isPending}
                      className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1.5 mx-auto transition"
                    >
                      <RotateCw className={`w-3.5 h-3.5 ${resendOTPMutation.isPending ? 'animate-spin' : ''}`} />
                      {resendOTPMutation.isPending ? 'Resending...' : 'Resend OTP'}
                    </button>
                  )}
                </div>
              </>
            )}
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
