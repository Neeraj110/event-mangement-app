import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/apiClient";
import { User, Event, PaymentTransaction, Payout } from "@/types";

export function useAllUsers() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => apiClient<User[]>("/admin/users"),
  });
}

export function useAllEventsAdmin() {
  return useQuery({
    queryKey: ["admin", "events"],
    queryFn: () => apiClient<Event[]>("/admin/events"),
  });
}

export function useDeleteEventAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient<{ message: string }>(`/admin/events/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "events"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useAllPayments() {
  return useQuery({
    queryKey: ["admin", "payments"],
    queryFn: () => apiClient<PaymentTransaction[]>("/admin/payments"),
  });
}

export function useApprovePayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { organizerId: string; amount: number }) =>
      apiClient<Payout>("/admin/payouts", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}

export function useToggleEventPublish() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient<{ message: string; event: Event }>(
        `/admin/events/${id}/publish`,
        {
          method: "PATCH",
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "events"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
