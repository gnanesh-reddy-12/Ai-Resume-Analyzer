import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ResumeContext } from "../context/ResumeContext"
import KofiButton from "../components/KofiButton"

const ease = [0.16, 1, 0.3, 1]

function HighlightedJobDescription({ text, matched, missing }) {
  if (!text) return <p style={{ color: "var(--text-3)", fontSize: 13 }}>No job description provided.</p>

  const allKeywords = [
    ...(matched || []).map(k => ({ word: k, type: "matched" })),
    ...(missing || []).map(k => ({ word: k, type: "missing" })),
  ].sort((a, b) => b.word.length - a.word.length)

  if (!allKeywords.length) return <p style={{ fontSize: 13, color: "var(--text-2)", whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{text}</p>

  const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const pattern = new RegExp(`\\b(${allKeywords.map(k => escape(k.word)).join("|")})\\b`, "gi")
  const parts = text.split(pattern)

  return (
    <div style={{ fontSize: 13, whiteSpace: "pre-wrap", lineHeight: 1.7, color: "var(--text-2)", fontFamily: "Inter, sans-serif", background: "var(--bg)", padding: "16px 20px", borderRadius: "var(--r-md)", border: "1px solid var(--border)", height: 340, overflowY: "auto" }} className="custom-scrollbar">
      {parts.map((part, i) => {
        const kw = allKeywords.find(k => k.word.toLowerCase() === part.toLowerCase())
        if (kw?.type === "matched") return <mark key={i} style={{ background: "#DCFCE7", color: "#166534", borderRadius: 3, padding: "0 2px", fontWeight: 600 }}>{part}</mark>
        if (kw?.type === "missing") return <mark key={i} style={{ background: "#FEE2E2", color: "#991B1B", borderRadius: 3, padding: "0 2px", fontWeight: 600 }}>{part}</mark>
        return <span key={i}>{part}</span>
      })}
    </div>
  )
}

function ScoreRing({ score, size = 140, stroke = 10 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 75 ? "#10B981" : score >= 55 ? "#F59E0B" : "#EF4444"
  return (
    <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border-2)" strokeWidth={stroke} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }} />
      </svg>
      <div style={{ position: "absolute", textAlign: "center" }}>
        <div style={{ fontSize: 30, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-1px" }}>{score}%</div>
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
  const [jdOpen, setJdOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = jdOpen ? "hidden" : "unset"
    return () => { document.body.style.overflow = "unset" }
  }, [jdOpen])

  useEffect(() => {
    if (!resumeFile) { navigate("/landing"); return }
    const fd = new FormData()
    fd.append("resume", resumeFile)
    fd.append("job_description", jobDescription)
    fetch(`${import.meta.env.VITE_BACKEND_URL}/analyze/guest`, { method: "POST", body: fd })
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setData(d) })
      .catch(e => setError(e.message))
  }, [resumeFile, jobDescription, navigate])

  if (error) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "var(--danger)", fontSize: 15, marginBottom: 16 }}>{error}</p>
        <button className="btn-primary" onClick={() => navigate("/landing")}>Go Back</button>
      </div>
    </div>
  )

  if (!data) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid var(--border-2)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
        <p style={{ color: "var(--text-3)", fontSize: 14 }}>Analyzing your resume…</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>

      {/* Nav */}
      <nav style={{ height: 60, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", padding: "0 clamp(16px,4vw,32px)", background: "rgba(250,248,245,0.92)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 40 }}>
        <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.5px", color: "var(--text-1)" }}>
          Resume<span style={{ color: "var(--accent)" }}>AI</span>
        </span>
      </nav>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px clamp(16px,4vw,24px) 80px" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
          <span className="section-label">Guest Analysis</span>
          <h1 style={{ fontSize: "clamp(24px,4vw,32px)", fontWeight: 800, letterSpacing: "-0.8px", color: "var(--text-1)", marginBottom: 4 }}>Your ATS Score</h1>
          <p style={{ color: "var(--text-3)", fontSize: 13 }}>{resumeFile?.name}</p>
        </motion.div>

        {/* Score card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="card" style={{ padding: "clamp(20px,4vw,32px)", marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap" }}>
            <ScoreRing score={data.ats_score} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
                <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: "12px 20px", flex: 1, minWidth: 120 }}>
                  <p style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Keyword Score</p>
                  <p style={{ fontSize: 22, fontWeight: 800, color: "var(--accent)" }}>{data.keyword_score}%</p>
                </div>
                <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: "12px 20px", flex: 1, minWidth: 120 }}>
                  <p style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Semantic Score</p>
                  <p style={{ fontSize: 22, fontWeight: 800, color: "#10B981" }}>{data.semantic_score}%</p>
                </div>
              </div>
              <div style={{
                padding: "12px 16px", borderRadius: "var(--r-sm)",
                background: data.can_apply ? "var(--success-bg)" : "var(--warning-bg)",
                border: `1px solid ${data.can_apply ? "var(--success-bd)" : "var(--warning-bd)"}`,
                color: data.can_apply ? "#166534" : "#92400E",
                fontSize: 13, fontWeight: 600
              }}>
                {data.can_apply ? "✅ Strong match — you can apply for this role" : "⚠️ Needs improvement before applying"}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Keywords */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card" style={{ padding: 24 }}>
            <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 14, color: "var(--text-1)", display: "flex", alignItems: "center", gap: 8 }}>
              Matched Keywords
              <span className="badge badge-green" style={{ fontSize: 11 }}>{data.matched_keywords?.length}</span>
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {data.matched_keywords?.map((k, i) => <span key={i} className="tag tag-green">{k}</span>)}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card" style={{ padding: 24 }}>
            <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 14, color: "var(--text-1)", display: "flex", alignItems: "center", gap: 8 }}>
              Missing Keywords
              <span className="badge badge-red" style={{ fontSize: 11 }}>{data.missing_keywords?.length}</span>
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {data.missing_keywords?.map((k, i) => <span key={i} className="tag tag-red">{k}</span>)}
            </div>
          </motion.div>
        </div>

        {/* Upsell */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          style={{ background: "var(--accent-soft)", border: "1px solid var(--accent-mid)", borderRadius: "var(--r-xl)", padding: "clamp(32px,5vw,48px)", textAlign: "center" }}>
          <span className="section-label">Unlock Full Analysis</span>
          <h2 style={{ fontSize: "clamp(20px,3.5vw,26px)", fontWeight: 800, letterSpacing: "-0.6px", marginBottom: 10, color: "var(--text-1)" }}>
            Get AI-powered suggestions
          </h2>
          <p style={{ color: "var(--text-2)", marginBottom: 28, fontSize: 14, lineHeight: 1.7, maxWidth: 480, margin: "0 auto 28px" }}>
            Sign up free to unlock bullet rewrites, summary improvements, skills gap analysis, and a full recruiter-ready report.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn-primary" style={{ padding: "12px 28px" }} onClick={() => navigate("/signup")}>Sign Up Free →</button>
            <button className="btn-ghost" style={{ padding: "12px 22px" }} onClick={() => navigate("/login")}>Sign In</button>
          </div>
        </motion.div>

        {/* Support Developer Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ 
            background: "linear-gradient(135deg, rgba(255, 94, 91, 0.08) 0%, rgba(255, 94, 91, 0.02) 100%)", 
            border: "1px solid rgba(255, 94, 91, 0.2)", 
            borderRadius: "var(--r-xl)", 
            padding: "clamp(24px, 5vw, 36px)", 
            textAlign: "center",
            marginTop: 20
          }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 8, color: "var(--text-1)" }}>
            Did this help you? ☕
          </h2>
          <p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.6, maxWidth: 500, margin: "0 auto 24px" }}>
            I built this tool entirely for free to help job seekers beat the ATS. If it helped you out, consider dropping a tip to help keep the servers running!
          </p>
          <KofiButton style={{ padding: "12px 28px", fontSize: 15 }} />
        </motion.div>
      </div>

      {/* Floating JD button */}
      <button
        onClick={() => setJdOpen(true)}
        style={{ position: "fixed", bottom: 24, right: 24, zIndex: 40, background: "var(--text-1)", color: "#fff", borderRadius: 999, padding: "12px 20px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: "var(--shadow-lg)", fontSize: 13, fontWeight: 600, transition: "transform 0.18s, background 0.18s" }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
      >
        <span>📋</span>
        <span className="hidden sm:inline">View JD</span>
      </button>

      {/* JD Drawer */}
      <AnimatePresence>
        {jdOpen && (
          <div style={{ position: "fixed", inset: 0, zIndex: 50, overflow: "hidden" }}>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setJdOpen(false)}
              style={{ position: "absolute", inset: 0, background: "rgba(26,22,17,0.45)", backdropFilter: "blur(4px)" }}
            />
            <div style={{ position: "absolute", inset: "0 0 0 auto", display: "flex" }}>
              <motion.div
                initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 26, stiffness: 220 }}
                style={{ width: "min(100vw, 520px)", background: "var(--surface)", height: "100%", display: "flex", flexDirection: "column", borderLeft: "1px solid var(--border)", boxShadow: "var(--shadow-lg)" }}
              >
                <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg)" }}>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: 15, color: "var(--text-1)", margin: 0 }}>Job Description</h3>
                    <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>Keyword highlights — green matched, red missing</p>
                  </div>
                  <button onClick={() => setJdOpen(false)} style={{ width: 32, height: 32, borderRadius: "var(--r-xs)", background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)", cursor: "pointer" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  </button>
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: 24 }} className="custom-scrollbar">
                  {/* Legend */}
                  <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
                    {[["#DCFCE7", "#166534", "Matched"], ["#FEE2E2", "#991B1B", "Missing"]].map(([bg, col, label]) => (
                      <span key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: bg, border: `1.5px solid ${col}`, display: "inline-block" }} />{label}
                      </span>
                    ))}
                  </div>
                  <HighlightedJobDescription text={jobDescription} matched={data.matched_keywords} missing={data.missing_keywords} />
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}