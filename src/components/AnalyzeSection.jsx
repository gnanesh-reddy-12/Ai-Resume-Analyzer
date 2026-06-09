import { useContext, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ResumeContext } from "../context/ResumeContext"

const ease = [0.16, 1, 0.3, 1]

export default function AnalyzeSection() {
  const navigate = useNavigate()
  const { resumeFile, setResumeFile, jobDescription, setJobDescription, company, setCompany, role, setRole } = useContext(ResumeContext)
  const [jdOpen, setJdOpen] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.includes("pdf")) { alert("Only PDF files are allowed"); return }
    setResumeFile(file)
  }

  const handleAnalyze = () => {
    if (!resumeFile) { alert("Please upload a resume"); return }
    if (!jobDescription.trim()) { alert("Please paste a job description"); return }
    navigate("/loading")
  }

  return (
    <>
      <div className="card" style={{ padding: "clamp(20px, 4vw, 32px)" }}>

        {/* Company + Role row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }} className="grid grid-cols-1 sm:grid-cols-2">
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 7 }}>Company Name</label>
            <input
              value={company}
              onChange={e => setCompany(e.target.value)}
              placeholder="e.g. Google, Stripe…"
              className="input"
              style={{ fontSize: 13, padding: "10px 13px" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 7 }}>Job Role</label>
            <input
              value={role}
              onChange={e => setRole(e.target.value)}
              placeholder="e.g. Software Engineer…"
              className="input"
              style={{ fontSize: 13, padding: "10px 13px" }}
            />
          </div>
        </div>

        {/* Two-col: upload + JD */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">

          {/* Upload zone */}
          <div
            style={{
              border: `1.5px dashed ${dragOver ? "var(--accent)" : "var(--border-2)"}`,
              background: dragOver ? "var(--accent-soft)" : "var(--bg)",
              borderRadius: "var(--r-md)", padding: "24px 20px",
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", textAlign: "center", minHeight: 180,
              transition: "border-color 0.18s, background 0.18s", cursor: "default"
            }}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => {
              e.preventDefault(); setDragOver(false)
              const file = e.dataTransfer.files[0]
              if (file) handleFileChange({ target: { files: [file] } })
            }}
          >
            <div style={{ width: 44, height: 44, background: "var(--accent-soft)", border: "1px solid var(--accent-mid)", borderRadius: "var(--r-sm)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, color: "var(--accent)" }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p style={{ fontWeight: 700, fontSize: 13, color: "var(--text-1)", marginBottom: 4 }}>Upload Resume</p>
            <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 14 }}>PDF only · drag & drop or browse</p>
            <label className="btn-primary" style={{ fontSize: 12, padding: "7px 16px", cursor: "pointer" }}>
              Choose File
              <input type="file" accept=".pdf" style={{ display: "none" }} onChange={handleFileChange} />
            </label>
            {resumeFile && (
              <motion.div
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                style={{ marginTop: 12, background: "var(--success-bg)", border: "1px solid var(--success-bd)", borderRadius: "var(--r-xs)", padding: "5px 12px", fontSize: 12, color: "#166534", display: "flex", alignItems: "center", gap: 6, maxWidth: "100%" }}
              >
                <svg width="11" height="11" fill="#16A34A" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>{resumeFile.name}</span>
                <button onClick={() => setResumeFile(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#16A34A", fontSize: 13, lineHeight: 1, flexShrink: 0, marginLeft: "auto" }}>✕</button>
              </motion.div>
            )}
          </div>

          {/* JD card */}
          <div
            onClick={() => setJdOpen(true)}
            style={{ border: "1.5px solid var(--border)", borderRadius: "var(--r-md)", padding: "20px", display: "flex", flexDirection: "column", minHeight: 180, cursor: "pointer", background: "var(--surface)", transition: "border-color 0.18s, box-shadow 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.boxShadow = "var(--shadow-md)" }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <p style={{ fontWeight: 700, fontSize: 13, color: "var(--text-1)" }}>Job Description</p>
              <span className="badge badge-accent" style={{ fontSize: 11, padding: "3px 8px" }}>
                {jobDescription ? "✓ Added" : "Click to add"}
              </span>
            </div>
            <div className="custom-scrollbar" style={{ flex: 1, overflowY: "auto", maxHeight: 90, paddingRight: 4 }}>
              {jobDescription
                ? <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.65, whiteSpace: "pre-wrap", margin: 0 }}>{jobDescription}</p>
                : <p style={{ fontSize: 12, color: "var(--text-3)", margin: 0 }}>Paste the full job description for best results…</p>
              }
            </div>
            <p style={{ fontSize: 11, color: "var(--text-3)", textAlign: "right", marginTop: 10 }}>{jobDescription.length} characters</p>
          </div>
        </div>

        {/* Analyze button */}
        <motion.button
          onClick={handleAnalyze}
          whileTap={{ scale: 0.97 }}
          className="btn-primary"
          style={{ padding: "13px 52px", fontSize: 14, width: "100%" }}
        >
          Analyze Resume →
        </motion.button>
      </div>

      {/* JD Modal */}
      <AnimatePresence>
        {jdOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
            style={{ background: "rgba(26,22,17,0.5)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
            onClick={e => { if (e.target === e.currentTarget) setJdOpen(false) }}
          >
            <motion.div
              initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 32 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              style={{ background: "var(--surface)", width: "100%", maxWidth: 640, borderRadius: "20px 20px 0 0", maxHeight: "88vh", boxShadow: "0 -8px 40px rgba(0,0,0,0.12)", display: "flex", flexDirection: "column" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 20px 12px" }}>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.3px", margin: 0 }}>Job Description</h3>
                  <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 3 }}>Paste the complete job posting for best results</p>
                </div>
                <button
                  onClick={() => setJdOpen(false)}
                  style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--bg)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)", cursor: "pointer", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--bg-2)"}
                  onMouseLeave={e => e.currentTarget.style.background = "var(--bg)"}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
              <div style={{ padding: "0 20px", flex: 1, overflow: "hidden" }}>
                <textarea
                  autoFocus value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here — requirements, responsibilities, qualifications…"
                  style={{ width: "100%", height: "100%", minHeight: 280, border: "none", outline: "none", resize: "none", fontSize: 14, color: "var(--text-1)", lineHeight: 1.7, fontFamily: "Inter, sans-serif", background: "transparent" }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderTop: "1px solid var(--border)" }}>
                <span style={{ fontSize: 12, color: "var(--text-3)" }}>{jobDescription.length} characters</span>
                <div style={{ display: "flex", gap: 8 }}>
                  {jobDescription.length > 0 && (
                    <button className="btn-ghost" style={{ padding: "7px 14px", fontSize: 12 }} onClick={() => setJobDescription("")}>Clear</button>
                  )}
                  <button className="btn-primary" style={{ padding: "8px 20px", fontSize: 13 }} onClick={() => setJdOpen(false)}>Done ✓</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}