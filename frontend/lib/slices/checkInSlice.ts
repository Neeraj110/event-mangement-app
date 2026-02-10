import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type CheckInStatus = 'success' | 'duplicate' | 'invalid' | 'denied';

export interface CheckInRecord {
  id: string;
  attendeeName: string;
  ticketType: string;
  timestamp: string;
  status: CheckInStatus;
  icon?: string;
  badge?: string;
}

interface CheckInState {
  logs: CheckInRecord[];
  totalCheckedIn: number;
  totalExpected: number;
  eventCapacity: number;
  eventCapacityPercentage: number;
  remainingSpots: number;
  isScanning: boolean;
  lastScannedQR?: string;
}

const mockCheckInLogs: CheckInRecord[] = [
  {
    id: 'checkin-001',
    attendeeName: 'Alex Thompson',
    ticketType: 'VIP Full Access',
    timestamp: '12:44:31 PM',
    status: 'success',
    icon: 'check-circle',
    badge: 'SUCCESS',
  },
  {
    id: 'checkin-002',
    attendeeName: 'Sarah Jenkins',
    ticketType: 'General Admission',
    timestamp: '12:42:15 PM',
    status: 'duplicate',
    icon: 'alert-circle',
    badge: 'DUPLICATE',
  },
  {
    id: 'checkin-003',
    attendeeName: 'Michael Chen',
    ticketType: 'Speaker Pass',
    timestamp: '12:40:02 PM',
    status: 'success',
    icon: 'check-circle',
    badge: 'SUCCESS',
  },
  {
    id: 'checkin-004',
    attendeeName: 'Invalid QR Code',
    ticketType: 'Unknown Source',
    timestamp: '12:38:55 PM',
    status: 'invalid',
    icon: 'x-circle',
    badge: 'DENIED',
  },
  {
    id: 'checkin-005',
    attendeeName: 'Jessica Williams',
    ticketType: 'Exhibitor',
    timestamp: '12:35:10 PM',
    status: 'success',
    icon: 'check-circle',
    badge: 'SUCCESS',
  },
  {
    id: 'checkin-006',
    attendeeName: 'David Miller',
    ticketType: 'General Admission',
    timestamp: '12:32:44 PM',
    status: 'success',
    icon: 'check-circle',
    badge: 'SUCCESS',
  },
];

const initialState: CheckInState = {
  logs: mockCheckInLogs,
  totalCheckedIn: 450,
  totalExpected: 1200,
  eventCapacity: 1200,
  eventCapacityPercentage: 37.5,
  remainingSpots: 750,
  isScanning: false,
};

const checkInSlice = createSlice({
  name: 'checkIn',
  initialState,
  reducers: {
    addCheckInRecord: (state, action: PayloadAction<CheckInRecord>) => {
      state.logs.unshift(action.payload);
      if (action.payload.status === 'success') {
        state.totalCheckedIn += 1;
        state.eventCapacityPercentage = (state.totalCheckedIn / state.eventCapacity) * 100;
        state.remainingSpots = state.eventCapacity - state.totalCheckedIn;
      }
    },
    setScanning: (state, action: PayloadAction<boolean>) => {
      state.isScanning = action.payload;
    },
    setLastScannedQR: (state, action: PayloadAction<string>) => {
      state.lastScannedQR = action.payload;
    },
    updateMetrics: (
      state,
      action: PayloadAction<{
        totalCheckedIn?: number;
        totalExpected?: number;
        eventCapacity?: number;
      }>,
    ) => {
      if (action.payload.totalCheckedIn !== undefined) {
        state.totalCheckedIn = action.payload.totalCheckedIn;
      }
      if (action.payload.totalExpected !== undefined) {
        state.totalExpected = action.payload.totalExpected;
      }
      if (action.payload.eventCapacity !== undefined) {
        state.eventCapacity = action.payload.eventCapacity;
      }
      state.eventCapacityPercentage =
        (state.totalCheckedIn / state.eventCapacity) * 100;
      state.remainingSpots = state.eventCapacity - state.totalCheckedIn;
    },
  },
});

export const { addCheckInRecord, setScanning, setLastScannedQR, updateMetrics } =
  checkInSlice.actions;
export default checkInSlice.reducer;
