import { motion } from "framer-motion"
import heroImage from "../assets/hero.png"

function Hero() {
  return (
    <section className="max-w-7xl mx-auto px-6 pt-20 pb-10">

      <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-16">

        {/* LEFT SIDE */}
        <div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold text-white leading-tight"
          >
            AI Resume <br />
            Analyzer
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-gray-300 text-lg mt-8 leading-8 max-w-xl"
          >
            Analyze ATS compatibility, semantic skill alignment,
            keyword optimization, and hiring readiness using AI-powered insights.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex gap-5 mt-10"
          >

            <button className="bg-white text-black px-7 py-3 rounded-full font-semibold hover:scale-105 transition">
              Upload Resume
            </button>

            <button className="border border-white/20 text-white px-7 py-3 rounded-full hover:bg-white hover:text-black transition">
              Live Demo
            </button>

          </motion.div>

        </div>

        {/* RIGHT SIDE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="relative"
        >
        
          <img
            src={heroImage}
            alt="AI Resume Analyzer"
            className="w-full rounded-3xl border border-white/10 shadow-2xl"
          />
      


        </motion.div>

      </div>

    </section>
  )
}

export default Hero