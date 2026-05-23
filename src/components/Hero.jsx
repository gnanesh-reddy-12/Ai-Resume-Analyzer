import { motion } from "framer-motion"

function Hero() {
  return (
    <section className="flex flex-col items-center justify-center text-center mt-24 px-6">

      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-6xl md:text-7xl font-bold text-white leading-tight max-w-5xl"
      >
        Optimize Your Resume <br /> With AI
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="text-gray-400 text-lg mt-6 max-w-2xl"
      >
        Get ATS scores, keyword optimization, and AI-powered resume improvements instantly.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="flex gap-4 mt-10"
      >

        <button className="bg-white text-black px-7 py-3 rounded-full font-semibold hover:scale-105 transition">
          Get Started
        </button>

        <button className="border border-gray-700 text-white px-7 py-3 rounded-full hover:bg-white hover:text-black transition">
          Live Demo
        </button>

      </motion.div>

    </section>
  )
}

export default Hero