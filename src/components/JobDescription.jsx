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
    <section className="px-6 pb-24 mt-8">

    <div className="max-w-5xl mx-auto rounded-[32px] border border-white/50 bg-white/20 backdrop-blur-xl shadow-[0_8px_32px_rgba(31,38,135,0.15)] p-10">

      <h2 className="text-3xl font-semibold text-slate-900">
        Job Description
      </h2>

      <p className="text-slate-600 mt-2">
        Paste the target job description to analyze compatibility.
      </p>

      <textarea
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Paste the full job description here..."
        className="w-full h-72 mt-8 bg-white/30 border border-white/40 rounded-3xl p-6 text-slate-800 placeholder-slate-500 outline-none resize-none focus:border-blue-400 transition"
      />

      <div className="flex justify-between items-center mt-6">

        <span className="text-slate-500">
          {jobDescription.length} characters
        </span>

        <button
          onClick={handleAnalyze}
          className="bg-blue-500 text-white px-8 py-4 rounded-2xl font-semibold hover:scale-105 transition"
        >
          Analyze Resume
        </button>

      </div>

    </div>

    </section>
  )
}

export default JobDescription