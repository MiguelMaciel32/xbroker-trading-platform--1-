"use client"

import type React from "react"
import { useState } from "react"

export default function DepositPage() {
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [currentStep, setCurrentStep] = useState("methods")
  const [selectedAmount, setSelectedAmount] = useState(60)
  const [customAmount, setCustomAmount] = useState("")
  const [showPixModal, setShowPixModal] = useState(false)

  const predefinedAmounts = [60, 250, 1000, 2000, 100, 500, 1500, 4000]

  const cryptoOptions = [
    {
      name: "Bitcoin (BTC)",
      icon: "https://aurumtraderbroker.site/Bitcoin-Logo.png",
      time: "5-60 min",
      color: "#030507ff",
    },
    { name: "Ethereum (ETH)", icon: "https://aurumtraderbroker.site/eth_w.webp", time: "5-60 min", color: "#030507ff" },
    { name: "Cardano (ADA)", icon: "https://aurumtraderbroker.site/cardano.png", time: "5-60 min", color: "#030507ff" },
    {
      name: "Litecoin (LTC)",
      icon: "https://aurumtraderbroker.site/litecoin.png",
      time: "5-60 min",
      color: "#030507ff",
    },
    {
      name: "Binance Coin (BNB)",
      icon: "https://aurumtraderbroker.site/1681906406binance-icon-png.png",
      time: "5-60 min",
      color: "#030507ff",
    },
    {
      name: "DogeCoin",
      icon: "https://aurumtraderbroker.site/hd-dogecoin-logo-icon-coin-png-701751694779734rtff9rbuve.png",
      time: "5-60 min",
      color: "#030507ff",
    },
  ]

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount)
    setCustomAmount(amount.toString())
  }

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "")
    setCustomAmount(value)
    setSelectedAmount(Number.parseInt(value) || 0)
  }

  const handleContinueToPayment = () => {
    if (agreedToTerms && selectedAmount > 0) {
      setShowPixModal(true)
    }
  }

  const copyPixCode = async () => {
    const pixCode =
      "00020101021226870014br.gov.bcb.pix2565qrcode.santsbank.com/dynamic/5a99982d-f8b9-4da3-910c-7b6aeeaac1645204000053039865802BR5910PIXUP LTDA6009Sao Paulo62070503***6304C311"
    try {
      await navigator.clipboard.writeText(pixCode)
    } catch (err) {
      console.error("Failed to copy PIX code:", err)
    }
  }

  return (
    <div className="min-h-screen bg-[#141d2f] text-white">
      <div className="container mx-auto px-4 py-8">
        {currentStep !== "methods" && (
          <div className="mb-6">
            <div className="text-sm text-[#848E9C]">
              <span className="cursor-pointer hover:text-white" onClick={() => setCurrentStep("methods")}>
                Método de pagamento
              </span>
              {currentStep === "pix-form" && (
                <>
                  <span className="mx-2">›</span>
                  <span className="text-white font-medium">PIX</span>
                </>
              )}
            </div>
          </div>
        )}

        <div className="max-w-2xl mx-auto">
          {currentStep === "methods" && (
            <div>
              <h1 className="text-2xl font-semibold text-white mb-8">Método de pagamento</h1>

              <div className="mb-8">
                <div className="text-[#848E9C] text-sm mb-4">Recomendado</div>
                <div
                  className="bg-[#101825] p-6 rounded-lg cursor-pointer hover:bg-[#1a2332] transition-colors border border-transparent hover:border-[#26d47c]"
                  onClick={() => setCurrentStep("pix-form")}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-2">
                      <img
                        src="https://aurumtraderbroker.site/pix.png"
                        alt="PIX"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-semibold text-lg">PIX</div>
                      <div className="text-[#26d47c] text-sm font-medium">Instantâneo</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[#848E9C] text-sm mb-4">Depósito com criptomoeda</div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cryptoOptions.map((crypto, index) => (
                    <div key={index} className="bg-[#101825] p-6 rounded-lg opacity-50 cursor-not-allowed">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: crypto.color }}
                        >
                          <img
                            src={crypto.icon || "/placeholder.svg"}
                            alt={crypto.name}
                            className="w-8 h-8 object-contain"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-semibold">{crypto.name}</div>
                          <div className="text-[#848E9C] text-sm">{crypto.time}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === "pix-form" && (
            <div className="bg-[#101825] rounded-lg p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-2">
                  <img
                    src="https://aurumtraderbroker.site/pix.png"
                    alt="PIX"
                    className="w-full h-full object-contain"
                  />
                </div>
                <h2 className="text-2xl font-bold text-white">PIX</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-3">Valor</label>
                  <input
                    type="text"
                    value={customAmount ? `R$ ${customAmount}` : `R$ ${selectedAmount}`}
                    onChange={handleCustomAmountChange}
                    className="w-full p-3 bg-[#1a2332] border border-[#2B3139] text-white rounded-lg focus:border-[#26d47c] focus:outline-none"
                    placeholder="R$ 0,00"
                  />
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {predefinedAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => handleAmountSelect(amount)}
                      className={`py-3 px-4 rounded-lg border transition-colors ${
                        selectedAmount === amount
                          ? "bg-[#26d47c] text-black border-[#26d47c] font-semibold"
                          : "bg-[#2a3441] text-white border-[#2B3139] hover:border-[#26d47c]"
                      }`}
                    >
                      R$ {amount.toLocaleString()}
                    </button>
                  ))}
                </div>

                <label className="flex items-start gap-3 mt-8">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-[#26d47c] bg-transparent border-2 border-[#848E9C] focus:ring-[#26d47c] focus:ring-2 rounded"
                  />
                  <span className="text-[#848E9C] text-sm">Eu, por meio deste, aceito os Termos e Condições</span>
                </label>

                <div className="flex gap-4 pt-6">
                  <button
                    onClick={() => setCurrentStep("methods")}
                    className="px-8 py-3 bg-transparent border border-[#2B3139] text-white rounded-lg hover:bg-[#2a3441] transition-colors"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleContinueToPayment}
                    disabled={!agreedToTerms || selectedAmount === 0}
                    className={`flex-1 py-3 px-8 rounded-lg font-semibold transition-colors ${
                      agreedToTerms && selectedAmount > 0
                        ? "bg-[#26d47c] text-black hover:bg-[#22c55e]"
                        : "bg-[#2B3139] text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Seguir para pagamento
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {showPixModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#101825] rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Depósito via PIX</h2>
                <button onClick={() => setShowPixModal(false)} className="text-[#848E9C] hover:text-white text-2xl">
                  ✕
                </button>
              </div>

              <div className="bg-[#2a3441] p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-white">Aurum Broker</span>
                  <span className="text-white font-semibold">
                    Valor: R$ {selectedAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="flex justify-center mb-6">
                <div className="bg-white p-4 rounded-lg">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=00020101021226870014br.gov.bcb.pix2565qrcode.santsbank.com%2Fdynamic%2F5a99982d-f8b9-4da3-910c-7b6aeeaac1645204000053039865802BR5910PIXUP+LTDA6009Sao+Paulo62070503%2A%2A%2A6304C311`}
                    alt="QR Code PIX"
                    className="w-[220px] h-[220px]"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-[#2a3441] p-4 rounded-lg">
                  <div className="text-xs text-[#848E9C] font-mono break-all mb-3">
                    00020101021226870014br.gov.bcb.pix2565qrcode.santsbank.com/dynamic/5a99982d-f8b9-4da3-910c-7b6aeeaac1645204000053039865802BR5910PIXUP
                    LTDA6009Sao Paulo62070503***6304C311
                  </div>
                  <button
                    onClick={copyPixCode}
                    className="w-full py-2 bg-transparent border border-[#2B3139] text-white rounded hover:bg-[#2B3139] transition-colors"
                  >
                    Copiar Código
                  </button>
                </div>

                <p className="text-center text-[#848E9C] text-sm">
                  Abra seu banco, escolha PIX → Pagar com QR Code ou Copia e Cola.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
