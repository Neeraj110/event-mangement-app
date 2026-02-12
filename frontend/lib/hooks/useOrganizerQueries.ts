import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/apiClient";
import { Event, EventStatsResponse, CheckIn } from "@/types";

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

export function useEventStats(id: string) {
  return useQuery({
    queryKey: ["eventStats", id],
    queryFn: async () => {
      const response = await apiClient<{ event: Event; stats: any }>(
        `/organizer/events/${id}/stats`,
      );
      return {
        totalTicketsSold: response.stats.totalTicketsSold,
        totalRevenue: response.stats.revenue,
        checkInCount: response.stats.checkedInCount,
        remainingCapacity:
          response.event.capacity - response.stats.totalTicketsSold,
      } as EventStatsResponse;
    },
    enabled: !!id,
  });
}

export function useCheckInUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { ticketCode: string; eventId: string }) =>
      apiClient<CheckIn>("/checkin", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizerEvents"] });
    },
  });
}
