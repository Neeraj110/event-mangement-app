import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface Event {
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

interface EventsState {
  allEvents: Event[];
  filteredEvents: Event[];
  selectedEvent: Event | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    category?: string;
    priceRange?: [number, number];
    date?: string;
    location?: string;
    searchQuery?: string;
  };
}

const initialState: EventsState = {
  allEvents: [],
  filteredEvents: [],
  selectedEvent: null,
  isLoading: false,
  error: null,
  filters: {},
};

export const fetchEvents = createAsyncThunk(
  "events/fetchEvents",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/events");
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }
      const data = await response.json();

      // Map backend data to frontend Event interface
      return data.events.map((e: any) => ({
        id: e._id,
        title: e.title,
        description: e.description,
        date: new Date(e.startDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        time: new Date(e.startDate).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        endTime: new Date(e.endDate).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        location: e.location.city, // Backend only has city in location object for now
        city: e.location.city,
        state: "NY", // Defaulting as backend doesn't have state yet
        category: e.category,
        price: e.price,
        image: e.coverImage,
        organizer: {
          name: e.organizerId?.name || "Unknown",
          followers: 0,
        },
        status: new Date(e.startDate) > new Date() ? "upcoming" : "past",
        capacity: e.capacity,
        coordinates: {
          lat: e.location.lat,
          lng: e.location.lng,
        },
      }));
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    selectEvent: (state, action: PayloadAction<string>) => {
      const event = state.allEvents.find((e) => e.id === action.payload);
      state.selectedEvent = event || null;
    },
    filterEvents: (
      state,
      action: PayloadAction<Partial<EventsState["filters"]>>,
    ) => {
      state.filters = { ...state.filters, ...action.payload };
      let filtered = [...state.allEvents];

      if (state.filters.category) {
        filtered = filtered.filter(
          (e) => e.category === state.filters.category,
        );
      }
      if (state.filters.searchQuery) {
        const query = state.filters.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (e) =>
            e.title.toLowerCase().includes(query) ||
            e.description.toLowerCase().includes(query) ||
            e.city.toLowerCase().includes(query),
        );
      }
      if (state.filters.priceRange) {
        filtered = filtered.filter(
          (e) =>
            e.price >= state.filters.priceRange![0] &&
            e.price <= state.filters.priceRange![1],
        );
      }

      state.filteredEvents = filtered;
    },
    clearFilters: (state) => {
      state.filters = {};
      state.filteredEvents = state.allEvents;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allEvents = action.payload;
        state.filteredEvents = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { selectEvent, filterEvents, clearFilters } = eventsSlice.actions;
export default eventsSlice.reducer;
