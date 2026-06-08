import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/useAuth"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useRef, useEffect } from "react"

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
    if (editName.trim()) {
      localStorage.setItem("display_name", editName.trim())
      setName(editName.trim())
    }
    setEditing(false)
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(248,250,252,0.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--border)", height: 64 }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

        <button onClick={() => navigate(user ? "/" : "/landing")} style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.5px", background: "none", border: "none", cursor: "pointer", color: "var(--text-1)" }}>
          Resume<span style={{ color: "var(--accent)" }}>AI</span>
        </button>

        {!isAuth && user && (
          <nav className="hidden md:flex" style={{ alignItems: "center", gap: 4 }}>
            <NavLink label="Analyze" onClick={() => navigate("/")} active={path === "/"} />
            <NavLink label="History" onClick={() => navigate("/history")} active={path === "/history"} />
          </nav>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {user ? (
            <div ref={ref} style={{ position: "relative" }}>
              <button
                onClick={() => setShowAccount(v => !v)}
                style={{ display: "flex", alignItems: "center", gap: 8, background: showAccount ? "#DBEAFE" : "var(--bg)", border: "1.5px solid var(--border)", borderRadius: 12, padding: "7px 14px", cursor: "pointer", transition: "all 0.15s" }}
              >
                <div style={{ width: 28, height: 28, background: "var(--accent)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 13 }}>
                  {name.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
              </button>

              <AnimatePresence>
                {showAccount && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.18 }}
                    style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 280, background: "white", border: "1px solid var(--border)", borderRadius: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", overflow: "hidden" }}
                  >
                    {/* Account section */}
                    <div style={{ padding: "20px 20px 16px" }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Account</p>

                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                        <div style={{ width: 44, height: 44, background: "var(--accent)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {editing ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                              <input autoFocus value={editName} onChange={e => setEditName(e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditing(false) }}
                                style={{ width: "100%", border: "1.5px solid var(--accent)", borderRadius: 8, padding: "6px 10px", fontSize: 13, outline: "none", fontFamily: "Inter, sans-serif", boxSizing: "border-box" }}
                              />
                              <div style={{ display: "flex", gap: 6 }}>
                                <button onClick={saveName} style={{ flex: 1, background: "var(--accent)", color: "white", border: "none", borderRadius: 8, padding: "6px 0", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Save</button>
                                <button onClick={() => setEditing(false)} style={{ flex: 1, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 0", fontSize: 12, cursor: "pointer" }}>Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
                              <button onClick={() => { setEditName(name); setEditing(true) }} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "var(--text-3)" }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              </button>
                            </div>
                          )}
                          <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
                        </div>
                      </div>
                    </div>

                    <div style={{ height: 1, background: "var(--border)" }} />

                    {/* Quick links */}
                    <div style={{ padding: "8px 8px" }}>
                      <MenuBtn icon="🏠" label="Analyze Resume" onClick={() => { navigate("/"); setShowAccount(false) }} />
                      <MenuBtn icon="📋" label="History" onClick={() => { navigate("/history"); setShowAccount(false) }} />
                    </div>

                    <div style={{ height: 1, background: "var(--border)" }} />

                    <div style={{ padding: "8px 8px 10px" }}>
                      <MenuBtn icon="🚪" label="Logout" onClick={() => { logout(); navigate("/landing") }} danger />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : !isAuth ? (
            <>
              <button className="btn-ghost" style={{ padding: "8px 18px", fontSize: 13 }} onClick={() => navigate("/login")}>Sign In</button>
              <button className="btn-primary" style={{ padding: "8px 18px", fontSize: 13 }} onClick={() => navigate("/signup")}>Get Started</button>
            </>
          ) : null}
        </div>
      </div>
    </motion.header>
  )
}

function NavLink({ label, onClick, active }) {
  return (
    <button onClick={onClick} style={{ padding: "6px 14px", borderRadius: 8, fontSize: 14, fontWeight: 500, background: active ? "#DBEAFE" : "transparent", color: active ? "var(--accent)" : "var(--text-2)", border: "none", cursor: "pointer", transition: "background 0.15s, color 0.15s" }}>{label}</button>
  )
}

function MenuBtn({ icon, label, onClick, danger }) {
  return (
    <button onClick={onClick} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, color: danger ? "var(--danger)" : "var(--text-1)", textAlign: "left", transition: "background 0.12s" }}
      onMouseEnter={e => e.currentTarget.style.background = danger ? "#FEF2F2" : "var(--bg)"}
      onMouseLeave={e => e.currentTarget.style.background = "none"}
    >
      <span>{icon}</span>{label}
    </button>
  )
}