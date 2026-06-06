import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
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
    <div className="min-h-screen bg-[#ADD8E6] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/30 backdrop-blur-xl border border-white/40 rounded-3xl p-10 shadow-xl">
        <h1 className="text-3xl font-bold text-slate-800">Create account</h1>
        <p className="text-slate-600 mt-2">Start analyzing your resume for free</p>

        {error && (
          <div className="mt-4 bg-red-500/20 border border-red-500/30 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="mt-8 space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/40 border border-white/50 rounded-2xl px-5 py-4 text-slate-800 placeholder-slate-500 outline-none focus:border-sky-500 transition"
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="w-full bg-white/40 border border-white/50 rounded-2xl px-5 py-4 text-slate-800 placeholder-slate-500 outline-none focus:border-sky-500 transition"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-6 bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white py-4 rounded-2xl font-semibold text-lg transition"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className="text-center text-slate-600 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-sky-600 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Signup