import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/useAuth"

const T = {
  bg: "#FAF8F5", bg2: "#EDEAE5", surface: "#ffffff",
  text1: "#1A1410", text2: "#4A4540", text3: "#9C9690",
  border: "rgba(26,20,16,0.08)", border2: "rgba(26,20,16,0.14)",
  accent: "#5C6B4E", accentSoft: "#E4EBE0", accentMid: "#C8D4BE",
  accentDeep: "rgba(92,107,78,0.18)",
  danger: "#C9252D", dangerBg: "#FFF1F0", dangerBd: "#FFCCC7",
}

const navItems = [
  {
    id: "dashboard", label: "Dashboard", path: "/",
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>,
  },
  {
    id: "history", label: "History", path: "/history",
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  },
]

export default function AppSidebar({ activeId }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const name = localStorage.getItem("display_name") || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User"
  const initials = name.slice(0, 2).toUpperCase()

  return (
    <aside style={{
      width: 224, flexShrink: 0,
      background: "#F0EDE8",
      borderRight: `1px solid ${T.border}`,
      display: "flex", flexDirection: "column",
      height: "100vh", position: "sticky", top: 0,
      padding: "0",
    }}>
      {/* Logo */}
      <div style={{ padding: "18px 20px 14px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 28, height: 28, background: T.accent, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 016.5 2H20v20H6.5a2.5 2.5 0 010-5H20"/>
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 15.5, letterSpacing: "-0.02em", color: T.text1 }}>
            Resume<span style={{ color: T.accent }}>AI</span>
          </span>
        </div>
      </div>

      {/* New Analysis CTA */}
      <div style={{ padding: "14px 14px 10px" }}>
        <button
          onClick={() => navigate("/")}
          style={{
            width: "100%", height: 36, borderRadius: 20,
            background: T.accent, color: "#ffffff",
            border: "none",
            fontSize: 13, fontWeight: 700, fontFamily: "inherit",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            boxShadow: "0 2px 10px rgba(92,107,78,0.28)",
            transition: "background 0.15s, transform 0.15s ease-out, box-shadow 0.15s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "#4A5A3C";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 4px 14px rgba(92,107,78,0.35)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = T.accent;
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = "0 2px 10px rgba(92,107,78,0.28)";
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> New Analysis
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "4px 10px" }}>
        {navItems.map(item => {
          const active = activeId === item.id
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 20, border: "none",
                background: active ? T.accent : "transparent",
                color: active ? "#ffffff" : T.text2,
                fontSize: 13.5, fontWeight: active ? 700 : 500,
                fontFamily: "inherit", cursor: "pointer",
                marginBottom: 3, textAlign: "left",
                transition: "background 150ms, color 150ms, transform 150ms ease-out",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-2px)";
                if (!active) {
                  e.currentTarget.style.background = T.accentDeep;
                  e.currentTarget.style.color = T.accent;
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "none";
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = T.text2;
                }
              }}
            >
              {item.icon}
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Sidebar footer — click row → Profile, icon → Sign out */}
      <div style={{ padding: "12px 14px", borderTop: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Clickable user row → /profile */}
          <div
            onClick={() => navigate("/profile")}
            style={{
              display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0,
              cursor: "pointer", borderRadius: 8, padding: "5px 6px",
              transition: "background 150ms",
            }}
            onMouseEnter={e => e.currentTarget.style.background = T.bg2}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <div style={{
              width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
              background: T.accentSoft, border: `1px solid ${T.accentMid}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, color: T.accent,
            }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 12.5, fontWeight: 600, color: T.text1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</p>
              <p style={{ fontSize: 10.5, color: T.text3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</p>
            </div>
          </div>

          {/* Sign out — small icon only, hard to accidentally click */}
          <button
            onClick={logout}
            title="Sign out"
            style={{
              width: 30, height: 30, borderRadius: 8, flexShrink: 0,
              border: `1px solid ${T.border}`, background: "transparent",
              color: T.text3, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 150ms, color 150ms, border-color 150ms",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = T.dangerBg; e.currentTarget.style.color = T.danger; e.currentTarget.style.borderColor = T.dangerBd }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.text3; e.currentTarget.style.borderColor = T.border }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  )
}
