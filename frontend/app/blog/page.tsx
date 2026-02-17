'use client';

import Link from 'next/link';
import { Header } from '@/components/header';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

const blogPosts = [
    {
        id: 1,
        title: '10 Tips for Hosting a Successful Virtual Event',
        excerpt:
            'Virtual events are here to stay. Learn how to create engaging online experiences that keep your audience connected and entertained.',
        category: 'Event Planning',
        date: 'Feb 10, 2026',
        readTime: '5 min read',
        gradient: 'from-blue-500 to-cyan-500',
    },
    {
        id: 2,
        title: 'How to Price Your Event Tickets for Maximum Attendance',
        excerpt:
            'Finding the sweet spot for ticket pricing can make or break your event. Here are proven strategies to optimize your pricing.',
        category: 'Ticketing',
        date: 'Feb 5, 2026',
        readTime: '7 min read',
        gradient: 'from-purple-500 to-pink-500',
    },
    {
        id: 3,
        title: 'The Rise of Hybrid Events: What Organizers Need to Know',
        excerpt:
            'Combine the best of in-person and virtual experiences. Discover how hybrid events are reshaping the events industry.',
        category: 'Trends',
        date: 'Jan 28, 2026',
        readTime: '6 min read',
        gradient: 'from-orange-500 to-red-500',
    },
    {
        id: 4,
        title: 'Building a Community Around Your Events',
        excerpt:
            'Events are more than one-time gatherings. Learn how to turn attendees into a thriving, engaged community.',
        category: 'Community',
        date: 'Jan 20, 2026',
        readTime: '8 min read',
        gradient: 'from-green-500 to-emerald-500',
    },
    {
        id: 5,
        title: 'Marketing Your Event on a Budget',
        excerpt:
            'You don\'t need a massive budget to fill your venue. These cost-effective marketing strategies will help you reach the right audience.',
        category: 'Marketing',
        date: 'Jan 15, 2026',
        readTime: '6 min read',
        gradient: 'from-indigo-500 to-blue-500',
    },
    {
        id: 6,
        title: 'Essential Check-in Tools for Seamless Event Entry',
        excerpt:
            'First impressions matter. Streamline your event entry process with modern check-in solutions and best practices.',
        category: 'Technology',
        date: 'Jan 8, 2026',
        readTime: '4 min read',
        gradient: 'from-rose-500 to-pink-500',
    },
];

export default function BlogPage() {
    return (
        <div className="min-h-screen bg-background">
            <Header />

            {/* Hero */}
            <section className="border-b border-border py-16 md:py-24">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Blog</h1>
                    <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
                        Insights, tips, and stories from the world of events. Stay ahead with the latest trends and best practices.
                    </p>
                </div>
            </section>

            {/* Blog Grid */}
            <section className="py-16 md:py-24">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogPosts.map((post) => (
                            <article
                                key={post.id}
                                className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow group"
                            >
                                {/* Gradient Header */}
                                <div className={`h-48 bg-gradient-to-br ${post.gradient} flex items-end p-6`}>
                                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                                        {post.category}
                                    </span>
                                </div>

                                <div className="p-6">
                                    <h2 className="text-lg font-bold mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                                        {post.title}
                                    </h2>
                                    <p className="text-foreground/60 text-sm leading-relaxed mb-4 line-clamp-3">
                                        {post.excerpt}
                                    </p>

                                    <div className="flex items-center justify-between text-xs text-foreground/50">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {post.date}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {post.readTime}
                                            </span>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter CTA */}
            <section className="py-16 md:py-24 border-t border-border bg-muted/50">
                <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-4">Stay in the Loop</h2>
                    <p className="text-foreground/70 mb-8">
                        Get the latest articles and event industry insights delivered to your inbox.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-foreground/40 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                            Subscribe
                        </button>
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
