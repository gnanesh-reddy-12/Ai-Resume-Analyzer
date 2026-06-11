import { useContext, useEffect } from "react"
import Navbar from "../components/Navbar"
import AnalyzeSection from "../components/AnalyzeSection"
import { useAuth } from "../context/useAuth"
import { ResumeContext } from "../context/ResumeContext"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"

const spring = { type: "spring", stiffness: 400, damping: 30 }

const tips = [
  { icon: "✧", title: "Mirror exact language", desc: "Use literal phrases from the posting. ATS looks for exact matches." },
  { icon: "✧", title: "Quantify your impact", desc: "Numbers make achievements concrete. They prove your value." },
  { icon: "✧", title: "Keep formats clean", desc: "Use simple, single-column layouts. They parse reliably everywhere." },
]

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { resetContext } = useContext(ResumeContext)
  const name = localStorage.getItem("display_name") || user?.email?.split("@")[0] || "there"

  useEffect(() => { resetContext() }, [resetContext])

  return (
    <>
      <Navbar />
      <div className="container" style={{ paddingTop: "clamp(40px, 8vw, 80px)", paddingBottom: 80, maxWidth: 800 }}>
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={spring}
          style={{ marginBottom: 40 }}
        >
          <h1 style={{ fontSize: "var(--text-3xl)", marginBottom: 8 }}>
            Welcome, {name}
          </h1>
          <p style={{ fontSize: "var(--text-lg)", color: "var(--text-3)", fontWeight: 500 }}>
            Upload your resume and paste a job description to begin analysis.
          </p>
        </motion.div>

        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.05 }}
          >
            <AnalyzeSection />
          </motion.div>

          {/* Resume Checklist section */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.1 }}
            className="ek-card"
            style={{ padding: "clamp(24px, 5vw, 32px)" }}
          >
            <h3 style={{ fontSize: "var(--text-base)", marginBottom: 20, fontWeight: 600, color: "var(--text-1)", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ display: "flex", width: 8, height: 8, borderRadius: "50%", background: "var(--accent)" }} />
              ATS Optimization Best Practices
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tips.map((t, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={spring}
                  className="ek-card-sm"
                  style={{
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    boxShadow: "0 2px 8px rgba(92, 62, 47, 0.04)"
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: "var(--accent-soft)",
                    color: "var(--accent)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "var(--text-sm)", fontWeight: 700,
                    marginBottom: 4
                  }}>
                    {i + 1}
                  </div>
                  <p style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--text-1)" }}>{t.title}</p>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--text-3)", lineHeight: 1.5 }}>{t.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}