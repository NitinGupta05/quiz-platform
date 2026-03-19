import { API_BASE_URL } from "../config/api";

const API_URL = `${API_BASE_URL}/user`;

export async function getPublicStats() {
  const res = await fetch(`${API_URL}/public-stats`);
  return res.json();
}
