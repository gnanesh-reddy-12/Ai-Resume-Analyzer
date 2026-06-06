import { motion } from "framer-motion"

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } }
}

const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }
}

function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
      <motion.div variants={container} initial="hidden" animate="show" className="text-center">

        <motion.div variants={item} className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium px-4 py-2 rounded-full mb-8">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
          AI-Powered Resume Analysis
        </motion.div>

        <motion.h1 variants={item} className="text-6xl md:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight">
          Land Your Dream Job<br />
          <span className="text-blue-500">Faster</span>
        </motion.h1>

        <motion.p variants={item} className="text-slate-500 text-xl mt-6 max-w-2xl mx-auto leading-8">
          Analyze ATS compatibility, match keywords, and get AI-powered suggestions to make your resume stand out.
        </motion.p>

        <motion.div variants={item} className="flex justify-center items-center gap-8 mt-10">
          {["ATS Optimized", "Instant Results", "AI Suggestions"].map((t, i) => (
            <div key={i} className="flex items-center gap-2 text-slate-500 text-sm">
              <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              {t}
            </div>
          ))}
        </motion.div>

        <motion.div variants={item} className="flex justify-center gap-4 mt-10">
          <a href="#upload" className="btn-primary inline-block">Analyze My Resume</a>
          <a href="#features" className="btn-secondary inline-block">See How It Works</a>
        </motion.div>

      </motion.div>
    </section>
  )
}

export default Hero