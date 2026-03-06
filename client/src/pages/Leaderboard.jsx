import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { formatDateTimeDDMMYYYYHHMM } from "../utils/formatDate";

const API_URL = "http://localhost:5000/api";

function Leaderboard() {
  const { id } = useParams();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quizTitle, setQuizTitle] = useState("");

  useEffect(() => {
    fetchLeaderboard();
  }, [id]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const endpoint = id 
        ? `${API_URL}/quizzes/leaderboard/${id}?limit=10`
        : `${API_URL}/quizzes/leaderboard?limit=10`;
      
      const res = await fetch(endpoint);
      const data = await res.json();
      const sortedTopTen = (data.leaderboard || [])
        .sort((a, b) => b.score - a.score || b.accuracy - a.accuracy || a.timeTaken - b.timeTaken)
        .slice(0, 10)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));

      setLeaderboard(sortedTopTen);
      
      // Get quiz title if specific quiz
      if (id && sortedTopTen.length > 0) {
        setQuizTitle(sortedTopTen[0].quizName || "Quiz");
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="leaderboard-page">
      <div className="page-header">
        <h1>{id ? `Leaderboard: ${quizTitle}` : "Global Leaderboard"}</h1>
        <p>Top 10 performers by highest score</p>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : leaderboard.length > 0 ? (
        <>
          <div className="leaderboard-table">
            <table className="table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>User</th>
                  {id && <th>Quiz</th>}
                  <th>Score</th>
                  <th>Accuracy</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => (
                  <tr key={index} className={index < 3 ? `top-${index + 1}` : ""}>
                    <td>
                      <span className={`rank rank-${index + 1}`}>
                        {index + 1 === 1 ? "🥇" : index + 1 === 2 ? "🥈" : index + 1 === 3 ? "🥉" : entry.rank || index + 1}
                      </span>
                    </td>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">
                          {entry.userImage ? (
                            <img src={entry.userImage} alt={entry.userName} />
                          ) : (
                            <span>{entry.userName?.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <span className="user-name">{entry.userName}</span>
                      </div>
                    </td>
                    {id && <td>{entry.quizName || "Quiz"}</td>}
                    <td>
                      <span className="score">{entry.score}/{entry.total}</span>
                    </td>
                    <td>
                      <span className="accuracy">{entry.accuracy}%</span>
                    </td>
                    <td>{formatDateTimeDDMMYYYYHHMM(entry.attemptedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <p>No leaderboard data available yet.</p>
          <Link to="/quizzes" className="btn btn-primary">Take a Quiz</Link>
        </div>
      )}

      <style>{`
        .leaderboard-page {
          max-width: 1000px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 30px;
        }

        .page-header h1 {
          font-size: 2rem;
          margin-bottom: 5px;
        }

        .page-header p {
          color: var(--text-secondary);
        }

        .leaderboard-table {
          background-color: var(--surface);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-md);
        }

        .rank {
          font-weight: 600;
          font-size: 1.1rem;
        }

        .rank-1 { color: #FFD700; }
        .rank-2 { color: #C0C0C0; }
        .rank-3 { color: #CD7F32; }

        .user-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .user-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .user-avatar span {
          color: white;
          font-weight: 600;
        }

        .user-name {
          font-weight: 500;
        }

        .score {
          font-weight: 600;
          color: var(--primary);
        }

        .accuracy {
          color: var(--text-secondary);
        }

        tr.top-1, tr.top-2, tr.top-3 {
          background-color: var(--background);
        }

        @media (max-width: 768px) {
          .page-header {
            margin-bottom: 20px;
          }

          .page-header h1 {
            font-size: 1.5rem;
          }

          .leaderboard-table {
            overflow-x: auto;
          }

          .table {
            min-width: 640px;
          }

          .user-name {
            max-width: 120px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            display: inline-block;
          }
        }
      `}</style>
    </div>
  );
}

export default Leaderboard;

