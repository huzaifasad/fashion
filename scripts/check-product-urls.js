const { createClient } = require("@supabase/supabase-js")

// Initialize Supabase client (using same credentials as your app)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aqkeprwxxsryropnhfvm.supabase.co"
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxa2Vwcnd4eHNyeXJvcG5oZnZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4MzE4MjksImV4cCI6MjA1MzQwNzgyOX0.1nstrLtlahU3kGAu-UrzgOVw6XwyKU6n5H5q4Taqtus"

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkUrls() {
  console.log("🔍 Checking product URLs in 'zara_cloth' table...")

  // Fetch a batch of products to inspect
  const { data: products, error } = await supabase.from("zara_cloth").select("*").limit(100)

  if (error) {
    console.error("❌ Error fetching products:", error.message)
    return
  }

  console.log(`✅ Fetched ${products.length} products. Analyzing...`)

  const emptyUrlProducts = []
  const validUrlProducts = []

  for (const p of products) {
    // Check all possible URL fields
    const url = p.url || p.product_url || p.link || p.href
    const isInvalid = !url || url === "#" || url.trim() === ""

    if (isInvalid) {
      emptyUrlProducts.push(p)
    } else {
      validUrlProducts.push(p)
    }
  }

  console.log("\n============================================")
  console.log("🔴 PRODUCTS WITH MISSING/INVALID URLs")
  console.log("============================================")
  if (emptyUrlProducts.length === 0) {
    console.log("🎉 No products found with missing URLs in this batch!")
  } else {
    console.log(`Found ${emptyUrlProducts.length} products with invalid URLs. Showing first 2:`)
    emptyUrlProducts.slice(0, 2).forEach((p) => {
      console.log(`\n[ID: ${p.id}] ${p.product_name}`)
      console.log(`   url: "${p.url}"`)
      console.log(`   product_url: "${p.product_url}"`)
      console.log(`   link: "${p.link}"`)
      console.log(`   href: "${p.href}"`)
    })
  }

  console.log("\n============================================")
  console.log("🟢 PRODUCTS WITH VALID URLs")
  console.log("============================================")
  if (validUrlProducts.length === 0) {
    console.log("⚠️ No products found with valid URLs in this batch!")
  } else {
    console.log(`Found ${validUrlProducts.length} products with valid URLs. Showing first 2:`)
    validUrlProducts.slice(0, 2).forEach((p) => {
      console.log(`\n[ID: ${p.id}] ${p.product_name}`)
      console.log(`   url: "${p.url}"`)
      console.log(`   product_url: "${p.product_url}"`)
      console.log(`   link: "${p.link}"`)
      console.log(`   href: "${p.href}"`)
    })
  }
}

checkUrls()
