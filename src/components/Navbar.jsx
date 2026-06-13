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
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [name] = useState(localStorage.getItem("display_name") || user?.user_metadata?.full_name || "User")
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setShowAccount(false) }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  useEffect(() => {
    setShowMobileMenu(false)
    setShowAccount(false)
  }, [path])

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        style={{
          position: "sticky", top: 16, zIndex: 100,
          margin: "0 auto", maxWidth: 960, width: "calc(100% - 32px)",
          background: "rgba(248,249,251,0.92)",
          backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
          borderRadius: 99,
          border: "1px solid var(--border)",
          boxShadow: "0 10px 30px -10px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.02)",
          height: 56,
          display: "flex", alignItems: "center",
        }}
      >
        <div style={{ width: "100%", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>

          {/* Logo */}
          <button
            onClick={() => navigate(user ? "/" : "/landing")}
            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, outline: "none", flexShrink: 0 }}
          >
            <div style={{ width: 24, height: 24, background: "var(--accent)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
            </div>
            <span style={{ fontWeight: 600, fontSize: "var(--text-base)", letterSpacing: "-0.03em", color: "var(--text-1)" }}>
              Resume<span style={{ color: "var(--accent)", opacity: 0.9 }}>AI</span>
            </span>
          </button>

          {/* Center Nav — desktop only */}
          {!isAuth && user && (
            <nav style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", background: "var(--bg)", padding: 4, borderRadius: 99, display: "flex", gap: 4 }}
              className="hidden-mobile">
              <NavLink label="Analyze" onClick={() => navigate("/")} active={path === "/"} />
              <NavLink label="History" onClick={() => navigate("/history")} active={path === "/history"} />
            </nav>
          )}

          {/* Right */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {user ? (
              <>
                {/* Desktop account dropdown */}
                <div ref={ref} style={{ position: "relative" }} className="hidden-mobile">
                  <motion.button whileTap={{ scale: 0.95 }} transition={spring}
                    onClick={() => setShowAccount(v => !v)}
                    style={{ display: "flex", alignItems: "center", gap: 8, background: showAccount ? "var(--bg)" : "transparent", border: "none", borderRadius: 99, padding: "4px 12px 4px 4px", cursor: "pointer", outline: "none" }}>
                    <div style={{ width: 28, height: 28, background: "var(--accent)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 600, fontSize: 13, flexShrink: 0 }}>
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--text-1)", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
                  </motion.button>

                  <AnimatePresence>
                    {showAccount && (
                      <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }} transition={spring}
                        className="ek-card"
                        style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 220, overflow: "hidden", zIndex: 200 }}>
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

                {/* Mobile hamburger */}
                <button className="show-mobile" onClick={() => setShowMobileMenu(v => !v)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: "var(--text-1)", display: "none" }}>
                  {showMobileMenu ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                  )}
                </button>
              </>
            ) : !isAuth ? (
              <>
                <button className="btn-ek" onClick={() => navigate("/login")}
                  style={{ background: "transparent", color: "var(--text-2)", fontSize: "var(--text-sm)", border: "none", cursor: "pointer", outline: "none", padding: "8px 12px" }}>
                  Sign in
                </button>
                <button className="btn-ek btn-accent" onClick={() => navigate("/signup")}
                  style={{ borderRadius: 99, padding: "8px 16px", fontWeight: 600, fontSize: "var(--text-sm)" }}>
                  Get Started
                </button>
              </>
            ) : null}
          </div>
        </div>
      </motion.div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {showMobileMenu && user && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={spring}
            style={{ position: "fixed", top: 84, left: 16, right: 16, zIndex: 99, background: "var(--surface)", borderRadius: "var(--r-xl)", border: "1px solid var(--border)", boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)", overflow: "hidden" }}>
            <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, background: "var(--accent)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                {name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-1)" }}>{name}</p>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--text-3)" }}>{user.email}</p>
              </div>
            </div>
            <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 2 }}>
              {[
                { label: "Analyze Resume", path: "/" },
                { label: "History", path: "/history" },
                { label: "Profile Settings", path: "/profile" },
              ].map(item => (
                <button key={item.path} onClick={() => navigate(item.path)}
                  style={{ width: "100%", padding: "12px 12px", borderRadius: "var(--r-md)", border: "none", background: path === item.path ? "var(--bg)" : "transparent", cursor: "pointer", fontSize: "var(--text-sm)", fontWeight: path === item.path ? 600 : 500, color: path === item.path ? "var(--text-1)" : "var(--text-2)", textAlign: "left", display: "flex", alignItems: "center", gap: 10 }}>
                  {item.label}
                  {path === item.path && <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "var(--accent)" }} />}
                </button>
              ))}
            </div>
            <div style={{ padding: 8, borderTop: "1px solid var(--border)" }}>
              <button onClick={() => { logout(); navigate("/landing") }}
                style={{ width: "100%", padding: "12px", borderRadius: "var(--r-md)", border: "none", background: "var(--danger-bg)", cursor: "pointer", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--danger)", textAlign: "left" }}>
                Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function NavLink({ label, onClick, active }) {
  return (
    <div style={{ position: "relative" }}>
      <button onClick={onClick}
        style={{ position: "relative", zIndex: 2, padding: "6px 16px", borderRadius: 99, fontSize: "var(--text-sm)", fontWeight: 500, background: "transparent", border: "none", cursor: "pointer", outline: "none", color: active ? "var(--text-1)" : "var(--text-3)", transition: "color 0.2s" }}>
        {label}
      </button>
      {active && (
        <motion.div layoutId="navbar-indicator" transition={layoutSpring}
          style={{ position: "absolute", inset: 0, background: "var(--surface)", borderRadius: 99, border: "1px solid #E9EAEC", zIndex: 1 }} />
      )}
    </div>
  )
}

function MenuBtn({ label, onClick }) {
  return (
    <button onClick={onClick}
      style={{ width: "100%", display: "block", padding: "8px 10px", borderRadius: "var(--r-xs)", border: "none", background: "transparent", cursor: "pointer", fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--text-2)", textAlign: "left", outline: "none", transition: "background 0.15s, color 0.15s" }}
      onMouseEnter={e => { e.currentTarget.style.background = "var(--bg)"; e.currentTarget.style.color = "var(--text-1)" }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-2)" }}>
      {label}
    </button>
  )
}