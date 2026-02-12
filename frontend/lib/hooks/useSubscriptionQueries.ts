import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/apiClient";
import { Subscription } from "@/types";

export function useCreateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { plan: "free" | "pro" }) =>
      apiClient<Subscription>("/subscriptions/create", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
  });
}

export function useSubscriptionStatus() {
  return useQuery({
    queryKey: ["subscription"],
    queryFn: () => apiClient<Subscription>("/subscriptions/me"),
  });
}
