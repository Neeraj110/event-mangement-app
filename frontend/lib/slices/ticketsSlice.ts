import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Ticket {
  id: string;
  eventId: string;
  eventTitle: string;
  eventImage: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  status: 'confirmed' | 'payment_processing' | 'attended' | 'expired';
  qrCode: string;
  ticketNumber: string;
  purchaseDate: string;
  confirmationStatus: string;
}

interface TicketsState {
  upcoming: Ticket[];
  past: Ticket[];
  isLoading: boolean;
}



const initialState: TicketsState = {
  upcoming: [],
  past: [],
  isLoading: false,
};

const ticketsSlice = createSlice({
  name: "tickets",
  initialState,
  reducers: {
    addTicket: (state, action: PayloadAction<Ticket>) => {
      if (action.payload.status === 'confirmed' || action.payload.status === 'payment_processing') {
        state.upcoming.push(action.payload);
      } else {
        state.past.push(action.payload);
      }
    },
    updateTicketStatus: (
      state,
      action: PayloadAction<{ ticketId: string; status: Ticket['status'] }>,
    ) => {
      const { ticketId, status } = action.payload;
      const ticket = [...state.upcoming, ...state.past].find((t) => t.id === ticketId);

      if (ticket) {
        ticket.status = status;
        // Move ticket to appropriate array
        state.upcoming = state.upcoming.filter((t) => t.id !== ticketId);
        state.past = state.past.filter((t) => t.id !== ticketId);

        if (status === 'confirmed' || status === 'payment_processing') {
          state.upcoming.push(ticket);
        } else {
          state.past.push(ticket);
        }
      }
    },
  },
});

export const { addTicket, updateTicketStatus } = ticketsSlice.actions;
export default ticketsSlice.reducer;
