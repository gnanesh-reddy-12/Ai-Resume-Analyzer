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
          <div className="flex flex-col lg:flex-row gap-5 items-start">

            {/* Sidebar list */}
            <div className="w-full lg:w-80 flex flex-col gap-3 flex-shrink-0">
              {analyses.map((a, idx) => {
                const isSelected = selected?.id === a.id
                return (
                  <motion.div key={a.id}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                    onClick={() => setSelected(a)}
                    className="card cursor-pointer transition-all"
                    style={{ padding: 14, border: `1.5px solid ${isSelected ? "var(--accent)" : "var(--border)"}`, boxShadow: isSelected ? "0 0 0 3px rgba(59,130,246,0.1)" : "none", borderRadius: 16 }}
                  >
                    <div className="flex items-center gap-3">
                      <ScoreRing score={a.ats_score} />
                      <div className="flex-1 min-w-0">
                        {a.company_name && <p className="font-bold text-sm text-slate-900 truncate">{a.company_name}</p>}
                        {a.job_role && <p className="text-xs text-blue-500 font-semibold">{a.job_role}</p>}
                        {!a.company_name && !a.job_role && <p className="font-semibold text-sm text-slate-900 truncate">{a.filename}</p>}
                        <p className="text-xs text-slate-400 truncate mt-0.5">{a.job_description_preview}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-slate-400">{new Date(a.created_at).toLocaleDateString()}</span>
                          <button onClick={e => { e.stopPropagation(); handleDelete(a.id) }} className="text-xs text-red-400 hover:text-red-600 bg-none border-none cursor-pointer">Delete</button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Detail panel */}
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                {selected && (
                  <motion.div key={selected.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex flex-col gap-4">

                    {/* Header card */}
                    <div className="card p-5 md:p-7">
                      <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                        <div className="min-w-0">
                          {selected.company_name && <p className="font-bold text-lg text-slate-900">{selected.company_name}</p>}
                          {selected.job_role && <p className="text-sm text-blue-500 font-semibold mt-0.5">{selected.job_role}</p>}
                          <p className="text-xs text-slate-400 mt-1 truncate">{selected.filename}</p>
                          <p className="text-xs text-slate-400">{new Date(selected.created_at).toLocaleString()}</p>
                        </div>
                        <ScoreRing score={selected.ats_score} size={80} stroke={7} />
                      </div>

                      {/* Scores */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 rounded-xl p-3">
                          <p className="text-xs text-slate-400 font-semibold uppercase">Keyword Score</p>
                          <p className="text-2xl font-bold text-blue-500 mt-1">{selected.keyword_score}%</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3">
                          <p className="text-xs text-slate-400 font-semibold uppercase">Semantic Score</p>
                          <p className="text-2xl font-bold text-emerald-500 mt-1">{selected.semantic_score}%</p>
                        </div>
                      </div>
                    </div>

                    {/* Keywords */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selected.matched_keywords?.length > 0 && (
                        <div className="card p-4 md:p-5">
                          <p className="font-bold text-sm text-slate-900 mb-3">
                            ✓ Matched <span className="bg-green-100 text-green-700 rounded-full px-2 py-0.5 text-xs ml-1">{selected.matched_keywords.length}</span>
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {selected.matched_keywords.map((k, i) => <span key={i} className="tag tag-green">{k}</span>)}
                          </div>
                        </div>
                      )}
                      {selected.missing_keywords?.length > 0 && (
                        <div className="card p-4 md:p-5">
                          <p className="font-bold text-sm text-slate-900 mb-3">
                            ✗ Missing <span className="bg-red-100 text-red-700 rounded-full px-2 py-0.5 text-xs ml-1">{selected.missing_keywords.length}</span>
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {selected.missing_keywords.map((k, i) => <span key={i} className="tag tag-red">{k}</span>)}
                          </div>
                        </div>
                      )}
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}

export default History