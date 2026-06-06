import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/useAuth"

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="px-6 pt-5">
      <nav className="liquid-navbar max-w-5xl mx-auto rounded-full px-8 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Resume<span className="text-cyan-500 drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]">AI</span>
        </h1>

        <div className="flex items-center gap-4">
          <ul className="hidden md:flex gap-2 font-medium">
            <li>
              <a href="#features" className="px-4 py-2 rounded-full text-white hover:bg-white/15 transition-all duration-300">Features</a>
            </li>
            <li>
              <a href="#how-it-works" className="px-4 py-2 rounded-full text-white hover:bg-white/15 transition-all duration-300">How It Works</a>
            </li>
            {user && (
              <li>
                <button onClick={() => navigate("/history")} className="px-4 py-2 rounded-full text-white hover:bg-white/15 transition-all duration-300">
                  History
                </button>
              </li>
            )}
          </ul>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-white/70 text-sm hidden md:block">{user.email}</span>
              <button
                onClick={() => { logout(); navigate("/login") }}
                className="px-5 py-2.5 rounded-full bg-white/25 backdrop-blur-md border border-white/30 text-slate-900 font-semibold hover:bg-white/35 transition-all duration-300"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-3 rounded-full bg-white/25 backdrop-blur-md border border-white/30 text-slate-900 font-semibold hover:bg-white/35 transition-all duration-300"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>
    </div>
  )
}

export default Navbar