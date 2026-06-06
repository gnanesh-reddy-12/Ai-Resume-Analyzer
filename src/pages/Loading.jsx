import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useContext } from "react"
import { ResumeContext } from "../context/ResumeContext"
import { motion } from "framer-motion"

const steps = ["Parsing resume...", "Extracting keywords...", "Running AI analysis...", "Generating suggestions..."]

function Loading() {
  const navigate = useNavigate()
  const { resumeFile, jobDescription } = useContext(ResumeContext)

  useEffect(() => {
    const timer = setTimeout(() => navigate("/results"), 3000)
    return () => clearTimeout(timer)
  }, [navigate, resumeFile, jobDescription])

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="text-center">

        <div className="relative w-20 h-20 mx-auto mb-8">
          <div className="w-20 h-20 border-4 border-slate-200 rounded-full"></div>
          <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute inset-0"></div>
        </div>

        <h1 className="text-3xl font-bold text-slate-900">Analyzing Resume</h1>
        <p className="text-slate-500 mt-3">Our AI is reviewing your resume against the job description</p>

        <div className="mt-10 space-y-3 max-w-xs mx-auto">
          {steps.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.6, duration: 0.4 }} className="flex items-center gap-3 text-sm text-slate-600">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.6 + 0.3 }} className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              </motion.div>
              {s}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default Loading