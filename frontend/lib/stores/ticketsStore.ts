import { create } from "zustand";

export interface Ticket {
  _id: string;
  eventId: string;
  eventTitle: string;
  eventImage: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  status: "confirmed" | "payment_processing" | "attended" | "expired";
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

interface TicketsActions {
  addTicket: (ticket: Ticket) => void;
  updateTicketStatus: (ticketId: string, status: Ticket["status"]) => void;
}

export const useTicketsStore = create<TicketsState & TicketsActions>(
  (set, get) => ({
    upcoming: [],
    past: [],
    isLoading: false,

    addTicket: (ticket) =>
      set((state) => {
        if (
          ticket.status === "confirmed" ||
          ticket.status === "payment_processing"
        ) {
          return { upcoming: [...state.upcoming, ticket] };
        }
        return { past: [...state.past, ticket] };
      }),

    updateTicketStatus: (ticketId, status) =>
      set((state) => {
        const allTickets = [...state.upcoming, ...state.past];
        const ticket = allTickets.find((t) => t._id === ticketId);
        if (!ticket) return state;

        const updated = { ...ticket, status };
        const upcoming = allTickets.filter((t) => t._id !== ticketId);
        const past = allTickets.filter((t) => t._id !== ticketId);

        if (status === "confirmed" || status === "payment_processing") {
          return {
            upcoming: [
              ...state.upcoming.filter((t) => t._id !== ticketId),
              updated,
            ],
            past: state.past.filter((t) => t._id !== ticketId),
          };
        }
        return {
          upcoming: state.upcoming.filter((t) => t._id !== ticketId),
          past: [...state.past.filter((t) => t._id !== ticketId), updated],
        };
      }),
  }),
);
