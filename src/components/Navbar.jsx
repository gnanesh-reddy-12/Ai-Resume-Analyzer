import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/useAuth"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useRef, useEffect } from "react"

const spring = { type: "spring", stiffness: 420, damping: 32 }

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const path = location.pathname
  const isAuth = path === "/login" || path === "/signup"
  const [showAccount, setShowAccount] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [name] = useState(
    localStorage.getItem("display_name") || user?.user_metadata?.full_name || "User"
  )
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setShowAccount(false)
    }
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
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="ek-navbar"
      >
        <div style={{
          width: "100%",
          padding: "0 8px 0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative"
        }}>
          {/* Logo */}
          <button
            onClick={() => navigate(user ? "/" : "/landing")}
            style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8, outline: "none", flexShrink: 0
            }}
          >
            <div style={{
              width: 26, height: 26, background: "var(--accent)", borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.5px", color: "var(--text-1)" }}>
              Resume<span style={{ color: "var(--accent)" }}>AI</span>
            </span>
          </button>

          {/* Center Nav */}
          {!isAuth && user && (
            <nav
              className="hidden-mobile"
              style={{
                position: "absolute", left: "50%", transform: "translateX(-50%)",
                background: "var(--bg)", padding: 3, borderRadius: 99,
                display: "flex", gap: 2, border: "1px solid var(--border)"
              }}
            >
              <NavLink label="Analyze" onClick={() => navigate("/")} active={path === "/"} />
              <NavLink label="History" onClick={() => navigate("/history")} active={path === "/history"} />
            </nav>
          )}

          {/* Right */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            {user ? (
              <>
                <div ref={ref} style={{ position: "relative" }} className="hidden-mobile">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setShowAccount(v => !v)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      background: showAccount ? "var(--bg)" : "transparent",
                      border: "none", borderRadius: 99,
                      padding: "4px 10px 4px 4px", cursor: "pointer", outline: "none"
                    }}
                  >
                    <div style={{
                      width: 30, height: 30, background: "var(--accent)", borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontWeight: 700, fontSize: 12, flexShrink: 0
                    }}>
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{
                      fontSize: 13, fontWeight: 500, color: "var(--text-1)",
                      maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                    }}>
                      {name.split(" ")[0]}
                    </span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2.5">
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </motion.button>

                  <AnimatePresence>
                    {showAccount && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={spring}
                        style={{
                          position: "absolute", right: 0, top: "calc(100% + 10px)",
                          width: 220, background: "var(--surface)",
                          border: "1px solid var(--border)", borderRadius: "var(--r-xl)",
                          boxShadow: "var(--shadow-lg)", overflow: "hidden", zIndex: 200
                        }}
                      >
                        <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid var(--border)" }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</p>
                          <p style={{ fontSize: 11, color: "var(--text-3)", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
                        </div>
                        <div style={{ padding: 6 }}>
                          <MenuBtn label="Profile Settings" onClick={() => { navigate("/profile"); setShowAccount(false) }} />
                          <MenuBtn label="Analyze Resume" onClick={() => { navigate("/"); setShowAccount(false) }} />
                          <MenuBtn label="History" onClick={() => { navigate("/history"); setShowAccount(false) }} />
                        </div>
                        <div style={{ padding: 6, borderTop: "1px solid var(--border)" }}>
                          <MenuBtn label="Log out" onClick={() => { logout(); navigate("/landing") }} danger />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </>
            ) : !isAuth ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  onClick={() => navigate("/login")}
                  style={{
                    background: "transparent", color: "var(--text-2)", fontSize: 13,
                    border: "none", cursor: "pointer", padding: 0,
                    borderRadius: 99, fontWeight: 500, fontFamily: "inherit",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}
                  title="Sign In"
                >
                  <span className="hidden-mobile" style={{ padding: "8px 14px" }}>Sign in</span>
                  <div className="show-mobile" style={{ display: "none", width: 36, height: 36, background: "var(--surface)", border: "1px solid var(--border-2)", borderRadius: "50%", alignItems: "center", justifyContent: "center", color: "var(--text-1)" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                </button>
                <button className="btn-accent" onClick={() => navigate("/signup")} style={{ padding: "8px 16px", fontSize: 13 }}>
                  Get Started
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </motion.div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {showMobileMenu && user && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={spring}
            style={{
              position: "fixed", top: 76, left: 16, right: 16, zIndex: 99,
              background: "var(--surface)", borderRadius: "var(--r-2xl)",
              border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)", overflow: "hidden"
            }}
          >
            <div style={{
              padding: "16px 16px 12px", borderBottom: "1px solid var(--border)",
              display: "flex", alignItems: "center", gap: 12
            }}>
              <div style={{
                width: 38, height: 38, background: "var(--accent)", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0
              }}>
                {name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>{name}</p>
                <p style={{ fontSize: 12, color: "var(--text-3)" }}>{user.email}</p>
              </div>
            </div>
            <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 2 }}>
              {[
                { label: "Analyze Resume", path: "/" },
                { label: "History", path: "/history" },
                { label: "Profile Settings", path: "/profile" },
              ].map(l => (
                <button
                  key={l.path}
                  onClick={() => { navigate(l.path); setShowMobileMenu(false) }}
                  style={{
                    padding: "12px 16px", background: path === l.path ? "var(--bg)" : "transparent",
                    border: "none", borderRadius: "var(--r-lg)", textAlign: "left",
                    fontSize: 14, fontWeight: path === l.path ? 700 : 500,
                    color: path === l.path ? "var(--accent)" : "var(--text-1)",
                    cursor: "pointer", fontFamily: "inherit"
                  }}
                >
                  {l.label}
                </button>
              ))}
              <div style={{ height: 1, background: "var(--border)", margin: "4px 8px" }} />
              <button
                onClick={() => { logout(); navigate("/landing") }}
                style={{
                  padding: "12px 16px", background: "transparent",
                  border: "none", borderRadius: "var(--r-lg)", textAlign: "left",
                  fontSize: 14, fontWeight: 600, color: "var(--danger)",
                  cursor: "pointer", fontFamily: "inherit"
                }}
              >
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
      <button
        onClick={onClick}
        style={{
          position: "relative", zIndex: 2, padding: "6px 18px", borderRadius: 99,
          fontSize: 13, fontWeight: 500, background: "transparent", border: "none",
          cursor: "pointer", outline: "none",
          color: active ? "var(--text-1)" : "var(--text-3)",
          transition: "color 0.15s", fontFamily: "inherit"
        }}
      >
        {label}
      </button>
      {active && (
        <motion.div
          layoutId="navbar-indicator"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          style={{
            position: "absolute", inset: 0,
            background: "var(--surface)",
            borderRadius: 99,
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-xs)",
            zIndex: 1
          }}
        />
      )}
    </div>
  )
}

function MenuBtn({ label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%", display: "block", padding: "8px 12px",
        borderRadius: "var(--r-sm)", border: "none", background: "transparent",
        cursor: "pointer", fontSize: 13, fontWeight: 500,
        color: danger ? "var(--danger)" : "var(--text-2)",
        textAlign: "left", outline: "none", fontFamily: "inherit",
        transition: "background 0.12s, color 0.12s"
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = danger ? "var(--danger-bg)" : "var(--bg)"
        e.currentTarget.style.color = danger ? "var(--danger)" : "var(--text-1)"
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "transparent"
        e.currentTarget.style.color = danger ? "var(--danger)" : "var(--text-2)"
      }}
    >
      {label}
    </button>
  )
}