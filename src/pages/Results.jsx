import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ResumeContext } from "../context/ResumeContext"
import { useAuth } from "../context/useAuth"
import Navbar from "../components/Navbar"

const spring = { type: "spring", stiffness: 400, damping: 30 }

function ScoreRing({ score, size = 120, stroke = 8 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 75 ? "var(--success)" : score >= 55 ? "var(--warning)" : "var(--danger)"
  
  return (
    <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }} />
      </svg>
      <div style={{ position: "absolute", textAlign: "center" }}>
        <div style={{ fontSize: "var(--text-2xl)", fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.04em" }}>{score}</div>
      </div>
    </div>
  )
}

function InfoCard({ label, value, accent }) {
  const bg = accent === "success" ? "var(--success-bg)" : accent === "warning" ? "var(--warning-bg)" : accent === "danger" ? "var(--danger-bg)" : "var(--bg)"
  const bd = accent === "success" ? "var(--success-bd)" : accent === "warning" ? "var(--warning-bd)" : accent === "danger" ? "var(--danger-bd)" : "var(--border)"
  return (
    <div style={{ background: bg, border: `1px solid ${bd}`, borderRadius: "var(--r-md)", padding: 20, boxShadow: accent ? "none" : "0 0 0 1px var(--border) inset" }}>
      <p style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: accent === "success" ? "var(--success)" : accent === "warning" ? "var(--warning)" : accent === "danger" ? "var(--danger)" : "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{label}</p>
      <p style={{ fontSize: "var(--text-sm)", color: "var(--text-2)", lineHeight: 1.6, whiteSpace: "pre-line" }}>{value}</p>
    </div>
  )
}

function HighlightedJobDescription({ text, matched, missing, optional }) {
  if (!text) return <p style={{ color: "var(--text-3)", fontSize: "var(--text-sm)" }}>No job description provided.</p>
  const allKeywords = [
    ...(matched || []).map(k => ({ word: k, type: "matched" })),
    ...(missing || []).map(k => ({ word: k, type: "missing" })),
    ...(optional || []).map(k => ({ word: k, type: "optional" })),
  ].sort((a, b) => b.word.length - a.word.length)
  
  if (!allKeywords.length) return <p style={{ fontSize: "var(--text-sm)", color: "var(--text-2)", whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{text}</p>
  
  const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const pattern = new RegExp(`\\b(${allKeywords.map(k => escape(k.word)).join("|")})\\b`, "gi")
  const parts = text.split(pattern)
  
  return (
    <div className="custom-scrollbar" style={{ fontSize: "var(--text-sm)", whiteSpace: "pre-wrap", lineHeight: 1.7, color: "var(--text-2)", background: "var(--bg)", padding: 20, borderRadius: "var(--r-md)", boxShadow: "0 0 0 1px var(--border) inset", height: 280, overflowY: "auto" }}>
      {parts.map((part, i) => {
        const kw = allKeywords.find(k => k.word.toLowerCase() === part.toLowerCase())
        if (kw?.type === "matched") return <mark key={i} style={{ background: "transparent", borderBottom: "2px solid var(--success)", color: "var(--text-1)", padding: "0 2px", fontWeight: 600 }}>{part}</mark>
        if (kw?.type === "missing") return <mark key={i} style={{ background: "transparent", borderBottom: "2px solid var(--danger)", color: "var(--text-1)", padding: "0 2px", fontWeight: 600 }}>{part}</mark>
        if (kw?.type === "optional") return <mark key={i} style={{ background: "transparent", borderBottom: "2px solid var(--warning)", color: "var(--text-1)", padding: "0 2px", fontWeight: 600 }}>{part}</mark>
        return <span key={i}>{part}</span>
      })}
    </div>
  )
}

function Section({ title, subtitle, children, style }) {
  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="ek-card" style={{ padding: "clamp(24px,5vw,32px)", ...style }}>
      {(title || subtitle) && (
        <div style={{ marginBottom: 24 }}>
          {title && <h2 style={{ fontSize: "var(--text-lg)", marginBottom: subtitle ? 4 : 0 }}>{title}</h2>}
          {subtitle && <p style={{ fontSize: "var(--text-xs)", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{subtitle}</p>}
        </div>
      )}
      {children}
    </motion.section>
  )
}

function Tag({ children, type }) {
  const color = type === "success" ? "var(--success)" : type === "danger" ? "var(--danger)" : "var(--text-2)"
  const bg = type === "success" ? "var(--success-bg)" : type === "danger" ? "var(--danger-bg)" : "var(--surface)"
  return (
    <span style={{ display: "inline-flex", background: bg, color, fontSize: "var(--text-xs)", fontWeight: 500, padding: "4px 10px", borderRadius: 99, boxShadow: "0 0 0 1px var(--border) inset" }}>
      {children}
    </span>
  )
}

export default function Results() {
  const { resumeFile, jobDescription, company, role, resetContext } = useContext(ResumeContext)
  const { token } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [jdOpen, setJdOpen] = useState(false)
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState(null)

  useEffect(() => {
    document.body.style.overflow = jdOpen ? "hidden" : "unset"
    return () => { document.body.style.overflow = "unset" }
  }, [jdOpen])

  useEffect(() => {
    if (!resumeFile) return
    if (!token) { navigate("/login"); return }
    const fd = new FormData()
    fd.append("resume", resumeFile)
    fd.append("job_description", jobDescription)
    fd.append("company_name", company.trim())
    fd.append("job_role", role.trim())
    
    fetch(`${import.meta.env.VITE_BACKEND_URL}/analyze`, {
      method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd
    })
      .then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.detail || d.error || "Analysis failed."); return d })
      .then(d => setData(d))
      .catch(e => setError(e.message))
  }, [])

  const handleAiImprove = async () => {
    if (!resumeFile || !jobDescription) return
    setIsAiLoading(true)
    const fd = new FormData()
    fd.append("resume", resumeFile)
    fd.append("job_description", jobDescription)
    if (data?.id) fd.append("analysis_id", data.id)
    try {
      const r = await fetch(`${import.meta.env.VITE_BACKEND_URL}/improve`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd
      })
      const result = await r.json()
      if (!r.ok) throw new Error(result.detail || result.error || "Failed to generate improvements.")
      if (result.suggestions) setAiSuggestions(result.suggestions)
    } catch (err) {
      alert("Failed to connect to AI.")
    } finally {
      setIsAiLoading(false)
    }
  }

  if (error) return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar />
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "var(--text-xl)", marginBottom: 8 }}>Analysis Failed</h2>
          <p style={{ color: "var(--text-3)", fontSize: "var(--text-sm)", marginBottom: 24 }}>{error}</p>
          <button onClick={() => navigate("/")} className="btn-ek btn-primary">Try Again</button>
        </div>
      </div>
    </div>
  )

  if (!data) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, border: "2px solid var(--border-focus)", borderTopColor: "var(--text-1)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  )

  const jobAnalysis = data.job_analysis || data.eligibility?.job_analysis

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <div className="container" style={{ paddingTop: "clamp(40px, 8vw, 60px)", paddingBottom: 100 }}>

        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={spring} style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 40 }} className="md:flex-row md:items-end md:justify-between">
          <div>
            <h1 style={{ fontSize: "var(--text-3xl)", marginBottom: 8 }}>
              {company ? `Report: ${company}` : "ATS Report"}
            </h1>
            <p style={{ fontSize: "var(--text-base)", color: "var(--text-3)" }}>
              {role ? `${role} · ` : ""}{resumeFile?.name}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => navigate("/history")} className="btn-ek btn-secondary">History</button>
            <button onClick={handleAiImprove} className="btn-ek btn-primary">Improve Resume</button>
          </div>
        </motion.div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* Top Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <Section style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 20 }}>
              <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-2)" }}>Match Score</p>
              <ScoreRing score={data.ats_score || 0} />
            </Section>

            <Section title="Matched Keywords">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {data.matched_keywords?.map((kw, i) => <Tag key={i} type="success">{kw}</Tag>)}
                {!data.matched_keywords?.length && <p style={{ color: "var(--text-3)", fontSize: "var(--text-sm)" }}>No matched keywords</p>}
              </div>
            </Section>

            <Section title="Missing Keywords">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {data.missing_keywords?.map((kw, i) => <Tag key={i} type="danger">{kw}</Tag>)}
                {!data.missing_keywords?.length && <p style={{ color: "var(--text-3)", fontSize: "var(--text-sm)" }}>No missing keywords</p>}
              </div>
            </Section>
          </div>

          {/* Warnings */}
          {data.warnings?.length > 0 && (
            <div style={{ background: "var(--warning-bg)", border: "1px solid var(--warning-bd)", borderRadius: "var(--r-md)", padding: "20px 24px" }}>
              <p style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--warning)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>⚠️ Resume Formatting Warnings ({data.warnings.length})</p>
              <ul style={{ paddingLeft: 16, display: "flex", flexDirection: "column", gap: 6 }}>
                {data.warnings.map((w, i) => <li key={i} style={{ fontSize: "var(--text-sm)", color: "var(--text-2)", lineHeight: 1.5 }}>{w}</li>)}
              </ul>
            </div>
          )}

          {/* JD Analysis */}
          <Section title="Job Description Analysis">
            {jobAnalysis && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div style={{ background: "var(--bg)", borderRadius: "var(--r-md)", padding: 20, boxShadow: "0 0 0 1px var(--border) inset" }}>
                  <p style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Role Focus</p>
                  <p style={{ fontSize: "var(--text-sm)", color: "var(--text-2)", lineHeight: 1.6 }}>{jobAnalysis.role_focus}</p>
                </div>
                <div style={{ background: "var(--bg)", borderRadius: "var(--r-md)", padding: 20, boxShadow: "0 0 0 1px var(--border) inset" }}>
                  <p style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Recruiter Needs</p>
                  <p style={{ fontSize: "var(--text-sm)", color: "var(--text-2)", lineHeight: 1.6 }}>{jobAnalysis.recruiter_needs}</p>
                </div>
              </div>
            )}
            
            <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
              <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-2)", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 12, height: 2, background: "var(--success)" }} /> Matched
              </span>
              <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-2)", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 12, height: 2, background: "var(--danger)" }} /> Missing
              </span>
              <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-2)", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 12, height: 2, background: "var(--warning)" }} /> Optional
              </span>
            </div>
            
            <HighlightedJobDescription text={jobDescription} matched={data.matched_keywords} missing={data.missing_keywords} optional={data.optional_keywords} />
          </Section>

          {/* AI loading */}
          <AnimatePresence>
            {isAiLoading && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ background: "var(--surface)", boxShadow: "0 0 0 1px var(--border) inset", borderRadius: "var(--r-lg)", padding: 40, textAlign: "center" }}>
                <div style={{ width: 24, height: 24, border: "2px solid var(--border-focus)", borderTopColor: "var(--text-1)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
                <h2 style={{ fontSize: "var(--text-base)", marginBottom: 8 }}>Analyzing semantics...</h2>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-3)" }}>Generating summaries, bullet rewrites, and impact metrics.</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI suggestions */}
          {aiSuggestions && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

              {aiSuggestions.summary && (
                <Section title="Optimized Summary" subtitle="Copy-paste ready">
                  <div style={{ background: "var(--bg)", borderRadius: "var(--r-md)", padding: 24, boxShadow: "0 0 0 1px var(--border) inset" }}>
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--text-1)", lineHeight: 1.7, marginBottom: 16 }}>{aiSuggestions.summary}</p>
                    <button onClick={() => { navigator.clipboard.writeText(aiSuggestions.summary); setCopied(true); setTimeout(() => setCopied(false), 2000) }} className="btn-ek btn-secondary">
                      {copied ? "Copied" : "Copy Summary"}
                    </button>
                  </div>
                </Section>
              )}

              {aiSuggestions.ai_snapshot && (
                <Section title="AI Assessment Snapshot" subtitle="Key strengths and gaps">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InfoCard label="🌟 Strengths to Keep" value={aiSuggestions.ai_snapshot.keep} accent="success" />
                    <InfoCard label="⚠️ Missing Elements" value={aiSuggestions.ai_snapshot.missing} accent="warning" />
                    <InfoCard label="⏳ Experience & Gaps" value={aiSuggestions.ai_snapshot.experience_gap} accent="danger" />
                  </div>
                </Section>
              )}

              {aiSuggestions.skills_recommendation && (
                <Section title="Skills Analysis" subtitle="Targeted skills optimization">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ marginBottom: 16 }}>
                    <div style={{ background: "var(--success-bg)", border: "1px solid var(--success-bd)", borderRadius: "var(--r-sm)", padding: "16px 20px" }}>
                      <p style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--success)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>✓ Skills to Keep</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {aiSuggestions.skills_recommendation.keep_skills?.map((sk, i) => <Tag key={i} type="success">{sk}</Tag>)}
                        {!aiSuggestions.skills_recommendation.keep_skills?.length && <p style={{ fontSize: "var(--text-xs)", color: "var(--text-3)" }}>None identified</p>}
                      </div>
                    </div>
                    <div style={{ background: "var(--accent-soft)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: "16px 20px" }}>
                      <p style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>💡 Skills to Add</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {aiSuggestions.skills_recommendation.add_skills?.map((sk, i) => <span key={i} style={{ display: "inline-flex", background: "var(--surface)", color: "var(--text-2)", fontSize: "var(--text-xs)", fontWeight: 500, padding: "4px 10px", borderRadius: 99, boxShadow: "0 0 0 1px var(--border) inset" }}>{sk}</span>)}
                        {!aiSuggestions.skills_recommendation.add_skills?.length && <p style={{ fontSize: "var(--text-xs)", color: "var(--text-3)" }}>None identified</p>}
                      </div>
                    </div>
                  </div>
                  {aiSuggestions.skills_recommendation.integration_advice && (
                    <div style={{ background: "var(--bg)", borderRadius: "var(--r-md)", padding: 20, boxShadow: "0 0 0 1px var(--border) inset", fontSize: "var(--text-sm)", color: "var(--text-2)", lineHeight: 1.6 }}>
                      <span style={{ fontWeight: 700, color: "var(--text-1)" }}>Contextual Integration Advice:</span>
                      <p style={{ marginTop: 6 }}>{aiSuggestions.skills_recommendation.integration_advice}</p>
                    </div>
                  )}
                </Section>
              )}

              {aiSuggestions.sections?.length > 0 && (
                <Section title="Bullet Rewrites" subtitle="Enhance your ATS match rate">
                  <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                    {aiSuggestions.sections.map((section, si) => (
                      <div key={si}>
                        <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-1)", marginBottom: 16 }}>{section.title}</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                          {section.bullets?.map((b, bi) => (
                            <div key={bi} className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ paddingBottom: 16, borderBottom: "1px solid var(--border)" }}>
                              <div>
                                <p style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Original</p>
                                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-3)", textDecoration: "line-through", lineHeight: 1.6 }}>{b.original}</p>
                              </div>
                              <div style={{ background: "var(--bg)", padding: 16, borderRadius: "var(--r-sm)" }}>
                                <p style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-1)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Rewrite</p>
                                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-1)", lineHeight: 1.6, fontWeight: 500 }}>{b.rewritten}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
            <button onClick={() => { resetContext(); navigate("/") }} className="btn-ek btn-secondary">← Analyze Another Job</button>
          </div>
        </div>
      </div>
    </div>
  )
}