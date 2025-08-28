"use client"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Minus, TrendingUp, TrendingDown, ChevronDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import TradingHeader from "@/components/trading-header"

const SITE_CONFIG = {
  platformName: "TradePro",
  logoUrl:
    "https://media.discordapp.net/attachments/1191807892936986756/1408228383128551534/Captura_de_Tela_2025-08-21_as_20.16.28-removebg-preview.png?ex=68a8fa62&is=68a7a8e2&hm=527693bc110e80e51760a1cfcc0b1e3a4616517b98b7fcf8a9fffa342ba6f059&=&format=webp&quality=lossless&width=1008&height=990",
  supportUrl: "#suporte",
  communityUrl: "#comunidade",
  colors: {
    primary: "#181A20",
    secondary: "#1E2329",
    accent: "#2B3139",
    border: "#2B3139",
  },
}

interface OTCAsset {
  symbol: string
  name: string
  basePrice: number
  volatility: number
  payout: number
  icon: string
  currentPrice?: number
}

interface CandleData {
  time: Date
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface ActiveTrade {
  id: string
  asset: string
  direction: "up" | "down"
  entryPrice: number
  startTime: number
  duration: number
  amount: number
  payout: number
  status: "active" | "won" | "lost"
}

interface TradeHistory {
  id: string
  asset: string
  direction: "up" | "down"
  entryPrice: number
  exitPrice: number
  amount: number
  payout: number
  result: "win" | "loss"
  timestamp: number
}

const OTC_ASSETS: OTCAsset[] = [
  { symbol: "BTC/USDT", name: "Bitcoin", basePrice: 65084.55, volatility: 2500.0, payout: 95, icon: "" },
  { symbol: "TESLA-OTC-54", name: "Tesla", basePrice: 245.5, volatility: 15.8, payout: 98, icon: "" },
  { symbol: "AAPL-OTC-33", name: "Apple", basePrice: 185.75, volatility: 8.25, payout: 97, icon: "" },
  { symbol: "NVDA-OTC-21", name: "NVIDIA", basePrice: 875.3, volatility: 45.2, payout: 96, icon: "" },
  { symbol: "EUR-CHF-OTC", name: "EUR/CHF", basePrice: 0.9456, volatility: 0.0085, payout: 88, icon: "" },
]

const TIME_OPTIONS = ["1m", "5m", "15m", "1h", "4h", "1d"]

const TradingViewWidget = ({ symbol }: { symbol: string }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isWidgetLoading, setIsWidgetLoading] = useState(true)

  useEffect(() => {
    if (!containerRef.current) return

    setIsWidgetLoading(true)

    containerRef.current.innerHTML = ""

    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
    script.type = "text/javascript"
    script.async = true
    script.onload = () => setIsWidgetLoading(false)
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol:
        symbol === "BTC/USDT"
          ? "BINANCE:BTCUSDT"
          : symbol === "TESLA-OTC-54"
            ? "NASDAQ:TSLA"
            : symbol === "AAPL-OTC-33"
              ? "NASDAQ:AAPL"
              : symbol === "NVDA-OTC-21"
                ? "NASDAQ:NVDA"
                : symbol === "EUR-CHF-OTC"
                  ? "FX:EURCHF"
                  : "BINANCE:BTCUSDT",
      interval: "1",
      timezone: "America/Sao_Paulo",
      theme: "dark",
      style: "1",
      locale: "br",
      toolbar_bg: "#181A20",
      enable_publishing: false,
      backgroundColor: "#181A20",
      gridColor: "#2B3139",
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      container_id: "tradingview_widget",
    })

    containerRef.current.appendChild(script)

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ""
      }
    }
  }, [symbol])

  return (
    <div className="w-full h-full bg-[#181A20] relative">
      {isWidgetLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#181A20] z-10">
          <div className="text-gray-400 text-lg">Carregando gráfico...</div>
        </div>
      )}
      <div ref={containerRef} id="tradingview_widget" className="w-full h-full" />
    </div>
  )
}

export default function TradingChart() {
  const [selectedAsset, setSelectedAsset] = useState<OTCAsset>(OTC_ASSETS[0])
  const [currentPrice, setCurrentPrice] = useState(selectedAsset.basePrice)
  const [balance, setBalance] = useState(10001.96)
  const [balanceType, setBalanceType] = useState<"demo" | "real">("demo")
  const [realBalance, setRealBalance] = useState(0)
  const [selectedTime, setSelectedTime] = useState("1m")
  const [tradeAmount, setTradeAmount] = useState(1)
  const [activeTrades, setActiveTrades] = useState<ActiveTrade[]>([])
  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>([])
  const [chartData, setChartData] = useState<CandleData[]>([])
  const [candlestickData, setCandlestickData] = useState<
    Array<{
      time: string
      open: number
      high: number
      low: number
      close: number
      volume: number
    }>
  >([])
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null)
  const [assetPrices, setAssetPrices] = useState<Record<string, number>>({})
  const [isAnimating, setIsAnimating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showAssetSelector, setShowAssetSelector] = useState(false)

  const { toast } = useToast()

  const generateCandlestickData = () => {
    const data = []
    let currentPrice = selectedAsset.basePrice
    const now = Date.now()

    for (let i = 49; i >= 0; i--) {
      const timeMultiplier =
        selectedTime === "1m"
          ? 60000
          : selectedTime === "5m"
            ? 300000
            : selectedTime === "15m"
              ? 900000
              : selectedTime === "1h"
                ? 3600000
                : selectedTime === "4h"
                  ? 14400000
                  : 86400000

      const time = new Date(now - i * timeMultiplier).toISOString()

      const volatility = selectedAsset.volatility * 0.02
      const change = (Math.random() - 0.5) * volatility
      const open = currentPrice
      const close = Math.max(0.01, currentPrice + change)

      const high = Math.max(open, close) + Math.random() * volatility * 0.5
      const low = Math.min(open, close) - Math.random() * volatility * 0.5

      data.push({
        time,
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(Math.max(0.01, low).toFixed(2)),
        close: Number(close.toFixed(2)),
        volume: Math.floor(Math.random() * 1000) + 100,
      })

      currentPrice = close
    }

    return data
  }

  const addNewCandle = () => {
    setCandlestickData((prevData) => {
      const lastCandle = prevData[prevData.length - 1]
      if (!lastCandle) return prevData

      const volatility = selectedAsset.volatility * 0.02
      const change = (Math.random() - 0.5) * volatility
      const open = lastCandle.close
      const close = Math.max(0.01, open + change)

      const high = Math.max(open, close) + Math.random() * volatility * 0.3
      const low = Math.min(open, close) - Math.random() * volatility * 0.3

      const newCandle = {
        time: new Date().toISOString(),
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(Math.max(0.01, low).toFixed(2)),
        close: Number(close.toFixed(2)),
        volume: Math.floor(Math.random() * 1000) + 100,
      }

      setCurrentPrice(newCandle.close)

      const newData = [...prevData, newCandle]
      return newData.slice(-50) // Keep last 50 candles
    })
  }

  const executeTrade = (direction: "up" | "down") => {
    const currentBalance = balanceType === "demo" ? balance : realBalance

    if (currentBalance < tradeAmount) {
      toast({
        title: "Saldo Insuficiente",
        description:
          balanceType === "real"
            ? "Você precisa fazer um depósito para operar com conta real"
            : "Você não tem saldo suficiente para esta operação",
        variant: "destructive",
      })
      return
    }

    const timeInMinutes =
      Number.parseInt(selectedTime.replace("m", "").replace("h", "")) * (selectedTime.includes("h") ? 60 : 1)
    const duration = timeInMinutes * 60 * 1000

    const newTrade: ActiveTrade = {
      id: Date.now().toString(),
      asset: selectedAsset.symbol,
      direction,
      entryPrice: currentPrice,
      startTime: Date.now(),
      duration,
      amount: tradeAmount,
      payout: tradeAmount * (selectedAsset.payout / 100),
      status: "active",
    }

    setActiveTrades((prev) => [...prev, newTrade])

    if (balanceType === "demo") {
      setBalance((prev) => prev - tradeAmount)
    } else {
      setRealBalance((prev) => prev - tradeAmount)
    }

    const timer = setTimeout(() => {
      finalizeTrade(newTrade.id)
    }, duration)

    tradeTimersRef.current.set(newTrade.id, timer)

    toast({
      title: `Trade ${direction === "up" ? "COMPRA" : "VENDA"} Executado!`,
      description: `${selectedAsset.name} - R$ ${tradeAmount.toFixed(2)}`,
      className: "bg-green-900 border-green-600 text-white",
    })
  }

  const finalizeTrade = (tradeId: string) => {
    setActiveTrades((prev) => {
      const trade = prev.find((t) => t.id === tradeId)
      if (!trade) return prev

      const currentAssetPrice = assetPrices[trade.asset] || currentPrice
      const priceChange = currentAssetPrice - trade.entryPrice

      let won = false
      if (trade.direction === "up") {
        won = priceChange > 0
      } else {
        won = priceChange < 0
      }

      const payout = won ? trade.amount + trade.payout : 0

      if (won) {
        if (balanceType === "demo") {
          setBalance((prevBalance) => prevBalance + payout)
        } else {
          setRealBalance((prevBalance) => prevBalance + payout)
        }
      }

      const historyEntry: TradeHistory = {
        id: trade.id,
        asset: trade.asset,
        direction: trade.direction,
        entryPrice: trade.entryPrice,
        exitPrice: currentAssetPrice,
        amount: trade.amount,
        payout: won ? trade.payout : 0,
        result: won ? "win" : "loss",
        timestamp: Date.now(),
      }

      setTradeHistory((prevHistory) => [...prevHistory, historyEntry])

      toast({
        title: won ? "🎉 TRADE VENCEDOR!" : "😔 Trade Perdedor",
        description: won ? `Ganhou R$ ${trade.payout.toFixed(2)}!` : `Perdeu R$ ${trade.amount.toFixed(2)}`,
        className: won ? "bg-green-900 border-green-600 text-white" : "bg-red-900 border-red-600 text-white",
      })

      const timer = tradeTimersRef.current.get(tradeId)
      if (timer) {
        clearTimeout(timer)
        tradeTimersRef.current.delete(tradeId)
      }

      return prev.filter((t) => t.id !== tradeId)
    })
  }

  const formatPrice = (price: number): string => {
    if (selectedAsset.symbol.includes("EUR-CHF")) {
      return price.toFixed(4)
    } else if (price >= 1000) {
      return price.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    } else {
      return price.toFixed(2)
    }
  }

  const handleAssetChange = (asset: OTCAsset) => {
    setSelectedAsset(asset)
    setCurrentPrice(asset.basePrice)
    setShowAssetSelector(false)
    toast({
      title: "Ativo Alterado",
      description: `Agora negociando ${asset.name}`,
      className: "bg-blue-900 border-blue-600 text-white",
    })
  }

  const tradeTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  const handleBalanceTypeChange = (type: "demo" | "real") => {
    setBalanceType(type)
  }

  const currentBalance = balanceType === "demo" ? balance : realBalance

  useEffect(() => {
    setIsLoading(true)
    const initialData = generateCandlestickData()
    setCandlestickData(initialData)
    setCurrentPrice(initialData[initialData.length - 1]?.close || selectedAsset.basePrice)
    setIsLoading(false)

    const interval = setInterval(addNewCandle, 3000)
    const priceInterval = setInterval(() => {
      setCandlestickData((prevData) => {
        if (prevData.length === 0) return prevData
        const lastCandle = prevData[prevData.length - 1]
        const volatility = selectedAsset.volatility * 0.01
        const change = (Math.random() - 0.5) * volatility
        const newPrice = Math.max(0.01, lastCandle.close + change)
        setCurrentPrice(newPrice)
        return prevData
      })
    }, 1500)

    return () => {
      clearInterval(interval)
      clearInterval(priceInterval)
      tradeTimersRef.current.forEach((timer) => clearTimeout(timer))
    }
  }, [selectedAsset, selectedTime])

  return (
    <div className="min-h-screen text-white font-sans overflow-x-hidden" style={{ backgroundColor: "#181A20" }}>
      <TradingHeader
        balance={balance}
        balanceType={balanceType}
        realBalance={realBalance}
        onBalanceTypeChange={handleBalanceTypeChange}
      />

      <div className="flex flex-col lg:flex-row pt-[70px] h-screen">
        <div className="flex-1 relative order-1 lg:order-1 h-1/2 lg:h-full" style={{ backgroundColor: "#181A20" }}>
          <div className="w-full h-full relative">
            {!isLoading ? (
              <TradingViewWidget symbol={selectedAsset.symbol} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-400">Carregando gráfico...</div>
              </div>
            )}
          </div>
        </div>

        <div
          className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l p-4 space-y-4 order-2 lg:order-2 h-1/2 lg:h-full overflow-y-auto"
          style={{ backgroundColor: "#1E2329", borderColor: "#2B3139" }}
        >
          <div className="rounded p-4" style={{ backgroundColor: "#181A20" }}>
            <div className="text-gray-400 text-sm mb-3">Selecionar Ativo</div>
            <div className="relative">
              <Button
                variant="ghost"
                className="w-full justify-between text-white hover:bg-[#2B3139] p-4 border border-[#2B3139] bg-[#1E2329] transition-all duration-200"
                onClick={() => setShowAssetSelector(!showAssetSelector)}
              >
                <div className="text-left">
                  <div className="font-semibold text-base text-white">{selectedAsset.name}</div>
                  <div className="text-gray-400 text-sm">{selectedAsset.symbol}</div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-green-400 font-bold text-sm">{selectedAsset.payout}%</div>
                    <div className="text-gray-500 text-xs">Payout</div>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 transition-all duration-200 ${showAssetSelector ? "rotate-180" : ""} text-gray-400`}
                  />
                </div>
              </Button>

              {showAssetSelector && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1">
                  <div className="border border-[#2B3139] shadow-lg" style={{ backgroundColor: "#1E2329" }}>
                    <div className="p-1">
                      {OTC_ASSETS.map((asset) => (
                        <Button
                          key={asset.symbol}
                          variant="ghost"
                          className={`w-full justify-between text-white p-4 transition-all duration-150 border-0 ${
                            selectedAsset.symbol === asset.symbol ? "bg-[#2B3139] text-white" : "hover:bg-[#2B3139]"
                          }`}
                          onClick={() => handleAssetChange(asset)}
                        >
                          <div className="text-left">
                            <div className="font-semibold text-base text-white">{asset.name}</div>
                            <div className="text-gray-400 text-sm">{asset.symbol}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-green-400 font-bold text-sm">{asset.payout}%</div>
                            <div className="text-gray-500 text-xs">Payout</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded p-4" style={{ backgroundColor: "#181A20" }}>
            <div className="text-gray-400 text-sm mb-3">Valor do Investimento</div>
            <div className="flex items-center justify-between bg-gray-800 rounded-lg p-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-gray-600 rounded-full w-8 h-8 p-0"
                onClick={() => setTradeAmount(Math.max(1, tradeAmount - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-white font-semibold text-lg">R$ {tradeAmount.toFixed(2)}</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-gray-600 rounded-full w-8 h-8 p-0"
                onClick={() => setTradeAmount(tradeAmount + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="text-center py-4 rounded-lg" style={{ backgroundColor: "#181A20" }}>
            <div className="text-gray-400 text-sm mb-1">Retorno Potencial</div>
            <div className="text-green-400 font-bold text-2xl">
              R$ {(tradeAmount * (selectedAsset.payout / 100)).toFixed(2)}
            </div>
            <div className="text-gray-400 text-sm">Payout: {selectedAsset.payout}%</div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => executeTrade("up")}
              disabled={currentBalance < tradeAmount}
              className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 disabled:from-gray-600 disabled:to-gray-500 py-4 text-lg font-bold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex items-center justify-center gap-3">
                <TrendingUp className="h-6 w-6" />
                <span>SUBIR</span>
              </div>
            </Button>
            <Button
              onClick={() => executeTrade("down")}
              disabled={currentBalance < tradeAmount}
              className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 disabled:from-gray-600 disabled:to-gray-500 py-4 text-lg font-bold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex items-center justify-center gap-3">
                <TrendingDown className="h-6 w-6" />
                <span>DESCER</span>
              </div>
            </Button>
          </div>

          <div className="rounded-lg p-4" style={{ backgroundColor: "#181A20" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-semibold">Posições Ativas</span>
              <span className="text-gray-400 bg-gray-700 px-2 py-1 rounded-full text-xs">{activeTrades.length}</span>
            </div>
            <div className="text-gray-400 text-sm text-center py-6 border border-dashed border-gray-600 rounded-lg">
              Nenhuma posição ativa
            </div>
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  )
}
