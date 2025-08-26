"use client"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Minus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Bar } from "recharts"
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
  { symbol: "BTC/USDT", name: "Bitcoin", basePrice: 65084.55, volatility: 2500.0, payout: 95, icon: "₿" },
  { symbol: "TESLA-OTC-54", name: "Tesla", basePrice: 245.5, volatility: 15.8, payout: 98, icon: "🚗" },
  { symbol: "AAPL-OTC-33", name: "Apple", basePrice: 185.75, volatility: 8.25, payout: 97, icon: "🍎" },
  { symbol: "NVDA-OTC-21", name: "NVIDIA", basePrice: 875.3, volatility: 45.2, payout: 96, icon: "🔥" },
  { symbol: "EUR-CHF-OTC", name: "EUR/CHF", basePrice: 0.9456, volatility: 0.0085, payout: 88, icon: "💱" },
]

const TIME_OPTIONS = ["1m", "5m", "15m", "1h", "4h", "1d"]

const CandlestickChart = ({ data }: { data: any[] }) => {
  const CustomCandlestick = (props: any) => {
    const { payload, x, width } = props
    if (!payload) return null

    const { open, high, low, close } = payload
    const isGreen = close > open

    // Calculate positions in the chart
    const yScale = (value: number) => {
      const minValue = Math.min(...data.map((d) => d.low))
      const maxValue = Math.max(...data.map((d) => d.high))
      const range = maxValue - minValue
      return 350 - ((value - minValue) / range) * 300 // 350 is height, 300 is useful range
    }

    const candleWidth = Math.max(width * 0.6, 2)
    const wickWidth = 1

    return (
      <g>
        {/* Wick */}
        <line
          x1={x + width / 2}
          y1={yScale(high)}
          x2={x + width / 2}
          y2={yScale(low)}
          stroke={isGreen ? "#00D4AA" : "#F84960"}
          strokeWidth={wickWidth}
        />
        {/* Candle body */}
        <rect
          x={x + (width - candleWidth) / 2}
          y={yScale(Math.max(open, close))}
          width={candleWidth}
          height={Math.max(Math.abs(yScale(close) - yScale(open)), 1)}
          fill={isGreen ? "#00D4AA" : "#F84960"}
          stroke={isGreen ? "#00D4AA" : "#F84960"}
        />
      </g>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2B3139" />
        <XAxis
          dataKey="time"
          stroke="#848E9C"
          fontSize={12}
          interval="preserveStartEnd"
          tickFormatter={(value) => {
            const date = new Date(value)
            return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
          }}
        />
        <YAxis
          stroke="#848E9C"
          fontSize={12}
          domain={["dataMin - 500", "dataMax + 500"]}
          tickFormatter={(value) => {
            if (value >= 1000) {
              return value.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
            }
            return value.toFixed(2)
          }}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload[0]) {
              const data = payload[0].payload
              return (
                <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
                  <p className="text-white font-medium">
                    {new Date(label).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-300">
                      Abertura: <span className="text-white">{data.open.toLocaleString("pt-BR")}</span>
                    </p>
                    <p className="text-gray-300">
                      Máxima: <span className="text-green-400">{data.high.toLocaleString("pt-BR")}</span>
                    </p>
                    <p className="text-gray-300">
                      Mínima: <span className="text-red-400">{data.low.toLocaleString("pt-BR")}</span>
                    </p>
                    <p className="text-gray-300">
                      Fechamento: <span className="text-white">{data.close.toLocaleString("pt-BR")}</span>
                    </p>
                    <p className="text-gray-300">
                      Volume: <span className="text-blue-400">{data.volume.toLocaleString("pt-BR")}</span>
                    </p>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Bar dataKey="close" shape={<CustomCandlestick />} fill="transparent" />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

export default function TradingChart() {
  const [selectedAsset, setSelectedAsset] = useState<OTCAsset>(OTC_ASSETS[0])
  const [currentPrice, setCurrentPrice] = useState(selectedAsset.basePrice)
  const [balance, setBalance] = useState(10001.96)
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
    if (balance < tradeAmount) {
      toast({
        title: "Saldo Insuficiente",
        description: "Você não tem saldo suficiente para esta operação",
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
    setBalance((prev) => prev - tradeAmount)

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
        setBalance((prevBalance) => prevBalance + payout)
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

  const tradeTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

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
      <TradingHeader balance={balance} />

      <div className="flex pt-[70px] h-screen">
        <div className="flex-1 relative" style={{ backgroundColor: "#181A20" }}>
          <div className="w-full h-full relative">
            {!isLoading && candlestickData.length > 0 ? (
              <CandlestickChart data={candlestickData} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-400">Carregando gráfico...</div>
              </div>
            )}
          </div>
        </div>

        <div className="w-80 border-l p-4 space-y-4" style={{ backgroundColor: "#1E2329", borderColor: "#2B3139" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-sm font-bold">
                T
              </div>
              <div>
                <div className="text-white font-semibold">{selectedAsset.name}</div>
                <div className="text-gray-400 text-sm">{selectedAsset.symbol}</div>
              </div>
            </div>
            <span className="text-green-400 font-bold">{selectedAsset.payout}%</span>
          </div>

          <div className="rounded p-3" style={{ backgroundColor: "#181A20" }}>
            <div className="text-gray-400 text-sm mb-2">Tempo</div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {TIME_OPTIONS.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "ghost"}
                  size="sm"
                  className={`text-xs ${selectedTime === time ? "bg-yellow-500 text-black" : "text-white hover:bg-gray-700"}`}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </Button>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="text-white"
                onClick={() => {
                  const currentIndex = TIME_OPTIONS.indexOf(selectedTime)
                  if (currentIndex > 0) {
                    setSelectedTime(TIME_OPTIONS[currentIndex - 1])
                  }
                }}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="text-white font-semibold text-lg">{selectedTime}</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-white"
                onClick={() => {
                  const currentIndex = TIME_OPTIONS.indexOf(selectedTime)
                  if (currentIndex < TIME_OPTIONS.length - 1) {
                    setSelectedTime(TIME_OPTIONS[currentIndex + 1])
                  }
                }}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="rounded p-3" style={{ backgroundColor: "#181A20" }}>
            <div className="text-gray-400 text-sm mb-2">Investimento</div>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="text-white"
                onClick={() => setTradeAmount(Math.max(1, tradeAmount - 1))}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="text-white font-semibold">{tradeAmount}</span>
              <Button variant="ghost" size="sm" className="text-white" onClick={() => setTradeAmount(tradeAmount + 1)}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="text-center py-2">
            <div className="text-gray-400 text-sm">Seu pagamento:</div>
            <div className="text-green-400 font-bold text-xl">
              {(tradeAmount * (selectedAsset.payout / 100)).toFixed(2)} R$
            </div>
            <div className="text-gray-400 text-sm">{selectedAsset.payout}%</div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => executeTrade("up")}
              disabled={balance < tradeAmount}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 py-4 text-lg font-semibold"
            >
              COMPRAR
            </Button>
            <Button
              onClick={() => executeTrade("down")}
              disabled={balance < tradeAmount}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 py-4 text-lg font-semibold"
            >
              VENDER
            </Button>
          </div>

          <div className="rounded p-3" style={{ backgroundColor: "#181A20" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-semibold">Operações</span>
              <span className="text-gray-400">{activeTrades.length}</span>
            </div>
            <div className="text-gray-400 text-sm text-center py-4">Nenhuma operação ainda</div>
          </div>
        </div>
      </div>
    </div>
  )
}
