import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ResumeContext } from "../context/ResumeContext"

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
    <div className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed font-mono bg-slate-50 p-4 md:p-6 rounded-xl border border-slate-200 h-96 overflow-y-auto">
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

function ScoreRing({ score, size = 140, stroke = 10 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 75 ? "#10B981" : score >= 55 ? "#F59E0B" : "#EF4444"
  return (
    <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={stroke} />
        <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }} />
      </svg>
      <div style={{ position: "absolute", textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-1)" }}>{score}%</div>
        <div style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 500 }}>ATS Score</div>
      </div>
    </div>
  )
}

export default function GuestResults() {
  const { resumeFile, jobDescription } = useContext(ResumeContext)
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [jdDrawerOpen, setJdDrawerOpen] = useState(false)

  useEffect(() => {
    if (jdDrawerOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [jdDrawerOpen])

  useEffect(() => {
    if (!resumeFile) { navigate("/landing"); return }
    const formData = new FormData()
    formData.append("resume", resumeFile)
    formData.append("job_description", jobDescription)

    fetch(`${import.meta.env.VITE_BACKEND_URL}/analyze/guest`, {
      method: "POST",
      body: formData,
    })
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setData(d) })
      .catch(e => setError(e.message))
  }, [resumeFile, jobDescription, navigate])

  if (error) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "var(--danger)", fontSize: 16 }}>{error}</p>
        <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => navigate("/landing")}>Go Back</button>
      </div>
    </div>
  )

  if (!data) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, border: "4px solid #DBEAFE", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }}></div>
        <p style={{ color: "var(--text-2)" }}>Analyzing your resume...</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <nav style={{ height: 64, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", padding: "0 24px" }}>
        <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.5px", color: "var(--text-1)" }}>
          Resume<span style={{ color: "var(--accent)" }}>AI</span>
        </span>
      </nav>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px 80px" }}>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: "var(--accent)", textTransform: "uppercase", marginBottom: 8 }}>Guest Analysis</p>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.5px" }}>Your ATS Score</h1>
          <p style={{ color: "var(--text-2)", marginTop: 6 }}>{resumeFile?.name}</p>
        </motion.div>

        {/* Score card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card" style={{ padding: 32, marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 40, alignItems: "center", flexWrap: "wrap" }}>
            <ScoreRing score={data.ats_score} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
                <div style={{ background: "var(--bg)", borderRadius: 12, padding: "12px 20px", flex: 1, minWidth: 120 }}>
                  <p style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 500 }}>Keyword Score</p>
                  <p style={{ fontSize: 24, fontWeight: 800, color: "var(--accent)", marginTop: 4 }}>{data.keyword_score}%</p>
                </div>
                <div style={{ background: "var(--bg)", borderRadius: 12, padding: "12px 20px", flex: 1, minWidth: 120 }}>
                  <p style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 500 }}>Semantic Score</p>
                  <p style={{ fontSize: 24, fontWeight: 800, color: "#10B981", marginTop: 4 }}>{data.semantic_score}%</p>
                </div>
              </div>
              <div style={{
                padding: "12px 16px", borderRadius: 12,
                background: data.can_apply ? "#F0FDF4" : "#FEF2F2",
                border: `1px solid ${data.can_apply ? "#BBF7D0" : "#FECACA"}`,
                color: data.can_apply ? "#166534" : "#991B1B",
                fontSize: 14, fontWeight: 600
              }}>
                {data.can_apply ? "✅ Strong match — you can apply for this role" : "⚠️ Needs improvement before applying"}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Keywords */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card" style={{ padding: 24 }}>
            <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: "var(--text-1)" }}>✓ Matched Keywords <span style={{ background: "#DCFCE7", color: "#166534", borderRadius: 999, padding: "2px 8px", fontSize: 12, marginLeft: 6 }}>{data.matched_keywords?.length}</span></p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {data.matched_keywords?.map((k, i) => <span key={i} className="tag tag-green">{k}</span>)}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card" style={{ padding: 24 }}>
            <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: "var(--text-1)" }}>✗ Missing Keywords <span style={{ background: "#FEE2E2", color: "#991B1B", borderRadius: 999, padding: "2px 8px", fontSize: 12, marginLeft: 6 }}>{data.missing_keywords?.length}</span></p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {data.missing_keywords?.map((k, i) => <span key={i} className="tag tag-red">{k}</span>)}
            </div>
          </motion.div>
        </div>

        {/* Upsell */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card" style={{ padding: 40, textAlign: "center", background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: "var(--accent)", textTransform: "uppercase", marginBottom: 12 }}>Unlock Full Analysis</p>
          <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 12 }}>Get AI-powered suggestions</h2>
          <p style={{ color: "var(--text-2)", marginBottom: 28, fontSize: 15, maxWidth: 480, margin: "0 auto 28px" }}>
            Sign up free to unlock improvement suggestions, rewritten bullet points, action verbs, and a tailored professional summary.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button className="btn-primary" style={{ padding: "12px 32px" }} onClick={() => navigate("/signup")}>
              Sign Up Free →
            </button>
            <button className="btn-ghost" style={{ padding: "12px 24px" }} onClick={() => navigate("/login")}>
              Sign In
            </button>
          </div>
        </motion.div>

      </div>

      {/* Floating JD Button */}
      <button
        onClick={() => setJdDrawerOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-slate-900 text-white rounded-full p-4 shadow-xl hover:bg-slate-800 flex items-center gap-2 transition-all hover:scale-105"
        style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}
      >
        <span className="text-lg">📋</span>
        <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">View JD</span>
      </button>

      {/* JD Drawer Overlay */}
      <AnimatePresence>
        {jdDrawerOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setJdDrawerOpen(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
            />

            {/* Drawer Panel */}
            <div className="absolute inset-y-0 right-0 max-w-full flex">
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 26, stiffness: 220 }}
                className="w-screen md:w-[550px] bg-white h-full shadow-2xl flex flex-col overflow-hidden relative border-l border-slate-200"
              >
                {/* Header */}
                <div className="border-b border-slate-200 px-6 py-5 flex items-center justify-between bg-slate-50">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">Job Description</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Matched and missing keyword highlights</p>
                  </div>
                  <button 
                    onClick={() => setJdDrawerOpen(false)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Legend */}
                  <div className="flex flex-wrap gap-3 text-[10px] font-bold uppercase tracking-wider bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                    <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-400"></div> Matched</span>
                    <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-400"></div> Missing</span>
                    <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-400"></div> Optional</span>
                  </div>

                  <HighlightedJobDescription 
                    text={jobDescription} 
                    matched={data.matched_keywords} 
                    missing={data.missing_keywords} 
                    optional={[]} 
                  />
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}