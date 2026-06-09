import { useContext, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ResumeContext } from "../context/ResumeContext"

export default function AnalyzeSection() {
  const navigate = useNavigate()
  const { resumeFile, setResumeFile, jobDescription, setJobDescription, company, setCompany, role, setRole } = useContext(ResumeContext)
  const [jdOpen, setJdOpen] = useState(false)

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
      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-7" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>

        {/* Company + Role row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Company Name</label>
            <input
              value={company}
              onChange={e => setCompany(e.target.value)}
              placeholder="e.g. Google, Microsoft..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-400 transition-colors"
              style={{ fontFamily: "Inter, sans-serif" }}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Job Role</label>
            <input
              value={role}
              onChange={e => setRole(e.target.value)}
              placeholder="e.g. Software Engineer..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-400 transition-colors"
              style={{ fontFamily: "Inter, sans-serif" }}
            />
          </div>
        </div>

        {/* PDF Upload box */}
        <div
          className="border-2 border-dashed border-slate-200 rounded-xl p-5 flex flex-col items-center justify-center text-center mb-3 transition-colors"
          style={{ minHeight: 160 }}
          onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = "#3B82F6" }}
          onDragLeave={e => { e.currentTarget.style.borderColor = "" }}
          onDrop={e => {
            e.preventDefault()
            e.currentTarget.style.borderColor = ""
            const file = e.dataTransfer.files[0]
            if (file) handleFileChange({ target: { files: [file] } })
          }}
        >
          <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
            <svg width="20" height="20" fill="none" stroke="#3B82F6" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="font-bold text-sm text-slate-800 mb-1">Upload Resume</p>
          <p className="text-xs text-slate-400 mb-3">PDF only · Drag & drop or browse</p>
          <label className="btn-primary cursor-pointer" style={{ fontSize: 13, padding: "8px 20px" }}>
            Choose File
            <input type="file" accept=".pdf" style={{ display: "none" }} onChange={handleFileChange} />
          </label>

          {resumeFile && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className="mt-3 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 flex items-center gap-2 max-w-full"
            >
              <svg width="12" height="12" fill="#16A34A" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
              <span className="text-xs text-green-700 font-medium truncate" style={{ maxWidth: 200 }}>{resumeFile.name}</span>
              <button onClick={() => setResumeFile(null)} className="text-green-400 hover:text-green-600 ml-auto text-xs flex-shrink-0" style={{ background: "none", border: "none", cursor: "pointer" }}>✕</button>
            </motion.div>
          )}
        </div>

        {/* Job Description box */}
        <div
          onClick={() => setJdOpen(true)}
          className="border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-blue-400 transition-colors"
          style={{ minHeight: 90 }}
        >
          <div className="flex justify-between items-center mb-2">
            <p className="font-bold text-sm text-slate-800">Job Description</p>
            <span className="text-xs text-blue-500 font-semibold bg-blue-50 rounded-md px-2 py-0.5">
              {jobDescription ? "✓ Added" : "Click to add"}
            </span>
          </div>
          {jobDescription ? (
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{jobDescription}</p>
          ) : (
            <p className="text-xs text-slate-400">Paste the full job description for best results...</p>
          )}
          <p className="text-xs text-slate-300 mt-2">{jobDescription.length} characters</p>
        </div>

        {/* Analyze button */}
        <div className="flex justify-center mt-5">
          <motion.button
            onClick={handleAnalyze}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="btn-primary w-full sm:w-auto"
            style={{ padding: "13px 48px", fontSize: 15 }}
          >
            Analyze Resume →
          </motion.button>
        </div>
      </div>

      {/* Job Description Modal */}
      <AnimatePresence>
        {jdOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
            style={{ background: "rgba(15,23,42,0.5)" }}
            onClick={e => { if (e.target === e.currentTarget) setJdOpen(false) }}
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.22 }}
              className="bg-white w-full sm:max-w-2xl sm:rounded-2xl flex flex-col"
              style={{ borderRadius: "20px 20px 0 0", maxHeight: "90vh" }}
            >
              {/* Modal header */}
              <div className="flex justify-between items-center px-5 pt-5 pb-3">
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Job Description</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Paste the complete job posting for best results</p>
                </div>
                <button
                  onClick={() => setJdOpen(false)}
                  className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600"
                  style={{ background: "#F8FAFC", cursor: "pointer" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>

              {/* Textarea */}
              <div className="px-5 flex-1 overflow-hidden">
                <textarea
                  autoFocus
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here — include requirements, responsibilities, and qualifications..."
                  className="w-full h-full outline-none resize-none text-sm text-slate-900 leading-relaxed"
                  style={{ fontFamily: "Inter, sans-serif", border: "none", minHeight: 260, maxHeight: 400 }}
                />
              </div>

              {/* Modal footer */}
              <div className="flex justify-between items-center px-5 py-4 border-t border-slate-100">
                <span className="text-xs text-slate-400">{jobDescription.length} characters</span>
                <div className="flex gap-2">
                  {jobDescription.length > 0 && (
                    <button onClick={() => setJobDescription("")} className="btn-ghost" style={{ padding: "8px 16px", fontSize: 13 }}>Clear</button>
                  )}
                  <button onClick={() => setJdOpen(false)} className="btn-primary" style={{ padding: "9px 22px", fontSize: 13 }}>Done ✓</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}