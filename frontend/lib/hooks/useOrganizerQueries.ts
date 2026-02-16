import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/apiClient";
import { Event } from "@/types";

export function useOrganizerEvents() {
  return useQuery({
    queryKey: ["organizerEvents"],
    queryFn: async () => {
      const response = await apiClient<{ events: Event[] }>(
        "/organizer/events",
      );
      return response.events;
    },
  });
}

export function useOrganizerEventStats(eventId: string) {
  return useQuery({
    queryKey: ["organizerEventStats", eventId],
    queryFn: async () => {
      const response = await apiClient<{
        event: Event;
        stats: {
          totalTicketsSold: number;
          revenue: number;
          checkedInCount: number;
        };
      }>(`/organizer/events/${eventId}/stats`);
      return response;
    },
    enabled: !!eventId,
  });
}
