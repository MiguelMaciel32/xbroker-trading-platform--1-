"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Bell, ChevronDown } from "lucide-react"
import { getPlatformConfig } from "@/lib/platform-config"
import Link from "next/link"

interface TradingHeaderProps {
  balance: number
  balanceType?: "demo" | "real"
  realBalance?: number
  onBalanceTypeChange?: (type: "demo" | "real") => void
}

export default function TradingHeader({
  balance,
  balanceType: externalBalanceType,
  realBalance: externalRealBalance,
  onBalanceTypeChange,
}: TradingHeaderProps) {
  const [config, setConfig] = useState<Record<string, string>>({
    platform_name: "TradePro",
    platform_logo:
      "https://media.discordapp.net/attachments/1191807892936986756/1408228383128551534/Captura_de_Tela_2025-08-21_as_20.16.28-removebg-preview.png?ex=68a8fa62&is=68a7a8e2&hm=527693bc110e80e51760a1cfcc0b1e3a4616517b98b7fcf8a9fffa342ba6f059&=&format=webp&quality=lossless&width=1008&height=990",
  })

  const [balanceType, setBalanceType] = useState<"demo" | "real">(externalBalanceType || "demo")
  const [showDropdown, setShowDropdown] = useState(false)
  const [realBalance, setRealBalance] = useState(externalRealBalance || 0)

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

  useEffect(() => {
    if (externalBalanceType !== undefined) {
      setBalanceType(externalBalanceType)
    }
  }, [externalBalanceType])

  useEffect(() => {
    if (externalRealBalance !== undefined) {
      setRealBalance(externalRealBalance)
    }
  }, [externalRealBalance])

  const toggleBalanceType = (type: "demo" | "real") => {
    setBalanceType(type)
    setShowDropdown(false)
    if (onBalanceTypeChange) {
      onBalanceTypeChange(type)
    }
  }

  const currentBalance = balanceType === "demo" ? balance : realBalance
  const balanceLabel = balanceType === "demo" ? "Saldo demo" : "Saldo real"

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 border-b px-2 sm:px-4 py-2 sm:py-3"
      style={{ backgroundColor: "#181A20", borderColor: "#2B3139" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-6">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <img
              src={config.platform_logo || "/placeholder.svg"}
              alt={config.platform_name || "Platform"}
              className="h-6 w-6 sm:h-8 sm:w-8 object-contain"
            />
            <span className="hidden xs:block text-white font-semibold text-sm sm:text-lg">
              {config.platform_name || "TradePro"}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <Bell className="hidden sm:block w-5 h-5 text-gray-400" />

          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-1 sm:space-x-2 text-right hover:bg-gray-800 rounded-lg p-1 sm:p-2 transition-colors"
              >
                <div>
                  <div className="text-gray-400 text-xs sm:text-sm flex items-center">
                    <span className="hidden sm:inline">{balanceLabel}</span>
                    <span className="sm:hidden">Saldo</span>
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </div>
                  <div className="text-white font-semibold text-sm sm:text-base">R$ {currentBalance.toFixed(2)}</div>
                </div>
              </button>

              {showDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg min-w-[120px] sm:min-w-[140px] z-50">
                  <button
                    onClick={() => toggleBalanceType("demo")}
                    className={`w-full text-left px-2 sm:px-3 py-2 hover:bg-gray-700 transition-colors ${
                      balanceType === "demo" ? "bg-gray-700 text-yellow-400" : "text-gray-300"
                    }`}
                  >
                    <div className="text-xs sm:text-sm">Saldo demo</div>
                    <div className="font-semibold text-sm">R$ {balance.toFixed(2)}</div>
                  </button>
                  <button
                    onClick={() => toggleBalanceType("real")}
                    className={`w-full text-left px-2 sm:px-3 py-2 hover:bg-gray-700 transition-colors ${
                      balanceType === "real" ? "bg-gray-700 text-yellow-400" : "text-gray-300"
                    }`}
                  >
                    <div className="text-xs sm:text-sm">Saldo real</div>
                    <div className="font-semibold text-sm">R$ {realBalance.toFixed(2)}</div>
                  </button>
                </div>
              )}
            </div>

            <Link href="/deposit">
              <Button
                style={{ backgroundColor: "#FCD535", color: "#000000" }}
                className="bg-green-500 hover:bg-green-600 text-black font-semibold px-2 sm:px-4 text-xs sm:text-sm"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">Depósito</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
