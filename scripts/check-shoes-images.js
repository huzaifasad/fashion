const { createClient } = require("@supabase/supabase-js")

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkShoes() {
  console.log("🔍 Checking SHOES in 'zara_cloth' table for image issues...")

  // Search specifically for shoes
  const keywords = ["shoe", "boot", "sneaker", "sandal", "heel", "flat"]
  const conditions = keywords.map((k) => `product_name.ilike.%${k}%`).join(",")

  const { data: products, error } = await supabase.from("zara_cloth").select("*").or(conditions).limit(50)

  if (error) {
    console.error("❌ Error fetching products:", error.message)
    return
  }

  console.log(`✅ Fetched ${products.length} potential shoe products.`)

  let emptyImageCount = 0
  let validImageCount = 0

  products.forEach((p) => {
    // Check images field
    let hasImage = false
    let imageSource = "none"

    // 1. Check 'images' array/json
    if (p.images) {
      if (Array.isArray(p.images) && p.images.length > 0) hasImage = true
      else if (typeof p.images === "string") {
        try {
          const parsed = JSON.parse(p.images)
          if (Array.isArray(parsed) && parsed.length > 0) hasImage = true
          else if (parsed.url || parsed.imageUrl) hasImage = true
        } catch (e) {
          // maybe it's a direct string URL
          if (p.images.startsWith("http")) hasImage = true
        }
      }
      if (hasImage) imageSource = "images"
    }

    // 2. Check 'image' field
    if (!hasImage && p.image) {
      if (typeof p.image === "string" && p.image.startsWith("http")) {
        hasImage = true
        imageSource = "image"
      }
    }

    if (hasImage) {
      validImageCount++
      // console.log(`✅ Valid: ${p.product_name.substring(0, 30)}... [${imageSource}]`)
    } else {
      emptyImageCount++
      console.log(`❌ EMPTY IMAGE: [ID: ${p.id}] ${p.product_name}`)
      console.log(`   images: ${JSON.stringify(p.images)}`)
      console.log(`   image: ${JSON.stringify(p.image)}`)
    }
  })

  console.log("\nSUMMARY:")
  console.log(`✅ Valid Images: ${validImageCount}`)
  console.log(`❌ Empty/Invalid Images: ${emptyImageCount}`)
}

checkShoes()
