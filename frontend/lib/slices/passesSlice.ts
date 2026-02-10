import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Pass {
  id: string;
  name: string;
  type: 'seasonal' | 'annual' | 'limited';
  status: 'active' | 'upcoming' | 'expired';
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


const initialState: PassesState = {
  activePasses: [],
  upcomingPasses: [],
  expiredPasses: [],
  isLoading: false,
};

const passesSlice = createSlice({
  name: "passes",
  initialState,
  reducers: {
    addPass: (state, action: PayloadAction<Pass>) => {
      if (action.payload.status === 'active') {
        state.activePasses.push(action.payload);
      } else if (action.payload.status === 'upcoming') {
        state.upcomingPasses.push(action.payload);
      } else if (action.payload.status === 'expired') {
        state.expiredPasses.push(action.payload);
      }
    },
    updatePassStatus: (state, action: PayloadAction<{ passId: string; status: Pass['status'] }>) => {
      const { passId, status } = action.payload;
      const pass = [
        ...state.activePasses,
        ...state.upcomingPasses,
        ...state.expiredPasses,
      ].find((p) => p.id === passId);

      if (pass) {
        pass.status = status;
        // Move pass to appropriate array
        state.activePasses = state.activePasses.filter((p) => p.id !== passId);
        state.upcomingPasses = state.upcomingPasses.filter((p) => p.id !== passId);
        state.expiredPasses = state.expiredPasses.filter((p) => p.id !== passId);

        if (status === 'active') {
          state.activePasses.push(pass);
        } else if (status === 'upcoming') {
          state.upcomingPasses.push(pass);
        } else {
          state.expiredPasses.push(pass);
        }
      }
    },
  },
});

export const { addPass, updatePassStatus } = passesSlice.actions;
export default passesSlice.reducer;
