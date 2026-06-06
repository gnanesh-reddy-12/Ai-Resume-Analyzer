import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ResumeContext } from "../context/ResumeContext"
import { useAuth } from "../context/useAuth"
import Navbar from "../components/Navbar"

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } }

function ScoreRing({ score, size = 160, stroke = 10 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 75 ? "#10B981" : score >= 55 ? "#F59E0B" : "#EF4444"

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={stroke} />
        <motion.circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl font-bold text-slate-900">{score}%</div>
        <div className="text-xs text-slate-500 mt-0.5">ATS Score</div>
      </div>
    </div>
  )
}

function ProgressBar({ value, color }) {
  return (
    <div className="w-full bg-slate-100 rounded-full h-2">
      <motion.div
        className="h-2 rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      />
    </div>
  )
}

function Results() {
  const { resumeFile, jobDescription } = useContext(ResumeContext)
  const { token } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!resumeFile) return
    if (!token) { navigate("/login"); return }

    const formData = new FormData()
    formData.append("resume", resumeFile)
    formData.append("job_description", jobDescription)

    fetch(`${import.meta.env.VITE_BACKEND_URL}/analyze`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
      .then((r) => r.json())
      .then((d) => { if (d.error) setError(d.error); else setData(d) })
      .catch((e) => setError(e.message))
  }, [resumeFile, jobDescription, token, navigate])

  if (error) return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Analysis Failed</h2>
          <p className="text-slate-500 mt-2 max-w-sm">{error}</p>
          <button onClick={() => navigate("/")} className="btn-primary mt-6">Try Again</button>
        </div>
      </div>
    </div>
  )

  if (!data) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500">Loading analysis...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between flex-wrap gap-4 mb-8">
          <div>
            <p className="text-blue-500 text-sm font-semibold uppercase tracking-widest">Analysis Complete</p>
            <h1 className="text-4xl font-bold text-slate-900 mt-1">Your ATS Report</h1>
            <p className="text-slate-500 mt-1">{resumeFile?.name}</p>
          </div>
          <button onClick={() => navigate("/history")} className="btn-secondary text-sm">View History</button>
        </motion.div>

        {/* Verdict */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`flex items-center gap-3 px-6 py-4 rounded-2xl border mb-8 ${data.can_apply ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
          <span className="text-2xl">{data.can_apply ? "✅" : "⚠️"}</span>
          <div>
            <p className="font-semibold">{data.apply_verdict}</p>
            <p className="text-sm opacity-75 mt-0.5">{data.can_apply ? "Your resume is competitive for this role" : "Consider improving before applying"}</p>
          </div>
        </motion.div>

        {/* Score Row */}
        <motion.div variants={container} initial="hidden" animate="show" className="grid md:grid-cols-3 gap-6 mb-8">

          {/* Score Ring */}
          <motion.div variants={item} className="card p-8 flex flex-col items-center">
            <ScoreRing score={data.ats_score} />
            <div className="w-full mt-6 space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-600">Keyword Score</span>
                  <span className="font-semibold text-slate-900">{data.keyword_score}%</span>
                </div>
                <ProgressBar value={data.keyword_score} color="#3B82F6" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-600">Semantic Score</span>
                  <span className="font-semibold text-slate-900">{data.semantic_score}%</span>
                </div>
                <ProgressBar value={data.semantic_score} color="#10B981" />
              </div>
            </div>
          </motion.div>

          {/* Matched */}
          <motion.div variants={item} className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              </div>
              <h2 className="font-semibold text-slate-900">Matched Keywords</h2>
              <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{data.matched_keywords?.length}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.matched_keywords?.map((kw, i) => <span key={i} className="tag-green">{kw}</span>)}
              {!data.matched_keywords?.length && <p className="text-slate-400 text-sm">No matched keywords</p>}
            </div>
          </motion.div>

          {/* Missing */}
          <motion.div variants={item} className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </div>
              <h2 className="font-semibold text-slate-900">Missing Keywords</h2>
              <span className="ml-auto text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">{data.missing_keywords?.length}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.missing_keywords?.map((kw, i) => <span key={i} className="tag-red">{kw}</span>)}
              {!data.missing_keywords?.length && <p className="text-slate-400 text-sm">No missing keywords</p>}
            </div>
          </motion.div>
        </motion.div>

        {/* Improvements */}
        {data.improvement_suggestions?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-8 mb-6">
            <h2 className="font-bold text-slate-900 text-xl mb-6">🛠 Improvement Suggestions</h2>
            <div className="space-y-4">
              {data.improvement_suggestions.map((s, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-blue-500">{s.section}</span>
                  <p className="text-red-600 text-sm mt-2">⚠ {s.issue}</p>
                  <p className="text-green-700 text-sm mt-1.5">✅ {s.fix}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Bullets + Verbs + Summary */}
        <motion.div variants={container} initial="hidden" animate="show" className="grid md:grid-cols-2 gap-6 mb-6">
          {data.rewritten_bullets?.length > 0 && (
            <motion.div variants={item} className="card p-6">
              <h2 className="font-bold text-slate-900 text-lg mb-5">✍️ Rewritten Bullet Points</h2>
              <ul className="space-y-3">
                {data.rewritten_bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                    <span className="text-blue-500 mt-0.5 flex-shrink-0">▸</span>{b}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          <div className="space-y-6">
            {data.strong_action_verbs?.length > 0 && (
              <motion.div variants={item} className="card p-6">
                <h2 className="font-bold text-slate-900 text-lg mb-4">⚡ Action Verbs</h2>
                <div className="flex flex-wrap gap-2">
                  {data.strong_action_verbs.map((v, i) => <span key={i} className="tag-blue">{v}</span>)}
                </div>
              </motion.div>
            )}
            {data.summary_suggestion && (
              <motion.div variants={item} className="card p-6">
                <h2 className="font-bold text-slate-900 text-lg mb-3">💡 Suggested Summary</h2>
                <p className="text-slate-600 text-sm leading-6">{data.summary_suggestion}</p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex gap-4 justify-center mt-10">
          <button onClick={() => navigate("/")} className="btn-primary">← Analyze Another</button>
          <button onClick={() => navigate("/history")} className="btn-secondary">View History</button>
        </div>
      </div>
    </div>
  )
}

export default Results