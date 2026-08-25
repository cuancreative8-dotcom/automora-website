"use client"

import { useState } from "react"
import {
  Bot,
  Brain,
  Building2,
  Check,
  ChevronDown,
  Clipboard,
  Copy,
  MessageSquareText,
  Send,
  Sparkles,
  Target,
  UserRound,
  X,
} from "lucide-react"

type CopilotMode = "analyze" | "reply" | "sales" | "close"

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

const modes: {
  id: CopilotMode
  label: string
  description: string
  icon: typeof Brain
}[] = [
  {
    id: "analyze",
    label: "Analyze",
    description: "Memahami kondisi dan kebutuhan klien",
    icon: Brain,
  },
  {
    id: "reply",
    label: "Reply",
    description: "Membantu menyusun jawaban",
    icon: MessageSquareText,
  },
  {
    id: "sales",
    label: "Sales",
    description: "Memandu arah konsultasi dan penjualan",
    icon: Target,
  },
  {
    id: "close",
    label: "Close",
    description: "Membantu mengarahkan ke tahap closing",
    icon: Check,
  },
]

export default function CopilotPage() {
  const [clientName, setClientName] = useState("")
  const [company, setCompany] = useState("")
  const [conversation, setConversation] = useState("")
  const [mode, setMode] = useState<CopilotMode>("analyze")

  const [result, setResult] = useState<CopilotResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  const hasInput =
    clientName.trim() ||
    company.trim() ||
    conversation.trim()

  async function handleAnalyze() {
    if (!conversation.trim()) {
      setError(
        "Silakan paste percakapan WhatsApp klien terlebih dahulu."
      )
      return
    }

    setLoading(true)
    setError("")
    setResult(null)
    setCopied(false)

    try {
      const response = await fetch("/api/copilot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientName: clientName.trim(),
          company: company.trim(),
          conversation: conversation.trim(),
          mode,
        }),
      })

      const data =
        (await response.json()) as CopilotResponse

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Copilot gagal memproses percakapan."
        )
      }

      setResult(data.result || {})
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menghubungkan ke Copilot."
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    const text = result?.suggestedReply?.trim()

    if (!text) {
      return
    }

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)

      window.setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch {
      setCopied(false)
    }
  }

  function clearConversation() {
    setConversation("")
    setResult(null)
    setError("")
    setCopied(false)
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-ice text-brand-blue-deep">
              <Bot className="size-6" />
            </div>

            <div>
              <h1 className="font-heading text-lg font-bold tracking-tight">
                AutoMora Copilot
              </h1>

              <p className="text-xs text-slate-500">
                AI Assistant untuk Konsultasi Klien
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:flex">
            <span className="size-2 rounded-full bg-emerald-500" />
            Internal Assistant
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-blue-deep">
            Consultation Intelligence
          </p>

          <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Bantu saya menjawab klien
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Masukkan percakapan dari WhatsApp. Copilot akan membantu memahami
            konteks klien, menentukan langkah berikutnya, dan menyiapkan
            jawaban yang lebih tepat.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          {/* LEFT: INPUT */}
          <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-brand-ice text-brand-blue-deep">
                  <Clipboard className="size-5" />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900">
                    Data Konsultasi
                  </h3>

                  <p className="text-xs text-slate-500">
                    Masukkan informasi yang kamu miliki
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              {/* CLIENT NAME */}
              <div>
                <label
                  htmlFor="client-name"
                  className="flex items-center gap-2 text-sm font-semibold text-slate-800"
                >
                  <UserRound className="size-4 text-brand-blue-deep" />
                  Nama Klien
                </label>

                <input
                  id="client-name"
                  type="text"
                  value={clientName}
                  onChange={(event) =>
                    setClientName(event.target.value)
                  }
                  placeholder="Contoh: Sochibun"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                />
              </div>

              {/* COMPANY */}
              <div>
                <label
                  htmlFor="client-company"
                  className="flex items-center gap-2 text-sm font-semibold text-slate-800"
                >
                  <Building2 className="size-4 text-brand-blue-deep" />
                  Nama Perusahaan / Bisnis
                </label>

                <input
                  id="client-company"
                  type="text"
                  value={company}
                  onChange={(event) =>
                    setCompany(event.target.value)
                  }
                  placeholder="Contoh: Toko Bangunan Dyah Jaya"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                />
              </div>

              {/* CONVERSATION */}
              <div>
                <div className="flex items-center justify-between gap-3">
                  <label
                    htmlFor="conversation"
                    className="flex items-center gap-2 text-sm font-semibold text-slate-800"
                  >
                    <MessageSquareText className="size-4 text-brand-blue-deep" />
                    Pesan / Percakapan Klien
                  </label>

                  {conversation ? (
                    <button
                      type="button"
                      onClick={clearConversation}
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition hover:text-red-600"
                    >
                      <X className="size-3.5" />
                      Bersihkan
                    </button>
                  ) : null}
                </div>

                <textarea
                  id="conversation"
                  value={conversation}
                  onChange={(event) =>
                    setConversation(event.target.value)
                  }
                  placeholder={`Paste pesan atau riwayat WhatsApp di sini.

Contoh:

Klien:
Pak, saya sering keteteran membuat laporan bulanan.

Saya masih menggunakan Excel.

Kira-kira laporan toko saya bisa dibuat otomatis?`}
                  className="mt-2 min-h-[18rem] w-full resize-y rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-7 outline-none transition placeholder:text-slate-400 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                />

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Kamu bisa langsung copy-paste pesan atau beberapa bagian
                  percakapan WhatsApp.
                </p>
              </div>

              {/* MODE */}
              <div>
                <label className="text-sm font-semibold text-slate-800">
                  Bantuan yang dibutuhkan
                </label>

                <div className="relative mt-2">
                  <select
                    value={mode}
                    onChange={(event) =>
                      setMode(event.target.value as CopilotMode)
                    }
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-medium outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                  >
                    {modes.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label} — {item.description}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* ERROR */}
              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                  {error}
                </div>
              ) : null}

              {/* BUTTON */}
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={!hasInput || loading}
                className="flex w-full items-center justify-center rounded-xl bg-brand-blue px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-blue-deep disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <span className="mr-2 size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Copilot sedang menganalisis...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 size-4" />
                    Analisis dengan Copilot
                  </>
                )}
              </button>
            </div>
          </section>

          {/* RIGHT: COPILOT RESULT */}
          <section className="flex min-h-[42rem] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-brand-navy px-5 py-5 text-white sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-white/10">
                  <Bot className="size-5" />
                </div>

                <div>
                  <h3 className="font-semibold">
                    Copilot Guidance
                  </h3>

                  <p className="text-xs text-white/60">
                    Panduan untuk kamu, bukan balasan otomatis ke klien
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-1 flex-col p-5 sm:p-6">
              {/* INITIAL STATE */}
              {!result && !loading ? (
                <div className="flex flex-1 items-center justify-center">
                  <div className="max-w-sm text-center">
                    <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-brand-ice text-brand-blue-deep">
                      <Brain className="size-8" />
                    </div>

                    <h4 className="mt-5 font-heading text-xl font-bold">
                      Copilot siap membantu
                    </h4>

                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      Paste percakapan klien di sebelah kiri. Copilot akan
                      menganalisis percakapan dan memberikan panduan
                      konsultasi.
                    </p>
                  </div>
                </div>
              ) : null}

              {/* LOADING */}
              {loading ? (
                <div className="flex flex-1 items-center justify-center">
                  <div className="max-w-sm text-center">
                    <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-brand-ice text-brand-blue-deep">
                      <Sparkles className="size-8 animate-pulse" />
                    </div>

                    <h4 className="mt-5 font-heading text-xl font-bold">
                      Copilot sedang berpikir...
                    </h4>

                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      Sedang memahami konteks klien, masalah bisnis,
                      kebutuhan, dan langkah konsultasi berikutnya.
                    </p>
                  </div>
                </div>
              ) : null}

              {/* RESULT */}
              {result && !loading ? (
                <div className="space-y-5">
                  {/* ANALYSIS */}
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
                    <div className="flex items-center gap-2 text-sm font-bold text-brand-blue-deep">
                      <Brain className="size-4" />
                      Analisis
                    </div>

                    <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                      {result.analysis ||
                        result.clientNeed ||
                        result.painPoint ||
                        "Tidak ada analisis yang diberikan."}
                    </div>
                  </div>

                  {/* STAGE & STRATEGY */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                      <Target className="size-4 text-brand-blue-deep" />
                      Arah Konsultasi
                    </div>

                    <div className="mt-4 space-y-4">
                      {result.conversationStage ? (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Tahap Konsultasi
                          </p>

                          <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                            {result.conversationStage}
                          </p>
                        </div>
                      ) : null}

                      {result.strategy ? (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Strategi
                          </p>

                          <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                            {result.strategy}
                          </p>
                        </div>
                      ) : null}

                      {result.painPoint ? (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Pain Point
                          </p>

                          <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                            {result.painPoint}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* REPLY */}
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                        <Send className="size-4" />
                        Saran Jawaban
                      </div>

                      <button
                        type="button"
                        onClick={handleCopy}
                        disabled={!result.suggestedReply}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {copied ? (
                          <>
                            <Check className="size-3.5" />
                            Tersalin
                          </>
                        ) : (
                          <>
                            <Copy className="size-3.5" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>

                    <div className="mt-3 rounded-xl border border-emerald-100 bg-white p-4">
                      <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
                        {result.suggestedReply ||
                          "Copilot belum menghasilkan saran jawaban."}
                      </p>
                    </div>
                  </div>

                  {/* NEXT QUESTION */}
                  {result.nextQuestion ? (
                    <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-5">
                      <div className="flex items-center gap-2 text-sm font-bold text-amber-800">
                        <MessageSquareText className="size-4" />
                        Pertanyaan Berikutnya
                      </div>

                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                        {result.nextQuestion}
                      </p>
                    </div>
                  ) : null}

                  {/* SALES GUIDANCE */}
                  {result.salesGuidance ? (
                    <div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-5">
                      <div className="flex items-center gap-2 text-sm font-bold text-violet-800">
                        <Target className="size-4" />
                        Sales Guidance
                      </div>

                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                        {result.salesGuidance}
                      </p>
                    </div>
                  ) : null}

                  {/* NOTICE */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs leading-5 text-slate-500">
                      <strong className="text-slate-700">
                        Catatan:
                      </strong>{" "}
                      Copilot hanya memberikan rekomendasi. Kamu tetap
                      memegang kendali atas jawaban yang dikirim kepada
                      klien melalui WhatsApp.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}