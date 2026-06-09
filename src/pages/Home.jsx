import Navbar from "../components/Navbar"
import AnalyzeSection from "../components/AnalyzeSection"
import { useAuth } from "../context/useAuth"
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
  const name = localStorage.getItem("display_name") || user?.email?.split("@")[0] || "there"

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

        {/* Main grid: stacks on mobile, side-by-side on large screens */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">

          {/* Analyze section — takes up full width on mobile */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }} className="w-full lg:flex-1">
            <AnalyzeSection />
          </motion.div>

          {/* Right panel — stacks below on mobile */}
          <motion.div initial={{ opacity: 0, x: 0 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, delay: 0.2 }} className="w-full lg:w-72 flex flex-col gap-4 flex-shrink-0">

            {/* Quick tips */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
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
              className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-left cursor-pointer transition-colors hover:bg-blue-100 w-full"
            >
              <p className="font-bold text-sm text-blue-600 mb-1">📋 Past Analyses</p>
              <p className="text-xs text-blue-500 leading-relaxed">View your analysis history, compare scores, and track improvements.</p>
              <p className="text-xs text-blue-600 font-semibold mt-3">View History →</p>
            </button>

          </motion.div>
        </div>
      </div>
    </div>
  )
}