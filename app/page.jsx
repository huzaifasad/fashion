"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { storage } from "@/lib/storage"
import { ArrowRight, User, Sparkles, CreditCard } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Footer } from "@/components/footer"
import { useAuth } from "@/components/auth-provider"
import { supabaseAuth } from "@/lib/supabase-auth-client"

export default function HomePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [userRequest, setUserRequest] = useState("")
  const [eventType, setEventType] = useState("")
  const [budget, setBudget] = useState("")
  const [moodFilter, setMoodFilter] = useState("all")
  const [outfits, setOutfits] = useState([])
  const [profile, setProfile] = useState(null)
  const [credits, setCredits] = useState(0)

  const [placeholderText, setPlaceholderText] = useState("")
  const [showCursor, setShowCursor] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const fullText = "A minimalist ivory suit for a summer wedding in Tuscany..."
  const typewriterSpeed = 80
  const pauseBeforeRestart = 3000
  const initialDelay = 1000

  useEffect(() => {
    const loadedOutfits = storage.getOutfits()
    setOutfits(loadedOutfits)
  }, [])

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    const { data, error } = await supabaseAuth.from("profiles").select("*").eq("id", user.id).single()

    if (data) {
      setProfile(data)
      setCredits(data.credits ?? 0)
    }
  }

  useEffect(() => {
    let typingTimer
    let cursorTimer
    let restartTimer

    const startTyping = () => {
      let index = 0
      setIsTyping(true)
      setPlaceholderText("")

      typingTimer = setInterval(() => {
        if (index < fullText.length) {
          setPlaceholderText(fullText.slice(0, index + 1))
          index++
        } else {
          clearInterval(typingTimer)
          setIsTyping(false)
          restartTimer = setTimeout(() => {
            startTyping()
          }, pauseBeforeRestart)
        }
      }, typewriterSpeed)
    }

    const initialTimer = setTimeout(() => {
      startTyping()
    }, initialDelay)

    cursorTimer = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)

    return () => {
      clearTimeout(initialTimer)
      clearInterval(typingTimer)
      clearInterval(cursorTimer)
      clearTimeout(restartTimer)
    }
  }, [])

  useEffect(() => {
    if (userRequest.length > 0) {
      setPlaceholderText("")
    }
  }, [userRequest])

  const handleDirectGenerate = () => {
    if (!userRequest.trim()) return

    const existingProfile = storage.getProfile() || {}
    const styledProfile = storage.getStyledProfile()

    const profile = {
      ...existingProfile,
      gender: existingProfile.gender || styledProfile?.gender || "unisex",
      height: existingProfile.height || styledProfile?.height_cm ? "average" : "average",
      bodyShape: existingProfile.bodyShape || styledProfile?.body_type || "average",
      style: existingProfile.style || "casual",
      occasion: eventType && eventType !== "all" ? eventType : existingProfile.occasion || "everyday",
      budget: budget && budget !== "all" ? budget : existingProfile.budget || "moderate",
      colors: existingProfile.colors || [],
      additionalDetails: userRequest,
      mood: moodFilter && moodFilter !== "all" ? moodFilter : existingProfile.mood || "confident",
    }

    storage.saveProfile(profile)
    storage.saveSelectionStatus(false)
    router.push("/generate")
  }

  const getOutfitImage = (outfit) => {
    if (!outfit || !outfit.items || outfit.items.length === 0) return "/placeholder.svg"

    const item = outfit.items[0]

    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      return item.images[item.images.length - 1]
    }

    if (typeof item.image === "string" && item.image.startsWith("[")) {
      try {
        const parsed = JSON.parse(item.image)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[parsed.length - 1].url || parsed[parsed.length - 1]
        }
      } catch (e) {
        console.error("Error parsing image JSON:", e)
      }
    }

    return item.image || "/placeholder.svg"
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-black selection:text-white">
      <main className="flex-1 flex flex-col items-center w-full">
        <section className="w-full relative min-h-screen flex items-center justify-center overflow-hidden bg-[#FAFAFA]">
          <div className="absolute inset-0 opacity-[0.015]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fillOpacity='1'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.343-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z'/%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: "120px 120px",
              }}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative z-10 text-center px-8 py-32"
          >
            <div className="max-w-4xl mx-auto">
              <span className="inline-block text-[10px] font-bold tracking-[0.5em] uppercase text-black/40 mb-12">
                Established 2024
              </span>

              <h1 className="text-[14vw] sm:text-[12vw] md:text-[10vw] lg:text-[8rem] xl:text-[9rem] leading-[0.85] font-serif tracking-tight text-black mb-16">
                The Art
                <br />
                of Style
              </h1>

              <div className="max-w-2xl mx-auto mb-16">
                <p className="text-lg md:text-xl leading-relaxed text-black/70 mb-12">
                  Experience the pinnacle of personal styling. AI-curated looks tailored to your unique essence and
                  occasion.
                </p>

                <div className="flex items-center justify-center gap-16 text-xs uppercase tracking-[0.2em] text-black/50 mb-16">
                  <div>
                    <div className="text-3xl font-serif text-black mb-2">500+</div>
                    <div>Curated Looks</div>
                  </div>
                  <div className="w-px h-16 bg-black/10" />
                  <div>
                    <div className="text-3xl font-serif text-black mb-2">98%</div>
                    <div>Satisfaction</div>
                  </div>
                </div>
              </div>

              <Link href="/quiz">
                <button className="group inline-flex items-center gap-3 border-b-2 border-black pb-2 text-xs font-bold tracking-[0.25em] uppercase hover:border-black/40 transition-all duration-300">
                  <span>Begin the Journey</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </motion.div>
        </section>

        {user && (
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="w-full bg-white py-20 px-6 md:px-12 border-t border-black/5"
          >
            <div className="max-w-[1200px] mx-auto">
              <div className="text-center mb-12">
                <span className="block text-xs font-bold tracking-[0.3em] uppercase mb-4 text-muted-foreground">
                  Your Account
                </span>
                <h2 className="text-4xl md:text-5xl font-serif text-black mb-4">Welcome Back</h2>
                <div className="w-24 h-[1px] bg-black mx-auto" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Link href="/profile" className="group">
                  <div className="border border-black/10 p-8 hover:border-black/30 transition-all duration-300 hover:shadow-lg bg-[#FAFAFA]">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 bg-black text-white flex items-center justify-center rounded-full">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-serif text-xl">{user.user_metadata?.full_name || "Style Icon"}</h3>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Member</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      View and edit your style profile, preferences, and account settings.
                    </p>
                    <span className="text-xs font-bold uppercase tracking-wider group-hover:underline">
                      View Profile
                    </span>
                  </div>
                </Link>

                {/* Credits Card */}
                <Link href="/credits" className="group">
                  <div className="border border-black/10 p-8 hover:border-black/30 transition-all duration-300 hover:shadow-lg bg-[#FAFAFA]">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 bg-black text-white flex items-center justify-center rounded-full">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-serif text-xl">{credits} Credits</h3>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Available</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Purchase more credits to unlock outfits and shopping links.
                    </p>
                    <span className="text-xs font-bold uppercase tracking-wider group-hover:underline">
                      Buy Credits
                    </span>
                  </div>
                </Link>

                {/* Style Quiz Card */}
                <Link href="/quiz" className="group">
                  <div className="border border-black/10 p-8 hover:border-black/30 transition-all duration-300 hover:shadow-lg bg-[#FAFAFA]">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 bg-black text-white flex items-center justify-center rounded-full">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-serif text-xl">Style Quiz</h3>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Questionnaire</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Update your style preferences and get better outfit recommendations.
                    </p>
                    <span className="text-xs font-bold uppercase tracking-wider group-hover:underline">Take Quiz</span>
                  </div>
                </Link>
              </div>
            </div>
          </motion.section>
        )}

        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="w-full bg-texture-floral py-32 px-6 md:px-12 border-t border-black/5"
        >
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-20">
              <span className="block text-xs font-bold tracking-[0.3em] uppercase mb-4 text-muted-foreground">
                Personal Atelier
              </span>
              <h2 className="text-5xl md:text-7xl font-serif text-black mb-6">Describe Your Vision</h2>
              <div className="w-24 h-[1px] bg-black mx-auto" />
            </div>

            <div className="bg-transparent p-8 md:p-16">
              <div className="relative mb-16">
                <Textarea
                  placeholder={userRequest.length === 0 ? placeholderText + (showCursor ? "|" : " ") : ""}
                  value={userRequest}
                  onChange={(e) => setUserRequest(e.target.value)}
                  className="w-full text-xl md:text-2xl font-serif leading-tight border-0 border-b border-black/20 rounded-none resize-none focus:ring-0 focus:border-black placeholder:text-black/20 placeholder:italic text-center min-h-[100px] bg-transparent transition-all duration-300 px-0"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-black/10 py-8 mb-12">
                <div className="px-8 py-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                    Occasion
                  </label>
                  <Select value={eventType} onValueChange={setEventType}>
                    <SelectTrigger className="w-full border-none p-0 text-lg font-serif h-auto focus:ring-0">
                      <SelectValue placeholder="Select Occasion" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Occasion</SelectItem>
                      <SelectItem value="casual">Daytime Leisure</SelectItem>
                      <SelectItem value="work">Professional</SelectItem>
                      <SelectItem value="date">Evening Out</SelectItem>
                      <SelectItem value="party">Formal Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="px-8 py-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                    Investment
                  </label>
                  <Select value={budget} onValueChange={setBudget}>
                    <SelectTrigger className="w-full border-none p-0 text-lg font-serif h-auto focus:ring-0">
                      <SelectValue placeholder="Set Budget" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Flexible</SelectItem>
                      <SelectItem value="moderate">Contemporary</SelectItem>
                      <SelectItem value="premium">Designer</SelectItem>
                      <SelectItem value="luxury">Haute Couture</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="px-8 py-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                    Aesthetic
                  </label>
                  <Select value={moodFilter} onValueChange={setMoodFilter}>
                    <SelectTrigger className="w-full border-none p-0 text-lg font-serif h-auto focus:ring-0">
                      <SelectValue placeholder="Select Mood" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Mood</SelectItem>
                      <SelectItem value="confident">Confident & Bold</SelectItem>
                      <SelectItem value="relaxed">Relaxed & Chic</SelectItem>
                      <SelectItem value="elegant">Timeless Elegance</SelectItem>
                      <SelectItem value="bold">Avant-Garde</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleDirectGenerate}
                  disabled={!userRequest.trim()}
                  className="bg-black text-white px-12 py-5 text-sm font-bold tracking-[0.2em] uppercase hover:bg-black/90 disabled:bg-gray-200 disabled:text-gray-400 transition-all w-full md:w-auto min-w-[300px]"
                >
                  Curate My Look
                </button>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="w-full py-32 bg-[#FAFAFA] overflow-hidden"
        >
          <div className="text-center mb-12 px-6">
            <h2 className="text-4xl md:text-6xl font-serif text-black mb-4">Curated Collections</h2>
            <p className="text-sm text-black/60">
              {outfits.length > 0 ? "Your personalized wardrobe" : "Create your first collection to see it here"}
            </p>
          </div>

          {outfits.length > 0 ? (
            <div className="relative">
              <div className="flex gap-1 animate-infinite-scroll">
                {[...outfits, ...outfits].map((outfit, i) => (
                  <Link
                    href="/outfits"
                    key={`${outfit.id}-${i}`}
                    className="flex-shrink-0 w-[300px] h-[400px] bg-white border border-black/5 relative overflow-hidden group cursor-pointer hover:shadow-xl transition-shadow duration-300"
                  >
                    <Image
                      src={getOutfitImage(outfit) || "/placeholder.svg"}
                      alt={outfit.name || "Outfit"}
                      fill
                      className="object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-700"
                      sizes="300px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <h3 className="font-serif text-xl text-white mb-1">{outfit.name}</h3>
                      <p className="text-xs text-white/80">{outfit.items?.length || 3} Pieces</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-black/40 mb-6">No collections yet</p>
              <Link href="/quiz">
                <button className="bg-black text-white px-8 py-4 text-xs font-bold tracking-[0.25em] uppercase hover:bg-black/90 transition-colors">
                  Start Your First Quiz
                </button>
              </Link>
            </div>
          )}
        </motion.section>
      </main>

      <Footer />
    </div>
  )
}
