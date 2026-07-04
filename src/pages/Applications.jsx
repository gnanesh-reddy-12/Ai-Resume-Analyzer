import { useState, useEffect } from "react"
import { useAuth } from "../context/useAuth"
import { supabase } from "../supabase"
import { motion, AnimatePresence } from "framer-motion"
import AppLayout from "../components/AppLayout"
import CompanyLogo from "../components/CompanyLogo"

const spring = { type: "spring", stiffness: 400, damping: 30 }
const APP_STATUSES = ["Applied","Interview","Offer","Rejected"]

const statusMeta = {
  Applied:   { color: "var(--text-3)",   bg: "var(--bg)",         bd: "var(--border)" },
  Interview: { color: "var(--warning)",  bg: "var(--warning-bg)", bd: "var(--warning-bd)" },
  Offer:     { color: "var(--success)",  bg: "var(--success-bg)", bd: "var(--success-bd)" },
  Rejected:  { color: "var(--danger)",   bg: "var(--danger-bg)",  bd: "var(--danger-bd)" },
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={spring}
      style={{
        position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
        zIndex: 500, background: "var(--text-1)", color: "#fff",
        padding: "12px 20px", borderRadius: 99,
        fontSize: 13, fontWeight: 600,
        display: "flex", alignItems: "center", gap: 8,
        boxShadow: "var(--shadow-lg)", whiteSpace: "nowrap"
      }}
    >
      <div style={{
        width: 8, height: 8, borderRadius: "50%",
        background: type === "success" ? "#4ade80" : "#f87171"
      }} />
      {message}
    </motion.div>
  )
}

export default function Applications() {
  const { user } = useAuth()
  
  const [applications, setApplications] = useState([])
  const [newApp, setNewApp] = useState({ company: "", role: "", status: "Applied", job_id: "" })
  const [addingApp, setAddingApp] = useState(false)
  const [activeMenuId, setActiveMenuId] = useState(null)
  const [toast, setToast] = useState(null)
  
  const showToast = (text, type = "success") => setToast({ text, type })

  const loadApplications = async () => {
    const { data } = await supabase
      .from("applications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
    setApplications(data || [])
  }

  useEffect(() => {
    if (!user) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadApplications()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('.app-menu-container')) {
        setActiveMenuId(null)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const addApplication = async () => {
    if (!newApp.company.trim() || !newApp.role.trim()) return
    setAddingApp(true)
    const payload = { company: newApp.company, role: newApp.role, status: newApp.status, user_id: user.id }
    if (newApp.job_id.trim()) payload.job_id = newApp.job_id.trim()
    const { data, error } = await supabase.from("applications").insert(payload).select().single()
    setAddingApp(false)
    
    if (error) {
      console.error("Supabase error:", error)
      showToast(error.message || "Failed to add application", "error")
      return
    }
    
    if (data) setApplications(p => [data, ...p])
    setNewApp({ company: "", role: "", status: "Applied", job_id: "" })
    showToast("Application added.")
  }

  const updateAppStatus = async (id, status) => {
    await supabase.from("applications").update({ status }).eq("id", id)
    setApplications(p => p.map(a => a.id === id ? { ...a, status } : a))
  }

  const deleteApp = async (id) => {
    await supabase.from("applications").delete().eq("id", id)
    setApplications(p => p.filter(a => a.id !== id))
  }

  const appFunnel = APP_STATUSES.map(s => ({
    status: s,
    count: applications.filter(a => a.status === s).length,
    ...statusMeta[s]
  }))

  return (
    <AppLayout activeId="applications">
      <AnimatePresence>
        {toast && <Toast message={toast.text} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <div className="container" style={{ display: "flex", flexDirection: "column", flex: 1, paddingBottom: 64 }}>
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={spring}
          style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: "clamp(22px,4vw,30px)", fontWeight: 800, letterSpacing: "-0.8px", marginBottom: 4 }}>Job Tracker</h1>
          <p style={{ color: "var(--text-3)", fontSize: 14 }}>Keep track of your applications and interview pipeline</p>
        </motion.div>

        {/* Application Tracker */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.04 }}
          className="profile-section-card"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", marginBottom: 16 }}>
          <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>All Applications</h2>
            </div>
            {/* Funnel pills */}
            {applications.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {appFunnel.map(f => f.count > 0 && (
                  <span key={f.status} style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    background: f.bg, color: f.color, border: `1px solid ${f.bd}`,
                    fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 99
                  }}>
                    {f.status} <span style={{ opacity: 0.7 }}>{f.count}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div style={{ padding: "18px 12px" }}>
            {/* Add form */}
            <div className="app-tracker-form" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto auto", gap: 10, marginBottom: 20, alignItems: "end" }}>
              <div>
                <label style={{ display: "block", fontSize: 10.5, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>Company</label>
                <input className="input-ek" value={newApp.company} onChange={e => setNewApp(p => ({ ...p, company: e.target.value }))} placeholder="Google" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 10.5, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>Role</label>
                <input className="input-ek" value={newApp.role} onChange={e => setNewApp(p => ({ ...p, role: e.target.value }))} placeholder="Software Engineer" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 10.5, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>Job ID</label>
                <input className="input-ek" value={newApp.job_id} onChange={e => setNewApp(p => ({ ...p, job_id: e.target.value }))} placeholder="REQ-123 (Opt)" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 10.5, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>Status</label>
                <select className="input-ek" value={newApp.status} onChange={e => setNewApp(p => ({ ...p, status: e.target.value }))} style={{ minWidth: 110 }}>
                  {APP_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <button className="btn-accent" onClick={addApplication} disabled={addingApp} style={{ padding: "10px 20px", alignSelf: "end" }}>
                {addingApp ? "…" : "Add"}
              </button>
            </div>

            {applications.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0", border: "1.5px dashed var(--border-2)", borderRadius: "var(--r-lg)", background: "var(--bg)" }}>
                <div style={{ width: 48, height: 48, background: "var(--accent-soft)", borderRadius: "var(--r-md)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "var(--accent)", border: "1px solid var(--accent-mid)" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                </div>
                <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text-1)", marginBottom: 6 }}>No applications tracked yet</p>
                <p style={{ fontSize: 13.5, color: "var(--text-3)" }}>Add your first application above to start tracking your pipeline.</p>
              </div>
            ) : (
              <div>
                <div className="custom-scrollbar" style={{ display: "flex", flexDirection: "column", gap: 8, overflowX: "hidden", paddingRight: 4 }}>
                {applications.map((app, idx) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                    whileHover={{ scale: 1.01, y: -1, transition: { type: "spring", stiffness: 400, damping: 25 } }}
                    className="app-table-row ek-card"
                    style={{ 
                      zIndex: activeMenuId === app.id ? 50 : 1,
                      display: "grid", gridTemplateColumns: "1.4fr 1.1fr auto auto auto", 
                      alignItems: "center", gap: 16, 
                      background: "var(--surface)", border: "1px solid var(--border)", 
                      borderRadius: "var(--r-md)", padding: "12px 16px",
                      boxShadow: "var(--shadow-xs)", position: "relative"
                    }}
                  >
                    {/* Company */}
                    <div className="app-company-col" style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <CompanyLogo name={app.company} />
                        <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{app.company}</h4>
                      </div>
                      {app.job_id && <span style={{ fontSize: 11, color: "var(--text-3)", display: "block", marginTop: 2, marginLeft: 32 }}>ID: {app.job_id}</span>}
                    </div>

                    {/* Role */}
                    <div className="app-role-col" style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {app.role}
                    </div>

                    {/* Status Pill */}
                    <div className="app-status-col">
                      <select
                        value={app.status}
                        onChange={e => updateAppStatus(app.id, e.target.value)}
                        style={{
                          fontSize: 11.5, fontWeight: 700, padding: "4px 10px",
                          borderRadius: "99px", border: "none",
                          background: statusMeta[app.status]?.bg || "var(--bg)",
                          color: statusMeta[app.status]?.color || "var(--text-1)",
                          cursor: "pointer", fontFamily: "inherit"
                        }}
                      >
                        {APP_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    {/* Date */}
                    <div className="app-date-col" style={{ fontSize: 12, color: "var(--text-3)", textAlign: "right" }}>
                      {new Date(app.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>

                    {/* Actions */}
                    <div className="app-menu-container" style={{ position: "relative" }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === app.id ? null : app.id) }}
                        style={{ width: 28, height: 28, borderRadius: 6, border: "none", background: activeMenuId === app.id ? "var(--bg)" : "transparent", cursor: "pointer", color: "var(--text-3)", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                      </button>
                      <AnimatePresence>
                        {activeMenuId === app.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -5 }} transition={{ duration: 0.1 }}
                            style={{ position: "absolute", right: 0, top: "100%", marginTop: 4, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: 4, boxShadow: "var(--shadow-lg)", zIndex: 100, minWidth: 120 }}
                          >
                            <button
                              onClick={() => { deleteApp(app.id); setActiveMenuId(null) }}
                              style={{ width: "100%", textAlign: "left", padding: "8px 12px", fontSize: 12.5, fontWeight: 600, color: "var(--danger)", background: "transparent", border: "none", borderRadius: 4, cursor: "pointer", transition: "background 0.1s" }}
                              onMouseEnter={e => e.currentTarget.style.background = "var(--danger-bg)"}
                              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >
                              Delete
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                  </motion.div>
                ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  )
}
