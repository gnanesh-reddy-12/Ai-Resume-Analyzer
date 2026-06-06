import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ResumeContext } from "../context/ResumeContext"
import { useAuth } from "../context/useAuth"

function Results() {
  const { resumeFile, jobDescription } = useContext(ResumeContext)
  const { token } = useAuth()
  const navigate = useNavigate()
  const [backendData, setBackendData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!resumeFile) return
    if (!token) return navigate("/login")

    const formData = new FormData()
    formData.append("resume", resumeFile)
    formData.append("job_description", jobDescription)

    fetch(`${import.meta.env.VITE_BACKEND_URL}/analyze`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
      .then((r) => r.json())
      .then((d) => { if (d.error) setError(d.error); else setBackendData(d) })
      .catch((e) => setError(e.message))
  }, [resumeFile, jobDescription, token, navigate])

  if (error) return (
    <div className="min-h-screen bg-[#2F4F4F] text-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-400 text-xl">{error}</p>
        <button onClick={() => navigate("/")} className="mt-4 text-purple-400 underline">Go back</button>
      </div>
    </div>
  )

  if (!backendData) return (
    <div className="min-h-screen bg-[#2F4F4F] text-white flex items-center justify-center text-2xl">
      Loading analysis...
    </div>
  )

  const scoreColor = backendData.ats_score >= 75 ? "border-green-400" : backendData.ats_score >= 55 ? "border-yellow-400" : "border-red-400"
  const scoreTextColor = backendData.ats_score >= 75 ? "text-green-400" : backendData.ats_score >= 55 ? "text-yellow-400" : "text-red-400"

  return (
    <div className="min-h-screen bg-[#2F4F4F] text-white p-6 md:p-10 relative overflow-hidden">
      <div className="absolute top-[-200px] left-[-100px] w-[500px] h-[500px] bg-purple-600 rounded-full blur-[150px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-[-200px] right-[-100px] w-[500px] h-[500px] bg-blue-600 rounded-full blur-[150px] opacity-20 pointer-events-none"></div>

      <div className="relative z-10 max-w-6xl mx-auto">

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-5xl font-bold">ATS Analysis Results</h1>
            <p className="text-gray-400 mt-2">{resumeFile?.name}</p>
          </div>
          <button
            onClick={() => navigate("/history")}
            className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl font-semibold transition"
          >
            View History
          </button>
        </div>

        <div className={`mt-6 px-5 py-4 rounded-2xl border font-semibold text-lg ${
          backendData.can_apply ? "bg-green-500/20 border-green-500/30 text-green-300" : "bg-red-500/20 border-red-500/30 text-red-300"
        }`}>
          {backendData.can_apply ? "✅" : "⚠️"} {backendData.apply_verdict}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center">
            <h2 className="text-gray-400 text-lg mb-6">ATS Score</h2>
            <div className={`w-44 h-44 rounded-full border-[12px] ${scoreColor} flex items-center justify-center`}>
              <span className={`text-5xl font-bold ${scoreTextColor}`}>{backendData.ats_score}%</span>
            </div>
            <div className="mt-6 w-full space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-yellow-300">Keyword Score</span>
                <span>{backendData.keyword_score}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${backendData.keyword_score}%` }}></div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-cyan-300">Semantic Score</span>
                <span>{backendData.semantic_score}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-cyan-400 h-2 rounded-full" style={{ width: `${backendData.semantic_score}%` }}></div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h2 className="text-green-300 text-2xl font-bold mb-6">✓ Matched Keywords</h2>
            <div className="flex flex-wrap gap-2">
              {backendData.matched_keywords?.map((kw, i) => (
                <span key={i} className="bg-green-500/20 text-green-300 px-3 py-1.5 rounded-full border border-green-500/30 text-sm">{kw}</span>
              ))}
              {!backendData.matched_keywords?.length && <p className="text-gray-400">No matched keywords.</p>}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h2 className="text-red-300 text-2xl font-bold mb-6">✗ Missing Keywords</h2>
            <div className="flex flex-wrap gap-2">
              {backendData.missing_keywords?.map((kw, i) => (
                <span key={i} className="bg-red-500/20 text-red-300 px-3 py-1.5 rounded-full border border-red-500/30 text-sm">{kw}</span>
              ))}
              {!backendData.missing_keywords?.length && <p className="text-gray-400">No missing keywords — great!</p>}
            </div>
          </div>
        </div>

        {backendData.improvement_suggestions?.length > 0 && (
          <div className="mt-10 bg-white/5 border border-white/10 rounded-3xl p-8">
            <h2 className="text-purple-300 text-3xl font-bold mb-6">🛠 Improvement Suggestions</h2>
            <div className="space-y-4">
              {backendData.improvement_suggestions.map((item, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <p className="text-purple-300 font-semibold uppercase tracking-wide text-sm">{item.section}</p>
                  <p className="text-red-300 mt-2 text-sm">⚠ {item.issue}</p>
                  <p className="text-green-300 mt-2 text-sm">✅ {item.fix}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {backendData.rewritten_bullets?.length > 0 && (
          <div className="mt-10 bg-white/5 border border-white/10 rounded-3xl p-8">
            <h2 className="text-blue-300 text-3xl font-bold mb-6">✍ Rewritten Bullet Points</h2>
            <ul className="space-y-3">
              {backendData.rewritten_bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-300">
                  <span className="text-blue-400 mt-1">▸</span><span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mt-10">
          {backendData.summary_suggestion && (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
              <h2 className="text-yellow-300 text-2xl font-bold mb-4">💡 Suggested Summary</h2>
              <p className="text-gray-300 leading-7">{backendData.summary_suggestion}</p>
            </div>
          )}
          {backendData.strong_action_verbs?.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
              <h2 className="text-cyan-300 text-2xl font-bold mb-4">⚡ Strong Action Verbs</h2>
              <div className="flex flex-wrap gap-2">
                {backendData.strong_action_verbs.map((v, i) => (
                  <span key={i} className="bg-cyan-500/20 text-cyan-300 px-3 py-1.5 rounded-full border border-cyan-500/30 text-sm font-medium">{v}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-10 flex gap-4 justify-center">
          <button onClick={() => navigate("/")} className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-4 rounded-2xl font-semibold text-lg transition">
            ← Analyze Another
          </button>
          <button onClick={() => navigate("/history")} className="bg-white/10 hover:bg-white/20 text-white px-10 py-4 rounded-2xl font-semibold text-lg transition">
            View History
          </button>
        </div>

      </div>
    </div>
  )
}

export default Results