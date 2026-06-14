import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import Navbar from "../components/Navbar"

export default function Privacy() {
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
          <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800, color: "var(--text-1)", marginBottom: 8 }}>Privacy Policy</h1>
          <p style={{ color: "var(--text-3)", marginBottom: 32 }}>Last updated: June 2026</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 24, color: "var(--text-2)", lineHeight: 1.6 }}>
            <section>
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-1)", marginBottom: 12 }}>1. Information We Collect</h2>
              <p>When you use ResumeAI, we collect information you provide directly to us, such as your name, email address (via Google Login or standard signup), and the resume contents you upload for analysis. We also store your analysis history to provide you with past results.</p>
            </section>

            <section>
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-1)", marginBottom: 12 }}>2. How We Use Your Information</h2>
              <p>We use the information we collect to provide, maintain, and improve our services. Specifically, your resume data is securely processed by AI models to generate personalized feedback, ATS scoring, and interview tips.</p>
            </section>

            <section>
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-1)", marginBottom: 12 }}>3. Data Security</h2>
              <p>We take the security of your data seriously. Your information is stored securely using industry-standard databases with strict access controls. We do not sell your personal data or resume information to third parties.</p>
            </section>

            <section>
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-1)", marginBottom: 12 }}>4. Deleting Your Data</h2>
              <p>You have full control over your data. You can permanently delete your account and all associated resume data directly from the Account Settings section of your Profile page at any time.</p>
            </section>

            <section>
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-1)", marginBottom: 12 }}>5. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us at reddygnanesh1205@gmail.com.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
