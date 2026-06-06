import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { useContext, useState } from "react"
import { ResumeContext } from "../context/ResumeContext"

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: "easeOut" }
})

const features = [
  { icon: "◎", title: "ATS Score Analysis", desc: "Accurate ATS match prediction against any job description." },
  { icon: "⟡", title: "Semantic Matching", desc: "AI-powered skill alignment beyond simple keyword matching." },
  { icon: "◈", title: "Keyword Detection", desc: "Find exactly which keywords are missing and why they matter." },
  { icon: "⚡", title: "AI Suggestions", desc: "Actionable rewrites, bullet improvements, and summary generation." },
  { icon: "⬡", title: "Resume Parsing", desc: "Extracts and analyzes content from PDF and DOCX files." },
  { icon: "◇", title: "JD Analysis", desc: "Deep analysis of job descriptions for better matching accuracy." },
]

export default function Landing() {
  const navigate = useNavigate()
  const { setResumeFile, setJobDescription, jobDescription } = useContext(ResumeContext)
  const [file, setFile] = useState(null)
  const [error, setError] = useState("")

  const handleFile = (e) => {
    const f = e.target.files[0]
    if (!f) return
    const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    if (!allowed.includes(f.type)) { setError("Only PDF and DOCX allowed"); return }
    setFile(f)
    setResumeFile(f)
    setError("")
  }

  const handleGuestAnalyze = () => {
    if (!file) { setError("Please upload your resume"); return }
    if (!jobDescription.trim()) { setError("Please paste a job description"); return }
    navigate("/guest-loading")
  }

  return (
    <div style={{ background: "var(--bg)", color: "var(--text-1)", minHeight: "100vh" }}>
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(248,250,252,0.88)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border)",
        padding: "0 40px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.5px" }}>
          Resume<span style={{ color: "var(--accent)" }}>AI</span>
        </span>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-ghost" style={{ padding: "8px 18px", fontSize: 14 }} onClick={() => navigate("/login")}>Sign In</button>
          <button className="btn-primary" style={{ padding: "8px 18px", fontSize: 14 }} onClick={() => navigate("/signup")}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "80px 24px 60px", textAlign: "center" }}>
        <motion.div {...fadeUp(0)}>
          <span style={{ display: "inline-block", background: "#DBEAFE", color: "var(--accent)", borderRadius: 999, padding: "4px 14px", fontSize: 13, fontWeight: 600, marginBottom: 24 }}>
            AI-Powered Resume Analysis
          </span>
        </motion.div>
        <motion.h1 {...fadeUp(0.1)} style={{ fontSize: "clamp(36px, 6vw, 68px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1.5px", marginBottom: 20 }}>
          Get hired faster with<br /><span style={{ color: "var(--accent)" }}>smarter resume analysis</span>
        </motion.h1>
        <motion.p {...fadeUp(0.2)} style={{ fontSize: 17, color: "var(--text-2)", lineHeight: 1.7, maxWidth: 520, margin: "0 auto 36px" }}>
          Analyze ATS compatibility, semantic skill alignment, and keyword optimization in seconds.
        </motion.p>
        <motion.div {...fadeUp(0.3)} style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button className="btn-primary" style={{ padding: "13px 32px", fontSize: 15 }} onClick={() => navigate("/signup")}>Sign Up Free</button>
          <button className="btn-ghost" style={{ padding: "13px 24px", fontSize: 15 }} onClick={() => { document.getElementById("try-free").scrollIntoView({ behavior: "smooth" }) }}>Try Without Signup</button>
        </motion.div>
      </section>

      {/* Guest Try Section */}
      <section id="try-free" style={{ maxWidth: 860, margin: "0 auto 80px", padding: "0 24px" }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="card" style={{ padding: 40 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: "var(--accent)", textTransform: "uppercase", marginBottom: 10 }}>Free Trial</p>
            <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 8 }}>Try it now — no signup needed</h2>
            <p style={{ color: "var(--text-2)", fontSize: 14 }}>Get your ATS score and keyword match instantly. Sign up to unlock full AI suggestions.</p>
          </div>

          {error && (
            <div style={{ background: "#FEE2E2", border: "1px solid #FECACA", color: "#991B1B", borderRadius: 10, padding: "10px 16px", fontSize: 14, marginBottom: 20 }}>{error}</div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
            {/* Upload */}
            <div style={{ border: "2px dashed var(--border)", borderRadius: 16, padding: 28, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: 200, transition: "border-color 0.15s" }}>
              <div style={{ width: 48, height: 48, background: "#DBEAFE", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                <svg width="22" height="22" fill="none" stroke="var(--accent)" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              </div>
              <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Upload Resume</p>
              <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 16 }}>PDF or DOCX</p>
              <label className="btn-primary" style={{ padding: "8px 20px", fontSize: 13, cursor: "pointer" }}>
                Choose File
                <input type="file" accept=".pdf,.docx" style={{ display: "none" }} onChange={handleFile} />
              </label>
              {file && (
                <div style={{ marginTop: 12, background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8, padding: "6px 12px", fontSize: 13, color: "#166534", maxWidth: "100%", wordBreak: "break-all" }}>
                  ✓ {file.name}
                </div>
              )}
            </div>

            {/* JD */}
            <div style={{ display: "flex", flexDirection: "column", minHeight: 200 }}>
              <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Job Description</p>
              <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 10 }}>Paste the full job posting</p>
              <textarea
                className="input"
                style={{ flex: 1, resize: "none", minHeight: 150 }}
                placeholder="Paste job description here..."
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
              />
              <p style={{ fontSize: 12, color: "var(--text-3)", textAlign: "right", marginTop: 6 }}>{jobDescription.length} chars</p>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <button className="btn-primary" style={{ padding: "13px 40px", fontSize: 15 }} onClick={handleGuestAnalyze}>
              Analyze Free →
            </button>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1100, margin: "0 auto 80px", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: "var(--accent)", textTransform: "uppercase", marginBottom: 10 }}>Features</p>
          <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-0.5px" }}>Powerful AI Features</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
          {features.map((f, i) => (
            <motion.div key={f.title} className="card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.06 }} whileHover={{ y: -4 }} style={{ padding: 28 }}>
              <div style={{ width: 44, height: 44, background: "#DBEAFE", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "var(--accent)", marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 600, margin: "0 auto 80px", padding: "0 24px", textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="card" style={{ padding: "48px 40px", background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
          <h2 style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 12 }}>Ready to beat the ATS?</h2>
          <p style={{ color: "var(--text-2)", marginBottom: 28, fontSize: 15 }}>Join students and professionals who use ResumeAI to land more interviews.</p>
          <button className="btn-primary" style={{ padding: "13px 36px", fontSize: 15 }} onClick={() => navigate("/signup")}>Get Started Free</button>
        </motion.div>
      </section>

      <footer style={{ borderTop: "1px solid var(--border)", padding: "20px 40px", display: "flex", justifyContent: "space-between", color: "var(--text-3)", fontSize: 13 }}>
        <span style={{ fontWeight: 700, color: "var(--text-1)" }}>Resume<span style={{ color: "var(--accent)" }}>AI</span></span>
        <span>Built for students and professionals</span>
      </footer>
    </div>
  )
}