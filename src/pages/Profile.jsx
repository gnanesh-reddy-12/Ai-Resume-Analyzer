import { useState, useRef, useEffect } from "react"
import { useAuth } from "../context/useAuth"
import { supabase } from "../supabase"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import AppLayout from "../components/AppLayout"

const spring = { type: "spring", stiffness: 400, damping: 30 }
const INDUSTRIES = ["Software Development" , "Frontend Engineer", "Backend Engineer", "Full-Stack Engineer", "DevOps Engineer", "Google Cloud Engineer", 
"Site Reliability Engineer (SRE)", "Forward Deployed Engineer (FDE)", "Mobile Engineer", "QA Automation Engineer", "Systems Engineer" , 
"Product Manager", "Technical Product Manager (TPM)", "Growth Product Manager", "Data Product Manager", "Product Designer", "UX Researcher", 
"UI/Visual Designer", "Interaction Designer", "UX Writer" , "Data Analyst", "Data Scientist", "Data Engineer", "AI Engineer", 
"Machine Learning Engineer", "MLOps Engineer", "Research Scientist", "BI Developer" , "Product Marketing Manager", "Growth Marketer",
"Developer Advocate", "SEO/SEM Specialist", "Content Strategist" , "SaaS Account Executive", "Sales Engineer", "Customer Success Manager", 
"BizOps Manager", "IT Systems Administrator", "Chief of Staff"]
const APP_STATUSES = ["Applied","Interview","Offer","Rejected"]

const statusMeta = {
  Applied:   { color: "var(--text-3)",   bg: "var(--bg)",         bd: "var(--border)" },
  Interview: { color: "var(--warning)",  bg: "var(--warning-bg)", bd: "var(--warning-bd)" },
  Offer:     { color: "var(--success)",  bg: "var(--success-bg)", bd: "var(--success-bd)" },
  Rejected:  { color: "var(--danger)",   bg: "var(--danger-bg)",  bd: "var(--danger-bd)" },
}

import CompanyLogo from "../components/CompanyLogo"

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

function ScoreSparkline({ scores }) {
  if (!scores?.length) return null
  const max = Math.max(...scores, 100)
  const min = Math.min(...scores, 0)
  const w = 160, h = 40
  const pts = scores.slice(-8).map((s, i, arr) => {
    const x = (i / Math.max(arr.length - 1, 1)) * w
    const y = h - ((s - min) / (max - min || 1)) * h
    return `${x},${y}`
  }).join(" ")
  const last = scores[scores.length - 1]
  const prev = scores[scores.length - 2]
  const trend = prev !== undefined ? last - prev : 0

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <svg width={w} height={h} style={{ overflow: "visible" }}>
        <polyline points={pts} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {trend !== 0 && (
        <span style={{ fontSize: 12, fontWeight: 700, color: trend > 0 ? "var(--success)" : "var(--danger)" }}>
          {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
        </span>
      )}
    </div>  
  )
}

export default function Profile() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState(user?.user_metadata?.full_name || "")
  const [targetIndustry, setTargetIndustry] = useState(user?.user_metadata?.target_industry || "Software Development")
  const [phone, setPhone] = useState("")
  const [linkedin, setLinkedin] = useState("")
  const [github, setGithub] = useState("")
  const [portfolio, setPortfolio] = useState("")
  const [targetCompanies, setTargetCompanies] = useState([])
  const [companyInput, setCompanyInput] = useState("")
  const [updatingProfile, setUpdatingProfile] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)

  const [resumeUrl, setResumeUrl] = useState(user?.user_metadata?.default_resume_url || "")
  // eslint-disable-next-line no-unused-vars
  const [resumeName, setResumeName] = useState(user?.user_metadata?.default_resume_name || "")
  // eslint-disable-next-line no-unused-vars
  const [uploadingResume, setUploadingResume] = useState(false)
  const [removingResume, setRemovingResume] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const [stats, setStats] = useState(null)
  const [scoreHistory, setScoreHistory] = useState([])
  const [applications, setApplications] = useState([])
  const [newApp, setNewApp] = useState({ company: "", role: "", status: "Applied", job_id: "" })
  const [addingApp, setAddingApp] = useState(false)

  const [toast, setToast] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState("")
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [showDeleteZone, setShowDeleteZone] = useState(false)
  const [activeMenuId, setActiveMenuId] = useState(null)

  const showToast = (text, type = "success") => setToast({ text, type })

  const initials = name
    ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() || "U"

  const loadProfile = async () => {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    if (data) {
      setPhone(data.phone || "")
      setLinkedin(data.linkedin_url || "")
      setGithub(data.github_url || "")
      setPortfolio(data.portfolio_url || "")
      setTargetCompanies(data.target_companies || [])
      if (data.target_industry) setTargetIndustry(data.target_industry)
      if (data.display_name) setName(data.display_name)
    }
  }

  const loadStats = async () => {
    const { data } = await supabase
      .from("analyses")
      .select("ats_score, company_name, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
    if (!data?.length) return setStats({ total: 0, avg: 0, best: 0, topCompany: "—" })
    const scores = data.map(r => r.ats_score || 0)
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    const best = Math.max(...scores)
    const freq = {}
    data.forEach(r => r.company_name && (freq[r.company_name] = (freq[r.company_name] || 0) + 1))
    const topCompany = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || "—"
    setStats({ total: data.length, avg, best, topCompany })
    setScoreHistory(scores)
  }

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
    loadProfile()
    loadStats()
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

  const handleUpdateProfile = async () => {
    if (!name.trim()) return
    setUpdatingProfile(true)
    try {
      await supabase.auth.updateUser({ data: { full_name: name.trim(), target_industry: targetIndustry } })
      await supabase.from("profiles").upsert({
        id: user.id, display_name: name.trim(), phone,
        linkedin_url: linkedin, github_url: github,
        portfolio_url: portfolio, target_industry: targetIndustry,
        target_companies: targetCompanies, updated_at: new Date().toISOString()
      }, { onConflict: "id" })
      showToast("Profile saved.")
      setEditingProfile(false)
    } catch (err) {
      showToast(err.message, "error")
    } finally {
      setUpdatingProfile(false)
    }
  }

  const handleUploadResume = async (file) => {
    if (!file || file.type !== "application/pdf") return showToast("PDF only.", "error")
    setUploadingResume(true)
    try {
      const filePath = `${user.id}/${Date.now()}.pdf`
      const { error: upErr } = await supabase.storage.from("resumes").upload(filePath, file, { upsert: true })
      if (upErr) throw upErr
      const { data: { publicUrl } } = supabase.storage.from("resumes").getPublicUrl(filePath)
      await supabase.auth.updateUser({ data: { default_resume_url: publicUrl, default_resume_path: filePath, default_resume_name: file.name } })
      setResumeUrl(publicUrl)
      setResumeName(file.name)
      showToast("Resume uploaded.")
    } catch (err) {
      showToast(err.message, "error")
    } finally {
      setUploadingResume(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleRemoveResume = async () => {
    setRemovingResume(true)
    try {
      const path = user?.user_metadata?.default_resume_path
      if (path) await supabase.storage.from("resumes").remove([path])
      await supabase.auth.updateUser({ data: { default_resume_url: null, default_resume_path: null, default_resume_name: null } })
      setResumeUrl(""); setResumeName("")
      showToast("Resume removed.")
    } catch {
      showToast("Failed to remove.", "error")
    } finally {
      setRemovingResume(false) }
  }

  // eslint-disable-next-line no-unused-vars
  const addCompany = () => {
    const v = companyInput.trim()
    if (!v || targetCompanies.includes(v)) return
    setTargetCompanies(p => [...p, v])
    setCompanyInput("")
  }

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

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") return
    setDeletingAccount(true)
    try {
      await supabase.from("applications").delete().eq("user_id", user.id)
      await supabase.from("analyses").delete().eq("user_id", user.id)
      await supabase.from("profiles").delete().eq("id", user.id)
      const path = user?.user_metadata?.default_resume_path
      if (path) await supabase.storage.from("resumes").remove([path])
      const { error } = await supabase.rpc("delete_user")
      if (error) throw error
      await supabase.auth.signOut()
      navigate("/")
    } catch {
      showToast("Delete failed. Contact support.", "error")
      setDeletingAccount(false)
    }
  }

  const profileFields = [name, phone, linkedin, github, portfolio]
  const profilePct = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100)

  const appFunnel = APP_STATUSES.map(s => ({
    status: s,
    count: applications.filter(a => a.status === s).length,
    ...statusMeta[s]
  }))

  return (
    <AppLayout activeId="profile">
      <AnimatePresence>
        {toast && <Toast message={toast.text} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <div className="container" style={{ display: "flex", flexDirection: "column", flex: 1, paddingBottom: 64 }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={spring}
          style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: "clamp(22px,4vw,30px)", fontWeight: 800, letterSpacing: "-0.8px", marginBottom: 4 }}>{name ? name : "My Profile"}</h1>
          <p style={{ color: "var(--text-3)", fontSize: 14 }}>Manage your profile, resume and job applications</p>
        </motion.div>

        {/* Stats row */}
        {stats && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.04 }}
            className="profile-stats"
            style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20 }}>
            {[
              { label: "Analyses", value: stats.total },
              { label: "Avg Score", value: stats.avg ? `${stats.avg}%` : "—" },
              { label: "Best Score", value: stats.best ? `${stats.best}%` : "—" },
              { label: "Top Company", value: stats.topCompany },
            ].map(s => (
              <div key={s.label} className="ek-card" style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: "var(--r-lg)", padding: "16px 18px"
              }}>
                <p style={{ fontSize: 10.5, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 7 }}>{s.label}</p>
                {s.label === "Top Company" && s.value ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CompanyLogo name={s.value} size={24} />
                    <p style={{ fontSize: "clamp(18px,3vw,24px)", fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.04em", lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.value}</p>
                  </div>
                ) : (
                  <p style={{ fontSize: "clamp(18px,3vw,24px)", fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.04em", lineHeight: 1 }}>{s.value ?? "—"}</p>
                )}
              </div>
            ))}
          </motion.div>
        )}

        {/* Score trend */}
        {scoreHistory.length > 1 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.06 }}
            className="ek-card"
            style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: "var(--r-xl)", padding: "18px 22px", marginBottom: 20,
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap"
            }}>
            <div>
              <p style={{ fontSize: 10.5, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Score Trend</p>
              <p style={{ fontSize: 13, color: "var(--text-2)" }}>Last {Math.min(scoreHistory.length, 8)} analyses</p>
            </div>
            <ScoreSparkline scores={scoreHistory} />
          </motion.div>
        )}

        {/* Main grid: profile + resume */}
        <div className="profile-main-grid" style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 16, marginBottom: 16, alignItems: "start" }}>

          {/* LEFT: Profile card and Target Companies */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.08 }}
              className="ek-card"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", overflow: "hidden" }}>

            {/* Avatar header */}
            <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: "50%", background: "var(--accent)",
                  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, fontWeight: 800, flexShrink: 0, letterSpacing: "-0.5px"
                }}>
                  {initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 15, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name || "Your Name"}</p>
                  <p style={{ fontSize: 12, color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>{user?.email}</p>
                </div>
                <button
                  onClick={() => setEditingProfile(p => !p)}
                  className="btn-ghost"
                  style={{ padding: "6px 14px", fontSize: 12, flexShrink: 0 }}
                >
                  {editingProfile ? "Cancel" : "Edit"}
                </button>
              </div>

              {/* Completeness bar */}
              <div style={{ marginTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)" }}>Profile complete</p>
                  <p style={{ fontSize: 11, fontWeight: 700, color: profilePct === 100 ? "var(--success)" : "var(--accent)" }}>{profilePct}%</p>
                </div>
                <div style={{ height: 5, background: "var(--bg)", borderRadius: 99, overflow: "hidden" }}>
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${profilePct}%` }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    style={{ height: "100%", background: profilePct === 100 ? "var(--success)" : "var(--accent)", borderRadius: 99 }}
                  />
                </div>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: "18px 22px 22px" }}>
              <AnimatePresence mode="wait">
                {editingProfile ? (
                  <motion.div key="edit" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={spring}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {[
                        { label: "Display Name", value: name, set: setName, placeholder: "Full name" },
                        { label: "Phone", value: phone, set: setPhone, placeholder: "+91 98765 43210" },
                        { label: "LinkedIn", value: linkedin, set: setLinkedin, placeholder: "linkedin.com/in/username" },
                        { label: "GitHub", value: github, set: setGithub, placeholder: "github.com/username" },
                        { label: "Portfolio", value: portfolio, set: setPortfolio, placeholder: "yoursite.com" },
                      ].map(f => (
                        <div key={f.label}>
                          <label style={{ display: "block", fontSize: 10.5, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>{f.label}</label>
                          <input className="input-ek" value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} />
                        </div>
                      ))}
                      <div>
                        <label style={{ display: "block", fontSize: 10.5, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>Industry</label>
                        <select className="input-ek" value={targetIndustry} onChange={e => setTargetIndustry(e.target.value)}>
                          {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                        </select>
                      </div>
                      <button
                        className="btn-accent"
                        onClick={handleUpdateProfile}
                        disabled={updatingProfile}
                        style={{ width: "100%", padding: "11px", marginTop: 4 }}
                      >
                        {updatingProfile ? "Saving…" : "Save Profile"}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="view" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={spring}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {[
                          { label: "Phone", value: phone || "—" },
                          { label: "Industry", value: targetIndustry },
                        ].map(f => (
                          <div key={f.label} style={{ background: "var(--bg)", borderRadius: "var(--r-md)", padding: "11px 13px", border: "1px solid var(--border)" }}>
                            <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>{f.label}</p>
                            <p style={{ fontSize: 12.5, color: "var(--text-1)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.value}</p>
                          </div>
                        ))}
                      </div>

                      {[
                        {
                          label: "LinkedIn", value: linkedin,
                          icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                        },
                        {
                          label: "GitHub", value: github,
                          icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
                        },
                        {
                          label: "Portfolio", value: portfolio,
                          icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
                        },
                      ].map(l => (
                        <div key={l.label} className={l.value ? "ek-card" : ""} style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "10px 13px", background: "var(--bg)",
                          borderRadius: "var(--r-md)", border: "1px solid var(--border)"
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                            <span style={{ color: l.value ? "var(--accent)" : "var(--text-3)", display: "flex" }}>{l.icon}</span>
                            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-2)" }}>{l.label}</span>
                          </div>
                          {l.value ? (
                            <a
                              href={l.value.startsWith("http") ? l.value : `https://${l.value}`}
                              target="_blank" rel="noreferrer"
                              style={{
                                fontSize: 11.5, fontWeight: 700, color: "var(--accent)",
                                textDecoration: "none", background: "var(--accent-soft)",
                                padding: "3px 10px", borderRadius: 99,
                                border: "1px solid var(--accent-mid)"
                              }}
                              onClick={e => e.stopPropagation()}
                            >
                              Open ↗
                            </a>
                          ) : (
                            <span style={{ fontSize: 11.5, color: "var(--text-3)" }}>Not added</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          </div>

          {/* RIGHT: Resume */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>

            {/* Resume card */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.1 }}
              style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", overflow: "hidden" }}>
              <div style={{ padding: "22px 22px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)" }}>{name ? `${name.split(' ')[0]}'s Resume` : "Your Resume"}</h2>
                </div>
                {resumeUrl && (
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <a href={resumeUrl} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: "6px 14px", fontSize: 12 }}>View</a>
                    <button onClick={handleRemoveResume} disabled={removingResume}
                      className="btn-ghost" style={{ padding: "6px 14px", fontSize: 12, color: "var(--danger)" }}>
                      {removingResume ? "…" : "Remove"}
                    </button>
                  </div>
                )}
              </div>
              <div style={{ padding: "18px 22px" }}>
                <input type="file" accept=".pdf" ref={fileInputRef} style={{ display: "none" }} id="resume-upload" onChange={e => handleUploadResume(e.target.files[0])} />
                {resumeUrl ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <iframe src={`https://docs.google.com/gview?url=${encodeURIComponent(resumeUrl)}&embedded=true`} style={{ width: "100%", height: 313, border: "none", borderRadius: "var(--r-md)", background: "#f8f8f8" }} title="Resume" />
                    <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
                      <label htmlFor="resume-upload" className="btn-secondary" style={{ cursor: "pointer", padding: "8px 24px", fontSize: 13, borderRadius: 99 }}>
                        Replace Resume
                      </label>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="resume-upload"
                    onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => { e.preventDefault(); setDragOver(false); handleUploadResume(e.dataTransfer.files[0]) }}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center",
                      justifyContent: "center", gap: 12, padding: "40px 24px",
                      borderRadius: "var(--r-lg)",
                      border: `2px dashed ${dragOver ? "var(--accent)" : "var(--border-2)"}`,
                      background: dragOver ? "var(--accent-soft)" : "var(--bg)",
                      cursor: "pointer", textAlign: "center", transition: "all 0.2s"
                    }}
                  >
                    <div style={{ width: 44, height: 44, background: "var(--accent-soft)", borderRadius: "var(--r-md)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", border: "1px solid var(--accent-mid)" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", marginBottom: 4 }}>Drop your resume here</p>
                      <p style={{ fontSize: 12.5, color: "var(--text-3)" }}>PDF only · max 5MB</p>
                    </div>
                    <span className="btn-secondary" style={{ padding: "8px 18px", fontSize: 13 }}>Choose File</span>
                  </label>
                )}
              </div>
            </motion.div>

          </div>
        </div>


        {/* Application Tracker */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.14 }}
          style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", marginBottom: 16 }}>
          <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>Application Tracker</h2>
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
              <div style={{ textAlign: "center", padding: "32px 0", border: "1.5px dashed var(--border-2)", borderRadius: "var(--r-lg)" }}>
                <div style={{ width: 40, height: 40, background: "var(--accent-soft)", borderRadius: "var(--r-md)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "var(--accent)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", marginBottom: 4 }}>No applications tracked yet</p>
                <p style={{ fontSize: 12.5, color: "var(--text-3)" }}>Add your first application above to start tracking</p>
              </div>
            ) : (
              <div>
                <div className="custom-scrollbar" style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 580, overflowY: "auto", overflowX: "hidden", paddingRight: 4 }}>
                {applications.map((app, idx) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ scale: 1.015, y: -2, transition: { type: "spring", stiffness: 400, damping: 25 } }}
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
                          cursor: "pointer",
                          background: statusMeta[app.status]?.bg || "var(--bg)",
                          color: statusMeta[app.status]?.color || "var(--text-2)",
                          outline: "none", appearance: "none",
                          fontFamily: "inherit", textAlign: "center",
                          height: 26
                        }}
                      >
                        {APP_STATUSES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>

                    {/* Date */}
                    <div className="app-date" style={{ fontSize: 12.5, color: "var(--text-3)", whiteSpace: "nowrap" }}>
                      {new Date(app.applied_date || app.created_at).toLocaleDateString("en-US", { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>

                    {/* Actions */}
                    <div className="app-menu-container" style={{ position: "relative" }}>
                      <button
                        className="app-delete-btn"
                        onClick={() => setActiveMenuId(activeMenuId === app.id ? null : app.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-1)", padding: "4px", transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: "50%" }}
                        onMouseEnter={e => e.currentTarget.style.color = "var(--accent)"}
                        onMouseLeave={e => e.currentTarget.style.color = "var(--text-1)"}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="2"/><circle cx="12" cy="5" r="2"/><circle cx="12" cy="19" r="2"/></svg>
                      </button>

                      <AnimatePresence>
                        {activeMenuId === app.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.1 }}
                            style={{
                              position: "absolute", top: "100%", right: 0, marginTop: 4,
                              background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--r-md)",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 10, width: 180, overflow: "hidden"
                            }}
                          >
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                deleteApp(app.id);
                              }}
                              style={{
                                width: "100%", padding: "12px 16px", textAlign: "left", background: "none", border: "none",
                                fontSize: 13, fontWeight: 500, color: "var(--danger)", cursor: "pointer", fontFamily: "inherit"
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = "var(--danger-bg)"}
                              onMouseLeave={e => e.currentTarget.style.background = "none"}
                            >
                              Withdraw Application
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

        {/* Account */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.16 }}
          style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", overflow: "hidden" }}>
          <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-2)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>Account Settings</h2>
          </div>
          <div style={{ padding: "18px 22px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              
              {/* Row 1: Security */}
              <div className="account-setting-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "16px 0", borderBottom: "1px solid var(--border-2)" }}>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", marginBottom: 4 }}>Password & Security</h3>
                  <p style={{ fontSize: 12.5, color: "var(--text-3)", lineHeight: 1.4 }}>Update your password to keep your account secure.</p>
                </div>
                <button className="btn-secondary" onClick={() => navigate("/forgot-password")} style={{ padding: "8px 16px", fontSize: 13, background: "var(--surface)", flexShrink: 0 }}>Change Password</button>
              </div>

              {/* Row 2: Session */}
              <div className="account-setting-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "16px 0", borderBottom: "1px solid var(--border-2)" }}>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", marginBottom: 4 }}>Active Session</h3>
                  <p style={{ fontSize: 12.5, color: "var(--text-3)", lineHeight: 1.4 }}>Log out of this device. You will need to sign in again.</p>
                </div>
                <button onClick={async () => { await supabase.auth.signOut(); navigate("/") }} className="btn-secondary" style={{ padding: "8px 16px", fontSize: 13, background: "var(--surface)", flexShrink: 0 }}>Sign Out</button>
              </div>

              {/* Row 3: Danger Zone */}
              <div style={{ padding: "16px 0" }}>
                <div className="account-setting-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--danger)", marginBottom: 4 }}>Danger Zone</h3>
                    <p style={{ fontSize: 12.5, color: "var(--danger)", opacity: 0.8, lineHeight: 1.4 }}>Permanently delete your account and all data.</p>
                  </div>
                  <button onClick={() => setShowDeleteZone(p => !p)} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, padding: "8px 16px", background: "var(--danger-bg)", color: "var(--danger)", border: "1px solid var(--danger-bd)", borderRadius: 99, cursor: "pointer", fontWeight: 700, fontFamily: "inherit", flexShrink: 0 }}>
                    {showDeleteZone ? "Cancel" : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        Delete Account
                      </>
                    )}
                  </button>
                </div>

                <AnimatePresence>
                  {showDeleteZone && (
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      style={{
                        position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
                        background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex",
                        alignItems: "center", justifyContent: "center", padding: 20
                      }}
                      onClick={() => setShowDeleteZone(false)}
                    >
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                        onClick={e => e.stopPropagation()}
                        style={{
                          background: "#fff", borderRadius: "var(--r-xl)", padding: 24, width: "100%", maxWidth: 400,
                          boxShadow: "0 10px 40px rgba(0,0,0,0.2)"
                        }}
                      >
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--danger)", marginBottom: 8 }}>Delete Account?</h3>
                        <p style={{ fontSize: 13.5, color: "var(--text-2)", marginBottom: 20, lineHeight: 1.6 }}>
                          This permanently deletes all your analyses, applications, and resume. Type <strong>DELETE</strong> to confirm.
                        </p>
                        <input className="input-ek" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder="Type DELETE" style={{ width: "100%", borderColor: "var(--danger-bd)", background: "#fafafa", marginBottom: 16 }} />
                        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                          <button
                            onClick={() => setShowDeleteZone(false)}
                            style={{ padding: "10px 18px", background: "var(--surface)", color: "var(--text-2)", border: "1px solid var(--border)", borderRadius: 99, cursor: "pointer", fontSize: 13, fontWeight: 700 }}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleDeleteAccount}
                            disabled={deleteConfirm !== "DELETE" || deletingAccount}
                            style={{
                              padding: "10px 18px", background: "var(--danger)", color: "#fff",
                              border: "none", borderRadius: 99, cursor: deleteConfirm !== "DELETE" ? "not-allowed" : "pointer",
                              fontSize: 13, fontWeight: 700, fontFamily: "inherit",
                              opacity: deleteConfirm !== "DELETE" ? 0.4 : 1
                            }}
                          >
                            {deletingAccount ? "Deleting…" : "Confirm Delete"}
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  )
}