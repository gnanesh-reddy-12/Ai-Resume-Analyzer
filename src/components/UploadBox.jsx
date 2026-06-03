import { useContext } from "react"
import { ResumeContext } from "../context/ResumeContext"

function UploadBox() {

  const { resumeFile, setResumeFile } = useContext(ResumeContext)

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

  return (
    <div className="px-6">

      <div className="max-w-5xl mx-auto rounded-[32px] border border-white/30 bg-white/20 backdrop-blur-2xl shadow-[0_8px_32px_rgba(31,38,135,0.15)] p-10">
        <div className="flex items-center justify-between flex-wrap gap-6">

          <div>
            <h2 className="text-3xl font-semibold text-white">
              Upload Your Resume
            </h2>

            <p className="text-gray-400 mt-2">
              PDF or DOCX only
            </p>
          </div>

          <label className="border border-teal-400 text-white px-8 py-4 rounded-2xl cursor-pointer hover:bg-teal-400/10 transition">

            Choose File

            <input
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              onChange={handleFileChange}
            />

          </label>

        </div>

        {resumeFile && (
          <p className="text-green-400 mt-6">
            ✓ {resumeFile.name}
          </p>
        )}

      </div>

    </div>
  )
}

export default UploadBox