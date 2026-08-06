import Link from "next/link"
import { ArrowRight, CheckCircle2, CircleCheck, Sparkles } from "lucide-react"

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

export default function Home() {
  return (
    <main id="beranda" className="flex-1 overflow-hidden">
      <section aria-labelledby="hero-heading" className="relative isolate">
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
              className="animate-in fade-in slide-in-from-bottom-4 mt-6 font-heading text-display font-bold tracking-[-0.045em] text-foreground duration-700 delay-100 motion-reduce:animate-none"
            >
              Otomatiskan proses.
              <span className="block bg-gradient-to-r from-brand-blue via-brand-violet to-brand-pink bg-clip-text text-transparent">
                Percepat bisnis Anda.
              </span>
            </h1>

            <p className="animate-in fade-in slide-in-from-bottom-4 mt-6 max-w-2xl text-lead text-muted-foreground duration-700 delay-200 motion-reduce:animate-none">
              AutoMora membantu perusahaan mengurangi pekerjaan manual melalui solusi
              automasi dan AI yang praktis, mudah digunakan, serta disesuaikan dengan
              kebutuhan bisnis Anda.
            </p>

            <div className="animate-in fade-in slide-in-from-bottom-4 mt-8 flex flex-col gap-3 sm:flex-row duration-700 delay-300 motion-reduce:animate-none">
              <Link
                href="#konsultasi"
                className={buttonVariants({ variant: "default", size: "lg" })}
              >
                Konsultasi Gratis
                <ArrowRight aria-hidden="true" />
              </Link>
              <Link
                href="#solusi"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                Lihat Layanan
              </Link>
            </div>

            <ul className="animate-in fade-in slide-in-from-bottom-4 mt-8 flex flex-col gap-3 text-body-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-5 duration-700 delay-500 motion-reduce:animate-none">
              {highlights.map((highlight) => (
                <li key={highlight} className="flex items-center gap-2">
                  <CheckCircle2 aria-hidden="true" className="size-4 shrink-0 text-brand-blue" />
                  {highlight}
                </li>
              ))}
            </ul>
          </div>

          <div className="animate-in fade-in zoom-in-95 relative mx-auto w-full max-w-xl duration-700 delay-200 motion-reduce:animate-none">
            <div
              aria-hidden="true"
              className="absolute -inset-6 -z-10 rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,var(--automora-blue),var(--automora-violet),var(--automora-pink),var(--automora-blue))] opacity-15 blur-3xl"
            />

            <div className="overflow-hidden rounded-panel border border-white/80 bg-white/90 p-3 shadow-card backdrop-blur-sm sm:p-5">
              <div className="rounded-card bg-brand-navy p-5 text-white sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-overline font-semibold tracking-[0.12em] text-white/60 uppercase">
                      Contoh dashboard
                    </p>
                    <p className="mt-1 text-title font-semibold tracking-[-0.03em]">
                      Operasional lebih teratur
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-pill bg-white/10 px-2.5 py-1 text-xs font-medium text-white/90">
                    <span className="size-1.5 rounded-full bg-brand-blue" />
                    Aktif
                  </span>
                </div>

                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-button border border-white/10 bg-white/5 p-3">
                    <p className="text-xs text-white/60">Proses</p>
                    <p className="mt-1 text-xl font-semibold">Terpantau</p>
                  </div>
                  <div className="rounded-button border border-white/10 bg-white/5 p-3">
                    <p className="text-xs text-white/60">Tim</p>
                    <p className="mt-1 text-xl font-semibold">Terhubung</p>
                  </div>
                  <div className="rounded-button border border-white/10 bg-white/5 p-3">
                    <p className="text-xs text-white/60">Data</p>
                    <p className="mt-1 text-xl font-semibold">Lebih rapi</p>
                  </div>
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-card border border-border bg-card p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-body-sm font-semibold text-foreground">Alur kerja</p>
                      <p className="mt-1 text-xs text-muted-foreground">Berjalan secara terarah</p>
                    </div>
                    <CircleCheck aria-hidden="true" className="size-5 text-brand-blue" />
                  </div>

                  <div className="mt-5 space-y-4">
                    {workflows.map((workflow, index) => (
                      <div key={workflow.label} className="flex items-center gap-3">
                        <span className={`size-2.5 shrink-0 rounded-full ${workflow.tone}`} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3 text-xs">
                            <span className="truncate font-medium text-foreground">{workflow.label}</span>
                            <span className="text-muted-foreground">{index + 1}/3</span>
                          </div>
                          <div className="mt-2 h-1.5 overflow-hidden rounded-pill bg-muted">
                            <div
                              className={`h-full rounded-pill ${workflow.tone}`}
                              style={{ width: `${76 - index * 18}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-card border border-border bg-brand-ice p-4 sm:p-5">
                  <p className="text-body-sm font-semibold text-foreground">Siap ditindaklanjuti</p>
                  <p className="mt-2 text-body-sm text-muted-foreground">
                    Informasi penting tersusun dalam satu alur kerja.
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-brand-blue-deep">
                    Lihat detail
                    <ArrowRight aria-hidden="true" className="size-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
