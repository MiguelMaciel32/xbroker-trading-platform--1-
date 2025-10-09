"use client"

import type { SymbolConfig } from "@/config/symbols"

interface Order {
  id: number
  sym: string
  tipo: "CALL" | "PUT"
  valor: number
  strike: number
  endTimeMs: number
  tfSec: number
}

interface SymbolPillsProps {
  symbols: SymbolConfig[]
  activeSymbol: string
  onSelectSymbol: (symbolId: string) => void
  orders: Order[]
  engines: Map<string, any>
}

export const SymbolPills = ({ symbols, activeSymbol, onSelectSymbol, orders, engines }: SymbolPillsProps) => {
  return (
    <div className="flex gap-2 flex-wrap">
      {symbols.map((symbol) => {
        const isActive = activeSymbol === symbol.id
        const engine = engines.get(symbol.id)
        const price = engine?.price || symbol.initialPrice

        return (
          <button
            key={symbol.id}
            onClick={() => onSelectSymbol(symbol.id)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              isActive ? "bg-blue-600 text-white" : "bg-[#172133] text-gray-300 hover:bg-[#2B3139]"
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{symbol.name}</span>
              <span className="text-xs opacity-75">{price.toFixed(symbol.id.includes("EUR") ? 4 : 2)}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
