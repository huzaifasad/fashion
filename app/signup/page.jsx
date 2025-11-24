"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { signUp } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setLoading(true)

    try {
      const result = await signUp(email, password, fullName)

      if (result?.requiresEmailConfirmation) {
        setSuccess(true)
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] p-4">
        <div className="w-full max-w-md bg-white p-8 border border-black/5 shadow-xl">
          <div className="text-center mb-6">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-serif mb-2">Check Your Email</h1>
            <p className="text-muted-foreground text-sm">
              We've sent a confirmation link to <strong>{email}</strong>
            </p>
          </div>

          <Alert className="mb-6">
            <AlertDescription>
              Click the link in the email to verify your account and start styling. Don't forget to check your spam
              folder!
            </AlertDescription>
          </Alert>

          <Link
            href="/login"
            className="block w-full py-3 text-center bg-black text-white hover:bg-black/90 uppercase tracking-widest text-xs"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] p-4">
      <div className="w-full max-w-md bg-white p-8 border border-black/5 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif mb-2">Join the Atelier</h1>
          <p className="text-muted-foreground text-sm uppercase tracking-widest">Create your profile</p>
        </div>

        {error && <div className="bg-red-50 text-red-500 text-sm p-4 mb-6 border border-red-100">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              placeholder="Jane Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="bg-transparent border-0 border-b border-black/20 rounded-none px-0 focus-visible:ring-0 focus-visible:border-black"
            />
          </div>
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
              minLength={6}
              className="bg-transparent border-0 border-b border-black/20 rounded-none px-0 focus-visible:ring-0 focus-visible:border-black"
            />
            <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white hover:bg-black/90 uppercase tracking-widest text-xs h-12 rounded-none"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-black underline underline-offset-4 hover:opacity-70">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
