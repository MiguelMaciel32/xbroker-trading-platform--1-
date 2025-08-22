"use client"

import { useEffect, useRef, useState } from "react"
import { createChart, ColorType, type IChartApi, type ISeriesApi, type CandlestickData } from "lightweight-charts"

interface LightweightChartProps {
  symbol: string
  className?: string
}

export default function LightweightChart({ symbol, className = "" }: LightweightChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const [currentPrice, setCurrentPrice] = useState(1.085)
  const [priceChange, setPriceChange] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const generateInitialData = (): CandlestickData[] => {
    const data: CandlestickData[] = []
    let basePrice = 1.085
    const now = Math.floor(Date.now() / 1000)

    for (let i = 100; i >= 0; i--) {
      const time = now - i * 60 // 1 minute intervals
      const volatility = 0.0005 + Math.random() * 0.001

      const open = basePrice
      const change = (Math.random() - 0.5) * volatility
      const high = open + Math.abs(change) + Math.random() * volatility
      const low = open - Math.abs(change) - Math.random() * volatility
      const close = open + change

      data.push({
        time: time as any,
        open: Number(open.toFixed(5)),
        high: Number(high.toFixed(5)),
        low: Number(low.toFixed(5)),
        close: Number(close.toFixed(5)),
      })

      basePrice = close
    }

    return data
  }

  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#131722" },
        textColor: "#d1d4dc",
        fontSize: 12,
        fontFamily: "Inter, sans-serif",
      },
      grid: {
        vertLines: { color: "#2B2B43" },
        horzLines: { color: "#2B2B43" },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: "#758696",
          width: 1,
          style: 1,
          visible: true,
          labelVisible: true,
        },
        horzLine: {
          color: "#758696",
          width: 1,
          style: 1,
          visible: true,
          labelVisible: true,
        },
      },
      rightPriceScale: {
        borderColor: "#2B2B43",
        textColor: "#d1d4dc",
        entireTextOnly: true,
      },
      timeScale: {
        borderColor: "#2B2B43",
        timeVisible: true,
        secondsVisible: false,
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
    })

    const candlestickSeries = (chart as any).addCandlestickSeries({
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
      priceFormat: {
        type: "price",
        precision: 5,
        minMove: 0.00001,
      },
    })

    const initialData = generateInitialData()
    candlestickSeries.setData(initialData)

    // Set current price from last candle
    const lastCandle = initialData[initialData.length - 1]
    setCurrentPrice(lastCandle.close)

    chart.timeScale().fitContent()

    chartRef.current = chart
    seriesRef.current = candlestickSeries

    return () => {
      chart.remove()
    }
  }, [symbol])

  useEffect(() => {
    if (!seriesRef.current) return

    const updatePrice = () => {
      const volatility = 0.0002 + Math.random() * 0.0008
      const change = (Math.random() - 0.5) * volatility
      const newPrice = currentPrice + change

      setPriceChange(change)
      setCurrentPrice(newPrice)

      // Add new candle every few seconds
      const now = Math.floor(Date.now() / 1000)
      const newCandle: CandlestickData = {
        time: now as any,
        open: Number(currentPrice.toFixed(5)),
        high: Number((currentPrice + Math.abs(change) + Math.random() * 0.0003).toFixed(5)),
        low: Number((currentPrice - Math.abs(change) - Math.random() * 0.0003).toFixed(5)),
        close: Number(newPrice.toFixed(5)),
      }

      seriesRef.current?.update(newCandle)
    }

    intervalRef.current = setInterval(updatePrice, 2000 + Math.random() * 3000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [currentPrice])

  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        })
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className={`relative ${className}`}>
      <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="text-white font-mono text-lg font-bold">{currentPrice.toFixed(5)}</div>
          <div
            className={`flex items-center space-x-1 transition-colors duration-300 ${
              priceChange > 0 ? "text-green-400" : priceChange < 0 ? "text-red-400" : "text-gray-400"
            }`}
          >
            <span className="text-sm">{priceChange > 0 ? "↗" : priceChange < 0 ? "↘" : "→"}</span>
            <span className="text-sm font-mono">
              {priceChange > 0 ? "+" : ""}
              {(priceChange * 10000).toFixed(1)} pips
            </span>
          </div>
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {symbol} • Live
          <span className="inline-block w-2 h-2 bg-green-400 rounded-full ml-2 animate-pulse"></span>
        </div>
      </div>

      <div
        ref={chartContainerRef}
        className="w-full h-full transition-all duration-300 ease-in-out"
        style={{ minHeight: "400px" }}
      />
    </div>
  )
}
