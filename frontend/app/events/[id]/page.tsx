'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { MapPin, Clock, Users, Share2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';
import { EventCard } from '@/components/event-card';
import { useEventsStore } from '@/lib/stores/eventsStore';
import { useEvents } from '@/lib/hooks/useEventQueries';

export default function EventDetailsPage({ params }: { params: { id: string } }) {
  const { selectedEvent: event, selectEvent, allEvents, setAllEvents } = useEventsStore();
  const { data: eventsData } = useEvents();

  // Sync fetched events into store
  useEffect(() => {
    if (eventsData && Array.isArray(eventsData)) {
      const mapped = eventsData.map((ev: any) => ({
        id: ev._id,
        title: ev.title,
        description: ev.description || '',
        date: new Date(ev.startDate).toLocaleDateString(),
        time: new Date(ev.startDate).toLocaleTimeString(),
        endTime: ev.endDate ? new Date(ev.endDate).toLocaleTimeString() : '',
        location: ev.location?.city || 'TBD',
        city: ev.location?.city || '',
        state: '',
        category: ev.category || 'General',
        price: ev.price || 0,
        image: ev.coverImage || '/placeholder.svg',
        organizer: { name: 'Organizer', followers: 0 },
        status: 'upcoming' as const,
        capacity: ev.capacity,
        attendees: 0,
      }));
      setAllEvents(mapped);
    }
  }, [eventsData, setAllEvents]);

  useEffect(() => {
    if (allEvents.length > 0) {
      selectEvent(params.id);
    }
  }, [params.id, allEvents, selectEvent]);

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-96">
          <p className="text-foreground/60">Loading event details...</p>
        </div>
      </div>
    );
  }

  const relatedEvents = allEvents.filter(
    (e) => e.category === event.category && e.id !== event.id
  ).slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Image */}
      <div className="relative h-96 md:h-[500px] bg-muted overflow-hidden">
        <Image
          src={event.image || "/placeholder.svg"}
          alt={event.title}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title Section */}
            <div>
              <div className="inline-block bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-semibold mb-4">
                {event.category}
              </div>
              <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
              <p className="text-lg text-foreground/70">{event.description}</p>
            </div>

            {/* Event Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 py-6 border-y border-border">
              <div>
                <Clock className="w-5 h-5 mb-2 text-blue-600" />
                <p className="text-sm text-foreground/60">Date & Time</p>
                <p className="font-semibold">{event.date}</p>
                <p className="text-sm">{event.time} - {event.endTime}</p>
              </div>
              <div>
                <MapPin className="w-5 h-5 mb-2 text-blue-600" />
                <p className="text-sm text-foreground/60">Location</p>
                <p className="font-semibold">{event.location}</p>
                <p className="text-sm">{event.city}{event.state ? `, ${event.state}` : ''}</p>
              </div>
              <div>
                <Users className="w-5 h-5 mb-2 text-blue-600" />
                <p className="text-sm text-foreground/60">Attendees</p>
                <p className="font-semibold">{event.attendees || 0}/{event.capacity}</p>
                <p className="text-sm">Going</p>
              </div>
            </div>

            {/* About Section */}
            <div>
              <h2 className="text-2xl font-bold mb-4">About this event</h2>
              <p className="text-foreground/70 mb-4 leading-relaxed">
                {event.description}
              </p>
              {event.highlights && event.highlights.length > 0 && (
                <>
                  <h3 className="font-semibold mb-3">Highlights:</h3>
                  <ul className="list-disc list-inside space-y-2 text-foreground/70">
                    {event.highlights.map((highlight, i) => (
                      <li key={i}>{highlight}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {/* Organizer Section */}
            <div>
              <h2 className="text-2xl font-bold mb-4">About the organizer</h2>
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                {event.organizer.image && (
                  <Image
                    src={event.organizer.image || "/placeholder.svg"}
                    alt={event.organizer.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">{event.organizer.name}</h3>
                  <p className="text-sm text-foreground/60">{event.organizer.followers.toLocaleString()} followers</p>
                  <p className="text-sm text-foreground/70 mt-1">
                    A community-driven organization dedicated to empowering the next generation of technology leaders through events, workshops, and mentorship programs.
                  </p>
                </div>
                <Button variant="outline">Follow</Button>
              </div>
            </div>

            {/* Similar Events */}
            {relatedEvents.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Similar Events</h2>
                  <a href="/events" className="text-blue-600 hover:text-blue-700 font-medium">
                    View all →
                  </a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {relatedEvents.map((ev) => (
                    <EventCard
                      key={ev.id}
                      id={ev.id}
                      title={ev.title}
                      date={ev.date}
                      location={ev.location}
                      image={ev.image}
                      price={ev.price}
                      category={ev.category}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Ticket Card */}
            <div className="sticky top-20 border border-border rounded-lg p-6 bg-card space-y-6">
              <div>
                <p className="text-sm text-foreground/60 mb-2">Price per ticket</p>
                <p className="text-4xl font-bold text-blue-600">
                  {event.price > 0 ? `$${event.price.toFixed(2)}` : 'Free'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-green-600 font-medium">Available</span>
                </div>
                <p className="text-xs text-foreground/60">
                  {event.ticketsAvailable !== undefined
                    ? `${event.ticketsAvailable} tickets left`
                    : event.capacity !== undefined
                      ? `${event.capacity - (event.attendees || 0)} tickets left`
                      : 'Limited spots available'}
                </p>
              </div>

              {/* Quantity Selector */}
              <div className="border border-border rounded-lg p-3 flex items-center justify-between">
                <button className="px-3 py-1 text-lg font-semibold hover:bg-muted rounded">−</button>
                <span className="text-lg font-semibold">1</span>
                <button className="px-3 py-1 text-lg font-semibold hover:bg-muted rounded">+</button>
              </div>

              {/* Buttons */}
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base font-semibold">
                Get Tickets →
              </Button>

              <Button variant="outline" className="w-full bg-transparent">
                <Heart className="w-4 h-4 mr-2" />
                Save
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 bg-transparent">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Additional Info */}
              <div className="pt-4 border-t border-border space-y-3">
                <div className="flex items-center gap-2 text-sm text-foreground/60">
                  <span className="font-semibold">Online Event</span>
                </div>
                <p className="text-xs text-foreground/60">
                  This event includes an online option. Tickets will be valid for both in-person and virtual attendance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
