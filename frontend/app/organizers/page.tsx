'use client';

import Link from 'next/link';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import {
    BarChart3,
    CreditCard,
    Users,
    QrCode,
    Megaphone,
    Shield,
} from 'lucide-react';

const features = [
    {
        icon: BarChart3,
        title: 'Real-Time Analytics',
        description:
            'Track ticket sales, page views, and attendee engagement with a powerful dashboard.',
    },
    {
        icon: CreditCard,
        title: 'Secure Payments',
        description:
            'Accept payments confidently with Razorpay integration. Get paid quickly with automatic payouts.',
    },
    {
        icon: Users,
        title: 'Attendee Management',
        description:
            'View, manage, and communicate with your attendees all from one place.',
    },
    {
        icon: QrCode,
        title: 'Easy Check-In',
        description:
            'Scan QR code tickets at the door for fast, contactless event entry.',
    },
    {
        icon: Megaphone,
        title: 'Promotion Tools',
        description:
            'Create discount codes, share links, and leverage our platform for event promotion.',
    },
    {
        icon: Shield,
        title: 'Fraud Protection',
        description:
            'Advanced fraud detection and secure ticket validation protect you and your attendees.',
    },
];

const steps = [
    {
        number: '01',
        title: 'Create Your Event',
        description: 'Set up your event page with all the details — date, location, pricing, and more.',
    },
    {
        number: '02',
        title: 'Customize & Publish',
        description: 'Add images, descriptions, and ticket tiers. Hit publish when you\'re ready.',
    },
    {
        number: '03',
        title: 'Sell & Manage',
        description: 'Watch ticket sales roll in. Manage attendees and track performance from your dashboard.',
    },
    {
        number: '04',
        title: 'Host & Check In',
        description: 'Use QR check-in on event day. Focus on the experience — we handle the logistics.',
    },
];

export default function OrganizersPage() {
    return (
        <div className="min-h-screen bg-background">
            <Header />

            {/* Hero */}
            <section className="border-b border-border py-16 md:py-24">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 mb-6 border border-blue-100">
                        <span className="text-xs font-bold tracking-wider uppercase">For Organizers</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Everything You Need to Run Amazing Events
                    </h1>
                    <p className="text-xl text-foreground/70 max-w-2xl mx-auto mb-8">
                        From small meetups to large festivals, Spot gives you the tools to create,
                        promote, and manage events with ease.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/organizer/events/create">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 h-12">
                                Start Creating Events
                            </Button>
                        </Link>
                        <Link href="/pricing">
                            <Button variant="outline" className="font-semibold px-8 h-12">
                                View Pricing
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-16 md:py-24 border-b border-border">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold mb-12 text-center">Powerful Features</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={feature.title}
                                    className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow"
                                >
                                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                                        <Icon className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                                    <p className="text-foreground/60 text-sm leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-16 md:py-24 border-b border-border bg-muted/50">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        {steps.map((step) => (
                            <div key={step.number} className="flex gap-5">
                                <div className="text-4xl font-bold text-blue-600/20 shrink-0 leading-none">
                                    {step.number}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                                    <p className="text-foreground/60 text-sm leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 md:py-24 border-b border-border">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
                            <p className="text-foreground/70">Active Organizers</p>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-blue-600 mb-2">$5M+</div>
                            <p className="text-foreground/70">Tickets Sold</p>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-blue-600 mb-2">98%</div>
                            <p className="text-foreground/70">Satisfaction Rate</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 md:py-24">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to Host Your Event?</h2>
                    <p className="text-lg text-foreground/70 mb-8">
                        Join thousands of organizers who trust Spot to power their events.
                    </p>
                    <Link href="/organizer/events/create">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 h-12">
                            Create Your First Event
                        </Button>
                    </Link>
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
