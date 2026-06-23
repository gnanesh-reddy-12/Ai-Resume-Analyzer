import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { supabase } from "../supabase"
import { motion, AnimatePresence } from "framer-motion"

const ease = [0.16, 1, 0.3, 1]

export default function ResetPassword() {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [msg, setMsg] = useState("")
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
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[!@#$%^&*()_+\-=[\]{}|':"\\<>?]/.test(password)) {
      return setError("Password must be at least 8 characters, and include at least one uppercase letter and one special character.")
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      
      setMsg("success")
      // Automatically redirect to analyze page after showing success UI
      setTimeout(() => {
        navigate("/")
      }, 2500)

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
          className="ek-card"
          style={{ width: "100%", maxWidth: 400, padding: "clamp(32px, 6vw, 44px)" }}
        >
          {msg ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", padding: "10px 0" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--success-bg)", border: "1px solid var(--success-bd)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", color: "var(--success)" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.6px", marginBottom: 12, color: "var(--text-1)" }}>Password Updated!</h1>
              <p style={{ fontSize: 15, color: "var(--text-3)", lineHeight: 1.6, marginBottom: 16 }}>
                Your password has been changed successfully.
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "var(--text-3)", fontSize: 13 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spin-anim"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
                Redirecting to dashboard...
              </div>
            </motion.div>
          ) : (
            <>
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--accent-soft)", border: "1px solid var(--accent-mid)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "var(--accent)" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <h1 style={{ fontSize: "var(--text-xl)", marginBottom: 6 }}>New password</h1>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-3)", lineHeight: 1.5 }}>Enter your new password below</p>
              </div>

              {error && (
                <div style={{ background: "var(--danger-bg)", border: "1px solid var(--danger-bd)", color: "var(--danger)", borderRadius: "var(--r-sm)", padding: "10px 14px", fontSize: "var(--text-sm)", marginBottom: 20 }}>
                  {error}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-2)", marginBottom: 6 }}>New Password</label>
                  <div style={{ position: "relative" }}>
                    <input className="input-ek" type={showPassword ? "text" : "password"} placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} style={{ paddingRight: 40 }} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-3)", cursor: "pointer", padding: 0, display: "flex" }}>
                      {showPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      )}
                    </button>
                  </div>
                  
                  {/* Dynamic Password Checklist */}
                  <AnimatePresence>
                    {password.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: "auto" }} 
                        exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: "hidden" }}
                      >
                        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6, padding: "12px 14px", background: "var(--surface-2)", border: "1px solid var(--border-2)", borderRadius: "var(--r-md)" }}>
                          {[
                            { label: "At least 8 characters", valid: password.length >= 8 },
                            { label: "One uppercase letter", valid: /[A-Z]/.test(password) },
                            { label: "One special character", valid: /[!@#$%^&*()_+\-=[\]{}|':"\\<>?]/.test(password) }
                          ].map((req, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: req.valid ? 600 : 500, color: req.valid ? "var(--success)" : "var(--text-3)", transition: "all 0.2s ease" }}>
                              {req.valid ? (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                              ) : (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>
                              )}
                              <span>{req.label}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </div>

              <motion.button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={loading}
                whileTap={{ scale: 0.97 }}
                style={{ width: "100%", marginTop: 24, padding: "13px", fontSize: "var(--text-sm)" }}
              >
                {loading ? "Updating…" : "Update Password"}
              </motion.button>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
