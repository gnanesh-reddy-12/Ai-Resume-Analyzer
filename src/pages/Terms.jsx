import { Link } from "react-router-dom"
import { motion } from "framer-motion"

export default function Terms() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <nav style={{ padding: "0 clamp(20px, 5vw, 40px)", height: 60, display: "flex", alignItems: "center", borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
        <Link to="/landing" style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.5px", textDecoration: "none", color: "var(--text-1)" }}>
          Resume<span style={{ color: "var(--accent)" }}>AI</span>
        </Link>
      </nav>

      <div style={{ flex: 1, padding: "40px 20px" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="ek-card"
          style={{ maxWidth: 800, margin: "0 auto", padding: "clamp(32px, 6vw, 48px)" }}
        >
          <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800, color: "var(--text-1)", marginBottom: 8 }}>Terms of Service</h1>
          <p style={{ color: "var(--text-3)", marginBottom: 32 }}>Last updated: June 2026</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 24, color: "var(--text-2)", lineHeight: 1.6 }}>
            <section>
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-1)", marginBottom: 12 }}>1. Acceptance of Terms</h2>
              <p>By accessing or using ResumeAI, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you do not have permission to access the Service.</p>
            </section>

            <section>
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-1)", marginBottom: 12 }}>2. Description of Service</h2>
              <p>ResumeAI provides an AI-powered resume analysis tool. We do not guarantee employment, job interviews, or specific outcomes as a result of using our feedback.</p>
            </section>

            <section>
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-1)", marginBottom: 12 }}>3. User Accounts</h2>
              <p>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
            </section>

            <section>
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-1)", marginBottom: 12 }}>4. Fair Use</h2>
              <p>You agree to use the service fairly and responsibly. Automated scraping, reverse engineering, or attempting to overload the API services is strictly prohibited and will result in immediate account termination.</p>
            </section>

            <section>
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-1)", marginBottom: 12 }}>5. Limitation of Liability</h2>
              <p>In no event shall ResumeAI, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
