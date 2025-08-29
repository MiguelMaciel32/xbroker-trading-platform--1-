"use client"

import { usePathname } from "next/navigation"
import TradingHeader from "@/components/trading-header"
import TradingSidebar from "@/components/trading-sidebar"
import { Toaster } from "@/components/ui/sonner"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isLoginPage = pathname === "/login"
  const isRegisterPage = pathname === "/register"
  const isLandingPage = pathname === "/"

  // Exibe header/sidebar apenas se não estiver em login, registro ou landing
  const showLayout = !(isLoginPage || isRegisterPage || isLandingPage)

  return (
    <>
      {showLayout && (
        <>
          <TradingHeader balance={12500.0} />
          <TradingSidebar />
        </>
      )}

      <main className={showLayout ? "lg:ml-16 pt-16" : ""}>
        {children}
      </main>

      <Toaster />
    </>
  )
}
