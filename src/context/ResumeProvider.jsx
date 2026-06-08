import { useState, useCallback } from "react"
import { ResumeContext } from "./ResumeContext"

function ResumeProvider({ children }) {
  const [resumeFile, setResumeFile] = useState(null)
  const [jobDescription, setJobDescription] = useState("")
  const [atsScore, setAtsScore] = useState(0)
  const [company, setCompany] = useState("")
  const [role, setRole] = useState("")

  const resetContext = useCallback(() => {
    setResumeFile(null)
    setJobDescription("")
    setAtsScore(0)
    setCompany("")
    setRole("")
  }, [])

  return (
    <ResumeContext.Provider value={{ resumeFile, setResumeFile, jobDescription, setJobDescription, atsScore, setAtsScore, company, setCompany, role, setRole, resetContext }}>
      {children}
    </ResumeContext.Provider>
  )
}

export default ResumeProvider