"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TradingSidebarProps {
  balance: number
  onTrade: (type: "CALL" | "PUT", amount: number, expiration: number) => void
  onNewSeed: () => void
  onReset: () => void
  timeframe: number
  onTimeframeChange: (tf: number) => void
  history: any[]
}

const TIMEFRAMES = [
  { value: 301, label: "5s" },
  { value: 10, label: "10s" },
  { value: 15, label: "15s" },
  { value: 30, label: "30s" },
  { value: 60, label: "1m" },
  { value: 300, label: "5m" },
]

export const TradingSidebar = ({
  balance,
  onTrade,
  onNewSeed,
  onReset,
  timeframe,
  onTimeframeChange,
  history,
}: TradingSidebarProps) => {
  const [amount, setAmount] = useState(100)
  const [expiration, setExpiration] = useState("15")

  const handleTrade = (type: "CALL" | "PUT") => {
    onTrade(type, amount, Number.parseInt(expiration))
  }

  return (
    <aside className="w-80 bg-card border-r border-border p-4 overflow-y-auto">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold mb-3">Timeframe</h3>
          <div className="grid grid-cols-3 gap-2">
            {TIMEFRAMES.map((tf) => (
              <Button
                key={tf.value}
                variant={timeframe === tf.value ? "default" : "outline"}
                size="sm"
                onClick={() => onTimeframeChange(tf.value)}
                className="font-semibold"
              >
                {tf.label}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Atalhos: 1–6 (timeframe) • +/- zoom</p>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-3">Paper Trading</h3>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Saldo:</span>
            <strong className="text-lg">R$ {balance.toFixed(2)}</strong>
          </div>

          <div className="space-y-2">
            <Input
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={(e) => setAmount(Number.parseFloat(e.target.value) || 0)}
              placeholder="Valor"
            />

            <Select value={expiration} onValueChange={setExpiration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15s</SelectItem>
                <SelectItem value="30">30s</SelectItem>
                <SelectItem value="60">1m</SelectItem>
                <SelectItem value="120">2m</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <Button onClick={() => handleTrade("CALL")} className="btn-call" size="lg">
              CALL
            </Button>
            <Button onClick={() => handleTrade("PUT")} className="btn-put" size="lg">
              PUT
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-2">
            A expiração é medida em segundos. A operação será resolvida quando o timer chegar a 0.
          </p>
        </div>

       

        <div>
          <h3 className="text-lg font-bold mb-3">Histórico</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {history.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhuma operação ainda</p>
            ) : (
              history
                .slice()
                .reverse()
                .map((h, idx) => (
                  <div key={idx} className="p-2 bg-secondary rounded border border-border text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <strong className="font-semibold">{h.tipo}</strong>
                      <span className={h.ganhou ? "text-[hsl(var(--bull))]" : "text-[hsl(var(--bear))]"}>
                        {h.ganhou ? "WIN" : "LOSS"}
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      {h.sym} • R$ {h.valor.toFixed(2)} → {h.pl > 0 ? "+" : ""}
                      {h.pl.toFixed(2)}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
