import { useEffect, useState, useCallback } from "react";
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
        backgroundColor: ["#4CAF50", "#f44336"],
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
        backgroundColor: "#129990",
      },
    ],
  };

  return (
    <div className="progress-page">
      <div className="page-header">
        <div>
          <h1>Your Progress</h1>
          <p>Track your quiz performance over time.</p>
        </div>
        <Link to="/dashboard" className="btn btn-outline">Back to Dashboard</Link>
      </div>

      <div className="stats-grid">
        {[
          { label: "Taken", value: stats?.totalQuizzesTaken || 0, hint: "Quizzes taken" },
          { label: "Accuracy", value: `${stats?.overallAccuracy || 0}%`, hint: "Overall accuracy" },
          { label: "Average", value: `${stats?.averageScore || 0}%`, hint: "Average score" },
          { label: "Best", value: stats?.bestScore || 0, hint: "Best result" },
        ].map((item) => (
          <div key={item.label} className="stat-card">
            <span className="stat-icon">{item.label}</span>
            <div className="stat-info">
              <h3>{item.value}</h3>
              <p>{item.hint}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <div className="card">
          <h3>Accuracy Distribution</h3>
          <div className="chart-container">
            <Doughnut data={accuracyChartData} />
          </div>
        </div>
        <div className="card">
          <h3>Performance by Category</h3>
          <div className="chart-container">
            <Bar data={categoryChartData} />
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Quiz History</h3>
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
                    <td>{item.accuracy}%</td>
                    <td>{formatDateTimeDDMMYYYYHHMM(item.createdAt || item.attemptedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>No quiz history yet.</p>
            <Link to="/quizzes" className="btn btn-primary">Take a Quiz</Link>
          </div>
        )}
      </div>

      <style>{`
        .progress-page { max-width: 1200px; margin: 0 auto; }
        .page-header { margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
        .page-header h1 { font-size: 2rem; margin-bottom: 5px; }
        .page-header p { color: var(--text-secondary); }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .stat-card {
          background: var(--surface);
          padding: 20px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          gap: 15px;
          box-shadow: var(--shadow-sm);
        }
        .stat-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 62px;
          height: 36px;
          padding: 0 12px;
          border-radius: 999px;
          background: var(--background);
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .stat-info h3 { font-size: 1.5rem; margin-bottom: 2px; }
        .stat-info p { color: var(--text-secondary); font-size: 0.9rem; }
        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .card {
          background: var(--surface);
          padding: 25px;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
        }
        .card h3 { margin-bottom: 20px; }
        .chart-container {
          height: 250px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .history-table { overflow-x: auto; }
        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 768px) {
          .page-header { margin-bottom: 20px; }
          .page-header h1 { font-size: 1.5rem; }
          .stats-grid,
          .charts-grid { grid-template-columns: 1fr; gap: 14px; }
          .stat-card,
          .card { padding: 16px; }
          .chart-container { height: 220px; }
        }
      `}</style>
    </div>
  );
}

export default Progress;
