import Navbar from "../components/Navbar"
import AnalyzeSection from "../components/AnalyzeSection"
import { useAuth } from "../context/useAuth"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"

const tips = [
  { icon: "🎯", title: "Be specific", desc: "Use exact keywords from the job description in your resume." },
  { icon: "📊", title: "Add metrics", desc: "Quantify achievements — numbers stand out to recruiters." },
  { icon: "⚡", title: "Keep it clean", desc: "Simple formatting beats fancy design for ATS systems." },
]

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const name = localStorage.getItem("display_name") || user?.email?.split("@")[0] || "there"

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Dashboard</p>
          <h1 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 800, letterSpacing: "-0.5px", color: "var(--text-1)" }}>
            Hey, {name} 👋
          </h1>
          <p style={{ fontSize: 15, color: "var(--text-2)", marginTop: 6 }}>
            Ready to beat the ATS? Upload your resume below.
          </p>
        </motion.div>

        {/* Main grid: analyze + tips */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, alignItems: "start" }}>

          {/* Analyze section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }}>
            <AnalyzeSection />
          </motion.div>

          {/* Right panel */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, delay: 0.2 }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Quick tips */}
            <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 20, padding: 24 }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text-1)", marginBottom: 16 }}>💡 Quick Tips</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {tips.map((t, i) => (
                  <div key={i} style={{ display: "flex", gap: 12 }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{t.icon}</span>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 13, color: "var(--text-1)" }}>{t.title}</p>
                      <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2, lineHeight: 1.5 }}>{t.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* History shortcut */}
            <button
              onClick={() => navigate("/history")}
              style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 20, padding: 24, textAlign: "left", cursor: "pointer", transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#DBEAFE"}
              onMouseLeave={e => e.currentTarget.style.background = "#EFF6FF"}
            >
              <p style={{ fontWeight: 700, fontSize: 14, color: "var(--accent)", marginBottom: 6 }}>📋 Past Analyses</p>
              <p style={{ fontSize: 12, color: "#3B82F6", lineHeight: 1.5 }}>View your analysis history, compare scores, and track improvements.</p>
              <p style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600, marginTop: 10 }}>View History →</p>
            </button>

          </motion.div>
        </div>
      </div>
    </div>
  )
}