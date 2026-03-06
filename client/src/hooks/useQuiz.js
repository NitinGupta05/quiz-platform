import { useMemo } from "react";

export function useQuiz(questions = []) {
  return useMemo(() => ({
    totalQuestions: questions.length,
  }), [questions]);
}
