import { useNavigate } from "react-router-dom"

function QuizCard({ quiz })
{
  const nav = useNavigate()

  return (
    <div>
      <h3>{quiz.title}</h3>
      <p>Time: {quiz.time} mins</p>
      <button onClick={() => nav(`/quiz/${quiz.id}`)}>
        Start
      </button>
    </div>
  )
}

export default QuizCard

