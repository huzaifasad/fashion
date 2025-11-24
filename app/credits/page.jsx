"use client"

import { CreditStore } from "@/components/credit-store"

export default function CreditsPage() {
  return (
    <main className="min-h-screen bg-background pt-20 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-medium mb-4">Style Credits</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Purchase credits to unlock premium AI styling features and personalized outfit generations.
          </p>
        </div>
        <CreditStore />
      </div>
    </main>
  )
}
