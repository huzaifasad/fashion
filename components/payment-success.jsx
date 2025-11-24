"use client"

import { motion } from "framer-motion"
import { CheckCircle2, ArrowRight, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { supabaseAuth } from "@/lib/supabase-auth-client"
import { useAuth } from "@/components/auth-provider"
import { OutfitCard } from "@/components/outfit-card"

export function PaymentSuccess() {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [status, setStatus] = useState("processing")
  const [outfitId, setOutfitId] = useState(null)
  const [paymentType, setPaymentType] = useState("outfit_unlock")
  const [purchasedOutfit, setPurchasedOutfit] = useState(null)

  useEffect(() => {
    const sessionId = searchParams.get("session_id")
    const id = searchParams.get("outfit_id")
    const type = searchParams.get("type") || "outfit_unlock"

    console.log("[v0] Payment Success: Session ID:", sessionId)
    console.log("[v0] Payment Success: Outfit ID:", id)
    console.log("[v0] Payment Success: Payment Type:", type)

    setOutfitId(id)
    setPaymentType(type)

    if (sessionId && user) {
      verifyAndUnlock(sessionId, id, type)
    } else if (!sessionId) {
      console.log("[v0] Payment Success: No session ID in URL")
      setStatus("error")
    }
  }, [searchParams, user])

  useEffect(() => {
    const fetchOutfit = async () => {
      if (status === "success" && outfitId && user) {
        const { data, error } = await supabaseAuth.from("generated_outfits").select("*").eq("id", outfitId).single()

        if (data && !error) {
          setPurchasedOutfit(data)
        }
      }
    }

    fetchOutfit()
  }, [status, outfitId, user])

  const verifyAndUnlock = async (sessionId, id, type) => {
    try {
      console.log("[v0] Payment Success: Verifying payment session with Stripe...")

      const verifyResponse = await fetch("/api/payment/verify-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })

      const verifyResult = await verifyResponse.json()

      if (!verifyResult.success) {
        console.error("[v0] Payment Success: Payment not verified")
        setStatus("error")
        return
      }

      console.log("[v0] Payment Success: Payment verified! Amount:", verifyResult.amountTotal / 100, "USD")

      if (type === "credits") {
        // Add credits to user profile
        const creditsToAdd = Math.floor(verifyResult.amountTotal / 500) // $5 = 1 credit
        await supabaseAuth
          .from("profiles")
          .update({ credits: supabaseAuth.raw(`credits + ${creditsToAdd}`) })
          .eq("id", user.id)

        console.log("[v0] Payment Success: Added", creditsToAdd, "credits")
        setStatus("success")
      } else if (type === "outfit_unlock" && id) {
        // Unlock specific outfit
        console.log("[v0] Payment Success: Unlocking outfit:", id)

        const { error } = await supabaseAuth
          .from("generated_outfits")
          .update({ is_unlocked: true })
          .eq("id", id)
          .eq("user_id", user.id)

        if (error) {
          console.error("[v0] Payment Success: Error updating unlock status:", error)
          setStatus("error")
        } else {
          console.log("[v0] Payment Success: Successfully unlocked outfit")
          setStatus("success")
        }
      } else {
        setStatus("success")
      }
    } catch (error) {
      console.error("[v0] Payment Success: Error during verification:", error)
      setStatus("error")
    }
  }

  if (status === "processing") {
    return (
      <div className="text-center space-y-6 max-w-md px-4 mx-auto">
        <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto text-accent">
          <Loader2 className="w-10 h-10 animate-spin" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-serif font-medium">Verifying Payment...</h1>
          <p className="text-muted-foreground">Please wait while we confirm your payment with Stripe.</p>
        </div>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="text-center space-y-6 max-w-md px-4 mx-auto">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
          <AlertCircle className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-serif font-medium">Payment Verification Failed</h1>
          <p className="text-muted-foreground">
            We couldn't verify your payment. Please contact support if you were charged.
          </p>
        </div>
        <Button asChild variant="outline" size="lg" className="w-full bg-transparent">
          <Link href="/outfits">Return to Outfits</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="text-center space-y-6 max-w-md px-4 mx-auto">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500"
      >
        <CheckCircle2 className="w-10 h-10" />
      </motion.div>

      <div className="space-y-2">
        <h1 className="text-3xl font-serif font-medium">Payment Successful</h1>
        <p className="text-muted-foreground">
          {paymentType === "credits"
            ? "Your credits have been added to your account!"
            : "Your shopping links have been unlocked! You can now access all product links for your selected outfit."}
        </p>
      </div>

      {purchasedOutfit && (
        <div className="mt-8 mb-8 text-left">
          <p className="text-sm text-muted-foreground mb-4 text-center uppercase tracking-widest font-bold">
            Unlocked Outfit
          </p>
          <div className="transform scale-90 origin-top">
            <OutfitCard
              outfit={purchasedOutfit}
              isUnlocked={true}
              hasLinksUnlocked={true}
              hideActions={true} // Optional: hide unlock buttons since it's just a preview
            />
          </div>
        </div>
      )}

      <div className="pt-8 space-y-3">
        {outfitId && paymentType === "outfit_unlock" && (
          <Button asChild size="lg" className="w-full">
            <Link href={`/outfit/${outfitId}`}>
              View My Outfit <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        )}
        {paymentType === "credits" && (
          <Button asChild size="lg" className="w-full">
            <Link href="/quiz">
              Start New Quiz <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        )}
        <Button asChild variant="outline" size="lg" className="w-full bg-transparent">
          <Link href="/outfits">Browse All Outfits</Link>
        </Button>
      </div>
    </div>
  )
}
