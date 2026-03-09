import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { useState } from "react";
import Cookies from "js-cookie";
import QuestionsPage from "./pages/QuestionsPage";
import RemarksPage from "./pages/RemarksPage";
import "./App.css";

function NavLink({ to, children }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={isActive ? "active" : ""}>
      {children}
    </Link>
  );
}

function App() {
  const [name, setName] = useState(Cookies.get("reviewer_name") || "");
  const [nameInput, setNameInput] = useState("");

  const handleSetName = (e) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    Cookies.set("reviewer_name", nameInput.trim(), { expires: 7 });
    setName(nameInput.trim());
  };

  if (!name) {
    return (
      <div className="name-prompt">
        <div className="name-card">
          <h2>Interview Intelligence</h2>
          <p className="subtitle">Sign in to review question coverage analysis</p>
          <form onSubmit={handleSetName}>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Enter your name"
              autoFocus
            />
            <button type="submit">Continue</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="app">
        <nav className="navbar">
          <h1>Interview Intelligence</h1>
          <div className="nav-links">
            <NavLink to="/">Questions</NavLink>
            <NavLink to="/remarks">Remarks</NavLink>
          </div>
          <div className="nav-user">
            <div className="user-avatar">{name.charAt(0).toUpperCase()}</div>
            <span>{name}</span>
            <button
              className="btn-logout"
              onClick={() => {
                Cookies.remove("reviewer_name");
                setName("");
              }}
            >
              Sign out
            </button>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<QuestionsPage name={name} />} />
          <Route path="/remarks" element={<RemarksPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
