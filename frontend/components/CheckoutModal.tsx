'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCreateOrder, useVerifyPayment } from '@/lib/hooks/usePaymentQueries';
import { useQueryClient } from '@tanstack/react-query';

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface CheckoutModalProps {
    eventId: string;
    eventTitle: string;
    price: number;
    quantity: number;
    onClose: () => void;
}

export default function CheckoutModal({ eventId, eventTitle, price, quantity, onClose }: CheckoutModalProps) {
    const createOrder = useCreateOrder();
    const verifyPayment = useVerifyPayment();
    const queryClient = useQueryClient();
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const totalAmount = price * quantity;

    // Load Razorpay script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handlePayment = useCallback(async () => {
        setPaymentStatus('loading');
        setErrorMessage('');

        try {
            // 1. Create order on backend
            const orderData = await createOrder.mutateAsync({ eventId, quantity });

            // 2. Open Razorpay checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'Spot Events',
                description: `Tickets for ${eventTitle}`,
                order_id: orderData.orderId,
                handler: async (response: any) => {
                    try {
                        // 3. Verify payment on backend
                        await verifyPayment.mutateAsync({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            eventId,
                            quantity,
                        });
                        setPaymentStatus('success');
                        queryClient.invalidateQueries({ queryKey: ['tickets'] });
                    } catch (err: any) {
                        setErrorMessage(err?.message || 'Payment verification failed');
                        setPaymentStatus('error');
                    }
                },
                modal: {
                    ondismiss: () => {
                        if (paymentStatus !== 'success') {
                            setPaymentStatus('idle');
                        }
                    },
                },
                theme: {
                    color: '#2563eb',
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (response: any) => {
                setErrorMessage(response.error?.description || 'Payment failed. Please try again.');
                setPaymentStatus('error');
            });
            rzp.open();
        } catch (err: any) {
            setErrorMessage(err?.message || 'Failed to initialize payment. Please try again.');
            setPaymentStatus('error');
        }
    }, [eventId, eventTitle, quantity, createOrder, verifyPayment, paymentStatus]);

    // Auto-start payment on mount
    useEffect(() => {
        if (paymentStatus === 'idle') {
            handlePayment();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-border">
                    <div>
                        <h2 className="text-lg font-bold">Checkout</h2>
                        <p className="text-sm text-foreground/50 mt-0.5">
                            {quantity} ticket{quantity > 1 ? 's' : ''} · ₹{totalAmount.toFixed(2)}
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
                    {paymentStatus === 'success' && (
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
                    )}

                    {paymentStatus === 'loading' && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
                            <p className="text-sm text-foreground/50">Preparing payment...</p>
                        </div>
                    )}

                    {paymentStatus === 'error' && (
                        <div className="text-center py-8">
                            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                            <p className="text-sm text-red-600 dark:text-red-400 mb-4">{errorMessage}</p>
                            <button
                                onClick={handlePayment}
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {paymentStatus === 'idle' && (
                        <div className="text-center py-8">
                            <p className="text-sm text-foreground/50 mb-4">
                                Click below to pay ₹{totalAmount.toFixed(2)}
                            </p>
                            <button
                                onClick={handlePayment}
                                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                            >
                                Pay with Razorpay
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
