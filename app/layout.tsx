import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import ClientLayout from "../app/client-layout"

export const metadata: Metadata = {
  title: "TradePro - Plataforma de Trading",
  description: "Plataforma profissional de trading OTC",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`} style={{ backgroundColor: "#181A20" }}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
