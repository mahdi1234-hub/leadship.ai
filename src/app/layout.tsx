import type { Metadata } from "next"
import "./globals.css"
import { SessionProvider } from "@/components/SessionProvider"

export const metadata: Metadata = {
  title: "Leadship.AI - Lead Generation SaaS",
  description: "AI-powered lead generation and enrichment platform",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-[#EAE8E2] text-stone-800 antialiased selection:bg-stone-300/80 selection:text-stone-900 font-sans">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
