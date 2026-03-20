import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAdminUsers, toggleAdminUserBlock } from "../services/adminService";

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [busyUserId, setBusyUserId] = useState("");
  const usersPerPage = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(searchTerm, page);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm, page]);

  const fetchUsers = async (search = "", pageNo = 1) => {
    try {
      setLoading(true);
      setErrorMessage("");
      const data = await getAdminUsers({
        page: pageNo,
        limit: usersPerPage,
        search,
      });

      setUsers(data.users || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
      setTotalPages(1);
      setErrorMessage(error.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const toggleBlock = async (userId) => {
    try {
      setBusyUserId(userId);
      setErrorMessage("");
      await toggleAdminUserBlock(userId);
      await fetchUsers(searchTerm, page);
    } catch (error) {
      console.error("Failed to toggle block:", error);
      setErrorMessage(error.message || "Failed to update user status");
    } finally {
      setBusyUserId("");
    }
  };

  return (
    <div className="manage-users">
      <div className="page-header">
        <div>
          <h1>Manage Students</h1>
          <p>View and manage registered students</p>
        </div>
        <Link to="/admin/dashboard" className="btn btn-outline">
          Back to Dashboard
        </Link>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      {loading ? (
        <div className="loading">Loading users...</div>
      ) : (
        <>
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Attempts</th>
                  <th>Avg Score</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${user.role}`}>{user.role}</span>
                    </td>
                    <td>
                      <span className={`badge ${user.blocked ? "blocked" : "active"}`}>
                        {user.blocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td>{user.totalAttempts || 0}</td>
                    <td>{user.averageScore || 0}%</td>
                    <td>
                      <button
                        className={`btn ${user.blocked ? "btn-success" : "btn-danger"}`}
                        onClick={() => toggleBlock(user._id)}
                        disabled={busyUserId === user._id}
                      >
                        {busyUserId === user._id ? "Updating..." : user.blocked ? "Unblock" : "Block"}
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="7" className="no-results">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                Next
              </button>
            </div>
          )}
        </>
      )}

      <style>{`
        .manage-users { max-width: 1200px; margin: 0 auto; }
        .page-header {
          margin-bottom: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .page-header h1 { font-size: 1.75rem; margin-bottom: 5px; }
        .page-header p { color: var(--text-secondary); }
        .search-bar { margin-bottom: 20px; }
        .search-bar input {
          width: 100%;
          max-width: 400px;
          padding: 12px 15px;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          font-size: 1rem;
          background: var(--surface);
          color: var(--text);
        }
        .alert { margin-bottom: 20px; padding: 12px 14px; border-radius: var(--radius-md); }
        .alert-danger { background: #fee; color: var(--danger); border: 1px solid var(--danger); }
        .users-table {
          background: var(--surface);
          border-radius: var(--radius-lg);
          overflow: auto;
        }
        table { width: 100%; border-collapse: collapse; min-width: 760px; }
        th, td { padding: 14px; text-align: left; border-bottom: 1px solid var(--border); }
        th { background: var(--surface-hover); font-weight: 600; }
        .badge {
          padding: 4px 10px;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          font-weight: 500;
          text-transform: capitalize;
        }
        .badge.admin { background: var(--primary); color: white; }
        .badge.user { background: var(--secondary); color: var(--text); }
        .badge.active { background: #d4edda; color: #155724; }
        .badge.blocked { background: #f8d7da; color: #721c24; }
        .btn { padding: 8px 14px; border: none; border-radius: var(--radius-sm); cursor: pointer; font-size: 0.875rem; transition: var(--transition); }
        .btn-danger { background: var(--danger); color: white; }
        .btn-success { background: var(--success); color: white; }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .no-results { text-align: center; color: var(--text-secondary); padding: 24px; }
        .pagination { display: flex; justify-content: center; align-items: center; gap: 15px; margin-top: 20px; }
        .pagination button { padding: 8px 16px; background: var(--primary); color: white; border: none; border-radius: var(--radius-sm); cursor: pointer; }
        .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
        .loading { text-align: center; padding: 40px; color: var(--text-secondary); }
        @media (max-width: 768px) {
          .page-header h1 { font-size: 1.5rem; }
          .page-header .btn { width: 100%; }
          .search-bar input { max-width: 100%; }
          th, td { padding: 10px; }
        }
      `}</style>
    </div>
  );
}

export default ManageUsers;
