import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { getAdminAnalytics } from "../services/adminService";
import { formatDateTimeDDMMYYYYHHMM } from "../utils/formatDate";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

function formatSeconds(seconds) {
  if (!seconds) return "0s";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (!mins) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

function getRiskTone(value) {
  if (value >= 20) return "danger";
  if (value >= 10) return "warning";
  return "safe";
}

function getDifficultyTone(value) {
  if (value === "hard") return "danger";
  if (value === "medium") return "warning";
  return "safe";
}

function buildInsights(stats) {
  if (!stats) return [];

  const insights = [];
  const hardestQuiz = stats.hardestQuizzes?.[0];
  const easiestQuiz = stats.easiestQuizzes?.[0];
  const topCategory = [...(stats.categoryPerformance || [])].sort((a, b) => b.attempts - a.attempts)[0];

  insights.push({
    title: "Engagement",
    value: `${stats.engagementRate || 0}%`,
    tone: stats.engagementRate >= 60 ? "safe" : stats.engagementRate >= 35 ? "warning" : "danger",
    detail: `${stats.activeUsers || 0} of ${stats.totalUsers || 0} users have attempted at least one quiz.`,
  });

  insights.push({
    title: "Integrity",
    value: `${stats.tabSwitchRate || 0}%`,
    tone: getRiskTone(stats.tabSwitchRate || 0),
    detail: `${stats.flaggedAttempts || 0} flagged attempts were recorded across the platform.`,
  });

  if (hardestQuiz) {
    insights.push({
      title: "Hardest Quiz",
      value: `${hardestQuiz.averageScore}%`,
      tone: "danger",
      detail: `${hardestQuiz.title} is the lowest-scoring quiz with ${hardestQuiz.attempts} attempts.`,
    });
  }

  if (easiestQuiz) {
    insights.push({
      title: "Easiest Quiz",
      value: `${easiestQuiz.averageScore}%`,
      tone: "safe",
      detail: `${easiestQuiz.title} has the highest average score right now.`,
    });
  }

  if (topCategory) {
    insights.push({
      title: "Top Category",
      value: topCategory.category,
      tone: "info",
      detail: `${topCategory.attempts} attempts with an average score of ${topCategory.averageScore}%.`,
    });
  }

  return insights.slice(0, 5);
}

function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [windowDays, setWindowDays] = useState(7);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        setError("");
        const data = await getAdminAnalytics(windowDays);
        setStats(data);
      } catch (fetchError) {
        console.error("Failed to fetch analytics:", fetchError);
        setError(fetchError.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [windowDays]);

  const healthScore = useMemo(() => {
    if (!stats) return 0;
    const score = Math.round(
      ((stats.averageScore || 0) +
        (stats.engagementRate || 0) +
        Math.max(0, 100 - (stats.tabSwitchRate || 0))) /
        3
    );
    return Math.max(0, Math.min(100, score));
  }, [stats]);

  const insights = useMemo(() => buildInsights(stats), [stats]);

  const categoryOptions = useMemo(() => {
    return ["all", ...new Set((stats?.categoryPerformance || []).map((item) => item.category))];
  }, [stats]);

  const filteredQuizHealth = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return (stats?.quizHealth || []).filter((quiz) => {
      const matchesCategory = categoryFilter === "all" || quiz.category === categoryFilter;
      const matchesDifficulty = difficultyFilter === "all" || quiz.difficulty === difficultyFilter;
      const matchesSearch =
        !normalizedSearch ||
        quiz.title.toLowerCase().includes(normalizedSearch) ||
        quiz.category.toLowerCase().includes(normalizedSearch);

      return matchesCategory && matchesDifficulty && matchesSearch;
    });
  }, [stats, categoryFilter, difficultyFilter, searchTerm]);

  const activityChartData = useMemo(() => {
    const labels = stats?.attemptsOverTime?.map((item) => item.date) || [];
    return {
      labels,
      datasets: [
        {
          label: "Attempts",
          data: stats?.attemptsOverTime?.map((item) => item.attempts) || [],
          borderColor: "#c2410c",
          backgroundColor: "rgba(194, 65, 12, 0.15)",
          fill: true,
          tension: 0.35,
          yAxisID: "y",
        },
        {
          label: "Average Score",
          data: stats?.scoreTrend?.map((item) => item.averageScore) || [],
          borderColor: "#0f766e",
          backgroundColor: "rgba(15, 118, 110, 0.12)",
          fill: false,
          tension: 0.35,
          yAxisID: "y1",
        },
      ],
    };
  }, [stats]);

  const categoryChartData = useMemo(
    () => ({
      labels: stats?.categoryPerformance?.map((item) => item.category) || [],
      datasets: [
        {
          label: "Average Score",
          data: stats?.categoryPerformance?.map((item) => item.averageScore) || [],
          backgroundColor: "#0f766e",
          borderRadius: 10,
        },
        {
          label: "Attempts",
          data: stats?.categoryPerformance?.map((item) => item.attempts) || [],
          backgroundColor: "#c2410c",
          borderRadius: 10,
        },
      ],
    }),
    [stats]
  );

  const compositionChartData = useMemo(
    () => ({
      labels: ["Active Users", "Inactive Users", "Flagged Attempts", "Clean Attempts"],
      datasets: [
        {
          data: [
            stats?.activeUsers || 0,
            Math.max(0, (stats?.totalUsers || 0) - (stats?.activeUsers || 0)),
            stats?.flaggedAttempts || 0,
            Math.max(0, (stats?.totalAttempts || 0) - (stats?.flaggedAttempts || 0)),
          ],
          backgroundColor: ["#0f766e", "#94a3b8", "#dc2626", "#ea580c"],
          borderWidth: 0,
        },
      ],
    }),
    [stats]
  );

  const trendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Attempts" },
      },
      y1: {
        beginAtZero: true,
        max: 100,
        position: "right",
        grid: { drawOnChartArea: false },
        title: { display: true, text: "Score %" },
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "bottom" } },
    scales: { y: { beginAtZero: true, max: 100 } },
  };

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div className="error-card">
          <h2>Analytics unavailable</h2>
          <p>{error}</p>
          <Link to="/admin/dashboard" className="btn btn-outline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Admin Intelligence</span>
          <h1>Analytics Dashboard</h1>
          <p>Track engagement, quiz quality, user growth, and integrity from one place.</p>
        </div>
        <div className="header-actions">
          <select
            className="toolbar-select"
            value={windowDays}
            onChange={(e) => setWindowDays(Number(e.target.value))}
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
          <Link to="/admin/dashboard" className="btn btn-outline">Back to Dashboard</Link>
          <Link to="/admin/quizzes" className="btn btn-primary">Manage Quizzes</Link>
        </div>
      </div>

      <section className="hero-grid">
        <div className="hero-card health-card">
          <div>
            <span className="eyebrow">Platform Health</span>
            <h2>{healthScore}/100</h2>
            <p>
              Combined from average score, engagement rate, and quiz integrity. This is the clearest
              single signal of whether the platform is healthy or just busy.
            </p>
          </div>
          <div className="health-metrics">
            <div>
              <span>Avg Score</span>
              <strong>{stats?.averageScore || 0}%</strong>
            </div>
            <div>
              <span>Engagement</span>
              <strong>{stats?.engagementRate || 0}%</strong>
            </div>
            <div>
              <span>Integrity Risk</span>
              <strong>{stats?.tabSwitchRate || 0}%</strong>
            </div>
          </div>
        </div>

        <div className="hero-card spotlight-card">
          <span className="eyebrow">Current Spotlight</span>
          <h3>{stats?.mostAttemptedQuiz?.title || "No quiz data yet"}</h3>
          <p>
            {stats?.mostAttemptedQuiz
              ? `${stats.mostAttemptedQuiz.attempts} attempts make this your highest-traffic quiz.`
              : "Seed more quiz attempts to unlock the strongest analytics insights."}
          </p>
          <div className="spotlight-meta">
            <span>{stats?.averageAttemptsPerUser || 0} avg attempts per active user</span>
            <span>{formatSeconds(stats?.averageTimeTaken || 0)} average time taken</span>
          </div>
        </div>
      </section>

      <section className="stats-grid">
        {[
          { label: "Total Users", value: stats?.totalUsers || 0, hint: "Registered users" },
          { label: "Active Users", value: stats?.activeUsers || 0, hint: "Users with at least one attempt" },
          { label: "Quiz Library", value: stats?.totalQuizzes || 0, hint: "Currently active quizzes" },
          { label: "Total Attempts", value: stats?.totalAttempts || 0, hint: "Recorded submissions" },
          { label: "Avg Attempt Time", value: formatSeconds(stats?.averageTimeTaken || 0), hint: "Across all results" },
          { label: "Flagged Attempts", value: stats?.flaggedAttempts || 0, hint: "Tab switch incidents" },
        ].map((item) => (
          <div key={item.label} className="stat-card">
            <span className="stat-label">{item.label}</span>
            <strong>{item.value}</strong>
            <p>{item.hint}</p>
          </div>
        ))}
      </section>

      <section className="insight-grid">
        {insights.map((item) => (
          <div key={item.title} className={`insight-card ${item.tone}`}>
            <div className="insight-top">
              <span>{item.title}</span>
              <strong>{item.value}</strong>
            </div>
            <p>{item.detail}</p>
          </div>
        ))}
      </section>

      <section className="chart-section chart-section-wide">
        <div className="section-heading">
          <div>
            <h2>Platform Pulse</h2>
            <p>Attempts and average score across the selected time range.</p>
          </div>
        </div>
        <div className="chart-shell large-chart">
          <Line data={activityChartData} options={trendOptions} />
        </div>
      </section>

      <section className="chart-grid">
        <div className="chart-section">
          <div className="section-heading">
            <div>
              <h2>Category Performance</h2>
              <p>Compare category demand against learning quality.</p>
            </div>
          </div>
          <div className="chart-shell medium-chart">
            {stats?.categoryPerformance?.length ? (
              <Bar data={categoryChartData} options={barOptions} />
            ) : (
              <p className="empty">No category analytics yet.</p>
            )}
          </div>
        </div>

        <div className="chart-section">
          <div className="section-heading">
            <div>
              <h2>Engagement Mix</h2>
              <p>See how user activity and integrity risk are distributed.</p>
            </div>
          </div>
          <div className="chart-shell medium-chart donut-chart">
            <Doughnut
              data={compositionChartData}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }}
            />
          </div>
        </div>
      </section>

      <section className="table-grid">
        <div className="panel-card">
          <div className="section-heading">
            <div>
              <h2>Hardest Quizzes</h2>
              <p>These need review first if you want stronger completion quality.</p>
            </div>
          </div>
          {stats?.hardestQuizzes?.length ? (
            <div className="score-list">
              {stats.hardestQuizzes.map((quiz) => (
                <div key={quiz.quizId} className="score-row">
                  <div>
                    <strong>{quiz.title}</strong>
                    <p>{quiz.category} · {quiz.attempts} attempts</p>
                  </div>
                  <span className="score-badge danger">{quiz.averageScore}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty">Need more attempts before difficulty patterns become trustworthy.</p>
          )}
        </div>

        <div className="panel-card">
          <div className="section-heading">
            <div>
              <h2>Easiest Quizzes</h2>
              <p>High scores are good, but some of these may be too easy.</p>
            </div>
          </div>
          {stats?.easiestQuizzes?.length ? (
            <div className="score-list">
              {stats.easiestQuizzes.map((quiz) => (
                <div key={quiz.quizId} className="score-row">
                  <div>
                    <strong>{quiz.title}</strong>
                    <p>{quiz.category} · {quiz.attempts} attempts</p>
                  </div>
                  <span className="score-badge safe">{quiz.averageScore}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty">No easy-quiz benchmark yet.</p>
          )}
        </div>
      </section>

      <section className="panel-card full-width-card">
        <div className="section-heading">
          <div>
            <h2>Quiz Health Table</h2>
            <p>This is the operational view: demand, score quality, pace, and integrity risk in one table.</p>
          </div>
        </div>
        <div className="filters-toolbar">
          <input
            className="toolbar-input"
            type="text"
            placeholder="Search quiz or category"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="toolbar-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category === "all" ? "All categories" : category}
              </option>
            ))}
          </select>
          <select
            className="toolbar-select"
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
          >
            <option value="all">All difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        {filteredQuizHealth.length ? (
          <div className="table-wrap">
            <table className="table analytics-table">
              <thead>
                <tr>
                  <th>Quiz</th>
                  <th>Category</th>
                  <th>Difficulty</th>
                  <th>Attempts</th>
                  <th>Avg Score</th>
                  <th>Avg Time</th>
                  <th>Risk</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuizHealth.map((quiz) => (
                  <tr key={quiz.quizId}>
                    <td>{quiz.title}</td>
                    <td>{quiz.category}</td>
                    <td>
                      <span className={`pill ${getDifficultyTone(quiz.difficulty)}`}>{quiz.difficulty}</span>
                    </td>
                    <td>{quiz.attempts}</td>
                    <td>{quiz.averageScore}%</td>
                    <td>{formatSeconds(quiz.averageTimeTaken)}</td>
                    <td>
                      <span className={`pill ${getRiskTone(quiz.riskRate)}`}>{quiz.riskRate}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty">No quiz health data matches the current filters.</p>
        )}
      </section>

      <section className="table-grid">
        <div className="panel-card">
          <div className="section-heading">
            <div>
              <h2>Recent Activity</h2>
              <p>Latest completed attempts across the platform.</p>
            </div>
          </div>
          {stats?.recentActivity?.length ? (
            <div className="activity-list">
              {stats.recentActivity.map((item, index) => (
                <div key={`${item.user}-${item.date}-${index}`} className="activity-row">
                  <div>
                    <strong>{item.user}</strong>
                    <p>{item.quiz} · {item.category}</p>
                  </div>
                  <div className="activity-meta">
                    <span>{item.score}/{item.total}</span>
                    <span>{item.accuracy}%</span>
                    <span>{formatDateTimeDDMMYYYYHHMM(item.date)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty">No recent activity yet.</p>
          )}
        </div>

        <div className="panel-card">
          <div className="section-heading">
            <div>
              <h2>Integrity Flags</h2>
              <p>Recent tab-switch incidents worth a manual review.</p>
            </div>
          </div>
          {stats?.recentIntegrityFlags?.length ? (
            <div className="activity-list">
              {stats.recentIntegrityFlags.map((item) => (
                <div key={item.id} className="activity-row flagged-row">
                  <div>
                    <strong>{item.user}</strong>
                    <p>{item.quiz}</p>
                  </div>
                  <div className="activity-meta">
                    <span>{item.score}/{item.total}</span>
                    <span>{item.accuracy}%</span>
                    <span>{formatDateTimeDDMMYYYYHHMM(item.date)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty">No flagged attempts in the recent window.</p>
          )}
        </div>
      </section>

      <style>{`
        .analytics-page {
          max-width: 1320px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 18px;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }

        .eyebrow {
          display: inline-block;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--primary);
          margin-bottom: 10px;
          font-weight: 700;
        }

        .page-header h1 {
          font-size: clamp(2rem, 3vw, 3rem);
          margin-bottom: 8px;
        }

        .page-header p {
          max-width: 720px;
          color: var(--text-secondary);
        }

        .header-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .toolbar-input,
        .toolbar-select {
          min-height: 44px;
          border: 1px solid rgba(148, 163, 184, 0.35);
          border-radius: 14px;
          padding: 0 14px;
          background: #fff;
          color: var(--text);
        }

        .toolbar-input {
          min-width: 240px;
        }

        .hero-grid,
        .stats-grid,
        .insight-grid,
        .chart-grid,
        .table-grid {
          display: grid;
          gap: 18px;
          margin-bottom: 18px;
        }

        .hero-grid {
          grid-template-columns: 1.35fr 1fr;
        }

        .stats-grid {
          grid-template-columns: repeat(6, minmax(0, 1fr));
        }

        .insight-grid {
          grid-template-columns: repeat(5, minmax(0, 1fr));
        }

        .chart-grid,
        .table-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .hero-card,
        .stat-card,
        .chart-section,
        .panel-card,
        .insight-card,
        .error-card {
          background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.98));
          border: 1px solid rgba(148, 163, 184, 0.18);
          border-radius: 24px;
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
        }

        .hero-card,
        .panel-card,
        .chart-section,
        .error-card {
          padding: 24px;
        }

        .health-card {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 18px;
          background: linear-gradient(135deg, #0f172a, #134e4a);
          color: #f8fafc;
        }

        .health-card .eyebrow,
        .health-card p,
        .health-card span {
          color: rgba(248, 250, 252, 0.86);
        }

        .health-card h2 {
          font-size: clamp(2.4rem, 4vw, 4rem);
          margin: 6px 0 12px;
        }

        .health-metrics {
          display: grid;
          gap: 12px;
        }

        .health-metrics div {
          padding: 14px;
          border-radius: 18px;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(8px);
        }

        .health-metrics strong {
          display: block;
          font-size: 1.4rem;
          color: #fff;
          margin-top: 4px;
        }

        .spotlight-card {
          background: linear-gradient(135deg, #fff7ed, #ffedd5);
        }

        .spotlight-card h3 {
          font-size: 1.6rem;
          margin-bottom: 12px;
        }

        .spotlight-meta {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 14px;
        }

        .spotlight-meta span {
          display: inline-flex;
          padding: 8px 12px;
          background: rgba(194, 65, 12, 0.08);
          border-radius: 999px;
          color: #9a3412;
          font-size: 0.88rem;
          font-weight: 600;
        }

        .stat-card {
          padding: 18px;
        }

        .stat-card strong {
          display: block;
          font-size: 1.9rem;
          margin: 6px 0;
          color: var(--text);
        }

        .stat-label {
          display: inline-block;
          color: var(--text-secondary);
          font-size: 0.84rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .stat-card p,
        .insight-card p,
        .section-heading p,
        .score-row p,
        .activity-row p,
        .empty,
        .error-card p {
          color: var(--text-secondary);
        }

        .insight-card {
          padding: 18px;
        }

        .insight-top {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          margin-bottom: 8px;
        }

        .insight-top span {
          color: var(--text-secondary);
          font-size: 0.88rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .insight-top strong {
          font-size: 1.4rem;
        }

        .insight-card.safe { border-top: 4px solid #0f766e; }
        .insight-card.warning { border-top: 4px solid #c2410c; }
        .insight-card.danger { border-top: 4px solid #dc2626; }
        .insight-card.info { border-top: 4px solid #2563eb; }

        .chart-section-wide {
          margin-bottom: 18px;
        }

        .section-heading {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 18px;
        }

        .section-heading h2 {
          font-size: 1.2rem;
          margin-bottom: 6px;
        }

        .chart-shell {
          position: relative;
        }

        .large-chart {
          height: 380px;
        }

        .medium-chart {
          height: 320px;
        }

        .donut-chart {
          max-width: 460px;
          margin: 0 auto;
        }

        .score-list,
        .activity-list {
          display: grid;
          gap: 12px;
        }

        .score-row,
        .activity-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 18px;
          background: var(--background);
          align-items: center;
        }

        .flagged-row {
          border: 1px solid rgba(220, 38, 38, 0.18);
          background: #fff5f5;
        }

        .score-badge,
        .pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 7px 12px;
          border-radius: 999px;
          font-size: 0.82rem;
          font-weight: 700;
          text-transform: capitalize;
        }

        .score-badge.safe,
        .pill.safe {
          background: rgba(15, 118, 110, 0.12);
          color: #0f766e;
        }

        .score-badge.danger,
        .pill.danger {
          background: rgba(220, 38, 38, 0.12);
          color: #b91c1c;
        }

        .pill.warning {
          background: rgba(194, 65, 12, 0.12);
          color: #c2410c;
        }

        .activity-meta {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .activity-meta span {
          font-size: 0.84rem;
          padding: 6px 10px;
          background: #ffffff;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.18);
        }

        .full-width-card {
          margin-bottom: 18px;
        }

        .filters-toolbar {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }

        .table-wrap {
          overflow-x: auto;
        }

        .analytics-table {
          min-width: 820px;
        }

        .error-card {
          max-width: 540px;
          margin: 60px auto;
          text-align: center;
        }

        .loading {
          text-align: center;
          padding: 60px 20px;
          color: var(--text-secondary);
        }

        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .insight-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 900px) {
          .hero-grid,
          .chart-grid,
          .table-grid,
          .health-card {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .stats-grid,
          .insight-grid {
            grid-template-columns: 1fr;
          }

          .hero-card,
          .panel-card,
          .chart-section,
          .error-card {
            padding: 18px;
          }

          .header-actions {
            width: 100%;
          }

          .header-actions .btn,
          .toolbar-input,
          .toolbar-select {
            flex: 1;
            min-width: 160px;
          }

          .large-chart,
          .medium-chart {
            height: 280px;
          }

          .score-row,
          .activity-row,
          .insight-top {
            flex-direction: column;
            align-items: flex-start;
          }

          .activity-meta {
            justify-content: flex-start;
          }
        }
      `}</style>
    </div>
  );
}

export default Analytics;
