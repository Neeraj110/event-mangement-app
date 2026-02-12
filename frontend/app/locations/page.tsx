'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { MapPin, Users, TrendingUp, Loader2 } from 'lucide-react';
import { useEvents } from '@/lib/hooks/useEventQueries';
import { useMemo } from 'react';

// Define Interface for Event based on backend model
interface Event {
  _id: string;
  title: string;
  location: {
    city: string;
    country?: string; // Optional as backend model has city but maybe not country explicitly in location object based on verify
  };
  startDate: string;
  coverImage: string;
  capacity: number;
}

export default function LocationsPage() {
  const { data: events, isLoading, error } = useEvents();

  const locations = useMemo(() => {
    if (!events) return [];

    const cityMap = new Map();

    events.forEach((event: any) => {
      const city = event.location?.city || 'Unknown';
      // Assume country is part of location or separate, if not available use placeholder
      // The backend model showed location: { city, lat, lng }, no country. 
      // We might need to guess country or omit it. Let's use 'Global' or try to infer.
      const country = event.location?.country || 'Global';

      if (!cityMap.has(city)) {
        cityMap.set(city, {
          city,
          country,
          events: 0,
          attendees: 0,
          image: event.coverImage, // Use the first event's image as the city image
          trend: '+0%', // Placeholder as backend doesn't provide trend
        });
      }

      const cityData = cityMap.get(city);
      cityData.events += 1;
      // We don't have exact attendees count per event in the model shown (only capacity), 
      // so we can sum capacity or just 0 if we want "actual attendees". 
      // Let's use capacity to show potential size.
      cityData.attendees += event.capacity || 0;
    });

    return Array.from(cityMap.values());
  }, [events]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-destructive">Error loading locations</h2>
          <p className="text-foreground/70">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="border-b border-border py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Explore Locations
          </h1>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
            Discover thriving event communities across the globe. Find what's happening in your city.
          </p>
        </div>
      </section>

      {/* Locations Grid */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations.length > 0 ? (
              locations.map((location) => (
                <Link key={location.city} href={`/events?location=${location.city}`}>
                  <div className="group cursor-pointer animate-fade-in">
                    <div className="relative rounded-lg overflow-hidden bg-muted h-48 mb-4">
                      <Image
                        src={location.image || "/placeholder.svg"}
                        alt={location.city}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <h3 className="text-2xl font-bold">{location.city}</h3>
                        <p className="text-sm text-gray-200">{location.country}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-foreground/70">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">{location.trend} this month</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-card border border-border rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            <span className="text-xs text-foreground/60">Events</span>
                          </div>
                          <p className="text-lg font-semibold">{location.events.toLocaleString()}</p>
                        </div>

                        <div className="bg-card border border-border rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span className="text-xs text-foreground/60">Capacity</span>
                          </div>
                          <p className="text-lg font-semibold">{(location.attendees / 1000).toFixed(1)}K</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-foreground/60">
                No events found in any location.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-muted/50 border-t border-b border-border py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center">Global Event Statistics</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">{locations.length}+</div>
              <p className="text-foreground/70">Cities Active</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {/* Sum of all attendees/capacity */}
                {((locations.reduce((acc, curr) => acc + curr.attendees, 0)) / 1000).toFixed(1)}K+
              </div>
              <p className="text-foreground/70">Total Capacity</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {/* Sum of all events */}
                {locations.reduce((acc, curr) => acc + curr.events, 0)}+
              </div>
              <p className="text-foreground/70">Active Events</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Find Your Next Event</h2>
          <p className="text-lg text-foreground/70 mb-8">
            Browse events in any location or create your own.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link href="/events">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                Browse All Events
              </Button>
            </Link>
            <Link href="/my-events">
              <Button variant="outline">
                Create Event
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
