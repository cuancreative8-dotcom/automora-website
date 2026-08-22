"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  CircleCheck,
  ClipboardCheck,
  ContactRound,
  FileText,
  Headphones,
  LayoutDashboard,
  Link2,
  Loader2,
  Mail,
  MapPinned,
  MessageCircleMore,
  Send,
  Sparkles,
  X,
} from "lucide-react"

import { buttonVariants } from "@/components/ui/button"

const highlights = [
  "Praktis untuk digunakan",
  "Disesuaikan dengan bisnis Anda",
  "Fokus pada hasil bisnis",
]

const workflows = [
  { label: "Permintaan masuk", tone: "bg-brand-blue" },
  { label: "Tindak lanjut", tone: "bg-brand-violet" },
  { label: "Laporan harian", tone: "bg-brand-pink" },
]

const services = [
  {
    icon: Bot,
    title: "Virtual CS",
    description:
      "AI yang membantu menjawab pertanyaan pelanggan secara otomatis melalui WhatsApp.",
  },
  {
    icon: MessageCircleMore,
    title: "Otomatisasi WhatsApp",
    description:
      "Mengirim pesan, notifikasi, dan follow up secara otomatis.",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard Bisnis",
    description:
      "Memantau data bisnis secara real-time dalam satu dashboard.",
  },
  {
    icon: ContactRound,
    title: "CRM Penjualan",
    description:
      "Mengelola prospek, pelanggan, dan aktivitas penjualan lebih terstruktur.",
  },
  {
    icon: FileText,
    title: "Laporan Otomatis",
    description:
      "Membuat laporan bisnis secara otomatis tanpa proses manual.",
  },
  {
    icon: ClipboardCheck,
    title: "Persetujuan Digital",
    description:
      "Mempercepat proses approval antar divisi secara digital.",
  },
  {
    icon: MapPinned,
    title: "Rekrutmen HR",
    description:
      "Mengotomatisasi proses seleksi dan administrasi kandidat.",
  },
  {
    icon: Sparkles,
    title: "Penjadwalan Otomatis",
    description:
      "Menjadwalkan pekerjaan, pengingat, dan aktivitas secara otomatis.",
  },
  {
    icon: Link2,
    title: "Integrasi Sistem",
    description:
      "Menghubungkan aplikasi yang digunakan perusahaan agar saling terintegrasi.",
  },
]

type ConversationMessage = {
  role: "user" | "assistant"
  content: string
}

function normalizeWhatsAppNumber(value: string): string {
  const cleaned = value.replace(/[^\d+]/g, "")

  if (cleaned.startsWith("08")) {
    return `+62${cleaned.slice(1)}`
  }

  if (cleaned.startsWith("62")) {
    return `+${cleaned}`
  }

  if (cleaned.startsWith("+62")) {
    return cleaned
  }

  return cleaned
}

function isValidWhatsAppNumber(value: string): boolean {
  const normalized = normalizeWhatsAppNumber(value)

  if (!normalized.startsWith("+62")) {
    return false
  }

  const digits = normalized.replace(/\D/g, "")

  return digits.length >= 10 && digits.length <= 15
}

function ConsultationModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [message, setMessage] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const [conversationId, setConversationId] = useState("")
  const [history, setHistory] = useState<ConversationMessage[]>([])
  const [error, setError] = useState("")

  const [escalated, setEscalated] = useState(false)
  const [escalationSummary, setEscalationSummary] = useState("")
  const [phoneSubmitted, setPhoneSubmitted] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    })
  }, [
    history,
    loading,
    open,
    escalated,
    phoneSubmitted,
  ])

  if (!open) {
    return null
  }

  function createConversationId() {
    return `consultation-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`
  }

  async function sendMessage(isFirstMessage = false) {
    const trimmedMessage = message.trim()

    if (!trimmedMessage) {
      setError(
        isFirstMessage
          ? "Silakan perkenalkan diri dan ceritakan kebutuhan bisnis Anda terlebih dahulu."
          : "Silakan tuliskan pesan Anda terlebih dahulu."
      )
      return
    }

    setLoading(true)
    setError("")

    const activeConversationId =
      conversationId || createConversationId()

    if (!conversationId) {
      setConversationId(activeConversationId)
    }

    const userMessage: ConversationMessage = {
      role: "user",
      content: trimmedMessage,
    }

    const updatedHistory = [...history, userMessage]

    setHistory(updatedHistory)
    setMessage("")

    if (isFirstMessage) {
      setStarted(true)
    }

    try {
      const res = await fetch("/api/consultation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: activeConversationId,
          phoneNumber: phoneSubmitted
            ? normalizeWhatsAppNumber(phoneNumber)
            : undefined,
          message: trimmedMessage,
          history: updatedHistory,
          timestamp: new Date().toISOString(),
          status: escalated ? "ESCALATED" : "ACTIVE_AI",
        }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Terjadi kesalahan pada sistem konsultasi."
        )
      }

      const isEscalated =
        data?.escalation === true ||
        data?.status === "ESCALATED"

      if (isEscalated) {
        setEscalated(true)

        if (typeof data?.escalationSummary === "string") {
          setEscalationSummary(
            data.escalationSummary.trim()
          )
        }
      }

      const aiResponse =
        typeof data?.response === "string"
          ? data.response.trim()
          : ""

      if (!aiResponse) {
        throw new Error(
          "AutoMora belum menerima balasan dari sistem konsultasi."
        )
      }

      const assistantMessage: ConversationMessage = {
        role: "assistant",
        content: aiResponse,
      }

      setHistory((currentHistory) => [
        ...currentHistory,
        assistantMessage,
      ])
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan pada sistem konsultasi."
      )
    } finally {
      setLoading(false)
    }
  }

  async function submitPhoneNumber() {
    const trimmedPhone = phoneNumber.trim()

    if (!trimmedPhone) {
      setError(
        "Silakan masukkan nomor WhatsApp yang dapat dihubungi."
      )
      return
    }

    if (!isValidWhatsAppNumber(trimmedPhone)) {
      setError(
        "Nomor WhatsApp belum valid. Contoh: 087812345678"
      )
      return
    }

    if (!conversationId) {
      setError(
        "ID konsultasi belum tersedia. Silakan lanjutkan percakapan terlebih dahulu."
      )
      return
    }

    setLoading(true)
    setError("")

    const normalizedPhone =
      normalizeWhatsAppNumber(trimmedPhone)

    try {
      /*
       * Kita kirim nomor WhatsApp ke endpoint yang sama.
       *
       * route.ts sudah memiliki field:
       *
       * phoneNumber
       *
       * Untuk menjaga kontrak endpoint yang sekarang,
       * field message tetap diisi dengan pesan sistem.
       *
       * Riwayat percakapan asli tetap dikirim sehingga
       * n8n tetap memiliki konteks konsultasi.
       */
      const res = await fetch("/api/consultation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId,
          phoneNumber: normalizedPhone,
          message:
            "Calon klien memberikan nomor WhatsApp untuk dihubungi oleh tim AutoMora.",
          history,
          timestamp: new Date().toISOString(),
          status: "ESCALATED",
        }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Nomor WhatsApp belum berhasil diteruskan."
        )
      }

      /*
       * Nomor sudah berhasil diterima oleh API AutoMora.
       */
      setPhoneSubmitted(true)

      /*
       * Jika respons backend masih mengembalikan informasi
       * eskalasi, kita pertahankan statusnya.
       */
      if (
        data?.escalation === true ||
        data?.status === "ESCALATED"
      ) {
        setEscalated(true)
      }

      if (typeof data?.escalationSummary === "string") {
        setEscalationSummary(
          data.escalationSummary.trim()
        )
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Nomor WhatsApp belum berhasil diteruskan."
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit() {
    await sendMessage(!started)
  }

  function handleClose() {
    if (loading) {
      return
    }

    setMessage("")
    setPhoneNumber("")
    setLoading(false)
    setStarted(false)
    setConversationId("")
    setHistory([])
    setError("")
    setEscalated(false)
    setEscalationSummary("")
    setPhoneSubmitted(false)

    onClose()
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()

      if (!loading) {
        void handleSubmit()
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose()
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="consultation-modal-title"
        className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        {/* HEADER */}
        <div className="shrink-0 border-b border-border bg-white px-6 py-5 sm:px-7">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            aria-label="Tutup konsultasi"
            className="absolute right-4 top-4 z-10 flex size-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="size-5" />
          </button>

          <div className="pr-12">
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-ice text-brand-blue-deep">
                <MessageCircleMore className="size-5" />
              </div>

              <div>
                <h2
                  id="consultation-modal-title"
                  className="font-heading text-xl font-bold tracking-tight text-foreground"
                >
                  Konsultasi dengan AutoMora
                </h2>

                {started ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {escalated
                      ? "Konsultasi diteruskan ke tim AutoMora"
                      : "AutoMora Business Consultant"}
                  </p>
                ) : (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Ceritakan kebutuhan bisnis Anda
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        {!started ? (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-7">
              <div className="rounded-2xl border border-brand-blue/10 bg-brand-ice/60 p-4">
                <p className="text-sm font-medium leading-6 text-brand-navy">
                  Semakin lengkap informasi yang Anda berikan, semakin tepat
                  kami memahami kebutuhan Anda.
                </p>
              </div>

              <div className="mt-6">
                <label
                  htmlFor="consultation-message"
                  className="text-sm font-semibold text-foreground"
                >
                  Ceritakan tentang bisnis Anda
                </label>

                <textarea
                  id="consultation-message"
                  value={message}
                  onChange={(event) => {
                    setMessage(event.target.value)
                    setError("")
                  }}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  placeholder={`Nama saya Budi.
Saya memiliki Toko Bangunan Budi Jaya.
Saya ingin mengotomatisasi pesanan melalui WhatsApp karena selama ini masih dicatat secara manual dan sering terjadi keterlambatan membalas pelanggan.

Ceritakan juga bagian bisnis mana yang paling ingin Anda otomatisasi.`}
                  className="mt-3 min-h-[18rem] w-full resize-none rounded-2xl border border-border bg-white p-4 text-sm leading-7 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 disabled:cursor-not-allowed disabled:bg-slate-50"
                />

                <p className="mt-2 text-xs text-muted-foreground">
                  Tekan Enter untuk mengirim atau Shift + Enter untuk membuat
                  baris baru.
                </p>
              </div>

              {error ? (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
                  {error}
                </div>
              ) : null}
            </div>

            {/* FIRST SEND */}
            <div className="shrink-0 border-t border-border bg-white p-5 sm:px-7">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className={`${buttonVariants({
                  variant: "default",
                  size: "lg",
                })} w-full`}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    AutoMora sedang menganalisis...
                  </>
                ) : (
                  <>
                    Mulai Konsultasi
                    <ArrowRight className="ml-2 size-4" />
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* CHAT AREA */}
            <div className="flex-1 overflow-y-auto bg-slate-50/70 px-4 py-5 sm:px-6">
              <div className="space-y-4">
                {history.map((item, index) => {
                  const isUser = item.role === "user"

                  return (
                    <div
                      key={`${item.role}-${index}`}
                      className={`flex ${
                        isUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                          isUser
                            ? "rounded-br-md bg-brand-blue text-white"
                            : "rounded-bl-md border border-border bg-white text-brand-navy"
                        }`}
                      >
                        {!isUser ? (
                          <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-brand-blue-deep">
                            <div className="flex size-6 items-center justify-center rounded-full bg-brand-ice">
                              <Bot className="size-3.5" />
                            </div>
                            AutoMora
                          </div>
                        ) : null}

                        <p className="whitespace-pre-wrap">
                          {item.content}
                        </p>
                      </div>
                    </div>
                  )
                })}

                {/* STATUS ESKALASI */}
                {escalated ? (
                  <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-brand-blue-deep shadow-sm">
                        <Headphones className="size-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-brand-blue-deep">
                          Konsultasi diteruskan ke tim AutoMora
                        </p>

                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          Kebutuhan Anda telah ditandai untuk dibahas lebih
                          lanjut oleh tim AutoMora.
                        </p>

                        {escalationSummary ? (
                          <p className="mt-2 text-xs leading-5 text-slate-500">
                            {escalationSummary}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* FORM NOMOR WHATSAPP */}
                {escalated && !phoneSubmitted ? (
                  <div className="rounded-2xl border border-brand-blue/15 bg-white p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-ice text-brand-blue-deep">
                        <MessageCircleMore className="size-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-brand-navy">
                          Agar tim AutoMora dapat menghubungi Anda
                        </p>

                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          Silakan berikan nomor WhatsApp yang dapat dihubungi
                          untuk pembahasan selanjutnya.
                        </p>

                        <div className="mt-4">
                          <label
                            htmlFor="consultation-phone"
                            className="text-xs font-semibold text-foreground"
                          >
                            Nomor WhatsApp
                          </label>

                          <input
                            id="consultation-phone"
                            type="tel"
                            inputMode="tel"
                            autoComplete="tel"
                            value={phoneNumber}
                            onChange={(event) => {
                              setPhoneNumber(event.target.value)
                              setError("")
                            }}
                            disabled={loading}
                            placeholder="Contoh: 087812345678"
                            className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 disabled:cursor-not-allowed disabled:bg-slate-50"
                          />

                          <p className="mt-2 text-xs leading-5 text-muted-foreground">
                            Nomor ini digunakan agar tim AutoMora dapat
                            menghubungi Anda terkait konsultasi ini.
                          </p>
                        </div>

                        {error ? (
                          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-700">
                            {error}
                          </div>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => {
                            void submitPhoneNumber()
                          }}
                          disabled={
                            loading || !phoneNumber.trim()
                          }
                          className={`${buttonVariants({
                            variant: "default",
                            size: "default",
                          })} mt-4 w-full`}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 size-4 animate-spin" />
                              Meneruskan kontak...
                            </>
                          ) : (
                            <>
                              Kirim Nomor WhatsApp
                              <ArrowRight className="ml-2 size-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* KONTAK SUDAH TERKIRIM */}
                {escalated && phoneSubmitted ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">
                        <CheckCircle2 className="size-5" />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-emerald-800">
                          Kontak berhasil diteruskan
                        </p>

                        <p className="mt-1 text-sm leading-6 text-emerald-700">
                          Nomor WhatsApp Anda sudah diterima. Tim AutoMora
                          dapat menggunakan informasi tersebut untuk
                          melanjutkan pembahasan konsultasi.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {loading ? (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-md border border-border bg-white px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex size-6 items-center justify-center rounded-full bg-brand-ice text-brand-blue-deep">
                          <Bot className="size-3.5" />
                        </div>

                        <span className="text-sm text-muted-foreground">
                          AutoMora sedang berpikir...
                        </span>

                        <Loader2 className="size-4 animate-spin text-brand-blue" />
                      </div>
                    </div>
                  </div>
                ) : null}

                {error && !escalated ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
                    {error}
                  </div>
                ) : null}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* CHAT COMPOSER */}
            <div className="shrink-0 border-t border-border bg-white p-4 sm:p-5">
              <div className="flex items-end gap-2 rounded-2xl border border-border bg-slate-50 p-2 focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/20">
                <textarea
                  value={message}
                  onChange={(event) => {
                    setMessage(event.target.value)
                    setError("")
                  }}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  rows={2}
                  placeholder={
                    escalated
                      ? "Anda masih dapat menambahkan informasi..."
                      : "Tulis balasan atau pertanyaan Anda..."
                  }
                  className="min-h-[3rem] flex-1 resize-none border-0 bg-transparent px-2 py-2 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
                />

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !message.trim()}
                  aria-label="Kirim pesan"
                  className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue text-white transition hover:bg-brand-blue-deep disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <Send className="size-5" />
                  )}
                </button>
              </div>

              <p className="mt-2 text-center text-[11px] text-muted-foreground">
                {escalated
                  ? "Informasi tambahan Anda tetap menjadi bagian dari konsultasi ini."
                  : "AutoMora akan memahami percakapan ini sebagai satu konsultasi."}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function Home() {
  const [consultationOpen, setConsultationOpen] = useState(false)

  return (
    <>
      <main id="beranda" className="flex-1 overflow-hidden">
        <section
          aria-labelledby="hero-heading"
          className="relative isolate overflow-hidden py-[clamp(4.5rem,8vw,7.5rem)]"
        >
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[linear-gradient(180deg,var(--automora-ice)_0%,transparent_100%)]"
          />

          <div
            aria-hidden="true"
            className="absolute top-8 right-[-8rem] -z-10 size-72 rounded-full bg-brand-blue/15 blur-3xl"
          />

          <div
            aria-hidden="true"
            className="absolute bottom-0 left-[-10rem] -z-10 size-80 rounded-full bg-brand-violet/10 blur-3xl"
          />

          <div className="mx-auto grid max-w-7xl items-center gap-12 px-gutter py-section lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div className="max-w-[42rem]">
              <p className="animate-in fade-in slide-in-from-bottom-3 inline-flex items-center gap-2 rounded-pill border border-brand-blue/15 bg-white/80 px-3 py-1.5 text-overline font-semibold text-brand-blue-deep shadow-xs backdrop-blur-sm duration-700 motion-reduce:animate-none">
                <Sparkles aria-hidden="true" className="size-3.5" />
                Business Automation &amp; AI Solutions
              </p>

              <h1
                id="hero-heading"
                className="animate-in fade-in slide-in-from-bottom-4 mt-6 font-heading text-display font-bold tracking-[-0.02em] text-foreground duration-700 delay-100 motion-reduce:animate-none"
              >
                Otomatiskan Proses Bisnis Anda.
                <span className="block text-display font-heading font-bold">
                  Tingkatkan Produktivitas Tim.
                </span>
              </h1>

              <p className="animate-in fade-in slide-in-from-bottom-4 mt-6 max-w-2xl text-lead text-muted-foreground duration-700 delay-200 motion-reduce:animate-none">
                AutoMora membantu bisnis mengurangi pekerjaan manual melalui
                Business Automation dan AI yang praktis, cepat, dan mudah
                digunakan.
              </p>

              <div className="animate-in fade-in slide-in-from-bottom-4 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center duration-700 delay-300 motion-reduce:animate-none">
                <button
                  type="button"
                  onClick={() => setConsultationOpen(true)}
                  className={buttonVariants({
                    variant: "default",
                    size: "lg",
                  })}
                >
                  Jadwalkan Konsultasi Gratis
                </button>

                <Link
                  href="#solusi"
                  className={buttonVariants({
                    variant: "outline",
                    size: "lg",
                  })}
                >
                  Lihat Solusi
                </Link>
              </div>
            </div>

            <div className="animate-in fade-in zoom-in-95 relative mx-auto w-full max-w-xl duration-700 delay-200 motion-reduce:animate-none">
              <div
                aria-hidden="true"
                className="absolute -inset-6 -z-10 rounded-full bg-brand-blue/10 blur-3xl"
              />

              <div className="overflow-hidden rounded-panel border border-white/80 bg-white/90 p-4 shadow-card backdrop-blur-sm sm:p-6">
                <div className="rounded-card bg-brand-navy p-6 text-white sm:p-8">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-overline font-semibold tracking-[0.12em] text-white/60 uppercase">
                        Illustrasi Dashboard
                      </p>

                      <p className="mt-1 text-title font-semibold tracking-[-0.03em]">
                        Visualisasi proses bisnis profesional
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
                      <span className="size-2.5 rounded-full bg-brand-blue" />
                      Live
                    </span>
                  </div>

                  <div className="mt-7 space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-card border border-white/10 bg-white/5 p-4">
                        <p className="text-xs text-white/70">
                          WhatsApp Automation
                        </p>
                        <div className="mt-3 h-2.5 w-20 rounded-full bg-white/20" />
                      </div>

                      <div className="rounded-card border border-white/10 bg-white/5 p-4">
                        <p className="text-xs text-white/70">
                          AI Assistant
                        </p>
                        <div className="mt-3 h-2.5 w-24 rounded-full bg-white/20" />
                      </div>
                    </div>

                    <div className="rounded-card border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between text-xs text-white/70">
                        <span>Process status</span>
                        <span>85%</span>
                      </div>

                      <div className="mt-3 h-2.5 rounded-full bg-white/20">
                        <div className="h-full w-[85%] rounded-full bg-brand-blue" />
                      </div>

                      <div className="mt-4 grid gap-2">
                        <div className="h-2 rounded-full bg-white/10" />
                        <div className="h-2 w-5/6 rounded-full bg-white/10" />
                        <div className="h-2 w-4/6 rounded-full bg-white/10" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="permasalahan"
          aria-labelledby="problems-heading"
          className="relative bg-white py-section"
        >
          <div className="mx-auto max-w-7xl px-gutter">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-overline font-semibold text-brand-blue-deep">
                Permasalahan Bisnis
              </p>

              <h2
                id="problems-heading"
                className="mt-3 font-heading text-heading font-bold tracking-[-0.04em] text-foreground"
              >
                Apakah Bisnis Anda Mengalami Hal Ini?
              </h2>

              <p className="mt-4 text-body text-muted-foreground">
                Jika salah satu kondisi berikut sering terjadi di bisnis Anda,
                mungkin sudah saatnya menggunakan Business Automation.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Pekerjaan Manual Berulang",
                  description:
                    "Aktivitas yang sama dikerjakan setiap hari sehingga membuang banyak waktu.",
                  icon: CircleCheck,
                },
                {
                  title: "Respon Pelanggan Terlambat",
                  description:
                    "Chat WhatsApp atau pertanyaan pelanggan sering terlambat ditangani.",
                  icon: MessageCircleMore,
                },
                {
                  title: "Data Tersebar di Banyak Tempat",
                  description:
                    "Informasi tersimpan di berbagai aplikasi sehingga sulit dipantau.",
                  icon: LayoutDashboard,
                },
                {
                  title: "Laporan Masih Manual",
                  description:
                    "Pembuatan laporan membutuhkan waktu lama dan rentan kesalahan.",
                  icon: FileText,
                },
                {
                  title: "Proses Persetujuan Lambat",
                  description:
                    "Approval antar divisi masih melalui chat atau dokumen manual.",
                  icon: ClipboardCheck,
                },
                {
                  title: "Produktivitas Tim Tidak Maksimal",
                  description:
                    "Tim lebih banyak mengerjakan pekerjaan administratif daripada pekerjaan yang bernilai.",
                  icon: Sparkles,
                },
              ].map((item) => {
                const Icon = item.icon

                return (
                  <article
                    key={item.title}
                    className="flex h-full flex-col rounded-3xl border border-border bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-card motion-reduce:transform-none"
                  >
                    <div className="flex size-11 items-center justify-center rounded-full bg-brand-ice text-brand-blue-deep">
                      <Icon aria-hidden="true" className="size-5" />
                    </div>

                    <p className="mt-5 text-sm font-semibold text-brand-blue-deep">
                      {item.title}
                    </p>

                    <p className="mt-3 flex-1 text-body-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </article>
                )
              })}
            </div>

            <div className="mt-10 flex justify-center">
              <Link
                href="#solusi"
                className={buttonVariants({
                  variant: "default",
                  size: "lg",
                })}
              >
                Temukan Solusi untuk Bisnis Anda
              </Link>
            </div>
          </div>
        </section>

        <section
          id="solusi"
          aria-labelledby="services-heading"
          className="relative scroll-mt-24 py-section"
        >
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-1/2 -z-10 h-2/3 -translate-y-1/2 bg-brand-ice/60"
          />

          <div className="mx-auto max-w-7xl px-gutter">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-overline font-semibold text-brand-blue-deep">
                SOLUSI AUTOMORA
              </p>

              <h2
                id="services-heading"
                className="mt-3 font-heading text-heading font-bold tracking-[-0.04em] text-foreground"
              >
                Solusi AutoMora
              </h2>

              <p className="mt-4 text-body text-muted-foreground">
                Pilih solusi yang sesuai dengan kebutuhan bisnis Anda. Semua
                layanan dapat disesuaikan dengan proses bisnis perusahaan.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {services.map((service) => {
                const Icon = service.icon

                return (
                  <article
                    key={service.title}
                    className="group flex h-full min-h-[15rem] flex-col rounded-3xl border border-border bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-card motion-reduce:transform-none"
                  >
                    <div className="flex size-11 items-center justify-center rounded-button bg-secondary text-brand-blue-deep transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon aria-hidden="true" className="size-5" />
                    </div>

                    <h3 className="mt-5 text-lg font-semibold tracking-[-0.02em] text-foreground">
                      {service.title}
                    </h3>

                    <p className="mt-2 flex-1 text-body-sm text-muted-foreground">
                      {service.description}
                    </p>
                  </article>
                )
              })}
            </div>

            <div className="mt-8">
              <div className="rounded-[2rem] border border-white/20 bg-gradient-to-br from-brand-blue to-brand-blue-deep p-8 text-white shadow-[0_18px_45px_rgba(7,147,242,0.24)] sm:p-10 lg:p-12">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-2xl">
                    <p className="text-overline font-semibold uppercase tracking-[0.2em] text-white/70">
                      Solusi yang fleksibel
                    </p>

                    <h3 className="mt-3 font-heading text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                      Otomatisasi Sesuai Kebutuhan
                    </h3>

                    <p className="mt-4 text-body text-white/85">
                      Setiap bisnis memiliki proses yang berbeda. AutoMora
                      merancang solusi otomatisasi yang disesuaikan dengan
                      kebutuhan, alur kerja, dan tujuan bisnis perusahaan Anda.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setConsultationOpen(true)}
                    className={`${buttonVariants({
                      variant: "secondary",
                      size: "lg",
                    })} min-w-[15rem]`}
                  >
                    Konsultasikan Kebutuhan Anda
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="cara-kerja"
          aria-labelledby="workflow-heading"
          className="relative scroll-mt-24 bg-white py-section"
        >
          <div className="mx-auto max-w-7xl px-gutter">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-overline font-semibold text-brand-blue-deep">
                CARA KAMI BEKERJA
              </p>

              <h2
                id="workflow-heading"
                className="mt-3 font-heading text-heading font-bold tracking-[-0.04em] text-foreground"
              >
                Cara Kami Bekerja
              </h2>

              <p className="mt-4 text-body text-muted-foreground">
                Proses yang sederhana untuk membantu bisnis Anda beralih ke
                sistem yang lebih efisien.
              </p>
            </div>

            <div className="relative mt-12">
              <div className="absolute left-0 right-0 top-1/2 hidden h-px -translate-y-1/2 bg-border lg:block" />

              <div className="grid gap-5 lg:grid-cols-4 lg:gap-6">
                {[
                  {
                    title: "Konsultasi",
                    description:
                      "Kami mendengarkan kebutuhan dan memahami proses bisnis Anda.",
                    icon: Headphones,
                  },
                  {
                    title: "Analisis",
                    description:
                      "Kami mengidentifikasi proses yang dapat dibuat lebih cepat, lebih rapi, dan lebih efisien.",
                    icon: FileText,
                  },
                  {
                    title: "Pembuatan Solusi",
                    description:
                      "Kami merancang dan membangun sistem otomatisasi yang sesuai dengan kebutuhan bisnis Anda.",
                    icon: LayoutDashboard,
                  },
                  {
                    title: "Pendampingan",
                    description:
                      "Kami membantu proses implementasi serta memastikan solusi berjalan dengan baik.",
                    icon: CheckCircle2,
                  },
                ].map((step, index) => {
                  const Icon = step.icon

                  return (
                    <div key={step.title} className="relative">
                      <div className="flex h-full flex-col rounded-[1.5rem] border border-border bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.04)]">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex size-12 items-center justify-center rounded-full border border-brand-blue/15 bg-brand-ice text-brand-blue-deep">
                            <Icon aria-hidden="true" className="size-5" />
                          </div>

                          <span className="text-4xl font-semibold tracking-[-0.04em] text-brand-blue/15 sm:text-5xl">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        </div>

                        <h3 className="mt-6 text-lg font-semibold tracking-[-0.02em] text-foreground">
                          {step.title}
                        </h3>

                        <p className="mt-2 flex-1 text-body-sm text-muted-foreground">
                          {step.description}
                        </p>
                      </div>

                      {index < 3 ? (
                        <div className="absolute right-[-1.1rem] top-1/2 hidden -translate-y-1/2 text-brand-blue/40 lg:block">
                          <ArrowRight
                            aria-hidden="true"
                            className="size-5"
                          />
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        <section
          id="konsultasi"
          aria-labelledby="cta-heading"
          className="px-gutter py-section"
        >
          <div className="mx-auto max-w-6xl rounded-[2rem] border border-white/20 bg-gradient-to-br from-brand-blue to-brand-blue-deep p-8 text-center text-white shadow-[0_20px_60px_rgba(16,44,109,0.18)] sm:p-10 lg:p-14">
            <div className="mx-auto max-w-3xl">
              <h2
                id="cta-heading"
                className="font-heading text-3xl font-semibold tracking-[-0.03em] sm:text-4xl"
              >
                Kami Siap Membantu Bisnis Anda Lebih Efisien?
              </h2>

              <p className="mt-4 text-body text-white/85">
                Diskusikan kebutuhan bisnis Anda bersama AutoMora dan temukan
                solusi otomatisasi yang tepat untuk perusahaan Anda.
              </p>

              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setConsultationOpen(true)}
                  className={`${buttonVariants({
                    variant: "secondary",
                    size: "lg",
                  })} min-w-[15rem] px-8`}
                >
                  Jadwalkan Konsultasi Gratis
                </button>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/10 bg-brand-navy text-white">
          <div className="mx-auto max-w-7xl px-gutter py-12 sm:py-16">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
              <div>
                <img
                  src="/logo/automora-logo-horizontal.png"
                  alt="AutoMora"
                  className="h-12 w-auto sm:h-14"
                />

                <p className="mt-3 text-overline text-lg font-semibold uppercase tracking-[0.2em] text-white/60 leading-none">
                  Business Automation &amp; AI Solutions
                </p>

                <p className="mt-3 max-w-xl text-body text-white/75">
                  AutoMora membantu bisnis mengurangi pekerjaan manual melalui
                  solusi Business Automation dan AI yang praktis, cepat, dan
                  mudah digunakan.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold tracking-[-0.02em] text-white">
                  Kontak
                </h3>

                <ul className="mt-5 space-y-3 text-body text-white/80">
                  <li className="flex items-start gap-3">
                    <MessageCircleMore
                      aria-hidden="true"
                      className="mt-1 size-4 shrink-0 text-brand-blue"
                    />

                    <a
                      href="https://wa.me/6287868609767"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition hover:text-white"
                    >
                      WhatsApp: 0878-6860-9767
                    </a>
                  </li>

                  <li className="flex items-start gap-3">
                    <Mail
                      aria-hidden="true"
                      className="mt-1 size-4 shrink-0 text-brand-blue"
                    />

                    <a
                      href="mailto:automoraindonesia@gmail.com"
                      className="transition hover:text-white"
                    >
                      Email: automoraindonesia@gmail.com
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-10 border-t border-white/10 pt-6 text-sm text-white/65">
              <p>© 2026 AutoMora. Seluruh hak cipta dilindungi.</p>
            </div>
          </div>
        </footer>
      </main>

      <ConsultationModal
        open={consultationOpen}
        onClose={() => setConsultationOpen(false)}
      />
    </>
  )
}