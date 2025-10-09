"use client"

import { useEffect, useState } from "react"
import { TradingChart, type Order } from "@/components/TradingChart"
import { TradingSidebar } from "@/components/TradingSidebar"
import { MobileTradingPanel } from "@/components/MobileTradingPanel"
import { SymbolEngine } from "@/lib/tradingEngine"
import { SIM_CONFIG, SYMBOLS } from "@/config/symbols"
import { toast } from "sonner"

const TF_SPEED: Record<number, number> = { 5: 6, 10: 4, 15: 3, 30: 2, 60: 1, 300: 0.6 }
const HEART_MS = 80

const Index = () => {
  const [engines] = useState(() => {
    const map = new Map<string, SymbolEngine>()
    SYMBOLS.forEach((s) => map.set(s.id, new SymbolEngine(s, SIM_CONFIG.keepHistoryMs)))
    return map
  })

  const [activeSymbol, setActiveSymbol] = useState(() => {
    const highestPayoutSymbol = SYMBOLS.reduce((prev, curr) => (curr.payout > prev.payout ? curr : prev))
    return highestPayoutSymbol.id
  })
  const [timeframe, setTimeframe] = useState(SIM_CONFIG.defaultTimeframe)
  const [balance, setBalance] = useState(() => {
    return Number.parseFloat(localStorage.getItem("saldo_v8") || "10000")
  })
  const [ordersOpen, setOrdersOpen] = useState<Order[]>(() => {
    return JSON.parse(localStorage.getItem("ordersOpen_v8") || "[]")
  })
  const [ordersHist, setOrdersHist] = useState<any[]>(() => {
    return JSON.parse(localStorage.getItem("ordersHist_v8") || "[]")
  })

  const currentEngine = engines.get(activeSymbol) || null
  const currentSymbol = SYMBOLS.find((s) => s.id === activeSymbol) || null

  const createOrderVisual = (order: Order) => {
    const eng = engines.get(order.sym)
    if (!eng) return

    const cands = eng.buildCandles(timeframe)
    const candleIndex = cands.length - 1

    order.relX = candleIndex
    order.relY = order.strike

    const line = document.createElement("div")
    line.className = `absolute h-0.5 pointer-events-none rounded ${
      order.tipo === "CALL" ? "bg-[hsl(var(--bull))]" : "bg-[hsl(var(--bear))]"
    }`
    line.id = `line_${order.id}`
    line.setAttribute("data-start-x", String(candleIndex))
    line.setAttribute("data-end-time", String(order.endTimeMs))
    line.setAttribute("data-tf-sec", String(order.tfSec))
    document.getElementById("overlay")?.appendChild(line)

    const startCircle = document.createElement("div")
    startCircle.className = `absolute w-3 h-3 rounded-full pointer-events-none transform -translate-x-1/2 -translate-y-1/2 ${
      order.tipo === "CALL" ? "bg-[hsl(var(--bull))]" : "bg-[hsl(var(--bear))]"
    }`
    startCircle.id = `circle_start_${order.id}`
    document.getElementById("overlay")?.appendChild(startCircle)

    const endCircle = document.createElement("div")
    endCircle.className = `absolute w-3 h-3 rounded-full pointer-events-none transform -translate-x-1/2 -translate-y-1/2 ${
      order.tipo === "CALL" ? "bg-[hsl(var(--bull))]" : "bg-[hsl(var(--bear))]"
    }`
    endCircle.id = `circle_end_${order.id}`
    document.getElementById("overlay")?.appendChild(endCircle)

    const badge = document.createElement("div")
    badge.className = `absolute flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-white text-sm whitespace-nowrap transform -translate-y-1/2 shadow-lg pointer-events-auto ${
      order.tipo === "CALL" ? "bg-[hsl(var(--bull))]" : "bg-[hsl(var(--bear))]"
    }`
    badge.id = `ord_${order.id}`

    const arrowIcon =
      order.tipo === "CALL"
        ? '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 3L8 13M8 3L4 7M8 3L12 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        : '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 13L8 3M8 13L12 9M8 13L4 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'

    badge.innerHTML = `
      ${arrowIcon}
      <span class="font-bold">${order.valor.toFixed(2).replace(".", ",")} R$</span>
      <span class="timer font-semibold opacity-90"> • 00:00</span>
    `
    badge.setAttribute("data-symbol", order.sym)
    document.getElementById("overlay")?.appendChild(badge)
  }

  const resolveOrderGroup = (orders: Order[]) => {
    const eng = engines.get(orders[0].sym)
    if (!eng) return

    const closeCandlePrice = eng.closePriceAt(orders[0].endTimeMs, orders[0].tfSec, -3)
    const closePrice = closeCandlePrice !== null ? closeCandlePrice : eng.price

    const symbol = SYMBOLS.find((s) => s.id === orders[0].sym)
    const payoutPct = (symbol?.payout || 80) / 100

    let totalPnL = 0
    let winCount = 0
    let lossCount = 0

    const lastOrder = orders[orders.length - 1]
    const lastBadgeEl = document.getElementById(`ord_${lastOrder.id}`)
    const savedLeft = lastBadgeEl?.style.left || "0px"
    const savedTop = lastBadgeEl?.style.top || "0px"
    const savedTransform = lastBadgeEl?.style.transform || ""

    orders.forEach((order) => {
      const ganhou = order.tipo === "CALL" ? closePrice > order.strike : closePrice < order.strike
      const pl = ganhou ? +(order.valor * payoutPct).toFixed(2) : -order.valor
      totalPnL += pl

      if (ganhou) {
        winCount++
        setBalance((prev) => prev + order.valor + order.valor * payoutPct)
      } else {
        lossCount++
      }

      setOrdersHist((prev) => [...prev, { ...order, close: closePrice, ganhou, pl }])

      const lineEl = document.getElementById(`line_${order.id}`)
      const badgeEl = document.getElementById(`ord_${order.id}`)
      const startCircle = document.getElementById(`circle_start_${order.id}`)
      const endCircle = document.getElementById(`circle_end_${order.id}`)
      lineEl?.remove()
      badgeEl?.remove()
      startCircle?.remove()
      endCircle?.remove()
    })

    const badge = document.createElement("div")
    const isMobile = window.innerWidth < 768

    if (isMobile) {
      badge.className = `px-4 py-2.5 rounded-full font-bold text-white text-sm whitespace-nowrap shadow-lg flex items-center gap-2 ${
        totalPnL >= 0
          ? "bg-gradient-to-r from-[hsl(var(--bull))] to-[hsl(var(--bull))]/90"
          : "bg-gradient-to-r from-[hsl(var(--bear))] to-[hsl(var(--bear))]/90"
      }`
      const sign = totalPnL >= 0 ? "✅" : "❌"
      const resultText = totalPnL >= 0 ? "WIN" : "LOSS"
      badge.innerHTML = `${sign} ${resultText} ${totalPnL >= 0 ? "+" : "-"}R$ ${Math.abs(totalPnL).toFixed(2)}`

      const mobileContainer = document.getElementById("mobile-notifications")
      if (mobileContainer) {
        mobileContainer.appendChild(badge)
        setTimeout(() => badge.remove(), 3500)
      }
    } else {
      badge.className = `absolute px-3 py-2 rounded-full font-bold text-white text-sm whitespace-nowrap shadow-lg ${
        totalPnL >= 0
          ? "bg-gradient-to-r from-[hsl(var(--bull))] to-[hsl(var(--bull))]/90"
          : "bg-gradient-to-r from-[hsl(var(--bear))] to-[hsl(var(--bear))]/90"
      }`
      badge.id = `res_group_${lastOrder.id}`
      badge.style.left = savedLeft
      badge.style.top = savedTop
      badge.style.transform = savedTransform
      badge.style.pointerEvents = "none"
      const sign = totalPnL >= 0 ? "+" : ""
      badge.innerHTML = `${orders.length}x Resultado • ${sign}${totalPnL.toFixed(2)} R$`

      document.getElementById("overlay")?.appendChild(badge)
      setTimeout(() => badge.remove(), 3500)
    }
  }

  const resolveOrder = (order: Order) => {
    const eng = engines.get(order.sym)
    if (!eng) return

    const closeCandlePrice = eng.closePriceAt(order.endTimeMs, order.tfSec, -3)
    const closePrice = closeCandlePrice !== null ? closeCandlePrice : eng.price

    const symbol = SYMBOLS.find((s) => s.id === order.sym)
    const payoutPct = (symbol?.payout || 80) / 100

    const ganhou = order.tipo === "CALL" ? closePrice > order.strike : closePrice < order.strike
    const pl = ganhou ? +(order.valor * payoutPct).toFixed(2) : -order.valor

    setOrdersHist((prev) => [...prev, { ...order, close: closePrice, ganhou, pl }])

    if (ganhou) {
      setBalance((prev) => prev + order.valor + order.valor * payoutPct)
    }

    const lineEl = document.getElementById(`line_${order.id}`)
    const badgeEl = document.getElementById(`ord_${order.id}`)
    const startCircle = document.getElementById(`circle_start_${order.id}`)
    const endCircle = document.getElementById(`circle_end_${order.id}`)
    
    const savedLeft = badgeEl?.style.left || "0px"
    const savedTop = badgeEl?.style.top || "0px"
    
    lineEl?.remove()
    badgeEl?.remove()
    startCircle?.remove()
    endCircle?.remove()

    const isMobile = window.innerWidth < 768

    if (isMobile) {
      const badge = document.createElement("div")
      badge.className = `px-4 py-2.5 rounded-full font-bold text-white text-sm whitespace-nowrap shadow-lg flex items-center gap-2 ${
        pl >= 0
          ? "bg-gradient-to-r from-[hsl(var(--bull))] to-[hsl(var(--bull))]/90"
          : "bg-gradient-to-r from-[hsl(var(--bear))] to-[hsl(var(--bear))]/90"
      }`
      const sign = pl >= 0 ? "✅" : "❌"
      const resultText = pl >= 0 ? "WIN" : "LOSS"
      badge.innerHTML = `${sign} ${resultText} ${pl >= 0 ? "+" : "-"}R$ ${Math.abs(pl).toFixed(2)}`

      const mobileContainer = document.getElementById("mobile-notifications")
      if (mobileContainer) {
        mobileContainer.appendChild(badge)
        setTimeout(() => badge.remove(), 3500)
      }
    } else {
      const badge = document.createElement("div")
      badge.className = `absolute px-3 py-2 rounded-full font-bold text-white text-sm whitespace-nowrap transform -translate-x-1/2 -translate-y-1/2 shadow-lg ${
        pl >= 0
          ? "bg-gradient-to-r from-[hsl(var(--bull))] to-[hsl(var(--bull))]/90"
          : "bg-gradient-to-r from-[hsl(var(--bear))] to-[hsl(var(--bear))]/90"
      }`
      badge.id = `res_${order.id}`
      const sign = pl >= 0 ? "+" : ""
      badge.innerHTML = `Resultado • ${sign}${pl.toFixed(2)} R$`
      badge.style.left = savedLeft
      badge.style.top = savedTop
      badge.style.pointerEvents = "none"

      document.getElementById("overlay")?.appendChild(badge)
      setTimeout(() => badge.remove(), 3500)
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      engines.forEach((eng) => {
        const speed = eng.sym.id === activeSymbol ? TF_SPEED[timeframe] || 1 : 1
        eng.step(now, speed)
      })
    }, HEART_MS)

    return () => clearInterval(interval)
  }, [engines, activeSymbol, timeframe])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()

      setOrdersOpen((prev) => {
        const remaining: Order[] = []
        const ordersToResolve: Order[] = []

        prev.forEach((order) => {
          const el = document.getElementById(`ord_${order.id}`)
          if (el) {
            const remain = Math.max(0, Math.ceil((order.endTimeMs - now) / 1000))
            const mm = Math.floor(remain / 60)
            const ss = remain % 60
            const timerText = `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`
            const mutEl = el.querySelector(".timer")
            if (mutEl) mutEl.textContent = ` • ${timerText}`
          }

          if (now >= order.endTimeMs) {
            ordersToResolve.push(order)
          } else {
            remaining.push(order)
          }
        })

        if (ordersToResolve.length > 0) {
          const groupedOrders = new Map<string, Order[]>()

          ordersToResolve.forEach((order) => {
            const key = `${order.sym}_${order.endTimeMs}`
            if (!groupedOrders.has(key)) {
              groupedOrders.set(key, [])
            }
            groupedOrders.get(key)!.push(order)
          })

          groupedOrders.forEach((orders) => {
            if (orders.length > 1) {
              resolveOrderGroup(orders)
            } else {
              resolveOrder(orders[0])
            }
          })
        }

        return remaining
      })
    }, 300)

    return () => clearInterval(interval)
  }, [engines])

  useEffect(() => {
    localStorage.setItem("saldo_v8", String(balance))
    localStorage.setItem("ordersOpen_v8", JSON.stringify(ordersOpen))
    localStorage.setItem("ordersHist_v8", JSON.stringify(ordersHist))
  }, [balance, ordersOpen, ordersHist])

  useEffect(() => {
    ordersOpen.forEach((order) => {
      document.getElementById(`line_${order.id}`)?.remove()
      document.getElementById(`ord_${order.id}`)?.remove()
      document.getElementById(`circle_start_${order.id}`)?.remove()
      document.getElementById(`circle_end_${order.id}`)?.remove()
    })

    ordersOpen.forEach((order) => {
      createOrderVisual(order)
    })
  }, [timeframe])

  const handleTrade = (type: "CALL" | "PUT", amount: number, expirationSec: number) => {
    if (!isFinite(amount) || amount <= 0) {
      toast.error("Valor inválido")
      return
    }
    if (amount > balance) {
      toast.error("Saldo insuficiente")
      return
    }

    const eng = currentEngine
    if (!eng) return

    const strike = eng.price
    const nowMs = Date.now()
    const tfMs = expirationSec * 1000
    const endBucketStart = Math.floor((nowMs + -3 * 3600 * 1000) / tfMs) * tfMs - -3 * 3600 * 1000
    const endTimeMs = endBucketStart + tfMs

    const order: Order = {
      id: Date.now(),
      sym: activeSymbol,
      tipo: type,
      valor: amount,
      strike,
      endTimeMs,
      tfSec: expirationSec,
    }

    setOrdersOpen((prev) => [...prev, order])
    setBalance((prev) => prev - amount)
    createOrderVisual(order)

    toast.success(`Ordem ${type} aberta: R$ ${amount.toFixed(2)}`)
  }

  const handleNewSeed = () => {
    engines.forEach((eng) => {
      eng.seed = Math.floor(Math.random() * 1e9)
      eng.ticks = []
      eng.price = eng.sym.initialPrice
      eng.lastTick = Date.now()
    })
    toast.info("Novo seed gerado")
  }

  const handleReset = () => {
    if (confirm("Apagar todos os dados locais?")) {
      localStorage.clear()
      window.location.reload()
    }
  }

  return (
    <div className="flex flex-col h-screen bg-white text-black overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:block">
          <TradingSidebar
            balance={balance}
            onTrade={handleTrade}
            onNewSeed={handleNewSeed}
            onReset={handleReset}
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
            history={ordersHist}
          />
        </div>

        <TradingChart
          engine={currentEngine}
          timeframe={timeframe}
          symbol={currentSymbol}
          orders={ordersOpen}
          onUpdateOrderVisuals={() => {}}
          symbols={SYMBOLS}
          activeSymbol={activeSymbol}
          onSelectSymbol={setActiveSymbol}
          engines={engines}
          onTimeframeChange={setTimeframe}
        />
      </div>

      <MobileTradingPanel
        symbols={SYMBOLS}
        activeSymbol={activeSymbol}
        onSelectSymbol={setActiveSymbol}
        balance={balance}
        onTrade={handleTrade}
      />
    </div>
  )
}

export default Index