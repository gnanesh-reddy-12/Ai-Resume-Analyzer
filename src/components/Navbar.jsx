import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/useAuth"
import { motion } from "framer-motion"

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup"

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200"
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <button onClick={() => navigate("/")} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <span className="font-bold text-lg text-slate-900">ResumeAI</span>
        </button>

        {!isAuthPage && (
          <nav className="hidden md:flex items-center gap-1">
            <a href="#features" className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">Features</a>
            <a href="#how-it-works" className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">How It Works</a>
            {user && (
              <button onClick={() => navigate("/history")} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
                History
              </button>
            )}
          </nav>
        )}

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden md:block text-sm text-slate-500">{user.email}</span>
              <button onClick={() => { logout(); navigate("/login") }} className="btn-secondary text-sm px-4 py-2">
                Logout
              </button>
            </>
          ) : (
            !isAuthPage && (
              <button onClick={() => navigate("/login")} className="btn-primary text-sm px-4 py-2">
                Sign In
              </button>
            )
          )}
        </div>
      </div>
    </motion.header>
  )
}

export default Navbar