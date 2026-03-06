import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

function Quiz() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isTabSwitched, setIsTabSwitched] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const tabSwitchCountRef = useRef(0);

  // Fetch quiz
  useEffect(() => {
    fetchQuiz();
  }, [id]);

  // Timer
  useEffect(() => {
    if (!quiz || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [quiz, timeLeft]);

  // Tab switch detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        tabSwitchCountRef.current += 1;
        setIsTabSwitched(true);
        setShowWarning(true);
        
        // Hide warning after 3 seconds
        setTimeout(() => {
          setShowWarning(false);
        }, 3000);
      }
    };

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "Are you sure you want to leave? Your progress will be lost.";
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Prevent back navigation
  useEffect(() => {
    const preventBack = (e) => {
      e.preventDefault();
      window.history.pushState(null, "", window.location.href);
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", preventBack);

    return () => window.removeEventListener("popstate", preventBack);
  }, []);

  const fetchQuiz = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/quizzes/${id}/exam`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to load quiz");
        navigate("/quizzes");
        return;
      }

      setQuiz(data);
      setTimeLeft(data.timeLimit);
      setAnswers(new Array(data.questions?.length || 0).fill(null));
      startTimeRef.current = Date.now();
    } catch (error) {
      console.error("Failed to fetch quiz:", error);
      alert("Failed to load quiz");
      navigate("/quizzes");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  // REMOVED: handlePrevious - Users cannot go back to previous questions
  // This is intentional to prevent users from changing answers

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    
    setSubmitting(true);
    clearInterval(timerRef.current);

    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/quizzes/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          quizId: id,
          answers,
          timeTaken,
          isTabSwitched: tabSwitchCountRef.current > 0,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("lastQuizSubmissionAt", new Date().toISOString());
        window.dispatchEvent(
          new CustomEvent("quiz-submitted", {
            detail: {
              quizId: id,
              resultId: data.result._id,
            },
          })
        );

        navigate(`/result/${data.result._id}`, {
          state: {
            quizId: id,
            resultId: data.result._id,
            score: data.result.score,
            total: data.result.totalQuestions,
            correct: data.result.correctAnswers,
            wrong: data.result.wrongAnswers,
            accuracy: data.result.accuracy,
            timeTaken: data.result.timeTaken,
            isTabSwitched: tabSwitchCountRef.current > 0,
          },
        });
      } else {
        alert(data.message || "Failed to submit quiz");
        navigate("/quizzes");
      }
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      alert("Failed to submit quiz. Please try again.");
      navigate("/quizzes");
    } finally {
      setSubmitting(false);
    }
  }, [answers, id, navigate, submitting]);

  if (loading) {
    return (
      <div className="quiz-page loading-screen">
        <div className="spinner"></div>
        <p>Loading quiz...</p>
      </div>
    );
  }

  if (!quiz || !quiz.questions) {
    return (
      <div className="quiz-page">
        <p>Quiz not found</p>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const totalQuestions = quiz.questions.length;
  const answeredCount = answers.filter((a) => a !== null).length;

  return (
    <div className="quiz-page">
      {/* Tab Switch Warning */}
      {showWarning && (
        <div className="tab-warning">
          ⚠️ Warning: You switched tabs during the quiz! This has been recorded.
        </div>
      )}

      {/* Quiz Header */}
      <div className="quiz-header">
        <div className="quiz-title">{quiz.title}</div>
        <div className="quiz-timer">
          <span className="timer-icon"></span>
          ⏱<span className={`timer-value ${timeLeft < 30 ? "warning" : ""}`}>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
        ></div>
      </div>

      {/* Question */}
      <div className="question-container">
        <div className="question-header">
          <span className="question-number">
            Question {currentQuestion + 1} of {totalQuestions}
          </span>
          <span className="answered-count">
            {answeredCount} answered
          </span>
        </div>

        <h2 className="question-text">{question.question}</h2>

        <div className="options">
          {question.options.map((option, index) => (
            <button
              key={index}
              className={`option-btn ${answers[currentQuestion] === index ? "selected" : ""}`}
              onClick={() => handleAnswerSelect(index)}
            >
              <span className="option-letter">
                {String.fromCharCode(65 + index)}
              </span>
              <span className="option-text">{option}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="quiz-navigation">
        {/* Previous button removed - users cannot go back to previous questions */}

        <div className="question-dots">
          {quiz.questions.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentQuestion ? "active" : ""} ${
                answers[index] !== null ? "answered" : ""
              } ${index < currentQuestion ? "completed" : ""}`}
              onClick={() => {
                // Only allow going to current or future questions (not previous)
                if (index >= currentQuestion) {
                  setCurrentQuestion(index);
                }
              }}
              disabled={index < currentQuestion}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {currentQuestion === totalQuestions - 1 ? (
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Quiz"}
          </button>
        ) : (
          <button className="btn btn-primary" onClick={handleNext}>
            Next
          </button>
        )}
      </div>

      <style>{`
        .quiz-page {
          min-height: 100vh;
          background-color: var(--background);
          padding: 0;
        }

        .loading-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 15px;
        }

        .tab-warning {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background-color: var(--warning);
          color: white;
          text-align: center;
          padding: 10px;
          z-index: 1000;
          font-weight: 500;
        }

        .quiz-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 30px;
          background-color: var(--surface);
          box-shadow: var(--shadow-sm);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .quiz-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text);
        }

        .quiz-timer {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text);
        }

        .timer-value.warning {
          color: var(--danger);
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .progress-bar {
          height: 4px;
          background-color: var(--border);
        }

        .progress-fill {
          height: 100%;
          background-color: var(--primary);
          transition: width 0.3s ease;
        }

        .question-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .question-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          color: var(--text-secondary);
        }

        .question-text {
          font-size: 1.5rem;
          margin-bottom: 30px;
          line-height: 1.5;
          color: var(--text);
        }

        .options {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .option-btn {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 18px 20px;
          border: 2px solid var(--border);
          border-radius: var(--radius-lg);
          background-color: var(--surface);
          color: var(--text);
          cursor: pointer;
          transition: var(--transition);
          text-align: left;
        }

        .option-btn:hover {
          border-color: var(--primary);
          background-color: var(--surface-hover);
        }

        .option-btn.selected {
          border-color: var(--primary);
          background-color: color-mix(in srgb, var(--primary) 20%, var(--surface));
        }

        .option-letter {
          width: 35px;
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background-color: var(--background);
          color: var(--text);
          font-weight: 600;
          flex-shrink: 0;
        }

        .option-btn.selected .option-letter {
          background-color: var(--primary);
          color: white;
        }

        .option-text {
          font-size: 1rem;
        }

        .quiz-navigation {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 30px;
          background-color: var(--surface);
          border-top: 1px solid var(--border);
          position: sticky;
          bottom: 0;
        }

        .question-dots {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .dot {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 2px solid var(--border);
          background-color: var(--surface);
          color: var(--text);
          cursor: pointer;
          font-size: 0.8rem;
          transition: var(--transition);
        }

        .dot.answered {
          background-color: var(--primary);
          border-color: var(--primary);
          color: white;
        }

        .dot.active {
          border-color: var(--primary);
          transform: scale(1.1);
        }

        .dot.completed {
          background-color: var(--secondary);
          border-color: var(--secondary);
          opacity: 0.7;
        }

        .dot:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        @media (max-width: 768px) {
          .quiz-header {
            padding: 15px;
          }

          .question-dots {
            display: none;
          }

          .question-text {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
}

export default Quiz;

