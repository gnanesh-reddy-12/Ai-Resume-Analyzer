import { useState, useRef } from "react"
import { useAuth } from "../context/useAuth"
import { supabase } from "../supabase"
import { motion } from "framer-motion"

const ease = [0.16, 1, 0.3, 1]

export default function Profile() {
  const { user } = useAuth()
  const [name, setName] = useState(localStorage.getItem("display_name") || user?.user_metadata?.full_name || "")
  const [updatingName, setUpdatingName] = useState(false)
  const [uploadingResume, setUploadingResume] = useState(false)
  const [resumeUrl, setResumeUrl] = useState(user?.user_metadata?.default_resume_url || "")
  const [message, setMessage] = useState({ text: "", type: "" }) // type: 'success' | 'error'
  const fileInputRef = useRef(null)

  const handleUpdateName = async () => {
    if (!name.trim()) return
    setUpdatingName(true)
    setMessage({ text: "", type: "" })
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: name.trim() }
      })
      if (error) throw error
      
      localStorage.setItem("display_name", name.trim())
      setMessage({ text: "Name updated successfully!", type: "success" })
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage({ text: "", type: "" }), 3000)
    } catch (err) {
      setMessage({ text: err.message, type: "error" })
    } finally {
      setUpdatingName(false)
    }
  }

  const handleUploadResume = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.type !== "application/pdf") {
      setMessage({ text: "Please upload a PDF file.", type: "error" })
      return
    }
    
    setUploadingResume(true)
    setMessage({ text: "", type: "" })
    
    try {
      // Create a unique file path: userId/timestamp.pdf
      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}/${Date.now()}.${fileExt}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("resumes")
        .getPublicUrl(filePath)

      // Save URL to user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { default_resume_url: publicUrl }
      })

      if (updateError) throw updateError

      setResumeUrl(publicUrl)
      setMessage({ text: "Default resume uploaded successfully!", type: "success" })
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage({ text: "", type: "" }), 3000)
    } catch (err) {
      setMessage({ text: err.message, type: "error" })
    } finally {
      setUploadingResume(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 20px" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
      >
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.6px", color: "var(--text-1)", marginBottom: 8 }}>My Profile</h1>
          <p style={{ fontSize: 15, color: "var(--text-3)", lineHeight: 1.5 }}>Manage your personal details and default resume.</p>
        </div>

        {message.text && (
          <div style={{ 
            background: message.type === "success" ? "rgba(16, 185, 129, 0.1)" : "var(--danger-bg)", 
            border: `1px solid ${message.type === "success" ? "rgba(16, 185, 129, 0.2)" : "var(--danger-bd)"}`, 
            color: message.type === "success" ? "#10b981" : "var(--danger)", 
            borderRadius: "var(--r-sm)", padding: "12px 16px", fontSize: 13, marginBottom: 24, fontWeight: 500 
          }}>
            {message.text}
          </div>
        )}

        <div className="card" style={{ padding: "32px", marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: "var(--text-1)" }}>Personal Details</h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-2)", marginBottom: 6 }}>Email Address</label>
              <input className="input" type="email" value={user?.email || ""} disabled style={{ background: "var(--bg-2)", color: "var(--text-3)", cursor: "not-allowed" }} />
              <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 6 }}>Your email is managed by your sign-in provider.</p>
            </div>
            
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-2)", marginBottom: 6 }}>Full Name</label>
              <div style={{ display: "flex", gap: 12 }}>
                <input 
                  className="input" 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="John Doe"
                  style={{ flex: 1 }}
                />
                <button 
                  className="btn-primary" 
                  onClick={handleUpdateName} 
                  disabled={updatingName || !name.trim()}
                  style={{ padding: "0 20px", whiteSpace: "nowrap" }}
                >
                  {updatingName ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: "32px" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "var(--text-1)" }}>Default Resume</h2>
          <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 20, lineHeight: 1.5 }}>
            Upload a master resume. You can use this resume to quickly analyze new job descriptions without having to re-upload the PDF every time.
          </p>

          {resumeUrl && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "var(--accent-soft)", border: "1px solid var(--accent-mid)", borderRadius: "var(--r-sm)", marginBottom: 20 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  Saved Resume
                </p>
                <a href={resumeUrl} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "var(--text-3)", textDecoration: "none" }}>View PDF ↗</a>
              </div>
            </div>
          )}

          <div>
            <input 
              type="file" 
              accept=".pdf,application/pdf" 
              onChange={handleUploadResume}
              ref={fileInputRef}
              style={{ display: "none" }}
              id="resume-upload"
            />
            <label 
              htmlFor="resume-upload"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "12px 20px", border: "1px dashed var(--border)", borderRadius: "var(--r-md)",
                background: "var(--bg)", color: "var(--text-2)", fontSize: 13, fontWeight: 500,
                cursor: uploadingResume ? "not-allowed" : "pointer", transition: "all 0.2s"
              }}
              onMouseEnter={e => { if (!uploadingResume) { e.currentTarget.style.background = "var(--bg-2)"; e.currentTarget.style.borderColor = "var(--accent-mid)" } }}
              onMouseLeave={e => { if (!uploadingResume) { e.currentTarget.style.background = "var(--bg)"; e.currentTarget.style.borderColor = "var(--border)" } }}
            >
              {uploadingResume ? (
                <span>Uploading...</span>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  {resumeUrl ? "Upload Replacement PDF" : "Upload Resume PDF"}
                </>
              )}
            </label>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
