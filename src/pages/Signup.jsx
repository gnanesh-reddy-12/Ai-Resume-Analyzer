import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "../context/useAuth"

function Signup() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async () => {
    setError("")
    if (!email || !password) return setError("All fields required")
    if (password.length < 6) return setError("Password must be at least 6 characters")
    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Signup failed")
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
          <h2 className="text-4xl font-bold text-white leading-tight">Start for free.<br />Get hired faster.</h2>
          <p className="text-blue-100 mt-4 text-lg">Join thousands of job seekers who use ResumeAI to beat ATS filters.</p>
        </div>
        <p className="text-blue-200 text-sm">© 2025 ResumeAI</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-slate-900">Create account</h1>
          <p className="text-slate-500 mt-2">Start analyzing your resume for free</p>

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
              <input type="password" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} className="input-field" />
            </div>
          </div>

          <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full mt-6 py-4">
            {loading ? "Creating account..." : "Create Free Account"}
          </button>

          <p className="text-center text-slate-500 mt-6 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-500 font-semibold hover:text-blue-600">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default Signup