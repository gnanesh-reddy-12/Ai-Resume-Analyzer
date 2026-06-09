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
        if (list.length) setSelected(list[0])
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
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10 pb-20">

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
          <div>
            <p className="text-blue-500 text-xs font-semibold uppercase tracking-widest mb-1">History</p>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Analysis History</h1>
            <p className="text-slate-500 mt-1 text-sm">{analyses.length} {analyses.length === 1 ? "analysis" : "analyses"} saved</p>
          </div>
          <button className="btn-primary" style={{ fontSize: 13, padding: "10px 22px", width: "fit-content" }} onClick={() => navigate("/")}>+ New Analysis</button>
        </motion.div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}

        {!loading && analyses.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-xl font-bold text-slate-900">No analyses yet</h2>
            <p className="text-slate-500 mt-2 text-sm">Analyze your first resume to see results here</p>
            <button className="btn-primary mt-5" onClick={() => navigate("/")}>Analyze Resume</button>
          </div>
        )}

        {!loading && analyses.length > 0 && (
          <div className="flex flex-col gap-4">
            {analyses.map((a, idx) => {
              const isExpanded = selected?.id === a.id
              return (
                <motion.div key={a.id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                  className="card p-4 md:p-6 transition-all border border-slate-200 hover:border-slate-300"
                  style={{ boxShadow: isExpanded ? "0 4px 20px rgba(0,0,0,0.06)" : "none", borderRadius: 16 }}
                >
                  {/* Card Header Row */}
                  <div 
                    onClick={() => setSelected(isExpanded ? null : a)}
                    className="flex items-center gap-4 cursor-pointer select-none"
                  >
                    <ScoreRing score={a.ats_score} size={64} stroke={6} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {a.company_name && <span className="font-extrabold text-sm md:text-base text-slate-900">{a.company_name}</span>}
                        {a.job_role && <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded">{a.job_role}</span>}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 truncate max-w-md">{a.filename}</p>
                      <p className="text-[10px] md:text-xs text-slate-400 mt-0.5">
                        {new Date(a.created_at).toLocaleDateString()} · {new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button 
                        onClick={e => { e.stopPropagation(); handleDelete(a.id) }} 
                        className="text-xs text-red-500 hover:text-red-700 bg-none border-none cursor-pointer px-2 py-1 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                      
                      {/* Chevron indicator */}
                      <span className="text-slate-400 transition-transform duration-200" style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </span>
                    </div>
                  </div>

                  {/* Expandable Details Section */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden mt-4 pt-4 border-t border-slate-100"
                      >
                        {/* Detail Contents */}
                        <div className="flex flex-col gap-4">
                          {/* Scores */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 rounded-xl p-3 md:p-4">
                              <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">Keyword Score</p>
                              <p className="text-lg md:text-2xl font-extrabold text-blue-500 mt-1">{a.keyword_score}%</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-3 md:p-4">
                              <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">Semantic Score</p>
                              <p className="text-lg md:text-2xl font-extrabold text-emerald-500 mt-1">{a.semantic_score}%</p>
                            </div>
                          </div>

                          {/* Keywords */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {a.matched_keywords?.length > 0 && (
                              <div className="bg-green-50/50 border border-green-100 rounded-xl p-4">
                                <p className="font-bold text-xs text-green-800 mb-3 flex items-center gap-1">
                                  <span>✓</span> Matched Keywords <span className="bg-green-100 text-green-700 rounded-full px-2 py-0.5 text-[10px] ml-1">{a.matched_keywords.length}</span>
                                </p>
                                <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                                  {a.matched_keywords.map((kw, i) => <span key={i} className="bg-green-100 text-green-800 px-2 py-0.5 rounded">{kw}</span>)}
                                </div>
                              </div>
                            )}
                            {a.missing_keywords?.length > 0 && (
                              <div className="bg-red-50/50 border border-red-100 rounded-xl p-4">
                                <p className="font-bold text-xs text-red-800 mb-3 flex items-center gap-1">
                                  <span>✗</span> Missing Keywords <span className="bg-red-100 text-red-700 rounded-full px-2 py-0.5 text-[10px] ml-1">{a.missing_keywords.length}</span>
                                </p>
                                <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                                  {a.missing_keywords.map((kw, i) => <span key={i} className="bg-red-100 text-red-800 px-2 py-0.5 rounded">{kw}</span>)}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default History