import { useContext, useEffect } from "react"
import Navbar from "../components/Navbar"
import AnalyzeSection from "../components/AnalyzeSection"
import { useAuth } from "../context/useAuth"
import { ResumeContext } from "../context/ResumeContext"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"

const ease = [0.16, 1, 0.3, 1]

const tips = [
  { icon: "🎯", title: "Use exact keywords", desc: "Mirror language from the job description directly in your resume." },
  { icon: "📊", title: "Quantify everything", desc: "Numbers make achievements tangible — recruiters notice them first." },
  { icon: "⚡", title: "Keep formatting clean", desc: "Simple, consistent layout scores higher with ATS systems." },
]

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { resetContext } = useContext(ResumeContext)
  const name = localStorage.getItem("display_name") || user?.email?.split("@")[0] || "there"

  useEffect(() => { resetContext() }, [resetContext])

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "clamp(24px, 4vw, 40px) clamp(16px, 4vw, 24px) 80px" }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          style={{ marginBottom: 28 }}
        >
          <span className="section-label">Dashboard</span>
          <h1 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, letterSpacing: "-0.8px", color: "var(--text-1)", marginBottom: 6 }}>
            Hey, {name} 👋
          </h1>
          <p style={{ fontSize: 15, color: "var(--text-3)", lineHeight: 1.6 }}>
            Ready to beat the ATS? Upload your resume and paste a job description below.
          </p>
        </motion.div>

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease }}
          >
            <AnalyzeSection />
          </motion.div>

          {/* Tips + History row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Quick tips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease }}
              className="card" style={{ padding: "24px 24px 20px" }}
            >
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 18 }}>💡 Quick Tips</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {tips.map((t, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1 }}>{t.icon}</span>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 13, color: "var(--text-1)", marginBottom: 3 }}>{t.title}</p>
                      <p style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.6 }}>{t.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* History shortcut */}
            <motion.button
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease }}
              whileHover={{ y: -2 }}
              onClick={() => navigate("/history")}
              style={{
                background: "linear-gradient(135deg, var(--accent-soft) 0%, var(--bg-2) 100%)",
                border: "1px solid var(--accent-mid)",
                borderRadius: "var(--r-lg)",
                padding: "24px", textAlign: "left",
                cursor: "pointer", transition: "box-shadow 0.2s",
                display: "flex", flexDirection: "column", justifyContent: "space-between",
                minHeight: 150
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "var(--shadow-md)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
            >
              <div>
                <div style={{ width: 40, height: 40, background: "var(--accent-soft)", border: "1px solid var(--accent-mid)", borderRadius: "var(--r-sm)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, color: "var(--accent)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                </div>
                <p style={{ fontWeight: 700, fontSize: 14, color: "var(--accent)", marginBottom: 6 }}>Past Analyses</p>
                <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>
                  View your full analysis history, track scores, and compare results over time.
                </p>
              </div>
              <p style={{ fontSize: 13, color: "var(--accent)", fontWeight: 600, marginTop: 16 }}>View History →</p>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}