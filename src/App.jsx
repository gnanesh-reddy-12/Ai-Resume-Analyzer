import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { useEffect } from "react"
import AuthProvider from "./context/AuthProvider"
import ResumeProvider from "./context/ResumeProvider"
import { useAuth } from "./context/useAuth"
import Landing from "./pages/Landing"
import Home from "./pages/Home"
import Loading from "./pages/Loading"
import GuestLoading from "./pages/GuestLoading"
import GuestResults from "./pages/GuestResults"
import Results from "./pages/Results"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import History from "./pages/History"
import Profile from "./pages/Profile"
import Privacy from "./pages/Privacy"
import Terms from "./pages/Terms"
import About from "./pages/About"

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth()
  if (loading) return null // or a loading spinner
  return token ? children : <Navigate to="/landing" />
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <ResumeProvider>
          <Routes>
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/guest-loading" element={<GuestLoading />} />
            <Route path="/guest-results" element={<GuestResults />} />
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/loading" element={<ProtectedRoute><Loading /></ProtectedRoute>} />
            <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Navigate to="/landing" />} />
          </Routes>
        </ResumeProvider>
      </AuthProvider>
    </Router>
  )
}


export default App