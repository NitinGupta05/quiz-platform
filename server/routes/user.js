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

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function getDateBuckets(days = 7) {
  const today = endOfDay(new Date());
  return Array.from({ length: days }, (_, index) => {
    const bucketDate = new Date(today);
    bucketDate.setDate(today.getDate() - (days - 1 - index));
    bucketDate.setHours(0, 0, 0, 0);
    return bucketDate;
  });
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

    const dateBuckets = getDateBuckets(7);
    const firstBucketDate = startOfDay(dateBuckets[0]);
    const lastBucketDate = endOfDay(dateBuckets[dateBuckets.length - 1]);

    const [
      totalUsers,
      totalQuizzes,
      totalAttempts,
      averageStatsResult,
      activeUsersAgg,
      recentResults,
      popularQuizAgg,
      quizPerformanceAgg,
      categoryPerformanceAgg,
      riskyAttemptAgg,
      userGrowthAgg,
      attemptsTrendAgg,
    ] = await Promise.all([
      User.countDocuments(),
      Quiz.countDocuments(),
      Quiz.countDocuments({ isActive: true }),
      Result.aggregate([
        {
          $group: {
            _id: null,
            avgAccuracy: { $avg: "$accuracy" },
            avgTimeTaken: { $avg: "$timeTaken" },
            flaggedAttempts: {
              $sum: { $cond: [{ $eq: ["$isTabSwitched", true] }, 1, 0] },
            },
          },
        },
      ]),
      Result.aggregate([{ $group: { _id: "$user" } }, { $count: "total" }]),
      Result.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .populate("user", "name")
        .populate("quiz", "title category difficulty"),
      Result.aggregate([
        { $group: { _id: "$quiz", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ]),
      Result.aggregate([
        {
          $group: {
            _id: "$quiz",
            attempts: { $sum: 1 },
            averageScore: { $avg: "$accuracy" },
            averageTimeTaken: { $avg: "$timeTaken" },
            flaggedAttempts: {
              $sum: { $cond: [{ $eq: ["$isTabSwitched", true] }, 1, 0] },
            },
            lastAttemptAt: { $max: "$createdAt" },
          },
        },
        { $match: { _id: { $ne: null } } },
        {
          $lookup: {
            from: "quizzes",
            localField: "_id",
            foreignField: "_id",
            as: "quiz",
          },
        },
        { $unwind: "$quiz" },
      ]),
      Result.aggregate([
        {
          $lookup: {
            from: "quizzes",
            localField: "quiz",
            foreignField: "_id",
            as: "quiz",
          },
        },
        { $unwind: "$quiz" },
        {
          $group: {
            _id: "$quiz.category",
            attempts: { $sum: 1 },
            averageScore: { $avg: "$accuracy" },
            averageTimeTaken: { $avg: "$timeTaken" },
          },
        },
        { $sort: { attempts: -1 } },
      ]),
      Result.aggregate([
        { $match: { isTabSwitched: true } },
        { $sort: { createdAt: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $lookup: {
            from: "quizzes",
            localField: "quiz",
            foreignField: "_id",
            as: "quiz",
          },
        },
        {
          $project: {
            _id: 1,
            createdAt: 1,
            accuracy: 1,
            score: 1,
            totalQuestions: 1,
            user: { $arrayElemAt: ["$user.name", 0] },
            quiz: { $arrayElemAt: ["$quiz.title", 0] },
          },
        },
      ]),
      User.aggregate([
        { $match: { createdAt: { $gte: firstBucketDate, $lte: lastBucketDate } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
            },
            users: { $sum: 1 },
          },
        },
      ]),
      Result.aggregate([
        { $match: { createdAt: { $gte: firstBucketDate, $lte: lastBucketDate } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
            },
            attempts: { $sum: 1 },
            averageScore: { $avg: "$accuracy" },
            activeUsers: { $addToSet: "$user" },
            flaggedAttempts: {
              $sum: { $cond: [{ $eq: ["$isTabSwitched", true] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    const averageScore = averageStatsResult[0]?.avgAccuracy
      ? Math.round(averageStatsResult[0].avgAccuracy)
      : 0;
    const averageTimeTaken = averageStatsResult[0]?.avgTimeTaken
      ? Math.round(averageStatsResult[0].avgTimeTaken)
      : 0;
    const flaggedAttempts = averageStatsResult[0]?.flaggedAttempts || 0;
    const activeUsers = activeUsersAgg[0]?.total || 0;
    const engagementRate = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;
    const tabSwitchRate = totalAttempts > 0 ? Math.round((flaggedAttempts / totalAttempts) * 100) : 0;
    const averageAttemptsPerUser = activeUsers > 0 ? Number((totalAttempts / activeUsers).toFixed(1)) : 0;

    const quizTitleMap = new Map(
      quizPerformanceAgg.map((item) => [
        String(item._id),
        {
          title: item.quiz?.title || "Untitled Quiz",
          category: item.quiz?.category || "General",
          difficulty: item.quiz?.difficulty || "medium",
          isActive: item.quiz?.isActive ?? true,
        },
      ])
    );

    const popularQuizzes = popularQuizAgg.map((item) => ({
      quizId: item._id,
      title: quizTitleMap.get(String(item._id))?.title || "Untitled Quiz",
      attempts: item.count,
    }));

    const recentActivity = recentResults.map((result) => ({
      user: result.user?.name || "Anonymous",
      quiz: result.quiz?.title || "Untitled Quiz",
      category: result.quiz?.category || "General",
      difficulty: result.quiz?.difficulty || "medium",
      score: result.score,
      total: result.totalQuestions,
      accuracy: result.accuracy,
      date: result.createdAt,
      isTabSwitched: result.isTabSwitched,
    }));

    const performanceByQuiz = quizPerformanceAgg
      .map((item) => {
        const meta = quizTitleMap.get(String(item._id)) || {};
        const riskRate = item.attempts > 0
          ? Math.round((item.flaggedAttempts / item.attempts) * 100)
          : 0;

        return {
          quizId: item._id,
          title: meta.title || "Untitled Quiz",
          category: meta.category || "General",
          difficulty: meta.difficulty || "medium",
          isActive: meta.isActive ?? true,
          attempts: item.attempts,
          averageScore: Math.round(item.averageScore || 0),
          averageTimeTaken: Math.round(item.averageTimeTaken || 0),
          riskRate,
          lastAttemptAt: item.lastAttemptAt,
        };
      })
      .sort((a, b) => b.attempts - a.attempts);

    const hardestQuizzes = [...performanceByQuiz]
      .filter((item) => item.attempts >= 2)
      .sort((a, b) => a.averageScore - b.averageScore || b.attempts - a.attempts)
      .slice(0, 5);

    const easiestQuizzes = [...performanceByQuiz]
      .filter((item) => item.attempts >= 2)
      .sort((a, b) => b.averageScore - a.averageScore || b.attempts - a.attempts)
      .slice(0, 5);

    const quizHealth = performanceByQuiz.slice(0, 6);

    const categoryPerformance = categoryPerformanceAgg.map((item) => ({
      category: item._id || "General",
      attempts: item.attempts,
      averageScore: Math.round(item.averageScore || 0),
      averageTimeTaken: Math.round(item.averageTimeTaken || 0),
    }));

    const trendMap = new Map(
      attemptsTrendAgg.map((item) => [
        `${item._id.year}-${item._id.month}-${item._id.day}`,
        item,
      ])
    );

    const signupMap = new Map(
      userGrowthAgg.map((item) => [
        `${item._id.year}-${item._id.month}-${item._id.day}`,
        item.users,
      ])
    );

    const attemptsOverTime = dateBuckets.map((startDate) => {
      const key = `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}`;
      const dayData = trendMap.get(key);

      return {
        date: formatDayLabel(startDate),
        attempts: dayData?.attempts || 0,
        averageScore: dayData?.averageScore ? Math.round(dayData.averageScore) : 0,
        activeUsers: dayData?.activeUsers?.length || 0,
        flaggedAttempts: dayData?.flaggedAttempts || 0,
      };
    });

    const scoreTrend = attemptsOverTime.map((item) => ({
      date: item.date,
      averageScore: item.averageScore,
    }));

    const userActivityTrends = attemptsOverTime.map((item) => ({
      date: item.date,
      activeUsers: item.activeUsers,
    }));

    const userGrowth = dateBuckets.map((startDate) => {
      const key = `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}`;
      return {
        date: formatDayLabel(startDate),
        users: signupMap.get(key) || 0,
      };
    });

    const recentIntegrityFlags = riskyAttemptAgg.map((item) => ({
      id: item._id,
      user: item.user || "Anonymous",
      quiz: item.quiz || "Untitled Quiz",
      score: item.score,
      total: item.totalQuestions,
      accuracy: item.accuracy,
      date: item.createdAt,
    }));

    res.json({
      totalUsers,
      totalQuizzes,
      totalAttempts,
      activeUsers,
      engagementRate,
      averageScore,
      averageTimeTaken,
      averageAttemptsPerUser,
      flaggedAttempts,
      tabSwitchRate,
      recentActivity,
      mostAttemptedQuiz: popularQuizzes[0] || null,
      attemptsOverTime,
      popularQuizzes,
      scoreTrend,
      userActivityTrends,
      userGrowth,
      categoryPerformance,
      hardestQuizzes,
      easiestQuizzes,
      quizHealth,
      recentIntegrityFlags,
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

