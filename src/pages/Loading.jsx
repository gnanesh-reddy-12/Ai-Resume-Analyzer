import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useContext } from "react"
import { ResumeContext } from "../context/ResumeContext"

function Loading() {

  const navigate = useNavigate()

  const { resumeFile, jobDescription } = useContext(ResumeContext)

  useEffect(() => {

    const timer = setTimeout(() => {
      navigate("/results", {
      state: {
        resumeFile,
        jobDescription
      }
    })
    }, 3000)

    return () => clearTimeout(timer)

  }, [navigate, resumeFile, jobDescription])

  return (
    <div className="min-h-screen bg-[#050816] flex flex-col items-center justify-center text-white relative overflow-hidden">

      {/* Glow */}
      <div className="absolute w-[400px] h-[400px] bg-purple-600 opacity-20 blur-[120px] rounded-full"></div>

      {/* Spinner */}
      <div className="relative z-10">

        <div className="w-24 h-24 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>

        <h1 className="text-4xl font-bold mt-10 text-center">
          Analyzing Resume...
        </h1>

        <p className="text-gray-400 mt-4 text-center">
          Matching ATS keywords and generating AI insights.
        </p>

      </div>

    </div>
  )
}

export default Loading