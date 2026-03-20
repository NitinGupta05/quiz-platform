import express from "express";
import auth from "../middleware/auth.js";
import User from "../models/User.js";
import Result from "../models/Result.js";
import Quiz from "../models/Quiz.js";

const router = express.Router();

function formatDayLabel(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
}

// PUBLIC: GET PLATFORM STATS
router.get("/public-stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalQuizzes = await Quiz.countDocuments();
    const totalAttempts = await Result.countDocuments();

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalQuizzes,
        totalAttempts
      }
    });
  } catch (error) {
    console.error("Get public stats error:", error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

// GET USER PROGRESS
router.get("/progress", auth, async (req, res) => {
  try {
    const results = await Result.find({ user: req.user.id })
      .populate("quiz", "title category")
      .sort({ createdAt: -1 });

    const totalQuizzesTaken = results.length;
    const totalCorrect = results.reduce((sum, r) => sum + r.correctAnswers, 0);
    const totalQuestionsAnswered = results.reduce((sum, r) => sum + r.totalQuestions, 0);
    const overallAccuracy = totalQuestionsAnswered > 0 
      ? Math.round((totalCorrect / totalQuestionsAnswered) * 100) 
      : 0;
    const averageScore = results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + r.accuracy, 0) / results.length)
      : 0;
    const bestScore = results.length > 0
      ? Math.max(...results.map(r => r.accuracy))
      : 0;

    // Category performance
    const categoryMap = {};
    results.forEach(r => {
      if (r.quiz?.category) {
        if (!categoryMap[r.quiz.category]) {
          categoryMap[r.quiz.category] = { total: 0, count: 0 };
        }
        categoryMap[r.quiz.category].total += r.accuracy;
        categoryMap[r.quiz.category].count += 1;
      }
    });

    const categoryPerformance = Object.entries(categoryMap).map(([category, data]) => ({
      category,
      averageScore: Math.round(data.total / data.count),
    }));

    res.json({
      totalQuizzesTaken,
      totalCorrect,
      totalQuestionsAnswered,
      overallAccuracy,
      averageScore,
      bestScore,
      categoryPerformance,
    });
  } catch (error) {
    console.error("Get progress error:", error);
    res.status(500).json({ message: "Failed to fetch progress" });
  }
});

// GET USER HISTORY
router.get("/history", auth, async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;

    const results = await Result.find({ user: req.user.id })
      .populate("quiz", "title category difficulty timeLimit")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Result.countDocuments({ user: req.user.id });

    res.json({
      history: results,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({ message: "Failed to fetch history" });
  }
});

// ADMIN: GET ANALYTICS
router.get("/admin/analytics", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const totalUsers = await User.countDocuments();
    const totalQuizzes = await Quiz.countDocuments();
    const totalAttempts = await Result.countDocuments();

    // Calculate average score across all attempts
    const avgScoreResult = await Result.aggregate([
      { $group: { _id: null, avgAccuracy: { $avg: "$accuracy" } } }
    ]);
    const averageScore = avgScoreResult[0]?.avgAccuracy 
      ? Math.round(avgScoreResult[0].avgAccuracy) 
      : 0;

    // Active users: users who attempted at least one quiz
    const activeUsersAgg = await Result.aggregate([
      { $group: { _id: "$user" } },
      { $count: "total" },
    ]);
    const activeUsers = activeUsersAgg[0]?.total || 0;

    // Most popular quizzes
    const popularQuizAgg = await Result.aggregate([
      { $group: { _id: "$quiz", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);
    const popularQuizIds = popularQuizAgg.map((item) => item._id).filter(Boolean);
    const popularQuizDocs = await Quiz.find({ _id: { $in: popularQuizIds } }).select("title");
    const quizTitleMap = popularQuizDocs.reduce((acc, quiz) => {
      acc[String(quiz._id)] = quiz.title;
      return acc;
    }, {});
    const popularQuizzes = popularQuizAgg.map((item) => ({
      quizId: item._id,
      title: quizTitleMap[String(item._id)] || "Untitled Quiz",
      attempts: item.count,
    }));

    const recentResults = await Result.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name")
      .populate("quiz", "title");

    const recentActivity = recentResults.map((result) => ({
      user: result.user?.name || "Anonymous",
      quiz: result.quiz?.title || "Untitled Quiz",
      score: result.score,
      total: result.totalQuestions,
      date: result.createdAt,
    }));

    // Build last 7-day date buckets (including today)
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const dateBuckets = [];
    for (let i = 6; i >= 0; i--) {
      const bucketDate = new Date(today);
      bucketDate.setDate(today.getDate() - i);
      bucketDate.setHours(0, 0, 0, 0);
      dateBuckets.push(bucketDate);
    }

    const attemptsOverTime = await Promise.all(
      dateBuckets.map(async (startDate) => {
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1);

        const dailyAttempts = await Result.countDocuments({
          createdAt: { $gte: startDate, $lt: endDate },
        });

        return {
          date: formatDayLabel(startDate),
          attempts: dailyAttempts,
        };
      })
    );

    const scoreTrend = await Promise.all(
      dateBuckets.map(async (startDate) => {
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1);

        const dailyAverage = await Result.aggregate([
          { $match: { createdAt: { $gte: startDate, $lt: endDate } } },
          { $group: { _id: null, avgAccuracy: { $avg: "$accuracy" } } },
        ]);

        return {
          date: formatDayLabel(startDate),
          averageScore: dailyAverage[0]?.avgAccuracy ? Math.round(dailyAverage[0].avgAccuracy) : 0,
        };
      })
    );

    const userActivityTrends = await Promise.all(
      dateBuckets.map(async (startDate) => {
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1);

        const activeUsersForDay = await Result.aggregate([
          { $match: { createdAt: { $gte: startDate, $lt: endDate } } },
          { $group: { _id: "$user" } },
          { $count: "total" },
        ]);

        return {
          date: formatDayLabel(startDate),
          activeUsers: activeUsersForDay[0]?.total || 0,
        };
      })
    );

    res.json({
      totalUsers,
      totalQuizzes,
      totalAttempts,
      activeUsers,
      averageScore,
      recentActivity,
      mostAttemptedQuiz: popularQuizzes[0] || null,
      attemptsOverTime,
      popularQuizzes,
      scoreTrend,
      userActivityTrends,
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
});

// ADMIN: GET ALL USERS WITH STATS
router.get("/admin/users", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { page = 1, limit = 20, search } = req.query;

    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    // Get user stats
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const attempts = await Result.countDocuments({ user: user._id });
        const avgScore = await Result.aggregate([
          { $match: { user: user._id } },
          { $group: { _id: null, avg: { $avg: "$accuracy" } } }
        ]);
        
        return {
          ...user.toObject(),
          totalAttempts: attempts,
          averageScore: avgScore[0]?.avg ? Math.round(avgScore[0].avg) : 0,
        };
      })
    );

    res.json({
      users: usersWithStats,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

export default router;

