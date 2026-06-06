import { useState } from "react"
import { AuthContext } from "./AuthContext"

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"))
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem("token")
    if (!t) return null
    return {
      email: localStorage.getItem("email"),
      user_id: localStorage.getItem("user_id")
    }
  })

  const login = (data) => {
    localStorage.setItem("token", data.token)
    localStorage.setItem("email", data.email)
    localStorage.setItem("user_id", data.user_id)
    setToken(data.token)
    setUser({ email: data.email, user_id: data.user_id })
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("email")
    localStorage.removeItem("user_id")
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}