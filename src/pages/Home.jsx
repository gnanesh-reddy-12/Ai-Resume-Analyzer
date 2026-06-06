import Navbar from "../components/Navbar"
import AnalyzeSection from "../components/AnalyzeSection"
import { useAuth } from "../context/useAuth"
import { motion } from "framer-motion"

export default function Home() {
  const { user } = useAuth()
  const name = localStorage.getItem("display_name") || user?.email?.split("@")[0] || "there"

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px" }}>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
            Welcome back
          </p>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-0.5px", color: "var(--text-1)" }}>
            Hey, {name} 👋
          </h1>
          <p style={{ fontSize: 16, color: "var(--text-2)", marginTop: 8 }}>
            Upload your resume and paste a job description to get your ATS score instantly.
          </p>
        </motion.div>

        <AnalyzeSection />
      </div>
    </div>
  )
}