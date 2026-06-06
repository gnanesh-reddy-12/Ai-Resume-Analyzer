import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/useAuth"

function History() {
  const { token, user, logout } = useAuth()
  const navigate = useNavigate()
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (!token) return navigate("/login")
    fetch(`${import.meta.env.VITE_BACKEND_URL}/history`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => r.json())
      .then((d) => setAnalyses(d.analyses || []))
      .finally(() => setLoading(false))
  }, [token, navigate])

  const handleDelete = async (id) => {
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/history/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    })
    setAnalyses((prev) => prev.filter((a) => a.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  const scoreColor = (score) =>
    score >= 75 ? "text-green-400" : score >= 55 ? "text-yellow-400" : "text-red-400"

  const scoreBorder = (score) =>
    score >= 75 ? "border-green-400" : score >= 55 ? "border-yellow-400" : "border-red-400"

  return (
    <div className="min-h-screen bg-[#2F4F4F] text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold">Analysis History</h1>
            <p className="text-gray-400 mt-1">{user?.email}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/")}
              className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-2xl font-semibold transition"
            >
              New Analysis
            </button>
            <button
              onClick={() => { logout(); navigate("/login") }}
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl font-semibold transition"
            >
              Logout
            </button>
          </div>
        </div>

        {loading && (
          <div className="mt-20 text-center text-gray-400 text-xl">Loading history...</div>
        )}

        {!loading && analyses.length === 0 && (
          <div className="mt-20 text-center">
            <p className="text-gray-400 text-xl">No analyses yet.</p>
            <button
              onClick={() => navigate("/")}
              className="mt-6 bg-sky-500 hover:bg-sky-600 text-white px-8 py-4 rounded-2xl font-semibold transition"
            >
              Analyze Your First Resume
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6 mt-10">

          {/* List */}
          <div className="lg:col-span-1 space-y-3">
            {analyses.map((a) => (
              <div
                key={a.id}
                onClick={() => setSelected(a)}
                className={`cursor-pointer bg-white/5 border rounded-2xl p-5 transition hover:bg-white/10 ${
                  selected?.id === a.id ? "border-sky-400" : "border-white/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm truncate max-w-[160px]">{a.filename}</p>
                  <span className={`text-2xl font-bold ${scoreColor(a.ats_score)}`}>
                    {a.ats_score}%
                  </span>
                </div>
                <p className="text-gray-400 text-xs mt-2 truncate">{a.job_description_preview}</p>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-gray-500 text-xs">
                    {new Date(a.created_at).toLocaleDateString()}
                  </p>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(a.id) }}
                    className="text-red-400 text-xs hover:text-red-300 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Detail */}
          {selected && (
            <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">

              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{selected.filename}</h2>
                <div className={`w-20 h-20 rounded-full border-[6px] ${scoreBorder(selected.ats_score)} flex items-center justify-center`}>
                  <span className={`text-2xl font-bold ${scoreColor(selected.ats_score)}`}>
                    {selected.ats_score}%
                  </span>
                </div>
              </div>

              <div className={`px-4 py-3 rounded-xl border text-sm font-semibold ${
                selected.can_apply
                  ? "bg-green-500/20 border-green-500/30 text-green-300"
                  : "bg-red-500/20 border-red-500/30 text-red-300"
              }`}>
                {selected.apply_verdict}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-2xl p-4">
                  <p className="text-yellow-300 text-sm">Keyword Score</p>
                  <p className="text-2xl font-bold mt-1">{selected.keyword_score}%</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4">
                  <p className="text-cyan-300 text-sm">Semantic Score</p>
                  <p className="text-2xl font-bold mt-1">{selected.semantic_score}%</p>
                </div>
              </div>

              {selected.matched_keywords?.length > 0 && (
                <div>
                  <p className="text-green-300 font-semibold mb-2">Matched Keywords</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.matched_keywords.map((k, i) => (
                      <span key={i} className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm border border-green-500/30">{k}</span>
                    ))}
                  </div>
                </div>
              )}

              {selected.missing_keywords?.length > 0 && (
                <div>
                  <p className="text-red-300 font-semibold mb-2">Missing Keywords</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.missing_keywords.map((k, i) => (
                      <span key={i} className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm border border-red-500/30">{k}</span>
                    ))}
                  </div>
                </div>
              )}

              {selected.improvement_suggestions?.length > 0 && (
                <div>
                  <p className="text-purple-300 font-semibold mb-3">Improvement Suggestions</p>
                  <div className="space-y-3">
                    {selected.improvement_suggestions.map((s, i) => (
                      <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <p className="text-purple-300 text-xs uppercase font-semibold">{s.section}</p>
                        <p className="text-red-300 text-sm mt-1">⚠ {s.issue}</p>
                        <p className="text-green-300 text-sm mt-1">✅ {s.fix}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selected.summary_suggestion && (
                <div>
                  <p className="text-yellow-300 font-semibold mb-2">Suggested Summary</p>
                  <p className="text-gray-300 text-sm leading-6">{selected.summary_suggestion}</p>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default History