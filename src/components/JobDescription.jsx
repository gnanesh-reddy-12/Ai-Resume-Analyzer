import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import { ResumeContext } from "../context/ResumeContext"

function JobDescription() { 
    const navigate = useNavigate()

 const {
  jobDescription,
  setJobDescription,
  resumeFile,
  setAtsScore
} = useContext(ResumeContext)
const handleAnalyze = () => {

  if (!resumeFile) {
    alert("Please upload a resume")
    return
  }

  if (jobDescription.trim() === "") {
    alert("Please paste a job description")
    return
  }

  let score = 50

  score += Math.min(jobDescription.length / 40, 30)

  score += 20

  score = Math.min(Math.floor(score), 98)

  setAtsScore(score)

  navigate("/loading")
}
  return (
    <section className="mt-20 px-6 pb-20">

      <div className="max-w-4xl mx-auto bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-8">

        <h2 className="text-3xl font-bold text-white">
          Paste Job Description
        </h2>

        <p className="text-gray-400 mt-3">
          Add the job posting to analyze ATS compatibility and keyword matching.
        </p>

        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the full job description here..."
          className="w-full h-64 mt-8 bg-black/30 border border-white/10 rounded-2xl p-5 text-white placeholder-gray-500 outline-none resize-none focus:border-purple-400 transition"
        />

        <div className="flex items-center justify-between mt-4">

          <p className="text-gray-500">
            {jobDescription.length} characters
          </p>

          <button
            onClick={handleAnalyze}
            className="bg-white text-black px-7 py-3 rounded-full font-semibold hover:scale-105 transition">
            Analyze Resume
            </button>

        </div>

      </div>

    </section>
  )
}

export default JobDescription