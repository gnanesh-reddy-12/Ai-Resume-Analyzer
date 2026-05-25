import { useContext, useEffect, useState } from "react"
import { ResumeContext } from "../context/ResumeContext"

function Results() {

  const {
    resumeFile,
    jobDescription,
  } = useContext(ResumeContext)

  const [backendData, setBackendData] = useState(null)

  useEffect(() => {

    console.log(resumeFile)

    if (!resumeFile) return

    const formData = new FormData()

    formData.append("resume", resumeFile)

    formData.append("job_description", jobDescription)

    fetch("https://ai-resume-analyzer-3sa6.onrender.com/analyze", {
      method: "POST",
      body: formData
    })
      .then((response) => response.json())
      .then((data) => {
        setBackendData(data)
      })
      .catch((error) => {
        console.log(error)
      })

  }, [ resumeFile, jobDescription ])

  if (!backendData) {
    return (
      <div className="min-h-screen bg-[#050816] text-white flex items-center justify-center text-2xl">
        Loading analysis...
      </div>
    )
  }

  return (

    <div className="min-h-screen bg-[#050816] text-white p-6 md:p-10 relative overflow-hidden">

      {/* Background Glow */}
      <div className="absolute top-[-200px] left-[-100px] w-[500px] h-[500px] bg-purple-600 rounded-full blur-[150px] opacity-20"></div>

      <div className="absolute bottom-[-200px] right-[-100px] w-[500px] h-[500px] bg-blue-600 rounded-full blur-[150px] opacity-20"></div>

      <div className="relative z-10">

        {/* Heading */}
        <h1 className="text-5xl font-bold">
          ATS Analysis Results
        </h1>

        {/* Backend Message */}
        <div className="mt-6 bg-green-500/20 border border-green-500/30 text-green-300 px-5 py-4 rounded-2xl">
          {backendData?.message}
        </div>

        {/* Resume Info */}
        <div className="mt-8 bg-white/5 border border-white/10 rounded-3xl p-6">

          <p className="text-purple-300">
            Uploaded Resume:
            <span className="text-white ml-2">
              {resumeFile?.name}
            </span>
          </p>

          <p className="text-blue-300 mt-4">
            Job Description Length:
            <span className="text-white ml-2">
              {backendData?.job_description_length}
            </span>
          </p>

          <p className="text-green-300 mt-4">
            Resume Preview:
          </p>

          <div className="mt-3 bg-black/30 border border-white/10 rounded-xl p-4 text-gray-300 max-h-64 overflow-y-auto whitespace-pre-wrap">
            {backendData?.resume_text_preview}
          </div>

        </div>

        {/* Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12">

          {/* ATS Score */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-8">

            <h2 className="text-gray-400 text-lg">
              ATS Score
            </h2>

            <div className="mt-8 flex items-center justify-center">

              <div className="w-44 h-44 rounded-full border-[12px] border-purple-500 flex items-center justify-center text-5xl font-bold">
                {backendData?.ats_score || 0}%
              </div>

            </div>

            <p className="text-yellow-300 mt-6">
              Keyword Match Score:
              <span className="text-white ml-2">
                {backendData?.keyword_score || 0}%
              </span>
            </p>

            <p className="text-cyan-300 mt-3">
              Semantic Similarity Score:
              <span className="text-white ml-2">
                {backendData?.semantic_score || 0}%
              </span>
            </p>

          </div>

          {/* Matched Keywords */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-8">

            <h2 className="text-green-300 text-2xl font-bold">
              Matched Keywords
            </h2>

            <div className="flex flex-wrap gap-3 mt-6">

              {backendData?.matched_keywords?.map((keyword, index) => (

                <span
                  key={index}
                  className="bg-green-500/20 text-green-300 px-4 py-2 rounded-full border border-green-500/30"
                >
                  {keyword}
                </span>

              ))}

            </div>

          </div>

          {/* Missing Keywords */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-8">

            <h2 className="text-red-300 text-2xl font-bold">
              Missing Keywords
            </h2>

            <div className="flex flex-wrap gap-3 mt-6">

              {backendData?.missing_keywords?.map((keyword, index) => (

                <span
                  key={index}
                  className="bg-red-500/20 text-red-300 px-4 py-2 rounded-full border border-red-500/30"
                >
                  {keyword}
                </span>

              ))}

            </div>

          </div>

        </div>

        {/* AI Suggestions */}
        <div className="mt-12 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-2xl">

          <h2 className="text-3xl font-bold text-purple-300">
            AI Resume Suggestions
          </h2>

          <pre className="mt-6 text-gray-300 whitespace-pre-wrap font-sans leading-8">
            {backendData?.ai_suggestions || "Generating AI suggestions..."}
          </pre>

        </div>

      </div>

    </div>
  )
}

export default Results