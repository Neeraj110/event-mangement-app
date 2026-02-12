const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { skipAuth = false, headers: customHeaders, ...restOptions } = options;

  const headers = new Headers(customHeaders);

  // Dynamically import auth store to avoid circular deps
  if (!skipAuth) {
    const { useAuthStore } = await import("@/lib/stores/authStore");
    const token = useAuthStore.getState().accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!(restOptions.body instanceof FormData)) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...restOptions,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw {
      status: response.status,
      data: errorData,
      message:
        errorData.message || `Request failed with status ${response.status}`,
    };
  }

  return response.json();
}
