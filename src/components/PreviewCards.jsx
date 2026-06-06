import { motion } from "framer-motion"

const features = [
  { icon: "📊", title: "ATS Score", desc: "Understand exactly how recruiters and ATS systems evaluate your resume with a precise compatibility score." },
  { icon: "🔍", title: "Keyword Detection", desc: "Identify matched and missing keywords from the job description to optimize your resume instantly." },
  { icon: "🧠", title: "Semantic Matching", desc: "AI compares your experience with job requirements at a conceptual level beyond simple keyword matching." },
  { icon: "✍️", title: "AI Suggestions", desc: "Get rewritten bullet points, a tailored summary, and actionable fixes for each section of your resume." },
  { icon: "⚡", title: "Instant Results", desc: "Receive complete analysis in under 10 seconds with no account required for the first analysis." },
  { icon: "📈", title: "Track Progress", desc: "Save your analysis history and track improvements across multiple versions of your resume." },
]

const steps = [
  { n: "01", title: "Upload Resume", desc: "PDF or DOCX" },
  { n: "02", title: "Paste Job Description", desc: "Any job posting" },
  { n: "03", title: "AI Analyzes", desc: "Instant processing" },
  { n: "04", title: "View Results", desc: "Detailed insights" },
  { n: "05", title: "Improve Resume", desc: "Apply suggestions" },
]

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } }

function PreviewCards() {
  return (
    <div className="bg-slate-50 border-t border-slate-200">

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-blue-500 text-sm font-semibold uppercase tracking-widest">Features</p>
          <h2 className="text-4xl font-bold text-slate-900 mt-3">Everything You Need</h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto">Powered by AI to give you the most accurate resume analysis available.</p>
        </div>

        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div key={i} variants={item} className="card p-6">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-semibold text-slate-900 text-lg">{f.title}</h3>
              <p className="text-slate-500 mt-2 text-sm leading-6">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center mb-16">
          <p className="text-blue-500 text-sm font-semibold uppercase tracking-widest">Process</p>
          <h2 className="text-4xl font-bold text-slate-900 mt-3">Simple 5 Step Process</h2>
        </div>

        <div className="relative">
          <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-px bg-slate-200"></div>
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid md:grid-cols-5 gap-6">
            {steps.map((s, i) => (
              <motion.div key={i} variants={item} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white border-2 border-blue-500 rounded-2xl flex items-center justify-center font-bold text-blue-500 text-lg mb-4 relative z-10">
                  {s.n}
                </div>
                <h3 className="font-semibold text-slate-900">{s.title}</h3>
                <p className="text-slate-500 text-sm mt-1">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Sample Results */}
      <section id="results" className="max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center mb-16">
          <p className="text-blue-500 text-sm font-semibold uppercase tracking-widest">Sample Results</p>
          <h2 className="text-4xl font-bold text-slate-900 mt-3">Your Analysis Report</h2>
        </div>

        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }} className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col items-center">
              <div className="w-48 h-48 rounded-full border-[12px] border-blue-500 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl font-bold text-slate-900">92%</div>
                  <p className="text-slate-500 text-sm mt-1">ATS Score</p>
                </div>
              </div>
            </div>
            <div className="space-y-5">
              {[["Keyword Match", "88%", "#3B82F6"], ["Semantic Match", "94%", "#10B981"], ["Overall Readiness", "90%", "#F59E0B"]].map(([label, val, color], i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600 font-medium">{label}</span>
                    <span className="font-semibold text-slate-900">{val}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: val }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.1 }} className="h-2 rounded-full" style={{ background: color }}></motion.div>
                  </div>
                </div>
              ))}
              <div className="pt-4">
                <p className="text-sm font-semibold text-slate-700 mb-3">Missing Skills</p>
                <div className="flex gap-2 flex-wrap">
                  {["Docker", "Kubernetes", "CI/CD", "AWS"].map((s, i) => <span key={i} className="tag-red">{s}</span>)}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

export default PreviewCards