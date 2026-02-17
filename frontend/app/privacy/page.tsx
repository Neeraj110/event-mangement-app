'use client';

import { Header } from '@/components/header';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background">
            <Header />

            {/* Hero */}
            <section className="border-b border-border py-16 md:py-24">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Privacy Policy</h1>
                    <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
                        Last updated: February 2026
                    </p>
                </div>
            </section>

            {/* Content */}
            <section className="py-16 md:py-24">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-12">
                    <div>
                        <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
                        <p className="text-foreground/70 leading-relaxed mb-3">
                            We collect the following categories of information when you use Spot:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-foreground/70">
                            <li><strong>Account Information:</strong> Name, email address, profile picture, and login credentials</li>
                            <li><strong>Payment Data:</strong> Billing address and payment method details (processed securely via Stripe)</li>
                            <li><strong>Event Data:</strong> Events you create, attend, or save</li>
                            <li><strong>Usage Data:</strong> Pages visited, features used, and interaction patterns</li>
                            <li><strong>Device Data:</strong> Browser type, IP address, and operating system</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
                        <p className="text-foreground/70 leading-relaxed mb-3">
                            We use the information we collect to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-foreground/70">
                            <li>Provide, maintain, and improve our services</li>
                            <li>Process ticket purchases and payments</li>
                            <li>Send event reminders and relevant notifications</li>
                            <li>Personalize your event discovery experience</li>
                            <li>Detect and prevent fraud or abuse</li>
                            <li>Comply with legal obligations</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-4">3. Information Sharing</h2>
                        <p className="text-foreground/70 leading-relaxed">
                            We do not sell your personal information. We may share your information with
                            event organizers (for events you register for), payment processors, and service
                            providers who help us operate the platform. We may also disclose information
                            when required by law or to protect our rights.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-4">4. Data Security</h2>
                        <p className="text-foreground/70 leading-relaxed">
                            We implement industry-standard security measures to protect your data, including
                            encryption in transit (TLS/SSL), secure data storage, and regular security audits.
                            However, no method of transmission over the internet is 100% secure, and we cannot
                            guarantee absolute security.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-4">5. Cookies & Tracking</h2>
                        <p className="text-foreground/70 leading-relaxed">
                            We use cookies and similar technologies to remember your preferences, authenticate
                            your sessions, and analyze usage patterns. You can control cookie settings through
                            your browser, though some features may not function properly without them.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-4">6. Your Rights</h2>
                        <p className="text-foreground/70 leading-relaxed mb-3">
                            Depending on your location, you may have the right to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-foreground/70">
                            <li>Access and receive a copy of your personal data</li>
                            <li>Correct inaccurate or incomplete information</li>
                            <li>Delete your account and associated data</li>
                            <li>Opt out of marketing communications</li>
                            <li>Object to or restrict certain processing activities</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-4">7. Data Retention</h2>
                        <p className="text-foreground/70 leading-relaxed">
                            We retain your personal information for as long as your account is active or as
                            needed to provide services. If you delete your account, we will remove your
                            personal data within 30 days, except where retention is required by law.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-4">8. Contact Us</h2>
                        <p className="text-foreground/70 leading-relaxed">
                            For privacy-related questions or requests, contact us at{' '}
                            <a href="mailto:privacy@spot.events" className="text-blue-600 hover:underline">
                                privacy@spot.events
                            </a>.
                        </p>
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
