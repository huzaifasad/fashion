"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await signIn(email, password)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] p-4">
      <div className="w-full max-w-md bg-white p-8 border border-black/5 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif mb-2">Welcome Back</h1>
          <p className="text-muted-foreground text-sm uppercase tracking-widest">Sign in to your account</p>
        </div>

        {error && <div className="bg-red-50 text-red-500 text-sm p-4 mb-6 border border-red-100">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-transparent border-0 border-b border-black/20 rounded-none px-0 focus-visible:ring-0 focus-visible:border-black"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-transparent border-0 border-b border-black/20 rounded-none px-0 focus-visible:ring-0 focus-visible:border-black"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white hover:bg-black/90 uppercase tracking-widest text-xs h-12 rounded-none"
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/signup" className="text-black underline underline-offset-4 hover:opacity-70">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
