import { useState, useRef, useEffect } from "react"
import { useAuth } from "../context/useAuth"
import { supabase } from "../supabase"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"

const spring = { type: "spring", stiffness: 400, damping: 30 }

const INDUSTRIES = ["Software Development","Product Management","Design & UX","Data Science & AI","Marketing & Growth","Business & Operations"]
const APP_STATUSES = ["Applied","Interview","Offer","Rejected"]



function StatCard({ label, value, sub }) {
  return (
    <div style={{ background: "var(--bg)", borderRadius: "var(--r-md)", padding: "16px 20px", boxShadow: "0 0 0 1px var(--border) inset" }}>
      <p style={{ fontSize: "var(--text-xs)", color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: "var(--text-2xl)", fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.03em", lineHeight: 1 }}>{value ?? "—"}</p>
      {sub && <p style={{ fontSize: "var(--text-xs)", color: "var(--text-3)", marginTop: 4 }}>{sub}</p>}
    </div>
  )
}

function SectionCard({ title, icon, children, style }) {
  return (
    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={spring}
      className="ek-card" style={{ padding: "24px 28px", ...style }}>
      {title && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          {icon && <span style={{ color: "var(--accent)", display: "flex" }}>{icon}</span>}
          <h2 style={{ fontSize: "var(--text-base)", fontWeight: 700, color: "var(--text-1)" }}>{title}</h2>
        </div>
      )}
      {children}
    </motion.section>
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

  const [resumeUrl, setResumeUrl] = useState(user?.user_metadata?.default_resume_url || "")
  const [resumeName, setResumeName] = useState(user?.user_metadata?.default_resume_name || "")
  const [uploadingResume, setUploadingResume] = useState(false)
  const [removingResume, setRemovingResume] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const [stats, setStats] = useState(null)
  const [applications, setApplications] = useState([])
  const [newApp, setNewApp] = useState({ company: "", role: "", status: "Applied" })
  const [addingApp, setAddingApp] = useState(false)

  const [message, setMessage] = useState({ text: "", type: "" })

  const [deleteConfirm, setDeleteConfirm] = useState("")
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [showDeleteZone, setShowDeleteZone] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)

  const initials = name
    ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() || "U"

  useEffect(() => {
    if (message.text) {
      const t = setTimeout(() => setMessage({ text: "", type: "" }), 3000)
      return () => clearTimeout(t)
    }
  }, [message])

  useEffect(() => {
    if (!user) return
    loadProfile()
    loadStats()
    loadApplications()
  }, [user])

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
    const { data } = await supabase.from("analyses").select("ats_score, company_name").eq("user_id", user.id)
    if (!data?.length) return setStats({ total: 0, avg: 0, best: 0, topCompany: "—" })
    const avg = Math.round(data.reduce((s, r) => s + (r.ats_score || 0), 0) / data.length)
    const best = Math.max(...data.map(r => r.ats_score || 0))
    const freq = {}
    data.forEach(r => r.company_name && (freq[r.company_name] = (freq[r.company_name] || 0) + 1))
    const topCompany = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || "—"
    setStats({ total: data.length, avg, best, topCompany })
  }

  const loadApplications = async () => {
    const { data } = await supabase.from("applications").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
    setApplications(data || [])
  }

  const handleUpdateProfile = async () => {
    if (!name.trim()) return
    setUpdatingProfile(true)
    try {
      await supabase.auth.updateUser({ data: { full_name: name.trim(), target_industry: targetIndustry } })
      await supabase.from("profiles").upsert({
        id: user.id, display_name: name.trim(), phone, linkedin_url: linkedin,
        github_url: github, portfolio_url: portfolio, target_industry: targetIndustry,
        target_companies: targetCompanies, updated_at: new Date().toISOString()
      }, { onConflict: "id" })
      setMessage({ text: "Profile saved.", type: "success" })
    } catch (err) {
      setMessage({ text: err.message, type: "error" })
    } finally {
      setUpdatingProfile(false)
    }
  }

  const handleUploadResume = async (file) => {
    if (!file || file.type !== "application/pdf") return setMessage({ text: "PDF only.", type: "error" })
    setUploadingResume(true)
    try {
      const filePath = `${user.id}/${Date.now()}.pdf`
      const { error: upErr } = await supabase.storage.from("resumes").upload(filePath, file, { upsert: true })
      if (upErr) throw upErr
      const { data: { publicUrl } } = supabase.storage.from("resumes").getPublicUrl(filePath)
      await supabase.auth.updateUser({ data: { default_resume_url: publicUrl, default_resume_path: filePath, default_resume_name: file.name } })
      setResumeUrl(publicUrl)
      setResumeName(file.name)
      setMessage({ text: "Resume uploaded.", type: "success" })
    } catch (err) {
      setMessage({ text: err.message, type: "error" })
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
      setMessage({ text: "Resume removed.", type: "success" })
    } catch { setMessage({ text: "Failed to remove.", type: "error" }) }
    finally { setRemovingResume(false) }
  }

  const addCompany = () => {
    const v = companyInput.trim()
    if (!v || targetCompanies.includes(v)) return
    setTargetCompanies(p => [...p, v])
    setCompanyInput("")
  }

  const addApplication = async () => {
    if (!newApp.company.trim() || !newApp.role.trim()) return
    setAddingApp(true)
    const { data, error } = await supabase.from("applications").insert({ ...newApp, user_id: user.id }).select().single()
    if (!error && data) setApplications(p => [data, ...p])
    setNewApp({ company: "", role: "", status: "Applied" })
    setAddingApp(false)
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
      setMessage({ text: "Delete failed. Contact support.", type: "error" })
      setDeletingAccount(false)
    }
  }

  const statusColor = s => ({ Applied: "var(--text-3)", Interview: "var(--warning)", Offer: "var(--success)", Rejected: "var(--danger)" }[s] || "var(--text-3)")
  const statusBg = s => ({ Applied: "var(--bg)", Interview: "var(--warning-bg)", Offer: "var(--success-bg)", Rejected: "var(--danger-bg)" }[s] || "var(--bg)")

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <div className="container" style={{ paddingTop: "clamp(32px,6vw,48px)", paddingBottom: 80, maxWidth: 1100 }}>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={spring} style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 700, marginBottom: 4 }}>My Profile</h1>
          <p style={{ color: "var(--text-3)", fontSize: "var(--text-sm)" }}>Manage your profile, resume, and applications</p>
        </motion.div>

        <AnimatePresence>
          {message.text && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              style={{ marginBottom: 20, overflow: "hidden" }}>
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, fontSize: "var(--text-sm)", color: message.type === "success" ? "var(--success)" : "var(--danger)" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: message.type === "success" ? "var(--success)" : "var(--danger)", flexShrink: 0 }} />
                {message.text}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Career Stats */}
        {stats && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={spring}
            className="profile-stats"
            style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>            <StatCard label="Total Analyses" value={stats.total} />
            <StatCard label="Avg ATS Score" value={stats.avg ? `${stats.avg}` : "—"} sub="out of 100" />
            <StatCard label="Best Score" value={stats.best || "—"} sub="personal best" />
            <StatCard label="Top Company" value={stats.topCompany} sub="most analyzed" />
          </motion.div>
        )}

        {/* Row 1: Identity + Resume */}
        <div className="profile-main-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20, alignItems: "start" }}>

          <SectionCard title="Profile Details" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} style={{ alignSelf: "start" }}>
            
            {/* Avatar row */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, padding: "14px 16px", background: "var(--bg)", borderRadius: "var(--r-md)", boxShadow: "0 0 0 1px var(--border) inset" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", fontWeight: 700, flexShrink: 0 }}>
                {initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: "var(--text-base)", color: "var(--text-1)" }}>{name || "Your Name"}</p>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--text-3)" }}>{user?.email}</p>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--text-3)", marginTop: 2 }}>{targetIndustry}</p>
              </div>
              <button className="btn-ek btn-secondary" onClick={() => setEditingProfile(p => !p)}
                style={{ padding: "6px 14px", fontSize: "var(--text-xs)", fontWeight: 600, flexShrink: 0 }}>
                {editingProfile ? "Cancel" : "Edit"}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {editingProfile ? (
                <motion.div key="edit" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={spring}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {[
                      { label: "Display Name", value: name, set: setName, placeholder: "Full name" },
                      { label: "Phone", value: phone, set: setPhone, placeholder: "+91 98765 43210" },
                      { label: "LinkedIn", value: linkedin, set: setLinkedin, placeholder: "linkedin.com/in/username" },
                      { label: "GitHub", value: github, set: setGithub, placeholder: "github.com/username" },
                      { label: "Portfolio", value: portfolio, set: setPortfolio, placeholder: "yoursite.com" },
                    ].map(f => (
                      <div key={f.label}>
                        <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>{f.label}</label>
                        <input className="input-ek" value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} />
                      </div>
                    ))}
                    <div>
                      <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Target Industry</label>
                      <select className="input-ek" value={targetIndustry} onChange={e => setTargetIndustry(e.target.value)}
                        style={{ appearance: "none", backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='none' stroke='%234A3E39' stroke-width='2' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/></svg>")`, backgroundPosition: "right 12px center", backgroundSize: "14px", backgroundRepeat: "no-repeat", paddingRight: 36 }}>
                        {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                      </select>
                    </div>
                    <button className="btn-ek btn-accent" onClick={() => { handleUpdateProfile(); setEditingProfile(false) }}
                      disabled={updatingProfile} style={{ width: "100%", padding: "11px" }}>
                      {updatingProfile ? "Saving…" : "Save Profile"}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="view" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={spring}>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {/* Info grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[
                      { label: "Phone", value: phone || "Not added" },
                      { label: "Industry", value: targetIndustry },
                    ].map(f => (
                      <div key={f.label} style={{ background: "var(--bg)", borderRadius: "var(--r-md)", padding: "12px 14px", boxShadow: "0 0 0 1px var(--border) inset" }}>
                        <p style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>{f.label}</p>
                        <p style={{ fontSize: "var(--text-sm)", color: f.value === "Not added" ? "var(--text-3)" : "var(--text-1)", fontWeight: 500 }}>{f.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Social links */}
                  <div>
                    <p style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Online Presence</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {[
                        { label: "LinkedIn", value: linkedin, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg> },
                        { label: "GitHub", value: github, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg> },
                        { label: "Portfolio", value: portfolio, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> },
                      ].map(l => (
                        <div key={l.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "var(--bg)", borderRadius: "var(--r-md)", boxShadow: "0 0 0 1px var(--border) inset" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ color: l.value ? "var(--accent)" : "var(--text-3)", display: "flex" }}>{l.icon}</span>
                            <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-2)" }}>{l.label}</span>
                          </div>
                          {l.value ? (
                            <a href={l.value.startsWith("http") ? l.value : `https://${l.value}`}
                              target="_blank" rel="noreferrer"
                              style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--accent)", textDecoration: "none", background: "var(--accent-soft)", padding: "4px 10px", borderRadius: 99, boxShadow: "0 0 0 1px var(--border) inset" }}>
                              Open ↗
                            </a>
                          ) : (
                            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-3)", fontStyle: "italic" }}>Not added</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Profile completion bar */}
                  {(() => {
                    const fields = [name, phone, linkedin, github, portfolio]
                    const filled = fields.filter(Boolean).length
                    const pct = Math.round((filled / fields.length) * 100)
                    return (
                      <div style={{ background: "var(--bg)", borderRadius: "var(--r-md)", padding: "12px 14px", boxShadow: "0 0 0 1px var(--border) inset" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <p style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Profile Completeness</p>
                          <p style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: pct === 100 ? "var(--success)" : "var(--accent)" }}>{pct}%</p>
                        </div>
                        <div style={{ height: 6, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
                            style={{ height: "100%", background: pct === 100 ? "var(--success)" : "var(--accent)", borderRadius: 99 }} />
                        </div>
                        {pct < 100 && <p style={{ fontSize: "var(--text-xs)", color: "var(--text-3)", marginTop: 6 }}>Click Edit to complete your profile</p>}
                      </div>
                    )
                  })()}

                </div>
              </motion.div>
              )}
            </AnimatePresence>
          </SectionCard>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <SectionCard title="Master Resume" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}>
              <input type="file" accept=".pdf" ref={fileInputRef} style={{ display: "none" }} id="resume-upload" onChange={e => handleUploadResume(e.target.files[0])} />
              {resumeUrl ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "var(--accent-soft)", borderRadius: "var(--r-md)", boxShadow: "0 0 0 1px var(--border) inset" }}>
                    <div style={{ width: 32, height: 32, background: "var(--surface)", borderRadius: "var(--r-sm)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", flexShrink: 0 }}>
                      <span style={{ fontSize: 9, fontWeight: 800, color: "var(--danger)" }}>PDF</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{resumeName}</p>
                      <p style={{ fontSize: "var(--text-xs)", color: "var(--text-3)" }}>Stored in Supabase</p>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <a href={resumeUrl} target="_blank" rel="noreferrer" className="btn-ek btn-secondary" style={{ padding: "5px 10px", fontSize: "var(--text-xs)" }}>View</a>
                      <button className="btn-ek" onClick={handleRemoveResume} disabled={removingResume}
                        style={{ padding: "5px 10px", fontSize: "var(--text-xs)", background: "transparent", color: "var(--danger)", border: "none", cursor: "pointer" }}>
                        {removingResume ? "…" : "Remove"}
                      </button>
                    </div>
                  </div>
                  <iframe src={`${resumeUrl}#toolbar=0&navpanes=0`} style={{ width: "100%", height: 320, border: "none", borderRadius: "var(--r-md)", background: "#fff" }} title="Resume Preview" />
                  <label htmlFor="resume-upload" className="btn-ek btn-secondary" style={{ textAlign: "center", cursor: "pointer", padding: "9px" }}>Replace Resume</label>
                </div>
              ) : (
                <label htmlFor="resume-upload" onDragOver={e => { e.preventDefault(); setDragOver(true) }} onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); handleUploadResume(e.dataTransfer.files[0]) }}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: "48px 24px", borderRadius: "var(--r-md)", border: `2px dashed ${dragOver ? "var(--accent)" : "var(--border)"}`, background: dragOver ? "var(--accent-soft)" : "var(--bg)", cursor: "pointer", textAlign: "center", transition: "all 0.2s" }}>
                  {uploadingResume ? <div className="spin" style={{ width: 24, height: 24, border: "2px solid var(--accent)", borderTopColor: "transparent", borderRadius: "50%" }} /> : (
                    <>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      <div>
                        <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-1)", marginBottom: 4 }}>Drop your resume here</p>
                        <p style={{ fontSize: "var(--text-xs)", color: "var(--text-3)" }}>PDF only · max 5MB</p>
                      </div>
                      <span className="btn-ek btn-secondary" style={{ padding: "7px 16px" }}>Choose File</span>
                    </>
                  )}
                </label>
              )}
            </SectionCard>

            <SectionCard title="Target Companies" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>}>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <input className="input-ek" value={companyInput} onChange={e => setCompanyInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addCompany()} placeholder="e.g. Google, Microsoft" style={{ flex: 1 }} />
                <button className="btn-ek btn-accent" onClick={addCompany} style={{ padding: "8px 14px", flexShrink: 0 }}>Add</button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {targetCompanies.length === 0 && <p style={{ fontSize: "var(--text-xs)", color: "var(--text-3)" }}>No target companies added yet.</p>}
                {targetCompanies.map((c, i) => (
                  <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--accent-soft)", color: "var(--accent)", fontSize: "var(--text-xs)", fontWeight: 600, padding: "5px 10px", borderRadius: 99, boxShadow: "0 0 0 1px var(--border) inset" }}>
                    {c}
                    <button onClick={() => setTargetCompanies(p => p.filter((_, j) => j !== i))}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", lineHeight: 1, padding: 0, fontSize: 14 }}>×</button>
                  </span>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>

        {/* Application Tracker */}
        <SectionCard title="Application Tracker" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>}
          style={{ marginBottom: 20 }}>
          <div className="app-tracker-form" style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto auto", gap: 10, marginBottom: 16, alignItems: "end" }}>
            <div>
              <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Company</label>
              <input className="input-ek" value={newApp.company} onChange={e => setNewApp(p => ({ ...p, company: e.target.value }))} placeholder="Google" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Role</label>
              <input className="input-ek" value={newApp.role} onChange={e => setNewApp(p => ({ ...p, role: e.target.value }))} placeholder="Software Engineer" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Status</label>
              <select className="input-ek" value={newApp.status} onChange={e => setNewApp(p => ({ ...p, status: e.target.value }))} style={{ width: 120 }}>
                {APP_STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <button className="btn-ek btn-accent" onClick={addApplication} disabled={addingApp} style={{ padding: "10px 18px", alignSelf: "end" }}>
              {addingApp ? "…" : "Add"}
            </button>
          </div>

          {applications.length === 0 ? (
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-3)", textAlign: "center", padding: "24px 0" }}>No applications tracked yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 1, borderRadius: "var(--r-md)", overflow: "hidden", boxShadow: "0 0 0 1px var(--border) inset" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto auto auto", gap: 12, padding: "10px 16px", background: "var(--bg)" }}>
                {["Company", "Role", "Date", "Status", ""].map(h => (
                  <p key={h} style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</p>
                ))}
              </div>
              {applications.map(app => (
                <div key={app.id} className="app-table-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto auto auto", gap: 12, padding: "12px 16px", background: "var(--surface)", alignItems: "center", borderTop: "1px solid var(--border)" }}>
                  <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-1)" }}>{app.company}</p>
                  <p style={{ fontSize: "var(--text-sm)", color: "var(--text-2)" }}>{app.role}</p>
                  <p className="app-date" style={{ fontSize: "var(--text-xs)", color: "var(--text-3)", whiteSpace: "nowrap" }}>{new Date(app.applied_date || app.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                  <select value={app.status} onChange={e => updateAppStatus(app.id, e.target.value)}
                    style={{ fontSize: "var(--text-xs)", fontWeight: 600, padding: "4px 8px", borderRadius: 99, border: "none", cursor: "pointer", background: statusBg(app.status), color: statusColor(app.status), outline: "none", appearance: "none", textAlign: "center" }}>
                    {APP_STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                  <button onClick={() => deleteApp(app.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", fontSize: 16, lineHeight: 1, padding: "2px 4px" }}>×</button>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Account Actions */}
        <SectionCard title="Account">
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn-ek btn-secondary" onClick={() => navigate("/forgot-password")} style={{ fontSize: "var(--text-sm)" }}>Change Password</button>
              <button className="btn-ek" onClick={async () => { await supabase.auth.signOut(); navigate("/") }}
                style={{ fontSize: "var(--text-sm)", background: "var(--danger-bg)", color: "var(--danger)", border: "1px solid var(--danger-bd)" }}>
                Sign Out
              </button>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: showDeleteZone ? 16 : 0 }}>
                <div>
                  <p style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--danger)" }}>Danger Zone</p>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--text-3)", marginTop: 2 }}>Permanently delete your account and all data</p>
                </div>
                <button className="btn-ek" onClick={() => setShowDeleteZone(p => !p)}
                  style={{ fontSize: "var(--text-xs)", background: "var(--danger-bg)", color: "var(--danger)", border: "1px solid var(--danger-bd)", padding: "6px 12px" }}>
                  {showDeleteZone ? "Cancel" : "Delete Account"}
                </button>
              </div>

              <AnimatePresence>
                {showDeleteZone && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    style={{ overflow: "hidden" }}>
                    <div style={{ background: "var(--danger-bg)", border: "1px solid var(--danger-bd)", borderRadius: "var(--r-md)", padding: "16px 20px" }}>
                      <p style={{ fontSize: "var(--text-xs)", color: "var(--danger)", fontWeight: 600, marginBottom: 12, lineHeight: 1.6 }}>
                        This will delete your profile, all analyses, applications, and resume. This cannot be undone.
                        Type <strong>DELETE</strong> to confirm.
                      </p>
                      <div style={{ display: "flex", gap: 10 }}>
                        <input className="input-ek" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)}
                          placeholder="Type DELETE to confirm" style={{ flex: 1, borderColor: "var(--danger-bd)" }} />
                        <button className="btn-ek" onClick={handleDeleteAccount}
                          disabled={deleteConfirm !== "DELETE" || deletingAccount}
                          style={{ padding: "8px 16px", background: "var(--danger)", color: "#fff", border: "none", opacity: deleteConfirm !== "DELETE" ? 0.4 : 1, cursor: deleteConfirm !== "DELETE" ? "not-allowed" : "pointer" }}>
                          {deletingAccount ? "Deleting…" : "Confirm Delete"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </SectionCard>

      </div>
    </div>
  )
}