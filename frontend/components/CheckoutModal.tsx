'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCreatePaymentIntent } from '@/lib/hooks/usePaymentQueries';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface CheckoutModalProps {
    eventId: string;
    eventTitle: string;
    price: number;
    quantity: number;
    onClose: () => void;
}

function CheckoutForm({ onClose, eventTitle }: { onClose: () => void; eventTitle: string }) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setIsProcessing(true);
        setErrorMessage('');

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.href,
            },
            redirect: 'if_required',
        });

        if (error) {
            setErrorMessage(error.message || 'Payment failed. Please try again.');
            setPaymentStatus('error');
        } else if (paymentIntent?.status === 'succeeded') {
            setPaymentStatus('success');
        }

        setIsProcessing(false);
    };

    if (paymentStatus === 'success') {
        return (
            <div className="text-center py-8">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Payment Successful!</h3>
                <p className="text-foreground/60 mb-6">
                    Your tickets for <strong>{eventTitle}</strong> have been booked.
                    You&apos;ll receive a confirmation email shortly.
                </p>
                <button
                    onClick={onClose}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                >
                    Done
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement
                options={{
                    layout: 'tabs',
                }}
            />
            {paymentStatus === 'error' && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {errorMessage}
                </div>
            )}
            <button
                type="submit"
                disabled={!stripe || isProcessing}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                    </>
                ) : (
                    'Pay Now'
                )}
            </button>
        </form>
    );
}

export default function CheckoutModal({ eventId, eventTitle, price, quantity, onClose }: CheckoutModalProps) {
    const createPaymentIntent = useCreatePaymentIntent();
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const totalAmount = price * quantity;

    const handleInitPayment = async () => {
        setIsLoading(true);
        setError('');
        try {
            const result = await createPaymentIntent.mutateAsync({ eventId, quantity });
            setClientSecret(result.clientSecret);
        } catch (err: any) {
            setError(err?.message || 'Failed to initialize payment. Please try again.');
        }
        setIsLoading(false);
    };

    // Auto-init payment on mount
    if (!clientSecret && !isLoading && !error) {
        handleInitPayment();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-border">
                    <div>
                        <h2 className="text-lg font-bold">Checkout</h2>
                        <p className="text-sm text-foreground/50 mt-0.5">
                            {quantity} ticket{quantity > 1 ? 's' : ''} · ${totalAmount.toFixed(2)}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-lg transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5">
                    {error && (
                        <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                            <button
                                onClick={handleInitPayment}
                                className="ml-auto text-xs font-medium underline"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
                            <p className="text-sm text-foreground/50">Preparing payment...</p>
                        </div>
                    )}

                    {clientSecret && (
                        <Elements
                            stripe={stripePromise}
                            options={{
                                clientSecret,
                                appearance: {
                                    theme: 'stripe',
                                    variables: {
                                        colorPrimary: '#2563eb',
                                        borderRadius: '8px',
                                    },
                                },
                            }}
                        >
                            <CheckoutForm onClose={onClose} eventTitle={eventTitle} />
                        </Elements>
                    )}
                </div>
            </div>
        </div>
    );
}
