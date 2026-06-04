import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import { ResumeContext } from "../context/ResumeContext"

function AnalyzeSection() {

  const navigate = useNavigate()

  const {
    resumeFile,
    setResumeFile,
    jobDescription,
    setJobDescription,
    setAtsScore
  } = useContext(ResumeContext)

  const handleFileChange = (event) => {

    const file = event.target.files[0]

    if (!file) return

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]

    if (!allowedTypes.includes(file.type)) {
      alert("Only PDF and DOCX files are allowed")
      return
    }

    setResumeFile(file)
  }

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

    <section
      id="upload"
      className="px-6 pb-24"
    >

      <div className="max-w-6xl mx-auto rounded-[40px] border border-white/30 bg-white/20 backdrop-blur-2xl shadow-[0_8px_32px_rgba(31,38,135,0.12)] p-10 md:p-12">

        <div className="text-center">

          <p className="text-sky-700 uppercase tracking-[0.25em] font-semibold">
            Resume Analysis
          </p>

          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mt-4">
            Analyze Your Resume
          </h2>

          <p className="text-slate-600 mt-4 max-w-2xl mx-auto">
            Upload your resume and paste a job description
            to receive ATS scoring, keyword analysis,
            semantic matching and AI suggestions.
          </p>

        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-12">

          {/* Upload Card */}

          <div
            className="
            bg-white/10
            border border-white/20
            rounded-3xl
            p-8
            min-h-[380px]
            flex
            flex-col
            justify-center
            items-center
            text-center
            "
          >

            <h3 className="text-3xl font-semibold text-slate-800">
              Upload Resume
            </h3>

            <p className="text-slate-600 mt-3">
              PDF or DOCX files only
            </p>

            <label
              className="
              mt-8
              inline-flex
              border
              border-sky-500
              text-slate-800
              px-8
              py-4
              rounded-2xl
              cursor-pointer
              hover:bg-sky-500/10
              transition
              "
            >

              Choose File

              <input
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                onChange={handleFileChange}
              />

            </label>

            {resumeFile && (

              <div className="mt-6 p-4 rounded-2xl bg-green-500/10 border border-green-500/20 w-full">

                <p className="text-green-700 font-medium break-all">
                  ✓ {resumeFile.name}
                </p>

              </div>

            )}

          </div>

          {/* Job Description Card */}

          <div
            className="
            bg-white/10
            border border-white/20
            rounded-3xl
            p-8
            min-h-[380px]
            flex
            flex-col
            justify-center
            "
          >

            <h3 className="text-3xl font-semibold text-slate-800">
              Job Description
            </h3>

            <p className="text-slate-600 mt-3">
              Paste the target job description
            </p>

            <textarea
              value={jobDescription}
              onChange={(e) =>
                setJobDescription(e.target.value)
              }
              placeholder="Paste the full job description here..."
              className="
              w-full
              h-52
              mt-6
              bg-white/20
              border
              border-white/30
              rounded-2xl
              p-5
              text-slate-800
              placeholder-slate-500
              outline-none
              resize-none
              focus:border-sky-500
              "
            />

            <p className="text-slate-500 mt-3">
              {jobDescription.length} characters
            </p>

          </div>

        </div>

        <div className="flex justify-center mt-12">

          <button
            onClick={handleAnalyze}
            className="
            bg-sky-500
            hover:bg-sky-600
            text-white
            px-12
            py-4
            rounded-2xl
            font-semibold
            text-lg
            transition
            shadow-lg
            "
          >
            Analyze Resume
          </button>

        </div>

      </div>

    </section>

  )
}

export default AnalyzeSection