'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, MapPin, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';
import { CategoryCard } from '@/components/category-card';
import { EventCard } from '@/components/event-card';
import { useEvents } from '@/lib/hooks/useEventQueries';
import { useAuthStore } from '@/lib/stores/authStore';
import { User } from '@/types';
import Loading from './loading';
import heroImages from "@/public/heroImage1.jpg";
import { useSearchParams, useRouter } from 'next/navigation';

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setCredentials } = useAuthStore();

  // ─── Handle OAuth callback (accessToken in URL) ─────
  useEffect(() => {
    const token = searchParams.get('accessToken');
    if (token) {
      // Fetch user profile with the token and store credentials
      (async () => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || ''}/users/profile`,
            {
              headers: { Authorization: `Bearer ${token}` },
              credentials: 'include',
            }
          );
          if (res.ok) {
            const data = await res.json();
            setCredentials(data.user as User, token);
          }
        } catch (err) {
          console.error('OAuth callback error:', err);
        }
        // Clean the URL
        router.replace('/', { scroll: false });
      })();
    }
  }, [searchParams, router, setCredentials]);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('New York, NY');
  const [category, setCategory] = useState('All Categories');

  const { data: eventsData, isLoading, error } = useEvents();

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-red-500">Failed to load events. Please try again later.</p>
      </div>
    );
  }

  const categories = [
    { icon: '♪', label: 'Music', href: '/events?category=Music', color: 'bg-blue-100' },
    { icon: '💻', label: 'Tech', href: '/events?category=Tech', color: 'bg-pink-100' },
    { icon: '🎨', label: 'Arts', href: '/events?category=Arts', color: 'bg-pink-100' },
    { icon: '🍽️', label: 'Food', href: '/events?category=Food', color: 'bg-orange-100' },
    { icon: '💪', label: 'Health', href: '/events?category=Health', color: 'bg-green-100' },
    { icon: '💼', label: 'Business', href: '/events?category=Business', color: 'bg-cyan-100' },
  ];

  const trendingEvents = (eventsData || []).slice(0, 6).map((event) => ({
    _id: event._id,
    title: event.title,
    date: new Date(event.startDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    location: event.location.city,
    image: event.coverImage,
    price: event.price,
    category: event.category,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-2 pb-10 sm:px-6 lg:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden min-h-[550px] bg-slate-900 rounded-[2.5rem] shadow-2xl ring-1 ring-white/10 group">
            {/* Background Images Carousel */}
            <div className="absolute inset-0 z-0">
              <div
                className={`absolute inset-0 duration-1000 ease-in-out`}
              >
                <Image
                  src={heroImages}
                  alt="Event background"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Decorative gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-blue-500/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-20 md:py-28 z-10 flex flex-col items-center justify-center h-full text-center">
              <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-white/10 text-blue-200 backdrop-blur-md mb-8 border border-white/10 shadow-sm animate-fade-in-up">
                <span className="text-xs font-bold tracking-wider uppercase">Find Your Next Experience</span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-white drop-shadow-lg tracking-tight leading-tight">
                Events that <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">move you</span>
              </h1>

              <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl drop-shadow-md leading-relaxed">
                Discover the best concerts, workshops, and meetups in your area. Join a community of millions of event-goers.
              </p>

              {/* Search Bar */}
              <div className="w-full max-w-3xl bg-white/10 backdrop-blur-lg rounded-2xl p-2 md:p-3 shadow-2xl border border-white/20">
                <div className="bg-white rounded-xl p-1 md:p-2 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                    {/* Search Input */}
                    <div className="md:col-span-5 flex items-center gap-3 px-4 py-3 md:border-r border-gray-100">
                      <Search className="w-5 h-5 text-gray-400 shrink-0" />
                      <input
                        type="text"
                        placeholder="Search events..."
                        className="flex-1 outline-none text-gray-700 bg-transparent placeholder-gray-400 text-sm md:text-base font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    {/* Location Input */}
                    <div className="md:col-span-5 flex items-center gap-3 px-4 py-3">
                      <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
                      <Link href="/locations" className="flex-1 outline-none text-gray-700 hover:text-gray-900 transition font-medium text-sm md:text-base truncate">
                        {location}
                      </Link>
                    </div>

                    {/* Search Button */}
                    <div className="md:col-span-2">
                      <button className="w-full h-full min-h-[48px] bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center">
                        <span className="hidden md:inline">Search</span>
                        <Search className="w-5 h-5 md:hidden" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Category */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Browse by Category</h2>
          <Link href="/events" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <CategoryCard key={cat.label} {...cat} />
          ))}
        </div>
      </section>

      {/* Trending Near You */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Trending Near You</h2>
            <div className="flex items-center gap-1 text-sm text-foreground/60 mt-1">
              <span>●</span>
              <span>Popular in New York</span>
            </div>
          </div>
          <Link href="/events" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            View all events <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingEvents.map((event) => (
            <EventCard
              key={event._id}
              _id={event._id}
              title={event.title}
              date={event.date}
              location={event.location}
              image={event.image}
              price={event.price}
              category={event.category}
            />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="relative rounded-[2.5rem] bg-blue-600 px-6 py-16 md:px-16 md:py-20 overflow-hidden shadow-2xl">
            {/* Subtle background gradient effect */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none mix-blend-overlay"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none mix-blend-overlay"></div>

            <div className="relative flex flex-col md:flex-row items-center justify-between gap-10 md:gap-16">
              <div className="flex-1 text-left">
                <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-white/20 text-white backdrop-blur-md mb-6 border border-white/10 shadow-sm">
                  <span className="text-xs font-bold tracking-wider uppercase">For Organizers</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white tracking-tight leading-tight">
                  Host your own experience
                </h2>
                <p className="text-lg md:text-xl text-blue-50 max-w-xl leading-relaxed font-medium">
                  From intimate workshops to stadium-scale festivals, Spot gives you powerful tools to manage tickets, attendees, and marketing seamlessly.
                </p>
              </div>

              <div className="flex flex-col w-full md:w-auto gap-4 min-w-[200px] shrink-0">
                <Button className="w-full bg-white text-blue-600 hover:bg-gray-50 text-base md:text-lg h-12 md:h-14 font-bold shadow-lg transition-all hover:scale-105">
                  Create an Event
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-2 border-white/30 text-white hover:bg-white/10 bg-transparent text-base md:text-lg h-12 md:h-14 font-semibold backdrop-blur-sm transition-all hover:border-white"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 font-semibold mb-4">
                <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold text-xs">◆</span>
                </div>
                <span>Spot</span>
              </div>
              <p className="text-sm text-foreground/60">
                Spot is the leading platform for discovering and managing events. We connect people with experiences that move them.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">PLATFORM</h3>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li><Link href="/events" className="hover:text-foreground">Browse Events</Link></li>
                <li><Link href="/organizers" className="hover:text-foreground">Organizers</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">COMPANY</h3>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li><Link href="/about" className="hover:text-foreground">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-foreground">Careers</Link></li>
                <li><Link href="/blog" className="hover:text-foreground">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">RESOURCES</h3>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li><Link href="/help" className="hover:text-foreground">Help Center</Link></li>
                <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-foreground/60">© 2024 Spot Inc. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="text-foreground/60 hover:text-foreground">
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-7.029 3.746 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-foreground/60 hover:text-foreground">
                <span className="sr-only">Facebook</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18.896 12.6c0-4.889-3.759-8.846-8.39-8.846-4.632 0-8.39 3.957-8.39 8.846 0 4.412 3.191 8.09 7.375 8.728v-6.165h-2.522V12.6h2.522v-1.937c0-2.487 1.484-3.86 3.743-3.86 1.083 0 2.213.193 2.213.193v2.437h-1.247c-1.229 0-1.562.762-1.562 1.542v1.85h2.670l-.427 2.769h-2.243v6.165c4.185-.638 7.375-4.316 7.375-8.728z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
