import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
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
import History from "./pages/History"

function ProtectedRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/landing" />
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ResumeProvider>
          <Routes>
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/guest-loading" element={<GuestLoading />} />
            <Route path="/guest-results" element={<GuestResults />} />
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/loading" element={<ProtectedRoute><Loading /></ProtectedRoute>} />
            <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/landing" />} />
          </Routes>
        </ResumeProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App