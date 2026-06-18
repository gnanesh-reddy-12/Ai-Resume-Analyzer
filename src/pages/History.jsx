import { useEffect, useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import CompanyLogo from "../components/CompanyLogo"
import { useAuth } from "../context/useAuth"
import Navbar from "../components/Navbar"
import { supabase } from "../supabase"

const ease = [0.22, 1, 0.36, 1]

function ScoreRing({ score, size = 52, stroke = 4.5 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 75 ? "var(--success)" : score >= 55 ? "var(--warning)" : "var(--danger)"
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg)" strokeWidth={stroke}/>
        <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: "easeOut" }}/>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: "var(--text-1)", lineHeight: 1 }}>{score}%</span>
        <span style={{ fontSize: 8, fontWeight: 600, color, marginTop: 1 }}>ATS</span>
      </div>
    </div>
  )
}

function InfoCard({ label, value, accent }) {
  const bd = accent ? `var(--${accent}-bd)` : "var(--border)"
  const col = accent ? `var(--${accent})` : "var(--text-3)"
  return (
    <div style={{ background: accent ? `var(--${accent}-bg)` : "var(--bg)", border: `1px solid ${bd}`, borderRadius: "var(--r-md)", padding: "12px 14px" }}>
      <p style={{ fontSize: 10.5, fontWeight: 700, color: col, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.6, whiteSpace: "pre-line" }}>{value}</p>
    </div>
  )
}

export default function History() {
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("date")
  const [activeMenuId, setActiveMenuId] = useState(null)

  useEffect(() => {
    if (!user) { navigate("/login"); return }
    supabase
      .from("analyses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (!error && data) setAnalyses(data)
        setLoading(false)
      })
  }, [user, navigate])

  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('.hist-menu-container')) setActiveMenuId(null)
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

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

  const filtered = useMemo(() => {
    let res = analyses
    if (search.trim()) {
      const q = search.toLowerCase()
      res = res.filter(a =>
        a.company_name?.toLowerCase().includes(q) ||
        a.job_role?.toLowerCase().includes(q) ||
        a.filename?.toLowerCase().includes(q)
      )
    }
    if (sortBy === "score-high") res = [...res].sort((a, b) => (b.ats_score || 0) - (a.ats_score || 0))
    if (sortBy === "score-low")  res = [...res].sort((a, b) => (a.ats_score || 0) - (b.ats_score || 0))
    if (sortBy === "date")       res = [...res].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    return res
  }, [analyses, search, sortBy])

  const scoreDelta = (a) => {
    const idx = analyses.findIndex(x => x.id === a.id)
    const prev = analyses[idx + 1]
    if (!prev) return null
    return (a.ats_score || 0) - (prev.ats_score || 0)
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "clamp(28px,4vw,48px) clamp(16px,4vw,24px) 96px" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}
          style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
          <div>
            <span className="section-label">History</span>
            <h1 style={{ fontSize: "clamp(22px,4vw,30px)", fontWeight: 800, letterSpacing: "-0.8px", marginBottom: 4 }}>Analysis History</h1>
            <p style={{ fontSize: 13, color: "var(--text-3)" }}>{analyses.length} {analyses.length === 1 ? "analysis" : "analyses"} saved</p>
          </div>
          <button className="btn-accent" style={{ padding: "10px 22px", fontSize: 13 }} onClick={() => navigate("/")}>+ New Analysis</button>
        </motion.div>

        {/* Filter / sort bar */}
        {analyses.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}
            style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
              <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                className="input-ek"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by company, role, or file…"
                style={{ paddingLeft: 36 }}
              />
            </div>
            <select
              className="input-ek"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{ width: "auto", minWidth: 150 }}
            >
              <option value="date">Sort: Newest First</option>
              <option value="score-high">Sort: Highest Score</option>
              <option value="score-low">Sort: Lowest Score</option>
            </select>
          </motion.div>
        )}

        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <div style={{ width: 32, height: 32, border: "3px solid var(--border-2)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.75s linear infinite" }} />
          </div>
        )}

        {!loading && analyses.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ width: 56, height: 56, background: "var(--accent-soft)", border: "1px solid var(--accent-mid)", borderRadius: "var(--r-xl)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "var(--accent)" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 8 }}>No analyses yet</h2>
            <p style={{ fontSize: 14, color: "var(--text-3)", marginBottom: 28, lineHeight: 1.6 }}>Analyze your first resume to see results here</p>
            <button className="btn-accent" style={{ padding: "11px 28px", fontSize: 14 }} onClick={() => navigate("/")}>Analyze Resume</button>
          </div>
        )}

        {!loading && filtered.length === 0 && analyses.length > 0 && (
          <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--text-3)" }}>
            <p style={{ fontSize: 14, marginBottom: 8 }}>No results match "{search}"</p>
            <button onClick={() => setSearch("")} style={{ fontSize: 13, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}>Clear search</button>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((a, idx) => {
              const isSelected = selected?.id === a.id
              const delta = scoreDelta(a)
              return (
                <motion.div
                  key={a.id}
                  className="ek-card"
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.035, duration: 0.4, ease }}
                  whileHover={{ scale: 1.015, y: -2, transition: { type: "spring", stiffness: 400, damping: 25 } }}
                  style={{
                    zIndex: activeMenuId === a.id ? 50 : 1,
                    background: isSelected ? "var(--accent-soft)" : "var(--surface)",
                    border: `1px solid ${isSelected ? "var(--accent)" : "var(--border)"}`,
                    borderRadius: "var(--r-xl)", padding: "clamp(14px,3vw,18px) clamp(16px,3vw,22px)",
                    userSelect: "none",
                    transition: "border-color 0.15s, background 0.15s, box-shadow 0.15s"
                  }}
                  onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = "var(--border-2)"; e.currentTarget.style.boxShadow = "var(--shadow-md)" } }}
                  onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none" } }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <ScoreRing score={a.ats_score} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                        {a.company_name && (
                          <>
                            <CompanyLogo name={a.company_name} size={18} />
                            <span style={{ fontWeight: 800, fontSize: 14, color: "var(--text-1)", letterSpacing: "-0.3px" }}>{a.company_name}</span>
                          </>
                        )}
                        {a.job_role && <span className="badge badge-accent">{a.job_role}</span>}
                        {delta !== null && (
                          <span style={{ fontSize: 11.5, fontWeight: 700, color: delta > 0 ? "var(--success)" : delta < 0 ? "var(--danger)" : "var(--text-3)" }}>
                            {delta > 0 ? `↑ +${delta}%` : delta < 0 ? `↓ ${delta}%` : "—"}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 12.5, color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 380 }}>{a.filename}</p>
                      <p style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 2 }}>
                        {new Date(a.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {new Date(a.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      {/* Menu */}
                      <div className="hist-menu-container" style={{ position: "relative" }}>
                        <button
                          onClick={e => { e.stopPropagation(); setActiveMenuId(activeMenuId === a.id ? null : a.id) }}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-1)", padding: "4px", transition: "color 0.15s", display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: "50%" }}
                          onMouseEnter={e => e.currentTarget.style.color = "var(--accent)"}
                          onMouseLeave={e => e.currentTarget.style.color = "var(--text-1)"}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="2"/><circle cx="12" cy="5" r="2"/><circle cx="12" cy="19" r="2"/></svg>
                        </button>
                        <AnimatePresence>
                          {activeMenuId === a.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.1 }}
                              style={{
                                position: "absolute", top: "100%", right: 0, marginTop: 4,
                                background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--r-md)",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 10, width: 160, overflow: "hidden"
                              }}
                            >
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  setActiveMenuId(null);
                                  setSelected(a);
                                }}
                                style={{
                                  width: "100%", padding: "12px 16px", textAlign: "left", background: "none", border: "none",
                                  fontSize: 13, fontWeight: 500, color: "var(--text-1)", cursor: "pointer", fontFamily: "inherit",
                                  borderBottom: "1px solid var(--border-2)"
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "var(--surface)"}
                                onMouseLeave={e => e.currentTarget.style.background = "none"}
                              >
                                View Analysis
                              </button>
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  setActiveMenuId(null);
                                  if (window.confirm("Are you sure you want to delete this analysis?")) handleDelete(a.id);
                                }}
                                style={{
                                  width: "100%", padding: "12px 16px", textAlign: "left", background: "none", border: "none",
                                  fontSize: 13, fontWeight: 500, color: "var(--danger)", cursor: "pointer", fontFamily: "inherit"
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "var(--danger-bg)"}
                                onMouseLeave={e => e.currentTarget.style.background = "none"}
                              >
                                Remove Analysis
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      <AnimatePresence>
        {selected && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, overflow: "hidden" }}>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              style={{ position: "absolute", inset: 0, background: "rgba(13,15,18,0.4)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
            />
            <div style={{ position: "absolute", inset: "0 0 0 auto", display: "flex" }}>
              <motion.div
                initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 260 }}
                style={{
                  width: "min(660px,100vw)", background: "var(--surface)", height: "100%",
                  boxShadow: "var(--shadow-lg)", display: "flex", flexDirection: "column",
                  overflow: "hidden", borderLeft: "1px solid var(--border)"
                }}
              >
                {/* Drawer header */}
                <div style={{ borderBottom: "1px solid var(--border)", padding: "20px 24px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", background: "var(--bg)", flexShrink: 0 }}>
                  <div style={{ minWidth: 0, flex: 1, paddingRight: 16 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <h2 style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.5px", margin: 0 }}>
                        {selected.company_name || "Analysis Details"}
                      </h2>
                      {selected.job_role && <span className="badge badge-accent">{selected.job_role}</span>}
                    </div>
                    <p style={{ fontSize: 12, color: "var(--text-3)" }}>{selected.filename}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "6px 14px" }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: "var(--accent)", lineHeight: 1 }}>{selected.ats_score}%</span>
                      <span style={{ fontSize: 9.5, fontWeight: 600, color: "var(--text-3)", marginTop: 2 }}>ATS Score</span>
                    </div>
                    <button
                      onClick={() => setSelected(null)}
                      style={{ width: 36, height: 36, borderRadius: "var(--r-sm)", border: "1px solid var(--border)", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)", cursor: "pointer" }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                  </div>
                </div>

                {/* Drawer body */}
                <div className="custom-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
                  <DrawerContent selected={selected} />
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function HighlightedJD({ text, matched, missing, optional }) {
  if (!text) return null
  const allKeywords = [
    ...(matched || []).map(k => ({ word: k, type: "matched" })),
    ...(missing || []).map(k => ({ word: k, type: "missing" })),
    ...(optional || []).map(k => ({ word: k, type: "optional" })),
  ].sort((a, b) => b.word.length - a.word.length)
  
  if (!allKeywords.length) {
    return <div className="custom-scrollbar" style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "13px 15px", fontSize: 12.5, whiteSpace: "pre-wrap", maxHeight: 130, overflowY: "auto", color: "var(--text-2)", lineHeight: 1.65 }}>{text}</div>
  }
  
  const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const pattern = new RegExp(`\\b(${allKeywords.map(k => escape(k.word)).join("|")})\\b`, "gi")
  const parts = text.split(pattern)
  
  return (
    <div className="custom-scrollbar" style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "13px 15px", fontSize: 12.5, whiteSpace: "pre-wrap", maxHeight: 130, overflowY: "auto", color: "var(--text-2)", lineHeight: 1.65 }}>
      {parts.map((part, i) => {
        const kw = allKeywords.find(k => k.word.toLowerCase() === part.toLowerCase())
        if (kw?.type === "matched") return <mark key={i} style={{ background: "transparent", borderBottom: "2px solid var(--success)", color: "var(--text-1)", padding: "0 1px", fontWeight: 600 }}>{part}</mark>
        if (kw?.type === "missing") return <mark key={i} style={{ background: "transparent", borderBottom: "2px solid var(--danger)", color: "var(--text-1)", padding: "0 1px", fontWeight: 600 }}>{part}</mark>
        if (kw?.type === "optional") return <mark key={i} style={{ background: "transparent", borderBottom: "2px solid var(--warning)", color: "var(--text-1)", padding: "0 1px", fontWeight: 600 }}>{part}</mark>
        return <span key={i}>{part}</span>
      })}
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

      {selected.job_description_preview && (
        <DrawerSection label="Job Description">
          <HighlightedJD 
            text={selected.job_description_preview} 
            matched={selected.matched_keywords} 
            missing={selected.missing_keywords} 
            optional={selected.optional_keywords} 
          />
        </DrawerSection>
      )}

      {jobAnalysis && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <InfoCard label="Role Focus" value={jobAnalysis.role_focus} />
          <InfoCard label="Recruiter Needs" value={jobAnalysis.recruiter_needs} />
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {selected.keyword_score !== undefined && (
          <div style={{ background: "var(--accent-soft)", border: "1px solid var(--accent-mid)", borderRadius: "var(--r-md)", padding: "14px 16px" }}>
            <p style={{ fontSize: 10.5, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Keyword Score</p>
            <p style={{ fontSize: 24, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-1px" }}>{selected.keyword_score}%</p>
          </div>
        )}
        {selected.semantic_score !== undefined && (
          <div style={{ background: "var(--success-bg)", border: "1px solid var(--success-bd)", borderRadius: "var(--r-md)", padding: "14px 16px" }}>
            <p style={{ fontSize: 10.5, fontWeight: 700, color: "var(--success)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Semantic Score</p>
            <p style={{ fontSize: 24, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-1px" }}>{selected.semantic_score}%</p>
          </div>
        )}
      </div>

      {warnings?.length > 0 && (
        <div style={{ background: "var(--warning-bg)", border: "1px solid var(--warning-bd)", borderRadius: "var(--r-md)", padding: "14px 16px" }}>
          <p style={{ fontSize: 10.5, fontWeight: 700, color: "var(--warning)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>⚠ Warnings ({warnings.length})</p>
          <ul style={{ paddingLeft: 16, display: "flex", flexDirection: "column", gap: 5 }}>
            {warnings.map((w, i) => <li key={i} style={{ fontSize: 13, color: "var(--warning)", lineHeight: 1.5 }}>{w}</li>)}
          </ul>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {selected.matched_keywords?.length > 0 && (
          <div style={{ background: "var(--success-bg)", border: "1px solid var(--success-bd)", borderRadius: "var(--r-md)", padding: "14px 16px" }}>
            <p style={{ fontSize: 10.5, fontWeight: 700, color: "var(--success)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
              ✓ Matched <span style={{ background: "var(--success-bd)", borderRadius: 99, padding: "1px 7px", fontSize: 10, marginLeft: 4 }}>{selected.matched_keywords.length}</span>
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {selected.matched_keywords.map((kw, i) => <span key={i} className="tag tag-green" style={{ fontSize: 11 }}>{kw}</span>)}
            </div>
          </div>
        )}
        {selected.missing_keywords?.length > 0 && (
          <div style={{ background: "var(--danger-bg)", border: "1px solid var(--danger-bd)", borderRadius: "var(--r-md)", padding: "14px 16px" }}>
            <p style={{ fontSize: 10.5, fontWeight: 700, color: "var(--danger)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
              ✗ Missing <span style={{ background: "var(--danger-bd)", borderRadius: 99, padding: "1px 7px", fontSize: 10, marginLeft: 4 }}>{selected.missing_keywords.length}</span>
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {selected.missing_keywords.map((kw, i) => <span key={i} className="tag tag-red" style={{ fontSize: 11 }}>{kw}</span>)}
            </div>
          </div>
        )}
      </div>

      {legacySuggestions?.length > 0 && (
        <DrawerSection label="Action Items">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {legacySuggestions.map((item, i) => (
              <div key={i} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "12px 14px", fontSize: 13, color: "var(--text-2)", lineHeight: 1.65 }}>
                <span style={{ fontWeight: 700, color: "var(--text-1)" }}>Issue:</span> {item.issue}<br />
                <span style={{ fontWeight: 700, color: "var(--text-1)" }}>Fix:</span> {item.fix}
              </div>
            ))}
          </div>
        </DrawerSection>
      )}

      {suggestions && (
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ fontSize: 10.5, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Saved AI Suggestions</p>

          {suggestions.summary && (
            <DrawerSection label="Professional Summary">
              <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "14px 16px", fontSize: 13.5, color: "var(--text-1)", lineHeight: 1.75 }}>
                {suggestions.summary}
              </div>
            </DrawerSection>
          )}

          {suggestions.ai_snapshot && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
              <InfoCard label="Keep" value={suggestions.ai_snapshot.keep} accent="success" />
              <InfoCard label="Missing" value={suggestions.ai_snapshot.missing} accent="warning" />
              <InfoCard label="Gaps" value={suggestions.ai_snapshot.experience_gap} accent="danger" />
            </div>
          )}

          {suggestions.skills_recommendation && (
            <DrawerSection label="Skills">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ background: "var(--success-bg)", border: "1px solid var(--success-bd)", borderRadius: "var(--r-md)", padding: "12px 14px" }}>
                  <p style={{ fontSize: 10.5, fontWeight: 700, color: "var(--success)", marginBottom: 8 }}>✓ Keep</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {suggestions.skills_recommendation.keep_skills?.map((sk, i) => <span key={i} className="tag tag-green" style={{ fontSize: 10.5 }}>{sk}</span>)}
                  </div>
                </div>
                <div style={{ background: "var(--accent-soft)", border: "1px solid var(--accent-mid)", borderRadius: "var(--r-md)", padding: "12px 14px" }}>
                  <p style={{ fontSize: 10.5, fontWeight: 700, color: "var(--accent)", marginBottom: 8 }}>+ Add</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {suggestions.skills_recommendation.add_skills?.map((sk, i) => <span key={i} className="tag tag-blue" style={{ fontSize: 10.5 }}>{sk}</span>)}
                  </div>
                </div>
              </div>
              {suggestions.skills_recommendation.integration_advice && (
                <div style={{ marginTop: 10, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "12px 14px", fontSize: 13, color: "var(--text-2)", lineHeight: 1.65 }}>
                  <span style={{ fontWeight: 700, color: "var(--text-1)" }}>Advice: </span>{suggestions.skills_recommendation.integration_advice}
                </div>
              )}
            </DrawerSection>
          )}

          {suggestions.sections?.length > 0 && (
            <DrawerSection label="Bullet Rewrites">
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {suggestions.sections.map((sect, i) => (
                  <div key={i}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.06em", background: "var(--accent-soft)", border: "1px solid var(--accent-mid)", borderRadius: "var(--r-xs)", padding: "3px 10px", display: "inline-block", marginBottom: 9 }}>{sect.title}</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {sect.bullets?.map((b, bi) => (
                        <div key={bi} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "12px 14px" }}>
                          <div>
                            <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>Original</p>
                            <p style={{ fontSize: 12.5, color: "var(--text-3)", textDecoration: "line-through", lineHeight: 1.55 }}>{b.original}</p>
                          </div>
                          <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: 12 }}>
                            <p style={{ fontSize: 10, fontWeight: 700, color: "var(--success)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>Rewrite</p>
                            <p style={{ fontSize: 12.5, color: "var(--text-1)", fontWeight: 500, lineHeight: 1.55 }}>{b.rewritten}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </DrawerSection>
          )}
        </div>
      )}

      {selected.summary_suggestion && (
        <DrawerSection label="Summary Suggestion">
          <div style={{ background: "var(--success-bg)", border: "1px solid var(--success-bd)", borderRadius: "var(--r-md)", padding: "14px 16px", fontSize: 13.5, color: "var(--text-1)", lineHeight: 1.75 }}>
            {selected.summary_suggestion}
          </div>
        </DrawerSection>
      )}

      {selected.rewritten_bullets?.length > 0 && (
        <DrawerSection label="Rewritten Bullets">
          <ul style={{ paddingLeft: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            {selected.rewritten_bullets.map((b, i) => <li key={i} style={{ fontSize: 13.5, color: "var(--text-1)", lineHeight: 1.65 }}>{b}</li>)}
          </ul>
        </DrawerSection>
      )}
    </div>
  )
}

function DrawerSection({ label, children }) {
  return (
    <div>
      <p style={{ fontSize: 10.5, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>{label}</p>
      {children}
    </div>
  )
}