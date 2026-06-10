import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../supabase"
import { motion } from "framer-motion"

const ease = [0.16, 1, 0.3, 1]

export default function ResetPassword() {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event from the email link
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // We are successfully in recovery mode, stay on page
      } else if (!session) {
        // If there's no session and it's not a recovery, then redirect
        navigate("/login")
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  const handleSubmit = async () => {
    setError("")
    
    // Password Validation
    if (password.length < 8) return setError("Password must be at least 8 characters")
    if (!/[A-Z]/.test(password)) return setError("Password must contain at least one uppercase letter")
    if (!/[!@#$%^&*()_+\-=\[\]{}|':"\\<>?]/.test(password)) return setError("Password must contain at least one special character")

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
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
        <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.5px", color: "var(--text-1)" }}>
          Resume<span style={{ color: "var(--accent)" }}>AI</span>
        </div>
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
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.6px", marginBottom: 6, color: "var(--text-1)" }}>New password</h1>
            <p style={{ fontSize: 14, color: "var(--text-3)", lineHeight: 1.5 }}>Enter your new password below</p>
          </div>

          {error && (
            <div style={{ background: "var(--danger-bg)", border: "1px solid var(--danger-bd)", color: "var(--danger)", borderRadius: "var(--r-sm)", padding: "10px 14px", fontSize: 13, marginBottom: 20 }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-2)", marginBottom: 6 }}>New Password</label>
              <div style={{ position: "relative" }}>
                <input className="input" type={showPassword ? "text" : "password"} placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} style={{ paddingRight: 40 }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-3)", cursor: "pointer", padding: 0, display: "flex" }}>
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <motion.button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            style={{ width: "100%", marginTop: 24, padding: "13px", fontSize: 14 }}
          >
            {loading ? "Updating…" : "Update Password"}
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}
