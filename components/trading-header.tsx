"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Bell, RefreshCw } from "lucide-react"
import { getPlatformConfig } from "@/lib/platform-config"
import Link from "next/link"
import { getUserBalance, updateUserBalance } from "@/lib/actions/balance"

interface TradingHeaderProps {
  onBalanceUpdate?: (balance: number) => void
}

export default function TradingHeader({ onBalanceUpdate }: TradingHeaderProps) {
  const [config, setConfig] = useState<Record<string, string>>({
    platform_name: "TradePro",
    platform_logo:
      "https://media.discordapp.net/attachments/1191807892936986756/1408228383128551534/Captura_de_Tela_2025-08-21_as_20.16.28-removebg-preview.png?ex=68a8fa62&is=68a7a8e2&hm=527693bc110e80e51760a1cfcc0b1e3a4616517b98b7fcf8a9fffa342ba6f059&=&format=webp&quality=lossless&width=1008&height=990",
  })

  // Estados para o saldo da API
  const [apiBalance, setApiBalance] = useState<number>(0)
  const [isLoadingBalance, setIsLoadingBalance] = useState<boolean>(true)
  const [balanceError, setBalanceError] = useState<string | null>(null)

  // Função para buscar saldo da API
  const fetchBalance = useCallback(async () => {
    try {
      setIsLoadingBalance(true)
      setBalanceError(null)

      const result = await getUserBalance()

      if (!result.success || !result.data) {
        throw new Error(result.error || "Erro na resposta da API")
      }

      setApiBalance(result.data.balance)

      // Notificar componente pai sobre atualização do saldo
      if (onBalanceUpdate) {
        onBalanceUpdate(result.data.balance)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido"
      setBalanceError(errorMessage)
      // console.error("Erro ao buscar saldo:", err)
    } finally {
      setIsLoadingBalance(false)
    }
  }, [onBalanceUpdate])

  // Função para atualizar saldo
  const updateBalance = useCallback(
    async (amount: number, operation: "set" | "add" | "subtract" = "set"): Promise<boolean> => {
      try {
        setBalanceError(null)

        const result = await updateUserBalance({
          balance: amount,
          operation,
        })

        if (result.success && result.data) {
          setApiBalance(result.data.balance)
          if (onBalanceUpdate) {
            onBalanceUpdate(result.data.balance)
          }
          return true
        } else {
          throw new Error(result.error || "Erro ao atualizar saldo")
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar saldo"
        setBalanceError(errorMessage)
        console.error("Erro ao atualizar saldo:", err)
        return false
      }
    },
    [onBalanceUpdate],
  )

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

  // Buscar saldo quando componente monta
  useEffect(() => {
    fetchBalance()
  }, [fetchBalance])

  const handleRefreshBalance = async () => {
    await fetchBalance()
  }

  const formatBalance = (balance: number) => {
    if (isLoadingBalance) return "..."
    return balance.toFixed(2)
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 border-b "
      style={{ backgroundColor: "#181A20", borderColor: "#2B3139" }}
    >
      <div className="flex items-center justify-between p-2">
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
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <div className="text-gray-400 text-xs sm:text-sm">Saldo</div>
                <div className="text-white font-semibold text-sm sm:text-base">R$ {formatBalance(apiBalance)}</div>
                {balanceError && <div className="text-red-400 text-xs max-w-24 truncate">{balanceError}</div>}
              </div>

              <button
                onClick={handleRefreshBalance}
                disabled={isLoadingBalance}
                className="p-1 hover:bg-gray-800 rounded transition-colors disabled:opacity-50"
                title="Atualizar saldo"
              >
                <RefreshCw className={`w-4 h-4 text-gray-400 ${isLoadingBalance ? "animate-spin" : ""}`} />
              </button>
            </div>

            <Link href="/deposit">
              <Button
                style={{ backgroundColor: "#FCD535", color: "#000000" }}
                className="hover:opacity-90 text-black font-semibold px-2 sm:px-4 text-xs sm:text-sm transition-opacity"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="">Depósito</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
