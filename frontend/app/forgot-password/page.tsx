'use client';

import Link from 'next/link';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Mail, Lock, Loader2, ArrowLeft, RotateCw, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { useForgotPassword, useResetPassword, useResendOTP } from '@/lib/hooks/useAuthQueries';

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<'email' | 'reset' | 'done'>('email');
    const [email, setEmail] = useState('');
    const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [serverError, setServerError] = useState('');
    const [countdown, setCountdown] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const forgotMutation = useForgotPassword();
    const resetMutation = useResetPassword();
    const resendMutation = useResendOTP();
    const router = useRouter();

    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    useEffect(() => {
        if (step === 'reset') {
            inputRefs.current[0]?.focus();
        }
    }, [step]);

    // Step 1: Send OTP to email
    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerError('');

        if (!email) {
            setServerError('Please enter your email address');
            return;
        }

        try {
            await forgotMutation.mutateAsync({ email });
            setStep('reset');
            setCountdown(60);
            toast.success('OTP sent to your email!');
        } catch (err: any) {
            setServerError(err?.message || 'Failed to send OTP.');
        }
    };

    // OTP input handlers
    const handleOTPChange = useCallback((index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newValues = [...otpValues];
        newValues[index] = value.slice(-1);
        setOtpValues(newValues);
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
        const focusIdx = Math.min(pasted.length, 5);
        inputRefs.current[focusIdx]?.focus();
    }, [otpValues]);

    // Step 2: Verify OTP and reset password
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        const otp = otpValues.join('');
        setServerError('');

        if (otp.length !== 6) {
            setServerError('Please enter all 6 digits');
            return;
        }
        if (newPassword.length < 6) {
            setServerError('Password must be at least 6 characters');
            return;
        }

        try {
            await resetMutation.mutateAsync({ email, otp, newPassword });
            setStep('done');
            toast.success('Password reset successfully!');
        } catch (err: any) {
            setServerError(err?.message || 'Failed to reset password.');
        }
    };

    // Resend OTP
    const handleResendOTP = async () => {
        setServerError('');
        try {
            await resendMutation.mutateAsync({ email, purpose: 'forgot-password' });
            setOtpValues(['', '', '', '', '', '']);
            setCountdown(60);
            toast.success('OTP resent!');
            inputRefs.current[0]?.focus();
        } catch (err: any) {
            setServerError(err?.message || 'Failed to resend OTP.');
        }
    };

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
                    Back to <span className="font-bold">Log in</span>
                </Link>
            </header>

            {/* Main */}
            <div className="flex-1 flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-md">
                    <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg">

                        {step === 'email' && (
                            /* ─── STEP 1: Enter Email ─── */
                            <>
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Lock className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <h1 className="text-2xl font-bold text-foreground mb-2">Forgot password?</h1>
                                    <p className="text-muted-foreground text-sm">
                                        Enter your email and we&apos;ll send you a code to reset your password.
                                    </p>
                                </div>

                                {serverError && (
                                    <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm text-center">
                                        {serverError}
                                    </div>
                                )}

                                <form onSubmit={handleSendOTP} className="space-y-4">
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-3 w-5 h-5 text-muted-foreground" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="email@example.com"
                                            className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                                            disabled={forgotMutation.isPending}
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-full shadow-lg"
                                        disabled={forgotMutation.isPending || !email}
                                    >
                                        {forgotMutation.isPending ? (
                                            <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Sending OTP...</>
                                        ) : (
                                            'Send Reset Code'
                                        )}
                                    </Button>
                                </form>
                            </>
                        )}

                        {step === 'reset' && (
                            /* ─── STEP 2: Enter OTP + New Password ─── */
                            <>
                                <button
                                    onClick={() => { setStep('email'); setServerError(''); setOtpValues(['', '', '', '', '', '']); setNewPassword(''); }}
                                    className="flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground mb-6 transition"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Change email
                                </button>

                                <div className="text-center mb-6">
                                    <h1 className="text-2xl font-bold text-foreground mb-2">Reset password</h1>
                                    <p className="text-muted-foreground text-sm">
                                        Enter the code sent to <strong className="text-foreground">{email}</strong>
                                    </p>
                                </div>

                                {serverError && (
                                    <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm text-center">
                                        {serverError}
                                    </div>
                                )}

                                <form onSubmit={handleResetPassword} className="space-y-6">
                                    {/* OTP Input */}
                                    <div className="flex justify-center gap-3">
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
                                                className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border-2 border-border bg-background text-foreground focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                                                disabled={resetMutation.isPending}
                                            />
                                        ))}
                                    </div>

                                    {/* New Password */}
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-3 w-5 h-5 text-muted-foreground" />
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="New password (min 6 chars)"
                                            className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                                            disabled={resetMutation.isPending}
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-full shadow-lg"
                                        disabled={resetMutation.isPending || otpValues.join('').length !== 6 || newPassword.length < 6}
                                    >
                                        {resetMutation.isPending ? (
                                            <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Resetting...</>
                                        ) : (
                                            'Reset Password'
                                        )}
                                    </Button>

                                    {/* Resend OTP */}
                                    <div className="text-center">
                                        {countdown > 0 ? (
                                            <p className="text-sm text-foreground/50">
                                                Resend in <span className="font-mono font-semibold text-blue-600">{countdown}s</span>
                                            </p>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleResendOTP}
                                                disabled={resendMutation.isPending}
                                                className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1.5 mx-auto transition"
                                            >
                                                <RotateCw className={`w-3.5 h-3.5 ${resendMutation.isPending ? 'animate-spin' : ''}`} />
                                                {resendMutation.isPending ? 'Resending...' : 'Resend Code'}
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </>
                        )}

                        {step === 'done' && (
                            /* ─── STEP 3: Success ─── */
                            <div className="text-center py-4">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                                <h1 className="text-2xl font-bold text-foreground mb-2">Password reset!</h1>
                                <p className="text-muted-foreground text-sm mb-6">
                                    Your password has been reset successfully. You can now log in with your new password.
                                </p>
                                <Button
                                    onClick={() => router.push('/login')}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-full shadow-lg"
                                >
                                    Go to Login
                                </Button>
                            </div>
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
