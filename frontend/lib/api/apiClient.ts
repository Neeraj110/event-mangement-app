const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

// ─── Token Refresh Mutex ──────────────────────────────────
// Prevents multiple concurrent refresh calls when several
// requests fail with 401 at the same time.
let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

function processQueue(error: any, token: string | null) {
  refreshQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve(token!);
    }
  });
  refreshQueue = [];
}

async function refreshAccessToken(): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/users/refresh`, {
    method: "POST",
    credentials: "include", // sends the httpOnly refresh cookie
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Refresh failed");
  }

  const data = await response.json();
  return data.accessToken;
}

// ─── Endpoints that should never trigger a refresh ────────
const AUTH_ENDPOINTS = [
  "/users/login",
  "/users/register",
  "/users/refresh",
  "/users/logout",
  "/users/verify-otp",
  "/users/resend-otp",
  "/users/forgot-password",
  "/users/reset-password",
  "/admin/register",
  "/admin/check-exists",
];

export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { skipAuth = false, headers: customHeaders, ...restOptions } = options;

  const headers = new Headers(customHeaders);

  // Dynamically import auth store to avoid circular deps
  const { useAuthStore } = await import("@/lib/stores/authStore");

  if (!skipAuth) {
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

  // ─── Auto-refresh on 401 ─────────────────────────────
  if (
    response.status === 401 &&
    !skipAuth &&
    !AUTH_ENDPOINTS.includes(endpoint)
  ) {
    // If a refresh is already in progress, queue this request
    if (isRefreshing) {
      return new Promise<T>((resolve, reject) => {
        refreshQueue.push({
          resolve: (newToken: string) => {
            headers.set("Authorization", `Bearer ${newToken}`);
            fetch(`${API_BASE_URL}${endpoint}`, {
              ...restOptions,
              headers,
              credentials: "include",
            })
              .then((r) => {
                if (!r.ok) {
                  return r
                    .json()
                    .catch(() => ({}))
                    .then((d) => {
                      throw {
                        status: r.status,
                        data: d,
                        message:
                          d.message || `Request failed with status ${r.status}`,
                      };
                    });
                }
                return r.json();
              })
              .then(resolve)
              .catch(reject);
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      const newToken = await refreshAccessToken();

      // Update the auth store with the new token
      const state = useAuthStore.getState();
      if (state.user) {
        useAuthStore.getState().setCredentials(state.user, newToken);
      }

      processQueue(null, newToken);

      // Retry the original request with the new token
      headers.set("Authorization", `Bearer ${newToken}`);
      const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...restOptions,
        headers,
        credentials: "include",
      });

      if (!retryResponse.ok) {
        const errorData = await retryResponse.json().catch(() => ({}));
        throw {
          status: retryResponse.status,
          data: errorData,
          message:
            errorData.message ||
            `Request failed with status ${retryResponse.status}`,
        };
      }

      return retryResponse.json();
    } catch (refreshError) {
      processQueue(refreshError, null);

      // Refresh failed — clear credentials and let the error propagate
      useAuthStore.getState().clearCredentials();
      throw {
        status: 401,
        data: {},
        message: "Session expired. Please log in again.",
      };
    } finally {
      isRefreshing = false;
    }
  }

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
