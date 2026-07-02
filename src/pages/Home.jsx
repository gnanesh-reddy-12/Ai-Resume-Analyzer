import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ResumeContext } from "../context/ResumeContext"
import { useAuth } from "../context/useAuth"
import { supabase } from "../supabase"

import AppLayout from "../components/AppLayout"
import AnalyzeSection from "../components/AnalyzeSection"
import CompanyLogo from "../components/CompanyLogo"

/* ─── Design tokens ─── */
const T = {
  bg: "#FAF8F5",
  bg2: "#F0ECE6",
  surface: "#FFFFFF",
  text1: "#1A1410",
  text2: "#4A4540",
  text3: "#9C9690",
  accent: "#5C6B4E",
  accentSoft: "#EEF1EA",
  accentMid: "#C8D4BE",
  border: "rgba(26,20,16,0.08)",
  border2: "rgba(26,20,16,0.14)",
  success: "#1A7A45",
  successBg: "#F0FDF4",
  successBd: "#86EFAC",
  warning: "#92400E",
  warningBg: "#FFFBEB",
  warningBd: "#FDE68A",
  danger: "#C9252D",
  dangerBg: "#FFF1F0",
  dangerBd: "#FFCCC7",
  shadowSm: "0 1px 4px rgba(26,20,16,0.07)",
}

const scoreTheme = (s) =>
  s >= 75
    ? { color: T.success, bg: T.successBg, bd: T.successBd, label: "Strong" }
    : s >= 55
    ? { color: T.warning, bg: T.warningBg, bd: T.warningBd, label: "Fair" }
    : { color: T.danger, bg: T.dangerBg, bd: T.dangerBd, label: "Weak" }

function ScoreBadge({ score }) {
  const th = scoreTheme(score)
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: th.bg, color: th.color,
      border: `1px solid ${th.bd}`,
      borderRadius: 8, padding: "3px 10px",
      fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap",
    }}>
      {score}%
    </span>
  )
}

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { resetContext } = useContext(ResumeContext)
  
  const [stats, setStats] = useState(null)
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { resetContext() }, [resetContext])

  useEffect(() => {
    if (!user) return

    // Get real total count (all time)
    supabase
      .from("analyses")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .then(({ count }) => {
        if (count != null) setStats(prev => ({ ...(prev || { avg: 0, best: 0 }), total: count }))
      })

    // Get last 8 for display + avg/best
    supabase
      .from("analyses")
      .select("id, ats_score, company_name, job_role, created_at, filename")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(8)
      .then(({ data }) => {
        setLoading(false)
        if (!data?.length) return
        const avg = Math.round(data.reduce((s, r) => s + (r.ats_score || 0), 0) / data.length)
        const best = Math.max(...data.map(r => r.ats_score || 0))
        setStats(prev => ({ ...(prev || {}), avg, best }))
        setAnalyses(data)
      })
  }, [user])

  const fmt = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" })

  return (
    <AppLayout activeId="dashboard">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: T.text1, letterSpacing: "-0.01em" }}>Dashboard</h1>
        {analyses.length > 0 && (
          <button
            onClick={() => navigate("/history")}
            style={{
              padding: "8px 14px", borderRadius: 8, border: `1px solid ${T.border}`,
              background: T.surface, color: T.text2, fontSize: 13, fontWeight: 600,
              fontFamily: "inherit", cursor: "pointer", transition: "all 150ms",
            }}
            onMouseEnter={e => e.currentTarget.style.background = T.bg2}
            onMouseLeave={e => e.currentTarget.style.background = T.surface}
          >
            View All History →
          </button>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        {loading ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: T.text3 }}>Loading...</div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            style={{ display: "flex", flexDirection: "column", flex: 1 }}
          >
            {/* Stats row */}
            {stats && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "clamp(8px, 2vw, 16px)", marginBottom: 24 }}>
                {[
                  { label: "ANALYZED", value: stats.total },
                  { label: "AVG SCORE", value: `${stats.avg}%` },
                  { label: "BEST SCORE", value: `${stats.best}%` },
                ].map(s => (
                  <div key={s.label} style={{
                    background: T.surface, border: `1px solid ${T.border}`,
                    borderRadius: 10, padding: "clamp(12px, 3vw, 16px) clamp(8px, 2vw, 20px)",
                    boxShadow: T.shadowSm, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center"
                  }}>
                    <p style={{ fontSize: "clamp(8px, 2vw, 9.5px)", fontWeight: 700, color: T.text3, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}>{s.label}</p>
                    <p style={{ fontSize: "clamp(20px, 5vw, 28px)", fontWeight: 800, color: T.text1, letterSpacing: "-0.04em", lineHeight: 1 }}>{s.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Main Form */}
            <div style={{ marginBottom: 24, width: "100%" }}>
              <AnalyzeSection />
            </div>

            {/* Recent Analyses List */}
            {analyses.length > 0 && (
              <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, boxShadow: T.shadowSm, overflow: "hidden" }}>
                <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}`, background: T.bg }}>
                  <h2 style={{ fontSize: 13, fontWeight: 700, color: T.text1, letterSpacing: "0.02em", textTransform: "uppercase" }}>Recent Analyses</h2>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {analyses.map((item, i) => (
                    <div
                      key={item.id}
                      onClick={() => navigate(`/results/${item.id}`)}
                      style={{
                        padding: "16px 20px",
                        borderBottom: i < analyses.length - 1 ? `1px solid ${T.border}` : "none",
                        display: "flex", alignItems: "center", gap: 16,
                        cursor: "pointer", transition: "background 150ms",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = T.bg}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <CompanyLogo name={item.company_name || "?"} size={36} />
                      
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: T.text1 }}>
                            {item.company_name || "General"}
                          </span>
                          <span style={{ color: T.border2 }}>•</span>
                          <span style={{ fontSize: 13, color: T.text2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {item.job_role || "Resume Analysis"}
                          </span>
                          <ScoreBadge score={item.ats_score} />
                        </div>
                        <div style={{ fontSize: 12, color: T.text3, display: "flex", alignItems: "center", gap: 6 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                          {item.filename || "resume.pdf"}
                          <span>•</span>
                          {fmt(item.created_at)}
                        </div>
                      </div>
                      
                      <div style={{ color: T.border2 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </AppLayout>
  )
}