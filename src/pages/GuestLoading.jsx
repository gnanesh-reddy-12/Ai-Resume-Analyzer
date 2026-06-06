import { useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ResumeContext } from "../context/ResumeContext"

const steps = ["Parsing resume...", "Extracting keywords...", "Calculating ATS score..."]

export default function GuestLoading() {
  const navigate = useNavigate()
  const { resumeFile } = useContext(ResumeContext)

  useEffect(() => {
    if (!resumeFile) { navigate("/landing"); return }
    const t = setTimeout(() => navigate("/guest-results"), 2500)
    return () => clearTimeout(t)
  }, [resumeFile, navigate])

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center" }}>
        <div style={{ position: "relative", width: 72, height: 72, margin: "0 auto 32px" }}>
          <div style={{ position: "absolute", inset: 0, width: 72, height: 72, border: "4px solid #E2E8F0", borderRadius: "50%" }}></div>
          <div style={{ position: "absolute", inset: 0, width: 72, height: 72, border: "4px solid transparent", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}></div>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 8 }}>Analyzing Resume</h1>
        <p style={{ color: "var(--text-2)", marginBottom: 32 }}>Running AI analysis on your resume</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 260, margin: "0 auto" }}>
          {steps.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.6 }}
              style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "var(--text-2)" }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.6 + 0.3 }}
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
}