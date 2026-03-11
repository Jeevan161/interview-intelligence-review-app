import { useState, useEffect, useCallback } from "react";

const API = "/api";

const IS_COVERED_OPTIONS = {
  COVERED: "Covered",
  PARTIALLY_COVERED: "Partially Covered",
  NOT_COVERED: "Not Covered",
};

const HOW_COVERED_OPTIONS = {
  EXACT_MATCH: "Exact Match",
  VARIANT: "Variant",
  SYNTAX_COVERED: "Syntax Covered",
  CONCEPT_COVERED: "Concept Covered",
  NOT_APPLICABLE: "N/A",
};

const STATUS_OPTIONS = {
  EXACT_MATCH: "Exact Match",
  NAME_CHANGE_VARIANT: "Name Variant",
  INPUT_CHANGED_VARIANT: "Input Variant",
  SYNTAX_COVERED: "Syntax Covered",
  PARTIALLY_COVERED: "Partially Covered",
  CONCEPT_COVERED: "Concept Covered",
  NOT_COVERED: "Not Covered",
  OTHER_LANGUAGE: "Other Language",
};

const STATUS_LABELS = {
  EXACT_MATCH: "Exact Match",
  NAME_CHANGE_VARIANT: "Name Variant",
  INPUT_CHANGED_VARIANT: "Input Variant",
  SYNTAX_COVERED: "Syntax Covered",
  PARTIALLY_COVERED: "Partially Covered",
  CONCEPT_COVERED: "Concept Covered",
  NOT_COVERED: "Not Covered",
  OTHER_LANGUAGE: "Other Language",
};

const HOW_COVERED_LABELS = {
  EXACT_MATCH: "Exact Match",
  VARIANT: "Variant",
  SYNTAX_COVERED: "Syntax Covered",
  CONCEPT_COVERED: "Concept Covered",
  NOT_APPLICABLE: "N/A",
};

const HOW_COLORS = {
  EXACT_MATCH: "how-exact",
  VARIANT: "how-variant",
  SYNTAX_COVERED: "how-syntax",
  CONCEPT_COVERED: "how-concept",
};

const ACTION_OPTIONS = [
  "Adding New Question",
  "Adding New Topic",
];

const SESSION_OPTIONS = [
  "How to Learn a New Programming Language in Record Time",
  "Introduction to Python Programming",
  "Coding Practice Walkthrough | Part 1",
  "Variables and Data Types",
  "Sequence of Instructions",
  "Working with Strings & Input-Output Basics",
  "How to Debug Your Code",
  "Relational, Logical and Compound Operators",
  "Conditional Statements",
  "Loops",
  "Nested Loops & Loop Control Statements",
  "Comparing Strings and String Methods",
  "String Formatting",
  "Lists",
  "Working with Lists & Nested Lists",
  "Lists & Strings",
  "Functions",
  "Built-In Functions and List Methods",
  "Function Call Stack and Recursion",
  "Tuples and Sequences",
  "Sets",
  "Set Operations",
  "Introduction to Matrices",
  "Shorthand Expressions & List Comprehensions",
  "Dictionaries",
  "Working with Dictionaries",
  "Introduction to Object-Oriented Programming",
  "Object-Oriented Programming | Part 2",
  "Classes & Objects",
  "Attributes & Methods",
  "Encapsulation",
  "Inheritance",
  "Inheritance | Part 2",
  "Abstraction",
  "Polymorphism",
  "Python Standard Library",
  "Scope & Namespaces",
  "Errors & Exceptions",
  "Working with Date and Time",
];

function ReviewCard({ q: initialQ, email, onReviewed }) {
  const [q] = useState(initialQ);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const a = q.gpt_analysis || {};

  const [isCovered, setIsCovered] = useState(a.is_covered || "");
  const [howCovered, setHowCovered] = useState(a.how_covered || "");
  const [coverageStatus, setCoverageStatus] = useState(a.coverage_status || "");
  const [remarkText, setRemarkText] = useState("");
  const [remarkAction, setRemarkAction] = useState("");
  const [remarkSession, setRemarkSession] = useState("");

  const covClass =
    a.is_covered === "COVERED" ? "covered" :
    a.is_covered === "PARTIALLY_COVERED" ? "partial" : "notcov";

  const handleSaveAndReview = async () => {
    setSaving(true);

    // Save field changes if any differ
    const fields = {};
    if (isCovered !== (a.is_covered || "")) fields.is_covered = isCovered;
    if (howCovered !== (a.how_covered || "")) fields.how_covered = howCovered;
    if (coverageStatus !== (a.coverage_status || "")) fields.coverage_status = coverageStatus;

    if (Object.keys(fields).length > 0) {
      await fetch(`${API}/questions/${q._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields, changed_by: email }),
      });
    }

    // Add remark if provided
    if (remarkText.trim()) {
      const remarkData = { name: email, remark: remarkText.trim() };
      if (remarkAction) remarkData.action = remarkAction;
      if (remarkSession) remarkData.session = remarkSession;
      await fetch(`${API}/questions/${q._id}/remarks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(remarkData),
      });
    }

    // Mark as reviewed
    await fetch(`${API}/questions/${q._id}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewer_email: email, status: "reviewed" }),
    });

    setSaving(false);
    if (onReviewed) onReviewed(q._id);
  };

  const handleSkip = () => {
    if (onReviewed) onReviewed(q._id);
  };

  return (
    <div className="question-card review-card">
      <div className={`card-accent ${a.is_covered || ""}`} />
      <div className="card-body">
        <div className="q-header">
          <div className="q-text">{q.Question}</div>
          <div className="q-badges">
            <span className={`badge ${covClass}`}>
              {IS_COVERED_OPTIONS[a.is_covered] || a.is_covered}
            </span>
            <span className="badge status-detail">
              {STATUS_LABELS[a.coverage_status] || a.coverage_status}
            </span>
          </div>
        </div>

        <div className="q-meta-row">
          {q["Company Name"] && (
            <span className="meta-pill company">{q["Company Name"]}</span>
          )}
          {a.language && <span className="meta-pill lang">{a.language}</span>}
          {q["Round Category"] && (
            <span className="meta-pill round">{q["Round Category"]}</span>
          )}
          {a.how_covered && a.how_covered !== "NOT_APPLICABLE" && (
            <span className={`meta-pill how ${HOW_COLORS[a.how_covered] || ""}`}>
              {HOW_COVERED_LABELS[a.how_covered]}
            </span>
          )}
          {a.similarity_percentage != null && (
            <span className={`meta-pill sim ${a.similarity_percentage >= 80 ? "sim-high" : a.similarity_percentage >= 50 ? "sim-med" : "sim-low"}`}>
              {a.similarity_percentage}% match
            </span>
          )}
        </div>

        {a.justification && (
          <div className="q-justification">{a.justification}</div>
        )}

        {a.matches?.length > 0 && (
          <div className="review-matches">
            <div className="review-matches-label">Course Matches ({a.matches.length})</div>
            <div className="match-list">
              {a.matches.slice(0, 3).map((m, i) => (
                <div className="match-row" key={i}>
                  <span className={`match-type-badge ${m.match_type}`}>{m.match_type}</span>
                  <a className="match-link" href={`https://learning.ccbp.in/question/${m.course_question_id}`} target="_blank" rel="noreferrer">
                    {m.course_short_text}
                  </a>
                  <span className="match-pct">{m.similarity_percentage}%</span>
                </div>
              ))}
              {a.matches.length > 3 && (
                <div className="match-more">+{a.matches.length - 3} more matches</div>
              )}
            </div>
          </div>
        )}

        {/* Edit section */}
        <div className="review-edit-section">
          {!editing ? (
            <button className="btn-edit-review" onClick={() => setEditing(true)}>
              Modify Classification
            </button>
          ) : (
            <div className="edit-panel">
              <div className="edit-row">
                <label>Is Covered</label>
                <select value={isCovered} onChange={(e) => setIsCovered(e.target.value)}>
                  <option value="">Select...</option>
                  {Object.entries(IS_COVERED_OPTIONS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="edit-row">
                <label>How Covered</label>
                <select value={howCovered} onChange={(e) => setHowCovered(e.target.value)}>
                  <option value="">Select...</option>
                  {Object.entries(HOW_COVERED_OPTIONS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="edit-row">
                <label>Coverage Status</label>
                <select value={coverageStatus} onChange={(e) => setCoverageStatus(e.target.value)}>
                  <option value="">Select...</option>
                  {Object.entries(STATUS_OPTIONS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Remark */}
        <div className="review-remark-section">
          <div className="remark-dropdowns-row">
            <div className="remark-dropdown-group">
              <label>Action to be taken</label>
              <select value={remarkAction} onChange={(e) => setRemarkAction(e.target.value)}>
                <option value="">Select action...</option>
                {ACTION_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="remark-dropdown-group">
              <label>Related Session</label>
              <select value={remarkSession} onChange={(e) => setRemarkSession(e.target.value)}>
                <option value="">Select session...</option>
                {SESSION_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>
          <input
            value={remarkText}
            onChange={(e) => setRemarkText(e.target.value)}
            placeholder="Add a remark (optional)..."
            className="review-remark-input"
          />
        </div>

        {/* Actions */}
        <div className="review-actions">
          <button className="btn-review-done" onClick={handleSaveAndReview} disabled={saving}>
            {saving ? "Saving..." : "Mark Reviewed"}
          </button>
          <button className="btn-review-skip" onClick={handleSkip}>Skip</button>
        </div>
      </div>
    </div>
  );
}

export default function ReviewPage({ email }) {
  const [questions, setQuestions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("pending");
  const [reviewedCount, setReviewedCount] = useState(0);
  const limit = 10;

  const loadQuestions = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ reviewer_email: email, status: tab, page, limit });
    fetch(`${API}/review-questions?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setQuestions(d.questions);
        setTotal(d.total);
        setLoading(false);
      });
  }, [email, tab, page]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  useEffect(() => {
    fetch(`${API}/reviews?reviewer_email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((d) => setReviewedCount(d.length));
  }, [email, tab]);

  const handleReviewed = (qId) => {
    setQuestions((prev) => prev.filter((q) => q._id !== qId));
    setTotal((prev) => prev - 1);
    setReviewedCount((prev) => prev + (tab === "pending" ? 1 : 0));
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container">
      <div className="review-header">
        <h2>Review Questions</h2>
        <div className="review-stats-row">
          <span className="review-stat">
            <span className="review-stat-num">{reviewedCount}</span> reviewed by you
          </span>
          <span className="review-stat">
            <span className="review-stat-num">{total}</span> {tab === "pending" ? "pending" : "reviewed"}
          </span>
        </div>
      </div>

      <div className="review-tabs">
        <button
          className={`review-tab ${tab === "pending" ? "active" : ""}`}
          onClick={() => { setTab("pending"); setPage(1); }}
        >
          Pending Review
        </button>
        <button
          className={`review-tab ${tab === "reviewed" ? "active" : ""}`}
          onClick={() => { setTab("reviewed"); setPage(1); }}
        >
          Already Reviewed
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading questions...</div>
      ) : questions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">{tab === "pending" ? "✓" : "?"}</div>
          <p>{tab === "pending" ? "All questions reviewed! Great work." : "No reviewed questions yet."}</p>
        </div>
      ) : (
        questions.map((q) => (
          <ReviewCard key={q._id} q={q} email={email} onReviewed={handleReviewed} />
        ))
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
            &#8592; Prev
          </button>
          <span className="page-info">Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            Next &#8594;
          </button>
        </div>
      )}
    </div>
  );
}
