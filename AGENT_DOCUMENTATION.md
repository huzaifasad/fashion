# BuyTheLook AI Agent System Documentation

## Overview

The BuyTheLook system uses a **4-agent AI pipeline** powered by OpenAI's GPT-4 to generate personalized outfit recommendations. Each agent has a specific role in the workflow, working together to transform user preferences into curated fashion looks.

---

## System Architecture

\`\`\`
User Quiz → Agent 1 (Image Analysis) → Agent 2 (Profile Builder) → 
Agent 3 (Outfit Picker) → Agent 4 (Quality Checker) → Final Outfits
\`\`\`

### Data Flow:
1. **Input**: User quiz data (style, occasion, budget, colors, optional photo)
2. **Processing**: 4 AI agents analyze, build profile, search products, validate quality
3. **Output**: 3 curated outfits with styling notes and quality scores

---

## Agent 1: Image Analysis Agent

**File**: `app/api/agents/image-analysis/route.ts`

**Purpose**: Analyzes user-uploaded photos to determine body shape and proportions using computer vision.

**Model**: `gpt-4o` (GPT-4 with vision capabilities)

**Input**:
- User photo (JPEG/PNG)

**Output**:
\`\`\`json
{
  "bodyShape": "hourglass|pear|apple|rectangle|athletic",
  "bodyShapeConfidence": 85,
  "heightCategory": "petite|average|tall",
  "heightConfidence": 70,
  "recommendations": [
    "Emphasize your defined waist with belted styles",
    "Choose fitted tops to balance proportions",
    "Opt for A-line skirts and dresses"
  ],
  "overallConfidence": 75
}
\`\`\`

**Prompt Strategy**:
The agent is instructed to:
- Identify body shape from 5 categories (hourglass, pear, apple, rectangle, athletic)
- Determine height category (petite, average, tall)
- Provide confidence scores (0-100) for each assessment
- Give 3 specific fit recommendations
- Be body-positive and respectful
- Return low confidence (<50) if photo quality is poor

**Key Features**:
- Converts image to base64 for API transmission
- Uses structured JSON output for reliable parsing
- Includes detailed logging for debugging
- Handles errors gracefully with fallback responses

---

## Agent 2: Profile Builder Agent

**File**: `app/api/agents/profile-builder/route.ts`

**Purpose**: Transforms quiz data into a structured shopping profile with specific search queries.

**Model**: `gpt-4o-mini` (faster, cost-effective for structured tasks)

**Input**:
\`\`\`javascript
{
  gender: "female",
  bodyShape: "hourglass",
  height: "average",
  style: "casual",
  occasion: "everyday",
  colors: ["black", "white", "navy"],
  budget: "moderate", // budget|moderate|premium|luxury
  additionalDetails: "I prefer sustainable brands"
}
\`\`\`

**Output**:
\`\`\`json
{
  "bodyProfile": {
    "shape": "hourglass",
    "fitGuidelines": [
      "Choose fitted tops that emphasize your waist",
      "Opt for high-waisted bottoms",
      "Avoid boxy, shapeless silhouettes"
    ],
    "avoid": ["Drop-waist dresses", "Oversized tunics"]
  },
  "colorStrategy": {
    "primary": ["black", "white", "navy"],
    "accent": ["burgundy", "forest green"],
    "avoid": ["neon colors"]
  },
  "styleKeywords": {
    "aesthetic": ["minimalist", "tailored", "classic"],
    "formality": "casual"
  },
  "searchQueries": {
    "tops": [
      "fitted black blazer",
      "white silk blouse",
      "navy knit sweater"
    ],
    "bottoms": [
      "high waisted black trousers",
      "dark wash straight leg jeans",
      "navy midi skirt"
    ],
    "shoes": [
      "black leather ankle boots",
      "white sneakers minimalist",
      "navy suede loafers"
    ]
  },
  "priceRange": {
    "min": 50,
    "max": 200
  },
  "occasionGuidelines": {
    "occasion": "everyday",
    "formality": "casual",
    "mustHave": ["comfortable shoes", "versatile basics"],
    "avoid": ["overly formal pieces", "evening wear"]
  }
}
\`\`\`

**Prompt Strategy**:
The agent is instructed to:
- Convert budget categories to specific price ranges:
  - Budget: $20-$100
  - Moderate: $50-$200
  - Premium: $100-$350
  - Luxury: $200-$500
- Generate **specific, searchable keywords** (e.g., "fitted blazer black" not "nice clothes")
- Create 3 search queries per category (tops, bottoms, shoes)
- Provide fit guidelines based on body shape
- Suggest complementary colors and accent colors
- Define style aesthetic and formality level

**Key Features**:
- Temperature: 0.7 (balanced creativity and consistency)
- JSON response format for reliable parsing
- Comprehensive logging of input quiz data and output profile

---

## Agent 3: Outfit Picker Agent

**File**: `app/api/agents/outfit-picker/route.ts`

**Purpose**: Selects products from the database and creates 3 complete outfits based on the user profile.

**Model**: `gpt-4o` (most capable model for complex reasoning)

**Input**:
\`\`\`javascript
{
  profile: { /* Profile from Agent 2 */ },
  products: {
    tops: [ /* Array of 15 top products */ ],
    bottoms: [ /* Array of 15 bottom products */ ],
    shoes: [ /* Array of 15 shoe products */ ]
  }
}
\`\`\`

**Output**:
\`\`\`json
{
  "outfits": [
    {
      "outfitNumber": 1,
      "name": "The Power Meeting",
      "top": {
        "id": "product_123",
        "reasoning": "This structured blazer emphasizes the waist while maintaining professional elegance"
      },
      "bottom": {
        "id": "product_456",
        "reasoning": "High-waisted trousers elongate the legs and balance proportions"
      },
      "shoes": {
        "id": "product_789",
        "reasoning": "Pointed toe heels add sophistication without sacrificing comfort"
      },
      "totalPrice": 185,
      "whyItWorks": "Sharp tailoring commands authority while the neutral palette maintains professional elegance. The high-waisted silhouette flatters your hourglass shape.",
      "stylistNotes": [
        "Keep the blazer unbuttoned for a relaxed yet powerful look",
        "Add gold statement earrings to elevate the outfit"
      ],
      "confidenceScore": 94
    },
    { /* Outfit 2 */ },
    { /* Outfit 3 */ }
  ]
}
\`\`\`

**Prompt Strategy**:
The agent is instructed to:
- Create **exactly 3 complete outfits** (1 top + 1 bottom + 1 shoes each)
- Use **only product IDs from the provided lists** (critical for data integrity)
- Ensure colors complement each other
- **No product can appear in multiple outfits** (uniqueness constraint)
- Calculate accurate total price
- Provide reasoning for each item selection
- Explain why the outfit works as a whole
- Give 2 styling tips per outfit
- Assign confidence score (0-100)

**Key Features**:
- Temperature: 0.8 (higher creativity for outfit combinations)
- Minimizes product data to 15 items per category (token efficiency)
- Enriches AI output with full product data (images, URLs, brands)
- Fallback logic if AI selects invalid product IDs
- Comprehensive logging of product matching process

---

## Agent 4: Quality Checker Agent

**File**: `app/api/agents/quality-checker/route.ts`

**Purpose**: Validates and scores the generated outfits, enhancing styling advice and filtering low-quality combinations.

**Model**: `gpt-4o-mini` (efficient for validation tasks)

**Input**:
\`\`\`javascript
{
  outfits: [ /* 3 outfits from Agent 3 */ ],
  profile: { /* User profile from Agent 2 */ }
}
\`\`\`

**Output**:
\`\`\`json
{
  "validatedOutfits": [
    {
      "outfitIndex": 0,
      "isValid": true,
      "overallScore": 92,
      "enhancedWhyItWorks": "This outfit masterfully combines professional authority with feminine elegance. The structured blazer creates a strong shoulder line while the high-waisted trousers emphasize your natural waist, perfectly complementing your hourglass shape.",
      "enhancedStylistNotes": [
        "Keep the blazer unbuttoned for a relaxed yet powerful look",
        "Add gold statement earrings to draw attention to your face",
        "Consider a structured leather tote to complete the professional aesthetic"
      ],
      "accessorySuggestions": {
        "jewelry": "Gold hoop earrings or a delicate pendant necklace",
        "bag": "Structured leather tote in black or cognac"
      }
    }
  ],
  "rejectedOutfits": [],
  "summary": {
    "totalOutfits": 3,
    "validOutfits": 3,
    "averageScore": 89
  }
}
\`\`\`

**Scoring Criteria** (0-100 scale):
1. **Color Harmony** (30 points): Do colors complement each other?
2. **Body Shape Fit** (30 points): Does the outfit flatter the user's body shape?
3. **Style Consistency** (20 points): Do items match the requested aesthetic?
4. **Occasion Appropriate** (20 points): Is the outfit suitable for the occasion?

**Validation Rules**:
- Outfits scoring **≥70** are considered valid
- Outfits scoring **<70** are rejected and not shown to the user
- Valid outfits receive enhanced styling tips and accessory suggestions

**Prompt Strategy**:
The agent is instructed to:
- Rate each outfit on 4 criteria (color, fit, style, occasion)
- Provide detailed scoring breakdown
- Enhance "why it works" explanations with more detail
- Add 3 detailed styling tips per outfit
- Suggest complementary accessories (jewelry, bags)
- Reject outfits that don't meet quality standards

**Key Features**:
- Temperature: 0.7 (balanced evaluation)
- Enhances original outfit data with validation scores
- Filters out low-quality combinations
- Provides summary statistics (total, valid, average score)

---

## Product Search System

**File**: `lib/supabase-products.js`

**Purpose**: Queries your Supabase `zara_cloth` table to find products matching the AI-generated search queries.

**Database Schema** (zara_cloth table):
\`\`\`sql
- id: integer (primary key)
- product_name: text
- colour: text
- price: numeric
- category: text (e.g., "Tops", "Bottoms", "Shoes")
- image_url: text
- product_url: text
- brand: text (default: "Zara")
\`\`\`

**Search Logic**:
\`\`\`javascript
// Example: Search for "fitted black blazer"
const searchTerms = ["fitted", "black", "blazer"]

// Query uses OR logic with ILIKE (case-insensitive)
SELECT * FROM zara_cloth
WHERE category = 'Tops'
AND (
  product_name ILIKE '%fitted%' OR
  product_name ILIKE '%black%' OR
  product_name ILIKE '%blazer%' OR
  colour ILIKE '%fitted%' OR
  colour ILIKE '%black%' OR
  colour ILIKE '%blazer%'
)
AND price BETWEEN 50 AND 200
LIMIT 5
\`\`\`

**Features**:
- Searches across `product_name` and `colour` columns
- Filters by category (Tops, Bottoms, Shoes)
- Filters by price range from user profile
- Returns up to 5 products per search query
- Handles multiple search queries per category
- Deduplicates results by product ID

---

## Complete Workflow Example

### User Input:
\`\`\`javascript
{
  gender: "female",
  bodyShape: "hourglass",
  style: "professional",
  occasion: "work",
  colors: ["black", "white", "navy"],
  budget: "moderate"
}
\`\`\`

### Step 1: Profile Builder
Generates search queries:
- Tops: "fitted black blazer", "white silk blouse", "navy knit sweater"
- Bottoms: "high waisted black trousers", "navy pencil skirt"
- Shoes: "black leather pumps", "nude ankle boots"

### Step 2: Product Search
Queries Supabase for each search term:
- "fitted black blazer" → 5 blazer products
- "white silk blouse" → 5 blouse products
- etc.

Total: ~15 tops, ~15 bottoms, ~15 shoes

### Step 3: Outfit Picker
AI selects 3 combinations:
- **Outfit 1**: Black blazer + Black trousers + Black pumps ($185)
- **Outfit 2**: White blouse + Navy skirt + Nude boots ($160)
- **Outfit 3**: Navy sweater + Black trousers + Black pumps ($145)

### Step 4: Quality Checker
Validates and scores:
- Outfit 1: 94/100 (Excellent color harmony, perfect fit)
- Outfit 2: 88/100 (Great style, slightly less formal)
- Outfit 3: 91/100 (Versatile, comfortable)

All 3 outfits pass validation (≥70) and are shown to the user.

---

## Environment Variables Required

\`\`\`env
# OpenAI API (for AI agents)
OPENAI_API_KEY=sk-...

# Supabase (for product database)
NEXT_PUBLIC_SUPABASE_URL=https://aqkeprwxxsryropnhfvm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

---

## Error Handling

Each agent includes comprehensive error handling:

1. **API Key Validation**: Checks for missing or placeholder keys
2. **Detailed Logging**: Every step is logged with `[v0] Agent Name: ...`
3. **Graceful Fallbacks**: If AI fails, uses default/mock data
4. **User-Friendly Errors**: Clear messages directing users to fix configuration

Example error flow:
\`\`\`
[v0] Profile Builder: Starting profile building
[v0] Profile Builder: Quiz data received
[v0] OpenAI: Validating API key...
[v0] OpenAI: ERROR - Invalid API key detected
→ Returns error with instructions to add key in Vars section
\`\`\`

---

## Performance Optimization

1. **Token Efficiency**: Minimizes product data sent to AI (only ID, name, price, brand, color)
2. **Parallel Processing**: Could be enhanced to run agents in parallel where possible
3. **Caching**: Could cache profile data to avoid regenerating for similar users
4. **Rate Limiting**: OpenAI API has rate limits; consider implementing queuing for high traffic

---

## Future Enhancements

1. **Real-time Inventory**: Check product availability before showing outfits
2. **User Feedback Loop**: Learn from user selections to improve recommendations
3. **Multi-brand Support**: Expand beyond Zara to other brands in database
4. **Seasonal Trends**: Incorporate current fashion trends into recommendations
5. **Outfit Variations**: Generate variations of popular outfits (e.g., "casual version")
6. **Size Recommendations**: Use body measurements to suggest sizes

---

## Debugging Tips

1. **Check Console Logs**: All agents log extensively with `[v0]` prefix
2. **Verify API Keys**: Ensure OpenAI and Supabase keys are set correctly
3. **Test Individual Agents**: Use API testing tools (Postman) to test each endpoint
4. **Check Database**: Verify `zara_cloth` table has products in correct categories
5. **Monitor Token Usage**: OpenAI charges per token; monitor usage in dashboard

---

## Summary

The BuyTheLook AI system uses a sophisticated 4-agent pipeline to transform user preferences into personalized outfit recommendations. Each agent has a specific role:

1. **Image Analysis**: Understands body shape from photos
2. **Profile Builder**: Creates structured shopping profile
3. **Outfit Picker**: Selects products and creates outfits
4. **Quality Checker**: Validates and enhances recommendations

The system is designed to be modular, extensible, and production-ready, with comprehensive error handling and logging throughout.
