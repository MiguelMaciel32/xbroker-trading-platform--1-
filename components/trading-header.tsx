"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Bell, ChevronDown } from "lucide-react"
import { getPlatformConfig } from "@/lib/platform-config"

interface TradingHeaderProps {
  balance: number
}

export default function TradingHeader({ balance }: TradingHeaderProps) {
  const [config, setConfig] = useState<Record<string, string>>({
    platform_name: "TradePro",
    platform_logo:
      "https://media.discordapp.net/attachments/1191807892936986756/1408228383128551534/Captura_de_Tela_2025-08-21_as_20.16.28-removebg-preview.png?ex=68a8fa62&is=68a7a8e2&hm=527693bc110e80e51760a1cfcc0b1e3a4616517b98b7fcf8a9fffa342ba6f059&=&format=webp&quality=lossless&width=1008&height=990",
  })

  const [balanceType, setBalanceType] = useState<"demo" | "real">("demo")
  const [showDropdown, setShowDropdown] = useState(false)
  const [realBalance, setRealBalance] = useState(0)

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

  const toggleBalanceType = (type: "demo" | "real") => {
    setBalanceType(type)
    setShowDropdown(false)
  }

  const currentBalance = balanceType === "demo" ? balance : realBalance
  const balanceLabel = balanceType === "demo" ? "Saldo demo" : "Saldo real"

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 border-b px-4 py-3"
      style={{ backgroundColor: "#181A20", borderColor: "#2B3139" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <img
              src={config.platform_logo || "/placeholder.svg"}
              alt={config.platform_name || "Platform"}
              className="h-8 w-8 object-contain"
            />
            <span className="text-white font-semibold text-lg">{config.platform_name || "TradePro"}</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Bell className="w-5 h-5 text-gray-400" />
          <div className="flex items-center space-x-3">
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 text-right hover:bg-gray-800 rounded-lg p-2 transition-colors"
              >
                <div>
                  <div className="text-gray-400 text-sm flex items-center">
                    {balanceLabel}
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </div>
                  <div className="text-white font-semibold">R$ {currentBalance.toFixed(2)}</div>
                </div>
              </button>

              {showDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg min-w-[140px] z-50">
                  <button
                    onClick={() => toggleBalanceType("demo")}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-700 transition-colors ${
                      balanceType === "demo" ? "bg-gray-700 text-yellow-400" : "text-gray-300"
                    }`}
                  >
                    <div className="text-sm">Saldo demo</div>
                    <div className="font-semibold">R$ {balance.toFixed(2)}</div>
                  </button>
                  <button
                    onClick={() => toggleBalanceType("real")}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-700 transition-colors ${
                      balanceType === "real" ? "bg-gray-700 text-yellow-400" : "text-gray-300"
                    }`}
                  >
                    <div className="text-sm">Saldo real</div>
                    <div className="font-semibold">R$ {realBalance.toFixed(2)}</div>
                  </button>
                </div>
              )}
            </div>
          
            <Button
              style={{ backgroundColor: "#FCD535", color: "#000000" }}
              className="bg-green-500 hover:bg-green-600 text-black font-semibold px-4"
            >
              <Plus className="w-4 h-4 mr-1" />
              Depósito
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
