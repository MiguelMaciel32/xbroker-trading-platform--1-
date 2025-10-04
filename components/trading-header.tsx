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

  // Estados para o saldo da API
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

      // Notificar componente pai sobre atualização do saldo
      if (onBalanceUpdate) {
        onBalanceUpdate(result.data.balance)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido"
      setBalanceError(errorMessage)
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

  const formatBalance = (balance: number) => {
    return balance.toFixed(2)
  }

  const displayBalance = accountType === "demo" ? 10000 : apiBalance

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{ backgroundColor: "#141d2f", borderColor: "#2B3139" }}
    >
      <div className="flex items-center justify-between p-2 gap-4">
        {/* Logo e Nome da Plataforma */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          <img src="/logo/logo.png" className="w-10 h-10 sm:h-12 sm:w-12 object-contain" />
          <span className="hidden xs:block text-white font-semibold text-sm sm:text-base whitespace-nowrap">
            {config.platform_name || "TradePro"}
          </span>
        </div>

        {/* <div className="hidden lg:flex items-center justify-center flex-1 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 px-6 py-2.5 rounded-full" style={{ backgroundColor: "#26d47c" }}>
            <div className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-gray-800" />
              <span className="text-gray-900 font-medium text-sm">Receba um bônus de 30% no seu primeiro depósito</span>
            </div>
            <div
              className="px-4 py-1 rounded-full font-bold text-sm"
              style={{ backgroundColor: "#1a8a54", color: "white" }}
            >
              30%
            </div>
          </div>
        </div> */}

        {/* Saldo e Botões */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-gray-800 hidden sm:flex"
          >
            <Bell className="w-5 h-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-2 bg-gray-900 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                <div className="text-right">
                  <div className="text-gray-500 text-xs sm:text-sm uppercase">
                    {accountType === "real" ? "Conta Real" : "Conta Demo"}
                  </div>
                  <div className="text-white font-semibold text-sm sm:text-base">
                    R$ {formatBalance(displayBalance)}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-gray-900 border-gray-700">
              <DropdownMenuItem
                onClick={() => setAccountType("real")}
                className="text-white hover:bg-gray-800 cursor-pointer"
              >
                <div className="flex flex-col">
                  <span className="font-semibold">Conta Real</span>
                  <span className="text-xs text-gray-400">R$ {formatBalance(apiBalance)}</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setAccountType("demo")}
                className="text-white hover:bg-gray-800 cursor-pointer"
              >
                <div className="flex flex-col">
                  <span className="font-semibold">Conta Demo</span>
                  <span className="text-xs text-gray-400">R$ 10.000,00</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/deposit">
            <Button
              style={{ backgroundColor: "#26d47c", color: "#000000" }}
              className="hover:opacity-90 text-black font-semibold px-3 sm:px-5 py-2 text-xs sm:text-sm transition-opacity"
            >
              <Plus className="w-4 h-4 mr-1" />
              <span>Depósito</span>
            </Button>
          </Link>

          <Link href="/saque">
            <Button
              variant="outline"
              className="border-gray-600 text-white hover:bg-gray-800 font-semibold px-3 sm:px-5 py-2 text-xs sm:text-sm transition-colors bg-transparent"
            >
              <Minus className="w-4 h-4 mr-1" />
              <span>Retirada</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
