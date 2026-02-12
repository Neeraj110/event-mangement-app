import { create } from "zustand";

export type CheckInStatus = "success" | "duplicate" | "invalid" | "denied";

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

interface CheckInActions {
  addCheckInRecord: (record: CheckInRecord) => void;
  setScanning: (scanning: boolean) => void;
  setLastScannedQR: (qr: string) => void;
  updateMetrics: (metrics: {
    totalCheckedIn?: number;
    totalExpected?: number;
    eventCapacity?: number;
  }) => void;
}



export const useCheckInStore = create<CheckInState & CheckInActions>(
  (set, get) => ({
    logs: [],
    totalCheckedIn: 450,
    totalExpected: 1200,
    eventCapacity: 1200,
    eventCapacityPercentage: 37.5,
    remainingSpots: 750,
    isScanning: false,

    addCheckInRecord: (record) =>
      set((state) => {
        const newLogs = [record, ...state.logs];
        if (record.status === "success") {
          const newCheckedIn = state.totalCheckedIn + 1;
          return {
            logs: newLogs,
            totalCheckedIn: newCheckedIn,
            eventCapacityPercentage: (newCheckedIn / state.eventCapacity) * 100,
            remainingSpots: state.eventCapacity - newCheckedIn,
          };
        }
        return { logs: newLogs };
      }),

    setScanning: (isScanning) => set({ isScanning }),

    setLastScannedQR: (lastScannedQR) => set({ lastScannedQR }),

    updateMetrics: (metrics) =>
      set((state) => {
        const totalCheckedIn = metrics.totalCheckedIn ?? state.totalCheckedIn;
        const totalExpected = metrics.totalExpected ?? state.totalExpected;
        const eventCapacity = metrics.eventCapacity ?? state.eventCapacity;
        return {
          totalCheckedIn,
          totalExpected,
          eventCapacity,
          eventCapacityPercentage: (totalCheckedIn / eventCapacity) * 100,
          remainingSpots: eventCapacity - totalCheckedIn,
        };
      }),
  }),
);
