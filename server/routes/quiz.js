import express from "express";
import mongoose from "mongoose";
import Quiz from "../models/Quiz.js";
import Result from "../models/Result.js";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = express.Router();

function normalizeAnswerToIndex(value, options = []) {
  if (typeof value === "number" && Number.isInteger(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    // Numeric index string
    if (/^\d+$/.test(trimmed)) {
      return parseInt(trimmed, 10);
    }

    // Option letter (A, B, C...)
    if (/^[A-Za-z]$/.test(trimmed)) {
      return trimmed.toUpperCase().charCodeAt(0) - 65;
    }

    // Option text
    const optionIndex = options.findIndex(
      (option) => String(option).trim().toLowerCase() === trimmed.toLowerCase()
    );
    return optionIndex >= 0 ? optionIndex : null;
  }

  return null;
}

// GET ALL QUIZZES (Public - without questions for security)
router.get("/", async (req, res) => {
  try {
    const { category, difficulty, search, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const quizzes = await Quiz.find(query, "title description category difficulty timeLimit totalAttempts")
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Quiz.countDocuments(query);

    res.json({
      quizzes,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Get quizzes error:", error);
    res.status(500).json({ message: "Failed to fetch quizzes" });
  }
});

// GET QUIZ FOR EXAM (Protected - includes questions)
router.get("/:id/exam", auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    res.json(quiz);
  } catch (error) {
    console.error("Get exam quiz error:", error);
    res.status(500).json({ message: "Error fetching quiz" });
  }
});

// GET SINGLE QUIZ (Public - without answers)
router.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next();
    }

    const quiz = await Quiz.findById(req.params.id).select("-questions.correctAnswer");
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    res.json(quiz);
  } catch (error) {
    console.error("Get quiz error:", error);
    res.status(500).json({ message: "Error fetching quiz" });
  }
});

// CREATE QUIZ (Admin only)
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const quiz = new Quiz(req.body);
    await quiz.save();

    res.status(201).json({ message: "Quiz created successfully", quiz });
  } catch (error) {
    console.error("Create quiz error:", error);
    res.status(500).json({ message: "Failed to create quiz" });
  }
});

// UPDATE QUIZ (Admin only)
router.put("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.json({ message: "Quiz updated successfully", quiz });
  } catch (error) {
    console.error("Update quiz error:", error);
    res.status(500).json({ message: "Failed to update quiz" });
  }
});

// DELETE QUIZ (Admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Delete all related results
    await Result.deleteMany({ quiz: req.params.id });

    res.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error("Delete quiz error:", error);
    res.status(500).json({ message: "Failed to delete quiz" });
  }
});

// GET ALL QUIZZES FOR ADMIN (With questions)
router.get("/admin/all", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const quizzes = await Quiz.find().sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error) {
    console.error("Get admin quizzes error:", error);
    res.status(500).json({ message: "Failed to fetch quizzes" });
  }
});

// SUBMIT QUIZ (Protected)
router.post("/submit", auth, async (req, res) => {
  try {
    const { quizId, answers, timeTaken, isTabSwitched } = req.body;

    // Find quiz
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Normalize answers to option index so text-based payloads are still graded correctly.
    const normalizedAnswers = Array.isArray(answers)
      ? answers.map((value, index) => normalizeAnswerToIndex(value, quiz.questions[index]?.options || []))
      : [];

    // Calculate score
    let score = 0;
    const questionResults = quiz.questions.map((q, i) => {
      const selectedAnswer = normalizedAnswers[i];
      const correctAnswerIndex = normalizeAnswerToIndex(q.correctAnswer, q.options);
      const isCorrect = selectedAnswer === correctAnswerIndex;
      if (isCorrect) score++;

      return {
        question: q.question,
        options: q.options,
        selectedAnswer,
        correctAnswer: correctAnswerIndex,
        isCorrect,
      };
    });

    const totalQuestions = quiz.questions.length;
    const correctAnswers = score;
    const wrongAnswers = totalQuestions - score;
    const accuracy = Math.round((score / totalQuestions) * 100);

    // Save result
    const result = new Result({
      user: req.user.id,
      quiz: quizId,
      answers: normalizedAnswers,
      score,
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      accuracy,
      timeTaken,
      isTabSwitched: isTabSwitched || false,
    });

    await result.save();

    // Update quiz attempts
    await Quiz.findByIdAndUpdate(quizId, { $inc: { totalAttempts: 1 } });

    // Update user stats
    await User.findByIdAndUpdate(req.user.id, {
      $inc: {
        "stats.totalAttempts": 1,
        "stats.totalCorrect": correctAnswers,
        "stats.totalQuestions": totalQuestions,
      },
    });

    res.json({
      result: {
        _id: result._id,
        score,
        totalQuestions,
        correctAnswers,
        wrongAnswers,
        accuracy,
        timeTaken,
      },
      questions: questionResults,
    });
  } catch (error) {
    console.error("Submit quiz error:", error);
    res.status(500).json({ message: "Failed to submit quiz" });
  }
});

// GET RESULT DETAILS
router.get("/results/:id", auth, async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate("quiz")
      .populate("user", "name email");

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    // Only allow user who took the quiz or admin to view
    if (result.user._id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(result);
  } catch (error) {
    console.error("Get result error:", error);
    res.status(500).json({ message: "Failed to fetch result" });
  }
});

// GET LEADERBOARD
router.get("/leaderboard/:id", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const parsedLimit = Math.min(parseInt(limit, 10) || 10, 10);

    const results = await Result.find({ quiz: req.params.id })
      .sort({ score: -1, timeTaken: 1 })
      .skip((page - 1) * parsedLimit)
      .limit(parsedLimit)
      .populate("user", "name image")
      .populate("quiz", "title");

    const total = await Result.countDocuments({ quiz: req.params.id });

    const leaderboard = results.map((r, index) => ({
      rank: (parseInt(page) - 1) * parsedLimit + index + 1,
      userName: r.user?.name || "Anonymous",
      userImage: r.user?.image,
      score: r.score,
      total: r.totalQuestions,
      accuracy: r.accuracy,
      timeTaken: r.timeTaken,
      attemptedAt: r.createdAt,
      quizName: r.quiz?.title,
    }));

    res.json({
      leaderboard,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / parsedLimit),
        total,
      },
    });
  } catch (error) {
    console.error("Get leaderboard error:", error);
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
});

// GET GLOBAL LEADERBOARD
router.get("/leaderboard", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const parsedLimit = Math.min(parseInt(limit, 10) || 10, 10);

    const results = await Result.find()
      .sort({ score: -1, createdAt: -1 })
      .skip((page - 1) * parsedLimit)
      .limit(parsedLimit)
      .populate("user", "name image")
      .populate("quiz", "title");

    const total = await Result.countDocuments();

    const leaderboard = results.map((r, index) => ({
      rank: (parseInt(page) - 1) * parsedLimit + index + 1,
      userName: r.user?.name || "Anonymous",
      userImage: r.user?.image,
      score: r.score,
      total: r.totalQuestions,
      accuracy: r.accuracy,
      attemptedAt: r.createdAt,
      quizName: r.quiz?.title,
    }));

    res.json({
      leaderboard,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / parsedLimit),
        total,
      },
    });
  } catch (error) {
    console.error("Get global leaderboard error:", error);
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
});

// GET CATEGORIES
router.get("/categories", async (req, res) => {
  try {
    const categories = await Quiz.distinct("category");
    res.json(categories);
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

export default router;

