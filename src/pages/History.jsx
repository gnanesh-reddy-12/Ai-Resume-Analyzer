import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "../context/useAuth"
import Navbar from "../components/Navbar"

function ScoreRing({ score, size = 72, stroke = 6 }) {
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
        <span style={{ fontSize: 14, fontWeight: 800, color: "var(--text-1)" }}>{score}%</span>
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
      .then(d => {
        const list = d.analyses || []
        setAnalyses(list)
      })
      .finally(() => setLoading(false))
  }, [token, navigate])

  useEffect(() => {
    if (selected) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [selected])

  const handleDelete = async (id) => {
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/history/${id}`, {
      method: "DELETE", headers: { Authorization: `Bearer ${token}` }
    })
    const updated = analyses.filter(a => a.id !== id)
    setAnalyses(updated)
    if (selected?.id === id) {
      setSelected(null)
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "clamp(24px, 4vw, 40px) clamp(16px, 4vw, 24px) 80px" }}>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16,1,0.3,1] }} style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }} className="md:flex-row md:items-end md:justify-between">
          <div>
            <span className="section-label">History</span>
            <h1 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800, letterSpacing: "-0.8px", color: "var(--text-1)", marginBottom: 4 }}>Analysis History</h1>
            <p style={{ fontSize: 13, color: "var(--text-3)" }}>{analyses.length} {analyses.length === 1 ? "analysis" : "analyses"} saved</p>
          </div>
          <button className="btn-primary" style={{ fontSize: 13, padding: "10px 22px", width: "fit-content" }} onClick={() => navigate("/")}>+ New Analysis</button>
        </motion.div>

        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <div style={{ width: 32, height: 32, border: "3px solid var(--border-2)", borderTop: "3px solid var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          </div>
        )}

        {!loading && analyses.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ width: 56, height: 56, background: "var(--accent-soft)", borderRadius: "var(--r-lg)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "var(--accent)" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.4px", marginBottom: 8 }}>No analyses yet</h2>
            <p style={{ fontSize: 14, color: "var(--text-3)", marginBottom: 24 }}>Analyze your first resume to see results here</p>
            <button className="btn-primary" style={{ padding: "11px 24px", fontSize: 14 }} onClick={() => navigate("/")}>Analyze Resume</button>
          </div>
        )}

        {!loading && analyses.length > 0 && (
          <div className="flex flex-col gap-4">
            {analyses.map((a, idx) => {
              const isSelected = selected?.id === a.id
              return (
                <motion.div key={a.id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04, duration: 0.4, ease: [0.16,1,0.3,1] }}
                  onClick={() => setSelected(a)}
                  className="card cursor-pointer select-none"
                  style={{
                    borderRadius: "var(--r-md)", padding: "clamp(14px, 3vw, 20px)",
                    borderColor: isSelected ? "var(--accent)" : "var(--border)",
                    background: isSelected ? "var(--accent-soft)" : "var(--surface)",
                    transition: "border-color 0.18s, background 0.18s, box-shadow 0.18s"
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = "var(--border-2)"; e.currentTarget.style.boxShadow = "var(--shadow-md)" }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <ScoreRing score={a.ats_score} size={56} stroke={5} />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        {a.company_name && <span style={{ fontWeight: 800, fontSize: 14, color: "var(--text-1)", letterSpacing: "-0.2px" }}>{a.company_name}</span>}
                        {a.job_role && <span className="badge badge-accent" style={{ fontSize: 11, padding: "2px 8px" }}>{a.job_role}</span>}
                      </div>
                      <p style={{ fontSize: 12, color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 360, marginBottom: 2 }}>{a.filename}</p>
                      <p style={{ fontSize: 11, color: "var(--text-3)" }}>
                        {new Date(a.created_at).toLocaleDateString()} · {new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

        {/* Drawer overlay */}
        <AnimatePresence>
          {selected && (
            <div className="fixed inset-0 z-50 overflow-hidden">
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setSelected(null)}
                className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
              />

              {/* Drawer panel */}
              <div className="absolute inset-y-0 right-0 max-w-full flex">
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 26, stiffness: 220 }}
                  className="w-screen md:w-[650px] bg-white h-full shadow-2xl flex flex-col overflow-hidden relative border-l border-slate-200"
                >
                  {/* Drawer Header */}
                  <div className="border-b border-slate-200 px-6 py-5 flex items-center justify-between bg-slate-50">
                    <div className="min-w-0 flex-1 pr-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {selected.company_name ? (
                          <h2 className="font-extrabold text-lg text-slate-900 leading-tight truncate">{selected.company_name}</h2>
                        ) : (
                          <h2 className="font-extrabold text-lg text-slate-900 leading-tight">Analysis Details</h2>
                        )}
                        {selected.job_role && (
                          <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded truncate">
                            {selected.job_role}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 truncate">📁 {selected.filename}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Score:</span>
                        <span className="text-sm font-extrabold text-blue-600">{selected.ats_score}%</span>
                      </div>
                      <button 
                        onClick={() => setSelected(null)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Drawer Body */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-800">
                    {/* Job Description Preview */}
                    {selected.job_description_preview && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                        <span className="font-bold text-slate-700 block mb-1 sticky top-0 bg-slate-50 pb-1">📋 Job Description:</span>
                        {selected.job_description_preview}
                      </div>
                    )}

                    {/* Job Description Intent (New Format) */}
                    {(() => {
                      const suggestionsData = selected.improvement_suggestions || {};
                      const isNewFormat = suggestionsData && !Array.isArray(suggestionsData) && typeof suggestionsData === 'object';
                      const eligibility = isNewFormat ? suggestionsData.eligibility : null;
                      const warnings = isNewFormat ? suggestionsData.warnings : null;
                      const jobAnalysis = eligibility?.job_analysis;
                      const legacySuggestions = Array.isArray(suggestionsData) ? suggestionsData : null;
                      const suggestions = suggestionsData.suggestions;

                      return (
                        <>
                          {jobAnalysis && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">🎯 What the Job Actually Is</p>
                                <p className="text-xs text-slate-700 leading-relaxed">{jobAnalysis.role_focus}</p>
                              </div>
                              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">🔍 What the Recruiter Needs</p>
                                <p className="text-xs text-slate-700 leading-relaxed">{jobAnalysis.recruiter_needs}</p>
                              </div>
                            </div>
                          )}

                          {/* Scores */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Keyword Score</p>
                              <p className="text-xl font-extrabold text-blue-500 mt-1">{selected.keyword_score}%</p>
                            </div>
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Semantic Score</p>
                              <p className="text-xl font-extrabold text-emerald-500 mt-1">{selected.semantic_score}%</p>
                            </div>
                          </div>

                          {/* Warnings (New Format) */}
                          {warnings && warnings.length > 0 && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                              <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                                <span>⚠️</span> Analysis Warnings ({warnings.length})
                              </p>
                              <ul className="list-disc pl-4 text-xs text-amber-800 space-y-1">
                                {warnings.map((w, idx) => <li key={idx}>{w}</li>)}
                              </ul>
                            </div>
                          )}

                          {/* Keywords */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {selected.matched_keywords?.length > 0 && (
                              <div className="bg-green-50/50 border border-green-100 rounded-xl p-4">
                                <p className="font-bold text-xs text-green-800 mb-3 flex items-center gap-1">
                                  <span>✓</span> Matched Keywords <span className="bg-green-100 text-green-700 rounded-full px-2 py-0.5 text-[10px] ml-1">{selected.matched_keywords.length}</span>
                                </p>
                                <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                                  {selected.matched_keywords.map((kw, i) => <span key={i} className="bg-green-100 text-green-800 px-2 py-0.5 rounded">{kw}</span>)}
                                </div>
                              </div>
                            )}
                            {selected.missing_keywords?.length > 0 && (
                              <div className="bg-red-50/50 border border-red-100 rounded-xl p-4">
                                <p className="font-bold text-xs text-red-800 mb-3 flex items-center gap-1">
                                  <span>✗</span> Missing Keywords <span className="bg-red-100 text-red-700 rounded-full px-2 py-0.5 text-[10px] ml-1">{selected.missing_keywords.length}</span>
                                </p>
                                <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                                  {selected.missing_keywords.map((kw, i) => <span key={i} className="bg-red-100 text-red-800 px-2 py-0.5 rounded">{kw}</span>)}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Legacy Action Items / Suggestions */}
                          {legacySuggestions && legacySuggestions.length > 0 && (
                            <div className="bg-amber-50/40 border border-amber-100 rounded-xl p-4">
                              <p className="font-bold text-xs text-amber-800 mb-3">💡 Action Items for Resume Improvement</p>
                              <div className="space-y-2">
                                {legacySuggestions.map((item, i) => (
                                  <div key={i} className="text-xs text-slate-700 leading-relaxed border-b border-slate-100 pb-2 last:border-b-0">
                                    <span className="font-bold text-slate-850">Issue:</span> {item.issue}<br />
                                    <span className="font-bold text-slate-850">Fix:</span> {item.fix}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* AI Suggestions Display inside Drawer */}
                          {suggestions && (
                            <div className="mt-6 pt-6 border-t border-slate-200 space-y-6">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-base">✨</span>
                                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                                  Saved AI Suggestions
                                </h3>
                              </div>
                              
                              {/* Professional Summary */}
                              {suggestions.summary && (
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Professional Summary</p>
                                  <p className="text-xs text-slate-800 leading-relaxed font-medium">{suggestions.summary}</p>
                                </div>
                              )}

                              {/* AI Snapshot */}
                              {suggestions.ai_snapshot && (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  <div className="bg-emerald-50/20 border border-emerald-100 rounded-xl p-3">
                                    <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                      <span>🌟</span> What to Keep
                                    </p>
                                    <p className="text-[10px] text-slate-700 leading-relaxed whitespace-pre-line">{suggestions.ai_snapshot.keep}</p>
                                  </div>
                                  <div className="bg-amber-50/20 border border-amber-100 rounded-xl p-3">
                                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                      <span>⚠️</span> What is Missing
                                    </p>
                                    <p className="text-[10px] text-slate-700 leading-relaxed whitespace-pre-line">{suggestions.ai_snapshot.missing}</p>
                                  </div>
                                  <div className="bg-rose-50/20 border border-rose-100 rounded-xl p-3">
                                    <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                      <span>⏳</span> Gaps & Graduation
                                    </p>
                                    <p className="text-[10px] text-slate-700 leading-relaxed whitespace-pre-line">{suggestions.ai_snapshot.experience_gap}</p>
                                  </div>
                                </div>
                              )}

                              {/* Skills Recommendations */}
                              {suggestions.skills_recommendation && (
                                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Skills & Integration Advice</p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="bg-emerald-50/10 border border-emerald-100 rounded-xl p-3">
                                      <p className="text-[10px] font-bold text-emerald-700 mb-1">✓ Skills to Keep</p>
                                      <div className="flex flex-wrap gap-1 font-mono text-[9px] mt-1">
                                        {suggestions.skills_recommendation.keep_skills?.map((sk, idx) => (
                                          <span key={idx} className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full">{sk}</span>
                                        ))}
                                        {!suggestions.skills_recommendation.keep_skills?.length && <span className="text-slate-400">None</span>}
                                      </div>
                                    </div>
                                    <div className="bg-blue-50/10 border border-blue-100 rounded-xl p-3">
                                      <p className="text-[10px] font-bold text-blue-700 mb-1">💡 Skills to Add</p>
                                      <div className="flex flex-wrap gap-1 font-mono text-[9px] mt-1">
                                        {suggestions.skills_recommendation.add_skills?.map((sk, idx) => (
                                          <span key={idx} className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">{sk}</span>
                                        ))}
                                        {!suggestions.skills_recommendation.add_skills?.length && <span className="text-slate-400">None</span>}
                                      </div>
                                    </div>
                                  </div>
                                  {suggestions.skills_recommendation.integration_advice && (
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[10px] text-slate-600 leading-relaxed">
                                      <p className="font-bold text-slate-700 mb-1 flex items-center gap-1"><span>💡</span> Project & Experience Integration Advice</p>
                                      <p className="whitespace-pre-line">{suggestions.skills_recommendation.integration_advice}</p>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Bullet point suggestions by section */}
                              {suggestions.sections && suggestions.sections.length > 0 && (
                                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tailored Bullet Point Suggestions</p>
                                  <div className="space-y-4">
                                    {suggestions.sections.map((sect, idx) => (
                                      <div key={idx} className="space-y-2 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide bg-indigo-50/50 px-2 py-1 rounded w-fit">{sect.title}</p>
                                        <div className="space-y-3 pl-1">
                                          {sect.bullets?.map((b, bIdx) => (
                                            <div key={bIdx} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pb-2 border-b border-slate-50 last:border-b-0 last:pb-0">
                                              <div className="space-y-0.5">
                                                <span className="text-[8px] font-bold text-slate-400 uppercase">Original</span>
                                                <p className="text-slate-500 line-through decoration-red-200">{b.original}</p>
                                              </div>
                                              <div className="space-y-0.5 border-l-0 sm:border-l sm:pl-3 border-slate-100">
                                                <span className="text-[8px] font-bold text-emerald-600 uppercase">Suggested Rewrite</span>
                                                <p className="text-slate-850 font-medium leading-relaxed">{b.rewritten}</p>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      );
                    })()}

                    {/* Legacy Summary Suggestion */}
                    {selected.summary_suggestion && (
                      <div className="bg-emerald-50/30 border border-emerald-100 rounded-xl p-4">
                        <p className="font-bold text-xs text-emerald-800 mb-2">✨ Recruiter-Optimized Summary Suggestion</p>
                        <p className="text-xs text-slate-700 leading-relaxed">{selected.summary_suggestion}</p>
                      </div>
                    )}

                    {/* Legacy Rewritten Bullets */}
                    {selected.rewritten_bullets && selected.rewritten_bullets.length > 0 && (
                      <div className="bg-indigo-50/30 border border-indigo-100 rounded-xl p-4">
                        <p className="font-bold text-xs text-indigo-800 mb-3">🛠️ Rewritten Bullet Points</p>
                        <ul className="list-disc pl-4 text-xs text-slate-700 space-y-2">
                          {selected.rewritten_bullets.map((bullet, idx) => <li key={idx} className="leading-relaxed">{bullet}</li>)}
                        </ul>
                      </div>
                    )}
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

export default History