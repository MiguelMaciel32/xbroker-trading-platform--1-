"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, CreditCard, ArrowUpDown, User, HelpCircle } from "lucide-react"
import { getPlatformConfig } from "@/lib/platform-config"

export default function TradingSidebar() {
  const [config, setConfig] = useState<Record<string, string>>({})
  const pathname = usePathname()

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const platformConfig = await getPlatformConfig()
        setConfig(platformConfig)
      } catch (error) {
        console.error("Error loading platform config:", error)
      }
    }
    loadConfig()
  }, [])

  const isActive = (path: string) => pathname === path

  const getActiveStyles = (path: string) => (isActive(path) ? "bg-black text-white" : "text-gray-600 hover:bg-gray-100")

  const getIconColor = (path: string) => (isActive(path) ? "text-white" : "text-gray-600")

  return (
    <>
      {/* Sidebar Desktop */}
      <div className="hidden lg:flex w-16 border-r border-gray-200 flex-col items-center py-6 space-y-6 fixed left-0 top-[70px] h-[calc(100vh-70px)] z-20 bg-white">
        <Link
          href="/trading"
          className={`flex flex-col items-center space-y-1 p-3 rounded-lg transition-all ${getActiveStyles("/trading")}`}
          title="Trading - Negocie e visualize gráficos em tempo real"
        >
          <BarChart3 className={`h-6 w-6 transition-colors ${getIconColor("/trading")}`} />
          <span className={`text-[9px] font-bold transition-colors ${getIconColor("/trading")}`}>GRÁFICO</span>
        </Link>

        <Link
          href="/deposit"
          className={`flex flex-col items-center space-y-1 p-3 rounded-lg transition-all ${getActiveStyles("/deposit")}`}
          title="Depósito - Adicione fundos à sua conta"
        >
          <CreditCard className={`h-6 w-6 transition-colors ${getIconColor("/deposit")}`} />
          <span className={`text-[9px] font-bold transition-colors ${getIconColor("/deposit")}`}>DEPÓSITO</span>
        </Link>

        <Link
          href="/saque"
          className={`flex flex-col items-center space-y-1 p-3 rounded-lg transition-all ${getActiveStyles("/saque")}`}
          title="Saque - Retire seus fundos da plataforma"
        >
          <ArrowUpDown className={`h-6 w-6 transition-colors ${getIconColor("/saque")}`} />
          <span className={`text-[9px] font-bold transition-colors ${getIconColor("/saque")}`}>SAQUE</span>
        </Link>

        <Link
          href="/support"
          className={`flex flex-col items-center space-y-1 p-3 rounded-lg transition-all ${getActiveStyles("/support")}`}
          title="Suporte - Entre em contato conosco"
        >
          <HelpCircle className={`h-6 w-6 transition-colors ${getIconColor("/support")}`} />
          <span className={`text-[9px] font-bold transition-colors ${getIconColor("/support")}`}>SUPORTE</span>
        </Link>

        <div className="flex-1" />

        <Link
          href="/account"
          className={`flex flex-col items-center space-y-1 p-3 rounded-lg transition-all ${getActiveStyles("/account")}`}
          title="Conta - Gerencie seu perfil e informações"
        >
          <User className={`h-6 w-6 transition-colors ${getIconColor("/account")}`} />
          <span className={`text-[9px] font-bold transition-colors ${getIconColor("/account")}`}>PERFIL</span>
        </Link>
      </div>

      {/* Menu Mobile (fixo no rodapé) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex items-center justify-around px-2 py-2">
          <Link
            href="/trading"
            className={`p-2 rounded-lg transition-all ${isActive("/trading") ? "bg-black" : "hover:bg-gray-100"}`}
          >
            <BarChart3 className={`w-5 h-5 ${isActive("/trading") ? "text-white" : "text-gray-600"}`} />
          </Link>

          <Link
            href="/deposit"
            className={`p-2 rounded-lg transition-all ${isActive("/deposit") ? "bg-black" : "hover:bg-gray-100"}`}
          >
            <CreditCard className={`w-5 h-5 ${isActive("/deposit") ? "text-white" : "text-gray-600"}`} />
          </Link>

          <Link
            href="/saque"
            className={`p-2 rounded-lg transition-all ${isActive("/saque") ? "bg-black" : "hover:bg-gray-100"}`}
          >
            <ArrowUpDown className={`w-5 h-5 ${isActive("/saque") ? "text-white" : "text-gray-600"}`} />
          </Link>

          <Link
            href="/support"
            className={`p-2 rounded-lg transition-all ${isActive("/support") ? "bg-black" : "hover:bg-gray-100"}`}
          >
            <HelpCircle className={`w-5 h-5 ${isActive("/support") ? "text-white" : "text-gray-600"}`} />
          </Link>

          <Link
            href="/account"
            className={`p-2 rounded-lg transition-all ${isActive("/account") ? "bg-black" : "hover:bg-gray-100"}`}
          >
            <User className={`w-5 h-5 ${isActive("/account") ? "text-white" : "text-gray-600"}`} />
          </Link>
        </div>
      </div>
    </>
  )
}
