import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/apiClient";
import { Ticket } from "@/types";

export function useUserTickets() {
  return useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      const response = await apiClient<{ tickets: Ticket[] }>("/tickets/me");
      return response.tickets;
    },
  });
}

export function useTicketById(id: string) {
  return useQuery({
    queryKey: ["tickets", id],
    queryFn: () => apiClient<Ticket>(`/tickets/${id}`),
    enabled: !!id,
  });
}
