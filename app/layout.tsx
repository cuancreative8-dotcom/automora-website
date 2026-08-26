import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://automora-website.vercel.app"),

  title: "AutoMora | AI Automation & Digital Transformation Agency",

  description:
    "AutoMora membantu bisnis mengotomatisasi proses kerja, meningkatkan efisiensi, dan mendorong pertumbuhan melalui solusi AI dan teknologi digital.",

  icons: {
    icon: "/favicon/favicon.png",
    shortcut: "/favicon/favicon.png",
    apple: "/favicon/favicon.png",
  },

  openGraph: {
    title: "AutoMora | AI Automation & Digital Transformation Agency",

    description:
      "Smart Automation for Modern Business. Solusi AI Automation & Digital Transformation untuk membantu bisnis bekerja lebih efisien dan berkembang.",

    url: "https://automora-website.vercel.app",

    siteName: "AutoMora",

    images: [
      {
        url: "/og-image.png",
        width: 1734,
        height: 907,
        alt: "AutoMora - AI Automation & Digital Transformation Agency",
      },
    ],

    locale: "id_ID",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "AutoMora | AI Automation & Digital Transformation Agency",

    description: "Smart Automation for Modern Business.",

    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        {children}
      </body>
    </html>
  );
}