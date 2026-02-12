import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/apiClient";
import { Event } from "@/types";

// ─── Queries ───────────────────────────────────────────

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const response = await apiClient<{ events: Event[] }>("/events");
      return response.events;
    },
  });
}

export function useEventById(id: string) {
  return useQuery({
    queryKey: ["events", id],
    queryFn: () => apiClient<Event>(`/events/${id}`),
    enabled: !!id,
  });
}

// ─── Mutations ─────────────────────────────────────────

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) =>
      apiClient<Event>("/events", {
        method: "POST",
        body: formData,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["organizerEvents"] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      apiClient<Event>(`/events/${id}`, {
        method: "PUT",
        body: formData,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["organizerEvents"] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient<{ message: string }>(`/events/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["organizerEvents"] });
    },
  });
}
