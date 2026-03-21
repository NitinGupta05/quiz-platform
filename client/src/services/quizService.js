import { apiRequest } from "./apiClient";

export function getQuizzes(query = "") {
  return apiRequest(`/quizzes${query ? `?${query}` : ""}`);
}

export function getQuizById(id) {
  return apiRequest(`/quizzes/${id}`);
}

export function getQuizCategories() {
  return apiRequest("/quizzes/categories");
}

export function getLeaderboard(quizId = "", limit = 10) {
  const path = quizId
    ? `/quizzes/leaderboard/${quizId}?limit=${limit}`
    : `/quizzes/leaderboard?limit=${limit}`;

  return apiRequest(path);
}
