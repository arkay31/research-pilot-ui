import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const suggestions = [
  "What are the best Python frameworks for REST APIs in 2025?",
  "How do AI agents work and what are their use cases?",
  "What is LangGraph and how does it compare to LangChain?",
  "What are the latest trends in Generative AI in 2025?",
];

const toolMeta = {
  web_search: { emoji: "🔍", label: "web_search", bg: "#2d1f4e", color: "#a78bfa", border: "#4c1d95" },
  read_url:   { emoji: "📄", label: "read_url",   bg: "#1e2d4e", color: "#60a5fa", border: "#1e3a8a" },
  save_finding: { emoji: "💾", label: "save_finding", bg: "#1e3a2e", color: "#34d399", border: "#065f46" },
};

export default function App() {
  const [question, setQuestion] = useState("");
  const [steps, setSteps] = useState([]);
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [timer, setTimer] = useState(null);

  const wordCount = report.split(/\s+/).filter(Boolean).length;
  const readTime = Math.ceil(wordCount / 200);

  const startTimer = () => {
    setElapsed(0);
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    setTimer(t);
    return t;
  };

  const stopTimer = (t) => {
    clearInterval(t);
    setTimer(null);
  };

  const runResearch = async (q) => {
    const query = q || question;
    if (!query.trim() || loading) return;
    setQuestion(query);
    setSteps([]);
    setReport("");
    setError("");
    setLoading(true);
    const t = startTimer();

    try {
      const response = await fetch("http://127.0.0.1:8000/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: query }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split("\n").filter(l => l.startsWith("data: "));
        for (const line of lines) {
          const event = JSON.parse(line.replace("data: ", ""));
          if (event.type === "tool") {
            setSteps(prev => [...prev, { name: event.name, input: event.input, time: new Date().toLocaleTimeString() }]);
          } else if (event.type === "report") {
            setReport(event.content);
            setHistory(prev => [{ question: query, report: event.content, date: new Date().toLocaleTimeString() }, ...prev.slice(0, 9)]);
          } else if (event.type === "done") {
            setLoading(false);
            stopTimer(t);
          }
        }
      }
    } catch (e) {
      setError("Could not connect to backend. Make sure it's running on port 8000.");
      setLoading(false);
      stopTimer(t);
    }
  };

  const exportMarkdown = () => {
    const blob = new Blob([`# ${question}\n\n${report}`], { type: "text/markdown" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = "research-report.md"; a.click();
  };

  const copyReport = () => navigator.clipboard.writeText(report);

  return (
    <div style={{ minHeight: "100vh", background: "#080810", color: "#e2e2e2", fontFamily: "'Segoe UI', sans-serif", display: "flex" }}>

      {/* Sidebar */}
      {showHistory && (
        <div style={{ width: 280, borderRight: "1px solid #1e1e2e", padding: "24px 16px", overflowY: "auto", background: "#0d0d1a", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#888" }}>HISTORY</span>
            <button onClick={() => setShowHistory(false)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 18 }}>×</button>
          </div>
          {history.length === 0 && <p style={{ color: "#444", fontSize: 13 }}>No searches yet.</p>}
          {history.map((h, i) => (
            <div key={i} onClick={() => { setQuestion(h.question); setReport(h.report); setSteps([]); setShowHistory(false); }}
              style={{ padding: "10px 12px", borderRadius: 8, marginBottom: 8, background: "#1a1a2e", border: "1px solid #2a2a3e", cursor: "pointer" }}>
              <p style={{ margin: 0, fontSize: 12, color: "#aaa", lineHeight: 1.5 }}>{h.question.slice(0, 60)}...</p>
              <p style={{ margin: "4px 0 0", fontSize: 11, color: "#444" }}>{h.date}</p>
            </div>
          ))}
        </div>
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ borderBottom: "1px solid #1e1e2e", padding: "14px 32px", display: "flex", alignItems: "center", gap: 12, background: "#0d0d1a" }}>
          <span style={{ fontSize: 20 }}>🔍</span>
          <span style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>ResearchPilot</span>
          <span style={{ fontSize: 11, background: "#1e1e2e", color: "#888", padding: "2px 10px", borderRadius: 20 }}>AI Agent</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 16, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#a78bfa" }}>LangGraph</span>
            <span style={{ fontSize: 12, color: "#60a5fa" }}>Groq</span>
            <span style={{ fontSize: 12, color: "#34d399" }}>Tavily</span>
            <button onClick={() => setShowHistory(!showHistory)}
              style={{ fontSize: 12, padding: "5px 14px", background: "#1a1a2e", border: "1px solid #2a2a3e", color: "#aaa", borderRadius: 6, cursor: "pointer" }}>
              🕘 History {history.length > 0 && `(${history.length})`}
            </button>
          </div>
        </div>

        <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px", width: "100%" }}>

          {/* Hero */}
          {!report && !loading && (
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🧠</div>
              <h1 style={{ fontSize: 40, fontWeight: 800, margin: 0, background: "linear-gradient(135deg, #a78bfa 0%, #60a5fa 50%, #34d399 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Research anything.
              </h1>
              <p style={{ color: "#555", fontSize: 15, marginTop: 10 }}>
                Autonomous AI agent — searches the web, reads pages, writes your report.
              </p>
            </div>
          )}

          {/* Search */}
          <div style={{ display: "flex", gap: 10 }}>
            <input value={question} onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => e.key === "Enter" && runResearch()}
              placeholder="Ask anything to research..."
              style={{ flex: 1, padding: "13px 18px", fontSize: 15, borderRadius: 10, border: "1px solid #2a2a3e", background: "#1a1a2e", color: "#fff", outline: "none" }} />
            <button onClick={() => runResearch()} disabled={loading}
              style={{ padding: "13px 28px", background: loading ? "#312e81" : "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", fontWeight: 600 }}>
              {loading ? `${elapsed}s...` : "Research →"}
            </button>
          </div>

          {/* Suggestions */}
          {!loading && !report && (
            <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => runResearch(s)}
                  style={{ fontSize: 12, padding: "6px 14px", background: "#1a1a2e", border: "1px solid #2a2a3e", color: "#777", borderRadius: 20, cursor: "pointer" }}>
                  {s.slice(0, 48)}...
                </button>
              ))}
            </div>
          )}

          {error && (
            <div style={{ marginTop: 20, padding: "12px 16px", background: "#2d1515", border: "1px solid #7f1d1d", borderRadius: 8, color: "#fca5a5", fontSize: 14 }}>
              ⚠️ {error}
            </div>
          )}

          {/* Agent steps */}
          {steps.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <p style={{ fontSize: 11, color: "#444", marginBottom: 10, letterSpacing: 1.5 }}>AGENT REASONING — {steps.length} step{steps.length > 1 ? "s" : ""}</p>
              {steps.map((s, i) => {
                const m = toolMeta[s.name] || { emoji: "⚙️", label: s.name, bg: "#1e1e2e", color: "#888", border: "#333" };
                return (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", background: m.bg, border: `1px solid ${m.border}`, borderRadius: 8, padding: "10px 14px", marginBottom: 8 }}>
                    <span style={{ fontSize: 14 }}>{m.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: m.color, letterSpacing: 0.5 }}>{m.label.toUpperCase()}</span>
                      <p style={{ margin: "3px 0 0", fontSize: 13, color: "#aaa" }}>{s.input}</p>
                    </div>
                    <span style={{ fontSize: 11, color: "#444", whiteSpace: "nowrap" }}>{s.time}</span>
                  </div>
                );
              })}
              {loading && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", color: "#555", fontSize: 13 }}>
                  <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⏳</span>
                  Agent is thinking... ({elapsed}s elapsed)
                </div>
              )}
            </div>
          )}

          {/* Report */}
          {report && (
            <div style={{ marginTop: 32 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <p style={{ fontSize: 11, color: "#444", margin: 0, letterSpacing: 1.5 }}>RESEARCH REPORT</p>
                  <span style={{ fontSize: 11, color: "#555", background: "#1a1a2e", padding: "2px 8px", borderRadius: 10 }}>{wordCount} words · {readTime} min read</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={copyReport}
                    style={{ fontSize: 12, padding: "5px 14px", background: "#1a1a2e", border: "1px solid #2a2a3e", color: "#888", borderRadius: 6, cursor: "pointer" }}>
                    📋 Copy
                  </button>
                  <button onClick={exportMarkdown}
                    style={{ fontSize: 12, padding: "5px 14px", background: "#1a1a2e", border: "1px solid #2a2a3e", color: "#888", borderRadius: 6, cursor: "pointer" }}>
                    ⬇️ Export .md
                  </button>
                  <button onClick={() => { setReport(""); setSteps([]); setQuestion(""); }}
                    style={{ fontSize: 12, padding: "5px 14px", background: "#1a1a2e", border: "1px solid #2a2a3e", color: "#888", borderRadius: 6, cursor: "pointer" }}>
                    🔄 New
                  </button>
                </div>
              </div>
              <div style={{ background: "#0d0d1a", border: "1px solid #1e1e2e", borderRadius: 12, padding: "28px 32px" }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({node, ...p}) => <h1 style={{ color: "#fff", fontSize: 22, borderBottom: "1px solid #1e1e2e", paddingBottom: 10 }} {...p} />,
                    h2: ({node, ...p}) => <h2 style={{ color: "#e2e2e2", fontSize: 18, marginTop: 24 }} {...p} />,
                    h3: ({node, ...p}) => <h3 style={{ color: "#c4c4d4", fontSize: 15 }} {...p} />,
                    p:  ({node, ...p}) => <p style={{ color: "#aaa", lineHeight: 1.8, fontSize: 14 }} {...p} />,
                    li: ({node, ...p}) => <li style={{ color: "#aaa", lineHeight: 1.8, fontSize: 14 }} {...p} />,
                    strong: ({node, ...p}) => <strong style={{ color: "#e2e2e2" }} {...p} />,
                    code: ({node, ...p}) => <code style={{ background: "#1a1a2e", color: "#a78bfa", padding: "2px 6px", borderRadius: 4, fontSize: 13 }} {...p} />,
                    table: ({node, ...p}) => <div style={{ overflowX: "auto", marginTop: 12 }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }} {...p} /></div>,
                    th: ({node, ...p}) => <th style={{ background: "#1a1a2e", color: "#a78bfa", padding: "8px 12px", textAlign: "left", borderBottom: "1px solid #2a2a3e" }} {...p} />,
                    td: ({node, ...p}) => <td style={{ padding: "8px 12px", borderBottom: "1px solid #1e1e2e", color: "#aaa" }} {...p} />,
                    blockquote: ({node, ...p}) => <blockquote style={{ borderLeft: "3px solid #4f46e5", paddingLeft: 16, color: "#777", margin: "16px 0" }} {...p} />,
                  }}>
                  {report}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
