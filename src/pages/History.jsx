import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "../context/useAuth"
import Navbar from "../components/Navbar"

function ScoreRing({ score, size = 80, stroke = 7 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 75 ? "#10B981" : score >= 55 ? "#F59E0B" : "#EF4444"
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F1F5F9" strokeWidth={stroke} />
        <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 16, fontWeight: 800, color: "var(--text-1)" }}>{score}%</span>
      </div>
    </div>
  )
}

function History() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [labels, setLabels] = useState({}) // { [id]: { company, role } }
  const [editingLabel, setEditingLabel] = useState(null)
  const [labelDraft, setLabelDraft] = useState({ company: "", role: "" })

  useEffect(() => {
    if (!token) { navigate("/login"); return }
    fetch(`${import.meta.env.VITE_BACKEND_URL}/history`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => {
        const list = d.analyses || []
        setAnalyses(list)
        if (list.length) setSelected(list[0])
        const saved = JSON.parse(localStorage.getItem("history_labels") || "{}")
        setLabels(saved)
      })
      .finally(() => setLoading(false))
  }, [token, navigate])

  const handleDelete = async (id) => {
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/history/${id}`, {
      method: "DELETE", headers: { Authorization: `Bearer ${token}` }
    })
    const updated = analyses.filter(a => a.id !== id)
    setAnalyses(updated)
    setSelected(updated.length ? updated[0] : null)
    const newLabels = { ...labels }
    delete newLabels[id]
    setLabels(newLabels)
    localStorage.setItem("history_labels", JSON.stringify(newLabels))
  }

  const saveLabel = (id) => {
    const newLabels = { ...labels, [id]: labelDraft }
    setLabels(newLabels)
    localStorage.setItem("history_labels", JSON.stringify(newLabels))
    setEditingLabel(null)
  }


  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 80px" }}>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>History</p>
            <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.5px" }}>Analysis History</h1>
            <p style={{ color: "var(--text-2)", marginTop: 4, fontSize: 14 }}>{analyses.length} {analyses.length === 1 ? "analysis" : "analyses"} saved</p>
          </div>
          <button className="btn-primary" style={{ padding: "10px 22px", fontSize: 13 }} onClick={() => navigate("/")}>+ New Analysis</button>
        </motion.div>

        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <div style={{ width: 32, height: 32, border: "4px solid #DBEAFE", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}></div>
          </div>
        )}

        {!loading && analyses.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>No analyses yet</h2>
            <p style={{ color: "var(--text-2)", marginTop: 8 }}>Analyze your first resume to see results here</p>
            <button className="btn-primary" style={{ marginTop: 20 }} onClick={() => navigate("/")}>Analyze Resume</button>
          </div>
        )}

        {!loading && analyses.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20, alignItems: "start" }}>

            {/* List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {analyses.map((a, idx) => {
                const lbl = labels[a.id] || {}
                const isSelected = selected?.id === a.id
                return (
                  <motion.div key={a.id}
                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                    onClick={() => setSelected(a)}
                    style={{ background: "white", border: `1.5px solid ${isSelected ? "var(--accent)" : "var(--border)"}`, borderRadius: 16, padding: 16, cursor: "pointer", transition: "border-color 0.15s, box-shadow 0.15s", boxShadow: isSelected ? "0 0 0 3px rgba(59,130,246,0.1)" : "none" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <ScoreRing score={a.ats_score} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Company + Role labels */}
                        {editingLabel === a.id ? (
                          <div onClick={e => e.stopPropagation()} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <input value={labelDraft.company} onChange={e => setLabelDraft(p => ({ ...p, company: e.target.value }))} placeholder="Company name" style={{ border: "1.5px solid var(--accent)", borderRadius: 8, padding: "4px 8px", fontSize: 12, outline: "none", fontFamily: "Inter, sans-serif" }} />
                            <input value={labelDraft.role} onChange={e => setLabelDraft(p => ({ ...p, role: e.target.value }))} placeholder="Job role" style={{ border: "1.5px solid var(--accent)", borderRadius: 8, padding: "4px 8px", fontSize: 12, outline: "none", fontFamily: "Inter, sans-serif" }} onKeyDown={e => e.key === "Enter" && saveLabel(a.id)} />
                            <div style={{ display: "flex", gap: 6 }}>
                              <button onClick={() => saveLabel(a.id)} style={{ background: "var(--accent)", color: "white", border: "none", borderRadius: 6, padding: "3px 10px", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>Save</button>
                              <button onClick={() => setEditingLabel(null)} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: "3px 8px", fontSize: 11, cursor: "pointer" }}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {lbl.company || lbl.role ? (
                              <div style={{ marginBottom: 4 }}>
                                {lbl.company && <p style={{ fontWeight: 700, fontSize: 13, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lbl.company}</p>}
                                {lbl.role && <p style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>{lbl.role}</p>}
                              </div>
                            ) : (
                              <p style={{ fontWeight: 600, fontSize: 13, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2 }}>{a.filename}</p>
                            )}
                            <p style={{ fontSize: 11, color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.job_description_preview}</p>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                              <span style={{ fontSize: 11, color: "var(--text-3)" }}>{new Date(a.created_at).toLocaleDateString()}</span>
                              <div style={{ display: "flex", gap: 8 }}>
                                <button onClick={e => { e.stopPropagation(); setLabelDraft(lbl.company ? lbl : { company: "", role: "" }); setEditingLabel(a.id) }} style={{ fontSize: 11, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>
                                  {lbl.company ? "Edit" : "+ Label"}
                                </button>
                                <button onClick={e => { e.stopPropagation(); handleDelete(a.id) }} style={{ fontSize: 11, color: "var(--danger)", background: "none", border: "none", cursor: "pointer" }}>Delete</button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Detail panel */}
            <AnimatePresence mode="wait">
              {selected && (
                <motion.div key={selected.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                  {/* Score header */}
                  <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 20, padding: 28 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
                      <div>
                        {labels[selected.id]?.company && <p style={{ fontWeight: 800, fontSize: 18, color: "var(--text-1)" }}>{labels[selected.id].company}</p>}
                        {labels[selected.id]?.role && <p style={{ fontSize: 14, color: "var(--accent)", fontWeight: 600, marginTop: 2 }}>{labels[selected.id].role}</p>}
                        <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: labels[selected.id]?.company ? 4 : 0 }}>{selected.filename}</p>
                        <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>{new Date(selected.created_at).toLocaleString()}</p>
                      </div>
                      <ScoreRing score={selected.ats_score} size={90} stroke={8} />
                    </div>

                    <div style={{ padding: "12px 16px", borderRadius: 12, background: selected.can_apply ? "#F0FDF4" : "#FEF2F2", border: `1px solid ${selected.can_apply ? "#BBF7D0" : "#FECACA"}`, fontSize: 13, fontWeight: 600, color: selected.can_apply ? "#166534" : "#991B1B", marginBottom: 16 }}>
                      {selected.can_apply ? "✅" : "⚠️"} {selected.apply_verdict}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div style={{ background: "var(--bg)", borderRadius: 12, padding: "14px 16px" }}>
                        <p style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600 }}>KEYWORD SCORE</p>
                        <p style={{ fontSize: 24, fontWeight: 800, color: "var(--accent)", marginTop: 4 }}>{selected.keyword_score}%</p>
                      </div>
                      <div style={{ background: "var(--bg)", borderRadius: 12, padding: "14px 16px" }}>
                        <p style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600 }}>SEMANTIC SCORE</p>
                        <p style={{ fontSize: 24, fontWeight: 800, color: "#10B981", marginTop: 4 }}>{selected.semantic_score}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Keywords */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    {selected.matched_keywords?.length > 0 && (
                      <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
                        <p style={{ fontWeight: 700, fontSize: 13, color: "var(--text-1)", marginBottom: 12 }}>✓ Matched <span style={{ background: "#DCFCE7", color: "#166534", borderRadius: 999, padding: "1px 7px", fontSize: 11, marginLeft: 4 }}>{selected.matched_keywords.length}</span></p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {selected.matched_keywords.map((k, i) => <span key={i} className="tag tag-green">{k}</span>)}
                        </div>
                      </div>
                    )}
                    {selected.missing_keywords?.length > 0 && (
                      <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
                        <p style={{ fontWeight: 700, fontSize: 13, color: "var(--text-1)", marginBottom: 12 }}>✗ Missing <span style={{ background: "#FEE2E2", color: "#991B1B", borderRadius: 999, padding: "1px 7px", fontSize: 11, marginLeft: 4 }}>{selected.missing_keywords.length}</span></p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {selected.missing_keywords.map((k, i) => <span key={i} className="tag tag-red">{k}</span>)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Suggestions */}
                  {selected.improvement_suggestions?.length > 0 && (
                    <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
                      <p style={{ fontWeight: 700, fontSize: 13, color: "var(--text-1)", marginBottom: 14 }}>🛠 Improvement Suggestions</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {selected.improvement_suggestions.map((s, i) => (
                          <div key={i} style={{ background: "var(--bg)", borderRadius: 12, padding: 14, border: "1px solid var(--border)" }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", marginBottom: 6 }}>{s.section}</p>
                            <p style={{ fontSize: 13, color: "#DC2626", marginBottom: 4 }}>⚠ {s.issue}</p>
                            <p style={{ fontSize: 13, color: "#16A34A" }}>✅ {s.fix}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  {selected.summary_suggestion && (
                    <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
                      <p style={{ fontWeight: 700, fontSize: 13, color: "var(--text-1)", marginBottom: 10 }}>💡 Suggested Summary</p>
                      <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.7 }}>{selected.summary_suggestion}</p>
                    </div>
                  )}

                  {/* Bullets */}
                  {selected.rewritten_bullets?.length > 0 && (
                    <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
                      <p style={{ fontWeight: 700, fontSize: 13, color: "var(--text-1)", marginBottom: 12 }}>✍️ Rewritten Bullets</p>
                      <ul style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {selected.rewritten_bullets.map((b, i) => (
                          <li key={i} style={{ display: "flex", gap: 10, fontSize: 13, color: "var(--text-2)", listStyle: "none" }}>
                            <span style={{ color: "var(--accent)", flexShrink: 0, marginTop: 1 }}>▸</span>{b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

export default History