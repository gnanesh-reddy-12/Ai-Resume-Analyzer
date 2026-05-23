import { useState } from "react"
import { ResumeContext } from "./ResumeContext"

function ResumeProvider({ children }) {

  const [resumeFile, setResumeFile] = useState(null)

  const [jobDescription, setJobDescription] = useState("")

  const [atsScore, setAtsScore] = useState(0)

  return (
    <ResumeContext.Provider
    value={{
  resumeFile,
  setResumeFile,
  jobDescription,
  setJobDescription,
  atsScore,
  setAtsScore
}}
    >
      {children}
    </ResumeContext.Provider>
  )
}

export default ResumeProvider