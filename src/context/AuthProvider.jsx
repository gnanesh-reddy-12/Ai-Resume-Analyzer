import { useState, useEffect } from "react"
import { AuthContext } from "./AuthContext"
import { supabase } from "../supabase"

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
  }

  // We expose token as session?.access_token to keep compatibility with backend requests
  const token = session?.access_token

  return (
    <AuthContext.Provider value={{ user, token, session, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}