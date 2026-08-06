"use client"

import Image from "next/image"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { useEffect, useState } from "react"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navigationItems = [
  { href: "/", label: "Beranda" },
  { href: "#permasalahan", label: "Permasalahan" },
  { href: "#solusi", label: "Solusi" },
  { href: "#cara-kerja", label: "Cara Kerja" },
] as const

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeHref, setActiveHref] = useState<string>("/")

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 12)

    updateScrollState()
    window.addEventListener("scroll", updateScrollState, { passive: true })

    return () => window.removeEventListener("scroll", updateScrollState)
  }, [])

  useEffect(() => {
    const updateActiveLink = () => setActiveHref(window.location.hash || "/")

    updateActiveLink()
    window.addEventListener("hashchange", updateActiveLink)

    const observedSections = navigationItems
      .filter((item) => item.href.startsWith("#"))
      .map((item) => document.getElementById(item.href.slice(1)))
      .filter((section): section is HTMLElement => section !== null)

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSection = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

        if (visibleSection) {
          setActiveHref(`#${visibleSection.target.id}`)
        }
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: [0.15, 0.5, 0.85] },
    )

    observedSections.forEach((section) => observer.observe(section))

    return () => {
      window.removeEventListener("hashchange", updateActiveLink)
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener("keydown", closeOnEscape)

    return () => document.removeEventListener("keydown", closeOnEscape)
  }, [isMobileMenuOpen])

  useEffect(() => {
    const desktopViewport = window.matchMedia("(min-width: 1024px)")
    const closeOnDesktop = () => {
      if (desktopViewport.matches) {
        setIsMobileMenuOpen(false)
      }
    }

    desktopViewport.addEventListener("change", closeOnDesktop)

    return () => desktopViewport.removeEventListener("change", closeOnDesktop)
  }, [])

  const handleNavigation = (href: string) => {
    setActiveHref(href)
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 px-gutter pt-3">
      <nav
        aria-label="Navigasi utama"
        className={cn(
          "mx-auto max-w-7xl rounded-panel border px-content transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300",
          isScrolled
            ? "border-border/70 bg-background/75 shadow-card backdrop-blur-xl"
            : "border-transparent bg-brand-navy shadow-none",
        )}
      >
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            href="/"
            aria-label="AutoMora Beranda"
            className="flex shrink-0 items-center rounded-button focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-blue/50"
            onClick={() => handleNavigation("/")}
          >
            <Image
              src="/logo/automora-logo-horizontal.png"
              alt="AutoMora"
              width={1975}
              height={795}
              sizes="(min-width: 1024px) 160px, 140px"
              priority
              className="h-11 w-auto"
            />
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {navigationItems.map((item) => {
              const isActive = activeHref === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "location" : undefined}
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                    "rounded-pill px-3 py-2 text-sm font-medium transition-colors",
                    isScrolled
                      ? isActive
                        ? "bg-secondary text-secondary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      : isActive
                        ? "bg-white/15 text-white"
                        : "text-white/75 hover:bg-white/10 hover:text-white",
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>

          <div className="hidden lg:block">
            <Link
              href="#konsultasi"
              onClick={() => handleNavigation("#konsultasi")}
              className={buttonVariants({ variant: "default", size: "sm" })}
            >
              Konsultasi Gratis
            </Link>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={isMobileMenuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
            className={cn(
              "relative lg:hidden",
              isScrolled
                ? "text-foreground hover:bg-secondary hover:text-secondary-foreground"
                : "text-white hover:bg-white/10 hover:text-white",
            )}
            onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
          >
            {isMobileMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </Button>
        </div>

        <div
          id="mobile-navigation"
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none lg:hidden",
            isMobileMenuOpen
              ? "mt-2 grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0 pointer-events-none",
          )}
        >
          <div className="overflow-hidden">
            <div
              className={cn(
                "flex flex-col gap-1 border-t pt-3 pb-4 transition-transform duration-300 ease-out motion-reduce:transition-none",
                isScrolled ? "border-border/70" : "border-white/15",
                isMobileMenuOpen ? "translate-y-0" : "-translate-y-2",
              )}
            >
              {navigationItems.map((item) => {
                const isActive = activeHref === item.href

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "location" : undefined}
                    onClick={() => handleNavigation(item.href)}
                    className={cn(
                      "rounded-button px-3 py-3 text-sm font-medium transition-colors",
                      isScrolled
                        ? isActive
                          ? "bg-secondary text-secondary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        : isActive
                          ? "bg-white/15 text-white"
                          : "text-white/75 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    {item.label}
                  </Link>
                )
              })}

              <Link
                href="#konsultasi"
                onClick={() => handleNavigation("#konsultasi")}
                className={cn(buttonVariants({ variant: "default", size: "default" }), "mt-2")}
              >
                Konsultasi Gratis
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
