import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { formatDateTimeDDMMYYYYHHMM } from "../utils/formatDate";
import { getLeaderboard } from "../services/quizService";

const medalMeta = {
  1: { label: "Champion", icon: "Crown", accent: "gold" },
  2: { label: "Runner-up", icon: "Spark", accent: "silver" },
  3: { label: "Third place", icon: "Star", accent: "bronze" },
};

function Leaderboard() {
  const { id } = useParams();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quizTitle, setQuizTitle] = useState("");

  useEffect(() => {
    async function fetchLeaderboardData() {
      setLoading(true);
      try {
        const data = await getLeaderboard(id || "", 10);
        const sortedTopTen = (data.leaderboard || [])
          .sort((a, b) => b.score - a.score || b.accuracy - a.accuracy || a.timeTaken - b.timeTaken)
          .slice(0, 10)
          .map((entry, index) => ({ ...entry, rank: index + 1 }));

        setLeaderboard(sortedTopTen);

        if (id && sortedTopTen.length > 0) {
          setQuizTitle(sortedTopTen[0].quizName || "Quiz");
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboardData();
  }, [id]);

  const topThree = useMemo(() => leaderboard.slice(0, 3), [leaderboard]);
  const remainingEntries = useMemo(() => leaderboard.slice(3), [leaderboard]);

  const renderMiniIcon = (type) => {
    if (type === "Crown") {
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 18h16l-1.3-8-4.2 3.1L12 6 9.5 13.1 5.3 10 4 18Z" fill="currentColor" />
        </svg>
      );
    }

    if (type === "Spark") {
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m12 3 2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2L12 3Z" fill="currentColor" />
        </svg>
      );
    }

    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.2 6.4 20.2l1.1-6.2L3 9.6l6.2-.9L12 3Z" fill="currentColor" />
      </svg>
    );
  };

  return (
    <div className="leaderboard-page">
      <section className="leaderboard-hero">
        <div className="hero-copy">
          <span className="eyebrow">Top performers</span>
          <h1>{id ? `${quizTitle} leaderboard` : "Global leaderboard"}</h1>
          <p>
            Rankings are ordered by highest score, then accuracy, then faster completion time.
            The top three get a featured podium.
          </p>
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-label">Visible ranks</span>
            <strong>{leaderboard.length}</strong>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-label">Mode</span>
            <strong>{id ? "Quiz-specific" : "Platform-wide"}</strong>
          </div>
        </div>
      </section>

      <div className="range-pills" aria-label="Leaderboard range selector">
        <button type="button" className="range-pill">Weekly</button>
        <button type="button" className="range-pill active">All Time</button>
        <button type="button" className="range-pill">Monthly</button>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : leaderboard.length > 0 ? (
        <>
          <section className="podium-strip">
            {topThree.map((entry, index) => {
              const meta = medalMeta[entry.rank] || medalMeta[index + 1];
              return (
                <article
                  key={`${entry.userName}-${entry.rank}`}
                  className={`podium-card ${meta.accent}`}
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <div className="podium-icon">{renderMiniIcon(meta.icon)}</div>
                  <span className="podium-label">{meta.label}</span>
                  <div className="podium-avatar">
                    {entry.userImage ? (
                      <img src={entry.userImage} alt={entry.userName} />
                    ) : (
                      <span>{entry.userName?.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <h2>{entry.userName}</h2>
                  <strong className="podium-score">{entry.score}/{entry.total}</strong>
                  <p>{entry.accuracy}% accuracy</p>
                </article>
              );
            })}
          </section>

          <section className="leaderboard-table-shell">
            <div className="table-shell-header">
              <div>
                <h2>Rankings</h2>
                <p>Everyone else on the board, in order.</p>
              </div>
              <Link to="/quizzes" className="btn btn-outline btn-sm">
                Try a Quiz
              </Link>
            </div>

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
                  {remainingEntries.length > 0 ? (
                    remainingEntries.map((entry, index) => (
                      <tr
                        key={`${entry.userName}-${entry.rank}`}
                        className="animated-row"
                        style={{ animationDelay: `${index * 70}ms` }}
                      >
                        <td>
                          <span className="rank-badge">#{entry.rank}</span>
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
                        <td><span className="score">{entry.score}/{entry.total}</span></td>
                        <td><span className="accuracy">{entry.accuracy}%</span></td>
                        <td>{formatDateTimeDDMMYYYYHHMM(entry.attemptedAt)}</td>
                      </tr>
                    ))
                  ) : (
                    leaderboard.map((entry, index) => (
                      <tr
                        key={`${entry.userName}-${entry.rank}`}
                        className="animated-row"
                        style={{ animationDelay: `${index * 70}ms` }}
                      >
                        <td>
                          <span className="rank-badge">#{entry.rank || index + 1}</span>
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
                        <td><span className="score">{entry.score}/{entry.total}</span></td>
                        <td><span className="accuracy">{entry.accuracy}%</span></td>
                        <td>{formatDateTimeDDMMYYYYHHMM(entry.attemptedAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : (
        <div className="empty-state leaderboard-empty-state">
          <h3>No leaderboard data available yet</h3>
          <p>Take a quiz and become the first name on the board.</p>
          <Link to="/quizzes" className="btn btn-primary">Take a Quiz</Link>
        </div>
      )}

      <style>{`
        .leaderboard-page {
          max-width: 1120px;
          margin: 0 auto;
          display: grid;
          gap: 24px;
        }
        .leaderboard-hero,
        .leaderboard-table-shell,
        .podium-card {
          border: 1px solid rgba(15, 23, 42, 0.06);
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
        }
        .leaderboard-hero {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 18px;
          padding: 28px;
          border-radius: 28px;
          background:
            radial-gradient(circle at top right, rgba(57, 215, 196, 0.22), transparent 26%),
            linear-gradient(160deg, #071c67, #0a2e86 62%, #0b2470);
          color: #ffffff;
        }
        .leaderboard-hero p,
        .leaderboard-hero h1 {
          color: #ffffff;
        }
        .eyebrow {
          display: inline-flex;
          align-items: center;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.12);
          color: #ffd37a;
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 14px;
        }
        .hero-copy h1 {
          font-size: clamp(2rem, 4vw, 3rem);
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .hero-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
          align-self: stretch;
        }
        .hero-stat {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 20px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 6px;
          backdrop-filter: blur(12px);
        }
        .hero-stat-label {
          color: rgba(255, 255, 255, 0.72);
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 700;
        }
        .hero-stat strong {
          font-size: 1.5rem;
          color: #ffffff;
        }
        .range-pills {
          width: fit-content;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px;
          border-radius: 999px;
          background: linear-gradient(135deg, #082153, #0b2f79);
          border: 1px solid rgba(79, 209, 197, 0.42);
          box-shadow: 0 16px 28px rgba(7, 28, 103, 0.26);
        }
        .range-pill {
          min-width: 116px;
          height: 44px;
          border-radius: 999px;
          border: none;
          background: transparent;
          color: rgba(255, 255, 255, 0.84);
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease;
        }
        .range-pill:hover {
          transform: translateY(-1px);
        }
        .range-pill.active {
          background: linear-gradient(135deg, #2ad2b8, #4fd1c5);
          color: #083c49;
          box-shadow: 0 10px 20px rgba(42, 210, 184, 0.28);
        }
        .podium-strip {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }
        .podium-card {
          background: linear-gradient(180deg, #0f2d78, #14378e);
          border-radius: 24px;
          padding: 22px;
          text-align: center;
          animation: cardFloatIn 0.55s ease both;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          color: #ffffff;
        }
        .podium-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 24px 44px rgba(15, 23, 42, 0.12);
        }
        .podium-card.gold {
          background: linear-gradient(180deg, #2144a3, #10307f);
        }
        .podium-card.silver {
          background: linear-gradient(180deg, #17378f, #0c2b74);
        }
        .podium-card.bronze {
          background: linear-gradient(180deg, #17378f, #0c2b74);
        }
        .podium-icon {
          width: 58px;
          height: 58px;
          margin: 0 auto 10px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: rgba(255, 255, 255, 0.14);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: inset 0 -10px 18px rgba(0, 0, 0, 0.12);
        }
        .podium-icon svg {
          width: 26px;
          height: 26px;
        }
        .podium-label {
          display: inline-block;
          margin-bottom: 14px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.82rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .podium-avatar,
        .user-avatar {
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: #fff;
          font-weight: 700;
        }
        .podium-avatar {
          width: 74px;
          height: 74px;
          margin: 0 auto 14px;
          border-radius: 22px;
          box-shadow: 0 14px 26px rgba(15, 118, 110, 0.2);
        }
        .podium-avatar img,
        .user-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .podium-card h2 {
          font-size: 1.2rem;
          margin-bottom: 8px;
        }
        .podium-score {
          display: block;
          font-size: 1.8rem;
          margin-bottom: 4px;
          color: #ffffff;
        }
        .leaderboard-table-shell {
          background: linear-gradient(180deg, var(--surface), var(--background-elevated));
          border-radius: 28px;
          padding: 24px;
        }
        .table-shell-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 18px;
        }
        .table-shell-header h2 {
          margin-bottom: 4px;
        }
        .leaderboard-table {
          background-color: var(--surface);
          border-radius: 22px;
          overflow: hidden;
          border: 1px solid rgba(15, 23, 42, 0.05);
        }
        .animated-row {
          animation: rowFadeIn 0.45s ease both;
        }
        .rank-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 56px;
          height: 34px;
          padding: 0 12px;
          border-radius: 999px;
          background: var(--surface-muted);
          color: var(--text);
          font-weight: 700;
        }
        .user-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .user-avatar {
          width: 42px;
          height: 42px;
          border-radius: 14px;
        }
        .user-name {
          font-weight: 600;
        }
        .score {
          font-weight: 700;
          color: var(--primary-dark);
        }
        .accuracy {
          color: var(--text-secondary);
          font-weight: 600;
        }
        .leaderboard-empty-state {
          max-width: 760px;
          margin: 0 auto;
        }
        @keyframes cardFloatIn {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes rowFadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (max-width: 900px) {
          .leaderboard-hero,
          .podium-strip {
            grid-template-columns: 1fr;
          }
          .hero-stats {
            grid-template-columns: 1fr 1fr;
          }
          .range-pills {
            width: 100%;
            justify-content: stretch;
          }
          .range-pill {
            flex: 1;
            min-width: 0;
          }
        }
        @media (max-width: 768px) {
          .leaderboard-page {
            gap: 18px;
          }
          .leaderboard-hero,
          .leaderboard-table-shell,
          .podium-card {
            padding: 18px;
            border-radius: 22px;
          }
          .table-shell-header {
            flex-direction: column;
            align-items: flex-start;
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
        @media (max-width: 520px) {
          .hero-stats {
            grid-template-columns: 1fr;
          }
          .range-pills {
            gap: 6px;
            padding: 6px;
          }
          .range-pill {
            height: 40px;
            font-size: 0.88rem;
          }
        }
      `}</style>
    </div>
  );
}

export default Leaderboard;
