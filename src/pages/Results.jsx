import { useContext, useEffect, useState, useRef } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ResumeContext } from "../context/ResumeContext"
import { useAuth } from "../context/useAuth"
import Navbar from "../components/Navbar"
import KofiButton from "../components/KofiButton"

const spring = { type: "spring", stiffness: 400, damping: 30 }

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t) }, [onClose])
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={spring}
      style={{
        position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
        zIndex: 500, background: "var(--text-1)", color: "#fff",
        padding: "12px 20px", borderRadius: 99, fontSize: 13, fontWeight: 600,
        display: "flex", alignItems: "center", gap: 8, boxShadow: "var(--shadow-lg)", whiteSpace: "nowrap"
      }}
    >
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: type === "success" ? "#4ade80" : "#f87171" }} />
      {message}
    </motion.div>
  )
}

function ScoreRing({ score, size = 128, stroke = 9 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 75 ? "var(--success)" : score >= 55 ? "var(--warning)" : "var(--danger)"
  const label = score >= 75 ? "Strong" : score >= 55 ? "Fair" : "Needs Work"
  const labelColor = score >= 75 ? "var(--success)" : score >= 55 ? "var(--warning)" : "var(--danger)"
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg-2)" strokeWidth={stroke}/>
          <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
            strokeLinecap="round" strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.3, ease: "easeOut" }}/>
        </svg>
        <div style={{ position: "absolute", textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-1.5px", lineHeight: 1 }}>{score}</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", marginTop: 3 }}>/ 100</div>
        </div>
      </div>
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        background: score >= 75 ? "var(--success-bg)" : score >= 55 ? "var(--warning-bg)" : "var(--danger-bg)",
        color: labelColor,
        border: `1px solid ${score >= 75 ? "var(--success-bd)" : score >= 55 ? "var(--warning-bd)" : "var(--danger-bd)"}`,
        fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 99
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: labelColor }} />
        {label}
      </span>
    </div>
  )
}

function ScoreBar({ label, value, color }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 800, color: "var(--text-1)" }}>{value}%</span>
      </div>
      <div style={{ height: 6, background: "var(--bg-2)", borderRadius: 99, overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${value}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          style={{ height: "100%", background: color, borderRadius: 99 }}
        />
      </div>
    </div>
  )
}

function HighlightedJD({ text, matched, missing, optional }) {
  if (!text) return <p style={{ color: "var(--text-3)", fontSize: 13 }}>No job description provided.</p>
  const allKeywords = [
    ...(matched || []).map(k => ({ word: k, type: "matched" })),
    ...(missing || []).map(k => ({ word: k, type: "missing" })),
    ...(optional || []).map(k => ({ word: k, type: "optional" })),
  ].sort((a, b) => b.word.length - a.word.length)
  if (!allKeywords.length) return <p style={{ fontSize: 13, color: "var(--text-2)", whiteSpace: "pre-wrap", lineHeight: 1.75 }}>{text}</p>
  const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const pattern = new RegExp(`\\b(${allKeywords.map(k => escape(k.word)).join("|")})\\b`, "gi")
  const parts = text.split(pattern)
  return (
    <div className="custom-scrollbar" style={{ fontSize: 13, whiteSpace: "pre-wrap", lineHeight: 1.75, color: "var(--text-2)", background: "var(--bg)", padding: "18px 20px", borderRadius: "var(--r-md)", border: "1px solid var(--border)", height: 260, overflowY: "auto" }}>
      {parts.map((part, i) => {
        const kw = allKeywords.find(k => k.word.toLowerCase() === part.toLowerCase())
        if (kw?.type === "matched") return <mark key={i} style={{ background: "transparent", borderBottom: "2px solid var(--success)", color: "var(--text-1)", padding: "0 1px", fontWeight: 600 }}>{part}</mark>
        if (kw?.type === "missing") return <mark key={i} style={{ background: "transparent", borderBottom: "2px solid var(--danger)", color: "var(--text-1)", padding: "0 1px", fontWeight: 600 }}>{part}</mark>
        if (kw?.type === "optional") return <mark key={i} style={{ background: "transparent", borderBottom: "2px solid var(--warning)", color: "var(--text-1)", padding: "0 1px", fontWeight: 600 }}>{part}</mark>
        return <span key={i}>{part}</span>
      })}
    </div>
  )
}

function SectionCard({ title, children, style }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={spring}
      className="ek-card"
      style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", overflow: "hidden", ...style }}>
      {title && (
        <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>{title}</h2>
        </div>
      )}
      <div style={{ padding: "20px 22px" }}>{children}</div>
    </motion.div>
  )
}

function Tag({ children, type }) {
  return (
    <span className={`tag ${type === "success" ? "tag-green" : type === "danger" ? "tag-red" : "tag-blue"}`}>
      {children}
    </span>
  )
}

function useWindowWidth() {
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 640)
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])
  return width
}

export default function Results() {
  const { resumeFile, jobDescription, company, role, resetContext } = useContext(ResumeContext)
  const { token } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()
  const location = useLocation()

  const [activeTab, setActiveTab] = useState(0)
  const [coreData, setCoreData] = useState(null)
  const [improveData, setImproveData] = useState(null)
  const [coverLetter, setCoverLetter] = useState(null)
  const [interviewData, setInterviewData] = useState(null)
  const [expYears, setExpYears] = useState(0)

  const [loading, setLoading] = useState({ core: false, improve: false, cover: false, interview: false })
  const [errors, setErrors] = useState({ core: null, improve: null, cover: null, interview: null })

  const [copied, setCopied] = useState(false)
  const windowWidth = useWindowWidth()
  const [coverLetterCopied, setCoverLetterCopied] = useState(false)
  const [toast, setToast] = useState(null)

  const navbarRef = useRef(null)
  const [navHeight, setNavHeight] = useState(57)

  useEffect(() => {
    if (navbarRef.current) {
      setNavHeight(navbarRef.current.getBoundingClientRect().height)
    }
  }, [])

  const showToast = (text, type = "success") => setToast({ text, type })

  useEffect(() => {
    if (!token) { navigate("/login"); return }

    const fetchCoreData = async () => {
      if (id) {
        setLoading(p => ({ ...p, core: true }))
        fetch(`${import.meta.env.VITE_BACKEND_URL}/history/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.detail || "Failed to load analysis"); return d })
        .then(d => {
          setCoreData(d.analysis)
          if (d.analysis.improvement_suggestions) setImproveData(d.analysis.improvement_suggestions)
        })
        .catch(() => { navigate("/history") })
        .finally(() => setLoading(p => ({ ...p, core: false })))
      } else if (location.state) {
        setCoreData(location.state)
      } else if (resumeFile) {
        setLoading(p => ({ ...p, core: true }))
        const fd = new FormData()
        fd.append("resume", resumeFile)
        fd.append("job_description", jobDescription)
        fd.append("company_name", company.trim())
        fd.append("job_role", role.trim())
        fetch(`${import.meta.env.VITE_BACKEND_URL}/analyze`, {
          method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd
        })
          .then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.detail || d.error || "Analysis failed."); return d })
          .then(d => { setCoreData(d); showToast("Analysis saved to history.") })
          .catch(e => {
            const isNetworkError = e.message === "Failed to fetch"
            setErrors(p => ({ ...p, core: isNetworkError
              ? "The AI backend is starting up. Please wait 30–60 seconds and try again."
              : e.message
            }))
          })
          .finally(() => setLoading(p => ({ ...p, core: false })))
      } else {
        navigate("/")
      }
    }
    fetchCoreData()
  }, [id, location.state, resumeFile, token, navigate, jobDescription, company, role])

  const handleAiImprove = async () => {
    if (!resumeFile || !jobDescription) return
    setLoading(p => ({ ...p, improve: true }))
    setErrors(p => ({ ...p, improve: null }))
    const fd = new FormData()
    fd.append("resume", resumeFile)
    fd.append("job_description", jobDescription)
    if (coreData?.id) fd.append("analysis_id", coreData.id)
    try {
      const r = await fetch(`${import.meta.env.VITE_BACKEND_URL}/improve`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd
      })
      const result = await r.json()
      if (!r.ok) throw new Error(result.detail || result.error || "Failed to generate improvements.")
      if (result.suggestions) { setImproveData(result.suggestions); showToast("AI improvements ready.") }
    } catch {
      setErrors(p => ({ ...p, improve: "Failed to connect to AI." }))
      showToast("Failed to connect to AI.", "error")
    } finally { setLoading(p => ({ ...p, improve: false })) }
  }

  useEffect(() => {
    if (activeTab === 1 && !improveData && !loading.improve && !errors.improve) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleAiImprove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, improveData, loading.improve, errors.improve])

  const handleCoverLetter = async () => {
    if (!resumeFile || !jobDescription) return
    setLoading(p => ({ ...p, cover: true }))
    setErrors(p => ({ ...p, cover: null }))
    const fd = new FormData()
    fd.append("resume", resumeFile)
    fd.append("job_description", jobDescription)
    fd.append("company_name", company || "")
    fd.append("experience_years", expYears)
    try {
      const r = await fetch(`${import.meta.env.VITE_BACKEND_URL}/cover-letter`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd
      })
      const result = await r.json()
      if (!r.ok) throw new Error(result.detail || "Failed")
      setCoverLetter(result.cover_letter)
      showToast("Cover letter generated.")
    } catch { 
      setErrors(p => ({ ...p, cover: "Cover letter generation failed." }))
      showToast("Cover letter generation failed.", "error") 
    }
    finally { setLoading(p => ({ ...p, cover: false })) }
  }

  const handleMockInterview = async () => {
    if (!jobDescription) return
    setLoading(p => ({ ...p, interview: true }))
    setErrors(p => ({ ...p, interview: null }))
    const fd = new FormData()
    fd.append("job_description", jobDescription)
    fd.append("experience_years", expYears)
    if (resumeFile) fd.append("resume", resumeFile)
    try {
      const r = await fetch(`${import.meta.env.VITE_BACKEND_URL}/mock-interview`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd
      })
      const result = await r.json()
      if (!r.ok) throw new Error(result.detail || "Failed")
      setInterviewData(result.interview_plan)
      showToast("Interview plan ready.")
    } catch { 
      setErrors(p => ({ ...p, interview: "Interview generation failed." }))
      showToast("Interview generation failed.", "error") 
    }
    finally { setLoading(p => ({ ...p, interview: false })) }
  }

  if (errors.core) return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar />
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
        <div style={{ textAlign: "center", maxWidth: 440 }}>
          <div style={{ width: 52, height: 52, background: "var(--danger-bg)", borderRadius: "var(--r-lg)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "var(--danger)" }}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.5px" }}>Analysis Failed</h2>
          <p style={{ color: "var(--text-3)", fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>{errors.core}</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => { setErrors(p => ({...p, core: null})); navigate(0) }} className="btn-accent" style={{ padding: "11px 28px" }}>↺ Retry</button>
            <button onClick={() => { resetContext(); navigate("/") }} className="btn-secondary" style={{ padding: "11px 24px" }}>← New Analysis</button>
          </div>
        </div>
      </div>
    </div>
  )

  const loadingSteps = ["Parsing resume…", "Extracting keywords…", "Running AI analysis…", "Generating suggestions…"]

  if (loading.core || !coreData) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center" }}>
        <div style={{ position: "relative", width: 72, height: 72, margin: "0 auto 32px" }}>
          <div style={{ position: "absolute", inset: 0, width: 72, height: 72, border: "4px solid var(--border)", borderRadius: "50%" }} />
          <div style={{ position: "absolute", inset: 0, width: 72, height: 72, border: "4px solid transparent", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 8, color: "var(--text-1)" }}>Analyzing Resume</h1>
        <p style={{ color: "var(--text-2)", marginBottom: 32 }}>Our AI is reviewing your resume against the job description</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 260, margin: "0 auto" }}>
          {loadingSteps.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 1.5 }}
              style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "var(--text-2)" }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 1.5 + 0.3 }}
                style={{ width: 20, height: 20, background: "var(--accent)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="10" height="10" viewBox="0 0 20 20" fill="white"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              </motion.div>
              {s}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )

  const jobAnalysis = coreData.job_analysis || coreData.eligibility?.job_analysis
  const atsBad = coreData.ats_score < 55
  const tabs = ["Overview", "AI Improve", "Cover Letter", "Interview Prep"]

  const displayCoverLetter = coreData?.cover_letter || coverLetter
  const displayInterview = coreData?.interview_plan || interviewData

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar ref={navbarRef} />
      <AnimatePresence>{toast && <Toast message={toast.text} type={toast.type} onClose={() => setToast(null)} />}</AnimatePresence>

      <div style={{
        position: "sticky",
        top: navHeight,
        zIndex: 90,
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}>
        <div className="container" style={{
          display: "flex",
          gap: "clamp(20px, 4vw, 32px)",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          whiteSpace: "nowrap",
        }}>
          {tabs.map((t, i) => (
            <button key={i} onClick={() => setActiveTab(i)} style={{ padding: "16px 0", background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: activeTab === i ? "var(--text-1)" : "var(--text-3)", borderBottom: activeTab === i ? "2px solid var(--accent)" : "2px solid transparent", transition: "color 0.2s, border-color 0.2s", outline: "none", whiteSpace: "nowrap" }}>{t}</button>
          ))}
        </div>
      </div>

      <div className="container" style={{ paddingTop: "clamp(24px,4vw,40px)", paddingBottom: 96 }}>
        {id && coreData && (
          <div style={{ background: "var(--accent-soft)", color: "var(--text-2)", borderRadius: "var(--r-md)", border: "1px solid var(--accent-mid)", padding: "12px 20px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13 }}>You are viewing a past analysis from {coreData?.created_at ? new Date(coreData.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "history"}.</span>
            <button onClick={() => navigate('/history')} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: 13, fontWeight: 600, textDecoration: "none", fontFamily: "inherit" }}>← Back to History</button>
          </div>
        )}

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={spring} style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <h1 style={{ fontSize: "clamp(22px,4vw,30px)", fontWeight: 800, letterSpacing: "-0.04em", marginBottom: 5 }}>
                {coreData.company_name || company ? `${coreData.company_name || company} — ATS Report` : "ATS Report"}
              </h1>
              <p style={{ fontSize: 13.5, color: "var(--text-3)" }}>
                {coreData.job_role || role ? <>{coreData.job_role || role} · </> : null}{coreData.filename || resumeFile?.name}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={() => navigate("/history")} className="btn-secondary" style={{ padding: "10px 20px" }}>History</button>
              <button onClick={() => { resetContext(); navigate("/") }} className="btn-secondary" style={{ padding: "10px 20px" }}>← New Analysis</button>
            </div>
          </div>
        </motion.div>

        {atsBad && activeTab === 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={spring}
            style={{ background: "var(--danger-bg)", border: "1px solid var(--danger-bd)", borderRadius: "var(--r-xl)", padding: "16px 22px", marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 36, height: 36, background: "var(--danger)", borderRadius: "var(--r-sm)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--danger)", marginBottom: 3 }}>Your resume is not ATS-ready for this role</p>
              <p style={{ fontSize: 13, color: "var(--danger)", opacity: 0.8 }}>Score is below 55. Add the missing keywords and use "Improve Resume" to get AI rewrites.</p>
            </div>
          </motion.div>
        )}

        {/* TAB 0: OVERVIEW */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={{ display: activeTab === 0 ? "flex" : "none", flexDirection: "column", gap: 16 }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 16, alignItems: "stretch" }}>
            <SectionCard style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 0, minWidth: 200 }}>
              <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Match Score</p>
                <ScoreRing score={coreData.ats_score || 0} />
              </div>
            </SectionCard>

            <SectionCard title="Score Breakdown">
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {coreData.keyword_score !== undefined && (
                  <ScoreBar label="Keyword Match" value={coreData.keyword_score} color="var(--accent)" />
                )}
                {coreData.semantic_score !== undefined && (
                  <ScoreBar label="Semantic Alignment" value={coreData.semantic_score} color="var(--success)" />
                )}
                <ScoreBar label="Overall ATS Score" value={coreData.ats_score || 0} color="var(--text-1)" />
              </div>
            </SectionCard>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <SectionCard title="Matched Keywords">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {coreData.matched_keywords?.length
                  ? coreData.matched_keywords.map((kw, i) => <Tag key={i} type="success">{kw}</Tag>)
                  : <p style={{ color: "var(--text-3)", fontSize: 13 }}>No matched keywords</p>
                }
              </div>
            </SectionCard>
            <SectionCard title="Missing Keywords">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {coreData.missing_keywords?.length
                  ? coreData.missing_keywords.map((kw, i) => <Tag key={i} type="danger">{kw}</Tag>)
                  : <p style={{ color: "var(--text-3)", fontSize: 13 }}>No missing keywords — great!</p>
                }
              </div>
            </SectionCard>
          </div>

          {coreData.warnings?.length > 0 && (
            <div style={{ background: "var(--warning-bg)", border: "1px solid var(--warning-bd)", borderRadius: "var(--r-xl)", padding: "18px 22px" }}>
              <p style={{ fontSize: 11.5, fontWeight: 700, color: "var(--warning)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                ⚠ Formatting Warnings ({coreData.warnings.length})
              </p>
              <ul style={{ paddingLeft: 18, display: "flex", flexDirection: "column", gap: 7 }}>
                {coreData.warnings.map((w, i) => <li key={i} style={{ fontSize: 13.5, color: "var(--warning)", lineHeight: 1.6 }}>{w}</li>)}
              </ul>
            </div>
          )}

          <SectionCard title="Job Description Analysis">
            {jobAnalysis && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                {[
                  { label: "Role Focus", value: jobAnalysis.role_focus },
                  { label: "Recruiter Needs", value: jobAnalysis.recruiter_needs },
                ].map(f => (
                  <div key={f.label} style={{ background: "var(--bg)", borderRadius: "var(--r-md)", padding: "14px 16px", border: "1px solid var(--border)" }}>
                    <p style={{ fontSize: 10.5, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 7 }}>{f.label}</p>
                    <p style={{ fontSize: 13.5, color: "var(--text-2)", lineHeight: 1.65 }}>{f.value}</p>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: "flex", gap: 18, marginBottom: 14, flexWrap: "wrap" }}>
              {[
                { label: "Matched", color: "var(--success)" },
                { label: "Missing", color: "var(--danger)" },
                { label: "Optional", color: "var(--warning)" },
              ].map(l => (
                <span key={l.label} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 600, color: "var(--text-2)" }}>
                  <span style={{ width: 14, height: 2.5, background: l.color, borderRadius: 99, display: "inline-block" }} />{l.label}
                </span>
              ))}
            </div>
            <HighlightedJD text={jobDescription || coreData.job_description_preview} matched={coreData.matched_keywords} missing={coreData.missing_keywords} optional={coreData.optional_keywords} />
          </SectionCard>
        </motion.div>

        {/* TAB 1: AI IMPROVE */}
        <div style={{ display: activeTab === 1 ? "flex" : "none", flexDirection: "column", gap: 16 }}>
          {loading.improve ? (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", padding: "44px 32px", textAlign: "center" }}>
              <div style={{ width: 28, height: 28, border: "3px solid var(--border-2)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.75s linear infinite", margin: "0 auto 20px" }} />
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Generating AI improvements…</h2>
              <p style={{ fontSize: 13.5, color: "var(--text-3)" }}>Rewriting bullets, analyzing skills, generating summary.</p>
            </div>
          ) : errors.improve ? (
            <div style={{ background: "var(--danger-bg)", border: "1px solid var(--danger-bd)", borderRadius: "var(--r-xl)", padding: "32px", textAlign: "center" }}>
              <p style={{ color: "var(--danger)", fontWeight: 600, marginBottom: 12 }}>{errors.improve}</p>
              <button onClick={handleAiImprove} className="btn-accent" style={{ padding: "8px 20px", fontSize: 13 }}>↺ Retry</button>
            </div>
          ) : !improveData ? (
            <SectionCard>
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <p style={{ color: "var(--text-3)", marginBottom: 16 }}>AI improvements are not generated yet.</p>
                <button onClick={handleAiImprove} disabled={!resumeFile} className="btn-accent" style={{ padding: "10px 24px" }}>
                  {resumeFile ? "Generate AI Improvements" : "Upload resume to enable AI Improvements"}
                </button>
              </div>
            </SectionCard>
          ) : (
            <SectionCard title="AI Improvements">
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {improveData.summary && (
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Professional Summary</p>
                    <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "16px 18px", fontSize: 14, color: "var(--text-1)", lineHeight: 1.75 }}>
                      {improveData.summary}
                    </div>
                    <button
                      onClick={() => { navigator.clipboard.writeText(improveData.summary); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                      style={{ marginTop: 8, fontSize: 12, color: "var(--accent)", background: "transparent", border: "none", cursor: "pointer", fontWeight: 700, fontFamily: "inherit" }}
                    >
                      {copied ? "Copied!" : "Copy summary"}
                    </button>
                  </div>
                )}

                {improveData.ai_snapshot && (
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>AI Assessment</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                      {[
                        { label: "Keep", value: improveData.ai_snapshot.keep, accent: "success" },
                        { label: "Missing", value: improveData.ai_snapshot.missing, accent: "warning" },
                        { label: "Gaps", value: improveData.ai_snapshot.experience_gap, accent: "danger" },
                      ].map(c => (
                        <div key={c.label} style={{
                          background: `var(--${c.accent}-bg)`, border: `1px solid var(--${c.accent}-bd)`,
                          borderRadius: "var(--r-md)", padding: "13px 15px"
                        }}>
                          <p style={{ fontSize: 10.5, fontWeight: 700, color: `var(--${c.accent})`, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>{c.label}</p>
                          <p style={{ fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.6 }}>{c.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {improveData.skills_recommendation && (
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Skills</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div style={{ background: "var(--success-bg)", border: "1px solid var(--success-bd)", borderRadius: "var(--r-md)", padding: "14px 16px" }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "var(--success)", marginBottom: 10 }}>✓ Keep</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                          {improveData.skills_recommendation.keep_skills?.map((sk, i) => <span key={i} className="tag tag-green" style={{ fontSize: 11 }}>{sk}</span>)}
                        </div>
                      </div>
                      <div style={{ background: "var(--accent-soft)", border: "1px solid var(--accent-mid)", borderRadius: "var(--r-md)", padding: "14px 16px" }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", marginBottom: 10 }}>+ Add</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                          {improveData.skills_recommendation.add_skills?.map((sk, i) => <span key={i} className="tag tag-blue" style={{ fontSize: 11 }}>{sk}</span>)}
                        </div>
                      </div>
                    </div>
                    {improveData.skills_recommendation.integration_advice && (
                      <div style={{ marginTop: 10, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "13px 15px", fontSize: 13.5, color: "var(--text-2)", lineHeight: 1.65 }}>
                        <span style={{ fontWeight: 700, color: "var(--text-1)" }}>Advice: </span>
                        {improveData.skills_recommendation.integration_advice}
                      </div>
                    )}
                  </div>
                )}

                {improveData.sections?.length > 0 && (
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Bullet Rewrites</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {improveData.sections.map((sect, i) => (
                        <div key={i}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.06em", background: "var(--accent-soft)", border: "1px solid var(--accent-mid)", borderRadius: "var(--r-xs)", padding: "3px 10px", display: "inline-block", marginBottom: 10 }}>{sect.title}</span>
                          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {sect.bullets?.map((b, bi) => (
                              <div key={bi} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "14px 16px" }}>
                                <div>
                                  <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Original</p>
                                  <p style={{ fontSize: 13, color: "var(--text-3)", textDecoration: "line-through", lineHeight: 1.6 }}>{b.original}</p>
                                </div>
                                <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: 14 }}>
                                  <p style={{ fontSize: 10, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Rewrite</p>
                                  <p style={{ fontSize: 13, color: "var(--text-1)", fontWeight: 500, lineHeight: 1.6 }}>{b.rewritten}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>
          )}
        </div>

        {/* TAB 2: COVER LETTER */}
        <div style={{ display: activeTab === 2 ? "flex" : "none", flexDirection: "column", gap: 16 }}>
          <SectionCard title="Cover Letter Generator">
            {displayCoverLetter ? (
              <div>
                <div className="custom-scrollbar" style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "16px 18px", fontSize: 14, color: "var(--text-1)", lineHeight: 1.8, whiteSpace: "pre-wrap", maxHeight: 420, overflowY: "auto" }}>
                  {displayCoverLetter}
                </div>
                <button
                  onClick={() => { navigator.clipboard.writeText(displayCoverLetter); setCoverLetterCopied(true); setTimeout(() => setCoverLetterCopied(false), 2000) }}
                  style={{ marginTop: 12, fontSize: 12, color: "var(--accent)", background: "transparent", border: "none", cursor: "pointer", fontWeight: 700, fontFamily: "inherit" }}
                >
                  {coverLetterCopied ? "Copied!" : "Copy Cover Letter"}
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)", display: "flex", alignItems: "center" }}>
                    Years of Experience:
                    <input type="number" min="0" max="20" value={expYears} onChange={e => setExpYears(e.target.value)}
                      className="input-ek" style={{ marginLeft: 8, padding: "8px 12px", width: 120 }} />
                  </label>
                  <button onClick={handleCoverLetter} disabled={loading.cover || !resumeFile} className="btn-accent" style={{ padding: "10px 24px" }}>
                    Generate Cover Letter
                  </button>
                </div>
                {!resumeFile && <p style={{ fontSize: 12, color: "var(--danger)" }}>Requires resume file to generate.</p>}
                {errors.cover && <p style={{ fontSize: 13, color: "var(--danger)", fontWeight: 600 }}>{errors.cover}</p>}
                
                {loading.cover && (
                  <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <div style={{ width: 24, height: 24, border: "2px solid var(--border-2)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.75s linear infinite", margin: "0 auto 10px" }} />
                    <p style={{ fontSize: 13, color: "var(--text-3)" }}>Drafting professional cover letter…</p>
                  </div>
                )}
              </div>
            )}
          </SectionCard>
        </div>

        {/* TAB 3: INTERVIEW PREP */}
        <div style={{ display: activeTab === 3 ? "flex" : "none", flexDirection: "column", gap: 16 }}>
          <SectionCard title="Mock Interview Generator">
            {displayInterview ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {displayInterview.rounds?.map((round, idx) => (
                  <div key={idx} style={{ background: "var(--bg)", borderRadius: "var(--r-md)", padding: "16px 18px", border: "1px solid var(--border)", borderLeft: "3px solid var(--accent-mid)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, flexWrap: "wrap", gap: 10 }}>
                      <div>
                        <span className="badge badge-accent" style={{ marginBottom: 6 }}>{round.round}</span>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-2)", marginTop: 8 }}>{round.focus}</p>
                      </div>
                      <div style={{ textAlign: "right", marginTop: 4 }}>
                        <p style={{ fontSize: 12, color: "var(--text-3)", textTransform: "uppercase", fontWeight: 700 }}>{round.interviewer}</p>
                        <p style={{ fontSize: 12, color: "var(--text-3)" }}>{round.duration}</p>
                      </div>
                    </div>
                    <ol style={{ margin: 0, paddingLeft: 18, color: "var(--text-1)", fontSize: 13.5, lineHeight: 1.7, display: "flex", flexDirection: "column", gap: 8 }}>
                      {round.questions?.map((q, i) => (
                        <li key={i} style={{ paddingLeft: 4 }}>{q}</li>
                      ))}
                    </ol>
                    {round.prep_tip && (
                      <div style={{ background: "var(--accent-soft)", border: "1px solid var(--accent-mid)", borderRadius: "var(--r-md)", padding: "10px 14px", fontSize: 12.5, color: "var(--accent)", marginTop: 14, fontWeight: 500 }}>
                        💡 Tip: {round.prep_tip}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <button onClick={handleMockInterview} disabled={loading.interview || !jobDescription} className="btn-accent" style={{ padding: "10px 24px" }}>
                    Generate Mock Interview
                  </button>
                </div>
                {!jobDescription && <p style={{ fontSize: 12, color: "var(--danger)" }}>Requires job description to generate.</p>}
                {errors.interview && <p style={{ fontSize: 13, color: "var(--danger)", fontWeight: 600 }}>{errors.interview}</p>}

                {loading.interview && (
                  <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <div style={{ width: 24, height: 24, border: "2px solid var(--border-2)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.75s linear infinite", margin: "0 auto 10px" }} />
                    <p style={{ fontSize: 13, color: "var(--text-3)" }}>Designing interview rounds…</p>
                  </div>
                )}
              </div>
            )}
          </SectionCard>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.3 }}
          style={{
            background: "var(--accent-soft)",
            border: "1px solid var(--accent-mid)",
            borderRadius: "var(--r-xl)",
            padding: "clamp(24px, 5vw, 36px)",
            textAlign: "center",
            marginTop: 32
          }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 8, color: "var(--text-1)" }}>
            Did this help you land an interview? ☕
          </h2>
          <p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.6, maxWidth: 500, margin: "0 auto 24px" }}>
            I built this tool entirely for free to help job seekers beat the ATS. If it helped you out, consider dropping a tip to help keep the servers running!
          </p>
          <KofiButton style={{ padding: "12px 28px", fontSize: 15 }} />
        </motion.div>

      </div>
    </div>
  )
}