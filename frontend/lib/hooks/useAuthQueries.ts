import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/apiClient";
import { useAuthStore } from "@/lib/stores/authStore";
import { User, LoginResponse, RegisterResponse } from "@/types";

// ─── Queries ───────────────────────────────────────────

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => apiClient<{ user: User }>("/users/profile"),
  });
}

// ─── Mutations ─────────────────────────────────────────

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) =>
      apiClient<RegisterResponse>("/users/register", {
        method: "POST",
        body: formData,
      }),
    onSuccess: (data) => {
      useAuthStore
        .getState()
        .setCredentials(data.user as unknown as User, data.accessToken);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
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
