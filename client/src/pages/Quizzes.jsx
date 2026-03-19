import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { API_BASE_URL } from "../config/api";

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
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/quizzes/categories`);
      const data = await res.json();
      setCategories(data || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.category) params.append("category", filters.category);
      if (filters.difficulty) params.append("difficulty", filters.difficulty);
      params.append("page", filters.page);

      const res = await fetch(`${API_BASE_URL}/quizzes?${params}`);
      const data = await res.json();
      setQuizzes(data.quizzes || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (error) {
      console.error("Failed to fetch quizzes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value, page: 1 });
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

  return (
    <div className="quizzes-page">
      <div className="page-header">
        <h1>Available Quizzes</h1>
        <p>Browse and take quizzes to test your knowledge</p>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search quizzes..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="form-input"
          />
        </div>
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
      </div>

      {/* Quizzes Grid */}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : quizzes.length > 0 ? (
        <>
          <div className="quizzes-grid">
            {quizzes.map((quiz) => (
              <div key={quiz._id} className="quiz-card">
                <div className="quiz-card-header">
                  <span className={`badge badge-${quiz.difficulty}`}>{quiz.difficulty}</span>
                  <span className="quiz-time">⏱ {quiz.timeLimit}s</span>
                </div>
                <h3>{quiz.title}</h3>
                <p>{quiz.description || "No description available"}</p>
                <div className="quiz-meta">
                  <span className="quiz-category">{quiz.category}</span>
                  <span className="quiz-attempts">{quiz.totalAttempts || 0} attempts</span>
                </div>
                <button className="btn btn-primary btn-block" onClick={() => handleStartQuiz(quiz._id)}>
                  {user ? "Start Quiz" : "Login to Start"}
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
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
        <div className="empty-state">
          <h3>No Quizzes Found</h3>
          <p>Try adjusting your filters or check back later</p>
        </div>
      )}

      <style>{`
        .quizzes-page { max-width: 1200px; margin: 0 auto; }
        .page-header { margin-bottom: 30px; }
        .page-header h1 { font-size: 2rem; margin-bottom: 5px; }
        
        .filters-bar {
          display: flex;
          gap: 15px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }
        
        .search-box { flex: 1; min-width: 200px; }
        .search-box .form-input { width: 100%; }
        .filters-bar .form-select { width: 180px; }
        
        .quizzes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 25px;
          margin-bottom: 30px;
        }
        
        .quiz-card {
          background: var(--surface);
          padding: 25px;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
          transition: var(--transition);
        }
        
        .quiz-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
        }
        
        .quiz-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .badge-easy { background: #4CAF50; color: white; }
        .badge-medium { background: #FF9800; color: white; }
        .badge-hard { background: #f44336; color: white; }
        
        .quiz-time { color: var(--text-secondary); font-size: 0.9rem; }
        
        .quiz-card h3 { margin-bottom: 10px; }
        .quiz-card p { color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 15px; flex: 1; }
        
        .quiz-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 20px;
        }
        
        .quiz-category {
          background: var(--background);
          padding: 4px 12px;
          border-radius: var(--radius-full);
        }

        @media (max-width: 1024px) {
          .quizzes-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 18px;
          }
        }
        
        @media (max-width: 768px) {
          .page-header {
            margin-bottom: 20px;
          }

          .page-header h1 {
            font-size: 1.5rem;
          }

          .filters-bar { flex-direction: column; }
          .filters-bar .form-select, .search-box { width: 100%; }
          .quizzes-grid { grid-template-columns: 1fr; gap: 14px; }
          .quiz-card { padding: 16px; }
          .quiz-meta { flex-wrap: wrap; gap: 8px; }
        }
      `}</style>
    </div>
  );
}

export default Quizzes;

