import { Link } from "react-router-dom"

export default function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid var(--border)",
      padding: "40px clamp(20px,5vw,56px) 32px",
      display: "flex", flexDirection: "column", gap: 32,
      color: "var(--text-3)", fontSize: 13,
      background: "var(--bg)"
    }}>
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 24 }}>
        <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.5px", color: "var(--text-1)", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 22, height: 22, background: "var(--accent)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
          </div>
          Resume<span style={{ color: "var(--accent)" }}>AI</span>
        </span>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "16px 32px", fontWeight: 500 }}>
          <Link to="/about" style={{ cursor: "pointer", textDecoration: "none", color: "var(--text-3)", transition: "color 0.15s" }} onMouseEnter={e => e.currentTarget.style.color = "var(--text-1)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-3)"}>About Us</Link>
          <Link to="/privacy" style={{ cursor: "pointer", textDecoration: "none", color: "var(--text-3)", transition: "color 0.15s" }} onMouseEnter={e => e.currentTarget.style.color = "var(--text-1)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-3)"}>Privacy Policy</Link>
          <Link to="/terms" style={{ cursor: "pointer", textDecoration: "none", color: "var(--text-3)", transition: "color 0.15s" }} onMouseEnter={e => e.currentTarget.style.color = "var(--text-1)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-3)"}>Terms of Service</Link>
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16, borderTop: "1px solid var(--border)", paddingTop: 24 }}>
        <span>© 2026 ResumeAI. All rights reserved.</span>
        <span>Built for students and professionals.</span>
      </div>
    </footer>
  )
}
