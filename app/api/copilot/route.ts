export const runtime = "nodejs"

type CopilotRequest = {
  clientName?: string
  company?: string
  conversation: string
}

type CopilotResult = {
  analysis?: string
  clientNeed?: string
  painPoint?: string
  conversationStage?: string
  strategy?: string
  suggestedReply?: string
  nextQuestion?: string
  salesGuidance?: string
}

type CopilotResponse = {
  success: boolean
  result?: CopilotResult
  error?: string
}

const FALLBACK_ERROR =
  "AutoMora Copilot belum dapat memproses percakapan. Silakan coba lagi."

function getN8nWebhookUrl(): string {
  const url = process.env.AUTOMORA_COPILOT_N8N_WEBHOOK_URL?.trim()

  if (!url) {
    throw new Error(
      "AUTOMORA_COPILOT_N8N_WEBHOOK_URL belum dikonfigurasi."
    )
  }

  return url
}

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function extractSection(text: string, heading: string, nextHeadings: string[]) {
  const normalized = text.replace(/\r/g, "").trim()

  const headingIndex = normalized
    .toLowerCase()
    .indexOf(heading.toLowerCase())

  if (headingIndex === -1) {
    return ""
  }

  const start = headingIndex + heading.length

  let end = normalized.length

  for (const nextHeading of nextHeadings) {
    const nextIndex = normalized
      .toLowerCase()
      .indexOf(nextHeading.toLowerCase(), start)

    if (nextIndex !== -1 && nextIndex < end) {
      end = nextIndex
    }
  }

  return normalized
    .slice(start, end)
    .replace(/^[:\-\s]+/, "")
    .trim()
}

function parseCopilotText(text: string): CopilotResult {
  const analysis =
    extractSection(text, "**ANALISIS**", [
      "**INFORMASI YANG MASIH PERLU DIKETAHUI KONSULTAN**",
      "**INFORMASI YANG MASIH PERLU DIKETAHUI KONSULTATOR**",
      "**SARAN JAWABAN**",
      "**TUJUAN BERIKUTNYA**",
      "**COMMERCIAL INTENT**",
    ])

  const missingInformation =
    extractSection(
      text,
      "**INFORMASI YANG MASIH PERLU DIKETAHUI KONSULTAN**",
      [
        "**SARAN JAWABAN**",
        "**TUJUAN BERIKUTNYA**",
        "**COMMERCIAL INTENT**",
      ]
    ) ||
    extractSection(
      text,
      "**INFORMASI YANG MASIH PERLU DIKETAHUI KONSULTATOR**",
      [
        "**SARAN JAWABAN**",
        "**TUJUAN BERIKUTNYA**",
        "**COMMERCIAL INTENT**",
      ]
    )

  const suggestedReply =
    extractSection(text, "**SARAN JAWABAN**", [
      "**TUJUAN BERIKUTNYA**",
      "**COMMERCIAL INTENT**",
    ])

  const nextQuestion =
    extractSection(text, "**TUJUAN BERIKUTNYA**", [
      "**COMMERCIAL INTENT**",
    ])

  const commercialIntent = extractSection(
    text,
    "**COMMERCIAL INTENT**",
    []
  )

  return {
    analysis,
    clientNeed: missingInformation,
    suggestedReply,
    nextQuestion,
    salesGuidance: commercialIntent,
  }
}

function normalizeResult(value: unknown): CopilotResult {
  if (!value || typeof value !== "object") {
    return {}
  }

  const data = value as Record<string, unknown>

  /*
   * Jika n8n mengembalikan format terstruktur:
   *
   * {
   *   "analysis": "...",
   *   "suggestedReply": "..."
   * }
   *
   * kita tetap mendukungnya.
   */

  const directResult: CopilotResult = {
    analysis: cleanString(data.analysis),
    clientNeed: cleanString(data.clientNeed),
    painPoint: cleanString(data.painPoint),
    conversationStage: cleanString(data.conversationStage),
    strategy: cleanString(data.strategy),
    suggestedReply: cleanString(data.suggestedReply),
    nextQuestion: cleanString(data.nextQuestion),
    salesGuidance: cleanString(data.salesGuidance),
  }

  if (
    directResult.analysis ||
    directResult.suggestedReply ||
    directResult.nextQuestion
  ) {
    return directResult
  }

  /*
   * Format n8n saat ini:
   *
   * {
   *   "text": "**ANALISIS** ..."
   * }
   */

  const text = cleanString(data.text)

  if (text) {
    return parseCopilotText(text)
  }

  return {}
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body: unknown = await request.json()

    if (!body || typeof body !== "object") {
      return Response.json(
        {
          success: false,
          error: "Format request tidak valid.",
        } satisfies CopilotResponse,
        { status: 400 }
      )
    }

    const data = body as Record<string, unknown>

    const clientName = cleanString(data.clientName)
    const company = cleanString(data.company)
    const conversation = cleanString(data.conversation)

    if (!conversation) {
      return Response.json(
        {
          success: false,
          error:
            "Percakapan WhatsApp belum diisi. Silakan paste percakapan klien terlebih dahulu.",
        } satisfies CopilotResponse,
        { status: 400 }
      )
    }

    const payload: CopilotRequest = {
      clientName: clientName || undefined,
      company: company || undefined,
      conversation,
    }

    const webhookUrl = getN8nWebhookUrl()

    console.log("AutoMora Copilot → n8n")

    const controller = new AbortController()

    const timeout = setTimeout(() => {
      controller.abort()
    }, 60000)

    let n8nResponse: Response

    try {
      n8nResponse = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
        cache: "no-store",
      })
    } finally {
      clearTimeout(timeout)
    }

    console.log(
      "AutoMora Copilot n8n status:",
      n8nResponse.status
    )

    const rawResponse = await n8nResponse.text()

    console.log(
      "AutoMora Copilot n8n raw response:",
      rawResponse
    )

    if (!n8nResponse.ok) {
      console.error(
        "AutoMora Copilot n8n error:",
        n8nResponse.status,
        rawResponse
      )

      return Response.json(
        {
          success: false,
          error: `n8n mengembalikan HTTP ${n8nResponse.status}.`,
        } satisfies CopilotResponse,
        { status: 502 }
      )
    }

    let parsedResponse: unknown

    try {
      parsedResponse = JSON.parse(rawResponse)
    } catch {
      console.error(
        "Respons Copilot n8n bukan JSON valid:",
        rawResponse
      )

      return Response.json(
        {
          success: false,
          error: "Respons dari n8n bukan JSON yang valid.",
        } satisfies CopilotResponse,
        { status: 502 }
      )
    }

    /*
     * n8n biasanya mengembalikan:
     *
     * {
     *   "text": "..."
     * }
     *
     * tetapi kita juga mendukung:
     *
     * {
     *   "result": {
     *     "text": "..."
     *   }
     * }
     *
     * dan format terstruktur.
     */

    let resultSource: unknown = parsedResponse

    if (
      parsedResponse &&
      typeof parsedResponse === "object"
    ) {
      const responseObject =
        parsedResponse as Record<string, unknown>

      if (
        responseObject.result &&
        typeof responseObject.result === "object"
      ) {
        resultSource = responseObject.result
      }
    }

    const result = normalizeResult(resultSource)

    /*
     * Untuk saat ini kita tidak lagi mengharuskan
     * suggestedReply secara mutlak.
     *
     * Yang penting AI berhasil menghasilkan analisis.
     */

    if (
      !result.analysis &&
      !result.suggestedReply &&
      !result.nextQuestion
    ) {
      console.error(
        "Format hasil Copilot tidak dikenali:",
        parsedResponse
      )

      return Response.json(
        {
          success: false,
          error:
            "Format hasil Copilot dari n8n tidak dapat dibaca.",
        } satisfies CopilotResponse,
        { status: 502 }
      )
    }

    return Response.json({
      success: true,
      result,
    } satisfies CopilotResponse)
  } catch (error) {
    console.error(
      "AutoMora Copilot route error:",
      error
    )

    if (
      error instanceof Error &&
      error.name === "AbortError"
    ) {
      return Response.json(
        {
          success: false,
          error:
            "Waktu tunggu Copilot ke n8n habis setelah 60 detik.",
        } satisfies CopilotResponse,
        { status: 504 }
      )
    }

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : FALLBACK_ERROR,
      } satisfies CopilotResponse,
      { status: 500 }
    )
  }
}