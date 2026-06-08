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
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={stroke} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }} />
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl font-bold text-slate-900">{score}%</div>
        <div className="text-xs text-slate-500 mt-0.5">ATS Match</div>
      </div>
    </div>
  )
}

function HighlightedJobDescription({ text, matched, missing, optional }) {
  if (!text) return <p className="text-slate-400 text-sm">No job description provided.</p>;
  
  const allKeywords = [
    ...(matched || []).map(k => ({ word: k, type: 'matched' })),
    ...(missing || []).map(k => ({ word: k, type: 'missing' })),
    ...(optional || []).map(k => ({ word: k, type: 'optional' }))
  ].sort((a, b) => b.word.length - a.word.length);

  if (allKeywords.length === 0) {
    return <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">{text}</p>;
  }

  const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`\\b(${allKeywords.map(k => escapeRegExp(k.word)).join('|')})\\b`, 'gi');
  const parts = text.split(pattern);

  return (
    <div className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed font-mono bg-slate-50 p-6 rounded-xl border border-slate-200 h-64 overflow-y-auto">
      {parts.map((part, i) => {
        const lowerPart = part.toLowerCase();
        const keywordMatch = allKeywords.find(k => k.word.toLowerCase() === lowerPart);
        
        if (keywordMatch) {
          if (keywordMatch.type === 'matched') {
            return <span key={i} className="bg-green-200 text-green-900 font-bold px-1 rounded">{part}</span>;
          } else if (keywordMatch.type === 'missing') {
            return <span key={i} className="bg-red-200 text-red-900 font-bold px-1 rounded">{part}</span>;
          } else if (keywordMatch.type === 'optional') {
            return <span key={i} className="bg-blue-200 text-blue-900 font-bold px-1 rounded">{part}</span>;
          }
        }
        return <span key={i}>{part}</span>;
      })}
    </div>
  );
}

function Results() {
  const { resumeFile, jobDescription, company, role } = useContext(ResumeContext)
  const { token } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  // AI Improvement State
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState(null)

  useEffect(() => {
    if (!resumeFile) return
    if (!token) { navigate("/login"); return }

    const formData = new FormData()
    formData.append("resume", resumeFile)
    formData.append("job_description", jobDescription)
    formData.append("company_name", company.trim())
    formData.append("job_role", role.trim())

    fetch(`${import.meta.env.VITE_BACKEND_URL}/analyze`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
      .then(async (r) => {
        const d = await r.json()
        if (!r.ok) {
          throw new Error(d.detail || d.error || "Analysis failed. Please try logging out and back in.")
        }
        return d
      })
      .then(d => setData(d))
      .catch(e => setError(e.message))
  }, [])

  const handleAiImprove = async () => {
    if (!resumeFile || !jobDescription) return;
    setIsAiLoading(true);
    
    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("job_description", jobDescription);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/improve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.detail || result.error || "Failed to generate improvements.");
      }
      
      if (result.suggestions) {
        setAiSuggestions(result.suggestions);
      }
    } catch (err) {
      console.error("AI Improve Request Failed:", err);
      alert("Failed to connect to the AI service.");
    } finally {
      setIsAiLoading(false);
    }
  }

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

  const matchedKeywords = data.matched_keywords?.length || 0

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-10">

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between flex-wrap gap-4 mb-8">
          <div>
            <p className="text-blue-500 text-sm font-semibold uppercase tracking-widest">Analysis Complete</p>
            <h1 className="text-4xl font-bold text-slate-900 mt-1">Your ATS Report</h1>
            {company && <p className="text-slate-700 font-semibold mt-1">{company}{role ? ` — ${role}` : ""}</p>}
            <p className="text-slate-500 mt-0.5">{resumeFile?.name}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleAiImprove} className="btn-primary flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border-0">
              Improve Resume
            </button>
            <button onClick={() => navigate("/history")} className="btn-secondary text-sm">View History</button>
          </div>
        </motion.div>

        <motion.div variants={container} initial="hidden" animate="show" className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div variants={item} className="card p-8 flex flex-col items-center justify-center text-center">
            <ScoreRing score={data.ats_score || 0} />
            <p className="text-xs text-slate-400 mt-5 max-w-[200px]">
              Based strictly on the presence of required keywords from the job description.
            </p>
          </motion.div>

          <motion.div variants={item} className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              </div>
              <h2 className="font-semibold text-slate-900">Found Keywords</h2>
              <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{matchedKeywords}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.matched_keywords?.map((kw, i) => <span key={i} className="tag-green">{kw}</span>)}
              {!data.matched_keywords?.length && <p className="text-slate-400 text-sm">No matched keywords</p>}
            </div>
          </motion.div>

          <motion.div variants={item} className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </div>
              <h2 className="font-semibold text-slate-900">Missing Keywords</h2>
              <span className="ml-auto text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">{data.missing_keywords?.length || 0}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.missing_keywords?.map((kw, i) => <span key={i} className="tag-red">{kw}</span>)}
              {!data.missing_keywords?.length && <p className="text-slate-400 text-sm">No missing keywords</p>}
            </div>
          </motion.div>
        </motion.div>

        {/* Job Description Highlight Section */}
        <motion.div variants={container} initial="hidden" animate="show" className="mb-8">
          <motion.div variants={item} className="card p-8">
            <h2 className="font-bold text-slate-900 text-xl mb-4">Job Description Analysis</h2>
            <div className="flex gap-4 mb-4 text-xs font-semibold uppercase tracking-wide">
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-400"></div> Matched</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-400"></div> Missing</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-400"></div> Optional</span>
            </div>
            <HighlightedJobDescription 
              text={jobDescription} 
              matched={data.matched_keywords} 
              missing={data.missing_keywords} 
              optional={data.optional_keywords} 
            />
          </motion.div>
        </motion.div>

        {/* AI Improvement Section */}
        {isAiLoading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-8 mb-8 text-center bg-indigo-50 border-indigo-100">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="font-bold text-indigo-900 text-lg">AI is crafting your upgrades...</h2>
            <p className="text-indigo-700/70 text-sm mt-1">Analyzing context and maximizing impact.</p>
          </motion.div>
        )}

        {aiSuggestions && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-8 mb-8 border-indigo-100">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">✨</span>
              <h2 className="font-bold text-slate-900 text-xl">Pro Bullet Point Suggestions</h2>
            </div>
            <div className="space-y-6">
              {aiSuggestions.map((s, i) => (
                <div key={i} className="grid md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2 block">Your Bullet</span>
                    <p className="text-slate-700 text-sm">{s.original}</p>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
                    <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600 mb-2 block">Enhanced Version</span>
                    <p className="text-slate-900 text-sm font-medium leading-relaxed">
                      {s.rewritten}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="flex gap-4 justify-center mt-10">
          <button onClick={() => navigate("/")} className="btn-primary">← Analyze Another</button>
        </div>
      </div>
    </div>
  )
}

export default Results