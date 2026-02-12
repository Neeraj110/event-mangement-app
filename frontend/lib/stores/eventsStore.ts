import { create } from "zustand";

export interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  endTime: string;
  location: string;
  city: string;
  state: string;
  category: string;
  price: number;
  image: string;
  organizer: {
    name: string;
    followers: number;
    image?: string;
  };
  status: "upcoming" | "live" | "past";
  attendees?: number;
  capacity?: number;
  ticketsAvailable?: number;
  highlights?: string[];
  relatedEvents?: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
  tags?: string[];
}

interface EventsFilters {
  category?: string;
  priceRange?: [number, number];
  date?: string;
  location?: string;
  searchQuery?: string;
}

interface EventsState {
  allEvents: EventItem[];
  filteredEvents: EventItem[];
  selectedEvent: EventItem | null;
  filters: EventsFilters;
}

interface EventsActions {
  setAllEvents: (events: EventItem[]) => void;
  selectEvent: (id: string) => void;
  filterEvents: (newFilters: Partial<EventsFilters>) => void;
  clearFilters: () => void;
}

export const useEventsStore = create<EventsState & EventsActions>(
  (set, get) => ({
    allEvents: [],
    filteredEvents: [],
    selectedEvent: null,
    filters: {},

    setAllEvents: (events) =>
      set({ allEvents: events, filteredEvents: events }),

    selectEvent: (id) => {
      const event = get().allEvents.find((e) => e.id === id) || null;
      set({ selectedEvent: event });
    },

    filterEvents: (newFilters) => {
      const state = get();
      const filters = { ...state.filters, ...newFilters };
      let filtered = [...state.allEvents];

      if (filters.category) {
        filtered = filtered.filter((e) => e.category === filters.category);
      }
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (e) =>
            e.title.toLowerCase().includes(query) ||
            e.description.toLowerCase().includes(query) ||
            e.city.toLowerCase().includes(query),
        );
      }
      if (filters.priceRange) {
        filtered = filtered.filter(
          (e) =>
            e.price >= filters.priceRange![0] &&
            e.price <= filters.priceRange![1],
        );
      }

      set({ filters, filteredEvents: filtered });
    },

    clearFilters: () => {
      const state = get();
      set({ filters: {}, filteredEvents: state.allEvents });
    },
  }),
);
