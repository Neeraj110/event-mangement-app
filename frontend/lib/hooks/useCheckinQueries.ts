import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/apiClient";
import { Ticket } from "@/types";

interface CheckInStatsResponse {
  checkedIn: number;
  totalSold: number;
  capacity: number;
  allCheckedIn: boolean;
  eventTitle: string;
}

interface CheckInLogEntry {
  _id: string;
  eventId: string;
  scannedAt: string;
  ticketId: {
    _id: string;
    ticketCode: string;
    status: string;
    userId: {
      _id: string;
      name: string;
      email: string;
    };
  };
}

interface CheckInLogsResponse {
  logs: CheckInLogEntry[];
}

interface CheckInResponse {
  message: string;
  ticket: Ticket;
}

export function useCheckinStats(eventId: string) {
  return useQuery({
    queryKey: ["checkinStats", eventId],
    queryFn: () => apiClient<CheckInStatsResponse>(`/checkin/${eventId}/stats`),
    enabled: !!eventId,
    refetchInterval: 15000, // Auto-refresh every 15 seconds
  });
}

export function useCheckinLogs(eventId: string) {
  return useQuery({
    queryKey: ["checkinLogs", eventId],
    queryFn: async () => {
      const res = await apiClient<CheckInLogsResponse>(
        `/checkin/${eventId}/logs`,
      );
      return res.logs;
    },
    enabled: !!eventId,
    refetchInterval: 10000, // Auto-refresh every 10 seconds
  });
}

export function useCheckinMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { ticketCode: string; eventId: string }) =>
      apiClient<CheckInResponse>("/checkin", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (_data, variables) => {
      // Invalidate stats and logs after a successful check-in
      queryClient.invalidateQueries({
        queryKey: ["checkinStats", variables.eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["checkinLogs", variables.eventId],
      });
    },
  });
}

export type { CheckInStatsResponse, CheckInLogEntry };
