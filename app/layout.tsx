import type React from "react"
import type { Metadata } from "next"
import { Lora, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Providers } from "./providers"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"

const lora = Lora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-lora",
})
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "BlogHub",
  description: "A modern platform for sharing your stories.",
  generator: "Zulqarnain",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${lora.variable} ${inter.variable}`}>
      <body className={`font-sans antialiased`}>
        <Providers>
          <Navigation />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Toaster />
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
