import { apiRequest } from "./apiClient";

export function getPublicStats() {
  return apiRequest("/user/public-stats");
}

export function getProgress() {
  return apiRequest("/user/progress", { authenticated: true });
}

export function getHistory(limit = 20) {
  return apiRequest(`/user/history?limit=${limit}`, { authenticated: true });
}

export function getCurrentUserProfile() {
  return apiRequest("/auth/me", { authenticated: true });
}

export function updateCurrentUserProfile(payload) {
  return apiRequest("/auth/profile", {
    method: "PUT",
    authenticated: true,
    body: payload,
  });
}
