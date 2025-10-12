"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback } from "react"
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

const easeOutCubic = (t: number): number => {
  return 1 - Math.pow(1 - t, 3)
}

const easeOutQuad = (t: number): number => {
  return 1 - (1 - t) * (1 - t)
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
  const [showFollowButton, setShowFollowButton] = useState(false)

  const touchStartRef = useRef<{ x: number; time: number } | null>(null)
  const lastOrderUpdateRef = useRef(0)
  const frameCountRef = useRef(0)
  const lastDrawTimeRef = useRef(0)
  const isMobileRef = useRef(false)
  const staticCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const lastGridDrawRef = useRef(0)
  const lastTextDrawRef = useRef(0)
  const cachedMinMaxRef = useRef<{ min: number; max: number; timestamp: number }>({ min: 0, max: 0, timestamp: 0 })
  const followTranslateRef = useRef(translateX)

  const lastCandleCloseRef = useRef<number>(0)
  const candleAnimationProgressRef = useRef<number>(1)
  const priceChangeFlashRef = useRef<{ intensity: number; isBull: boolean } | null>(null)

  const minScaleX = 4
  const maxScaleX = 80

  const worldX = useCallback((i: number) => i * scaleX + translateX, [scaleX, translateX])
  const invWorldX = useCallback((x: number) => (x - translateX) / scaleX, [translateX, scaleX])
  const clamp = useCallback((v: number, a: number, b: number) => Math.min(Math.max(v, a), b), [])

  const priceToY = useCallback((p: number, min: number, max: number, height: number) => {
    return height - ((p - min) / (max - min)) * (height - 20) - 10
  }, [])

  const centerOnLatest = useCallback(() => {
    if (!engine) return
    const cands = engine.buildCandles(timeframe)
    if (cands.length) {
      const canvas = canvasRef.current
      if (!canvas) return
      const bw = Math.max(1, Math.round(scaleX * 0.72))
      const L = cands.length - 1
      const newTx = canvas.width / 2 - L * scaleX - bw / 2
      followTranslateRef.current = newTx
      setTranslateX(newTx)
    }
  }, [engine, timeframe, scaleX])

  useEffect(() => {
    setFollow(true)
    centerOnLatest()
  }, [timeframe, symbol, centerOnLatest])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      const dpr = 1
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.scale(dpr, dpr)
      }
      isMobileRef.current = canvas.clientWidth < 768

      if (!staticCanvasRef.current) {
        staticCanvasRef.current = document.createElement("canvas")
      }
      staticCanvasRef.current.width = canvas.width
      staticCanvasRef.current.height = canvas.height
      const staticCtx = staticCanvasRef.current.getContext("2d")
      if (staticCtx) {
        staticCtx.scale(dpr, dpr)
      }
    }

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()

    return () => observer.disconnect()
  }, [])

  const updateOrderPositions = useCallback(
    (cands: Candle[], min: number, max: number, H: number, W: number) => {
      const Y_THRESHOLD = 30
      const HORIZONTAL_OFFSET = 200

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

        lineEl.style.transform = `translate3d(${Math.round(xStart)}px, ${Math.round(y)}px, 0)`
        lineEl.style.width = `${Math.max(0, Math.round(xEnd - xStart))}px`

        if (startCircle) {
          startCircle.style.transform = `translate3d(${Math.round(xStart)}px, ${Math.round(y)}px, 0)`
        }

        if (endCircle) {
          endCircle.style.transform = `translate3d(${Math.round(xEnd)}px, ${Math.round(y)}px, 0)`
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
    },
    [orders, engines, timeframe, priceToY, scaleX, worldX],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !engine) return

    const ctx = canvas.getContext("2d", {
      alpha: false,
      desynchronized: true,
      willReadFrequently: false,
    })
    if (!ctx) return

    const W = canvas.clientWidth
    const H = canvas.clientHeight

    const bullColor = "hsl(142 76% 36%)"
    const bearColor = "hsl(0 84% 60%)"
    const gridColor = "hsl(210 10% 20% / 0.3)"
    const textColor = "hsl(210 10% 60%)"
    const lineColor = "hsl(210 10% 40%)"

    let animationId: number
    let lastCandsLength = 0

    const draw = (timestamp: number) => {
      const isMobile = isMobileRef.current

      const targetFrameTime = 16.67 // ~60fps
      if (timestamp - lastDrawTimeRef.current < targetFrameTime) {
        animationId = requestAnimationFrame(draw)
        return
      }
      lastDrawTimeRef.current = timestamp

      const cands = engine.buildCandles(timeframe, -3)
      const price = engine.price

      if (cands.length === 0) {
        animationId = requestAnimationFrame(draw)
        return
      }

      if (follow && cands.length) {
        const bw = Math.max(1, Math.round(scaleX * 0.72))
        const L = cands.length - 1
        const targetTx = W / 2 - L * scaleX - bw / 2

        const diff = targetTx - followTranslateRef.current
        if (Math.abs(diff) > 0.1) {
          followTranslateRef.current += diff * 0.2
          setTranslateX(followTranslateRef.current)
        }
      }

      if (frameCountRef.current % 30 === 0) {
        const bw = Math.max(1, Math.round(scaleX * 0.72))
        const lastCandleX = worldX(cands.length - 1) + bw / 2
        const isLastCandleVisible = lastCandleX >= 0 && lastCandleX <= W
        setShowFollowButton(!isLastCandleVisible)
      }

      ctx.clearRect(0, 0, W, H)

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

      const shouldDrawGrid = frameCountRef.current % 60 === 0 || dragging
      if (shouldDrawGrid) {
        ctx.strokeStyle = gridColor
        ctx.lineWidth = 1
        ctx.setLineDash([3, 3])
        ctx.beginPath()

        const step = Math.max(1, Math.round(isMobile ? 150 : 100 / scaleX))
        const first = Math.floor(invWorldX(0)) - 1
        const last = Math.ceil(invWorldX(W)) + 1

        for (let i = first; i <= last; i += step) {
          const x = Math.round(worldX(i)) + 0.5
          ctx.moveTo(x, 0)
          ctx.lineTo(x, H)
        }

        const n = isMobile ? 4 : 8
        for (let i = 1; i < n; i++) {
          const y = Math.round((H / n) * i) + 0.5
          ctx.moveTo(0, y)
          ctx.lineTo(W, y)
        }
        ctx.stroke()
        ctx.setLineDash([])
      }

      if (frameCountRef.current % 120 === 0) {
        const n = isMobile ? 4 : 8
        ctx.fillStyle = textColor
        ctx.textAlign = "right"
        ctx.textBaseline = "middle"
        ctx.font = isMobile ? "10px sans-serif" : "11px sans-serif"

        for (let i = 0; i <= n; i++) {
          const p = min + ((max - min) * i) / n
          const y = priceToY(p, min, max, H)
          ctx.fillText(p.toFixed(isMobile ? 5 : 6), W - 6, y)
        }
      }

      const bw = Math.max(1, Math.round(scaleX * 0.72))

      ctx.save()

      for (let i = Math.max(0, firstIdx); i < Math.min(cands.length, lastIdx); i++) {
        const c = cands[i]
        const x = Math.round(worldX(i))
        const yO = priceToY(c.o, min, max, H)
        const yC = priceToY(c.c, min, max, H)
        const yH = priceToY(c.h, min, max, H)
        const yL = priceToY(c.l, min, max, H)
        const bull = c.c >= c.o
        const color = bull ? bullColor : bearColor

        ctx.strokeStyle = color
        ctx.fillStyle = color

        // Wick
        ctx.beginPath()
        ctx.moveTo(x + bw / 2, yH)
        ctx.lineTo(x + bw / 2, yL)
        ctx.stroke()

        // Body
        const top = Math.min(yO, yC)
        const h = Math.max(1, Math.abs(yO - yC))
        ctx.fillRect(x, top, bw, h)
      }

      ctx.restore()

      if (!dragging) {
        const rtIndex = cands.length - 1
        const lastCandle = cands[rtIndex]
        const xRT = Math.round(worldX(rtIndex) + bw / 2) + 0.5
        const yPriceLineExact = priceToY(lastCandle.c, min, max, H)

        ctx.strokeStyle = lineColor + "80"
        ctx.lineWidth = 1
        ctx.setLineDash([4, 4])
        ctx.beginPath()
        ctx.moveTo(xRT, 0)
        ctx.lineTo(xRT, H)
        ctx.stroke()
        ctx.setLineDash([])

        // Timer
        const tfMs = timeframe * 1000
        const nowMs = Date.now()
        const elapsed = nowMs - lastCandle.t
        const remaining = Math.max(0, tfMs - elapsed)
        const remainingSec = Math.ceil(remaining / 1000)
        const mm = Math.floor(remainingSec / 60)
        const ss = remainingSec % 60
        const timerText = `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`

        const timerWidth = isMobile ? 50 : 60
        const timerHeight = isMobile ? 20 : 24
        const offsetRight = isMobile ? 30 : 40
        const timerX = Math.max(10, Math.min(W - timerWidth - 10, xRT + offsetRight))
        const timerY = Math.round(yPriceLineExact - timerHeight / 2)

        // Linha horizontal
        ctx.strokeStyle = lineColor
        ctx.lineWidth = isMobile ? 1.5 : 2
        ctx.beginPath()
        ctx.moveTo(0, Math.round(yPriceLineExact) + 0.5)
        ctx.lineTo(W, Math.round(yPriceLineExact) + 0.5)
        ctx.stroke()

        // Timer box
        ctx.fillStyle = "hsl(210 13% 9%)"
        ctx.fillRect(timerX, timerY, timerWidth, timerHeight)
        ctx.strokeStyle = "hsl(210 12% 15%)"
        ctx.lineWidth = 1
        ctx.strokeRect(timerX, timerY, timerWidth, timerHeight)

        ctx.fillStyle = "hsl(210 10% 95%)"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.font = isMobile ? "bold 11px sans-serif" : "bold 12px sans-serif"
        ctx.fillText(timerText, timerX + timerWidth / 2, timerY + timerHeight / 2)
      }

      const orderThrottle = 500
      const candsChanged = cands.length !== lastCandsLength
      if ((timestamp - lastOrderUpdateRef.current > orderThrottle || candsChanged) && !dragging) {
        lastOrderUpdateRef.current = timestamp
        lastCandsLength = cands.length
        updateOrderPositions(cands, min, max, H, W)
      }

      frameCountRef.current++
      animationId = requestAnimationFrame(draw)
    }

    animationId = requestAnimationFrame(draw)

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
    }
  }, [
    engine,
    timeframe,
    scaleX,
    translateX,
    follow,
    orders,
    dragging,
    worldX,
    invWorldX,
    priceToY,
    updateOrderPositions,
  ])

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      const mouseX = e.nativeEvent.offsetX
      const prev = scaleX
      const f = e.deltaY < 0 ? 1.12 : 1 / 1.12
      const newScale = clamp(scaleX * f, minScaleX, maxScaleX)
      setScaleX(newScale)
      const newTx = mouseX - (mouseX - translateX) * (newScale / prev)
      setTranslateX(newTx)
      followTranslateRef.current = newTx
    },
    [scaleX, translateX, clamp],
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      setDragging(true)
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
      setDragStartX(clientX)
      setDragStartTX(translateX)
      setFollow(false)

      if ("touches" in e) {
        touchStartRef.current = { x: clientX, time: Date.now() }
      }
    },
    [translateX],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!dragging || !engine || !canvasRef.current) return

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
      const canvas = canvasRef.current
      const cands = engine.buildCandles(timeframe)
      const newTranslateX = dragStartTX + (clientX - dragStartX)

      const bw = Math.max(1, Math.round(scaleX * 0.72))
      const maxTranslateX = canvas.clientWidth - bw
      const minTranslateX = -((cands.length - 1) * scaleX)

      const limited = Math.max(minTranslateX, Math.min(maxTranslateX, newTranslateX))
      setTranslateX(limited)
      followTranslateRef.current = limited
    },
    [dragging, engine, timeframe, dragStartTX, dragStartX, scaleX],
  )

  const handleMouseUp = useCallback(() => {
    setDragging(false)
    touchStartRef.current = null
  }, [])

  const handleFollowClick = useCallback(() => {
    setFollow(true)
    centerOnLatest()
  }, [centerOnLatest])

  return (
    <div className="relative flex-1 bg-[var(--chart-bg)] overflow-hidden">
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
          onClick={handleFollowClick}
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
            willChange: "transform",
            transform: "translateZ(0)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
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
