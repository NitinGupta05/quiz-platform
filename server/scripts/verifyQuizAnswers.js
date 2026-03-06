import dotenv from "dotenv";
import mongoose from "mongoose";
import Quiz from "../models/Quiz.js";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/quizdb";

async function verifyQuizAnswers() {
  await mongoose.connect(MONGO_URI);

  const quizzes = await Quiz.find({}, "title questions");
  const issues = [];

  quizzes.forEach((quiz) => {
    quiz.questions.forEach((question, index) => {
      const correct = question.correctAnswer;
      const optionsCount = question.options?.length || 0;

      if (Number.isInteger(correct)) {
        if (correct < 0 || correct >= optionsCount) {
          issues.push(
            `${quiz.title} Q${index + 1}: correctAnswer (${correct}) out of range for ${optionsCount} options`
          );
        }
        return;
      }

      if (typeof correct === "string") {
        const trimmed = correct.trim();

        if (/^\d+$/.test(trimmed)) {
          const numeric = parseInt(trimmed, 10);
          if (numeric < 0 || numeric >= optionsCount) {
            issues.push(
              `${quiz.title} Q${index + 1}: correctAnswer numeric string (${trimmed}) out of range`
            );
          }
          return;
        }

        if (/^[A-Za-z]$/.test(trimmed)) {
          const optionIndex = trimmed.toUpperCase().charCodeAt(0) - 65;
          if (optionIndex < 0 || optionIndex >= optionsCount) {
            issues.push(
              `${quiz.title} Q${index + 1}: correctAnswer letter (${trimmed}) out of range`
            );
          }
          return;
        }

        const hasMatchingOption = question.options.some(
          (opt) => String(opt).trim().toLowerCase() === trimmed.toLowerCase()
        );
        if (!hasMatchingOption) {
          issues.push(
            `${quiz.title} Q${index + 1}: correctAnswer text does not match any option`
          );
        }
        return;
      }

      issues.push(`${quiz.title} Q${index + 1}: correctAnswer type is unsupported`);
    });
  });

  if (issues.length === 0) {
    console.log(`Verified ${quizzes.length} quizzes: no answer mapping issues found.`);
  } else {
    console.log(`Found ${issues.length} issue(s):`);
    issues.forEach((issue) => console.log(`- ${issue}`));
    process.exitCode = 1;
  }

  await mongoose.disconnect();
}

verifyQuizAnswers().catch(async (error) => {
  console.error("Failed to verify quiz answers:", error);
  await mongoose.disconnect();
  process.exit(1);
});
