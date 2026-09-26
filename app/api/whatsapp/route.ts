import { NextRequest, NextResponse } from "next/server";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const N8N_WEBHOOK_URL = process.env.AUTOMORA_N8N_WEBHOOK_URL;

const GRAPH_API_VERSION =
  process.env.WHATSAPP_GRAPH_API_VERSION || "v25.0";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token &&
    VERIFY_TOKEN &&
    token === VERIFY_TOKEN
  ) {
    return new NextResponse(challenge);
  }

  return NextResponse.json(
    { error: "Forbidden" },
    { status: 403 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log(
      "WhatsApp Webhook received:",
      JSON.stringify(body, null, 2)
    );

    const entries = Array.isArray(body?.entry)
      ? body.entry
      : [];

    for (const entry of entries) {
      const changes = Array.isArray(entry?.changes)
        ? entry.changes
        : [];

      for (const change of changes) {
        const value = change?.value;

        const messages = Array.isArray(value?.messages)
          ? value.messages
          : [];

        for (const message of messages) {
          const from = message?.from;
          const messageType = message?.type;

          // Untuk tahap ini hanya pesan teks
          if (
            typeof from !== "string" ||
            messageType !== "text" ||
            typeof message?.text?.body !== "string"
          ) {
            console.log(
              "WhatsApp message skipped:",
              JSON.stringify({
                from,
                messageType,
              })
            );

            continue;
          }

          const incomingText = message.text.body.trim();

          if (!incomingText) {
            continue;
          }

          console.log("WhatsApp incoming message:", {
            from,
            text: incomingText,
          });

          // Pastikan konfigurasi tersedia
          if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
            console.error(
              "WhatsApp API credentials are missing."
            );

            continue;
          }

          if (!N8N_WEBHOOK_URL) {
            console.error(
              "AUTOMORA_N8N_WEBHOOK_URL belum dikonfigurasi."
            );

            continue;
          }

          /*
           * WhatsApp dibuat kompatibel dengan format
           * yang sekarang dibaca oleh AI Detector:
           *
           * $('Webhook').item.json.body.message
           * $('Webhook').item.json.body.history
           */
          const conversationId = `whatsapp_${from}`;

          const n8nPayload = {
            body: {
              source: "whatsapp",
              conversationId,
              phoneNumber: from,
              message: incomingText,
              history: [],
              timestamp: new Date().toISOString(),
              status: "ACTIVE_AI",
            },
          };

          console.log(
            "WhatsApp → n8n:",
            JSON.stringify(n8nPayload, null, 2)
          );

          // Kirim pesan ke workflow n8n existing
          const n8nResponse = await fetch(
            N8N_WEBHOOK_URL,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify(n8nPayload),
              cache: "no-store",
            }
          );

          const n8nRawResponse =
            await n8nResponse.text();

          console.log(
            "n8n WhatsApp response:",
            n8nRawResponse
          );

          if (!n8nResponse.ok) {
            console.error(
              "n8n WhatsApp error:",
              {
                status: n8nResponse.status,
                response: n8nRawResponse,
              }
            );

            continue;
          }

          // Baca response dari Respond to Webhook n8n
          let n8nData: Record<string, unknown>;

          try {
            const parsed = JSON.parse(
              n8nRawResponse
            );

            if (
              !parsed ||
              typeof parsed !== "object"
            ) {
              console.error(
                "Respons n8n bukan object:",
                parsed
              );

              continue;
            }

            n8nData =
              parsed as Record<string, unknown>;
          } catch {
            console.error(
              "Respons n8n bukan JSON:",
              n8nRawResponse
            );

            continue;
          }

          /*
           * Website saat ini mendukung:
           * reply
           * atau
           * response
           */
          const aiReply =
            typeof n8nData.reply === "string"
              ? n8nData.reply.trim()
              : typeof n8nData.response === "string"
              ? n8nData.response.trim()
              : "";

          if (!aiReply) {
            console.error(
              "n8n tidak mengembalikan field reply atau response.",
              n8nData
            );

            continue;
          }

          console.log(
            "AI reply untuk WhatsApp:",
            aiReply
          );

          // Kirim jawaban AI kembali ke WhatsApp
          const whatsappApiUrl =
            `https://graph.facebook.com/${GRAPH_API_VERSION}` +
            `/${PHONE_NUMBER_ID}/messages`;

          const whatsappResponse =
            await fetch(whatsappApiUrl, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: from,
                type: "text",
                text: {
                  preview_url: false,
                  body: aiReply,
                },
              }),
              cache: "no-store",
            });

          const whatsappResponseText =
            await whatsappResponse.text();

          if (!whatsappResponse.ok) {
            console.error(
              "WhatsApp send failed:",
              {
                status: whatsappResponse.status,
                response: whatsappResponseText,
              }
            );

            continue;
          }

          console.log(
            "WhatsApp AI reply sent successfully:",
            whatsappResponseText
          );
        }
      }
    }

    // Meta hanya perlu menerima ACK HTTP 200
    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "WhatsApp Webhook Error:",
      error
    );

    /*
     * Tetap HTTP 200 agar Meta tidak terus-menerus
     * mengirim ulang event yang sama.
     */
    return NextResponse.json(
      { success: false },
      { status: 200 }
    );
  }
}