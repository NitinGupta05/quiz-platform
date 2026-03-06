import { useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"

function Navbar()
{
  const { user, logout } = useContext(AuthContext)
  const nav = useNavigate()

  function handleLogout()
  {
    logout()
    nav("/")
  }

  return (
    <nav className="navbar">
      <h2 className="logo">Quiz Platform</h2>

      <div className="nav-links">
        {user && user.role === "admin" && (
          <Link to="/admin">Admin</Link>
        )}

        {user && (
          <Link to="/dashboard">Dashboard</Link>
        )}

        {user && (
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  )
}

export default Navbar

