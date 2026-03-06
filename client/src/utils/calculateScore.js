export function calculateScore(correctAnswers = 0, totalQuestions = 0) {
  if (!totalQuestions) return 0;
  return Math.round((correctAnswers / totalQuestions) * 100);
}
