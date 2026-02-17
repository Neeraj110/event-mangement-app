'use client';

import Link from 'next/link';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const plans = [
    {
        name: 'Free',
        price: '$0',
        period: 'forever',
        description: 'Perfect for individuals hosting small, free events.',
        features: [
            'Up to 3 events per month',
            'Up to 50 attendees per event',
            'Basic event page',
            'Email confirmations',
            'Standard check-in',
        ],
        cta: 'Get Started',
        highlighted: false,
    },
    {
        name: 'Pro',
        price: '$29',
        period: '/month',
        description: 'For growing organizers who need more power and flexibility.',
        features: [
            'Unlimited events',
            'Up to 500 attendees per event',
            'Custom event branding',
            'Priority support',
            'Advanced analytics',
            'Discount codes & promo links',
            'Attendee management tools',
        ],
        cta: 'Start Free Trial',
        highlighted: true,
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        period: '',
        description: 'For large organizations and high-volume event producers.',
        features: [
            'Unlimited everything',
            'Dedicated account manager',
            'Custom integrations & API access',
            'White-label event pages',
            'SLA & uptime guarantee',
            'Multi-team collaboration',
            'Invoice billing',
        ],
        cta: 'Contact Sales',
        highlighted: false,
    },
];

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-background">
            <Header />

            {/* Hero */}
            <section className="border-b border-border py-16 md:py-24">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Simple, Transparent Pricing
                    </h1>
                    <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
                        Start for free, upgrade when you&apos;re ready. No hidden fees, no surprises.
                    </p>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="py-16 md:py-24">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8">
                        {plans.map((plan) => (
                            <div
                                key={plan.name}
                                className={`relative bg-card rounded-2xl p-8 flex flex-col ${plan.highlighted
                                        ? 'border-2 border-blue-600 shadow-xl shadow-blue-600/10 scale-[1.02]'
                                        : 'border border-border'
                                    }`}
                            >
                                {plan.highlighted && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                                        Most Popular
                                    </div>
                                )}

                                <div className="mb-6">
                                    <h2 className="text-xl font-bold mb-2">{plan.name}</h2>
                                    <div className="flex items-baseline gap-1 mb-3">
                                        <span className="text-4xl font-bold">{plan.price}</span>
                                        {plan.period && (
                                            <span className="text-foreground/50 text-sm">{plan.period}</span>
                                        )}
                                    </div>
                                    <p className="text-foreground/60 text-sm">{plan.description}</p>
                                </div>

                                <ul className="space-y-3 mb-8 flex-1">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-3 text-sm">
                                            <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                            <span className="text-foreground/80">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    className={`w-full font-semibold ${plan.highlighted
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                            : ''
                                        }`}
                                    variant={plan.highlighted ? 'default' : 'outline'}
                                >
                                    {plan.cta}
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 md:py-24 border-t border-border bg-muted/50">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">What payment methods do you accept?</h3>
                            <p className="text-foreground/70">
                                We accept all major credit and debit cards through Stripe. Enterprise customers
                                can also pay via invoice.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Can I cancel my subscription anytime?</h3>
                            <p className="text-foreground/70">
                                Yes! You can cancel your Pro subscription at any time. You'll continue to have
                                access until the end of your billing period.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Is there a fee per ticket sold?</h3>
                            <p className="text-foreground/70">
                                Free events have zero fees. For paid events, we charge a small service fee per
                                ticket which is included in the ticket price displayed to attendees.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Do you offer a free trial for the Pro plan?</h3>
                            <p className="text-foreground/70">
                                Yes! The Pro plan comes with a 14-day free trial. No credit card required
                                to start.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border bg-muted/50 py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-foreground/60 text-sm">
                    <p>© 2024 Spot Inc. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
