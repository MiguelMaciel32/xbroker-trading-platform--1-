"use client"

import type React from "react"
import TradingSidebar from "@/components/trading-sidebar"
import TradingHeader from "@/components/trading-header"
import { Toaster } from "@/components/ui/toaster"
import { usePathname } from "next/navigation"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const isLoginPage = pathname === "/login"
  const isRegister = pathname === "/register"

  return (
    <>
      {!isLoginPage || isRegister &&   (
        <>
          <TradingHeader balance={12500.0} />
          <TradingSidebar />
        </>
      )}
      <main className={!isLoginPage ? "lg:ml-16 pt-16" : ""}>{children}</main>

      <Toaster />
    </>
  )
}
