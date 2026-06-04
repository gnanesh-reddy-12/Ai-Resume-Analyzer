import { motion } from "framer-motion"

function Hero() {
  return (
    <section className="max-w-5xl mx-auto px-6 pt-20 pb-14">

      <div className="text-center">

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-bold text-white leading-tight"
        >
          AI Resume{" "}
          <span className="text-blue-400">
            Analyzer
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-slate-600 text-xl mt-8 leading-9 max-w-3xl mx-auto"
        >
          Analyze ATS compatibility, semantic skill alignment,
          keyword optimization, and hiring readiness using
          AI-powered insights.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="flex justify-center items-center gap-6 mt-10 text-slate-600 font-medium"
        >
          <span>✓ ATS Friendly</span>
          <span>•</span>
          <span>AI Powered</span>
          <span>•</span>
          <span>Instant Analysis</span>
        </motion.div>

      </div>

    </section>
  )
}

export default Hero