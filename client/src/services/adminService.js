import { apiRequest } from "./apiClient";

export function getAdminAnalytics(windowDays = 7) {
  return apiRequest(`/user/admin/analytics?window=${windowDays}`, { authenticated: true });
}

export function getAdminUsers({ page = 1, limit = 10, search = "" } = {}) {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    search,
  });

  return apiRequest(`/user/admin/users?${query.toString()}`, { authenticated: true });
}

export function toggleAdminUserBlock(userId) {
  return apiRequest(`/auth/admin/users/${userId}/block`, {
    method: "PUT",
    authenticated: true,
  });
}
