import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config/api";

function createEmptyQuestion() {
  return {
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
  };
}

function ManageQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "General",
    difficulty: "medium",
    timeLimit: 60,
    questions: [],
  });
  const [currentQuestion, setCurrentQuestion] = useState(createEmptyQuestion());

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/quizzes/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setQuizzes(data || []);
    } catch (error) {
      console.error("Failed to fetch quizzes:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingQuiz(null);
    setCurrentQuestion(createEmptyQuestion());
    setFormData({
      title: "",
      description: "",
      category: "General",
      difficulty: "medium",
      timeLimit: 60,
      questions: [],
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this quiz?")) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE_URL}/quizzes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchQuizzes();
    } catch (error) {
      alert("Failed to delete quiz");
    }
  };

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setCurrentQuestion((prev) => ({
      ...prev,
      [name]: name === "correctAnswer" ? parseInt(value, 10) : value,
    }));
  };

  const handleOptionChange = (index, value) => {
    setCurrentQuestion((prev) => {
      const options = [...prev.options];
      options[index] = value;
      return { ...prev, options };
    });
  };

  const addQuestion = () => {
    if (!currentQuestion.question.trim() || currentQuestion.options.some((o) => !o.trim())) {
      alert("Please fill in all question fields.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, { ...currentQuestion }],
    }));
    setCurrentQuestion(createEmptyQuestion());
  };

  const updateExistingQuestion = (questionIndex, key, value) => {
    setFormData((prev) => {
      const questions = [...prev.questions];
      if (key === "correctAnswer") {
        questions[questionIndex][key] = parseInt(value, 10);
      } else {
        questions[questionIndex][key] = value;
      }
      return { ...prev, questions };
    });
  };

  const updateExistingOption = (questionIndex, optionIndex, value) => {
    setFormData((prev) => {
      const questions = [...prev.questions];
      const options = [...(questions[questionIndex].options || [])];
      options[optionIndex] = value;
      questions[questionIndex].options = options;
      return { ...prev, questions };
    });
  };

  const removeQuestion = (questionIndex) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, index) => index !== questionIndex),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || formData.questions.length === 0) {
      alert("Please provide a title and at least one question.");
      return;
    }

    const hasInvalidQuestion = formData.questions.some(
      (q) =>
        !q.question?.trim() ||
        !Array.isArray(q.options) ||
        q.options.length < 2 ||
        q.options.some((opt) => !String(opt).trim()) ||
        Number.isNaN(parseInt(q.correctAnswer, 10))
    );

    if (hasInvalidQuestion) {
      alert("Each question must have text, non-empty options, and a valid correct answer.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const method = editingQuiz ? "PUT" : "POST";
      const url = editingQuiz ? `${API_BASE_URL}/quizzes/${editingQuiz._id}` : `${API_BASE_URL}/quizzes`;

      await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          timeLimit: parseInt(formData.timeLimit, 10),
          questions: formData.questions.map((q) => ({
            ...q,
            correctAnswer: parseInt(q.correctAnswer, 10),
          })),
        }),
      });

      resetForm();
      fetchQuizzes();
    } catch (error) {
      alert("Failed to save quiz");
    }
  };

  const handleEdit = (quiz) => {
    setEditingQuiz(quiz);
    setFormData({
      title: quiz.title || "",
      description: quiz.description || "",
      category: quiz.category || "General",
      difficulty: quiz.difficulty || "medium",
      timeLimit: quiz.timeLimit || 60,
      questions: (quiz.questions || []).map((q) => ({
        question: q.question || "",
        options: Array.isArray(q.options) ? q.options : ["", "", "", ""],
        correctAnswer: parseInt(q.correctAnswer, 10) || 0,
      })),
    });
    setCurrentQuestion(createEmptyQuestion());
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="manage-quizzes">
      <div className="page-header">
        <h1>Manage Quizzes</h1>
        <div className="header-actions">
          <Link to="/admin/dashboard" className="btn btn-outline">
            Back to Dashboard
          </Link>
          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            Create Quiz
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card form-card">
          <h2>{editingQuiz ? "Edit Quiz" : "Create New Quiz"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-input"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Difficulty</label>
                <select
                  className="form-select"
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Time (seconds)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.timeLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, timeLimit: parseInt(e.target.value, 10) || 60 })
                  }
                  required
                />
              </div>
            </div>

            <hr />

            <h3>Existing Questions ({formData.questions.length})</h3>
            {formData.questions.length === 0 && (
              <p className="empty-questions">No questions added yet.</p>
            )}

            {formData.questions.map((question, questionIndex) => (
              <div key={questionIndex} className="question-editor">
                <div className="question-header">
                  <strong>Question {questionIndex + 1}</strong>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => removeQuestion(questionIndex)}
                  >
                    Delete
                  </button>
                </div>

                <div className="form-group">
                  <label className="form-label">Question</label>
                  <input
                    type="text"
                    className="form-input"
                    value={question.question}
                    onChange={(e) => updateExistingQuestion(questionIndex, "question", e.target.value)}
                  />
                </div>

                <div className="options-grid">
                  {(question.options || []).map((option, optionIndex) => (
                    <div key={optionIndex} className="form-group">
                      <label className="form-label">Option {optionIndex + 1}</label>
                      <input
                        type="text"
                        className="form-input"
                        value={option}
                        onChange={(e) => updateExistingOption(questionIndex, optionIndex, e.target.value)}
                      />
                    </div>
                  ))}
                </div>

                <div className="form-group">
                  <label className="form-label">Correct Answer</label>
                  <select
                    className="form-select"
                    value={question.correctAnswer}
                    onChange={(e) =>
                      updateExistingQuestion(questionIndex, "correctAnswer", e.target.value)
                    }
                  >
                    {(question.options || []).map((opt, index) => (
                      <option key={index} value={index}>
                        Option {index + 1}: {opt || "(empty)"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}

            <hr />

            <h3>Add New Question</h3>
            <div className="form-group">
              <label className="form-label">Question</label>
              <input
                type="text"
                className="form-input"
                name="question"
                value={currentQuestion.question}
                onChange={handleQuestionChange}
                placeholder="Enter question"
              />
            </div>

            <div className="options-grid">
              {currentQuestion.options.map((opt, i) => (
                <div key={i} className="form-group">
                  <label className="form-label">Option {i + 1}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={opt}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                  />
                </div>
              ))}
            </div>

            <div className="form-group">
              <label className="form-label">Correct Answer</label>
              <select
                className="form-select"
                value={currentQuestion.correctAnswer}
                onChange={handleQuestionChange}
                name="correctAnswer"
              >
                {currentQuestion.options.map((opt, i) => (
                  <option key={i} value={i}>
                    Option {i + 1}: {opt || "(empty)"}
                  </option>
                ))}
              </select>
            </div>

            <button type="button" className="btn btn-outline" onClick={addQuestion}>
              Add Question
            </button>

            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingQuiz ? "Update Quiz" : "Create Quiz"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="quizzes-list">
        {quizzes.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Difficulty</th>
                <th>Questions</th>
                <th>Attempts</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz) => (
                <tr key={quiz._id}>
                  <td>{quiz.title}</td>
                  <td>{quiz.category}</td>
                  <td>
                    <span className={`badge badge-${quiz.difficulty}`}>{quiz.difficulty}</span>
                  </td>
                  <td>{quiz.questions?.length || 0}</td>
                  <td>{quiz.totalAttempts || 0}</td>
                  <td className="table-actions">
                    <button className="btn btn-sm btn-outline" onClick={() => handleEdit(quiz)}>
                      Edit
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(quiz._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p>No quizzes available</p>
          </div>
        )}
      </div>

      <style>{`
        .manage-quizzes { max-width: 1200px; margin: 0 auto; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; gap: 12px; flex-wrap: wrap; }
        .header-actions { display: flex; gap: 10px; }
        .page-header h1 { font-size: 2rem; }
        .form-card { margin-bottom: 30px; }
        .form-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
        .options-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
        .form-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
        .question-editor { border: 1px solid var(--border); border-radius: var(--radius-md); padding: 14px; margin-bottom: 12px; background: var(--background); }
        .question-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .empty-questions { color: var(--text-secondary); margin-bottom: 10px; }
        .table-actions { display: flex; gap: 8px; }
        hr { margin: 20px 0; border-color: var(--border); }
        h3 { margin-bottom: 12px; }
        .badge-easy { background: #4CAF50; color: white; }
        .badge-medium { background: #FF9800; color: white; }
        .badge-hard { background: #f44336; color: white; }
        .quizzes-list { overflow: auto; }
        .table { min-width: 760px; }
        @media (max-width: 768px) {
          .page-header h1 {
            font-size: 1.5rem;
          }

          .header-actions {
            width: 100%;
            flex-wrap: wrap;
          }

          .header-actions .btn {
            flex: 1;
            min-width: 140px;
          }

          .form-row { grid-template-columns: 1fr; }
          .options-grid { grid-template-columns: 1fr; }
          .form-actions {
            justify-content: stretch;
            flex-direction: column;
          }
          .form-actions .btn {
            width: 100%;
          }
          .question-header {
            flex-wrap: wrap;
            gap: 8px;
          }
          .table-actions {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
}

export default ManageQuizzes;
