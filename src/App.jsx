import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [pageLoading, setPageLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(6);

  const [userToDelete, setUserToDelete] = useState(null);

  const filteredUsers = users
    .filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return a.name.localeCompare(b.name);
      }

      return b.name.localeCompare(a.name);
    });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;

  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  );

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const fetchUsers = () => {
    setMessage("");
    setPageLoading(true);

    axios
      .get(`${import.meta.env.VITE_API_URL}/api/users`)
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.log(error);
        setMessage("Unable to load users");
      })
      .finally(() => {
        setPageLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Function to add a new user

  function addUser() {
    setMessage("");
    setLoading(true);

    const newUser = {
      name: name,
      email: email,
    };

    // Function to add a new user
    axios
      .post(`${import.meta.env.VITE_API_URL}/api/users`, newUser)
      .then((response) => {
        setUsers([...users, response.data]);
        setName("");
        setEmail("");
        setErrors({});
        setMessage("User added successfully");
      })

      .catch((error) => {
        setMessage("");

        if (error.response?.status === 409) {
          setMessage("Email already exists. Please use a different email.");
        } else if (error.response?.status === 400) {
          setErrors(error.response.data);
        } else if (error.response) {
          setMessage("Something went wrong. Please try again.");
        } else {
          setMessage("Unable to connect to server");
        }

        console.log(error);
      })

      .finally(() => {
        setLoading(false);
      });
  }

  // Function to delete a user

  function deleteUser(id) {
    setDeletingId(id);
    setMessage("");
    setErrors({});

    axios
      .delete(`${import.meta.env.VITE_API_URL}/api/users/${id}`)
      .then(() => {
        const updatedUsers = users.filter((user) => user.id !== id);

        setUsers(updatedUsers);
        setMessage("User deleted successfully");

        const updatedFilteredUsers = updatedUsers
          .filter(
            (user) =>
              user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              user.email.toLowerCase().includes(searchTerm.toLowerCase()),
          )
          .sort((a, b) => {
            if (sortOrder === "asc") {
              return a.name.localeCompare(b.name);
            }

            return b.name.localeCompare(a.name);
          });

        const updatedTotalPages = Math.ceil(
          updatedFilteredUsers.length / usersPerPage,
        );

        if (currentPage > updatedTotalPages) {
          setCurrentPage(Math.max(1, updatedTotalPages));
        }
      })
      .catch((error) => {
        if (error.response) {
          setMessage("Failed to delete user");
        } else {
          setMessage("Unable to connect to server");
        }

        console.log(error);
      })
      .finally(() => {
        setDeletingId(null);
      });
  }

  // Function to update a user

  function updateUser() {
    setErrors({});
    setLoading(true);
    const updatedUser = {
      name: name,
      email: email,
    };

    // Send a PUT request to update the user with the specified ID
    axios
      .put(
        `${import.meta.env.VITE_API_URL}/api/users/${editingId}`,
        updatedUser,
      )
      .then((response) => {
        setUsers(
          users.map((user) => (user.id === editingId ? response.data : user)),
        );

        setName("");
        setEmail("");
        setEditingId(null);
        setMessage("User updated successfully");
      })

      .catch((error) => {
        setMessage("");

        if (error.response) {
          setErrors(error.response.data);
        } else {
          setMessage("Unable to connect to server");
        }

        console.log(error);
      })

      .finally(() => {
        setLoading(false);
      });
  }

  // Function to cancel editing
  function cancelEdit() {
    setEditingId(null);
    setName("");
    setEmail("");
    setErrors({});
  }

  return (
    <div className="Container">
      <h1>User Management System</h1>
      <p className="page-subtitle">
        Manage your users, accounts, and information in one place.
      </p>

      <div className="form-section">
        <div className="section-heading">
          <h2>{editingId === null ? "Create a User" : "Edit User"}</h2>
          <p>
            {editingId === null
              ? "Enter the details below to add a new user."
              : "Update the user's information below."}
          </p>
        </div>

        {message && (
          <p
            className={
              message.includes("successfully")
                ? "success-message"
                : "error-message"
            }
          >
            {message}
          </p>
        )}
        <h2>{editingId === null ? "Add User" : "Edit User"}</h2>

        <div className="form-field">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {errors.name && <p className="error">{errors.name}</p>}

        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {errors.email && <p className="error">{errors.email}</p>}

        <div className="form-actions">
          <button
            onClick={editingId === null ? addUser : updateUser}
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : editingId === null
                ? "Add User"
                : "Update User"}
          </button>

          {editingId !== null && <button onClick={cancelEdit}>Cancel</button>}
        </div>
      </div>

      <div className="users-section">
        <div className="section-heading">
          <div className="directory-heading">
            <h2>User Directory</h2>

            <button
              type="button"
              className="refresh-button"
              onClick={fetchUsers}
              disabled={pageLoading}
            >
              {pageLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <p>View, search, and manage all your users.</p>
        </div>
        <p className="user-count">
          Showing {filteredUsers.length === 0 ? 0 : indexOfFirstUser + 1}
          {"–"}
          {Math.min(indexOfLastUser, filteredUsers.length)} of{" "}
          {filteredUsers.length} filtered users
        </p>

        <div className="user-controls">
          <select
            value={sortOrder}
            onChange={(event) => {
              setSortOrder(event.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="asc">Name: A to Z</option>
            <option value="desc">Name: Z to A</option>
          </select>

          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setCurrentPage(1);
              s;
            }}
          />
        </div>
        {searchTerm && (
          <button onClick={() => setSearchTerm("")}>Clear Search</button>
        )}
        {pageLoading ? (
          <p className="users-loading">Loading users...</p>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">＋</div>
            <h3>No users yet</h3>
            <p>Add your first user using the form above.</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">
            <h3>No matching users</h3>
            <p>Try another name or email address.</p>
          </div>
        ) : (
          <div className="user-grid">
            {currentUsers.map((user) => (
              <div className="user-card" key={user.id}>
                <div className="user-details">
                  <span className="user-id">ID: {user.id}</span>
                  <h3 className="user-name">{user.name}</h3>
                  <p className="user-email">{user.email}</p>
                </div>

                <div className="card-actions">
                  <button
                    onClick={() => {
                      setEditingId(user.id);
                      setName(user.name);
                      setEmail(user.email);
                      setMessage("");
                      setErrors({});
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className="delete-button"
                    disabled={deletingId === user.id}
                    onClick={() => {
                      setUserToDelete(user);
                    }}
                  >
                    {deletingId === user.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!pageLoading && filteredUsers.length > 0 && (
          <div
            className="pagination-controls"
            aria-label="User list pagination"
          >
            <label className="page-size-label">
              Users per page:
              <select
                id="users-per-page"
                value={usersPerPage}
                onChange={(event) => {
                  setUsersPerPage(Number(event.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={6}>6</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </label>

            {totalPages > 1 && (
              <nav aria-label="User list pages">
                <button
                  type="button"
                  aria-label="Go to previous page"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </button>

                {pageNumbers.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    className={currentPage === pageNumber ? "active-page" : ""}
                    aria-current={
                      currentPage === pageNumber ? "page" : undefined
                    }
                    onClick={() => setCurrentPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ))}

                <button
                  type="button"
                  aria-label="Go to next page"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </button>
              </nav>
            )}
          </div>
        )}

        {userToDelete && (
          <div className="modal-overlay">
            <div
              className="delete-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-modal-title"
            >
              <div className="modal-icon">!</div>

              <h2 id="delete-modal-title">Delete User?</h2>

              <p>
                Are you sure you want to delete{" "}
                <strong>{userToDelete.name}</strong>? This action cannot be
                undone.
              </p>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setUserToDelete(null)}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="confirm-delete-button"
                  disabled={deletingId === userToDelete.id}
                  onClick={() => {
                    setMessage("");
                    setErrors({});
                    deleteUser(userToDelete.id);
                    setUserToDelete(null);
                  }}
                >
                  {deletingId === userToDelete.id
                    ? "Deleting..."
                    : "Delete User"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
