import { useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../supabase"
import { motion } from "framer-motion"

const ease = [0.16, 1, 0.3, 1]

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [msg, setMsg] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError("")
    setMsg("")
    if (!email) return setError("Please enter your email")
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      setMsg("Check your email for the password reset link")
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
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.6px", marginBottom: 6, color: "var(--text-1)" }}>Reset password</h1>
            <p style={{ fontSize: 14, color: "var(--text-3)", lineHeight: 1.5 }}>Enter your email to receive a reset link</p>
          </div>

          {error && (
            <div style={{ background: "var(--danger-bg)", border: "1px solid var(--danger-bd)", color: "var(--danger)", borderRadius: "var(--r-sm)", padding: "10px 14px", fontSize: 13, marginBottom: 20 }}>
              {error}
            </div>
          )}
          {msg && (
            <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", color: "#10B981", borderRadius: "var(--r-sm)", padding: "10px 14px", fontSize: 13, marginBottom: 20 }}>
              {msg}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-2)", marginBottom: 6 }}>Email</label>
              <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
            </div>
          </div>

          <motion.button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            style={{ width: "100%", marginTop: 24, padding: "13px", fontSize: 14 }}
          >
            {loading ? "Sending…" : "Send Reset Link"}
          </motion.button>

          <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-3)", marginTop: 20 }}>
            <Link to="/login" style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>Back to login</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
