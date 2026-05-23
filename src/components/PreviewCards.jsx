function PreviewCards() {
  return (
    <section className="mt-28 px-6 pb-20">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">

        {/* ATS Score Card */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-8 hover:scale-[1.02] transition">

          <h3 className="text-gray-400 text-lg">
            ATS Score
          </h3>

          <div className="mt-6 text-6xl font-bold text-white">
            92%
          </div>

          <p className="text-green-400 mt-4">
            Excellent Resume Strength
          </p>

        </div>

        {/* Missing Keywords */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-8 hover:scale-[1.02] transition">

          <h3 className="text-gray-400 text-lg">
            Missing Keywords
          </h3>

          <div className="flex flex-wrap gap-3 mt-6">

            <span className="bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full">
              Docker
            </span>

            <span className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full">
              Kubernetes
            </span>

            <span className="bg-pink-500/20 text-pink-300 px-4 py-2 rounded-full">
              CI/CD
            </span>

          </div>

        </div>

        {/* AI Suggestions */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-8 hover:scale-[1.02] transition">

          <h3 className="text-gray-400 text-lg">
            AI Suggestions
          </h3>

          <p className="text-white mt-6 leading-7">
            Improve action verbs, quantify achievements, and optimize keywords for better recruiter visibility.
          </p>

        </div>

      </div>

    </section>
  )
}

export default PreviewCards