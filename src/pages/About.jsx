import { motion } from "framer-motion"
import Navbar from "../components/Navbar"

export default function About() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <div style={{ flex: 1, padding: "40px 20px" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="ek-card"
          style={{ maxWidth: 800, margin: "0 auto", padding: "clamp(32px, 6vw, 48px)" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
            <div style={{ width: 48, height: 48, background: "var(--accent-soft)", color: "var(--accent)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            </div>
            <div>
              <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.5px" }}>About Us</h1>
              <p style={{ color: "var(--text-3)", fontSize: 15 }}>The team behind ResumeAI.</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 32, color: "var(--text-2)", lineHeight: 1.7, fontSize: 15 }}>
            <section>
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-1)", marginBottom: 12 }}>Our Mission</h2>
              <p>At ResumeAI, we believe that everyone deserves a fair shot at their dream job. Our mission is to democratize career advancement by providing enterprise-grade, AI-powered resume analysis to students and professionals around the world.</p>
              <p style={{ marginTop: 12 }}>We understand the frustration of the "black box" Applicant Tracking Systems (ATS) that automatically reject qualified candidates. We built ResumeAI to give you the exact insights you need to beat the bots and get your resume into the hands of a human recruiter.</p>
            </section>

            <section>
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-1)", marginBottom: 12 }}>What We Do</h2>
              <p>We leverage cutting-edge artificial intelligence, powered by advanced Large Language Models, to instantly analyze your resume against real-world job descriptions. Our platform checks for keyword alignment, semantic matching, formatting red flags, and missing skills—giving you actionable feedback in seconds.</p>
            </section>

            <section>
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-1)", marginBottom: 12 }}>Built For You</h2>
              <p>Whether you're a recent graduate crafting your very first professional resume, or a seasoned veteran looking to pivot industries, ResumeAI is designed to be your personal, 24/7 career coach.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
