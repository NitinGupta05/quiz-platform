import { API_BASE_URL } from "../config/api";

const API_URL = `${API_BASE_URL}/quizzes`;

export async function getQuizzes(query = "") {
  const res = await fetch(`${API_URL}${query ? `?${query}` : ""}`);
  return res.json();
}

export async function getQuizById(id) {
  const res = await fetch(`${API_URL}/${id}`);
  return res.json();
}
