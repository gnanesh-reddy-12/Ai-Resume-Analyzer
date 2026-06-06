import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import AuthProvider from "./context/AuthProvider"
import { useAuth } from "./context/useAuth"
import Home from "./pages/Home"
import Loading from "./pages/Loading"
import Results from "./pages/Results"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import History from "./pages/History"

function ProtectedRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/loading" element={<ProtectedRoute><Loading /></ProtectedRoute>} />
          <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App