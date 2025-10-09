"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Bell, Rocket, Minus, ChevronDown } from "lucide-react"
import { getPlatformConfig } from "@/lib/platform-config"
import Link from "next/link"
import { getUserBalance, updateUserBalance, getUserName } from "@/lib/actions/balance"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface TradingHeaderProps {
  onBalanceUpdate?: (balance: number) => void
}

export default function TradingHeader({ onBalanceUpdate }: TradingHeaderProps) {
  const router = useRouter()
  const [accountType, setAccountType] = useState<"real" | "demo">("real")

  const [config, setConfig] = useState<Record<string, string>>({
    platform_name: "TradePro",
    platform_logo:
      "https://media.discordapp.net/attachments/1191807892936986756/1408228383128551534/Captura_de_Tela_2025-08-21_as_20.16.28-removebg-preview.png?ex=68a8fa62&is=68a7a8e2&hm=527693bc110e80e51760a1cfcc0b1e3a4616517b98b7fcf8a9fffa342ba6f059&=&format=webp&quality=lossless&width=1008&height=990",
  })

  const [apiBalance, setApiBalance] = useState<number>(0)
  const [balanceError, setBalanceError] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [isLoadingName, setIsLoadingName] = useState<boolean>(true)

  useEffect(() => {
    const fetchName = async () => {
      try {
        setIsLoadingName(true)
        const result = await getUserName()
        if (result.success && result.email) {
          setUsername(result.email)
        }
      } catch (err) {
        console.error("Erro ao buscar username:", err)
      } finally {
        setIsLoadingName(false)
      }
    }

    fetchName()
  }, [])

  const fetchBalance = useCallback(async () => {
    try {
      setBalanceError(null)

      const result = await getUserBalance()

      if (!result.success || !result.data) {
        throw new Error(result.error || "Erro na resposta da API")
      }

      setApiBalance(result.data.balance)

      if (onBalanceUpdate) {
        onBalanceUpdate(result.data.balance)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido"
      setBalanceError(errorMessage)
    }
  }, [onBalanceUpdate])

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

  useEffect(() => {
    fetchBalance()
  }, [fetchBalance])

  const formatBalance = (balance: number) => {
    return balance.toFixed(2)
  }

  const displayBalance = accountType === "demo" ? 10000 : apiBalance

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between p-2 gap-4">
        {/* Logo e Nome da Plataforma */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
     <img src="/logo/logo.png" className="w-20 h-10 object-contain" />
          <span className="hidden xs:block text-black font-bold text-sm sm:text-base whitespace-nowrap">
            {config.platform_name || "TradePro"}
          </span>
        </div>

        {/* Saldo e Botões */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-black hover:bg-gray-100 hidden sm:flex"
          >
            <Bell className="w-5 h-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-2 bg-white border-2 border-gray-200 px-4 py-2 rounded-lg hover:border-black transition-all">
                <div className="text-right">
                  <div className="text-gray-500 text-xs sm:text-sm uppercase font-medium">
                    {accountType === "real" ? "Conta Real" : "Conta Demo"}
                  </div>
                  <div className="text-black font-bold text-sm sm:text-base">
                    R$ {formatBalance(displayBalance)}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white border-2 border-gray-200 shadow-lg">
              <DropdownMenuItem
                onClick={() => setAccountType("real")}
                className="text-black hover:bg-gray-100 cursor-pointer focus:bg-gray-100"
              >
                <div className="flex flex-col">
                  <span className="font-bold">Conta Real</span>
                  <span className="text-xs text-gray-500">R$ {formatBalance(apiBalance)}</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/deposit">
            <Button className="bg-black text-white hover:bg-gray-800 font-bold px-3 sm:px-5 py-2 text-xs sm:text-sm transition-all shadow-sm">
              <Plus className="w-4 h-4 mr-1" />
              <span>Depósito</span>
            </Button>
          </Link>

         
        </div>
      </div>
    </div>
  )
}