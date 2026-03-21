import { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import { formatDateTimeDDMMYYYYHHMM } from "../utils/formatDate";
import { getHistory, getProgress } from "../services/userService";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function Progress() {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    try {
      const [statsData, historyData] = await Promise.all([getProgress(), getHistory(20)]);
      setStats(statsData);
      setHistory(historyData.history || []);
    } catch (error) {
      console.error("Failed to fetch progress:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();

    const handleQuizSubmitted = () => {
      fetchProgress();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchProgress();
      }
    };

    const handleWindowFocus = () => {
      fetchProgress();
    };

    window.addEventListener("quiz-submitted", handleQuizSubmitted);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      window.removeEventListener("quiz-submitted", handleQuizSubmitted);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [fetchProgress]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: "#51606d",
            font: { weight: 600 },
          },
        },
        tooltip: {
          backgroundColor: "rgba(23, 32, 38, 0.92)",
          titleColor: "#ffffff",
          bodyColor: "#ffffff",
          padding: 12,
          cornerRadius: 12,
        },
      },
      scales: {
        x: {
          ticks: { color: "#51606d" },
          grid: { display: false },
        },
        y: {
          ticks: { color: "#51606d" },
          grid: { color: "rgba(81, 96, 109, 0.12)" },
          border: { display: false },
          beginAtZero: true,
        },
      },
    }),
    []
  );

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const accuracyChartData = {
    labels: ["Correct", "Wrong"],
    datasets: [
      {
        data: [stats?.totalCorrect || 0, (stats?.totalQuestionsAnswered || 0) - (stats?.totalCorrect || 0)],
        backgroundColor: ["#2f855a", "#c53030"],
        borderWidth: 0,
      },
    ],
  };

  const categoryChartData = {
    labels: stats?.categoryPerformance?.map((category) => category.category) || [],
    datasets: [
      {
        label: "Average Score (%)",
        data: stats?.categoryPerformance?.map((category) => category.averageScore) || [],
        backgroundColor: "rgba(15, 118, 110, 0.84)",
        borderRadius: 12,
      },
    ],
  };

  return (
    <div className="progress-page">
      <section className="progress-hero">
        <div>
          <span className="section-kicker">Performance overview</span>
          <h1>Your progress</h1>
          <p>Track your results over time, spot weak categories, and decide what to practice next.</p>
        </div>
        <Link to="/dashboard" className="btn btn-outline">Back to dashboard</Link>
      </section>

      <section className="stats-grid">
        {[
          { label: "Quizzes taken", value: stats?.totalQuizzesTaken || 0, accent: "Taken" },
          { label: "Overall accuracy", value: `${stats?.overallAccuracy || 0}%`, accent: "Score" },
          { label: "Average score", value: `${stats?.averageScore || 0}%`, accent: "Avg" },
          { label: "Best score", value: `${stats?.bestScore || 0}%`, accent: "Peak" },
        ].map((item) => (
          <article key={item.label} className="stat-card">
            <span className="icon-chip">{item.accent}</span>
            <strong>{item.value}</strong>
            <h3>{item.label}</h3>
          </article>
        ))}
      </section>

      <section className="charts-grid">
        <div className="card chart-card">
          <div className="panel-header">
            <div>
              <span className="section-kicker subdued">Accuracy split</span>
              <h2>Correct vs wrong answers</h2>
            </div>
          </div>
          <div className="chart-shell doughnut-shell">
            <Doughnut data={accuracyChartData} options={chartOptions} />
          </div>
        </div>
        <div className="card chart-card">
          <div className="panel-header">
            <div>
              <span className="section-kicker subdued">Category view</span>
              <h2>Performance by category</h2>
            </div>
          </div>
          <div className="chart-shell bar-shell">
            <Bar data={categoryChartData} options={chartOptions} />
          </div>
        </div>
      </section>

      <section className="card history-card">
        <div className="panel-header">
          <div>
            <span className="section-kicker subdued">Attempt history</span>
            <h2>Recent quiz attempts</h2>
          </div>
          <Link to="/quizzes" className="btn btn-outline btn-sm">Take another quiz</Link>
        </div>
        {history.length > 0 ? (
          <div className="history-table">
            <table className="table">
              <thead>
                <tr>
                  <th>Quiz</th>
                  <th>Score</th>
                  <th>Accuracy</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item._id}>
                    <td>{item.quiz?.title || "Quiz"}</td>
                    <td>{item.score}/{item.totalQuestions}</td>
                    <td>
                      <span className={`accuracy-pill ${item.accuracy >= 60 ? "good" : "bad"}`}>
                        {item.accuracy}%
                      </span>
                    </td>
                    <td>{formatDateTimeDDMMYYYYHHMM(item.createdAt || item.attemptedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <h3>No quiz history yet</h3>
            <p>Complete your first quiz and this page will start showing your performance timeline.</p>
            <Link to="/quizzes" className="btn btn-primary">Take a quiz</Link>
          </div>
        )}
      </section>

      <style>{`
        .progress-page {
          max-width: var(--page-width);
          margin: 0 auto;
          display: grid;
          gap: 24px;
        }
        .progress-hero {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          padding: 28px;
          border-radius: 28px;
          background:
            linear-gradient(135deg, rgba(217, 119, 6, 0.14), rgba(15, 118, 110, 0.08)),
            var(--surface);
          border: 1px solid rgba(15, 23, 42, 0.05);
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
        }
        .section-kicker {
          display: inline-flex;
          align-items: center;
          padding: 7px 12px;
          border-radius: 999px;
          background: var(--primary-soft);
          color: var(--primary-dark);
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 14px;
        }
        .subdued {
          background: var(--surface-muted);
          color: var(--text-secondary);
        }
        .progress-hero h1 {
          font-size: clamp(2rem, 4vw, 3rem);
          margin-bottom: 8px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
        }
        .stat-card {
          padding: 24px;
          border-radius: 22px;
          background: var(--surface);
          border: 1px solid rgba(15, 23, 42, 0.05);
          box-shadow: 0 14px 34px rgba(15, 23, 42, 0.06);
        }
        .stat-card strong {
          display: block;
          margin: 16px 0 8px;
          font-size: 2rem;
        }
        .stat-card h3 {
          font-size: 1rem;
          color: var(--text-secondary);
        }
        .charts-grid {
          display: grid;
          grid-template-columns: 0.92fr 1.08fr;
          gap: 20px;
        }
        .chart-card,
        .history-card {
          border-radius: 26px;
        }
        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 20px;
        }
        .panel-header h2 {
          margin: 0;
          font-size: 1.5rem;
        }
        .chart-shell {
          position: relative;
          min-height: 320px;
          padding: 8px;
          border-radius: 20px;
          background: var(--background-elevated);
          border: 1px solid rgba(15, 23, 42, 0.05);
        }
        .doughnut-shell {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .bar-shell {
          padding: 16px 12px 8px;
        }
        .history-table {
          overflow-x: auto;
        }
        .accuracy-pill {
          display: inline-flex;
          align-items: center;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 0.82rem;
          font-weight: 700;
        }
        .accuracy-pill.good {
          background: rgba(47, 133, 90, 0.12);
          color: var(--success);
        }
        .accuracy-pill.bad {
          background: rgba(197, 48, 48, 0.12);
          color: var(--danger);
        }
        @media (max-width: 1100px) {
          .stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .charts-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 768px) {
          .progress-hero,
          .chart-card,
          .history-card,
          .stat-card {
            padding: 18px;
            border-radius: 20px;
          }
          .progress-hero,
          .panel-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .chart-shell {
            min-height: 260px;
          }
        }
      `}</style>
    </div>
  );
}

export default Progress;
