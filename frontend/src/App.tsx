import { useEffect, useState } from "react";
import "./App.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

type ActionItem = {
  task: string;
  owner: string | null;
  deadline: string | null;
  follow_up: string | null;
};

type Analysis = {
  id: number;
  meeting_notes: string;
  summary: string;
  decisions: string[];
  action_items: ActionItem[];
  created_at: string;
};

function App() {
  const [meetingNotes, setMeetingNotes] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [history, setHistory] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/analyses`);

      if (!response.ok) {
        throw new Error("Failed to load analysis history");
      }

      const data = await response.json();
      setHistory(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleAnalyze = async () => {
    if (!meetingNotes.trim()) {
      setError("Please enter meeting notes first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meeting_notes: meetingNotes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Analysis failed");
      }

      const data: Analysis = await response.json();

      setAnalysis(data);
      await loadHistory();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="header">
        <div>
          <p className="eyebrow">AI Meeting Intelligence</p>
          <h1>Meeting Action Extractor</h1>
          <p className="subtitle">
            Turn unstructured meeting notes into summaries, decisions, and
            actionable follow-ups.
          </p>
        </div>
      </header>

      <main className="main-grid">
        <section className="panel input-panel">
          <h2>Meeting Notes</h2>

          <textarea
            value={meetingNotes}
            onChange={(e) => setMeetingNotes(e.target.value)}
            placeholder="Paste your meeting notes here..."
          />

          <button onClick={handleAnalyze} disabled={loading}>
            {loading ? "Analyzing..." : "Analyze Meeting"}
          </button>

          {error && <p className="error-message">{error}</p>}
        </section>

        <section className="panel">
          <h2>Latest Analysis</h2>

          {!analysis ? (
            <p className="empty-state">
              Run an analysis to see the summary, decisions, and action items.
            </p>
          ) : (
            <div className="analysis-content">
              <div className="result-block">
                <h3>Summary</h3>
                <p>{analysis.summary}</p>
              </div>

              <div className="result-block">
                <h3>Decisions</h3>

                {analysis.decisions.length === 0 ? (
                  <p>No explicit decisions were detected.</p>
                ) : (
                  <ul>
                    {analysis.decisions.map((decision, index) => (
                      <li key={index}>{decision}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="result-block">
                <h3>Action Items</h3>

                {analysis.action_items.length === 0 ? (
                  <p>No action items were detected.</p>
                ) : (
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Task</th>
                          <th>Owner</th>
                          <th>Deadline</th>
                          <th>Follow-up</th>
                        </tr>
                      </thead>

                      <tbody>
                        {analysis.action_items.map((item, index) => (
                          <tr key={index}>
                            <td>{item.task}</td>
                            <td>{item.owner || "Not specified"}</td>
                            <td>{item.deadline || "Not specified"}</td>
                            <td>{item.follow_up || "Not specified"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        <section className="panel history-panel">
          <h2>Past Analyses</h2>

          {history.length === 0 ? (
            <p className="empty-state">No previous analyses yet.</p>
          ) : (
            <div className="history-list">
              {history.map((item) => (
                <button
                  key={item.id}
                  className="history-card"
                  onClick={() => setAnalysis(item)}
                >
                  <strong>Analysis #{item.id}</strong>
                  <span>{item.summary}</span>
                  <small>
                    {new Date(item.created_at).toLocaleString()}
                  </small>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;