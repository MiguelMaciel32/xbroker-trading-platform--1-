"use client"

import { useState, useEffect, useCallback, use } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Bell, RefreshCw, Minus } from "lucide-react"
import { getPlatformConfig } from "@/lib/platform-config"
import Link from "next/link"
import { getUserBalance, updateUserBalance,getUserName  } from "@/lib/actions/balance"
import { useRouter } from "next/navigation"

interface TradingHeaderProps {
  onBalanceUpdate?: (balance: number) => void
}

export default function TradingHeader({ onBalanceUpdate }: TradingHeaderProps) {
  const router = useRouter()
  const [config, setConfig] = useState<Record<string, string>>({
    platform_name: "TradePro",
    platform_logo:
      "https://media.discordapp.net/attachments/1191807892936986756/1408228383128551534/Captura_de_Tela_2025-08-21_as_20.16.28-removebg-preview.png?ex=68a8fa62&is=68a7a8e2&hm=527693bc110e80e51760a1cfcc0b1e3a4616517b98b7fcf8a9fffa342ba6f059&=&format=webp&quality=lossless&width=1008&height=990",
  })

  // Estados para o saldo da API
  const [apiBalance, setApiBalance] = useState<number>(0)
  const [isLoadingBalance, setIsLoadingBalance] = useState<boolean>(true)
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
      // router.push("/login")
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
      style={{ backgroundColor: "#141d2f", borderColor: "#2B3139" }}
    >
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center space-x-2 sm:space-x-6">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <img src="/logo/logo.png" className="w-17 h-17 sm:h-17 sm:w-17 object-contain" />
            <span className="hidden xs:block text-white font-semibold text-sm sm:text-lg">
              {config.platform_name || "TradePro"}
            </span>
          </div>
          <div className="hidden md:block">
            <span className="text-gray-100 text-base sm:text-lg bg-gray-900 px-4 py-2 rounded-full">
              {isLoadingName ? "Carregando..." : `Olá, ${username || "Usuário"}`}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">

          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="flex items-center space-x-2">
              <div className="text-right bg-gray-900 px-6  rounded-lg">
                <div className="text-gray-600 text-sm sm:text-base">Saldo</div>
                <div className="text-white font-semibold text-base sm:text-lg">R$ {formatBalance(apiBalance)}</div>
              </div>
            </div>

            <Link href="/deposit">
              <Button
                style={{ backgroundColor: "#26d47c", color: "#000000" }}
                className="hover:opacity-90 text-black font-semibold px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base transition-opacity"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                <span className="">Depósito</span>
              </Button>
            </Link>

            <Link href="/saque">
              <Button
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-300 font-semibold px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base transition-colors bg-transparent"
              >
                <Minus className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                <span className="">Retirada</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
