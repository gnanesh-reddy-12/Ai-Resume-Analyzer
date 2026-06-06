import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "../context/useAuth"
import Navbar from "../components/Navbar"

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
      .then((r) => r.json())
      .then((d) => { setAnalyses(d.analyses || []); if (d.analyses?.length) setSelected(d.analyses[0]) })
      .finally(() => setLoading(false))
  }, [token, navigate])

  const handleDelete = async (id) => {
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/history/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    })
    const updated = analyses.filter((a) => a.id !== id)
    setAnalyses(updated)
    setSelected(updated.length ? updated[0] : null)
  }

  
  const scoreBg = (s) => s >= 75 ? "bg-green-100 text-green-700" : s >= 55 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-10">

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <p className="text-blue-500 text-sm font-semibold uppercase tracking-widest">Dashboard</p>
            <h1 className="text-4xl font-bold text-slate-900 mt-1">Analysis History</h1>
            <p className="text-slate-500 mt-1">{analyses.length} analyses saved</p>
          </div>
          <button onClick={() => navigate("/")} className="btn-primary">+ New Analysis</button>
        </motion.div>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {!loading && analyses.length === 0 && (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">📋</div>
            <h2 className="text-xl font-semibold text-slate-900">No analyses yet</h2>
            <p className="text-slate-500 mt-2">Analyze your first resume to see results here</p>
            <button onClick={() => navigate("/")} className="btn-primary mt-6">Analyze Resume</button>
          </div>
        )}

        {!loading && analyses.length > 0 && (
          <div className="grid lg:grid-cols-5 gap-6">

            {/* List */}
            <div className="lg:col-span-2 space-y-3">
              {analyses.map((a) => (
                <motion.div key={a.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} onClick={() => setSelected(a)}
                  className={`card p-5 cursor-pointer transition-all ${selected?.id === a.id ? "border-blue-400 shadow-md" : ""}`}>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900 text-sm truncate max-w-[160px]">{a.filename}</p>
                    <span className={`text-sm font-bold px-2 py-0.5 rounded-lg ${scoreBg(a.ats_score)}`}>{a.ats_score}%</span>
                  </div>
                  <p className="text-slate-400 text-xs mt-2 truncate">{a.job_description_preview}</p>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-slate-400 text-xs">{new Date(a.created_at).toLocaleDateString()}</p>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(a.id) }} className="text-red-400 text-xs hover:text-red-600 transition">Delete</button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Detail */}
            {selected && (
              <motion.div key={selected.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-3 space-y-5">

                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="font-bold text-slate-900 text-lg">{selected.filename}</h2>
                      <p className="text-slate-400 text-xs mt-0.5">{new Date(selected.created_at).toLocaleString()}</p>
                    </div>
                    <span className={`text-2xl font-bold px-3 py-1 rounded-xl ${scoreBg(selected.ats_score)}`}>{selected.ats_score}%</span>
                  </div>

                  <div className={`px-4 py-3 rounded-xl text-sm font-medium ${selected.can_apply ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                    {selected.apply_verdict}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-slate-500 text-xs">Keyword Score</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{selected.keyword_score}%</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-slate-500 text-xs">Semantic Score</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{selected.semantic_score}%</p>
                    </div>
                  </div>
                </div>

                {selected.matched_keywords?.length > 0 && (
                  <div className="card p-5">
                    <p className="font-semibold text-slate-900 text-sm mb-3">✓ Matched Keywords</p>
                    <div className="flex flex-wrap gap-2">
                      {selected.matched_keywords.map((k, i) => <span key={i} className="tag-green">{k}</span>)}
                    </div>
                  </div>
                )}

                {selected.missing_keywords?.length > 0 && (
                  <div className="card p-5">
                    <p className="font-semibold text-slate-900 text-sm mb-3">✗ Missing Keywords</p>
                    <div className="flex flex-wrap gap-2">
                      {selected.missing_keywords.map((k, i) => <span key={i} className="tag-red">{k}</span>)}
                    </div>
                  </div>
                )}

                {selected.improvement_suggestions?.length > 0 && (
                  <div className="card p-5">
                    <p className="font-semibold text-slate-900 text-sm mb-3">🛠 Suggestions</p>
                    <div className="space-y-3">
                      {selected.improvement_suggestions.map((s, i) => (
                        <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                          <p className="text-blue-500 text-xs font-semibold uppercase">{s.section}</p>
                          <p className="text-red-600 text-sm mt-1">⚠ {s.issue}</p>
                          <p className="text-green-700 text-sm mt-1">✅ {s.fix}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selected.summary_suggestion && (
                  <div className="card p-5">
                    <p className="font-semibold text-slate-900 text-sm mb-2">💡 Suggested Summary</p>
                    <p className="text-slate-600 text-sm leading-6">{selected.summary_suggestion}</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default History