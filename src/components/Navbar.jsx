import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/useAuth"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useRef, useEffect } from "react"

const ease = [0.16, 1, 0.3, 1]

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const path = location.pathname
  const isAuth = path === "/login" || path === "/signup"
  const [showAccount, setShowAccount] = useState(false)
  const [name, setName] = useState(localStorage.getItem("display_name") || user?.email?.split("@")[0] || "User")
  const [editName, setEditName] = useState(name)
  const [editing, setEditing] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setShowAccount(false) }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const saveName = () => {
    if (editName.trim()) { localStorage.setItem("display_name", editName.trim()); setName(editName.trim()) }
    setEditing(false)
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease }}
      style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(250,248,245,0.92)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)", height: 60
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(16px, 4vw, 24px)", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

        <button
          onClick={() => navigate(user ? "/" : "/landing")}
          style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.5px", background: "none", border: "none", cursor: "pointer", color: "var(--text-1)", padding: 0 }}
        >
          Resume<span style={{ color: "var(--accent)" }}>AI</span>
        </button>

        {!isAuth && user && (
          <nav className="hidden md:flex" style={{ alignItems: "center", gap: 2 }}>
            <NavLink label="Analyze" onClick={() => navigate("/")} active={path === "/"} />
            <NavLink label="History" onClick={() => navigate("/history")} active={path === "/history"} />
          </nav>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {user ? (
            <div ref={ref} style={{ position: "relative" }}>
              <button
                onClick={() => setShowAccount(v => !v)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: showAccount ? "var(--accent-soft)" : "var(--surface)",
                  border: `1.5px solid ${showAccount ? "var(--accent-mid)" : "var(--border)"}`,
                  borderRadius: "var(--r-sm)", padding: "7px 12px",
                  cursor: "pointer", transition: "all 0.18s", outline: "none"
                }}
              >
                <div style={{ width: 26, height: 26, background: "var(--accent)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                  {name.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2.5" style={{ flexShrink: 0, transition: "transform 0.18s", transform: showAccount ? "rotate(180deg)" : "rotate(0deg)" }}><path d="M6 9l6 6 6-6"/></svg>
              </button>

              <AnimatePresence>
                {showAccount && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.2, ease }}
                    style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 272, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", boxShadow: "var(--shadow-lg)", overflow: "hidden" }}
                  >
                    <div style={{ padding: "18px 18px 14px" }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Account</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                        <div style={{ width: 42, height: 42, background: "var(--accent)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 17, flexShrink: 0 }}>
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {editing ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                              <input autoFocus value={editName} onChange={e => setEditName(e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditing(false) }}
                                style={{ width: "100%", border: "1.5px solid var(--accent)", borderRadius: "var(--r-xs)", padding: "6px 10px", fontSize: 13, outline: "none", fontFamily: "Inter", boxSizing: "border-box", background: "var(--surface)", color: "var(--text-1)" }}
                              />
                              <div style={{ display: "flex", gap: 6 }}>
                                <button onClick={saveName} style={{ flex: 1, background: "var(--accent)", color: "white", border: "none", borderRadius: "var(--r-xs)", padding: "6px 0", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Save</button>
                                <button onClick={() => setEditing(false)} style={{ flex: 1, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--r-xs)", padding: "6px 0", fontSize: 12, cursor: "pointer", color: "var(--text-2)" }}>Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
                              <button onClick={() => { setEditName(name); setEditing(true) }} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "var(--text-3)", flexShrink: 0 }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              </button>
                            </div>
                          )}
                          <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="divider" />

                    <div style={{ padding: "6px 8px" }}>
                      <MenuBtn label="Analyze Resume" icon="⟐" onClick={() => { navigate("/"); setShowAccount(false) }} />
                      <MenuBtn label="History" icon="◫" onClick={() => { navigate("/history"); setShowAccount(false) }} />
                    </div>

                    <div className="divider" />

                    <div style={{ padding: "6px 8px 10px" }}>
                      <MenuBtn label="Logout" icon="→" onClick={() => { logout(); navigate("/landing") }} danger />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : !isAuth ? (
            <>
              <button className="btn-ghost" style={{ padding: "7px 16px", fontSize: 13 }} onClick={() => navigate("/login")}>Sign In</button>
              <button className="btn-primary" style={{ padding: "7px 16px", fontSize: 13 }} onClick={() => navigate("/signup")}>Get Started</button>
            </>
          ) : null}
        </div>
      </div>
    </motion.header>
  )
}

function NavLink({ label, onClick, active }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 14px", borderRadius: "var(--r-xs)", fontSize: 13, fontWeight: 500,
        background: active ? "var(--accent-soft)" : "transparent",
        color: active ? "var(--accent)" : "var(--text-2)",
        border: active ? "1px solid var(--accent-mid)" : "1px solid transparent",
        cursor: "pointer", transition: "all 0.15s", outline: "none"
      }}
    >
      {label}
    </button>
  )
}

function MenuBtn({ label, onClick, danger, icon }) {
  return (
    <button
      onClick={onClick}
      style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: "var(--r-xs)", border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, color: danger ? "var(--danger)" : "var(--text-1)", textAlign: "left", transition: "background 0.12s" }}
      onMouseEnter={e => e.currentTarget.style.background = danger ? "var(--danger-bg)" : "var(--bg-2)"}
      onMouseLeave={e => e.currentTarget.style.background = "none"}
    >
      <span style={{ fontSize: 14, opacity: 0.6 }}>{icon}</span>
      {label}
    </button>
  )
}