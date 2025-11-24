"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabaseAuth } from "@/lib/supabase-auth-client"
import { useRouter } from "next/navigation"

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check active session
    supabaseAuth.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for changes
    const {
      data: { subscription },
    } = supabaseAuth.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    const { error } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    router.push("/")
  }

  const signUp = async (email, password, fullName) => {
    // Check if user already exists
    const { data: existingUser } = await supabaseAuth.from("profiles").select("id").eq("id", email).single()

    if (existingUser) {
      throw new Error("An account with this email already exists. Please sign in instead.")
    }

    const { data, error } = await supabaseAuth.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        // Email verification redirect URL
        emailRedirectTo:
          `https://buythelook.pdfwhisperer.xyz/auth/callback`,
      },
    })

    if (error) throw error

    // Check if email confirmation is required
    if (data?.user && !data.user.confirmed_at) {
      return { requiresEmailConfirmation: true }
    }

    router.push("/")
  }

  const signOut = async () => {
    await supabaseAuth.auth.signOut()
    router.push("/")
  }

  return <AuthContext.Provider value={{ user, signIn, signUp, signOut, loading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
