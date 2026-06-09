import { useContext, useEffect } from "react"
import Navbar from "../components/Navbar"
import AnalyzeSection from "../components/AnalyzeSection"
import { useAuth } from "../context/useAuth"
import { ResumeContext } from "../context/ResumeContext"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"

const tips = [
  { icon: "🎯", title: "Be specific", desc: "Use exact keywords from the job description in your resume." },
  { icon: "📊", title: "Add metrics", desc: "Quantify achievements — numbers stand out to recruiters." },
  { icon: "⚡", title: "Keep it clean", desc: "Simple formatting beats fancy design for ATS systems." },
]

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { resetContext } = useContext(ResumeContext)
  const name = localStorage.getItem("display_name") || user?.email?.split("@")[0] || "there"

  useEffect(() => {
    resetContext()
  }, [resetContext])

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10 pb-20">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-6 md:mb-8">
          <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Dashboard</p>
          <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900" style={{ letterSpacing: "-0.5px" }}>
            Hey, {name} 👋
          </h1>
          <p className="text-sm md:text-base text-slate-500 mt-2">
            Ready to beat the ATS? Upload your resume below.
          </p>
        </motion.div>

        {/* Main layout: Stacked vertically, AnalyzeSection full width on top */}
        <div className="flex flex-col gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }} className="w-full">
            <AnalyzeSection />
          </motion.div>

          {/* Bottom row: Quick Tips and Past Analyses side-by-side on tablet/desktop, stacked on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick tips */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
              <p className="font-bold text-sm text-slate-900 mb-4">💡 Quick Tips</p>
              <div className="flex flex-col gap-4">
                {tips.map((t, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-lg flex-shrink-0">{t.icon}</span>
                    <div>
                      <p className="font-semibold text-sm text-slate-900">{t.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{t.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* History shortcut */}
            <button
              onClick={() => navigate("/history")}
              className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-left cursor-pointer transition-all hover:bg-blue-100 hover:border-blue-300 w-full flex flex-col justify-between"
              style={{ boxShadow: "0 2px 12px rgba(59,130,246,0.05)" }}
            >
              <div>
                <p className="font-bold text-sm text-blue-600 mb-1">📋 Past Analyses</p>
                <p className="text-xs text-blue-500 leading-relaxed">View your analysis history, compare scores, and track improvements.</p>
              </div>
              <p className="text-xs text-blue-600 font-semibold mt-3">View History →</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}