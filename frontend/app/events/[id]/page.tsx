'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Clock, Users, Share2, Heart, Loader2, Ticket, Calendar, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';
import { EventCard } from '@/components/event-card';
import { apiClient } from '@/lib/api/apiClient';
import { useAuthStore } from '@/lib/stores/authStore';
import { toast } from '@/hooks/use-toast';
import dynamic from 'next/dynamic';

const CheckoutModal = dynamic(() => import('@/components/CheckoutModal'), { ssr: false });

interface EventData {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: { city: string; lat: number; lng: number };
  startDate: string;
  endDate: string;
  coverImage: string;
  price: number;
  capacity: number;
  organizerId: { _id: string; name: string; email: string } | string;
  isPublished: boolean;
}

export default function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isAuthenticated } = useAuthStore();
  const [event, setEvent] = useState<EventData | null>(null);
  const [relatedEvents, setRelatedEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isSaved, setIsSaved] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [error, setError] = useState('');

  // Fetch event data directly from API
  useEffect(() => {
    async function fetchEvent() {
      setIsLoading(true);
      try {
        const data = await apiClient<{ event: EventData }>(`/events/${id}`, { skipAuth: true });
        setEvent(data.event);
      } catch (err: any) {
        setError(err?.message || 'Failed to load event');
      }
      setIsLoading(false);
    }
    fetchEvent();
  }, [id]);

  // Fetch related events
  useEffect(() => {
    async function fetchRelated() {
      try {
        const data = await apiClient<{ events: any[] }>('/events', { skipAuth: true });
        if (event) {
          const related = data.events
            .filter((e: any) => e.category === event.category && e._id !== event._id)
            .slice(0, 3);
          setRelatedEvents(related);
        }
      } catch { }
    }
    if (event) fetchRelated();
  }, [event]);

  // Load saved state from localStorage
  useEffect(() => {
    const savedEvents = JSON.parse(localStorage.getItem('savedEvents') || '[]');
    setIsSaved(savedEvents.includes(id));
  }, [id]);

  const handleSave = () => {
    const savedEvents: string[] = JSON.parse(localStorage.getItem('savedEvents') || '[]');
    let updated: string[];
    if (isSaved) {
      updated = savedEvents.filter((eid) => eid !== id);
      toast({ title: 'Removed from saved events' });
    } else {
      updated = [...savedEvents, id];
      toast({ title: 'Event saved!' });
    }
    localStorage.setItem('savedEvents', JSON.stringify(updated));
    setIsSaved(!isSaved);
  };

  const handleShare = async () => {
    const url = window.location.href;
    const text = `Check out ${event?.title} on Spot!`;

    if (navigator.share) {
      try {
        await navigator.share({ title: event?.title, text, url });
      } catch { }
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link copied to clipboard!' });
    }
  };

  const handleGetTickets = () => {
    if (!isAuthenticated) {
      toast({ title: 'Please log in to purchase tickets', variant: 'destructive' });
      return;
    }
    setShowCheckout(true);
  };

  const ticketsLeft = event ? event.capacity : 0;
  const maxQty = Math.min(ticketsLeft, 10);

  // Helper to extract organizer info
  const getOrganizerName = () => {
    if (!event) return 'Organizer';
    if (typeof event.organizerId === 'object' && event.organizerId?.name) {
      return event.organizerId.name;
    }
    return 'Organizer';
  };

  const getOrganizerEmail = () => {
    if (!event) return '';
    if (typeof event.organizerId === 'object' && event.organizerId?.email) {
      return event.organizerId.email;
    }
    return '';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <p className="text-foreground/60">{error || 'Event not found'}</p>
          <Link href="/events" className="text-blue-600 hover:underline flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to events
          </Link>
        </div>
      </div>
    );
  }

  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Image */}
      <div className="relative h-80 md:h-[460px] bg-muted overflow-hidden">
        <Image
          src={event.coverImage || '/placeholder.svg'}
          alt={event.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-6 left-6">
          <span className="inline-block bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg">
            {event.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* ───── Main Content ───── */}
          <div className="lg:col-span-2 space-y-10">
            {/* Title */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">{event.title}</h1>
              <p className="text-lg text-foreground/60 leading-relaxed">{event.description}</p>
            </div>

            {/* Event Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 py-6 border-y border-border">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-foreground/50 uppercase tracking-wider font-medium">Date & Time</p>
                  <p className="font-semibold mt-0.5">
                    {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="text-sm text-foreground/60">
                    {startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    {' – '}
                    {endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-foreground/50 uppercase tracking-wider font-medium">Location</p>
                  <p className="font-semibold mt-0.5">{event.location.city}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-foreground/50 uppercase tracking-wider font-medium">Capacity</p>
                  <p className="font-semibold mt-0.5">{event.capacity} spots</p>
                </div>
              </div>
            </div>

            {/* Google Maps */}
            {event.location.lat && event.location.lng && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Event Location</h2>
                <div className="rounded-xl overflow-hidden border border-border shadow-sm">
                  <iframe
                    src={`https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3000!2d${event.location.lng}!3d${event.location.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sus!4v1`}
                    width="100%"
                    height="350"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Event location"
                  />
                </div>
                <p className="text-sm text-foreground/50 mt-2">
                  📍 {event.location.city} ({event.location.lat.toFixed(4)}, {event.location.lng.toFixed(4)})
                </p>
              </div>
            )}

            {/* About Section */}
            <div>
              <h2 className="text-2xl font-bold mb-4">About this event</h2>
              <div className="prose prose-foreground/80 max-w-none">
                <p className="text-foreground/70 leading-relaxed whitespace-pre-wrap">{event.description}</p>
              </div>
            </div>

            {/* Organizer Section */}
            <div>
              <h2 className="text-2xl font-bold mb-4">About the organizer</h2>
              <div className="flex items-center gap-4 p-5 bg-muted/50 rounded-xl border border-border">
                <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-blue-600">
                    {getOrganizerName().charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg">{getOrganizerName()}</h3>
                  {getOrganizerEmail() && (
                    <p className="text-sm text-foreground/50">{getOrganizerEmail()}</p>
                  )}
                  <p className="text-sm text-foreground/60 mt-1">
                    Event organizer on Spot platform
                  </p>
                </div>
              </div>
            </div>

            {/* Related Events */}
            {relatedEvents.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Similar Events</h2>
                  <Link href="/events" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    View all →
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {relatedEvents.map((ev: any) => (
                    <EventCard
                      key={ev._id}
                      _id={ev._id}
                      title={ev.title}
                      date={new Date(ev.startDate).toLocaleDateString()}
                      location={ev.location?.city || 'TBD'}
                      image={ev.coverImage || '/placeholder.svg'}
                      price={ev.price}
                      category={ev.category}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ───── Sidebar ───── */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 border border-border rounded-2xl p-6 bg-card shadow-sm space-y-5">
              {/* Price */}
              <div>
                <p className="text-sm text-foreground/50 mb-1">Price per ticket</p>
                <p className="text-4xl font-bold text-blue-600">
                  {event.price > 0 ? `$${event.price.toFixed(2)}` : 'Free'}
                </p>
              </div>

              {/* Availability */}
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm text-emerald-600 font-medium">Available</span>
                <span className="text-xs text-foreground/40 ml-auto">
                  {ticketsLeft} tickets left
                </span>
              </div>

              {/* Quantity Selector */}
              {event.price > 0 && (
                <div className="border border-border rounded-xl p-3 flex items-center justify-between">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-lg font-semibold hover:bg-muted rounded-lg transition"
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <span className="text-lg font-bold w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                    className="w-10 h-10 flex items-center justify-center text-lg font-semibold hover:bg-muted rounded-lg transition"
                    disabled={quantity >= maxQty}
                  >
                    +
                  </button>
                </div>
              )}

              {/* Total */}
              {event.price > 0 && quantity > 1 && (
                <div className="flex items-center justify-between text-sm font-medium px-1">
                  <span className="text-foreground/60">Total ({quantity} tickets)</span>
                  <span className="text-foreground font-bold">${(event.price * quantity).toFixed(2)}</span>
                </div>
              )}

              {/* Get Tickets Button */}
              <Button
                onClick={handleGetTickets}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base font-semibold rounded-xl"
              >
                <Ticket className="w-5 h-5 mr-2" />
                {event.price > 0 ? 'Get Tickets →' : 'Register (Free) →'}
              </Button>

              {/* Save Button */}
              <Button
                variant="outline"
                onClick={handleSave}
                className={`w-full rounded-xl transition-all ${isSaved
                  ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-600'
                  : 'bg-transparent'
                  }`}
              >
                <Heart className={`w-4 h-4 mr-2 transition-all ${isSaved ? 'fill-red-500 text-red-500 scale-110' : ''}`} />
                {isSaved ? 'Saved' : 'Save'}
              </Button>

              {/* Share Button */}
              <Button
                variant="outline"
                onClick={handleShare}
                className="w-full bg-transparent rounded-xl"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          eventId={event._id}
          eventTitle={event.title}
          price={event.price}
          quantity={quantity}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </div>
  );
}
