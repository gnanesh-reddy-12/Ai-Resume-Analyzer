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
      <div className="container" style={{ paddingTop: "clamp(24px,5vw,40px)", paddingBottom: 80, maxWidth: 900 }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={spring} style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, marginBottom: 2 }}>My Profile</h1>
          <p style={{ color: "var(--text-3)", fontSize: "var(--text-sm)" }}>Manage your profile, resume and applications</p>
        </motion.div>

        {/* Notification */}
        <AnimatePresence>
          {message.text && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              style={{ marginBottom: 16, overflow: "hidden" }}>
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, fontSize: "var(--text-sm)", color: message.type === "success" ? "var(--success)" : "var(--danger)" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: message.type === "success" ? "var(--success)" : "var(--danger)", flexShrink: 0 }} />
                {message.text}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Row */}
        {stats && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={spring}
            className="profile-stats"
            style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20 }}>
            <StatCard label="Analyses" value={stats.total} />
            <StatCard label="Avg Score" value={stats.avg || "—"} sub="out of 100" />
            <StatCard label="Best Score" value={stats.best || "—"} />
            <StatCard label="Top Company" value={stats.topCompany} />
          </motion.div>
        )}

        {/* Main: Profile + Resume side by side */}
        <div className="profile-main-grid" style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 16, marginBottom: 16, alignItems: "start" }}>

          {/* LEFT: Profile */}
          <SectionCard style={{ alignSelf: "start" }}>
            {/* Avatar + name + edit button */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, padding: "12px 14px", background: "var(--bg)", borderRadius: "var(--r-md)", boxShadow: "0 0 0 1px var(--border) inset" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", fontWeight: 700, flexShrink: 0 }}>
                {initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--text-1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name || "Your Name"}</p>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--text-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.email}</p>
              </div>
              <button className="btn-ek btn-secondary" onClick={() => setEditingProfile(p => !p)}
                style={{ padding: "5px 12px", fontSize: "var(--text-xs)", fontWeight: 600, flexShrink: 0 }}>
                {editingProfile ? "Cancel" : "Edit"}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {editingProfile ? (
                <motion.div key="edit" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={spring}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[
                      { label: "Display Name", value: name, set: setName, placeholder: "Full name" },
                      { label: "Phone", value: phone, set: setPhone, placeholder: "+91 98765 43210" },
                      { label: "LinkedIn", value: linkedin, set: setLinkedin, placeholder: "linkedin.com/in/username" },
                      { label: "GitHub", value: github, set: setGithub, placeholder: "github.com/username" },
                      { label: "Portfolio", value: portfolio, set: setPortfolio, placeholder: "yoursite.com" },
                    ].map(f => (
                      <div key={f.label}>
                        <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>{f.label}</label>
                        <input className="input-ek" value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} style={{ padding: "9px 12px" }} />
                      </div>
                    ))}
                    <div>
                      <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>Industry</label>
                      <select className="input-ek" value={targetIndustry} onChange={e => setTargetIndustry(e.target.value)}
                        style={{ padding: "9px 12px", appearance: "none", backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='none' stroke='%234A3E39' stroke-width='2' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/></svg>")`, backgroundPosition: "right 12px center", backgroundSize: "14px", backgroundRepeat: "no-repeat", paddingRight: 36 }}>
                        {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                      </select>
                    </div>
                    <button className="btn-ek btn-accent" onClick={() => { handleUpdateProfile(); setEditingProfile(false) }}
                      disabled={updatingProfile} style={{ width: "100%", padding: "10px", marginTop: 4 }}>
                      {updatingProfile ? "Saving…" : "Save Profile"}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="view" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={spring}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {[
                        { label: "Phone", value: phone || "—" },
                        { label: "Industry", value: targetIndustry },
                      ].map(f => (
                        <div key={f.label} style={{ background: "var(--bg)", borderRadius: "var(--r-sm)", padding: "10px 12px", boxShadow: "0 0 0 1px var(--border) inset" }}>
                          <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>{f.label}</p>
                          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-1)", fontWeight: 600 }}>{f.value}</p>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {[
                        { label: "LinkedIn", value: linkedin, icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg> },
                        { label: "GitHub", value: github, icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg> },
                        { label: "Portfolio", value: portfolio, icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> },
                      ].map(l => (
                        <div key={l.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", background: "var(--bg)", borderRadius: "var(--r-sm)", boxShadow: "0 0 0 1px var(--border) inset" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ color: l.value ? "var(--accent)" : "var(--text-3)", display: "flex" }}>{l.icon}</span>
                            <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-2)" }}>{l.label}</span>
                          </div>
                          {l.value ? (
                            <a href={l.value.startsWith("http") ? l.value : `https://${l.value}`} target="_blank" rel="noreferrer"
                              style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textDecoration: "none", background: "var(--accent-soft)", padding: "3px 8px", borderRadius: 99 }}>
                              Open ↗
                            </a>
                          ) : (
                            <span style={{ fontSize: 11, color: "var(--text-3)" }}>Not added</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Completeness */}
                    {(() => {
                      const fields = [name, phone, linkedin, github, portfolio]
                      const pct = Math.round((fields.filter(Boolean).length / fields.length) * 100)
                      return (
                        <div style={{ background: "var(--bg)", borderRadius: "var(--r-sm)", padding: "10px 12px", boxShadow: "0 0 0 1px var(--border) inset" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Profile Complete</p>
                            <p style={{ fontSize: 10, fontWeight: 700, color: pct === 100 ? "var(--success)" : "var(--accent)" }}>{pct}%</p>
                          </div>
                          <div style={{ height: 4, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
                              style={{ height: "100%", background: pct === 100 ? "var(--success)" : "var(--accent)", borderRadius: 99 }} />
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </SectionCard>

          {/* RIGHT: Resume + Target Companies stacked */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <SectionCard title="Master Resume" icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}>
              <input type="file" accept=".pdf" ref={fileInputRef} style={{ display: "none" }} id="resume-upload" onChange={e => handleUploadResume(e.target.files[0])} />
              {resumeUrl ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--accent-soft)", borderRadius: "var(--r-md)", boxShadow: "0 0 0 1px var(--border) inset" }}>
                    <div style={{ width: 28, height: 28, background: "var(--surface)", borderRadius: "var(--r-sm)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", flexShrink: 0 }}>
                      <span style={{ fontSize: 8, fontWeight: 800, color: "var(--danger)" }}>PDF</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{resumeName}</p>
                      <p style={{ fontSize: 10, color: "var(--text-3)" }}>Stored in Supabase</p>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <a href={resumeUrl} target="_blank" rel="noreferrer" className="btn-ek btn-secondary" style={{ padding: "4px 10px", fontSize: 11 }}>View</a>
                      <button onClick={handleRemoveResume} disabled={removingResume}
                        style={{ padding: "4px 10px", fontSize: 11, background: "transparent", color: "var(--danger)", border: "none", cursor: "pointer", fontWeight: 600 }}>
                        {removingResume ? "…" : "Remove"}
                      </button>
                    </div>
                  </div>
                  <iframe src={`${resumeUrl}#toolbar=0&navpanes=0`} style={{ width: "100%", height: 300, border: "none", borderRadius: "var(--r-md)", background: "#fff" }} title="Resume" />
                  <label htmlFor="resume-upload" className="btn-ek btn-secondary" style={{ textAlign: "center", cursor: "pointer", padding: "8px", fontSize: "var(--text-xs)" }}>Replace Resume</label>
                </div>
              ) : (
                <label htmlFor="resume-upload"
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); handleUploadResume(e.dataTransfer.files[0]) }}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: "40px 24px", borderRadius: "var(--r-md)", border: `2px dashed ${dragOver ? "var(--accent)" : "var(--border)"}`, background: dragOver ? "var(--accent-soft)" : "var(--bg)", cursor: "pointer", textAlign: "center", transition: "all 0.2s" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <div>
                    <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-1)", marginBottom: 2 }}>Drop your resume here</p>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--text-3)" }}>PDF only · max 5MB</p>
                  </div>
                  <span className="btn-ek btn-secondary" style={{ padding: "6px 14px", fontSize: "var(--text-xs)" }}>Choose File</span>
                </label>
              )}
            </SectionCard>

            <SectionCard title="Target Companies" icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>}>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <input className="input-ek" value={companyInput} onChange={e => setCompanyInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addCompany()} placeholder="e.g. Google, Microsoft"
                  style={{ flex: 1, padding: "9px 12px" }} />
                <button className="btn-ek btn-accent" onClick={addCompany} style={{ padding: "8px 14px", flexShrink: 0, fontSize: "var(--text-xs)" }}>Add</button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {targetCompanies.length === 0
                  ? <p style={{ fontSize: "var(--text-xs)", color: "var(--text-3)" }}>No target companies added yet.</p>
                  : targetCompanies.map((c, i) => (
                    <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "var(--accent-soft)", color: "var(--accent)", fontSize: "var(--text-xs)", fontWeight: 600, padding: "4px 10px", borderRadius: 99, boxShadow: "0 0 0 1px var(--border) inset" }}>
                      {c}
                      <button onClick={() => setTargetCompanies(p => p.filter((_, j) => j !== i))}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", lineHeight: 1, padding: 0, fontSize: 13 }}>×</button>
                    </span>
                  ))}
              </div>
            </SectionCard>
          </div>
        </div>

        {/* Application Tracker */}
        <SectionCard title="Application Tracker" icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>}
          style={{ marginBottom: 16 }}>
          <div className="app-tracker-form" style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto auto", gap: 10, marginBottom: 16, alignItems: "end" }}>
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>Company</label>
              <input className="input-ek" value={newApp.company} onChange={e => setNewApp(p => ({ ...p, company: e.target.value }))} placeholder="Google" style={{ padding: "9px 12px" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>Role</label>
              <input className="input-ek" value={newApp.role} onChange={e => setNewApp(p => ({ ...p, role: e.target.value }))} placeholder="Software Engineer" style={{ padding: "9px 12px" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>Status</label>
              <select className="input-ek" value={newApp.status} onChange={e => setNewApp(p => ({ ...p, status: e.target.value }))} style={{ width: 110, padding: "9px 12px" }}>
                {APP_STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <button className="btn-ek btn-accent" onClick={addApplication} disabled={addingApp} style={{ padding: "9px 16px", alignSelf: "end", fontSize: "var(--text-xs)" }}>
              {addingApp ? "…" : "Add"}
            </button>
          </div>

          {applications.length === 0 ? (
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-3)", textAlign: "center", padding: "20px 0" }}>No applications tracked yet.</p>
          ) : (
            <div style={{ borderRadius: "var(--r-md)", overflow: "hidden", boxShadow: "0 0 0 1px var(--border) inset" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto auto auto", gap: 12, padding: "8px 14px", background: "var(--bg)" }}>
                {["Company", "Role", "Date", "Status", ""].map(h => (
                  <p key={h} style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</p>
                ))}
              </div>
              {applications.map(app => (
                <div key={app.id} className="app-table-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto auto auto", gap: 12, padding: "10px 14px", background: "var(--surface)", alignItems: "center", borderTop: "1px solid var(--border)" }}>
                  <p style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-1)" }}>{app.company}</p>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--text-2)" }}>{app.role}</p>
                  <p className="app-date" style={{ fontSize: "var(--text-xs)", color: "var(--text-3)", whiteSpace: "nowrap" }}>{new Date(app.applied_date || app.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                  <select value={app.status} onChange={e => updateAppStatus(app.id, e.target.value)}
                    style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 99, border: "none", cursor: "pointer", background: statusBg(app.status), color: statusColor(app.status), outline: "none", appearance: "none", textAlign: "center" }}>
                    {APP_STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                  <button onClick={() => deleteApp(app.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", fontSize: 16, lineHeight: 1, padding: "2px 4px" }}>×</button>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Account */}
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
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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
                    style={{ overflow: "hidden", marginTop: 16 }}>
                    <div style={{ background: "var(--danger-bg)", border: "1px solid var(--danger-bd)", borderRadius: "var(--r-md)", padding: "14px 16px" }}>
                      <p style={{ fontSize: "var(--text-xs)", color: "var(--danger)", fontWeight: 600, marginBottom: 10, lineHeight: 1.6 }}>
                        This deletes everything — analyses, applications, resume. Type <strong>DELETE</strong> to confirm.
                      </p>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input className="input-ek" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder="Type DELETE" style={{ flex: 1 }} />
                        <button className="btn-ek" onClick={handleDeleteAccount} disabled={deleteConfirm !== "DELETE" || deletingAccount}
                          style={{ padding: "8px 14px", background: "var(--danger)", color: "#fff", border: "none", opacity: deleteConfirm !== "DELETE" ? 0.4 : 1, cursor: deleteConfirm !== "DELETE" ? "not-allowed" : "pointer", fontSize: "var(--text-xs)", fontWeight: 600 }}>
                          {deletingAccount ? "Deleting…" : "Confirm"}
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