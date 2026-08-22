export const runtime = "nodejs";

type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

type ConsultationRequest = {
  conversationId?: string;
  phoneNumber?: string;
  message: string;
  history?: ConversationMessage[];
  timestamp?: string;
  status?: string;
};

type ConsultationResponse = {
  success: boolean;
  response?: string;
  status?: string;
  escalation?: boolean;
  escalationSummary?: unknown;
  error?: string;
};

const FALLBACK_MESSAGE =
  "Maaf, kami sedang mengalami kendala dalam memproses pesan Anda. Kami akan membantu melanjutkan percakapan sesegera mungkin.";

function getN8nWebhookUrl(): string {
  const url = process.env.AUTOMORA_N8N_WEBHOOK_URL?.trim();

  if (!url) {
    throw new Error(
      "AUTOMORA_N8N_WEBHOOK_URL belum dikonfigurasi pada environment."
    );
  }

  return url;
}

function isConversationMessage(
  value: unknown
): value is ConversationMessage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const message = value as Record<string, unknown>;

  return (
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string"
  );
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body: unknown = await request.json();

    if (!body || typeof body !== "object") {
      return Response.json(
        {
          success: false,
          error: "Format request tidak valid.",
        } satisfies ConsultationResponse,
        { status: 400 }
      );
    }

    const data = body as Record<string, unknown>;

    const message =
      typeof data.message === "string"
        ? data.message.trim()
        : "";

    if (!message) {
      return Response.json(
        {
          success: false,
          error: "Pesan tidak boleh kosong.",
        } satisfies ConsultationResponse,
        { status: 400 }
      );
    }

    const history = Array.isArray(data.history)
      ? data.history.filter(isConversationMessage)
      : [];

    const payload: ConsultationRequest = {
      conversationId:
        typeof data.conversationId === "string"
          ? data.conversationId
          : undefined,

      phoneNumber:
        typeof data.phoneNumber === "string"
          ? data.phoneNumber
          : undefined,

      message,

      history,

      timestamp:
        typeof data.timestamp === "string"
          ? data.timestamp
          : new Date().toISOString(),

      status:
        typeof data.status === "string"
          ? data.status
          : "ACTIVE_AI",
    };

    const webhookUrl = getN8nWebhookUrl();

    console.log("AutoMora → n8n:", webhookUrl);

    /*
     * n8n dapat membutuhkan lebih dari 30 detik karena
     * proses AI/Gemini.
     *
     * Sebelumnya request dibatalkan pada 30 detik,
     * sementara execution n8n terakhir selesai sekitar 40 detik.
     *
     * Kita beri waktu maksimal 60 detik.
     */
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 60000);

    let n8nResponse: Response;

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
      });
    } finally {
      clearTimeout(timeout);
    }

    console.log("n8n response status:", n8nResponse.status);

    const rawResponse = await n8nResponse.text();

    console.log("n8n raw response:", rawResponse);

    if (!n8nResponse.ok) {
      console.error(
        "n8n webhook error:",
        n8nResponse.status,
        rawResponse
      );

      return Response.json(
        {
          success: false,
          response: FALLBACK_MESSAGE,
          error: `n8n mengembalikan HTTP ${n8nResponse.status}.`,
        } satisfies ConsultationResponse,
        { status: 502 }
      );
    }

    let result: unknown;

    try {
      result = JSON.parse(rawResponse);
    } catch {
      console.error(
        "Respons n8n bukan JSON valid:",
        rawResponse
      );

      return Response.json(
        {
          success: false,
          response: FALLBACK_MESSAGE,
          error: "Respons dari n8n bukan JSON yang valid.",
        } satisfies ConsultationResponse,
        { status: 502 }
      );
    }

    if (!result || typeof result !== "object") {
      return Response.json(
        {
          success: false,
          response: FALLBACK_MESSAGE,
          error: "Respons dari n8n tidak valid.",
        } satisfies ConsultationResponse,
        { status: 502 }
      );
    }

    const n8nData = result as Record<string, unknown>;

    /*
     * n8n mengembalikan:
     *
     * {
     *   "reply": "jawaban AI"
     * }
     *
     * Sedangkan frontend AutoMora menggunakan field:
     *
     * {
     *   "response": "jawaban AI"
     * }
     *
     * Jadi kita jembatani keduanya di sini.
     */
    const responseText =
      typeof n8nData.reply === "string"
        ? n8nData.reply.trim()
        : typeof n8nData.response === "string"
        ? n8nData.response.trim()
        : "";

    if (!responseText) {
      console.error(
        "Field reply/response tidak ditemukan pada respons n8n:",
        n8nData
      );

      return Response.json(
        {
          success: false,
          response: FALLBACK_MESSAGE,
          error:
            "n8n tidak mengembalikan field reply atau response.",
        } satisfies ConsultationResponse,
        { status: 502 }
      );
    }

    /*
     * Response ke website tetap menggunakan kontrak
     * yang sudah digunakan frontend AutoMora:
     *
     * {
     *   success: true,
     *   response: "..."
     * }
     */
    return Response.json({
      success: true,
      response: responseText,
      status:
        typeof n8nData.status === "string"
          ? n8nData.status
          : "ACTIVE_AI",
      escalation:
        typeof n8nData.escalation === "boolean"
          ? n8nData.escalation
          : false,
      escalationSummary:
        n8nData.escalationSummary ?? null,
    } satisfies ConsultationResponse);
  } catch (error) {
    console.error(
      "AutoMora consultation route error:",
      error
    );

    if (
      error instanceof Error &&
      error.name === "AbortError"
    ) {
      return Response.json(
        {
          success: false,
          response: FALLBACK_MESSAGE,
          error:
            "Waktu tunggu ke n8n habis setelah 60 detik.",
        } satisfies ConsultationResponse,
        { status: 504 }
      );
    }

    return Response.json(
      {
        success: false,
        response: FALLBACK_MESSAGE,
        error:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan pada sistem konsultasi.",
      } satisfies ConsultationResponse,
      { status: 500 }
    );
  }
}