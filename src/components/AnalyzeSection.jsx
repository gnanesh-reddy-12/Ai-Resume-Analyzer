import { useContext, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ResumeContext } from "../context/ResumeContext"

export default function AnalyzeSection() {
  const navigate = useNavigate()
  const { resumeFile, setResumeFile, jobDescription, setJobDescription } = useContext(ResumeContext)
  const [jdOpen, setJdOpen] = useState(false)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    if (!allowed.includes(file.type)) { alert("Only PDF and DOCX files are allowed"); return }
    setResumeFile(file)
  }

  const handleAnalyze = () => {
    if (!resumeFile) { alert("Please upload a resume"); return }
    if (!jobDescription.trim()) { alert("Please paste a job description"); return }
    navigate("/loading")
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ background: "white", border: "1px solid var(--border)", borderRadius: 24, padding: 32, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
      >
        {/* Two column layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

          {/* Upload box */}
          <div style={{ border: "2px dashed var(--border)", borderRadius: 18, padding: 28, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: 240, transition: "border-color 0.2s", cursor: "default" }}
            onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = "var(--accent)" }}
            onDragLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
            onDrop={e => {
              e.preventDefault()
              e.currentTarget.style.borderColor = "var(--border)"
              const file = e.dataTransfer.files[0]
              if (file) { const ev = { target: { files: [file] } }; handleFileChange(ev) }
            }}
          >
            <div style={{ width: 52, height: 52, background: "#EFF6FF", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
              <svg width="24" height="24" fill="none" stroke="var(--accent)" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p style={{ fontWeight: 700, fontSize: 15, color: "var(--text-1)", marginBottom: 4 }}>Upload Resume</p>
            <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 16 }}>PDF or DOCX · Drag & drop or browse</p>
            <label className="btn-primary" style={{ fontSize: 13, padding: "8px 20px", cursor: "pointer" }}>
              Choose File
              <input type="file" accept=".pdf,.docx" style={{ display: "none" }} onChange={handleFileChange} />
            </label>
            {resumeFile && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                style={{ marginTop: 14, background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10, padding: "7px 14px", fontSize: 13, color: "#166534", display: "flex", alignItems: "center", gap: 6, maxWidth: "100%" }}>
                <svg width="14" height="14" fill="#16A34A" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180, fontWeight: 500 }}>{resumeFile.name}</span>
              </motion.div>
            )}
          </div>

          {/* JD box */}
          <div style={{ border: "1.5px solid var(--border)", borderRadius: 18, padding: 24, display: "flex", flexDirection: "column", minHeight: 240 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 15, color: "var(--text-1)" }}>Job Description</p>
                <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>Paste the full job posting</p>
              </div>
              <button onClick={() => setJdOpen(true)} style={{ display: "flex", alignItems: "center", gap: 5, background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 8, padding: "5px 10px", fontSize: 12, color: "var(--accent)", cursor: "pointer", fontWeight: 600 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                Expand
              </button>
            </div>
            <textarea
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              placeholder="Paste job description here..."
              style={{ flex: 1, resize: "none", border: "1.5px solid var(--border)", borderRadius: 12, padding: "12px 14px", fontSize: 13, color: "var(--text-1)", outline: "none", fontFamily: "Inter, sans-serif", lineHeight: 1.6, transition: "border-color 0.15s" }}
              onFocus={e => e.target.style.borderColor = "var(--accent)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <span style={{ fontSize: 11, color: "var(--text-3)" }}>{jobDescription.length} chars</span>
              {jobDescription.length > 0 && (
                <button onClick={() => setJobDescription("")} style={{ fontSize: 11, color: "var(--danger)", background: "none", border: "none", cursor: "pointer" }}>Clear</button>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
          <motion.button
            onClick={handleAnalyze}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="btn-primary"
            style={{ padding: "13px 48px", fontSize: 15 }}
          >
            Analyze Resume →
          </motion.button>
        </div>
      </motion.div>

      {/* JD Modal */}
      <AnimatePresence>
        {jdOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
            onClick={e => { if (e.target === e.currentTarget) setJdOpen(false) }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.22 }}
              style={{ background: "white", borderRadius: 20, padding: 32, width: "100%", maxWidth: 720, maxHeight: "80vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontWeight: 800, fontSize: 18, color: "var(--text-1)" }}>Job Description</h3>
                  <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 2 }}>Paste the complete job posting for best results</p>
                </div>
                <button onClick={() => setJdOpen(false)} style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid var(--border)", background: "var(--bg)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-2)" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
              <textarea
                autoFocus
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here — include requirements, responsibilities, and qualifications for the most accurate analysis..."
                style={{ flex: 1, resize: "none", border: "1.5px solid var(--border)", borderRadius: 14, padding: "16px", fontSize: 14, color: "var(--text-1)", outline: "none", fontFamily: "Inter, sans-serif", lineHeight: 1.7, minHeight: 320, transition: "border-color 0.15s" }}
                onFocus={e => e.target.style.borderColor = "var(--accent)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
                <span style={{ fontSize: 13, color: "var(--text-3)" }}>{jobDescription.length} characters</span>
                <div style={{ display: "flex", gap: 10 }}>
                  {jobDescription.length > 0 && (
                    <button onClick={() => setJobDescription("")} className="btn-ghost" style={{ padding: "9px 18px", fontSize: 13 }}>Clear</button>
                  )}
                  <button onClick={() => setJdOpen(false)} className="btn-primary" style={{ padding: "9px 24px", fontSize: 13 }}>
                    Done ✓
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}