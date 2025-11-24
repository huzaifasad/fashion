// OpenAI API Helper
export async function callOpenAI({ model, messages, responseFormat = "json_object", temperature = 0.7 }) {
  console.log("[v0] OpenAI: Starting API call")
  console.log("[v0] OpenAI: Model:", model)
  console.log("[v0] OpenAI: Temperature:", temperature)
  console.log("[v0] OpenAI: Response format:", responseFormat)
  console.log("[v0] OpenAI: Messages count:", messages.length)

  const apiKey = process.env.OPENAI_API_KEY

  console.log("[v0] OpenAI: Checking API key...")
  console.log("[v0] OpenAI: API key exists:", !!apiKey)
  console.log("[v0] OpenAI: API key starts with 'sk-':", apiKey?.startsWith("sk-"))

  if (!apiKey || apiKey.includes("your_openai") || apiKey.includes("sk-proj-") === false) {
    console.error("[v0] OpenAI: Invalid or missing API key")
    throw new Error(
      "OpenAI API key is not configured. Please add your API key in the Vars section of the v0 sidebar (left side). Get your key from https://platform.openai.com/api-keys",
    )
  }

  console.log("[v0] OpenAI: API key validated successfully")

  const MAX_RETRIES = 3
  let lastError = null

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[v0] OpenAI: Sending request to OpenAI API (Attempt ${attempt}/${MAX_RETRIES})...`)

      const requestBody = {
        model,
        messages,
        response_format: responseFormat ? { type: responseFormat } : undefined,
        temperature,
        max_tokens: 4000,
      }

      console.log("[v0] OpenAI: Request body:", JSON.stringify(requestBody, null, 2))

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 90000) // 90 seconds timeout

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log("[v0] OpenAI: Response status:", response.status)
      console.log("[v0] OpenAI: Response ok:", response.ok)

      if (!response.ok) {
        const error = await response.json()
        console.error("[v0] OpenAI: API Error Response:", JSON.stringify(error, null, 2))

        if (response.status === 401) {
          console.error("[v0] OpenAI: Authentication failed - Invalid API key")
          throw new Error(
            "Invalid OpenAI API key. Please update your API key in the Vars section. Get a valid key from https://platform.openai.com/api-keys",
          )
        }

        // If it's a server error (5xx), throw to trigger retry
        if (response.status >= 500) {
          throw new Error(`OpenAI Server Error: ${response.status}`)
        }

        throw new Error(`OpenAI API error: ${error.error?.message || "Unknown error"}`)
      }

      const data = await response.json()
      console.log("[v0] OpenAI: Response received successfully")
      console.log("[v0] OpenAI: Choices count:", data.choices?.length)
      console.log("[v0] OpenAI: Content length:", data.choices?.[0]?.message?.content?.length)
      console.log("[v0] OpenAI: Usage:", JSON.stringify(data.usage, null, 2))

      const content = data.choices[0].message.content
      console.log("[v0] OpenAI: Returning content")

      return content
    } catch (error) {
      console.error(`[v0] OpenAI: Attempt ${attempt} failed:`, error.message)
      lastError = error

      // Don't retry on auth errors
      if (error.message.includes("Invalid OpenAI API key")) {
        throw error
      }

      // If it's a timeout or connection error, wait and retry
      if (attempt < MAX_RETRIES) {
        const delay = attempt * 2000 // Exponential backoff: 2s, 4s, 6s
        console.log(`[v0] OpenAI: Waiting ${delay}ms before retry...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  console.error("[v0] OpenAI: All attempts failed")
  throw lastError
}
