'use client';

import { useState, useEffect } from 'react';
import { Search, Grid2x2, List, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';
import { EventCard } from '@/components/event-card';
import { EventFilters } from '@/components/event-filters';
import { useEventsStore } from '@/lib/stores/eventsStore';
import { useEvents } from '@/lib/hooks/useEventQueries';
import { useSearchParams } from 'next/navigation';
import Loading from './loading';

export default function EventsPage() {
  const { filteredEvents, filterEvents, setAllEvents } = useEventsStore();
  const { data: eventsData, isLoading } = useEvents();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [showFilters, setShowFilters] = useState(true);
  const searchParams = useSearchParams();

  // Sync fetched events into the Zustand store for local filtering
  useEffect(() => {
    if (eventsData && Array.isArray(eventsData)) {
      const mapped = eventsData.map((event: any) => ({
        _id: event._id,
        title: event.title,
        description: event.description || '',
        date: new Date(event.startDate).toLocaleDateString(),
        time: new Date(event.startDate).toLocaleTimeString(),
        endTime: event.endDate ? new Date(event.endDate).toLocaleTimeString() : '',
        location: event.location?.city || 'TBD',
        city: event.location?.city || '',
        state: '',
        category: event.category || 'General',
        price: event.price || 0,
        image: event.coverImage || '/placeholder.svg',
        organizer: { name: 'Organizer', followers: 0 },
        status: 'upcoming' as const,
        capacity: event.capacity,
      }));
      setAllEvents(mapped);
    }
  }, [eventsData, setAllEvents]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterEvents({ searchQuery: query });
  };

  if (isLoading) return <Loading />;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <a href="/" className="text-foreground/60 hover:text-foreground">
              Home
            </a>
            <span className="text-foreground/60">/</span>
            <span className="font-medium">Events</span>
          </nav>
        </div>
      </div>

      {/* Top Bar */}
      <div className="border-b border-border sticky top-16 bg-background z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search */}
            <div className="flex-1 md:max-w-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                <input
                  type="text"
                  placeholder="Search events, categories, locations..."
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 hover:bg-muted rounded-lg transition md:hidden"
                title="Toggle filters"
              >
                <Sliders className="w-5 h-5" />
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg text-sm bg-background hover:bg-muted transition"
              >
                <option value="recommended">Sort by: Recommended</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popularity">Most Popular</option>
              </select>

              <div className="hidden md:flex items-center border border-border rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition ${viewMode === 'grid'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-foreground/60 hover:text-foreground'
                    }`}
                  title="Grid view"
                >
                  <Grid2x2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition ${viewMode === 'list'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-foreground/60 hover:text-foreground'
                    }`}
                  title="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Sidebar Filters - Hidden on mobile */}
          {showFilters && (
            <div className="hidden md:block md:w-56 flex-shrink-0">
              <EventFilters />
            </div>
          )}

          {/* Events Grid/List */}
          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Discover Events Nearby</h1>
              <p className="text-foreground/60 mt-1">
                Find the best gatherings, workshops, and parties happening around you.
              </p>
            </div>

            {filteredEvents.length > 0 ? (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map((event) => (
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
                ) : (
                  <div className="space-y-4">
                    {filteredEvents.map((event) => (
                      <div key={event._id} className="flex gap-4 p-4 border border-border rounded-lg hover:shadow-md transition">
                        <div className="w-48 h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          <img src={event.image || "/placeholder.svg"} alt={event.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 py-2">
                          <h3 className="font-semibold text-lg mb-1">{event.title}</h3>
                          <p className="text-sm text-foreground/60 mb-2">{event.description}</p>
                          <div className="flex items-center gap-4 text-sm text-foreground/60 mb-3">
                            <span>{event.date}</span>
                            <span>{event.location}</span>
                            <span className="text-blue-600 font-medium">{event.category}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-semibold">
                              {event.price > 0 ? `$${event.price}` : 'Free'}
                            </span>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              View Tickets
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                <div className="flex items-center justify-center gap-2 mt-12">
                  <Button variant="outline" disabled size="sm">
                    Previous
                  </Button>
                  <Button size="sm" className="bg-blue-600 text-white">
                    1
                  </Button>
                  <Button variant="outline" size="sm">
                    2
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-foreground/60">No events found. Try adjusting your filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
