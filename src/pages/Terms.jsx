import { motion } from "framer-motion"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

export default function Terms() {
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
          <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800, color: "var(--text-1)", marginBottom: 8 }}>Terms of Service</h1>
          <p style={{ color: "var(--text-3)", marginBottom: 32 }}>Last updated: June 2026</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 32, color: "var(--text-2)", lineHeight: 1.7, fontSize: 15 }}>
            <section>
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-1)", marginBottom: 12 }}>1. Agreement to Terms</h2>
              <p>These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and ResumeAI ("Company," "we," "us," or "our"), concerning your access to and use of the ResumeAI website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the "Site").</p>
              <p style={{ marginTop: 12 }}>You agree that by accessing the Site, you have read, understood, and agreed to be bound by all of these Terms of Service. IF YOU DO NOT AGREE WITH ALL OF THESE TERMS OF SERVICE, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SITE AND YOU MUST DISCONTINUE USE IMMEDIATELY.</p>
            </section>

            <section>
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-1)", marginBottom: 12 }}>2. Intellectual Property Rights</h2>
              <p>Unless otherwise indicated, the Site and its original content, features, and functionality (including but not limited to the ResumeAI algorithms, design, text, graphics, and logos) are our proprietary property and are protected by copyright, trademark, and other intellectual property laws. You are granted a limited, non-exclusive, non-transferable license to access and use the Site strictly in accordance with these Terms.</p>
            </section>

            <section>
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-1)", marginBottom: 12 }}>3. User Representations & Responsibilities</h2>
              <p>By using the Site, you represent and warrant that:</p>
              <ul style={{ paddingLeft: 24, marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                <li>All registration information you submit will be true, accurate, current, and complete.</li>
                <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
                <li>You have the legal capacity and you agree to comply with these Terms of Service.</li>
                <li>You will not access the Site through automated or non-human means, whether through a bot, script, or otherwise.</li>
                <li>You will not use the Site for any illegal or unauthorized purpose.</li>
                <li>You are the sole owner of the documents and resumes you upload, or you have explicitly secured the rights to use them.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-1)", marginBottom: 12 }}>4. Disclaimer Regarding AI Analysis & Employment</h2>
              <p>ResumeAI provides automated, artificial intelligence-driven feedback on resumes and job descriptions. While we strive to provide high-quality, actionable advice, <strong>we make no guarantees regarding employment, interviews, or hiring outcomes.</strong> The AI suggestions should be reviewed and verified by you before submitting your resume to any employer. The use of our service is strictly at your own risk.</p>
            </section>

            <section>
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-1)", marginBottom: 12 }}>5. Limitation of Liability</h2>
              <p>In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, loss of data, or other damages arising from your use of the site, even if we have been advised of the possibility of such damages.</p>
            </section>

          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  )
}
