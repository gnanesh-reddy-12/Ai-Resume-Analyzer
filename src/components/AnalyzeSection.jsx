import { useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ResumeContext } from "../context/ResumeContext"
import { useAuth } from "../context/useAuth"

const spring = { type: "spring", stiffness: 400, damping: 30 }
const labelStyle = { display: "block", fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }

export default function AnalyzeSection() {
  const navigate = useNavigate()
  const { resumeFile, setResumeFile, jobDescription, setJobDescription, company, setCompany, role, setRole } = useContext(ResumeContext)
  const { user } = useAuth()
  const defaultResumeUrl = user?.user_metadata?.default_resume_url
  const defaultResumeName = user?.user_metadata?.default_resume_name || "Saved_Resume.pdf"

  const [jdOpen, setJdOpen] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [uploadMode, setUploadMode] = useState(defaultResumeUrl ? "saved" : "new")
  const [fetchingSaved, setFetchingSaved] = useState(false)

  useEffect(() => {
    if (defaultResumeUrl && !resumeFile) setUploadMode("saved")
  }, [defaultResumeUrl, resumeFile])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.includes("pdf")) { alert("Only PDF files are allowed"); return }
    setResumeFile(file)
    setUploadMode("new")
  }

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) { alert("Please paste a job description"); return }
    
    if (uploadMode === "new" && !resumeFile) { 
      alert("Please upload a resume"); return 
    }

    if (uploadMode === "saved") {
      if (!defaultResumeUrl) { alert("No master resume found. Please upload one in your Profile."); return }
      setFetchingSaved(true)
      try {
        const res = await fetch(defaultResumeUrl)
        const blob = await res.blob()
        const file = new File([blob], defaultResumeName, { type: "application/pdf" })
        setResumeFile(file)
      } catch (err) {
        alert("Failed to load saved resume.")
        setFetchingSaved(false)
        return
      }
      setFetchingSaved(false)
    }

    navigate("/results")
  }

  return (
    <>
      <div className="ek-card" style={{ padding: "clamp(24px, 5vw, 40px)" }}>
        
        {/* Top Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label style={labelStyle}>Company Name</label>
            <input value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Google, Amazon, Apple" className="input-ek" />
          </div>
          <div>
            <label style={labelStyle}>Job Title</label>
            <input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Product Designer" className="input-ek" />
          </div>
        </div>

        {/* Content Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          
          {/* Resume Selection */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {defaultResumeUrl && (
              <div style={{ display: "flex", background: "var(--bg)", padding: 4, borderRadius: 99, boxShadow: "0 0 0 1px var(--border) inset", marginBottom: 12, position: "relative" }}>
                {["saved", "new"].map((mode) => {
                  const labelText = mode === "saved"
                    ? (defaultResumeName.length > 20 ? defaultResumeName.slice(0, 17) + "..." : defaultResumeName)
                    : "Upload New"
                  return (
                    <button
                      key={mode}
                      onClick={() => setUploadMode(mode)}
                      style={{ flex: 1, position: "relative", padding: "6px 0", fontSize: "var(--text-xs)", fontWeight: 600, borderRadius: 99, border: "none", background: "transparent", color: uploadMode === mode ? "var(--text-1)" : "var(--text-3)", cursor: "pointer", outline: "none", zIndex: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    >
                      {labelText}
                    </button>
                  )
                })}
                <motion.div
                  layoutId="analyze-toggle"
                  transition={spring}
                  style={{ position: "absolute", top: 4, bottom: 4, left: uploadMode === "saved" ? 4 : "50%", width: "calc(50% - 4px)", background: "var(--surface)", borderRadius: 99, boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px var(--border) inset", zIndex: 1 }}
                />
              </div>
            )}

            <div style={{ flex: 1, display: "flex" }}>
              {uploadMode === "saved" && defaultResumeUrl ? (
                <div style={{ flex: 1, background: "var(--surface)", borderRadius: "var(--r-md)", boxShadow: "0 0 0 1px var(--border) inset", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
                  <div style={{ width: 40, height: 40, background: "var(--bg)", borderRadius: "var(--r-sm)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-2)", boxShadow: "0 0 0 1px var(--border) inset", marginBottom: 12 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  </div>
                  <p style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--text-1)", marginBottom: 4, width: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", padding: "0 8px" }}>
                    {defaultResumeName} Selected
                  </p>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--text-3)", marginBottom: 12 }}>Using your saved profile resume.</p>
                </div>
              ) : (
                <label 
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => {
                    e.preventDefault(); setDragOver(false)
                    if (e.dataTransfer.files[0]) handleFileChange({ target: { files: [e.dataTransfer.files[0]] } })
                  }}
                  style={{ flex: 1, background: dragOver ? "var(--surface-hover)" : "var(--surface)", borderRadius: "var(--r-md)", boxShadow: dragOver ? "0 0 0 1px var(--text-2) inset" : "0 0 0 1px var(--border) inset", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}
                >
                  <input type="file" accept=".pdf,application/pdf" style={{ display: "none" }} onChange={handleFileChange} />
                  <div style={{ width: 40, height: 40, background: "var(--bg)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-2)", marginBottom: 12 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  </div>
                  <p style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--text-1)", marginBottom: 4 }}>Upload Custom Resume</p>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--text-3)", marginBottom: 12 }}>PDF only, up to 5MB.</p>
                  {resumeFile && (
                    <div style={{ background: "var(--success-bg)", border: "1px solid var(--success-bd)", borderRadius: "var(--r-sm)", padding: "4px 10px", fontSize: "var(--text-xs)", color: "var(--success)", fontWeight: 500, display: "flex", alignItems: "center", gap: 6, maxWidth: "100%" }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{resumeFile.name}</span>
                    </div>
                  )}
                </label>
              )}
            </div>
          </div>

            <div
              onClick={() => setJdOpen(true)}
              style={{ flex: 1, background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: "var(--r-md)", padding: 20, textAlign: "left", display: "flex", flexDirection: "column", cursor: "pointer", transition: "border-color 0.18s, box-shadow 0.18s", minHeight: 200 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.boxShadow = "var(--shadow-md)" }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: 12 }}>
                <p style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--text-1)", margin: 0 }}>Job Description</p>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {jobDescription ? (
                     <span style={{ fontSize: "11px", background: "var(--success-bg)", color: "var(--success)", padding: "3px 8px", borderRadius: "99px", fontWeight: 600 }}>✓ Added</span>
                  ) : (
                     <span style={{ fontSize: "11px", background: "var(--bg)", color: "var(--text-3)", padding: "3px 8px", borderRadius: "99px", fontWeight: 600, border: "1px solid var(--border)" }}>Click to add</span>
                  )}
                </div>
              </div>
              <div className="custom-scrollbar" style={{ flex: 1, overflowY: "auto", maxHeight: 110, paddingRight: 4 }}>
                {jobDescription ? (
                  <p style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: 1.65, whiteSpace: "pre-wrap", margin: 0 }}>
                    {jobDescription}
                  </p>
                ) : (
                  <p style={{ fontSize: "13px", color: "var(--text-3)", margin: 0 }}>
                    Paste the full job description for best results...
                  </p>
                )}
              </div>
              <p style={{ fontSize: 11, color: "var(--text-3)", textAlign: "right", marginTop: 10, margin: "10px 0 0 0" }}>{jobDescription.length} characters</p>
            </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleAnalyze}
          disabled={fetchingSaved}
          className="btn-ek btn-accent"
          style={{ width: "100%", padding: "14px", fontSize: "var(--text-base)", fontWeight: 600 }}
        >
          {fetchingSaved ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <div className="spin" style={{ width: 16, height: 16, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%" }} />
              <span>Fetching Saved Resume…</span>
            </div>
          ) : (
            "Analyze Compatibility →"
          )}
        </motion.button>
      </div>

      <AnimatePresence>
        {jdOpen && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(26,22,17,0.5)", backdropFilter: "blur(6px)" }}
              onClick={() => setJdOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={spring}
              className="ek-card"
              style={{ position: "relative", width: "100%", maxWidth: 640, display: "flex", flexDirection: "column", maxHeight: "85vh", zIndex: 101 }}
            >
              <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: "var(--text-base)", margin: 0, fontWeight: 700, color: "var(--text-1)" }}>Job Description</h3>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--text-3)", margin: 0 }}>Paste the complete posting.</p>
                </div>
                <button onClick={() => setJdOpen(false)} style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--bg)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)", cursor: "pointer" }}>✕</button>
              </div>
              <div style={{ padding: 24, flex: 1, overflow: "hidden" }}>
                <textarea
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                  placeholder="Paste requirements here…"
                  className="custom-scrollbar"
                  style={{ width: "100%", height: "100%", minHeight: 300, border: "none", outline: "none", resize: "none", background: "transparent", fontSize: "var(--text-sm)", color: "var(--text-1)", lineHeight: 1.6, fontFamily: "inherit" }}
                />
              </div>
              <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 8 }}>
                {jobDescription && <button className="btn-ek btn-ghost" onClick={() => setJobDescription("")}>Clear</button>}
                <button className="btn-ek btn-primary" onClick={() => setJdOpen(false)}>Done ✓</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}