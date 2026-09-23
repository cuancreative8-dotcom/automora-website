import { NextRequest, NextResponse } from "next/server";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const GRAPH_API_VERSION =
  process.env.WHATSAPP_GRAPH_API_VERSION || "v25.0";

const AUTO_REPLY =
  "Halo 👋 Terima kasih sudah menghubungi AutoMora Indonesia. Pesan Anda sudah kami terima. Tim AutoMora siap membantu kebutuhan bisnis Anda.";

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

    // Ambil semua event perubahan dari webhook Meta
    const entries = Array.isArray(body?.entry) ? body.entry : [];

    for (const entry of entries) {
      const changes = Array.isArray(entry?.changes)
        ? entry.changes
        : [];

      for (const change of changes) {
        const value = change?.value;

        // Event status/read/delivery biasanya tidak memiliki messages.
        // Kita hanya memproses pesan masuk.
        const messages = Array.isArray(value?.messages)
          ? value.messages
          : [];

        for (const message of messages) {
          const from = message?.from;
          const messageType = message?.type;

          // Tahap 1 hanya menangani pesan teks.
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

          console.log("WhatsApp incoming message:", {
            from,
            text: incomingText,
          });

          // Pastikan kredensial tersedia sebelum mengirim balasan.
          if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
            console.error(
              "WhatsApp API credentials are missing."
            );

            // Webhook tetap di-ack agar Meta tidak menganggap
            // event masuk gagal.
            continue;
          }

          const whatsappApiUrl =
            `https://graph.facebook.com/${GRAPH_API_VERSION}` +
            `/${PHONE_NUMBER_ID}/messages`;

          const response = await fetch(whatsappApiUrl, {
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
                body: AUTO_REPLY,
              },
            }),
            cache: "no-store",
          });

          const responseText = await response.text();

          if (!response.ok) {
            console.error(
              "WhatsApp send failed:",
              {
                status: response.status,
                response: responseText,
              }
            );

            continue;
          }

          console.log(
            "WhatsApp reply sent successfully:",
            responseText
          );
        }
      }
    }

    // Meta hanya perlu tahu webhook berhasil menerima event.
    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "WhatsApp Webhook Error:",
      error
    );

    return NextResponse.json(
      { success: false },
      { status: 200 }
    );
  }
}