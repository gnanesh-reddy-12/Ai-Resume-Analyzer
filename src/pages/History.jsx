import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "../context/useAuth"
import Navbar from "../components/Navbar"

const ease = [0.16, 1, 0.3, 1]

function ScoreRing({ score, size = 56, stroke = 5 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 75 ? "#16A34A" : score >= 55 ? "#D97706" : "#DC2626"
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: "var(--text-1)" }}>{score}%</span>
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

  useEffect(() => {
    if (!token) { navigate("/login"); return }
    fetch(`${import.meta.env.VITE_BACKEND_URL}/history`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setAnalyses(d.analyses || []))
      .finally(() => setLoading(false))
  }, [token, navigate])

  useEffect(() => {
    document.body.style.overflow = selected ? "hidden" : "unset"
    return () => { document.body.style.overflow = "unset" }
  }, [selected])

  const handleDelete = async (id) => {
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/history/${id}`, {
      method: "DELETE", headers: { Authorization: `Bearer ${token}` }
    })
    const updated = analyses.filter(a => a.id !== id)
    setAnalyses(updated)
    if (selected?.id === id) setSelected(null)
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "clamp(24px, 4vw, 40px) clamp(16px, 4vw, 24px) 80px" }}>

        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}
          className="md:flex-row md:items-end md:justify-between"
        >
          <div>
            <span className="section-label">History</span>
            <h1 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800, letterSpacing: "-0.8px", color: "var(--text-1)", marginBottom: 4 }}>Analysis History</h1>
            <p style={{ fontSize: 13, color: "var(--text-3)" }}>{analyses.length} {analyses.length === 1 ? "analysis" : "analyses"} saved</p>
          </div>
          <button className="btn-primary" style={{ fontSize: 13, padding: "10px 22px", width: "fit-content" }} onClick={() => navigate("/")}>+ New Analysis</button>
        </motion.div>

        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <div style={{ width: 32, height: 32, border: "3px solid var(--border-2)", borderTop: `3px solid var(--accent)`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          </div>
        )}

        {!loading && analyses.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ width: 56, height: 56, background: "var(--accent-soft)", border: "1px solid var(--accent-mid)", borderRadius: "var(--r-lg)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "var(--accent)" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.4px", marginBottom: 8 }}>No analyses yet</h2>
            <p style={{ fontSize: 14, color: "var(--text-3)", marginBottom: 24 }}>Analyze your first resume to see results here</p>
            <button className="btn-primary" style={{ padding: "11px 24px", fontSize: 14 }} onClick={() => navigate("/")}>Analyze Resume</button>
          </div>
        )}

        {!loading && analyses.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {analyses.map((a, idx) => {
              const isSelected = selected?.id === a.id
              return (
                <motion.div key={a.id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04, duration: 0.4, ease }}
                  onClick={() => setSelected(a)}
                  className="card"
                  style={{
                    borderRadius: "var(--r-md)", padding: "clamp(14px, 3vw, 20px)",
                    borderColor: isSelected ? "var(--accent)" : "var(--border)",
                    background: isSelected ? "var(--accent-soft)" : "var(--surface)",
                    cursor: "pointer", userSelect: "none",
                    transition: "border-color 0.18s, background 0.18s, box-shadow 0.18s"
                  }}
                  onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = "var(--border-2)"; e.currentTarget.style.boxShadow = "var(--shadow-md)" } }}
                  onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)" } }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <ScoreRing score={a.ats_score} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        {a.company_name && <span style={{ fontWeight: 800, fontSize: 14, color: "var(--text-1)", letterSpacing: "-0.2px" }}>{a.company_name}</span>}
                        {a.job_role && <span className="badge badge-accent" style={{ fontSize: 11, padding: "2px 8px" }}>{a.job_role}</span>}
                      </div>
                      <p style={{ fontSize: 12, color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 360, marginBottom: 2 }}>{a.filename}</p>
                      <p style={{ fontSize: 11, color: "var(--text-3)" }}>
                        {new Date(a.created_at).toLocaleDateString()} · {new Date(a.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(a.id) }}
                        style={{ fontSize: 12, color: "var(--danger)", background: "none", border: "none", cursor: "pointer", padding: "5px 10px", borderRadius: "var(--r-xs)", transition: "background 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--danger-bg)"}
                        onMouseLeave={e => e.currentTarget.style.background = "none"}
                      >
                        Delete
                      </button>
                      <svg width="16" height="16" fill="none" stroke="var(--text-3)" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Detail Drawer */}
        <AnimatePresence>
          {selected && (
            <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, overflow: "hidden" }}>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelected(null)}
                style={{ position: "absolute", inset: 0, background: "rgba(26,22,17,0.45)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
              />
              <div style={{ position: "absolute", inset: "0 0 0 auto", maxWidth: "100%", display: "flex" }}>
                <motion.div
                  initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 28, stiffness: 240 }}
                  style={{ width: "min(650px, 100vw)", background: "var(--surface)", height: "100%", boxShadow: "var(--shadow-lg)", display: "flex", flexDirection: "column", overflow: "hidden", borderLeft: "1px solid var(--border)" }}
                >
                  {/* Drawer Header */}
                  <div style={{ borderBottom: "1px solid var(--border)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg)" }}>
                    <div style={{ minWidth: 0, flex: 1, paddingRight: 16 }}>
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                        {selected.company_name
                          ? <h2 style={{ fontWeight: 800, fontSize: 18, color: "var(--text-1)", letterSpacing: "-0.4px", margin: 0 }}>{selected.company_name}</h2>
                          : <h2 style={{ fontWeight: 800, fontSize: 18, color: "var(--text-1)", letterSpacing: "-0.4px", margin: 0 }}>Analysis Details</h2>
                        }
                        {selected.job_role && <span className="badge badge-accent" style={{ fontSize: 11 }}>{selected.job_role}</span>}
                      </div>
                      <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>📁 {selected.filename}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: "6px 12px" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Score</span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: "var(--accent)" }}>{selected.ats_score}%</span>
                      </div>
                      <button onClick={() => setSelected(null)}
                        style={{ width: 34, height: 34, borderRadius: "var(--r-xs)", border: "1px solid var(--border)", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)", cursor: "pointer", transition: "background 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--bg-2)"}
                        onMouseLeave={e => e.currentTarget.style.background = "var(--surface)"}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                      </button>
                    </div>
                  </div>

                  {/* Drawer Body */}
                  <div className="custom-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
                    <DrawerContent selected={selected} />
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function DrawerContent({ selected }) {
  const suggestionsData = selected.improvement_suggestions || {}
  const isNewFormat = suggestionsData && !Array.isArray(suggestionsData) && typeof suggestionsData === "object"
  const eligibility = isNewFormat ? suggestionsData.eligibility : null
  const warnings = isNewFormat ? suggestionsData.warnings : null
  const jobAnalysis = eligibility?.job_analysis
  const legacySuggestions = Array.isArray(suggestionsData) ? suggestionsData : null
  const suggestions = suggestionsData.suggestions

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* JD Preview */}
      {selected.job_description_preview && (
        <Section label="Job Description">
          <div className="custom-scrollbar" style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: "14px 16px", fontSize: 12, fontFamily: "monospace", whiteSpace: "pre-wrap", maxHeight: 140, overflowY: "auto", color: "var(--text-2)", lineHeight: 1.6 }}>
            {selected.job_description_preview}
          </div>
        </Section>
      )}

      {/* Job Analysis */}
      {jobAnalysis && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <InfoCard label="🎯 What the Job Actually Is" value={jobAnalysis.role_focus} />
          <InfoCard label="🔍 What the Recruiter Needs" value={jobAnalysis.recruiter_needs} />
        </div>
      )}

      {/* Scores */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: "14px 16px" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Keyword Score</p>
          <p style={{ fontSize: 22, fontWeight: 800, color: "var(--accent)" }}>{selected.keyword_score}%</p>
        </div>
        <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: "14px 16px" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Semantic Score</p>
          <p style={{ fontSize: 22, fontWeight: 800, color: "#16A34A" }}>{selected.semantic_score}%</p>
        </div>
      </div>

      {/* Warnings */}
      {warnings?.length > 0 && (
        <div style={{ background: "var(--warning-bg)", border: "1px solid var(--warning-bd)", borderRadius: "var(--r-sm)", padding: "14px 16px" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#B45309", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>⚠️ Warnings ({warnings.length})</p>
          <ul style={{ paddingLeft: 16, display: "flex", flexDirection: "column", gap: 4 }}>
            {warnings.map((w, i) => <li key={i} style={{ fontSize: 12, color: "#92400E" }}>{w}</li>)}
          </ul>
        </div>
      )}

      {/* Keywords */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {selected.matched_keywords?.length > 0 && (
          <div style={{ background: "var(--success-bg)", border: "1px solid var(--success-bd)", borderRadius: "var(--r-sm)", padding: "14px 16px" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#166534", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>✓ Matched <span style={{ background: "#DCFCE7", color: "#166534", borderRadius: 999, padding: "1px 7px", fontSize: 10, marginLeft: 4 }}>{selected.matched_keywords.length}</span></p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {selected.matched_keywords.map((kw, i) => <span key={i} className="tag tag-green" style={{ fontSize: 11 }}>{kw}</span>)}
            </div>
          </div>
        )}
        {selected.missing_keywords?.length > 0 && (
          <div style={{ background: "var(--danger-bg)", border: "1px solid var(--danger-bd)", borderRadius: "var(--r-sm)", padding: "14px 16px" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#C53030", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>✗ Missing <span style={{ background: "#FED7D7", color: "#C53030", borderRadius: 999, padding: "1px 7px", fontSize: 10, marginLeft: 4 }}>{selected.missing_keywords.length}</span></p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {selected.missing_keywords.map((kw, i) => <span key={i} className="tag tag-red" style={{ fontSize: 11 }}>{kw}</span>)}
            </div>
          </div>
        )}
      </div>

      {/* Legacy suggestions */}
      {legacySuggestions?.length > 0 && (
        <Section label="💡 Action Items">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {legacySuggestions.map((item, i) => (
              <div key={i} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: "12px 14px", fontSize: 12, color: "var(--text-2)", lineHeight: 1.6 }}>
                <span style={{ fontWeight: 700, color: "var(--text-1)" }}>Issue:</span> {item.issue}<br />
                <span style={{ fontWeight: 700, color: "var(--text-1)" }}>Fix:</span> {item.fix}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* AI Suggestions */}
      {suggestions && (
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>✨ Saved AI Suggestions</p>

          {suggestions.summary && (
            <Section label="Professional Summary">
              <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: "14px 16px", fontSize: 13, color: "var(--text-1)", lineHeight: 1.7 }}>
                {suggestions.summary}
              </div>
            </Section>
          )}

          {suggestions.ai_snapshot && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <InfoCard label="🌟 Keep" value={suggestions.ai_snapshot.keep} accent="success" />
              <InfoCard label="⚠️ Missing" value={suggestions.ai_snapshot.missing} accent="warning" />
              <InfoCard label="⏳ Gaps" value={suggestions.ai_snapshot.experience_gap} accent="danger" />
            </div>
          )}

          {suggestions.skills_recommendation && (
            <Section label="Skills">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ background: "var(--success-bg)", border: "1px solid var(--success-bd)", borderRadius: "var(--r-sm)", padding: "12px 14px" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#166534", marginBottom: 8 }}>✓ Keep</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {suggestions.skills_recommendation.keep_skills?.map((sk, i) => <span key={i} className="tag tag-green" style={{ fontSize: 10 }}>{sk}</span>)}
                  </div>
                </div>
                <div style={{ background: "var(--accent-soft)", border: "1px solid var(--accent-mid)", borderRadius: "var(--r-sm)", padding: "12px 14px" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", marginBottom: 8 }}>💡 Add</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {suggestions.skills_recommendation.add_skills?.map((sk, i) => <span key={i} className="tag tag-blue" style={{ fontSize: 10 }}>{sk}</span>)}
                  </div>
                </div>
              </div>
              {suggestions.skills_recommendation.integration_advice && (
                <div style={{ marginTop: 10, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: "12px 14px", fontSize: 12, color: "var(--text-2)", lineHeight: 1.6 }}>
                  <span style={{ fontWeight: 700, color: "var(--text-1)" }}>💡 Integration advice: </span>
                  {suggestions.skills_recommendation.integration_advice}
                </div>
              )}
            </Section>
          )}

          {suggestions.sections?.length > 0 && (
            <Section label="Bullet Rewrites">
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {suggestions.sections.map((sect, i) => (
                  <div key={i}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.06em", background: "var(--accent-soft)", border: "1px solid var(--accent-mid)", borderRadius: "var(--r-xs)", padding: "3px 10px", display: "inline-block", marginBottom: 10 }}>{sect.title}</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {sect.bullets?.map((b, bi) => (
                        <div key={bi} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: "12px 14px" }}>
                          <div>
                            <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>Original</p>
                            <p style={{ fontSize: 12, color: "var(--text-3)", textDecoration: "line-through", lineHeight: 1.5 }}>{b.original}</p>
                          </div>
                          <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: 12 }}>
                            <p style={{ fontSize: 10, fontWeight: 700, color: "#16A34A", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>Rewrite</p>
                            <p style={{ fontSize: 12, color: "var(--text-1)", fontWeight: 500, lineHeight: 1.5 }}>{b.rewritten}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      )}

      {/* Legacy summary */}
      {selected.summary_suggestion && (
        <Section label="✨ Summary Suggestion">
          <div style={{ background: "var(--success-bg)", border: "1px solid var(--success-bd)", borderRadius: "var(--r-sm)", padding: "14px 16px", fontSize: 13, color: "var(--text-1)", lineHeight: 1.7 }}>
            {selected.summary_suggestion}
          </div>
        </Section>
      )}

      {/* Legacy bullets */}
      {selected.rewritten_bullets?.length > 0 && (
        <Section label="🛠️ Rewritten Bullets">
          <ul style={{ paddingLeft: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            {selected.rewritten_bullets.map((b, i) => (
              <li key={i} style={{ fontSize: 13, color: "var(--text-1)", lineHeight: 1.6 }}>{b}</li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  )
}

function Section({ label, children }) {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>{label}</p>
      {children}
    </div>
  )
}

function InfoCard({ label, value, accent }) {
  const bg = accent === "success" ? "var(--success-bg)" : accent === "warning" ? "var(--warning-bg)" : accent === "danger" ? "var(--danger-bg)" : "var(--bg)"
  const bd = accent === "success" ? "var(--success-bd)" : accent === "warning" ? "var(--warning-bd)" : accent === "danger" ? "var(--danger-bd)" : "var(--border)"
  return (
    <div style={{ background: bg, border: `1px solid ${bd}`, borderRadius: "var(--r-sm)", padding: "12px 14px" }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.6, whiteSpace: "pre-line" }}>{value}</p>
    </div>
  )
}

export default History