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
    <div className="mt-20 flex justify-center px-6">

      <div className="w-full max-w-3xl h-72 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl flex flex-col items-center justify-center text-center hover:border-purple-400 hover:shadow-[0_0_50px_rgba(168,85,247,0.3)] transition duration-300">

        <div className="text-6xl mb-4">
          📄
        </div>

        <h2 className="text-2xl text-white font-semibold">
          Upload Your Resume
        </h2>

        <p className="text-gray-400 mt-3">
          PDF or DOCX only
        </p>

        <label className="mt-6 bg-white text-black px-6 py-3 rounded-full font-medium hover:scale-105 transition cursor-pointer">

          Choose File

          <input
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={handleFileChange}
          />

        </label>

        {resumeFile && (
  <p className="text-green-400 mt-5">
    Uploaded: {resumeFile.name}
  </p>
)}

      </div>

    </div>
  )
}

export default UploadBox