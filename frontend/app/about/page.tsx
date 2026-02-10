'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Users, Globe, Zap } from 'lucide-react';

export default function AboutPage() {
  const team = [
    {
      name: 'Sarah Chen',
      role: 'Co-Founder & CEO',
      bio: 'Events enthusiast with 10+ years in tech.',
      initials: 'SC',
    },
    {
      name: 'Marcus Williams',
      role: 'Co-Founder & CTO',
      bio: 'Full-stack engineer passionate about community.',
      initials: 'MW',
    },
    {
      name: 'Priya Patel',
      role: 'Head of Operations',
      bio: 'Events logistics expert and strategist.',
      initials: 'PP',
    },
    {
      name: 'James Rodriguez',
      role: 'Head of Design',
      bio: 'UX/UI specialist focused on user experiences.',
      initials: 'JR',
    },
  ];

  const features = [
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Connect with event organizers and attendees worldwide',
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Built by and for the events community',
    },
    {
      icon: Zap,
      title: 'Powerful Tools',
      description: 'Everything you need to run successful events',
    },
    {
      icon: CheckCircle2,
      title: 'Reliable Platform',
      description: 'Trusted by thousands of event organizers',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="border-b border-border py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About Spot
          </h1>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto mb-8">
            We believe that events bring people together and create meaningful experiences. Spot is here to make discovering, organizing, and managing events easier than ever.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-24 border-b border-border">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-foreground/70 mb-4">
                Spot was founded with a simple mission: to democratize event management and make it accessible to everyone. Whether you're organizing a small workshop or a large festival, Spot provides the tools you need.
              </p>
              <p className="text-foreground/70">
                We're committed to building a platform that's not just powerful for organizers, but delightful for attendees. Every feature we create is designed with both sides in mind.
              </p>
            </div>
            <div className="relative h-80 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=400&fit=crop"
                alt="Spot mission"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 border-b border-border">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center">Why Choose Spot</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="bg-card border border-border rounded-xl p-6">
                  <Icon className="w-8 h-8 text-blue-600 mb-3" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-foreground/70">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 md:py-24 border-b border-border">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center">Meet Our Team</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {team.map((member) => (
              <div key={member.name} className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                    {member.initials}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{member.name}</h3>
                    <p className="text-sm text-blue-600 font-medium">{member.role}</p>
                  </div>
                </div>
                <p className="text-foreground/70 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-24 border-b border-border bg-muted/50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">50K+</div>
              <p className="text-foreground/70">Events Hosted</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">2M+</div>
              <p className="text-foreground/70">Attendees</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">150+</div>
              <p className="text-foreground/70">Countries</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Create Your Event?</h2>
          <p className="text-lg text-foreground/70 mb-8">
            Join thousands of organizers using Spot to manage their events.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link href="/my-events">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                Get Started
              </Button>
            </Link>
            <Link href="/events">
              <Button variant="outline">
                Browse Events
              </Button>
            </Link>
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
