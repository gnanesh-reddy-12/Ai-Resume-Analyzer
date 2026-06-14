import { motion } from "framer-motion"
import Navbar from "../components/Navbar"

export default function Support() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <div style={{ flex: 1, padding: "40px 20px" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="ek-card"
          style={{ maxWidth: 600, margin: "0 auto", padding: "clamp(32px, 6vw, 48px)", textAlign: "center" }}
        >
          <div style={{ width: 64, height: 64, background: "var(--accent-soft)", color: "var(--accent)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          </div>
          <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800, color: "var(--text-1)", marginBottom: 12 }}>Contact Support</h1>
          <p style={{ color: "var(--text-3)", marginBottom: 32, lineHeight: 1.6 }}>
            We're here to help! If you have any questions, encounter any issues, or want to share feedback, please reach out to us.
          </p>
          <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, background: "rgba(99, 102, 241, 0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>Email Us At</p>
            <a href="mailto:reddygnanesh1205@gmail.com" style={{ fontSize: "clamp(15px, 4vw, 18px)", fontWeight: 700, color: "var(--text-1)", textDecoration: "none", wordBreak: "break-all" }}>
              reddygnanesh1205@gmail.com
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
