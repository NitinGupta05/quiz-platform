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
