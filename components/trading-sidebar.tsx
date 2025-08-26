"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, CreditCard, ArrowUpDown, Settings, User, Users, HelpCircle } from "lucide-react"
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

  const getActiveStyles = (path: string) => {
    if (isActive(path)) {
      return {
        backgroundColor: "#FCD535",
        color: "#000",
      }
    }
    return {}
  }

  const getIconColor = (path: string) => {
    if (isActive(path)) {
      return "#000"
    }
    return "text-gray-400 hover:text-[#FCD535]"
  }

  return (
    <div
      className="w-16 border-r flex flex-col items-center py-6 space-y-6 fixed left-0 top-[70px] h-[calc(100vh-70px)] z-20"
      style={{ backgroundColor: "#181A20", borderColor: "#2B3139" }}
    >
      {/* {config.platform_logo && (
        <div className="mb-2">
          <img
            src={config.platform_logo || "/placeholder.svg"}
            alt="Logo"
            className="h-8 w-8 object-contain bg-white rounded p-1"
          />
        </div>
      )} */}

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

      <div className="flex-1"></div>

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
  )
}
