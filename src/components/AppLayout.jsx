import { useState, useEffect } from "react"
import AppSidebar from "./AppSidebar"
import Navbar from "./Navbar"

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768)
    window.addEventListener("resize", fn)
    return () => window.removeEventListener("resize", fn)
  }, [])
  return mobile
}

export default function AppLayout({ children, activeId }) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#FAF8F5" }}>
        <Navbar />
        <main style={{ flex: 1, padding: "16px", boxSizing: "border-box", display: "flex", flexDirection: "column", maxWidth: "100%", overflowX: "hidden" }}>
          {children}
        </main>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      <AppSidebar activeId={activeId} />
      <main style={{ flex: 1, boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
        {/* Constrain width so it doesn't stretch infinitely on ultrawide */}
        <div style={{ maxWidth: 1000, margin: "0 auto", width: "100%", padding: "32px", display: "flex", flexDirection: "column", flex: 1, boxSizing: "border-box" }}>
          {children}
        </div>
      </main>
    </div>
  )
}
