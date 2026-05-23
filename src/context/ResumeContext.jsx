import { createContext } from "react"

export const ResumeContext = createContext({
  resumeFile: null,
  setResumeFile: () => {},
  jobDescription: "",
  setJobDescription: () => {},
  atsScore: 0,
  setAtsScore: () => {}
})