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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.5px" }}>About Us</h1>
              <p style={{ color: "var(--text-3)", fontSize: 15 }}>The technology and vision behind ResumeAI.</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 32, color: "var(--text-2)", lineHeight: 1.7, fontSize: 15 }}>
            <section>
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-1)", marginBottom: 12 }}>Our Mission</h2>
              <p>At ResumeAI, we believe that everyone deserves a fair shot at their dream job. Our mission is to democratize career advancement by providing enterprise-grade, AI-powered resume analysis to students and professionals around the world.</p>
              <p style={{ marginTop: 12 }}>We understand the frustration of the "black box" Applicant Tracking Systems (ATS) that automatically reject qualified candidates because of simple formatting issues or missing keywords. We built ResumeAI to give you the exact insights you need to beat the bots, optimize your professional story, and get your resume into the hands of a human recruiter.</p>
            </section>

            <section>
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-1)", marginBottom: 12 }}>How Our Technology Works</h2>
              <p>We leverage cutting-edge artificial intelligence, powered by advanced Large Language Models, to instantly analyze your resume against real-world job descriptions. Unlike simple keyword-matching scripts used by older platforms, our AI understands the semantic meaning behind your bullet points.</p>
              <ul style={{ paddingLeft: 24, marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                <li><strong>Contextual Keyword Matching:</strong> We don't just look for exact words; we look for related skills and context to ensure your experience shines through.</li>
                <li><strong>Formatting Analysis:</strong> We identify red flags in your document structure that might cause legacy ATS systems to crash or misread your data.</li>
                <li><strong>Actionable Feedback:</strong> Instead of just giving you a low score, we provide exact, rewritten bullet-point suggestions to maximize your impact.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-1)", marginBottom: 12 }}>Who We Are</h2>
              <p>ResumeAI was built by a passionate group of developers and career advocates who saw a fundamental flaw in modern hiring: the best candidates were being filtered out by broken algorithms.</p>
              <p style={{ marginTop: 12 }}>Whether you're a recent graduate crafting your very first professional resume, or a seasoned veteran looking to pivot industries, ResumeAI is designed to be your personal, 24/7 career coach. We are constantly updating our AI models with the latest hiring trends to ensure you always have the competitive edge.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
