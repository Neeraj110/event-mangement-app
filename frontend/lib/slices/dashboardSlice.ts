import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
  status: 'upcoming' | 'live' | 'completed';
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

const mockSalesData: SalesData[] = [
  { timestamp: '12 AM', tickets: 45 },
  { timestamp: '4 AM', tickets: 82 },
  { timestamp: '8 AM', tickets: 120 },
  { timestamp: '12 PM', tickets: 95 },
  { timestamp: '4 PM', tickets: 167 },
  { timestamp: '8 PM', tickets: 254 },
];

const mockEvents: DashboardEvent[] = [
  {
    id: 'event-dash-001',
    name: 'Tech Summit 2024 - Platinum Pass',
    date: 'Oct 12, 2023',
    status: 'completed',
    expectedAttendees: 500,
    checkedIn: 480,
    capacity: 500,
  },
  {
    id: 'event-dash-002',
    name: 'Summer Music Festival',
    date: 'Sep 28, 2023',
    status: 'completed',
    expectedAttendees: 1200,
    checkedIn: 1150,
    capacity: 1500,
  },
];

const initialState: DashboardState = {
  metrics: {
    totalRevenue: 12450,
    revenueChange: 8,
    ticketsSold: 342,
    ticketsChange: 15,
    activeCheckIns: 120,
    checkInsChange: 0,
    totalExpected: 1200,
    eventCapacity: 450,
    eventCapacityPercentage: 37.5,
    remainingSpots: 750,
  },
  events: mockEvents,
  salesData: mockSalesData,
  selectedEvent: mockEvents[0],
  isLoading: false,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    updateMetrics: (state, action: PayloadAction<Partial<DashboardMetrics>>) => {
      state.metrics = { ...state.metrics, ...action.payload };
    },
    setSelectedEvent: (state, action: PayloadAction<string>) => {
      const event = state.events.find((e) => e.id === action.payload);
      state.selectedEvent = event || null;
    },
    updateSalesData: (state, action: PayloadAction<SalesData[]>) => {
      state.salesData = action.payload;
    },
  },
});

export const { updateMetrics, setSelectedEvent, updateSalesData } = dashboardSlice.actions;
export default dashboardSlice.reducer;
