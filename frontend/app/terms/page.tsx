'use client';

import { Header } from '@/components/header';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="border-b border-border py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Terms and Conditions</h1>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
            Last updated: February 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div>
            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p className="text-foreground/70 leading-relaxed">
              By accessing or using Spot ("the Platform"), you agree to be bound by these
              Terms of Service. If you do not agree with any part of these terms, you may not
              use our services. These terms apply to all users, including event organizers,
              attendees, and visitors.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
            <p className="text-foreground/70 leading-relaxed">
              Spot provides an online platform that enables users to discover, create, and
              manage events. Our services include event listing, ticketing, payment processing,
              and attendee management. We reserve the right to modify, suspend, or discontinue
              any part of the service at any time.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">3. User Accounts</h2>
            <p className="text-foreground/70 leading-relaxed mb-3">
              To use certain features, you must create an account. You agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/70">
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Promptly notify us of any unauthorized use of your account</li>
              <li>Be responsible for all activity under your account</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">4. Event Creation & Organizer Responsibilities</h2>
            <p className="text-foreground/70 leading-relaxed">
              Organizers are responsible for the accuracy of their event listings, including dates,
              pricing, and descriptions. All events must comply with applicable local laws and
              regulations. Spot is not responsible for the content, quality, or safety of events
              listed on the platform.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">5. Payments & Refunds</h2>
            <p className="text-foreground/70 leading-relaxed">
              Payments are processed securely through our payment partner, Razorpay. Refund policies
              are set by individual event organizers. Spot charges a service fee on ticket sales,
              which is non-refundable. Organizers receive payouts according to the payout schedule
              detailed in their dashboard.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">6. Prohibited Conduct</h2>
            <p className="text-foreground/70 leading-relaxed mb-3">
              You may not use the Platform to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/70">
              <li>Violate any applicable laws or regulations</li>
              <li>Publish fraudulent or misleading event listings</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Resell tickets above face value (scalping)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">7. Intellectual Property</h2>
            <p className="text-foreground/70 leading-relaxed">
              All content, trademarks, and design elements on the Platform are owned by Spot Inc.
              or its licensors. You may not reproduce, distribute, or create derivative works
              without our prior written consent.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">8. Limitation of Liability</h2>
            <p className="text-foreground/70 leading-relaxed">
              Spot is provided on an "as is" basis. We are not liable for any indirect, incidental,
              or consequential damages arising from your use of the platform. Our total liability
              is limited to the amount you paid for our services in the preceding 12 months.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">9. Contact</h2>
            <p className="text-foreground/70 leading-relaxed">
              If you have questions about these Terms, please contact us at{' '}
              <a href="mailto:legal@spot.events" className="text-blue-600 hover:underline">
                legal@spot.events
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
