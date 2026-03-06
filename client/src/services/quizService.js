const API_URL = "http://localhost:5000/api/quizzes";

export async function getQuizzes(query = "") {
  const res = await fetch(`${API_URL}${query ? `?${query}` : ""}`);
  return res.json();
}

export async function getQuizById(id) {
  const res = await fetch(`${API_URL}/${id}`);
  return res.json();
}
