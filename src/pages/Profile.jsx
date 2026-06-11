import { useState, useRef, useEffect } from "react"
import { useAuth } from "../context/useAuth"
import { supabase } from "../supabase"
import { motion, AnimatePresence } from "framer-motion"
import Navbar from "../components/Navbar"

const spring = { type: "spring", stiffness: 400, damping: 30 }

export default function Profile() {
  const { user } = useAuth()
  const [name, setName] = useState(localStorage.getItem("display_name") || user?.user_metadata?.full_name || "")
  const [targetIndustry, setTargetIndustry] = useState(user?.user_metadata?.target_industry || "Software Development")
  const [updatingProfile, setUpdatingProfile] = useState(false)
  
  const [uploadingResume, setUploadingResume] = useState(false)
  const [removingResume, setRemovingResume] = useState(false)
  const [resumeUrl, setResumeUrl] = useState(user?.user_metadata?.default_resume_url || "")
  const [resumeName, setResumeName] = useState(user?.user_metadata?.default_resume_name || "")
  
  const [message, setMessage] = useState({ text: "", type: "" }) // type: 'success' | 'error'
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: "", type: "" }), 4000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const handleUpdateProfile = async () => {
    if (!name.trim()) return
    setUpdatingProfile(true)
    setMessage({ text: "", type: "" })
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: { 
          full_name: name.trim(),
          target_industry: targetIndustry
        }
      })
      if (error) throw error
      
      localStorage.setItem("display_name", name.trim())
      setMessage({ text: "Profile updated successfully.", type: "success" })
    } catch (err) {
      setMessage({ text: err.message, type: "error" })
    } finally {
      setUpdatingProfile(false)
    }
  }

  const handleUploadResume = async (file) => {
    if (!file) return
    if (file.type !== "application/pdf") {
      setMessage({ text: "Only PDF files are allowed.", type: "error" })
      return
    }
    
    setUploadingResume(true)
    setMessage({ text: "", type: "" })
    
    try {
      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from("resumes")
        .getPublicUrl(filePath)

      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          default_resume_url: publicUrl, 
          default_resume_path: filePath,
          default_resume_name: file.name
        }
      })

      if (updateError) throw updateError

      setResumeUrl(publicUrl)
      setResumeName(file.name)
      setMessage({ text: "Resume saved securely.", type: "success" })
    } catch (err) {
      if (err.message.includes("row-level security")) {
         setMessage({ text: "Upload blocked: Missing Supabase policy.", type: "error" })
      } else {
         setMessage({ text: err.message, type: "error" })
      }
    } finally {
      setUploadingResume(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleRemoveResume = async () => {
    setRemovingResume(true)
    setMessage({ text: "", type: "" })
    try {
      const filePath = user?.user_metadata?.default_resume_path
      if (filePath) {
        await supabase.storage.from("resumes").remove([filePath])
      }
      
      const { error } = await supabase.auth.updateUser({
        data: { default_resume_url: null, default_resume_path: null, default_resume_name: null }
      })
      if (error) throw error

      setResumeUrl("")
      setResumeName("")
      setMessage({ text: "Resume removed.", type: "success" })
    } catch (err) {
      setMessage({ text: "Failed to remove resume.", type: "error" })
    } finally {
      setRemovingResume(false)
    }
  }

  // Initials for avatar
  const initials = name
    ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() || "U"

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <div className="container" style={{ paddingTop: "clamp(32px, 6vw, 48px)", paddingBottom: 80, maxWidth: 1100 }}>
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          style={{ marginBottom: 32 }}
        >
          <h1 style={{ fontSize: "var(--text-3xl)", marginBottom: 4, fontWeight: 700, color: "var(--text-1)" }}>My Profile</h1>
          <p style={{ color: "var(--text-3)", fontSize: "var(--text-base)", fontWeight: 500 }}>Manage your profile and master resume</p>
        </motion.div>

        {/* Global Notifications */}
        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={spring}
              style={{ overflow: "hidden" }}
            >
              <div style={{
                background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-md)",
                padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, fontSize: "var(--text-sm)", fontWeight: 500,
                color: message.type === "success" ? "var(--text-1)" : "var(--danger)"
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: message.type === "success" ? "var(--success)" : "var(--danger)" }} />
                {message.text}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          
          {/* Profile Details Card (Left: col-span-5) */}
          <div className="lg:col-span-5 flex flex-col">
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.05 }}
              className="ek-card flex-1"
              style={{ padding: "32px", display: "flex", flexDirection: "column" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <div style={{ width: 18, height: 18, color: "var(--accent)" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--text-1)" }}>Profile Details</h2>
              </div>

              {/* Avatar section */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
                <div style={{ position: "relative" }}>
                  <div style={{
                    width: 110, height: 110,
                    borderRadius: "50%",
                    background: "var(--accent)",
                    color: "#FAF7F2",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "2.25rem", fontWeight: 700,
                    boxShadow: "0 8px 24px -6px rgba(92, 62, 47, 0.3), 0 0 0 4px var(--surface)"
                  }}>
                    {initials}
                  </div>
                  <div style={{
                    position: "absolute", bottom: 0, right: 0,
                    width: 32, height: 32, borderRadius: "50%",
                    background: "var(--surface)", border: "1px solid var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--text-2)", boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 20, flex: 1 }}>
                <div>
                  <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Email Address</label>
                  <div className="input-ek" style={{ background: "var(--bg)", color: "var(--text-3)", cursor: "not-allowed", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    {user?.email}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Display Name</label>
                  <input
                    type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="Enter your name" className="input-ek"
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Target Industry / Focus</label>
                  <select
                    value={targetIndustry}
                    onChange={e => setTargetIndustry(e.target.value)}
                    className="input-ek"
                    style={{ appearance: "none", backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='none' stroke='%234A3E39' stroke-width='2' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'></path></svg>")`, backgroundPosition: "right 14px center", backgroundSize: "16px", backgroundRepeat: "no-repeat", paddingRight: "40px" }}
                  >
                    <option value="Software Development">Software Development</option>
                    <option value="Product Management">Product Management</option>
                    <option value="Design & UX">Design & UX</option>
                    <option value="Data Science & AI">Data Science & AI</option>
                    <option value="Marketing & Growth">Marketing & Growth</option>
                    <option value="Business & Finance">Business & Operations</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Full Stack Developer">Full Stack Developer</option>
                    <option value="Mobile App Developer">Mobile App Developer</option>
                    <option value="Embedded Systems Engineer">Embedded Systems Engineer</option>
                    <option value="QA / Software Tester">QA / Software Tester</option>
                    <option value="DevOps Engineer">DevOps Engineer</option>
                    <option value="Cloud Architect">Cloud Architect</option>
                    <option value="Site Reliability Engineer (SRE)">Site Reliability Engineer (SRE)</option>
                    <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
                    <option value="System Administrator">System Administrator</option>
                    <option value="Data Analyst">Data Analyst</option>
                    <option value="Business Analyst">Business Analyst</option>
                    <option value="Data Scientist">Data Scientist</option>
                    <option value="Data Engineer">Data Engineer</option>
                    <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                    <option value="AI Researcher">AI Researcher</option>
                    <option value="Product Manager">Product Manager</option>
                    <option value="Project Manager">Project Manager</option>
                    <option value="Scrum Master">Scrum Master</option>
                    <option value="Technical Program Manager">Technical Program Manager</option>
                    <option value="UI/UX Designer">UI/UX Designer</option>
                    <option value="Product Designer">Product Designer</option>
                    <option value="UX Researcher">UX Researcher</option>
                    <option value="Growth Hacker">Growth Hacker</option>
                    <option value="Digital Marketing Specialist">Digital Marketing Specialist</option>
                    <option value="SEO Specialist">SEO Specialist</option>
                    <option value="Product Marketing Manager">Product Marketing Manager</option>
                    <option value="Blockchain Developer">Blockchain Developer</option>
                    <option value="Game Developer">Game Developer</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: 32 }}>
                <button
                  className="btn-ek btn-accent"
                  onClick={handleUpdateProfile}
                  disabled={updatingProfile || !name.trim() || (name.trim() === user?.user_metadata?.full_name && targetIndustry === user?.user_metadata?.target_industry)}
                  style={{ width: "100%", padding: "12px", display: "flex", gap: 8, alignItems: "center", justifyContent: "center" }}
                >
                  {updatingProfile ? (
                    <>
                      <div className="spin" style={{ width: 16, height: 16, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%" }} />
                      <span>Saving Profile…</span>
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"></path></svg>
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </motion.section>
          </div>

          {/* Master Resume Hub Card (Right: col-span-7) */}
          <div className="lg:col-span-7 flex flex-col">
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.1 }}
              className="ek-card flex-1"
              style={{ padding: "32px", display: "flex", flexDirection: "column" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 18, height: 18, color: "var(--accent)" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  </div>
                  <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--text-1)" }}>Master Resume Hub</h2>
                </div>
                {resumeUrl && (
                  <label htmlFor="resume-upload" style={{ cursor: "pointer" }}>
                    <span className="btn-ek btn-secondary" style={{ padding: "6px 12px", fontSize: "var(--text-xs)", display: "inline-flex", gap: 6, alignItems: "center" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                      Upload New Resume
                    </span>
                  </label>
                )}
              </div>

              <input
                type="file" accept=".pdf,application/pdf" onChange={e => handleUploadResume(e.target.files[0])}
                ref={fileInputRef} style={{ display: "none" }} id="resume-upload"
              />

              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <AnimatePresence mode="wait">
                  {resumeUrl ? (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={spring}
                      style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%" }}
                    >
                      {/* Document Meta Row */}
                      <div className="ek-card-sm" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 16, background: "var(--accent-soft)" }}>
                        <div style={{ width: 36, height: 36, background: "#FAF7F2", borderRadius: "var(--r-sm)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--danger)", border: "1px solid var(--border)" }}>
                          <span style={{ fontSize: "10px", fontWeight: 800 }}>PDF</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-1)", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={resumeName}>
                            {resumeName || "My_Master_Resume.pdf"}
                          </p>
                          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-3)" }}>
                            Master file securely stored in Supabase
                          </p>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <a href={resumeUrl} target="_blank" rel="noreferrer" className="btn-ek btn-secondary" style={{ padding: "6px 10px", fontSize: "var(--text-xs)" }}>
                            View ↗
                          </a>
                          <button
                            className="btn-ek"
                            onClick={handleRemoveResume}
                            disabled={removingResume}
                            style={{ padding: "6px 10px", fontSize: "var(--text-xs)", background: "transparent", color: "var(--danger)", border: "none", cursor: "pointer" }}
                          >
                            {removingResume ? "Deleting…" : "Remove"}
                          </button>
                        </div>
                      </div>

                      {/* PDF Live Frame Preview */}
                      <div style={{ flex: 1, background: "#FAF7F2", borderRadius: "var(--r-md)", border: "1px solid var(--border)", overflow: "hidden", position: "relative", minHeight: 280 }}>
                        <iframe
                          src={`${resumeUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                          width="100%"
                          height="100%"
                          style={{ border: "none", minHeight: 280, height: "100%" }}
                          title="Resume PDF Preview"
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="uploader"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={spring}
                      style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "center" }}
                    >
                      <label
                        htmlFor="resume-upload"
                        style={{
                          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16,
                          padding: "60px 24px", borderRadius: "var(--r-md)",
                          background: dragOver ? "var(--surface-hover)" : "var(--bg)",
                          border: "2px dashed var(--border)",
                          color: "var(--text-2)", cursor: uploadingResume ? "not-allowed" : "pointer",
                          transition: "all 0.2s", textAlign: "center"
                        }}
                        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={e => {
                          e.preventDefault(); setDragOver(false)
                          if (e.dataTransfer.files[0]) handleUploadResume(e.dataTransfer.files[0])
                        }}
                      >
                        {uploadingResume ? (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                            <div className="spin" style={{ width: 28, height: 28, border: "3px solid var(--accent)", borderTopColor: "transparent", borderRadius: "50%" }} />
                            <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-1)" }}>Uploading your resume to Supabase…</span>
                          </div>
                        ) : (
                          <>
                            <div style={{ width: 48, height: 48, background: "var(--accent-soft)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                            </div>
                            <div>
                              <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-1)", marginBottom: 4 }}>Drag & drop your resume here</p>
                              <p style={{ fontSize: "var(--text-xs)", color: "var(--text-3)", marginBottom: 16 }}>PDF only, up to 5MB file sizes</p>
                              <span className="btn-ek btn-secondary" style={{ padding: "8px 16px" }}>Choose File</span>
                            </div>
                          </>
                        )}
                      </label>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.section>
          </div>
        </div>



      </div>
    </div>
  )
}
