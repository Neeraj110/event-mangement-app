import { create } from "zustand";

export interface DashboardMetrics {
  totalRevenue: number;
  revenueChange: number;
  ticketsSold: number;
  ticketsChange: number;
  activeCheckIns: number;
  checkInsChange: number;
  totalExpected: number;
  eventCapacity: number;
  eventCapacityPercentage: number;
  remainingSpots: number;
}

export interface DashboardEvent {
  id: string;
  name: string;
  date: string;
  status: "upcoming" | "live" | "completed";
  expectedAttendees: number;
  checkedIn: number;
  capacity: number;
}

export interface SalesData {
  timestamp: string;
  tickets: number;
}

interface DashboardState {
  metrics: DashboardMetrics;
  events: DashboardEvent[];
  salesData: SalesData[];
  selectedEvent: DashboardEvent | null;
  isLoading: boolean;
}

interface DashboardActions {
  updateMetrics: (metrics: Partial<DashboardMetrics>) => void;
  setSelectedEvent: (id: string) => void;
  updateSalesData: (data: SalesData[]) => void;
}



export const useDashboardStore = create<DashboardState & DashboardActions>(
  (set, get) => ({
    metrics: {
      totalRevenue: 0,
      revenueChange: 0,
      ticketsSold: 0,
      ticketsChange: 0,
      activeCheckIns: 0,
      checkInsChange: 0,
      totalExpected: 0,
      eventCapacity: 0,
      eventCapacityPercentage: 0,
      remainingSpots: 0,
    },
    events:   [],
    salesData: [],
    selectedEvent: null,
    isLoading: false,

    updateMetrics: (updates) =>
      set((state) => ({
        metrics: { ...state.metrics, ...updates },
      })),

    setSelectedEvent: (id) => {
      const event = get().events.find((e) => e.id === id) || null;
      set({ selectedEvent: event });
    },

    updateSalesData: (salesData) => set({ salesData }),
  }),
);
