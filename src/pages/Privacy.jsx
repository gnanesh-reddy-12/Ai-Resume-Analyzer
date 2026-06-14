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

          <div style={{ display: "flex", flexDirection: "column", gap: 32, color: "var(--text-2)", lineHeight: 1.7, fontSize: 15 }}>
            <section>
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-1)", marginBottom: 12 }}>1. Introduction</h2>
              <p>Welcome to ResumeAI ("we," "our," or "us"). We respect your privacy and are deeply committed to protecting your personal data. This Privacy Policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.</p>
              <p style={{ marginTop: 12 }}>By accessing or using ResumeAI, you signify that you have read, understood, and agree to our collection, storage, use, and disclosure of your personal information as described in this Privacy Policy.</p>
            </section>

            <section>
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-1)", marginBottom: 12 }}>2. The Data We Collect About You</h2>
              <p>Personal data, or personal information, means any information about an individual from which that person can be identified. We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
              <ul style={{ paddingLeft: 24, marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
                <li><strong>Contact Data:</strong> includes email address and telephone numbers.</li>
                <li><strong>Document Data:</strong> includes resumes, CVs, cover letters, and any textual data extracted from uploaded documents for the purpose of AI analysis.</li>
                <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, operating system and platform.</li>
                <li><strong>Usage Data:</strong> includes information about how you use our website, products and services.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-1)", marginBottom: 12 }}>3. How We Use Your Personal Data</h2>
              <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
              <ul style={{ paddingLeft: 24, marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                <li>To register you as a new user.</li>
                <li>To process and deliver your resume analysis utilizing advanced artificial intelligence models.</li>
                <li>To manage our relationship with you, including notifying you about changes to our terms or privacy policy.</li>
                <li>To improve our website, services, marketing, customer relationships, and experiences.</li>
              </ul>
              <p style={{ marginTop: 12 }}><strong>Note on AI Processing:</strong> Your resume data is transmitted securely to our AI providers (such as Groq or OpenAI) strictly for generating feedback and analysis. We do not use your personal resumes to train public AI models.</p>
            </section>

            <section>
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-1)", marginBottom: 12 }}>4. Data Security</h2>
              <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know. They will only process your personal data on our instructions and they are subject to a duty of confidentiality.</p>
            </section>

            <section>
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-1)", marginBottom: 12 }}>5. Data Retention & Deletion</h2>
              <p>We will only retain your personal data for as long as reasonably necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, regulatory, tax, accounting or reporting requirements. You have full control over your data. You can permanently delete your account, including all associated analysis history and document data, directly from the Account Settings section of your Profile page at any time.</p>
            </section>

            <section>
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-1)", marginBottom: 12 }}>6. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy or our privacy practices, please contact us at:</p>
              <p style={{ marginTop: 8, fontWeight: 600, color: "var(--text-1)" }}>reddygnanesh1205@gmail.com</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
