import { useContext } from "react"
import { ResumeContext } from "../context/ResumeContext"
function Results() {
    const {
  resumeFile,
  jobDescription,
  atsScore
} = useContext(ResumeContext)
  return (
    <div className="min-h-screen bg-[#050816] text-white p-6 md:p-10 relative overflow-hidden">

      {/* Background Glow */}
      <div className="absolute top-[-200px] left-[-100px] w-[500px] h-[500px] bg-purple-600 rounded-full blur-[150px] opacity-20"></div>

      <div className="absolute bottom-[-200px] right-[-100px] w-[500px] h-[500px] bg-blue-600 rounded-full blur-[150px] opacity-20"></div>

      {/* Heading */}
      <div className="relative z-10">

        <h1 className="text-5xl font-bold">
          ATS Analysis Results
        </h1>

        <div className="mt-6 space-y-2">

  <p className="text-purple-300">
    Uploaded Resume:
    <span className="text-white ml-2">
      {resumeFile ? resumeFile.name : "No file uploaded"}
    </span>
  </p>

  <p className="text-blue-300">
    Job Description Length:
    <span className="text-white ml-2">
      {jobDescription.length} characters
    </span>
  </p>

</div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12">

          {/* ATS Score */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-8">

            <h2 className="text-gray-400 text-lg">
              ATS Score
            </h2>

            <div className="mt-8 flex items-center justify-center">

              <div className="w-44 h-44 rounded-full border-[12px] border-purple-500 flex items-center justify-center text-5xl font-bold">
                {atsScore}%
              </div>

            </div>

            <p className="text-green-400 text-center mt-6">
              Excellent Resume Strength
            </p>

          </div>

          {/* Missing Keywords */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-8">

            <h2 className="text-gray-400 text-lg">
              Missing Keywords
            </h2>

            <div className="flex flex-wrap gap-3 mt-8">

              <span className="bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full">
                Docker
              </span>

              <span className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full">
                Kubernetes
              </span>

              <span className="bg-pink-500/20 text-pink-300 px-4 py-2 rounded-full">
                CI/CD
              </span>

              <span className="bg-green-500/20 text-green-300 px-4 py-2 rounded-full">
                AWS
              </span>

            </div>

          </div>

          {/* Resume Strength */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-8">

            <h2 className="text-gray-400 text-lg">
              Resume Strength
            </h2>

            <div className="mt-8 space-y-5">

              <div>
                <p className="text-white">
                  Keyword Match
                </p>

                <div className="w-full h-3 bg-white/10 rounded-full mt-2 overflow-hidden">

                  <div className="w-[90%] h-full bg-purple-500 rounded-full"></div>

                </div>
              </div>

              <div>
                <p className="text-white">
                  Formatting
                </p>

                <div className="w-full h-3 bg-white/10 rounded-full mt-2 overflow-hidden">

                  <div className="w-[80%] h-full bg-blue-500 rounded-full"></div>

                </div>
              </div>

              <div>
                <p className="text-white">
                  Readability
                </p>

                <div className="w-full h-3 bg-white/10 rounded-full mt-2 overflow-hidden">

                  <div className="w-[85%] h-full bg-pink-500 rounded-full"></div>

                </div>
              </div>

            </div>

          </div>

        </div>

        {/* AI Suggestions */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-8 mt-8">

          <h2 className="text-3xl font-bold">
            AI Resume Suggestions
          </h2>

          <div className="space-y-6 mt-8">

            <div className="border border-white/10 rounded-2xl p-5 bg-black/20">

              <h3 className="text-purple-300 font-semibold text-lg">
                Improve Action Verbs
              </h3>

              <p className="text-gray-300 mt-3 leading-7">
                Replace weak phrases like “Worked on” with stronger achievement-oriented verbs such as “Developed”, “Implemented”, or “Engineered”.
              </p>

            </div>

            <div className="border border-white/10 rounded-2xl p-5 bg-black/20">

              <h3 className="text-blue-300 font-semibold text-lg">
                Quantify Achievements
              </h3>

              <p className="text-gray-300 mt-3 leading-7">
                Add measurable impact metrics such as percentages, performance improvements, or project scale.
              </p>

            </div>

            <div className="border border-white/10 rounded-2xl p-5 bg-black/20">

              <h3 className="text-pink-300 font-semibold text-lg">
                Add Missing Technologies
              </h3>

              <p className="text-gray-300 mt-3 leading-7">
                Include Docker, CI/CD pipelines, and Kubernetes to improve ATS matching for backend engineering roles.
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}

export default Results