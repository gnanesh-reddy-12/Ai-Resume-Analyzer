import { motion } from "framer-motion"

function Hero() {
  return (
    <section className="max-w-5xl mx-auto px-6 pt-12 pb-10">

      <div className="text-center">

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-bold text-slate-900 leading-tight"
        >
          AI Resume{" "}
          <span className="text-blue-600">
            Analyzer
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-slate-700 text-lg mt-6 leading-8 max-w-2xl mx-auto"
        >
          Analyze ATS compatibility, semantic skill alignment,
          keyword optimization, and hiring readiness using
          AI-powered insights.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="flex justify-center items-center gap-6 mt-8 text-slate-700 font-medium"
        >
          <span>✓ ATS Friendly</span>
          <span>•</span>
          <span>AI Powered</span>
        </motion.div>

      </div>

    </section>
  )
}

export default Hero