"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Minus, Plus, ArrowUp, ArrowDown, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SymbolConfig } from "@/config/symbols"

interface MobileTradingPanelProps {
  symbols: SymbolConfig[]
  activeSymbol: string
  onSelectSymbol: (symbolId: string) => void
  balance: number
  onTrade: (type: "CALL" | "PUT", amount: number, expiration: number) => void
}

type ExpirationMode = "timer" | "time"

export const MobileTradingPanel = ({
  symbols,
  activeSymbol,
  onSelectSymbol,
  balance,
  onTrade,
}: MobileTradingPanelProps) => {
  const [amount, setAmount] = useState(100)
  const [showSymbolList, setShowSymbolList] = useState(false)
  const [showExpirationModal, setShowExpirationModal] = useState(false)
  const [expirationMode, setExpirationMode] = useState<ExpirationMode>("timer")
  const [selectedExpiration, setSelectedExpiration] = useState(60) // segundos
  const [timeOptions, setTimeOptions] = useState<string[]>([])

  const currentSymbol = symbols.find((s) => s.id === activeSymbol)

  const handleIncrement = () => setAmount((prev) => prev + 10)
  const handleDecrement = () => setAmount((prev) => Math.max(1, prev - 10))

  // Gerar opções de tempo dinâmicas
  useEffect(() => {
    const generateTimeOptions = () => {
      const now = new Date()
      const currentSeconds = now.getSeconds()
      const options: string[] = []

      // Se faltam menos de 15 segundos para o próximo minuto, começar do próximo
      const startMinute = currentSeconds > 45 ? 2 : 1

      // Gerar opções seguindo o padrão: +1, +2, +3, +4, +9, +14, +29, +59, +119, +179, +239
      const minutesToAdd = [
        startMinute,
        startMinute + 1,
        startMinute + 2,
        startMinute + 3,
        startMinute + 4,
        startMinute + 8,
        startMinute + 13,
        startMinute + 28,
        startMinute + 58,
        startMinute + 118,
        startMinute + 178,
        startMinute + 238,
      ]

      minutesToAdd.forEach((minutes) => {
        const futureTime = new Date(now.getTime() + minutes * 60000)
        const hours = String(futureTime.getHours()).padStart(2, "0")
        const mins = String(futureTime.getMinutes()).padStart(2, "0")
        options.push(`${hours}:${mins}`)
      })

      setTimeOptions(options)
    }

    generateTimeOptions()
    const interval = setInterval(generateTimeOptions, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleTrade = (type: "CALL" | "PUT") => {
    onTrade(type, amount, selectedExpiration)
    setShowExpirationModal(false)
  }

  const handleSelectTimer = (seconds: number) => {
    setSelectedExpiration(seconds)
    setShowExpirationModal(false)
  }

  const handleSelectTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":").map(Number)
    const now = new Date()
    const targetTime = new Date()
    targetTime.setHours(hours, minutes, 0, 0)

    // Se o horário já passou hoje, assumir amanhã
    if (targetTime < now) {
      targetTime.setDate(targetTime.getDate() + 1)
    }

    const diffMs = targetTime.getTime() - now.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)

    setSelectedExpiration(diffSeconds)
    setShowExpirationModal(false)
  }

  const formatExpiration = () => {
    if (selectedExpiration < 60) {
      return `00:00:${String(selectedExpiration).padStart(2, "0")}`
    } else if (selectedExpiration < 3600) {
      const mins = Math.floor(selectedExpiration / 60)
      const secs = selectedExpiration % 60
      return `00:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    } else {
      const hours = Math.floor(selectedExpiration / 3600)
      const mins = Math.floor((selectedExpiration % 3600) / 60)
      const secs = selectedExpiration % 60
      return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    }
  }

  const totalPayout = currentSymbol ? (amount + amount * (currentSymbol.payout / 100)).toFixed(2) : "0.00"

  const timerOptions = [
    { value: 5, label: "00:05" },
    { value: 10, label: "00:10" },
    { value: 15, label: "00:15" },
    { value: 30, label: "00:30" },
    { value: 60, label: "01:00" },
    { value: 120, label: "02:00" },
    { value: 300, label: "05:00" },
    { value: 600, label: "10:00" },
    { value: 900, label: "15:00" },
    { value: 1800, label: "30:00" },
    { value: 3600, label: "01:00:00" },
    { value: 7200, label: "02:00:00" },
    { value: 14400, label: "04:00:00" },
  ]

  return (
    <>
      {/* Painel fixo na parte inferior */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-30"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* Seletor de símbolo */}
        <div className="px-3 py-2 border-b border-border">
          <button
            onClick={() => setShowSymbolList(true)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold">
                {currentSymbol?.name.substring(0, 2)}
              </div>
              <div>
                <div className="font-bold text-sm">
                  {currentSymbol?.name} <span className="text-muted-foreground">(OTC)</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary font-bold text-sm">{currentSymbol?.payout}%</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
          </button>
        </div>

        {/* Cronômetro e Investimento */}
        <div className="px-3 py-2 grid grid-cols-2 gap-2">
          {/* Cronômetro */}
          <button
            onClick={() => setShowExpirationModal(true)}
            className="border border-border rounded-lg p-2 text-left hover:bg-muted/50 transition-colors"
          >
            <div className="text-xs text-muted-foreground mb-0.5">Cronômetro</div>
            <div className="text-lg font-bold flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatExpiration()}
            </div>
          </button>

          {/* Investimento */}
          <div className="border border-border rounded-lg p-2">
            <div className="text-xs text-muted-foreground mb-0.5">Investimento</div>
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" className="h-5 w-5 p-0" onClick={handleDecrement}>
                <Minus className="w-3 h-3" />
              </Button>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number.parseFloat(e.target.value) || 0)}
                className="text-lg font-bold bg-transparent text-center w-16 outline-none"
              />
              <Button variant="ghost" size="icon" className="h-5 w-5 p-0" onClick={handleIncrement}>
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Pagamento */}
        <div className="px-3 pb-1.5 text-center text-xs text-muted-foreground ">
          Pagamento: <span className="font-bold text-foreground text-sm">{totalPayout} R$</span>
        </div>

        {/* Botões CALL e PUT */}
        <div className="px-3 pb-3 grid grid-cols-2 gap-2 mb-12">
          <Button onClick={() => handleTrade("PUT")} className="btn-put h-12 text-base font-bold" size="lg">
            <ArrowDown className="w-4 h-4 mr-1" />
            Para baixo
          </Button>
          <Button onClick={() => handleTrade("CALL")} className="btn-call h-12 text-base font-bold" size="lg">
            <ArrowUp className="w-4 h-4 mr-1" />
            Para cima
          </Button>
        </div>
      </div>

      {/* Modal de cronômetro/tempo */}
      {showExpirationModal && (
        <div
          className="md:hidden fixed inset-0 bg-black/80 z-50 flex items-end"
          onClick={() => setShowExpirationModal(false)}
        >
          <div
            className="bg-card w-full rounded-t-2xl max-h-[70vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            {/* Tabs */}
            <div className="sticky top-0 bg-card border-b border-border">
              <div className="flex gap-2 p-3">
                <button
                  onClick={() => setExpirationMode("timer")}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-colors ${
                    expirationMode === "timer"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  CRONÔMETRO
                </button>
                <button
                  onClick={() => setExpirationMode("time")}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-colors ${
                    expirationMode === "time"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  TEMPO
                </button>
              </div>
            </div>

            {/* Opções */}
            <div className="p-3">
              {expirationMode === "timer" ? (
                <div className="grid grid-cols-3 gap-2">
                  {timerOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSelectTimer(option.value)}
                      className={`py-3 px-4 rounded-lg font-bold text-sm transition-colors ${
                        selectedExpiration === option.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {timeOptions.map((time) => (
                    <button
                      key={time}
                      onClick={() => handleSelectTime(time)}
                      className="py-3 px-4 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold text-sm transition-colors"
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}

              {/* Botão definir manualmente */}
              <button
                onClick={() => {
                  const customTime = prompt("Digite o tempo em segundos:")
                  if (customTime && !isNaN(Number(customTime))) {
                    handleSelectTimer(Number(customTime))
                  }
                }}
                className="w-full mt-3 py-3 px-4 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold text-sm transition-colors"
              >
                Definir manualmente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de seleção de símbolo */}
      {showSymbolList && (
        <div
          className="md:hidden fixed inset-0 bg-black/80 z-50 flex flex-col"
          onClick={() => setShowSymbolList(false)}
        >
          <div className="bg-card m-4 rounded-lg max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Selecionar Paridade</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowSymbolList(false)}>
                Fechar
              </Button>
            </div>

            <div className="p-2">
              {symbols.map((symbol) => (
                <button
                  key={symbol.id}
                  onClick={() => {
                    onSelectSymbol(symbol.id)
                    setShowSymbolList(false)
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-lg mb-2 transition-colors ${
                    activeSymbol === symbol.id
                      ? "bg-primary/20 border border-primary"
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold">
                      {symbol.name.substring(0, 2)}
                    </div>
                    <div className="text-left">
                      <div className="font-bold">{symbol.name}</div>
                      <div className="text-xs text-muted-foreground">OTC</div>
                    </div>
                  </div>
                  <div className="text-primary font-bold text-lg">{symbol.payout}%</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
