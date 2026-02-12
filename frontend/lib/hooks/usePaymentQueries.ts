import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/apiClient";
import { PaymentIntentResponse } from "@/types";

export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: (data: { eventId: string; quantity: number }) =>
      apiClient<PaymentIntentResponse>("/payments/create-intent", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}
