import { useState, useEffect, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getQuizCategories, getQuizzes } from "../services/quizService";

const difficultyMeta = {
  easy: { label: "Easy", tone: "easy", tag: "Warmup" },
  medium: { label: "Medium", tone: "medium", tag: "Balanced" },
  hard: { label: "Hard", tone: "hard", tag: "Challenge" },
};

function Quizzes() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    difficulty: "",
    page: 1,
  });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await getQuizCategories();
        setCategories(data || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    }

    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchQuizList() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.search) params.append("search", filters.search);
        if (filters.category) params.append("category", filters.category);
        if (filters.difficulty) params.append("difficulty", filters.difficulty);
        params.append("page", filters.page);

        const data = await getQuizzes(params.toString());
        setQuizzes(data.quizzes || []);
        setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
      } catch (error) {
        console.error("Failed to fetch quizzes:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchQuizList();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const resetFilters = () => {
    setFilters({ search: "", category: "", difficulty: "", page: 1 });
  };

  const handleStartQuiz = (quizId) => {
    if (!user) {
      navigate("/login", {
        state: {
          from: `/quiz/${quizId}/start`,
          quizAttempt: true,
        },
      });
      return;
    }

    navigate(`/quiz/${quizId}/start`);
  };

  const quickStats = useMemo(() => {
    const easyCount = quizzes.filter((quiz) => quiz.difficulty === "easy").length;
    const hardCount = quizzes.filter((quiz) => quiz.difficulty === "hard").length;

    return [
      { label: "Available", value: pagination.total || quizzes.length, helper: "Total quizzes" },
      { label: "Categories", value: categories.length, helper: "Topic spread" },
      { label: "Easy", value: easyCount, helper: "Warmup picks" },
      { label: "Hard", value: hardCount, helper: "Challenge picks" },
    ];
  }, [categories.length, pagination.total, quizzes]);

  return (
    <div className="quizzes-page">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">Quiz Library</span>
          <h1>Choose a quiz that matches your pace</h1>
          <p>
            Explore curated quizzes by category and difficulty, then jump straight into a focused
            timed session with clean progress tracking.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={resetFilters}>Reset Filters</button>
            {!user && (
              <button className="btn btn-outline" onClick={() => navigate("/register")}>Create Free Account</button>
            )}
          </div>
        </div>

        <div className="stats-panel">
          {quickStats.map((item) => (
            <div key={item.label} className="stat-tile">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <p>{item.helper}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="filters-panel card">
        <div className="filters-head">
          <div>
            <h2>Refine Results</h2>
            <p>Filter by keyword, category, or difficulty to narrow the list fast.</p>
          </div>
          <span className="results-pill">{pagination.total || quizzes.length} results</span>
        </div>

        <div className="filters-grid">
          <label className="filter-field search-field">
            <span>Search</span>
            <input
              type="text"
              placeholder="Search quizzes by title or description"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="form-input"
            />
          </label>

          <label className="filter-field">
            <span>Category</span>
            <select
              className="form-select"
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </label>

          <label className="filter-field">
            <span>Difficulty</span>
            <select
              className="form-select"
              value={filters.difficulty}
              onChange={(e) => handleFilterChange("difficulty", e.target.value)}
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>
        </div>
      </section>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : quizzes.length > 0 ? (
        <>
          <section className="quizzes-grid">
            {quizzes.map((quiz) => {
              const meta = difficultyMeta[quiz.difficulty] || difficultyMeta.medium;
              return (
                <article key={quiz._id} className="quiz-card-modern">
                  <div className="card-top">
                    <div className="card-badges">
                      <span className={`difficulty-chip ${meta.tone}`}>{meta.label}</span>
                      <span className="meta-chip">{meta.tag}</span>
                    </div>
                    <span className="time-chip">{quiz.timeLimit}s</span>
                  </div>

                  <div className="card-body">
                    <div className="category-row">
                      <span className="icon-chip">Topic</span>
                      <span className="category-name">{quiz.category}</span>
                    </div>
                    <h3>{quiz.title}</h3>
                    <p>{quiz.description || "A focused quiz session with timed questions and instant scoring."}</p>
                  </div>

                  <div className="card-metrics">
                    <div>
                      <span>Attempts</span>
                      <strong>{quiz.totalAttempts || 0}</strong>
                    </div>
                    <div>
                      <span>Mode</span>
                      <strong>Timed</strong>
                    </div>
                    <div>
                      <span>Access</span>
                      <strong>{user ? "Ready" : "Login"}</strong>
                    </div>
                  </div>

                  <button className="btn btn-primary btn-block" onClick={() => handleStartQuiz(quiz._id)}>
                    {user ? "Start Quiz" : "Login to Start"}
                  </button>
                </article>
              );
            })}
          </section>

          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => handleFilterChange("page", filters.page - 1)}
                disabled={filters.page === 1}
              >
                Previous
              </button>
              <span>Page {filters.page} of {pagination.pages}</span>
              <button
                className="pagination-btn"
                onClick={() => handleFilterChange("page", filters.page + 1)}
                disabled={filters.page === pagination.pages}
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state quiz-empty-state">
          <h3>No quizzes match the current filters</h3>
          <p>Try a broader search or reset the filters to explore the full library.</p>
          <button className="btn btn-primary" onClick={resetFilters}>Reset Filters</button>
        </div>
      )}

      <style>{`
        .quizzes-page {
          max-width: var(--page-width);
          margin: 0 auto;
          display: grid;
          gap: 24px;
        }
        .hero-panel {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 20px;
          align-items: stretch;
        }
        .hero-copy,
        .stats-panel,
        .quiz-card-modern {
          border: 1px solid rgba(15, 23, 42, 0.05);
          box-shadow: 0 20px 44px rgba(15, 23, 42, 0.08);
        }
        .hero-copy {
          background: linear-gradient(135deg, #133b39, #0f766e);
          color: #f5fbfa;
          border-radius: 28px;
          padding: 34px;
        }
        .eyebrow {
          display: inline-block;
          margin-bottom: 10px;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: rgba(245, 251, 250, 0.78);
          font-weight: 700;
        }
        .hero-copy h1 {
          font-size: clamp(2rem, 4vw, 3.3rem);
          line-height: 1.08;
          margin-bottom: 14px;
        }
        .hero-copy p {
          color: rgba(245, 251, 250, 0.84);
          font-size: 1rem;
          max-width: 52ch;
        }
        .hero-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
          flex-wrap: wrap;
        }
        .hero-actions .btn-outline {
          background: rgba(255,255,255,0.08);
          color: #f5fbfa;
          border-color: rgba(255,255,255,0.24);
        }
        .hero-actions .btn-outline:hover {
          background: rgba(255,255,255,0.14);
          color: #ffffff;
          border-color: rgba(255,255,255,0.34);
        }
        .stats-panel {
          background: linear-gradient(180deg, var(--surface), var(--background-elevated));
          border-radius: 28px;
          padding: 18px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }
        .stat-tile {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 18px;
        }
        .stat-tile span {
          display: block;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-size: 0.74rem;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .stat-tile strong {
          display: block;
          font-size: 2rem;
          color: var(--text);
          margin-bottom: 4px;
        }
        .stat-tile p { font-size: 0.88rem; }
        .filters-panel { padding: 24px; background: var(--panel-bg); backdrop-filter: blur(12px); }
        .filters-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 18px;
          align-items: flex-start;
          flex-wrap: wrap;
        }
        .filters-head h2 { font-size: 1.2rem; margin-bottom: 4px; }
        .results-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 38px;
          padding: 0 14px;
          border-radius: var(--radius-full);
          background: var(--primary-soft);
          color: var(--primary-dark);
          font-weight: 700;
          font-size: 0.82rem;
        }
        .filters-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr;
          gap: 16px;
        }
        .filter-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .filter-field span {
          color: var(--text);
          font-weight: 700;
          font-size: 0.88rem;
        }
        .quizzes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 22px;
        }
        .quiz-card-modern {
          background: linear-gradient(180deg, var(--surface), var(--background-elevated));
          border-radius: 24px;
          padding: 22px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .quiz-card-modern:hover {
          transform: translateY(-4px);
          box-shadow: 0 24px 46px rgba(15, 23, 42, 0.12);
        }
        .card-top,
        .card-badges,
        .category-row,
        .card-metrics {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .card-top { justify-content: space-between; }
        .difficulty-chip,
        .meta-chip,
        .time-chip {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 34px;
          padding: 0 12px;
          border-radius: var(--radius-full);
          font-size: 0.78rem;
          font-weight: 700;
        }
        .difficulty-chip.easy { background: rgba(47,133,90,0.12); color: #276749; }
        .difficulty-chip.medium { background: rgba(183,121,31,0.14); color: #975a16; }
        .difficulty-chip.hard { background: rgba(197,48,48,0.12); color: #9b2c2c; }
        .meta-chip { background: var(--surface-muted); color: var(--text-secondary); }
        .time-chip { background: var(--primary-soft); color: var(--primary-dark); }
        .category-name {
          color: var(--text-secondary);
          font-weight: 700;
          font-size: 0.9rem;
        }
        .card-body h3 {
          font-size: 1.35rem;
          margin: 10px 0 8px;
          color: var(--text);
        }
        .card-body p {
          font-size: 0.96rem;
          color: var(--text-secondary);
          min-height: 72px;
        }
        .card-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .card-metrics div {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 14px;
        }
        .card-metrics span {
          display: block;
          color: var(--text-secondary);
          font-size: 0.8rem;
          margin-bottom: 4px;
        }
        .card-metrics strong {
          color: var(--text);
          font-size: 1rem;
        }
        .quiz-empty-state { max-width: 760px; margin: 0 auto; }
        @media (max-width: 1100px) {
          .hero-panel,
          .filters-grid {
            grid-template-columns: 1fr;
          }
          .stats-panel { grid-template-columns: repeat(4, 1fr); }
        }
        @media (max-width: 768px) {
          .hero-copy { padding: 22px; }
          .stats-panel { grid-template-columns: repeat(2, 1fr); }
          .quizzes-grid { grid-template-columns: 1fr; }
          .card-metrics { grid-template-columns: 1fr; }
          .filters-panel { padding: 18px; }
        }
        @media (max-width: 520px) {
          .stats-panel { grid-template-columns: 1fr; }
          .hero-actions .btn { width: 100%; }
        }
      `}</style>
    </div>
  );
}

export default Quizzes;
