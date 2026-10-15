import { useCallback, useEffect, useState } from "react";
import "./App.css";

const API_URL =
  `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/tasks`;

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
  });

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not load tasks");
      }

      setTasks(result.data);
    } catch (err) {
      setError(err.message || "Could not connect to the backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const resetForm = () => {
    setForm({ title: "", description: "" });
    setEditingId(null);
  };

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Please enter a task title.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        editingId ? `${API_URL}/${editingId}` : API_URL,
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: form.title.trim(),
            description: form.description.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not save task");
      }

      resetForm();
      await fetchTasks();
    } catch (err) {
      setError(err.message || "Could not save task.");
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (task) => {
    setEditingId(task._id);
    setForm({
      title: task.title,
      description: task.description || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleTask = async (task) => {
    setError("");

    try {
      const response = await fetch(`${API_URL}/${task._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: !task.completed,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not update task");
      }

      setTasks((currentTasks) =>
        currentTasks.map((item) =>
          item._id === task._id ? result.data : item
        )
      );
    } catch (err) {
      setError(err.message || "Could not update task.");
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    setError("");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not delete task");
      }

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task._id !== id)
      );

      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      setError(err.message || "Could not delete task.");
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = `${task.title} ${task.description || ""}`
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "completed" && task.completed) ||
      (filter === "pending" && !task.completed);

    return matchesSearch && matchesFilter;
  });

  const completedCount = tasks.filter((task) => task.completed).length;
  const pendingCount = tasks.length - completedCount;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#home">
          <span className="brand-icon">✓</span>
          TaskFlow
        </a>

        <p className="nav-label">WORKSPACE</p>

        <a className="nav-link active" href="#tasks">
          <span>▦</span> My tasks
        </a>

        <div className="sidebar-note">
          <span className="note-icon">✦</span>
          <h3>Small steps add up.</h3>
          <p>Keep moving forward, one task at a time.</p>
        </div>

        <div className="sidebar-footer">
          <span className="avatar">JD</span>
          <div>
            <strong>My workspace</strong>
            <small>Personal task manager</small>
          </div>
        </div>
      </aside>

      <main className="main-content" id="home">
        <header className="topbar">
          <span className="breadcrumb">Workspace / My tasks</span>
          <span className="live-status">
            <span className="status-dot" /> Personal workspace
          </span>
        </header>

        <section className="page-heading" id="tasks">
          <div>
            <p className="eyebrow">YOUR PRODUCTIVITY SPACE</p>
            <h1>My tasks<span>.</span></h1>
            <p className="subtitle">
              Organise your work and make progress every day.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={() => {
              resetForm();
              document
                .getElementById("task-form")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <span>＋</span> New task
          </button>
        </section>

        <section className="stats-grid">
          <StatCard label="Total tasks" value={tasks.length} icon="▤" />
          <StatCard
            label="Completed"
            value={completedCount}
            icon="✓"
            tone="green"
          />
          <StatCard
            label="In progress"
            value={pendingCount}
            icon="◷"
            tone="orange"
          />
        </section>

        <section className="workspace-grid">
          <div className="task-panel">
            <div className="panel-heading">
              <div>
                <h2>Task overview</h2>
                <p>Everything you need to get done.</p>
              </div>
              <span className="task-count">{filteredTasks.length} tasks</span>
            </div>

            <div className="toolbar">
              <div className="search-box">
                <span>⌕</span>
                <input
                  type="search"
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  aria-label="Search tasks"
                />
              </div>

              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                aria-label="Filter tasks"
              >
                <option value="all">All tasks</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {error && (
              <div className="error-message" role="alert">
                {error}
                <button onClick={() => setError("")} aria-label="Dismiss error">
                  ×
                </button>
              </div>
            )}

            {loading ? (
              <div className="empty-state">
                <div className="loading-spinner" />
                <p>Loading your tasks...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">▤</div>
                <h3>
                  {search || filter !== "all"
                    ? "No matching tasks"
                    : "Nothing on your list yet"}
                </h3>
                <p>
                  {search || filter !== "all"
                    ? "Try another search or filter."
                    : "Create your first task and get started."}
                </p>
              </div>
            ) : (
              <div className="task-list">
                {filteredTasks.map((task) => (
                  <article className="task-item" key={task._id}>
                    <button
                      className={`task-check ${
                        task.completed ? "checked" : ""
                      }`}
                      onClick={() => toggleTask(task)}
                      aria-label={
                        task.completed
                          ? "Mark task as pending"
                          : "Mark task as completed"
                      }
                    >
                      {task.completed ? "✓" : ""}
                    </button>

                    <div className="task-info">
                      <h3 className={task.completed ? "done" : ""}>
                        {task.title}
                      </h3>

                      {task.description && (
                        <p>{task.description}</p>
                      )}

                      <small>
                        {task.createdAt
                          ? new Date(task.createdAt).toLocaleDateString(
                              undefined,
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "Recently added"}
                      </small>
                    </div>

                    <span
                      className={`task-status ${
                        task.completed ? "complete" : "pending"
                      }`}
                    >
                      {task.completed ? "Completed" : "Pending"}
                    </span>

                    <div className="task-actions">
                      <button
                        onClick={() => startEditing(task)}
                        aria-label={`Edit ${task.title}`}
                        title="Edit task"
                      >
                        ✎
                      </button>
                      <button
                        className="delete-action"
                        onClick={() => deleteTask(task._id)}
                        aria-label={`Delete ${task.title}`}
                        title="Delete task"
                      >
                        ×
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {!loading && tasks.length > 0 && (
              <footer className="list-footer">
                <span>
                  {completedCount} of {tasks.length} tasks completed
                </span>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${(completedCount / tasks.length) * 100}%`,
                    }}
                  />
                </div>
              </footer>
            )}
          </div>

          <aside className="form-panel" id="task-form">
            <div className="form-icon">{editingId ? "✎" : "＋"}</div>

            <h2>{editingId ? "Edit your task" : "Create a task"}</h2>
            <p className="form-description">
              {editingId
                ? "Update the details below."
                : "Add something you want to accomplish."}
            </p>

            <form onSubmit={handleSubmit}>
              <label htmlFor="title">Task title</label>
              <input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Learn React hooks"
                maxLength={150}
                required
              />

              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Add some details..."
                rows={5}
                maxLength={2000}
              />

              <button
                className="primary-button submit-button"
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Save changes"
                  : "Create task"}
                {!saving && <span>→</span>}
              </button>

              {editingId && (
                <button
                  className="cancel-button"
                  type="button"
                  onClick={resetForm}
                >
                  Cancel editing
                </button>
              )}
            </form>

            <div className="form-tip">
              <span>✦</span>
              <p>
                <strong>Productivity tip</strong>
                <br />
                Break big goals into small, manageable tasks.
              </p>
            </div>
          </aside>
        </section>

        <footer className="app-footer">
          <span>TaskFlow · MERN CRUD project</span>
          <span>Built for getting things done.</span>
        </footer>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon, tone = "blue" }) {
  return (
    <article className="stat-card">
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
      <span className={`stat-icon ${tone}`}>{icon}</span>
    </article>
  );
}

export default App;