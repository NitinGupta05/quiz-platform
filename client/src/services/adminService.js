import { apiRequest } from "./apiClient";

export function getAdminAnalytics() {
  return apiRequest("/user/admin/analytics", { authenticated: true });
}
