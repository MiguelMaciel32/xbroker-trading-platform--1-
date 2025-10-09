export interface Candle {
  t: number // timestamp
  o: number // open
  h: number // high
  l: number // low
  c: number // close
  v: number // volume
}

interface Tick {
  t: number
  p: number
}

export interface SymbolConfig {
  id: string
  name: string
  initialPrice: number
  volatility: number
  payout: number
}

export class SymbolEngine {
  public sym: SymbolConfig
  public seed: number
  public ticks: Tick[] = []
  public price: number
  public lastTick: number
  private keepMs: number

  constructor(sym: SymbolConfig, keepMs = 3600000) {
    this.sym = sym
    this.seed = Math.floor(Math.random() * 1e9)
    this.price = sym.initialPrice
    this.lastTick = Date.now()
    this.keepMs = keepMs

    this.generateHistoricalData()
  }

  private generateHistoricalData() {
    const now = Date.now()
    const historyDuration = Math.min(this.keepMs, 3600000) // 1 hour max
    const startTime = now - historyDuration
    const tickInterval = 100 // Generate a tick every 100ms

    let currentPrice = this.price
    let currentTime = startTime

    while (currentTime <= now) {
      this.seed++
      const r = this.rng(this.seed)
      const change = (r - 0.5) * this.sym.volatility * 0.0001
      currentPrice = Math.max(0.01, currentPrice + change)
      this.ticks.push({ t: currentTime, p: currentPrice })
      currentTime += tickInterval
    }

    this.price = currentPrice
    this.lastTick = now
  }

  private rng(seed: number): number {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
  }

  public step(nowMs = Date.now(), speed = 1) {
    const dt = nowMs - this.lastTick
    if (dt < 80) return

    const steps = Math.floor((dt / 80) * speed)
    for (let i = 0; i < steps; i++) {
      this.seed++
      const r = this.rng(this.seed)
      const change = (r - 0.5) * this.sym.volatility * 0.0001
      this.price = Math.max(0.01, this.price + change)
      this.ticks.push({ t: nowMs, p: this.price })
    }

    this.lastTick = nowMs

    // Cleanup old ticks
    const cutoff = nowMs - this.keepMs
    this.ticks = this.ticks.filter((tick) => tick.t > cutoff)
  }

  public buildCandles(tfSec: number, tzOffsetHours = 0): Candle[] {
    if (this.ticks.length === 0) return []

    const tfMs = tfSec * 1000
    const tzMs = tzOffsetHours * 3600 * 1000
    const now = Date.now()
    const firstT = this.ticks[0].t

    const firstBucket = Math.floor((firstT + tzMs) / tfMs) * tfMs - tzMs
    const lastBucket = Math.floor((now + tzMs) / tfMs) * tfMs - tzMs

    const candles: Candle[] = []

    for (let bucketStart = firstBucket; bucketStart <= lastBucket; bucketStart += tfMs) {
      const bucketEnd = bucketStart + tfMs
      const bucketTicks = this.ticks.filter((t) => t.t >= bucketStart && t.t < bucketEnd)

      if (bucketTicks.length === 0) continue

      const o = bucketTicks[0].p
      const c = bucketTicks[bucketTicks.length - 1].p
      const h = Math.max(...bucketTicks.map((t) => t.p))
      const l = Math.min(...bucketTicks.map((t) => t.p))

      candles.push({ t: bucketStart, o, h, l, c, v: bucketTicks.length })
    }

    return candles
  }

  public closePriceAt(timeMs: number, tfSec: number, tzOffsetHours = 0): number | null {
    const tfMs = tfSec * 1000
    const tzMs = tzOffsetHours * 3600 * 1000
    const bucketStart = Math.floor((timeMs + tzMs) / tfMs) * tfMs - tzMs
    const bucketEnd = bucketStart + tfMs

    const bucketTicks = this.ticks.filter((t) => t.t >= bucketStart && t.t < bucketEnd)
    if (bucketTicks.length === 0) return null

    return bucketTicks[bucketTicks.length - 1].p
  }
}
