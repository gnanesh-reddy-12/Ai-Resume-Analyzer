import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "../context/useAuth"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async () => {
    setError("")
    if (!email || !password) return setError("All fields required")
    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Login failed")
      login(data)
      navigate("/")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 bg-blue-500 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-bold text-lg text-white">ResumeAI</span>
          </div>
        </div>
        <div>
          <h2 className="text-4xl font-bold text-white leading-tight">Optimize your resume.<br />Land more interviews.</h2>
          <p className="text-blue-100 mt-4 text-lg">AI-powered ATS analysis that helps you stand out from thousands of applicants.</p>
          <div className="mt-10 space-y-4">
            {["ATS score analysis", "Keyword optimization", "AI-powered suggestions", "Track your progress"].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-white">
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>
        <p className="text-blue-200 text-sm">© 2025 ResumeAI</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-slate-900">Welcome back</h1>
          <p className="text-slate-500 mt-2">Sign in to your ResumeAI account</p>

          {error && (
            <div className="mt-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
          )}

          <div className="mt-8 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Email</label>
              <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Password</label>
              <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} className="input-field" />
            </div>
          </div>

          <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full mt-6 py-4">
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-center text-slate-500 mt-6 text-sm">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-500 font-semibold hover:text-blue-600">Create one free</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default Login