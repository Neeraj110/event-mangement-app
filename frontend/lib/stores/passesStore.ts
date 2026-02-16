import { create } from "zustand";

export interface Pass {
  _id: string;
  name: string;
  type: "seasonal" | "annual" | "limited";
  status: "active" | "upcoming" | "expired";
  eventId: string;
  eventTitle: string;
  eventImage: string;
  durationPercentage: number;
  validUntil: string;
  memberId: string;
  features: string[];
  icon?: string;
  benefits?: string;
  renewalDate?: string;
  eventsIncluded?: number;
}

interface PassesState {
  activePasses: Pass[];
  upcomingPasses: Pass[];
  expiredPasses: Pass[];
  isLoading: boolean;
}

interface PassesActions {
  addPass: (pass: Pass) => void;
  updatePassStatus: (passId: string, status: Pass["status"]) => void;
}

export const usePassesStore = create<PassesState & PassesActions>(
  (set, get) => ({
    activePasses: [],
    upcomingPasses: [],
    expiredPasses: [],
    isLoading: false,

    addPass: (pass) =>
      set((state) => {
        if (pass.status === "active")
          return { activePasses: [...state.activePasses, pass] };
        if (pass.status === "upcoming")
          return { upcomingPasses: [...state.upcomingPasses, pass] };
        return { expiredPasses: [...state.expiredPasses, pass] };
      }),

    updatePassStatus: (passId, status) =>
      set((state) => {
        const allPasses = [
          ...state.activePasses,
          ...state.upcomingPasses,
          ...state.expiredPasses,
        ];
        const pass = allPasses.find((p) => p._id === passId);
        if (!pass) return state;

        const updated = { ...pass, status };
        const active = state.activePasses.filter((p) => p._id !== passId);
        const upcoming = state.upcomingPasses.filter((p) => p._id !== passId);
        const expired = state.expiredPasses.filter((p) => p._id !== passId);

        if (status === "active")
          return {
            activePasses: [...active, updated],
            upcomingPasses: upcoming,
            expiredPasses: expired,
          };
        if (status === "upcoming")
          return {
            activePasses: active,
            upcomingPasses: [...upcoming, updated],
            expiredPasses: expired,
          };
        return {
          activePasses: active,
          upcomingPasses: upcoming,
          expiredPasses: [...expired, updated],
        };
      }),
  }),
);
