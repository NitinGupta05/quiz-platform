import { useEffect, useState } from "react"

function Timer({ seconds, onEnd })
{
  const [time, setTime] = useState(seconds)

  useEffect(() =>
  {
    if (time === 0)
    {
      onEnd()
      return
    }

    const t = setTimeout(() => setTime(time - 1), 1000)
    return () => clearTimeout(t)
  }, [time])

  return <h4>Time Left: {time}s</h4>
}

export default Timer

