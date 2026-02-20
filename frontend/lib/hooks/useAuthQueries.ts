import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/apiClient";
import { useAuthStore } from "@/lib/stores/authStore";
import {
  User,
  LoginResponse,
  RegisterResponse,
  VerifyOTPResponse,
  OTPResponse,
} from "@/types";

// ─── Queries ───────────────────────────────────────────

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => apiClient<{ user: User }>("/users/profile"),
  });
}

// ─── Mutations ─────────────────────────────────────────

// Step 1: Register sends OTP (does NOT create user)
export function useRegister() {
  return useMutation({
    mutationFn: (formData: FormData) =>
      apiClient<RegisterResponse>("/users/register", {
        method: "POST",
        body: formData,
      }),
  });
}

// Step 2: Verify OTP → creates user & returns tokens
export function useVerifyOTP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { email: string; otp: string }) =>
      apiClient<VerifyOTPResponse>("/users/verify-otp", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      useAuthStore
        .getState()
        .setCredentials(data.user as unknown as User, data.accessToken);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useResendOTP() {
  return useMutation({
    mutationFn: (data: {
      email: string;
      purpose: "signup" | "forgot-password";
    }) =>
      apiClient<OTPResponse>("/users/resend-otp", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      apiClient<LoginResponse>("/users/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),
    onSuccess: (data) => {
      useAuthStore
        .getState()
        .setCredentials(data.user as unknown as User, data.accessToken);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient<{ message: string }>("/users/logout", {
        method: "POST",
      }),
    onSuccess: () => {
      useAuthStore.getState().clearCredentials();
      queryClient.clear();
    },
  });
}

export function useRefreshToken() {
  return useMutation({
    mutationFn: () =>
      apiClient<{ accessToken: string }>("/users/refresh", {
        method: "POST",
      }),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) =>
      apiClient<{ user: User }>("/users/update", {
        method: "PUT",
        body: formData,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useUpgradeToOrganizer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient<{
        message: string;
        accessToken: string;
        user: { _id: string; name: string; email: string; role: string };
      }>("/users/upgrade-role", {
        method: "PATCH",
      }),
    onSuccess: (data) => {
      useAuthStore
        .getState()
        .setCredentials(data.user as unknown as User, data.accessToken);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

// ─── Forgot Password ──────────────────────────────────

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: { email: string }) =>
      apiClient<OTPResponse>("/users/forgot-password", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: { email: string; otp: string; newPassword: string }) =>
      apiClient<OTPResponse>("/users/reset-password", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}
