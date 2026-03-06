export function buildQuizFilters({ category, difficulty, search }) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (difficulty) params.set("difficulty", difficulty);
  if (search) params.set("search", search);
  return params.toString();
}
