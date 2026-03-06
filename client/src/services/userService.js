const API_URL = "http://localhost:5000/api/user";

export async function getPublicStats() {
  const res = await fetch(`${API_URL}/public-stats`);
  return res.json();
}
