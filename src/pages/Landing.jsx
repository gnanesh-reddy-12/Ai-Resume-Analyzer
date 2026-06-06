import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"

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

const steps = [
  { n: "01", title: "Upload Resume", desc: "PDF or DOCX format" },
  { n: "02", title: "Paste Job Description", desc: "Any role, any company" },
  { n: "03", title: "AI Analyzes", desc: "Semantic + keyword scoring" },
  { n: "04", title: "View Results", desc: "Detailed ATS breakdown" },
  { n: "05", title: "Improve Resume", desc: "Apply AI suggestions" },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div style={{ background: "var(--bg)", color: "var(--text-1)", minHeight: "100vh" }}>
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(248,250,252,0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border)",
        padding: "0 40px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.5px" }}>
          Resume<span style={{ color: "var(--accent)" }}>AI</span>
        </span>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn-ghost" style={{ padding: "8px 20px", fontSize: 14 }} onClick={() => navigate("/login")}>Sign In</button>
          <button className="btn-primary" style={{ padding: "8px 20px", fontSize: 14 }} onClick={() => navigate("/signup")}>Get Started</button>
        </div>
      </nav>

      <section style={{ maxWidth: 800, margin: "0 auto", padding: "100px 24px 80px", textAlign: "center" }}>
        <motion.div {...fadeUp(0)}>
          <span style={{
            display: "inline-block", background: "#DBEAFE", color: "var(--accent)",
            borderRadius: 999, padding: "4px 14px", fontSize: 13, fontWeight: 600,
            marginBottom: 24, letterSpacing: "0.02em"
          }}>AI-Powered Resume Analysis</span>
        </motion.div>

        <motion.h1 {...fadeUp(0.1)} style={{
          fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 800,
          lineHeight: 1.1, letterSpacing: "-1.5px", marginBottom: 24
        }}>
          Get hired faster with<br />
          <span style={{ color: "var(--accent)" }}>smarter resume analysis</span>
        </motion.h1>

        <motion.p {...fadeUp(0.2)} style={{
          fontSize: 18, color: "var(--text-2)", lineHeight: 1.7,
          maxWidth: 560, margin: "0 auto 40px"
        }}>
          Analyze ATS compatibility, semantic skill alignment, keyword optimization,
          and hiring readiness in under 30 seconds.
        </motion.p>

        <motion.div {...fadeUp(0.3)} style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn-primary" style={{ padding: "14px 32px", fontSize: 16 }} onClick={() => navigate("/signup")}>
            Analyze My Resume
          </button>
          <button className="btn-ghost" style={{ padding: "14px 32px", fontSize: 16 }} onClick={() => navigate("/login")}>
            Sign In
          </button>
        </motion.div>

        <motion.div {...fadeUp(0.4)} style={{
          display: "flex", gap: 32, justifyContent: "center",
          marginTop: 48, color: "var(--text-3)", fontSize: 14, fontWeight: 500, flexWrap: "wrap"
        }}>
          {["ATS Friendly", "AI Powered", "Instant Results", "Free to Use"].map(t => (
            <span key={t}>&#10003; {t}</span>
          ))}
        </motion.div>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        style={{ maxWidth: 760, margin: "0 auto 100px", padding: "0 24px" }}
      >
        <div className="card" style={{ padding: 40 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "var(--text-3)", marginBottom: 24, textTransform: "uppercase" }}>
            Sample Analysis Report
          </p>
          <div style={{ display: "flex", gap: 40, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative", width: 120, height: 120, flexShrink: 0 }}>
              <svg viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)", width: 120, height: 120 }}>
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border)" strokeWidth="10" />
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--accent)" strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 50 * 0.92} ${2 * Math.PI * 50}`} strokeLinecap="round" />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 26, fontWeight: 800 }}>92%</span>
                <span style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 500 }}>ATS Score</span>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              {[["Keyword Match", 88, "var(--accent)"], ["Semantic Match", 94, "#10B981"], ["Overall Readiness", 90, "#F59E0B"]].map(([label, val, color]) => (
                <div key={label} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                    <span style={{ color: "var(--text-2)" }}>{label}</span>
                    <span style={{ color, fontWeight: 700 }}>{val}%</span>
                  </div>
                  <div style={{ height: 6, background: "var(--border)", borderRadius: 999 }}>
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${val}%` }}
                      transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
                      style={{ height: "100%", background: color, borderRadius: 999 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 28, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)", marginRight: 4 }}>Missing Skills:</span>
            {["Docker", "Kubernetes", "CI/CD", "AWS"].map(s => (
              <span key={s} className="tag tag-red">{s}</span>
            ))}
          </div>
        </div>
      </motion.section>

      <section style={{ maxWidth: 1100, margin: "0 auto 100px", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: "var(--accent)", textTransform: "uppercase", marginBottom: 12 }}>Features</p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-0.5px" }}>Powerful AI Features</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          {features.map((f, i) => (
            <motion.div key={f.title} className="card"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.07 }}
              whileHover={{ y: -4, boxShadow: "var(--shadow-md)" }}
              style={{ padding: 28, cursor: "default", transition: "box-shadow 0.2s" }}
            >
              <div style={{
                width: 44, height: 44, background: "#DBEAFE", borderRadius: 12,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, color: "var(--accent)", marginBottom: 16
              }}>{f.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "80px 24px", marginBottom: 100 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: "var(--accent)", textTransform: "uppercase", marginBottom: 12 }}>How It Works</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-0.5px" }}>Simple 5 Step Process</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 24 }}>
            {steps.map((s, i) => (
              <motion.div key={s.n}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}
                style={{ textAlign: "center", padding: "24px 16px" }}
              >
                <div style={{ fontSize: 32, fontWeight: 800, color: "var(--accent)", opacity: 0.2, marginBottom: 16 }}>{s.n}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: "var(--text-3)" }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 640, margin: "0 auto 100px", padding: "0 24px", textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="card" style={{ padding: "56px 40px" }}
        >
          <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 16 }}>
            Ready to beat the ATS?
          </h2>
          <p style={{ fontSize: 16, color: "var(--text-2)", marginBottom: 32, lineHeight: 1.6 }}>
            Join students and professionals who use ResumeAI to land more interviews.
          </p>
          <button className="btn-primary" style={{ padding: "14px 40px", fontSize: 16 }} onClick={() => navigate("/signup")}>
            Get Started Free
          </button>
        </motion.div>
      </section>

      <footer style={{
        borderTop: "1px solid var(--border)", padding: "24px 40px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        color: "var(--text-3)", fontSize: 13
      }}>
        <span style={{ fontWeight: 700, color: "var(--text-1)" }}>Resume<span style={{ color: "var(--accent)" }}>AI</span></span>
        <span>Built for students and professionals</span>
      </footer>
    </div>
  )
}