"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCart } from "@/lib/cart-context"
import { useState, useEffect } from "react"
import { supabaseAuth } from "@/lib/supabase-auth-client"
import { Menu, X, ChevronDown, User, LogOut, Coins } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

export function Header() {
  const pathname = usePathname()
  const { totalItems } = useCart()
  const [credits, setCredits] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const { user, signOut } = useAuth()
  const userName = user?.user_metadata?.full_name?.split(" ")[0] || "Profile"

  useEffect(() => {
    const fetchCredits = async () => {
      if (!user) {
        setCredits(0)
        return
      }

      try {
        const { data, error } = await supabaseAuth.from("profiles").select("credits").eq("id", user.id).single()

        if (data) {
          setCredits(data.credits ?? 0)
        }
      } catch (err) {
        console.error("[v0] Failed to fetch credits:", err)
      }
    }

    fetchCredits()

    // Listen for credit updates
    window.addEventListener("credits-updated", fetchCredits)
    return () => window.removeEventListener("credits-updated", fetchCredits)
  }, [user])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border transition-all duration-500">
      <div className="container mx-auto flex h-20 items-center justify-between px-6 md:px-12">
        {/* Left Nav - Desktop */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/quiz"
            className={`text-xs font-bold uppercase tracking-[0.15em] transition-colors hover:text-accent ${
              pathname === "/quiz" ? "text-accent" : "text-muted-foreground"
            }`}
          >
            Style Quiz
          </Link>
          <Link
            href="/outfits"
            className={`text-xs font-bold uppercase tracking-[0.15em] transition-colors hover:text-accent ${
              pathname === "/outfits" ? "text-accent" : "text-muted-foreground"
            }`}
          >
            Collections
          </Link>
        </nav>

        {/* Center Logo */}
        <Link
          href="/"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl md:text-3xl font-serif font-bold tracking-tight text-foreground hover:opacity-80 transition-opacity"
        >
          BuyTheLook
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-6 ml-auto md:ml-0">
          {user && (
            <Link
              href="/credits"
              className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-accent transition-colors"
            >
              <span className="text-accent">{credits}</span> Credits
            </Link>
          )}

          {user ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:text-accent transition-colors"
              >
                {userName}
                <ChevronDown className={`w-4 h-4 transition-transform ${profileMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-border shadow-lg">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-accent/10 transition-colors"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <Link
                    href="/credits"
                    className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-accent/10 transition-colors"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    <Coins className="w-4 h-4" />
                    Buy Credits
                  </Link>
                  <button
                    onClick={() => {
                      signOut()
                      setProfileMenuOpen(false)
                    }}
                    className="flex items-center gap-2 w-full px-4 py-3 text-sm text-left hover:bg-accent/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs font-bold uppercase tracking-wider hover:text-accent transition-colors hidden md:block"
            >
              Sign In
            </Link>
          )}

          <Link href="/cart" className="relative group p-2">
            <svg
              className="w-5 h-5 text-foreground transition-transform group-hover:scale-110"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="square"
                strokeLinejoin="miter"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                {totalItems}
              </span>
            )}
          </Link>

          <button className="md:hidden text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-t border-border">
          <nav className="flex flex-col px-6 py-4 gap-4">
            <Link
              href="/quiz"
              className="text-sm font-bold uppercase tracking-wider hover:text-accent transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Style Quiz
            </Link>
            <Link
              href="/outfits"
              className="text-sm font-bold uppercase tracking-wider hover:text-accent transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Collections
            </Link>

            {user && (
              <Link
                href="/credits"
                className="text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-accent transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Credits: <span className="text-accent">{credits}</span>
              </Link>
            )}

            {user ? (
              <>
                <Link
                  href="/profile"
                  className="text-sm font-bold uppercase tracking-wider hover:text-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/credits"
                  className="text-sm font-bold uppercase tracking-wider hover:text-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Buy Credits
                </Link>
                <button
                  onClick={() => {
                    signOut()
                    setMobileMenuOpen(false)
                  }}
                  className="text-left text-sm font-bold uppercase tracking-wider hover:text-accent transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="text-sm font-bold uppercase tracking-wider hover:text-accent transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
