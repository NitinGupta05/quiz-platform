import { apiRequest } from "./apiClient";

export function getQuizzes(query = "") {
  return apiRequest(`/quizzes${query ? `?${query}` : ""}`);
}

export function getQuizById(id) {
  return apiRequest(`/quizzes/${id}`);
}
