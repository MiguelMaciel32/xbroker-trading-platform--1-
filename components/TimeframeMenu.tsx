"use client"

import { useState } from "react"
import { MoreHorizontal } from "lucide-react"

interface TimeframeMenuProps {
  timeframe: number
  onTimeframeChange: (tf: number) => void
}

const TIMEFRAMES = [
  { value: 5, label: "5s" },
  { value: 10, label: "10s" },
  { value: 15, label: "15s" },
  { value: 30, label: "30s" },
  { value: 60, label: "1m" },
  { value: 300, label: "5m" },
]

export const TimeframeMenu = ({ timeframe, onTimeframeChange }: TimeframeMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden w-12 h-12 rounded-lg flex items-center justify-center transition-colors bg-card/80 backdrop-blur-sm border border-border hover:bg-muted"
      >
        <MoreHorizontal className="w-6 h-6" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />

          {/* Modal */}
          <div className="md:hidden fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-card rounded-lg border border-border shadow-xl">
            <div className="p-3 grid grid-cols-3 gap-2">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf.value}
                  onClick={() => {
                    onTimeframeChange(tf.value)
                    setIsOpen(false)
                  }}
                  className={`px-4 py-3 rounded-lg font-bold text-sm transition-colors ${
                    timeframe === tf.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Desktop inline buttons */}
      <div className="hidden md:block bg-[#172133] rounded-lg p-2 border border-[#2B3139]">
        <div className="flex gap-1">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.value}
              onClick={() => onTimeframeChange(tf.value)}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                timeframe === tf.value ? "bg-blue-600 text-white" : "bg-[#2B3139] text-gray-300 hover:bg-[#1E2329]"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
