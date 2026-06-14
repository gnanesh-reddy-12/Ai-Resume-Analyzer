import { useContext, useEffect, useState } from "react"
import Navbar from "../components/Navbar"
import AnalyzeSection from "../components/AnalyzeSection"
import { useAuth } from "../context/useAuth"
import { ResumeContext } from "../context/ResumeContext"
import { motion } from "framer-motion"
import CompanyLogo from "../components/CompanyLogo"
import { useNavigate } from "react-router-dom"
import { supabase } from "../supabase"

const spring = { type: "spring", stiffness: 400, damping: 30 }

const tips = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
    title: "Mirror exact language",
    desc: "Use literal phrases from the posting. ATS looks for exact matches, not synonyms."
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    title: "Quantify your impact",
    desc: "Numbers make achievements concrete. 'Improved performance by 40%' beats 'improved performance'."
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
    ),
    title: "Keep formats clean",
    desc: "Single-column layouts with standard fonts parse reliably across all ATS platforms."
  },
]

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { resetContext } = useContext(ResumeContext)
  const name = localStorage.getItem("display_name") || user?.user_metadata?.full_name?.split(" ")[0] || "there"
  const [stats, setStats] = useState(null)
  const [lastAnalysis, setLastAnalysis] = useState(null)

  useEffect(() => { resetContext() }, [resetContext])

  useEffect(() => {
    if (!user) return
    supabase
      .from("analyses")
      .select("ats_score, company_name, job_role, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!data?.length) return
        const avg = Math.round(data.reduce((s, r) => s + (r.ats_score || 0), 0) / data.length)
        const best = Math.max(...data.map(r => r.ats_score || 0))
        setStats({ total: data.length, avg, best })
        setLastAnalysis(data[0])
      })
  }, [user])

  const scoreColor = (s) =>
    s >= 75 ? "var(--success)" : s >= 55 ? "var(--warning)" : "var(--danger)"

  const scoreBg = (s) =>
    s >= 75 ? "var(--success-bg)" : s >= 55 ? "var(--warning-bg)" : "var(--danger-bg)"

  const scoreBd = (s) =>
    s >= 75 ? "var(--success-bd)" : s >= 55 ? "var(--warning-bd)" : "var(--danger-bd)"

  const scoreLabel = (s) =>
    s >= 75 ? "Strong" : s >= 55 ? "Fair" : "Needs Work"

  return (
    <>
      <Navbar />
      <div className="container" style={{ paddingTop: "clamp(36px,6vw,64px)", paddingBottom: 80, maxWidth: 820 }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={spring}
          style={{ marginBottom: stats ? 28 : 40 }}
        >
          <h1 style={{ fontSize: "clamp(24px,4vw,34px)", fontWeight: 800, letterSpacing: "-1px", marginBottom: 6 }}>
            Welcome back, {name}
          </h1>
          <p style={{ fontSize: 15, color: "var(--text-3)", fontWeight: 400 }}>
            Upload your resume and paste a job description to begin analysis.
          </p>
        </motion.div>

        {/* Quick stats */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.04 }}
            style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 28 }}
          >
            {[
              { label: "Total Analyses", value: stats.total },
              { label: "Avg Score", value: `${stats.avg}%` },
              { label: "Best Score", value: `${stats.best}%` },
            ].map(s => (
              <div key={s.label} className="ek-card" style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: "var(--r-lg)", padding: "16px 18px"
              }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>{s.label}</p>
                <p style={{ fontSize: "clamp(20px,3vw,26px)", fontWeight: 800, color: "var(--text-1)", letterSpacing: "-1px", lineHeight: 1 }}>{s.value}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Last analysis card */}
        {lastAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.07 }}
            onClick={() => navigate("/history")}
            className="ek-card"
            style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: "var(--r-xl)", padding: "16px 20px", marginBottom: 28,
              display: "flex", alignItems: "center", gap: 16,
              cursor: "pointer", transition: "border-color 0.15s, box-shadow 0.15s"
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.boxShadow = "var(--shadow-md)" }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none" }}
          >
            <div style={{
              minWidth: 56, height: 48, padding: "0 10px", flexShrink: 0, borderRadius: "var(--r-md)",
              background: scoreBg(lastAnalysis.ats_score),
              border: `1px solid ${scoreBd(lastAnalysis.ats_score)}`,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
            }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: scoreColor(lastAnalysis.ats_score), lineHeight: 1 }}>{lastAnalysis.ats_score}%</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: scoreColor(lastAnalysis.ats_score), marginTop: 3, whiteSpace: "nowrap" }}>{scoreLabel(lastAnalysis.ats_score)}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>Last Analysis</p>
              <div style={{ display: "flex", alignItems: "center", gap: 6, overflow: "hidden" }}>
                {lastAnalysis.company_name && <CompanyLogo name={lastAnalysis.company_name} size={18} />}
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {lastAnalysis.company_name || "Unnamed Company"}
                  {lastAnalysis.job_role && <span style={{ fontWeight: 500, color: "var(--text-3)" }}> · {lastAnalysis.job_role}</span>}
                </p>
              </div>
              <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>
                {new Date(lastAnalysis.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              <span style={{ fontSize: 12.5, color: "var(--accent)", fontWeight: 600 }}>View</span>
              <svg width="14" height="14" fill="none" stroke="var(--accent)" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            </div>
          </motion.div>
        )}

        {/* Analyze form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.1 }}
        >
          <AnalyzeSection />
        </motion.div>

        {/* ATS Tips */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.15 }}
          className="ek-card"
          style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--r-xl)", padding: "clamp(22px,4vw,32px)", marginTop: 24
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 22 }}>
            <div style={{
              width: 7, height: 7, borderRadius: "50%", background: "var(--accent)"
            }} />
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>
              ATS Optimization Best Practices
            </h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
            {tips.map((t, i) => (
              <div key={i} className="ek-card" style={{
                background: "var(--bg)", border: "1px solid var(--border)",
                borderRadius: "var(--r-lg)", padding: "18px 18px 16px"
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "var(--r-sm)",
                  background: "var(--accent-soft)", color: "var(--accent)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 12, border: "1px solid var(--accent-mid)"
                }}>
                  {t.icon}
                </div>
                <p style={{ fontWeight: 700, fontSize: 13.5, color: "var(--text-1)", marginBottom: 6 }}>{t.title}</p>
                <p style={{ fontSize: 12.5, color: "var(--text-3)", lineHeight: 1.6 }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  )
}