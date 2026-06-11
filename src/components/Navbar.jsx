import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/useAuth"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useRef, useEffect } from "react"

const spring = { type: "spring", stiffness: 400, damping: 30 }
const layoutSpring = { type: "spring", stiffness: 350, damping: 30 }

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const path = location.pathname
  const isAuth = path === "/login" || path === "/signup"
  const [showAccount, setShowAccount] = useState(false)
  const [name] = useState(localStorage.getItem("display_name") || user?.user_metadata?.full_name || "User")
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setShowAccount(false) }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
      style={{
        position: "sticky", top: 16, zIndex: 100,
        margin: "0 auto", maxWidth: 960, width: "calc(100% - 32px)",
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        borderRadius: 99,
        border: "1px solid var(--border)",
        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.02)",
        height: 60,
        display: "flex", alignItems: "center",
      }}
    >
      <div style={{ width: "100%", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
        
        {/* Logo */}
        <button
          onClick={() => navigate(user ? "/" : "/landing")}
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, outline: "none" }}
        >
          <div style={{ width: 24, height: 24, background: "var(--accent)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
          </div>
          <span style={{ fontWeight: 600, fontSize: "var(--text-base)", letterSpacing: "-0.03em", color: "var(--text-1)" }}>
            Resume<span style={{ color: "var(--accent)", opacity: 0.9 }}>AI</span>
          </span>
        </button>

        {/* Center Nav */}
        {!isAuth && user && (
          <nav className="hidden md:flex" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", background: "var(--bg)", padding: 4, borderRadius: 99, display: "flex", gap: 4 }}>
            <NavLink label="Analyze" onClick={() => navigate("/")} active={path === "/"} />
            <NavLink label="History" onClick={() => navigate("/history")} active={path === "/history"} />
          </nav>
        )}

        {/* Right Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {user ? (
            <div ref={ref} style={{ position: "relative" }}>
              <motion.button
                whileTap={{ scale: 0.95 }}
                transition={spring}
                onClick={() => setShowAccount(v => !v)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: showAccount ? "var(--bg)" : "transparent",
                  border: "none", borderRadius: 99, padding: "4px 12px 4px 4px",
                  cursor: "pointer", outline: "none", transition: "background 0.2s"
                }}
              >
                <div style={{ width: 28, height: 28, background: "var(--accent)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 600, fontSize: 13, flexShrink: 0 }}>
                  {name.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--text-1)", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
              </motion.button>

              <AnimatePresence>
                {showAccount && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={spring}
                    className="ek-card"
                    style={{
                      position: "absolute", right: 0, top: "calc(100% + 8px)", width: 220, overflow: "hidden",
                    }}
                  >
                    <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid var(--border)" }}>
                      <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-1)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</p>
                      <p style={{ fontSize: "var(--text-xs)", color: "var(--text-3)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
                    </div>

                    <div style={{ padding: 6 }}>
                      <MenuBtn label="Profile Settings" onClick={() => { navigate("/profile"); setShowAccount(false) }} />
                      <MenuBtn label="Analyze Resume" onClick={() => { navigate("/"); setShowAccount(false) }} />
                      <MenuBtn label="History" onClick={() => { navigate("/history"); setShowAccount(false) }} />
                    </div>

                    <div style={{ padding: 6, borderTop: "1px solid var(--border)" }}>
                      <MenuBtn label="Log out" onClick={() => { logout(); navigate("/landing") }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : !isAuth ? (
            <>
              <button
                className="btn-ek"
                onClick={() => navigate("/login")}
                style={{ background: "transparent", color: "var(--text-2)", fontSize: "var(--text-sm)", border: "none", cursor: "pointer", outline: "none", padding: "8px 16px" }}
              >
                Sign in
              </button>
              <button
                className="btn-ek btn-accent"
                onClick={() => navigate("/signup")}
                style={{ borderRadius: 99, padding: "8px 18px", fontWeight: 600 }}
              >
                Get Started
              </button>
            </>
          ) : null}
        </div>
      </div>
    </motion.div>
  )
}

function NavLink({ label, onClick, active }) {
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={onClick}
        style={{
          position: "relative", zIndex: 2,
          padding: "6px 16px", borderRadius: 99, fontSize: "var(--text-sm)", fontWeight: 500,
          background: "transparent", border: "none", cursor: "pointer", outline: "none",
          color: active ? "var(--text-1)" : "var(--text-3)", transition: "color 0.2s"
        }}
      >
        {label}
      </button>
      {active && (
        <motion.div
          layoutId="navbar-indicator"
          transition={layoutSpring}
          style={{ position: "absolute", inset: 0, background: "var(--surface)", borderRadius: 99, boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 0 0 1px var(--border) inset", zIndex: 1 }}
        />
      )}
    </div>
  )
}

function MenuBtn({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%", display: "block", padding: "8px 10px", borderRadius: "var(--r-xs)",
        border: "none", background: "transparent", cursor: "pointer", fontSize: "var(--text-sm)",
        fontWeight: 500, color: "var(--text-2)", textAlign: "left", outline: "none",
        transition: "background 0.15s, color 0.15s"
      }}
      onMouseEnter={e => { e.currentTarget.style.background = "var(--bg)"; e.currentTarget.style.color = "var(--text-1)" }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-2)" }}
    >
      {label}
    </button>
  )
}