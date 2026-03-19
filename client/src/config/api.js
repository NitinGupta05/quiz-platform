const fallbackApiUrl = "http://localhost:5000/api";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL?.trim() || fallbackApiUrl;
