import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ResumeContext } from "../context/ResumeContext"

function AnalyzeSection() {
  const navigate = useNavigate()
  const { resumeFile, setResumeFile, jobDescription, setJobDescription } = useContext(ResumeContext)

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
    <section id="upload" className="max-w-6xl mx-auto px-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm"
      >
        <div className="text-center mb-10">
          <p className="text-blue-500 text-sm font-semibold uppercase tracking-widest">Get Started</p>
          <h2 className="text-4xl font-bold text-slate-900 mt-3">Analyze Your Resume</h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto">Upload your resume and paste a job description to receive your ATS score and AI-powered improvement suggestions.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          {/* Upload */}
          <div className="border-2 border-dashed border-slate-200 hover:border-blue-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-colors min-h-[280px]">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-5">
              <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900 text-lg">Upload Resume</h3>
            <p className="text-slate-500 text-sm mt-1">PDF or DOCX, max 10MB</p>
            <label className="mt-5 btn-primary text-sm cursor-pointer">
              Choose File
              <input type="file" accept=".pdf,.docx" className="hidden" onChange={handleFileChange} />
            </label>
            {resumeFile && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-xl text-sm w-full justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                <span className="truncate max-w-[180px]">{resumeFile.name}</span>
              </motion.div>
            )}
          </div>

          {/* JD */}
          <div className="flex flex-col min-h-[280px]">
            <h3 className="font-semibold text-slate-900 text-lg mb-1">Job Description</h3>
            <p className="text-slate-500 text-sm mb-4">Paste the full job description</p>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              className="input-field flex-1 resize-none"
            />
            <p className="text-slate-400 text-xs mt-2 text-right">{jobDescription.length} characters</p>
          </div>
        </div>

        <div className="flex justify-center mt-10">
          <motion.button
            onClick={handleAnalyze}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary px-12 py-4 text-base"
          >
            Analyze Resume →
          </motion.button>
        </div>
      </motion.div>
    </section>
  )
}

export default AnalyzeSection