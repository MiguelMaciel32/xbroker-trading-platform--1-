"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  CreditCard,
  ArrowUpDown,
  Settings,
  User,
  Users,
  HelpCircle,
  TrendingUp,
  PhoneCall
} from "lucide-react"
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

  const getActiveStyles = (path: string) => (isActive(path) ? { backgroundColor: "#FCD535", color: "#000" } : {})

  const getIconColor = (path: string) => (isActive(path) ? "#000" : "text-gray-400 hover:text-[#FCD535]")

  const getMobileIconColor = (path: string) => (isActive(path) ? "text-[#FCD535]" : "text-gray-400")

  const getMobileBackgroundColor = (path: string) =>
    isActive(path) ? "bg-[#FCD535]/20 shadow-lg shadow-[#FCD535]/30" : "hover:bg-white/10"

  return (
    <>
      {/* Sidebar Desktop */}
      <div
        className="hidden lg:flex w-16 border-r flex-col items-center py-6 space-y-6 fixed left-0 top-[70px] h-[calc(100vh-70px)] z-20"
        style={{ backgroundColor: "#181A20", borderColor: "#2B3139" }}
      >
        <Link
          href="/trading"
          className="flex flex-col items-center space-y-1 p-3 rounded-lg transition-colors hover:bg-gray-700"
          style={getActiveStyles("/trading")}
          title="Trading - Negocie e visualize gráficos em tempo real"
        >
          <BarChart3 className={`h-6 w-6 transition-colors ${getIconColor("/trading")}`} />
        </Link>

        <Link
          href="/deposit"
          className="flex flex-col items-center space-y-1 hover:bg-gray-700 p-3 rounded-lg transition-colors"
          style={getActiveStyles("/deposit")}
          title="Depósito - Adicione fundos à sua conta"
        >
          <CreditCard className={`h-6 w-6 transition-colors ${getIconColor("/deposit")}`} />
        </Link>

        <Link
          href="/saque"
          className="flex flex-col items-center space-y-1 hover:bg-gray-700 p-3 rounded-lg transition-colors"
          style={getActiveStyles("/saque")}
          title="Saque - Retire seus fundos da plataforma"
        >
          <ArrowUpDown className={`h-6 w-6 transition-colors ${getIconColor("/saque")}`} />
        </Link>

        {config.group_link && (
          <a
            href={config.group_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center space-y-1 hover:bg-gray-700 p-3 rounded-lg transition-colors group"
            title="Comunidade - Junte-se ao nosso grupo"
          >
            <Users className="h-6 w-6 text-gray-400 group-hover:text-[#FCD535] transition-colors" />
          </a>
        )}

        <div className="flex-1" />

        {config.support_link && (
          <a
            href={config.support_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center space-y-1 hover:bg-gray-700 p-3 rounded-lg transition-colors group"
            title="Suporte - Obtenha ajuda e tire suas dúvidas"
          >
            <HelpCircle className="h-6 w-6 text-gray-400 group-hover:text-[#FCD535] transition-colors" />
          </a>
        )}

        <Link
          href="/configuracoes"
          className="flex flex-col items-center space-y-1 hover:bg-gray-700 p-3 rounded-lg transition-colors"
          style={getActiveStyles("/configuracoes")}
          title="Configurações - Ajuste suas preferências"
        >
          <Settings className={`h-6 w-6 transition-colors ${getIconColor("/configuracoes")}`} />
        </Link>

        <Link
          href="/account"
          className="flex flex-col items-center space-y-1 hover:bg-gray-700 p-3 rounded-lg transition-colors"
          style={getActiveStyles("/account")}
          title="Conta - Gerencie seu perfil e informações"
        >
          <User className={`h-6 w-6 transition-colors ${getIconColor("/account")}`} />
        </Link>
      </div>

      {/* Menu Mobile (fixo no rodapé) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100]">
        <div className="relative">
          {/* Botão central flutuante (acima da barra) */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-6 z-[120]">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[#FCD535] animate-ping opacity-20"></div>
              <div className="absolute inset-0 rounded-full bg-[#FCD535] animate-ping opacity-10 animation-delay-300"></div>
              <button className="relative bg-gradient-to-br from-[#FCD535] to-[#E6C02F] rounded-full p-4 shadow-2xl transform transition-all duration-300 hover:scale-110 active:scale-95">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent"></div>
                <TrendingUp className="relative w-8 h-8 text-black drop-shadow-lg" />
              </button>
            </div>
          </div>

          {/* Barra inferior */}
          <div className="relative z-[110] overflow-visible bg-[#1E2329] backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/50 rounded-[2.5rem] mb-2 mx-4">
            <div className="flex items-center justify-around px-4 py-2">
              {/* Gráficos */}
              <Link
                href="/trading"
                className="flex flex-col items-center space-y-0.5 p-0.5 transition-all duration-300 transform hover:scale-110 active:scale-95"
              >
                <div className={`p-1 rounded-lg transition-all duration-300 ${getMobileBackgroundColor("/trading")}`}>
                  <BarChart3 className={`w-5 h-5 ${getMobileIconColor("/trading")}`} />
                </div>
                <span className={`text-[9px] font-medium ${getMobileIconColor("/trading")}`}>Gráficos</span>
              </Link>

              {/* Depósito */}
              <Link
                href="/deposit"
                className="flex flex-col items-center space-y-0.5 p-0.5 transition-all duration-300 transform hover:scale-110 active:scale-95"
              >
                <div className={`p-1 rounded-lg transition-all duration-300 ${getMobileBackgroundColor("/deposit")}`}>
                  <CreditCard className={`w-5 h-5 ${getMobileIconColor("/deposit")}`} />
                </div>
                <span className={`text-[9px] font-medium ${getMobileIconColor("/deposit")}`}>Depósito</span>
              </Link>

              {/* Espaço para o botão central */}
              <div className="w-12" />

              {/* Saque */}
              <Link
                href="/saque"
                className="flex flex-col items-center space-y-0.5 p-0.5 transition-all duration-300 transform hover:scale-110 active:scale-95"
              >
                <div className={`p-1 rounded-lg transition-all duration-300 ${getMobileBackgroundColor("/saque")}`}>
                  <ArrowUpDown className={`w-5 h-5 ${getMobileIconColor("/saque")}`} />
                </div>
                <span className={`text-[9px] font-medium ${getMobileIconColor("/saque")}`}>Saque</span>
              </Link>

      
              <Link
                           href={config.support_link || "/Suporte"}
                className="flex flex-col items-center space-y-0.5 p-0.5 transition-all duration-300 transform hover:scale-110 active:scale-95"
              >
                <div className={`p-1 rounded-lg transition-all duration-300 ${getMobileBackgroundColor("/Suporte")}`}>
                  <PhoneCall className={`w-5 h-5 ${getMobileIconColor("/Suporte")}`} />
                </div>
                <span className={`text-[9px] font-medium ${getMobileIconColor("/Suporte")}`}>Suporte</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
