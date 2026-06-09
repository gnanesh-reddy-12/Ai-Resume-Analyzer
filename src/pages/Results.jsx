import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ResumeContext } from "../context/ResumeContext"
import { useAuth } from "../context/useAuth"
import Navbar from "../components/Navbar"

const ease = [0.16, 1, 0.3, 1]

function ScoreRing({ score, size = 156, stroke = 10 }) {
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
        <div style={{ fontSize: 32, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-1px" }}>{score}%</div>
        <div style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 500, marginTop: 2 }}>ATS Match</div>
      </div>
    </div>
  )
}

function HighlightedJobDescription({ text, matched, missing, optional }) {
  if (!text) return <p style={{ color: "var(--text-3)", fontSize: 13 }}>No job description provided.</p>
  const allKeywords = [
    ...(matched || []).map(k => ({ word: k, type: "matched" })),
    ...(missing || []).map(k => ({ word: k, type: "missing" })),
    ...(optional || []).map(k => ({ word: k, type: "optional" })),
  ].sort((a, b) => b.word.length - a.word.length)
  if (!allKeywords.length) return <p style={{ fontSize: 13, color: "var(--text-2)", whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{text}</p>
  const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const pattern = new RegExp(`\\b(${allKeywords.map(k => escape(k.word)).join("|")})\\b`, "gi")
  const parts = text.split(pattern)
  return (
    <div style={{ fontSize: 13, whiteSpace: "pre-wrap", lineHeight: 1.7, color: "var(--text-2)", fontFamily: "Inter, sans-serif", background: "var(--bg)", padding: "16px 20px", borderRadius: "var(--r-md)", border: "1px solid var(--border)", height: 220, overflowY: "auto" }} className="custom-scrollbar">
      {parts.map((part, i) => {
        const kw = allKeywords.find(k => k.word.toLowerCase() === part.toLowerCase())
        if (kw?.type === "matched") return <mark key={i} style={{ background: "#DCFCE7", color: "#166534", borderRadius: 3, padding: "0 2px", fontWeight: 600 }}>{part}</mark>
        if (kw?.type === "missing") return <mark key={i} style={{ background: "#FEE2E2", color: "#991B1B", borderRadius: 3, padding: "0 2px", fontWeight: 600 }}>{part}</mark>
        if (kw?.type === "optional") return <mark key={i} style={{ background: "var(--accent-soft)", color: "var(--accent)", borderRadius: 3, padding: "0 2px", fontWeight: 600 }}>{part}</mark>
        return <span key={i}>{part}</span>
      })}
    </div>
  )
}

// ── Reusable section wrapper ──
function Section({ title, subtitle, children, style }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease }}
      className="card" style={{ padding: "clamp(20px,4vw,28px)", ...style }}>
      {(title || subtitle) && (
        <div style={{ marginBottom: 18 }}>
          {title && <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.3px", marginBottom: subtitle ? 4 : 0 }}>{title}</h2>}
          {subtitle && <p style={{ fontSize: 12, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{subtitle}</p>}
        </div>
      )}
      {children}
    </motion.div>
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
      alert("Failed to connect to the AI service.")
    } finally {
      setIsAiLoading(false)
    }
  }

  if (error) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 56, height: 56, background: "var(--danger-bg)", borderRadius: "var(--r-lg)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24 }}>⚠️</div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)", marginBottom: 8 }}>Analysis Failed</h2>
          <p style={{ color: "var(--text-3)", fontSize: 14, maxWidth: 320, margin: "0 auto 24px" }}>{error}</p>
          <button onClick={() => navigate("/")} className="btn-primary">Try Again</button>
        </div>
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

  const jobAnalysis = data.job_analysis || data.eligibility?.job_analysis

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "clamp(24px,4vw,40px) clamp(16px,4vw,24px) 80px" }}>

        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }} className="md:flex-row md:items-start md:justify-between">
          <div>
            <span className="section-label">Analysis Complete</span>
            <h1 style={{ fontSize: "clamp(22px,4vw,30px)", fontWeight: 800, letterSpacing: "-0.8px", color: "var(--text-1)", marginBottom: 4 }}>
              Your ATS Report{company ? ` — ${company}` : ""}
            </h1>
            {role && <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 2 }}>{role}</p>}
            <p style={{ fontSize: 13, color: "var(--text-3)" }}>{resumeFile?.name}</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexShrink: 0, flexWrap: "wrap" }}>
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleAiImprove} className="btn-primary" style={{ fontSize: 13, padding: "10px 20px" }}>
              ✨ Improve Resume
            </motion.button>
            <button onClick={() => navigate("/history")} className="btn-ghost" style={{ fontSize: 13, padding: "10px 18px" }}>History</button>
          </div>
        </motion.div>

        {/* Top 3-col grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 20 }}>

          {/* Score ring */}
          <Section style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 16 }}>
            <ScoreRing score={data.ats_score || 0} />
            <p style={{ fontSize: 12, color: "var(--text-3)", maxWidth: 180, lineHeight: 1.6 }}>
              Based on keyword presence from the job description.
            </p>
          </Section>

          {/* Matched */}
          <Section title="Matched Keywords">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span className="badge badge-green" style={{ fontSize: 11 }}>{data.matched_keywords?.length || 0}</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {data.matched_keywords?.map((kw, i) => <span key={i} className="tag tag-green">{kw}</span>)}
              {!data.matched_keywords?.length && <p style={{ color: "var(--text-3)", fontSize: 13 }}>No matched keywords</p>}
            </div>
          </Section>

          {/* Missing */}
          <Section title="Missing Keywords">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span className="badge badge-red" style={{ fontSize: 11 }}>{data.missing_keywords?.length || 0}</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {data.missing_keywords?.map((kw, i) => <span key={i} className="tag tag-red">{kw}</span>)}
              {!data.missing_keywords?.length && <p style={{ color: "var(--text-3)", fontSize: 13 }}>No missing keywords</p>}
            </div>
          </Section>
        </div>

        {/* JD Analysis */}
        <div style={{ marginBottom: 20 }}>
          <Section title="Job Description Analysis">
            {jobAnalysis && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, marginBottom: 16 }}>
                <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: "14px 16px" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>🎯 What the Job Actually Is</p>
                  <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>{jobAnalysis.role_focus}</p>
                </div>
                <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: "14px 16px" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>🔍 What the Recruiter Needs</p>
                  <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>{jobAnalysis.recruiter_needs}</p>
                </div>
              </div>
            )}
            <div style={{ display: "flex", gap: 16, marginBottom: 12, flexWrap: "wrap" }}>
              {[["#DCFCE7", "#166534", "Matched"], ["#FEE2E2", "#991B1B", "Missing"], ["var(--accent-soft)", "var(--accent)", "Optional"]].map(([bg, col, label]) => (
                <span key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: bg, border: `1.5px solid ${col}`, display: "inline-block" }} />{label}
                </span>
              ))}
            </div>
            <HighlightedJobDescription text={jobDescription} matched={data.matched_keywords} missing={data.missing_keywords} optional={data.optional_keywords} />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
              <button onClick={() => setJdOpen(true)} style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600, background: "var(--accent-soft)", border: "1px solid var(--accent-mid)", borderRadius: "var(--r-xs)", padding: "6px 14px", cursor: "pointer" }}>
                Pop out ↗
              </button>
            </div>
          </Section>
        </div>

        {/* AI loading */}
        <AnimatePresence>
          {isAiLoading && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ background: "var(--accent-soft)", border: "1px solid var(--accent-mid)", borderRadius: "var(--r-lg)", padding: "clamp(24px,4vw,36px)", textAlign: "center", marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, border: "3px solid var(--accent-mid)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
              <h2 style={{ fontWeight: 700, fontSize: 16, color: "var(--text-1)", marginBottom: 4 }}>AI is reviewing your resume…</h2>
              <p style={{ fontSize: 13, color: "var(--text-3)" }}>Generating summary, rewriting bullets, checking qualifications.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI suggestions */}
        {aiSuggestions && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 20 }}>

            {/* Snapshot */}
            {aiSuggestions.ai_snapshot && (
              <Section title="✨ AI Snapshot & Gaps">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
                  {[
                    { label: "🌟 What to Keep", key: "keep", bg: "var(--success-bg)", bd: "var(--success-bd)", col: "#166534" },
                    { label: "⚠️ What's Missing", key: "missing", bg: "var(--warning-bg)", bd: "var(--warning-bd)", col: "#92400E" },
                    { label: "⏳ Experience Gaps", key: "experience_gap", bg: "var(--danger-bg)", bd: "var(--danger-bd)", col: "#991B1B" },
                  ].map(({ label, key, bg, bd, col }) => (
                    <div key={key} style={{ background: bg, border: `1px solid ${bd}`, borderRadius: "var(--r-sm)", padding: "14px 16px" }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: col, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>{label}</p>
                      <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.65, whiteSpace: "pre-line" }}>{aiSuggestions.ai_snapshot[key]}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Summary */}
            {aiSuggestions.summary && (
              <Section title="Recruiter-Optimized Summary" subtitle="Copy-paste ready for the top of your resume">
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
                  <button
                    onClick={() => { navigator.clipboard.writeText(aiSuggestions.summary); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                    style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--r-xs)", padding: "5px 14px", cursor: "pointer" }}
                  >
                    {copied ? "Copied ✓" : "Copy"}
                  </button>
                </div>
                <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: "16px 18px" }}>
                  <p style={{ fontSize: 14, color: "var(--text-1)", lineHeight: 1.75 }}>{aiSuggestions.summary}</p>
                </div>
              </Section>
            )}

            {/* Skills */}
            {aiSuggestions.skills_recommendation && (
              <Section title="🔧 Skills & Integration">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, marginBottom: 12 }}>
                  <div style={{ background: "var(--success-bg)", border: "1px solid var(--success-bd)", borderRadius: "var(--r-sm)", padding: "14px 16px" }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#166534", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>✓ Skills to Keep</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {aiSuggestions.skills_recommendation.keep_skills?.map((sk, i) => (
                        <span key={i} style={{ background: "#DCFCE7", color: "#166534", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999, fontFamily: "monospace" }}>{sk}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ background: "var(--accent-soft)", border: "1px solid var(--accent-mid)", borderRadius: "var(--r-sm)", padding: "14px 16px" }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>💡 Skills to Add</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {aiSuggestions.skills_recommendation.add_skills?.map((sk, i) => (
                        <span key={i} style={{ background: "var(--accent-mid)", color: "var(--accent-h)", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999, fontFamily: "monospace" }}>{sk}</span>
                      ))}
                    </div>
                  </div>
                </div>
                {aiSuggestions.skills_recommendation.integration_advice && (
                  <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: "14px 16px" }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>💡 Integration Advice</p>
                    <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.7, whiteSpace: "pre-line" }}>{aiSuggestions.skills_recommendation.integration_advice}</p>
                  </div>
                )}
              </Section>
            )}

            {/* Bullet rewrites */}
            {aiSuggestions.sections?.length > 0 && (
              <Section title="Tailored Bullet Point Suggestions" subtitle="Recommended rewrites to increase ATS keyword matching">
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  {aiSuggestions.sections.map((section, si) => (
                    <div key={si}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.07em", background: "var(--accent-soft)", border: "1px solid var(--accent-mid)", borderRadius: "var(--r-xs)", padding: "4px 12px", display: "inline-block", marginBottom: 14 }}>{section.title}</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {section.bullets?.map((b, bi) => (
                          <div key={bi} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
                            <div>
                              <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>Original</p>
                              <p style={{ fontSize: 13, color: "var(--text-3)", textDecoration: "line-through", lineHeight: 1.6 }}>{b.original}</p>
                            </div>
                            <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: 14 }}>
                              <p style={{ fontSize: 10, fontWeight: 700, color: "#166534", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>✨ Rewrite</p>
                              <p style={{ fontSize: 13, color: "var(--text-1)", lineHeight: 1.6, fontWeight: 500 }}>{b.rewritten}</p>
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

        {/* Bottom actions */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 8 }}>
          <button onClick={() => { resetContext(); navigate("/") }} className="btn-primary" style={{ padding: "12px 28px" }}>← Analyze Another</button>
        </div>
      </div>

      {/* Floating JD button */}
      <button
        onClick={() => setJdOpen(true)}
        style={{ position: "fixed", bottom: 24, right: 24, zIndex: 40, background: "var(--text-1)", color: "#fff", borderRadius: 999, padding: "12px 20px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: "var(--shadow-lg)", fontSize: 13, fontWeight: 600, transition: "transform 0.18s" }}
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
                style={{ width: "min(100vw, 540px)", background: "var(--surface)", height: "100%", display: "flex", flexDirection: "column", borderLeft: "1px solid var(--border)", boxShadow: "var(--shadow-lg)" }}
              >
                <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg)" }}>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: 15, color: "var(--text-1)", margin: 0 }}>Job Description</h3>
                    <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>Keyword highlights — matched, missing, optional</p>
                  </div>
                  <button onClick={() => setJdOpen(false)} style={{ width: 32, height: 32, borderRadius: "var(--r-xs)", background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)", cursor: "pointer" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  </button>
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: 24 }} className="custom-scrollbar">
                  <div style={{ display: "flex", gap: 14, marginBottom: 16, flexWrap: "wrap" }}>
                    {[["#DCFCE7", "#166534", "Matched"], ["#FEE2E2", "#991B1B", "Missing"], ["var(--accent-soft)", "var(--accent)", "Optional"]].map(([bg, col, label]) => (
                      <span key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: bg, border: `1.5px solid ${col}`, display: "inline-block" }} />{label}
                      </span>
                    ))}
                  </div>
                  <HighlightedJobDescription
                    text={jobDescription || data?.job_description_preview}
                    matched={data.matched_keywords} missing={data.missing_keywords} optional={data.optional_keywords}
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