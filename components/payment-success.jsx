"use client"

import { motion } from "framer-motion"
import { CheckCircle2, ArrowRight, AlertCircle, Loader2, Coins } from "lucide-react"
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
  const [creditsResult, setCreditsResult] = useState(null)

  useEffect(() => {
    const sessionId = searchParams.get("session_id")
    const id = searchParams.get("outfit_id")
    const type = searchParams.get("type") || "outfit_unlock"

    console.log("[v0] Payment Success: Session ID:", sessionId)
    console.log("[v0] Payment Success: Outfit ID:", id)
    console.log("[v0] Payment Success: Payment Type:", type)

    setOutfitId(id)
    setPaymentType(type)

    if (!sessionId) {
      console.log("[v0] Payment Success: No session ID in URL")
      setStatus("error")
      return
    }

    // ✅ SOLUTION: Check if this session was already processed
    const processedKey = `payment_processed_${sessionId}`
    const alreadyProcessed = sessionStorage.getItem(processedKey)

    if (alreadyProcessed) {
      console.log("[v0] Payment Success: Session already processed, showing cached result")
      const cachedResult = JSON.parse(alreadyProcessed)
      setStatus(cachedResult.status)
      setCreditsResult(cachedResult.creditsResult)
      return
    }

    // Process payment only if not already done
    if (user) {
      if (type === "credits") {
        verifyCredits(sessionId, processedKey)
      } else {
        verifyAndUnlock(sessionId, id, type, processedKey)
      }
    }
  }, [searchParams, user])

  useEffect(() => {
    const fetchOutfit = async () => {
      if (status === "success" && outfitId && user) {
        const { data, error } = await supabaseAuth
          .from("generated_outfits")
          .select("*")
          .eq("id", outfitId)
          .single()

        if (data && !error) {
          setPurchasedOutfit(data)
        }
      }
    }

    fetchOutfit()
  }, [status, outfitId, user])

  const verifyCredits = async (sessionId, processedKey) => {
    try {
      console.log("[v0] Payment Success: Verifying credits purchase...")

      const response = await fetch("/api/payment/verify-credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })

      const result = await response.json()

      if (result.success) {
        console.log("[v0] Payment Success: Credits added!", result)
        setCreditsResult(result)
        setStatus("success")

        // ✅ Mark this session as processed
        sessionStorage.setItem(
          processedKey,
          JSON.stringify({
            status: "success",
            creditsResult: result,
            timestamp: Date.now(),
          })
        )
      } else {
        console.error("[v0] Payment Success: Credits verification failed:", result.error)
        setStatus("error")
      }
    } catch (error) {
      console.error("[v0] Payment Success: Error verifying credits:", error)
      setStatus("error")
    }
  }

  const verifyAndUnlock = async (sessionId, id, type, processedKey) => {
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

      if (type === "outfit_unlock" && id) {
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

          // ✅ Mark this session as processed
          sessionStorage.setItem(
            processedKey,
            JSON.stringify({
              status: "success",
              timestamp: Date.now(),
            })
          )
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md w-full">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto text-accent"
          >
            <Loader2 className="w-10 h-10 animate-spin" />
          </motion.div>
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-serif font-medium">Verifying Payment...</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Please wait while we confirm your payment with Stripe.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md w-full">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500"
          >
            <AlertCircle className="w-10 h-10" />
          </motion.div>
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-serif font-medium">Payment Verification Failed</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              We couldn't verify your payment. Please contact support if you were charged.
            </p>
          </div>
          <Button asChild variant="outline" size="lg" className="w-full bg-transparent">
            <Link href="/outfits">Return to Outfits</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-2xl w-full">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500"
        >
          <CheckCircle2 className="w-10 h-10" />
        </motion.div>

        <div className="space-y-3">
          <h1 className="text-2xl md:text-4xl font-serif font-medium">Payment Successful!</h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
            {paymentType === "credits"
              ? "Your credits have been added to your account!"
              : "Your shopping links have been unlocked! You can now access all product links for your selected outfit."}
          </p>
        </div>

        {paymentType === "credits" && creditsResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="py-8 space-y-6 bg-accent/5 rounded-2xl border border-border px-6"
          >
            <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto">
              <Coins className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <p className="text-4xl md:text-5xl font-serif">+{creditsResult.creditsAdded}</p>
              <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider font-medium">
                Credits Added
              </p>
            </div>
            <div className="pt-4 border-t border-border space-y-1">
              <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider">New Balance</p>
              <p className="text-2xl md:text-3xl font-serif">{creditsResult.newBalance} credits</p>
            </div>
          </motion.div>
        )}

        {purchasedOutfit && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 mb-8"
          >
            <p className="text-xs md:text-sm text-muted-foreground mb-6 text-center uppercase tracking-widest font-bold">
              Unlocked Outfit
            </p>
            <div className="max-w-sm mx-auto">
              <OutfitCard outfit={purchasedOutfit} isUnlocked={true} hideActions={true} />
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="pt-8 space-y-3 max-w-md mx-auto"
        >
          {outfitId && paymentType === "outfit_unlock" && (
            <Button asChild size="lg" className="w-full">
              <Link href={`/outfit/${outfitId}`}>
                View My Outfit <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          )}
          {paymentType === "credits" && (
            <Button asChild size="lg" className="w-full">
              <Link href="/generate">
                Generate New Outfit <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          )}
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href="/outfits">Browse All Outfits</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  )
}