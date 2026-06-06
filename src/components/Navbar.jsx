import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/useAuth"
import { motion } from "framer-motion"

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const path = location.pathname
  const isAuth = path === "/login" || path === "/signup"

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(248,250,252,0.88)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border)",
        height: 64
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => navigate(user ? "/" : "/landing")} style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.5px", background: "none", border: "none", cursor: "pointer", color: "var(--text-1)" }}>
          Resume<span style={{ color: "var(--accent)" }}>AI</span>
        </button>

        {!isAuth && (
          <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {user && (
              <>
                <NavLink label="Analyze" onClick={() => navigate("/")} active={path === "/"} />
                <NavLink label="History" onClick={() => navigate("/history")} active={path === "/history"} />
              </>
            )}
          </nav>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {user ? (
            <>
              <span style={{ fontSize: 13, color: "var(--text-3)", display: "none" }} className="md-show">{user.email}</span>
              <button className="btn-ghost" style={{ padding: "8px 18px", fontSize: 13 }} onClick={() => { logout(); navigate("/landing") }}>
                Logout
              </button>
            </>
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
    <button onClick={onClick} style={{
      padding: "6px 14px", borderRadius: 8, fontSize: 14, fontWeight: 500,
      background: active ? "#DBEAFE" : "transparent",
      color: active ? "var(--accent)" : "var(--text-2)",
      border: "none", cursor: "pointer",
      transition: "background 0.15s, color 0.15s"
    }}>{label}</button>
  )
}