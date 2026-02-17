import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/apiClient";
import { OrderResponse, VerifyPaymentResponse } from "@/types";

export function useCreateOrder() {
  return useMutation({
    mutationFn: (data: { eventId: string; quantity: number }) =>
      apiClient<OrderResponse>("/payments/create-order", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}

export function useVerifyPayment() {
  return useMutation({
    mutationFn: (data: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      eventId: string;
      quantity: number;
    }) =>
      apiClient<VerifyPaymentResponse>("/payments/verify", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}
