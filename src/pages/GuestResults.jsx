import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ResumeContext } from "../context/ResumeContext"

function ScoreRing({ score, size = 140, stroke = 10 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 75 ? "#10B981" : score >= 55 ? "#F59E0B" : "#EF4444"
  return (
    <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={stroke} />
        <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }} />
      </svg>
      <div style={{ position: "absolute", textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-1)" }}>{score}%</div>
        <div style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 500 }}>ATS Score</div>
      </div>
    </div>
  )
}

export default function GuestResults() {
  const { resumeFile, jobDescription } = useContext(ResumeContext)
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!resumeFile) { navigate("/landing"); return }
    const formData = new FormData()
    formData.append("resume", resumeFile)
    formData.append("job_description", jobDescription)

    fetch(`${import.meta.env.VITE_BACKEND_URL}/analyze/guest`, {
      method: "POST",
      body: formData,
    })
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setData(d) })
      .catch(e => setError(e.message))
  }, [resumeFile, jobDescription, navigate])

  if (error) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "var(--danger)", fontSize: 16 }}>{error}</p>
        <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => navigate("/landing")}>Go Back</button>
      </div>
    </div>
  )

  if (!data) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, border: "4px solid #DBEAFE", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }}></div>
        <p style={{ color: "var(--text-2)" }}>Analyzing your resume...</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <nav style={{ height: 64, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", padding: "0 24px" }}>
        <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.5px", color: "var(--text-1)" }}>
          Resume<span style={{ color: "var(--accent)" }}>AI</span>
        </span>
      </nav>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px 80px" }}>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: "var(--accent)", textTransform: "uppercase", marginBottom: 8 }}>Guest Analysis</p>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.5px" }}>Your ATS Score</h1>
          <p style={{ color: "var(--text-2)", marginTop: 6 }}>{resumeFile?.name}</p>
        </motion.div>

        {/* Score card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card" style={{ padding: 32, marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 40, alignItems: "center", flexWrap: "wrap" }}>
            <ScoreRing score={data.ats_score} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
                <div style={{ background: "var(--bg)", borderRadius: 12, padding: "12px 20px", flex: 1, minWidth: 120 }}>
                  <p style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 500 }}>Keyword Score</p>
                  <p style={{ fontSize: 24, fontWeight: 800, color: "var(--accent)", marginTop: 4 }}>{data.keyword_score}%</p>
                </div>
                <div style={{ background: "var(--bg)", borderRadius: 12, padding: "12px 20px", flex: 1, minWidth: 120 }}>
                  <p style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 500 }}>Semantic Score</p>
                  <p style={{ fontSize: 24, fontWeight: 800, color: "#10B981", marginTop: 4 }}>{data.semantic_score}%</p>
                </div>
              </div>
              <div style={{
                padding: "12px 16px", borderRadius: 12,
                background: data.can_apply ? "#F0FDF4" : "#FEF2F2",
                border: `1px solid ${data.can_apply ? "#BBF7D0" : "#FECACA"}`,
                color: data.can_apply ? "#166534" : "#991B1B",
                fontSize: 14, fontWeight: 600
              }}>
                {data.can_apply ? "✅ Strong match — you can apply for this role" : "⚠️ Needs improvement before applying"}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Keywords */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card" style={{ padding: 24 }}>
            <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: "var(--text-1)" }}>✓ Matched Keywords <span style={{ background: "#DCFCE7", color: "#166534", borderRadius: 999, padding: "2px 8px", fontSize: 12, marginLeft: 6 }}>{data.matched_keywords?.length}</span></p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {data.matched_keywords?.map((k, i) => <span key={i} className="tag tag-green">{k}</span>)}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card" style={{ padding: 24 }}>
            <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: "var(--text-1)" }}>✗ Missing Keywords <span style={{ background: "#FEE2E2", color: "#991B1B", borderRadius: 999, padding: "2px 8px", fontSize: 12, marginLeft: 6 }}>{data.missing_keywords?.length}</span></p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {data.missing_keywords?.map((k, i) => <span key={i} className="tag tag-red">{k}</span>)}
            </div>
          </motion.div>
        </div>

        {/* Upsell */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card" style={{ padding: 40, textAlign: "center", background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: "var(--accent)", textTransform: "uppercase", marginBottom: 12 }}>Unlock Full Analysis</p>
          <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 12 }}>Get AI-powered suggestions</h2>
          <p style={{ color: "var(--text-2)", marginBottom: 28, fontSize: 15, maxWidth: 480, margin: "0 auto 28px" }}>
            Sign up free to unlock improvement suggestions, rewritten bullet points, action verbs, and a tailored professional summary.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button className="btn-primary" style={{ padding: "12px 32px" }} onClick={() => navigate("/signup")}>
              Sign Up Free →
            </button>
            <button className="btn-ghost" style={{ padding: "12px 24px" }} onClick={() => navigate("/login")}>
              Sign In
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  )
}