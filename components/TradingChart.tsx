"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import type { SymbolEngine, Candle } from "@/lib/tradingEngine"
import type { SymbolConfig } from "@/config/symbols"
import { SymbolPills } from "./SymbolPills"
import { TimeframeMenu } from "./TimeframeMenu"
import { ArrowRight } from "lucide-react"

interface TradingChartProps {
  engine: SymbolEngine | null
  timeframe: number
  symbol: SymbolConfig | null
  orders: Order[]
  onUpdateOrderVisuals: () => void
  symbols: SymbolConfig[]
  activeSymbol: string
  onSelectSymbol: (symbolId: string) => void
  engines: Map<string, SymbolEngine>
  onTimeframeChange: (tf: number) => void
}

export interface Order {
  id: number
  sym: string
  tipo: "CALL" | "PUT"
  valor: number
  strike: number
  endTimeMs: number
  tfSec: number
  relX?: number
  relY?: number
  resolved?: boolean
}

export const TradingChart = ({
  engine,
  timeframe,
  symbol,
  orders,
  onUpdateOrderVisuals,
  symbols,
  activeSymbol,
  onSelectSymbol,
  engines,
  onTimeframeChange,
}: TradingChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [scaleX, setScaleX] = useState(20)
  const [translateX, setTranslateX] = useState(0)
  const [follow, setFollow] = useState(true)
  const [dragging, setDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartTX, setDragStartTX] = useState(0)
  const [canvasTimer, setCanvasTimer] = useState("00:00")
  const [showFollowButton, setShowFollowButton] = useState(false)

  const minScaleX = 4
  const maxScaleX = 80

  const worldX = (i: number) => i * scaleX + translateX
  const invWorldX = (x: number) => (x - translateX) / scaleX
  const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b)

  const priceToY = (p: number, min: number, max: number, height: number) => {
    return height - ((p - min) / (max - min)) * (height - 20) - 10
  }

  const centerOnLatest = () => {
    if (!engine) return
    const cands = engine.buildCandles(timeframe)
    if (cands.length) {
      const canvas = canvasRef.current
      if (!canvas) return
      const bw = Math.max(1, Math.round(scaleX * 0.72))
      const L = cands.length - 1
      setTranslateX(canvas.width / 2 - L * scaleX - bw / 2)
    }
  }

  useEffect(() => {
    setFollow(true)
    centerOnLatest()
  }, [timeframe, symbol])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      canvas.width = canvas.clientWidth
      canvas.height = canvas.clientHeight
    }

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !engine) return

    const ctx = canvas.getContext("2d", { 
      alpha: false,
      desynchronized: true,
      willReadFrequently: false
    })
    if (!ctx) return

    let lastOrderUpdate = 0
    const orderThrottle = 150

    const draw = () => {
      const now = performance.now()

      const W = canvas.width
      const H = canvas.height
      const cands = engine.buildCandles(timeframe, -3)
      const price = engine.price

      // Follow mode
      if (follow && cands.length) {
        const bw = Math.max(1, Math.round(scaleX * 0.72))
        const L = cands.length - 1
        setTranslateX(W / 2 - L * scaleX - bw / 2)
      }

      // Verificar se o último candle está visível na tela
      if (cands.length > 0) {
        const bw = Math.max(1, Math.round(scaleX * 0.72))
        const lastCandleX = worldX(cands.length - 1) + bw / 2
        const isLastCandleVisible = lastCandleX >= 0 && lastCandleX <= W
        setShowFollowButton(!isLastCandleVisible)
      }

      ctx.clearRect(0, 0, W, H)
      if (cands.length === 0) return

      const firstIdx = Math.floor(invWorldX(0)) - 1
      const lastIdx = Math.ceil(invWorldX(W)) + 1

      let min = Number.POSITIVE_INFINITY
      let max = Number.NEGATIVE_INFINITY
      for (let i = Math.max(0, firstIdx); i < Math.min(cands.length, lastIdx); i++) {
        const c = cands[i]
        if (!c) continue
        if (c.l < min) min = c.l
        if (c.h > max) max = c.h
      }

      if (!isFinite(min) || !isFinite(max) || min === max) {
        min = price * 0.999
        max = price * 1.001
      }

      // Draw grid (pontilhado suave)
      ctx.strokeStyle = "hsl(210 10% 20% / 0.3)"
      ctx.lineWidth = 1
      ctx.setLineDash([3, 3])
      ctx.beginPath()

      const step = Math.max(1, Math.round(100 / scaleX))
      const first = Math.floor(invWorldX(0)) - 1
      const last = Math.ceil(invWorldX(W)) + 1

      for (let i = first; i <= last; i += step) {
        const x = Math.round(worldX(i)) + 0.5
        ctx.moveTo(x, 0)
        ctx.lineTo(x, H)
      }

      const n = 8
      for (let i = 1; i < n; i++) {
        const y = Math.round((H / n) * i) + 0.5
        ctx.moveTo(0, y)
        ctx.lineTo(W, y)
      }
      ctx.stroke()
      ctx.setLineDash([])

      // Price labels (desenhar menos labels no mobile)
      const isMobile = W < 768
      const labelStep = isMobile ? 2 : 1
      
      ctx.fillStyle = "hsl(210 10% 60%)"
      ctx.textAlign = "right"
      ctx.textBaseline = "middle"
      ctx.font = "11px Montserrat, sans-serif"

      for (let i = 0; i <= n; i += labelStep) {
        const p = min + ((max - min) * i) / n
        const y = priceToY(p, min, max, H)
        ctx.fillText(p.toFixed(6), W - 6, y)
      }

      // Preparar para linha vertical e horizontal
      const rtIndex = cands.length - 1
      const bw = Math.max(1, Math.round(scaleX * 0.72))
      const xRT = Math.round(worldX(rtIndex) + bw / 2) + 0.5
      const lastCandle = cands[rtIndex]

      // Draw candles (otimizado)
      ctx.save()
      for (let i = Math.max(0, firstIdx); i < Math.min(cands.length, lastIdx); i++) {
        const c = cands[i]
        const x = Math.round(worldX(i))
        const yO = priceToY(c.o, min, max, H)
        const yC = priceToY(c.c, min, max, H)
        const yH = priceToY(c.h, min, max, H)
        const yL = priceToY(c.l, min, max, H)
        const bull = c.c >= c.o

        const color = bull ? "hsl(142 76% 36%)" : "hsl(0 84% 60%)"
        
        // Wick
        ctx.strokeStyle = color
        ctx.beginPath()
        ctx.moveTo(x + bw / 2, yH)
        ctx.lineTo(x + bw / 2, yL)
        ctx.stroke()

        // Body
        ctx.fillStyle = color
        const top = Math.min(yO, yC)
        const h = Math.max(1, Math.abs(yO - yC))
        ctx.fillRect(x, top, bw, h)
      }
      ctx.restore()

      // Linha vertical atrás das velas (pontilhado)
      ctx.strokeStyle = "hsl(210 10% 40% / 0.5)"
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])

      ctx.beginPath()
      ctx.moveTo(xRT, 0)
      ctx.lineTo(xRT, H)
      ctx.stroke()

      ctx.setLineDash([])

      // Timer box - calcular primeiro para sincronizar com a linha
      const yPriceLineExact = priceToY(lastCandle.c, min, max, H)

      if (cands.length > 0) {
        const tfMs = timeframe * 1000
        const now = Date.now()
        const elapsed = now - lastCandle.t
        const remaining = Math.max(0, tfMs - elapsed)
        const remainingSec = Math.ceil(remaining / 1000)
        const mm = Math.floor(remainingSec / 60)
        const ss = remainingSec % 60
        const timerText = `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`
        setCanvasTimer(timerText)

        const timerWidth = 60
        const timerHeight = 24
        const offsetRight = 40
        const timerX = Math.max(10, Math.min(W - timerWidth - 10, xRT + offsetRight))
        const timerY = Math.round(yPriceLineExact - timerHeight / 2)

        // Desenhar linha horizontal ANTES do timer
        ctx.strokeStyle = "hsl(210 10% 40%)"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(0, Math.round(yPriceLineExact) + 0.5)
        ctx.lineTo(W, Math.round(yPriceLineExact) + 0.5)
        ctx.stroke()

        // Draw timer box sobre a linha
        ctx.fillStyle = "hsl(210 13% 9%)"
        ctx.fillRect(timerX, timerY, timerWidth, timerHeight)
        ctx.strokeStyle = "hsl(210 12% 15%)"
        ctx.lineWidth = 1
        ctx.strokeRect(timerX, timerY, timerWidth, timerHeight)

        ctx.fillStyle = "hsl(210 10% 95%)"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.font = "bold 12px Montserrat, sans-serif"
        ctx.fillText(timerText, timerX + timerWidth / 2, timerY + timerHeight / 2)
      }

      // Update order visuals (throttled)
      if (now - lastOrderUpdate > orderThrottle) {
        lastOrderUpdate = now
        updateOrderPositions(cands, min, max, H, W)
      }
    }

    const updateOrderPositions = (cands: Candle[], min: number, max: number, H: number, W: number) => {
      const Y_THRESHOLD = 30
      const HORIZONTAL_OFFSET = 200

      // Usar requestAnimationFrame para updates de DOM
      requestAnimationFrame(() => {
        orders.forEach((order, index) => {
          const lineEl = document.getElementById(`line_${order.id}`)
          const badgeEl = document.getElementById(`ord_${order.id}`)
          const startCircle = document.getElementById(`circle_start_${order.id}`)
          const endCircle = document.getElementById(`circle_end_${order.id}`)

          if (!lineEl || !badgeEl) return

          const orderEngine = engines.get(order.sym)
          if (!orderEngine) return

          const orderCands = orderEngine.buildCandles(timeframe)

          const startTimeMs = order.endTimeMs - order.tfSec * 1000
          const candleCountInOrder = Math.ceil(order.tfSec / timeframe)

          let currentCandleIndex = orderCands.findIndex((c) => c.t >= startTimeMs)
          if (currentCandleIndex === -1) currentCandleIndex = orderCands.length - 1

          const y = priceToY(order.strike, min, max, H)
          const bw = Math.max(1, Math.round(scaleX * 0.72))
          const xStart = worldX(currentCandleIndex) + bw / 2

          const endCandleIndex = currentCandleIndex + candleCountInOrder
          const xEnd = worldX(endCandleIndex) + bw / 2

          // Usar transform ao invés de left/top para melhor performance
          lineEl.style.transform = `translate(${Math.round(xStart)}px, ${Math.round(y)}px)`
          lineEl.style.width = `${Math.max(0, Math.round(xEnd - xStart))}px`

          if (startCircle) {
            startCircle.style.transform = `translate(${Math.round(xStart)}px, ${Math.round(y)}px)`
          }

          if (endCircle) {
            endCircle.style.transform = `translate(${Math.round(xEnd)}px, ${Math.round(y)}px)`
          }

          let overlapCount = 0
          for (let i = index + 1; i < orders.length; i++) {
            const nextOrder = orders[i]
            const nextY = priceToY(nextOrder.strike, min, max, H)

            if (Math.abs(nextY - y) < Y_THRESHOLD) {
              overlapCount++
            }
          }

          const horizontalOffset = overlapCount * HORIZONTAL_OFFSET

          const badgeWidth = 200
          const leftPosition = xStart - 10 - horizontalOffset
          badgeEl.style.left = `${Math.max(badgeWidth + 10, leftPosition)}px`
          badgeEl.style.top = `${Math.round(y)}px`
        })
      })
    }

    let animationId: number
    const loop = () => {
      draw()
      animationId = requestAnimationFrame(loop)
    }
    animationId = requestAnimationFrame(loop)

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
    }
  }, [engine, timeframe, scaleX, translateX, follow, orders])

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const mouseX = e.nativeEvent.offsetX
    const prev = scaleX
    const f = e.deltaY < 0 ? 1.12 : 1 / 1.12
    const newScale = clamp(scaleX * f, minScaleX, maxScaleX)
    setScaleX(newScale)
    setTranslateX(mouseX - (mouseX - translateX) * (newScale / prev))
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true)
    setDragStartX(e.clientX)
    setDragStartTX(translateX)
    setFollow(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging && engine && canvasRef.current) {
      const canvas = canvasRef.current
      const cands = engine.buildCandles(timeframe)
      const newTranslateX = dragStartTX + (e.clientX - dragStartX)

      const bw = Math.max(1, Math.round(scaleX * 0.72))
      const maxTranslateX = canvas.width - bw
      const minTranslateX = -((cands.length - 1) * scaleX)

      setTranslateX(Math.max(minTranslateX, Math.min(maxTranslateX, newTranslateX)))
    }
  }

  const handleMouseUp = () => {
    setDragging(false)
  }

  return (
    <div className="relative flex-1 bg-[hsl(var(--chart-bg))]">
      <div className="absolute top-3 left-3 z-20 pointer-events-auto md:hidden">
        <TimeframeMenu timeframe={timeframe} onTimeframeChange={onTimeframeChange} />
      </div>

      <div className="hidden md:block absolute top-3 left-3 right-3 z-20 pointer-events-auto">
        <SymbolPills
          symbols={symbols}
          activeSymbol={activeSymbol}
          onSelectSymbol={onSelectSymbol}
          orders={orders}
          engines={engines}
        />
      </div>

      {showFollowButton && (
        <button
          onClick={() => {
            setFollow(true)
            centerOnLatest()
          }}
          className="absolute right-6 bottom-1/2 translate-y-1/2 z-10 w-12 h-12 bg-background border-2 border-border rounded-full flex items-center justify-center hover:bg-muted transition-all shadow-lg"
        >
          <ArrowRight className="w-5 h-5 text-primary" />
        </button>
      )}

      <div className="relative w-full h-full md:pb-0 pb-[280px]">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-move touch-none select-none"
          style={{ 
            willChange: 'transform',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden'
          }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown as any}
          onTouchMove={handleMouseMove as any}
          onTouchEnd={handleMouseUp}
        />

        <div ref={overlayRef} id="overlay" className="absolute inset-0 pointer-events-none z-0">
          <div
            id="mobile-notifications"
            className="md:hidden absolute top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none"
          />
        </div>
      </div>
    </div>
  )
}