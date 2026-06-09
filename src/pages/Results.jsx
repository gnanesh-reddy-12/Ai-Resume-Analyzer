import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ResumeContext } from "../context/ResumeContext"
import { useAuth } from "../context/useAuth"
import Navbar from "../components/Navbar"

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } }

function ScoreRing({ score, size = 160, stroke = 10 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 75 ? "#10B981" : score >= 55 ? "#F59E0B" : "#EF4444"
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={stroke} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }} />
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl font-bold text-slate-900">{score}%</div>
        <div className="text-xs text-slate-500 mt-0.5">ATS Match</div>
      </div>
    </div>
  )
}

function HighlightedJobDescription({ text, matched, missing, optional }) {
  if (!text) return <p className="text-slate-400 text-sm">No job description provided.</p>;
  
  const allKeywords = [
    ...(matched || []).map(k => ({ word: k, type: 'matched' })),
    ...(missing || []).map(k => ({ word: k, type: 'missing' })),
    ...(optional || []).map(k => ({ word: k, type: 'optional' }))
  ].sort((a, b) => b.word.length - a.word.length);

  if (allKeywords.length === 0) {
    return <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">{text}</p>;
  }

  const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`\\b(${allKeywords.map(k => escapeRegExp(k.word)).join('|')})\\b`, 'gi');
  const parts = text.split(pattern);

  return (
    <div className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed font-mono bg-slate-50 p-4 md:p-6 rounded-xl border border-slate-200 h-48 md:h-64 overflow-y-auto">
      {parts.map((part, i) => {
        const lowerPart = part.toLowerCase();
        const keywordMatch = allKeywords.find(k => k.word.toLowerCase() === lowerPart);
        
        if (keywordMatch) {
          if (keywordMatch.type === 'matched') {
            return <span key={i} className="bg-green-200 text-green-900 font-bold px-1 rounded">{part}</span>;
          } else if (keywordMatch.type === 'missing') {
            return <span key={i} className="bg-red-200 text-red-900 font-bold px-1 rounded">{part}</span>;
          } else if (keywordMatch.type === 'optional') {
            return <span key={i} className="bg-blue-200 text-blue-900 font-bold px-1 rounded">{part}</span>;
          }
        }
        return <span key={i}>{part}</span>;
      })}
    </div>
  );
}

function Results() {
  const { resumeFile, jobDescription, company, role, resetContext } = useContext(ResumeContext)
  const { token } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [jdDrawerOpen, setJdDrawerOpen] = useState(false)

  useEffect(() => {
    if (jdDrawerOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [jdDrawerOpen])

  // AI Improvement State
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState(null)

  useEffect(() => {
    if (!resumeFile) return
    if (!token) { navigate("/login"); return }

    const formData = new FormData()
    formData.append("resume", resumeFile)
    formData.append("job_description", jobDescription)
    formData.append("company_name", company.trim())
    formData.append("job_role", role.trim())

    fetch(`${import.meta.env.VITE_BACKEND_URL}/analyze`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
      .then(async (r) => {
        const d = await r.json()
        if (!r.ok) {
          throw new Error(d.detail || d.error || "Analysis failed. Please try logging out and back in.")
        }
        return d
      })
      .then(d => setData(d))
      .catch(e => setError(e.message))
  }, [])

  const handleAiImprove = async () => {
    if (!resumeFile || !jobDescription) return;
    setIsAiLoading(true);
    
    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("job_description", jobDescription);
    if (data?.id) {
      formData.append("analysis_id", data.id);
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/improve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.detail || result.error || "Failed to generate improvements.");
      }
      
      if (result.suggestions) {
        setAiSuggestions(result.suggestions);
      }
    } catch (err) {
      console.error("AI Improve Request Failed:", err);
      alert("Failed to connect to the AI service.");
    } finally {
      setIsAiLoading(false);
    }
  }

  if (error) return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Analysis Failed</h2>
          <p className="text-slate-500 mt-2 max-w-sm">{error}</p>
          <button onClick={() => navigate("/")} className="btn-primary mt-6">Try Again</button>
        </div>
      </div>
    </div>
  )

  if (!data) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500">Loading analysis...</p>
      </div>
    </div>
  )

  const matchedKeywords = data.matched_keywords?.length || 0
  const jobAnalysis = data.job_analysis || data.eligibility?.job_analysis

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6 md:mb-8">
          <div>
            <p className="text-blue-500 text-xs md:text-sm font-semibold uppercase tracking-widest">Analysis Complete</p>
            <h1 className="text-2xl md:text-4xl font-bold text-slate-900 mt-1">Your ATS Report</h1>
            {company && <p className="text-slate-700 font-semibold mt-1">{company}{role ? ` — ${role}` : ""}</p>}
            <p className="text-slate-500 mt-0.5">{resumeFile?.name}</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button onClick={handleAiImprove} className="btn-primary flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border-0">
              Improve Resume
            </button>
            <button onClick={() => navigate("/history")} className="btn-secondary text-sm">View History</button>
          </div>
        </motion.div>


        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <motion.div variants={item} className="card p-6 md:p-8 flex flex-col items-center justify-center text-center">
            <ScoreRing score={data.ats_score || 0} />
            <p className="text-xs text-slate-400 mt-5 max-w-[200px]">
              Based strictly on the presence of required keywords from the job description.
            </p>
          </motion.div>

          <motion.div variants={item} className="card p-4 md:p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              </div>
              <h2 className="font-semibold text-slate-900">Found Keywords</h2>
              <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{matchedKeywords}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.matched_keywords?.map((kw, i) => <span key={i} className="tag-green">{kw}</span>)}
              {!data.matched_keywords?.length && <p className="text-slate-400 text-sm">No matched keywords</p>}
            </div>
          </motion.div>

          <motion.div variants={item} className="card p-4 md:p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </div>
              <h2 className="font-semibold text-slate-900">Missing Keywords</h2>
              <span className="ml-auto text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">{data.missing_keywords?.length || 0}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.missing_keywords?.map((kw, i) => <span key={i} className="tag-red">{kw}</span>)}
              {!data.missing_keywords?.length && <p className="text-slate-400 text-sm">No missing keywords</p>}
            </div>
          </motion.div>
        </motion.div>

        {/* Job Description Highlight Section */}
        <motion.div variants={container} initial="hidden" animate="show" className="mb-8">
          <motion.div variants={item} className="card p-4 md:p-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-slate-900 text-xl">Job Description Analysis</h2>
              <button
                onClick={() => setJdDrawerOpen(true)}
                className="text-xs bg-blue-50 text-blue-600 font-semibold px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors flex items-center gap-1"
              >
                <span>Pop out</span> ↗
              </button>
            </div>
            
            {jobAnalysis && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">🎯 What the Job Actually Is</p>
                  <p className="text-sm text-slate-800 leading-relaxed">{jobAnalysis.role_focus}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">🔍 What the Recruiter Needs</p>
                  <p className="text-sm text-slate-800 leading-relaxed">{jobAnalysis.recruiter_needs}</p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3 md:gap-4 mb-4 text-xs font-semibold uppercase tracking-wide">
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-400"></div> Matched</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-400"></div> Missing</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-400"></div> Optional</span>
            </div>
            <HighlightedJobDescription 
              text={jobDescription} 
              matched={data.matched_keywords} 
              missing={data.missing_keywords} 
              optional={data.optional_keywords} 
            />
          </motion.div>
        </motion.div>

        {/* AI Improvement Section */}
        {isAiLoading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-5 md:p-8 mb-6 md:mb-8 text-center bg-indigo-50 border-indigo-100">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="font-bold text-indigo-900 text-lg">AI is analyzing your resume...</h2>
            <p className="text-indigo-700/70 text-sm mt-1">Generating summary, rewriting bullets, checking qualifications.</p>
          </motion.div>
        )}

        {aiSuggestions && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 mb-8">
            
            {/* AI Snapshot */}
            {aiSuggestions.ai_snapshot && (
              <div className="card p-5 md:p-6 border-blue-100">
                <h2 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                  <span>✨</span> AI Snapshot & Gaps
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span>🌟</span> What to Keep
                    </p>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{aiSuggestions.ai_snapshot.keep}</p>
                  </div>
                  <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span>⚠️</span> What is Missing
                    </p>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{aiSuggestions.ai_snapshot.missing}</p>
                  </div>
                  <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span>⏳</span> Experience Gaps
                    </p>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{aiSuggestions.ai_snapshot.experience_gap}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Professional Summary */}
            {aiSuggestions.summary && (
              <div className="card p-5 md:p-8 border-green-100">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="font-bold text-slate-900 text-lg">Recruiter-Optimized Summary</h2>
                    <p className="text-slate-500 text-xs mt-0.5 uppercase tracking-wide font-semibold">Copy-paste ready for the top of your resume</p>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(aiSuggestions.summary);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                  >
                    {copied ? "Copied! ✓" : "Copy"}
                  </button>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                  <p className="text-slate-900 text-sm leading-relaxed">{aiSuggestions.summary}</p>
                </div>
              </div>
            )}

            {/* Skills Recommender & Integration */}
            {aiSuggestions.skills_recommendation && (
              <div className="card p-5 md:p-8 border-amber-100">
                <h2 className="font-bold text-slate-900 text-lg mb-1 flex items-center gap-2">
                  <span>🔧</span> Skills Recommender & Integration
                </h2>
                <p className="text-slate-500 text-xs mb-4 font-semibold uppercase tracking-wide">
                  Keywords to prioritize and integrate into your project descriptions
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span>✓</span> Skills to Keep
                    </p>
                    <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                      {aiSuggestions.skills_recommendation.keep_skills?.map((sk, idx) => (
                        <span key={idx} className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">{sk}</span>
                      ))}
                      {!aiSuggestions.skills_recommendation.keep_skills?.length && <span className="text-slate-400 text-xs">No specific matching skills found to keep.</span>}
                    </div>
                  </div>
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span>💡</span> Skills to Add
                    </p>
                    <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                      {aiSuggestions.skills_recommendation.add_skills?.map((sk, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{sk}</span>
                      ))}
                      {!aiSuggestions.skills_recommendation.add_skills?.length && <span className="text-slate-400 text-xs">No missing skills required.</span>}
                    </div>
                  </div>
                </div>
                {aiSuggestions.skills_recommendation.integration_advice && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <span>💡</span> Project & Experience Integration Advice
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                      {aiSuggestions.skills_recommendation.integration_advice}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Bullet Point Suggestions grouped by Section */}
            {((aiSuggestions.sections && aiSuggestions.sections.length > 0) || (aiSuggestions.bullets && aiSuggestions.bullets.length > 0)) && (
              <div className="card p-5 md:p-8 border-indigo-100">
                <h2 className="font-bold text-slate-900 text-lg mb-1">Tailored Bullet Point Suggestions</h2>
                <p className="text-slate-500 text-xs mb-6 font-semibold uppercase tracking-wide">
                  Recommended adjustments to increase ATS keyword matching and impact
                </p>
                <div className="space-y-8">
                  {aiSuggestions.sections && aiSuggestions.sections.length > 0 ? (
                    aiSuggestions.sections.map((section, idx) => (
                      <div key={idx} className="space-y-4">
                        <h3 className="font-bold text-sm text-indigo-600 uppercase tracking-wide bg-indigo-50/50 px-3 py-1.5 rounded-lg w-fit">
                          {section.title}
                        </h3>
                        <div className="space-y-4 pl-1">
                          {section.bullets.map((b, bIdx) => (
                            <div key={bIdx} className="border-b border-slate-100 pb-4 last:border-b-0">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Original Bullet</span>
                                  <p className="text-slate-500 text-sm line-through decoration-red-200 decoration-1">{b.original}</p>
                                </div>
                                <div className="space-y-1 border-l-0 md:border-l md:pl-4 border-slate-200">
                                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                                    ✨ Suggested Rewrite
                                  </span>
                                  <p className="text-slate-900 text-sm font-medium leading-relaxed">{b.rewritten}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    /* Fallback for legacy format if any */
                    <div className="space-y-4">
                      {aiSuggestions.bullets.map((s, i) => (
                        <div key={i} className="border-b border-slate-100 pb-4 last:border-b-0">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Original Bullet</span>
                              <p className="text-slate-500 text-sm line-through decoration-red-200 decoration-1">{s.original}</p>
                            </div>
                            <div className="space-y-1 border-l-0 md:border-l md:pl-4 border-slate-200">
                              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                                ✨ Suggested Rewrite
                              </span>
                              <p className="text-slate-900 text-sm font-medium leading-relaxed">{s.rewritten}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        <div className="flex gap-4 justify-center mt-10">
          <button onClick={() => { resetContext(); navigate("/"); }} className="btn-primary">← Analyze Another</button>
        </div>

        {/* Floating JD Button */}
        <button
          onClick={() => setJdDrawerOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-slate-900 text-white rounded-full p-4 shadow-xl hover:bg-slate-800 flex items-center gap-2 transition-all hover:scale-105"
          style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}
        >
          <span className="text-lg">📋</span>
          <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">View JD</span>
        </button>

        {/* JD Drawer Overlay */}
        <AnimatePresence>
          {jdDrawerOpen && (
            <div className="fixed inset-0 z-50 overflow-hidden">
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setJdDrawerOpen(false)}
                className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
              />

              {/* Drawer Panel */}
              <div className="absolute inset-y-0 right-0 max-w-full flex">
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 26, stiffness: 220 }}
                  className="w-screen md:w-[550px] bg-white h-full shadow-2xl flex flex-col overflow-hidden relative border-l border-slate-200"
                >
                  {/* Header */}
                  <div className="border-b border-slate-200 px-6 py-5 flex items-center justify-between bg-slate-50">
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900">Job Description</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Matched and missing keyword highlights</p>
                    </div>
                    <button 
                      onClick={() => setJdDrawerOpen(false)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Body */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Legend */}
                    <div className="flex flex-wrap gap-3 text-[10px] font-bold uppercase tracking-wider bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                      <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-400"></div> Matched</span>
                      <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-400"></div> Missing</span>
                      <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-400"></div> Optional</span>
                    </div>

                    <HighlightedJobDescription 
                      text={jobDescription || data?.job_description_preview} 
                      matched={data.matched_keywords} 
                      missing={data.missing_keywords} 
                      optional={data.optional_keywords} 
                    />
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Results