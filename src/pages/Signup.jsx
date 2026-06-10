import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/useAuth"
import { motion } from "framer-motion"

const ease = [0.16, 1, 0.3, 1]

export default function Signup() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async () => {
    setError("")
    if (!name || !email || !password) return setError("All fields are required")
    if (password.length < 6) return setError("Password must be at least 6 characters")
    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Signup failed")
      // Store name: prefer what came from DB, fallback to what user typed
      localStorage.setItem("display_name", data.name || name)
      login(data)
      navigate("/")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>

      <nav style={{ padding: "0 clamp(20px, 5vw, 40px)", height: 60, display: "flex", alignItems: "center", borderBottom: "1px solid var(--border)" }}>
        <Link to="/landing" style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.5px", textDecoration: "none", color: "var(--text-1)" }}>
          Resume<span style={{ color: "var(--accent)" }}>AI</span>
        </Link>
      </nav>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 20px" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="card"
          style={{ width: "100%", maxWidth: 400, padding: "clamp(32px, 6vw, 44px)" }}
        >
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--accent-soft)", border: "1px solid var(--accent-mid)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "var(--accent)" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.6px", marginBottom: 6, color: "var(--text-1)" }}>Create account</h1>
            <p style={{ fontSize: 14, color: "var(--text-3)", lineHeight: 1.5 }}>Start analyzing your resume for free</p>
          </div>

          {error && (
            <div style={{ background: "var(--danger-bg)", border: "1px solid var(--danger-bd)", color: "var(--danger)", borderRadius: "var(--r-sm)", padding: "10px 14px", fontSize: 13, marginBottom: 20 }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-2)", marginBottom: 6 }}>Full Name</label>
              <input className="input" type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-2)", marginBottom: 6 }}>Email</label>
              <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-2)", marginBottom: 6 }}>Password</label>
              <input className="input" type="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
            </div>
          </div>

          <motion.button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            style={{ width: "100%", marginTop: 24, padding: "13px", fontSize: 14 }}
          >
            {loading ? "Creating account…" : "Create Account"}
          </motion.button>

          <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-3)", marginTop: 20 }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}