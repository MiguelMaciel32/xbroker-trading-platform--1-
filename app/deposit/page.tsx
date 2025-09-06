"use client"

import type React from "react"
import Link from "next/link"
import { CreditCard, ArrowUpDown, User, Plus, Bell, BarChart3, Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export default function DepositPage() {
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [currentStep, setCurrentStep] = useState("methods")
  const [selectedAmount, setSelectedAmount] = useState(60)
  const [customAmount, setCustomAmount] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [showPixModal, setShowPixModal] = useState(false)

  const SITE_CONFIG = {
    platformName: "TradePro",
    logoUrl: "/placeholder.svg?height=32&width=120&text=TradePro",
  }

  const predefinedAmounts = [60, 250, 1000, 2000, 100, 500, 1500, 4000]

  const cryptoOptions = [
    { name: "Bitcoin (BTC)", icon: "https://aurumtraderbroker.site/Bitcoin-Logo.png", time: "5-60 min", color: "#030507ff", },
    {
      name: "Ethereum (ETH)",
      icon: "https://aurumtraderbroker.site/eth_w.webp",
      time: "5-60 min",
      color: "#030507ff",
    },
    { name: "Cardano (ADA)", icon: "https://aurumtraderbroker.site/cardano.png", time: "5-60 min", color: "#030507ff", },
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
    { name: "DogeCoin", icon: "https://aurumtraderbroker.site/hd-dogecoin-logo-icon-coin-png-701751694779734rtff9rbuve.png", time: "5-60 min", color: "#030507ff", },
  ]

  useEffect(() => {
    const supabase = createClient()
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

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
      "aff"
    try {
      await navigator.clipboard.writeText(pixCode)
    } catch (err) {
      console.error("Failed to copy PIX code:", err)
    }
  }

  return (
    <div className="min-h-screen text-white font-sans overflow-x-hidden" style={{ backgroundColor: "#141d2f" }}>
      <div
        className="fixed top-0 left-0 right-0 z-30 border-b px-4 py-3"
        style={{ backgroundColor: "#141d2f", borderColor: "#2B3139" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-6">
            <button
              className="md:hidden p-2 hover:bg-gray-700 rounded"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <img
              src="https://media.discordapp.net/attachments/1191807892936986756/1408228383128551534/Captura_de_Tela_2025-08-21_as_20.16.28-removebg-preview.png?ex=68a8fa62&is=68a7a8e2&hm=527693bc110e80e51760a1cfcc0b1e3a4616517b98b7fcf8a9fffa342ba6f059&=&format=webp&quality=lossless&width=1008&height=990"
              alt={SITE_CONFIG.platformName}
              className="h-6 md:h-8"
            />
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <Bell className="w-4 h-4 md:w-5 md:h-5 text-gray-400 hidden sm:block" />
            <button
              style={{ backgroundColor: "#26d47c", color: "#000000" }}
              className="hover:opacity-90 text-black font-semibold px-2 py-1 md:px-4 md:py-2 text-sm md:text-base flex items-center transition-opacity"
            >
              <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              <span className="hidden sm:inline">Depósito</span>
              <span className="sm:hidden">+</span>
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 pt-16 pb-6 space-y-4" style={{ backgroundColor: "#141d2f" }}>
            <Link
              href="/trading"
              className="flex items-center space-x-3 px-6 py-3 hover:bg-gray-700 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <BarChart3 className="h-5 w-5 text-gray-400" />
              <span className="text-white">Trading</span>
            </Link>
            <Link
              href="/deposit"
              className="flex items-center space-x-3 px-6 py-3 transition-colors"
              style={{ backgroundColor: "#26d47c", color: "#000" }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <CreditCard className="h-5 w-5" />
              <span className="font-medium">Depósito</span>
            </Link>
            <Link
              href="/saque"
              className="flex items-center space-x-3 px-6 py-3 hover:bg-gray-700 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <ArrowUpDown className="h-5 w-5 text-gray-400" />
              <span className="text-white">Saque</span>
            </Link>
          </div>
        </div>
      )}

      <div className="flex h-screen pt-[70px]">
        <div
          className="hidden lg:block w-16 border-r flex-col items-center py-6 space-y-6 fixed left-0 top-[70px] h-[calc(100vh-70px)] z-20"
          style={{ backgroundColor: "#141d2f", borderColor: "#2B3139" }}
        >
          <Link
            href="/trading"
            className="flex flex-col items-center space-y-1 hover:bg-gray-700 p-3 rounded-lg transition-colors"
          >
            <BarChart3 className="h-6 w-6 text-gray-400" />
          </Link>
          <Link
            href="/deposit"
            className="flex flex-col items-center space-y-1 p-3 rounded-lg transition-colors"
            style={{ backgroundColor: "#26d47c", color: "#000" }}
          >
            <CreditCard className="h-6 w-6" />
          </Link>
          <Link
            href="/saque"
            className="flex flex-col items-center space-y-1 hover:bg-gray-700 p-3 rounded-lg transition-colors"
          >
            <ArrowUpDown className="h-6 w-6 text-gray-400" />
          </Link>
          <div className="flex-1"></div>
          <Link
            href="/account"
            className="flex flex-col items-center space-y-1 hover:bg-gray-700 p-3 rounded-lg transition-colors"
          >
            <User className="h-6 w-6 text-gray-400" />
          </Link>
        </div>

        <div className="flex-1 w-full">
          {currentStep !== "methods" && (
            <div className="px-4 lg:px-6 py-4 text-sm text-gray-400">
              <span className="cursor-pointer hover:text-white" onClick={() => setCurrentStep("methods")}>
                Método de pagamento
              </span>
              {currentStep === "pix-form" && (
                <span>
                  {" "}
                  › <span className="text-white font-semibold">PIX</span>
                </span>
              )}
            </div>
          )}

          <div className="px-4 lg:px-6 py-6">
            {currentStep === "methods" && (
              <div className="max-w-4xl">
                <h1 className="text-2xl font-semibold text-white mb-8">Método de pagamento</h1>

                <div className="mb-8">
                  <div className="text-gray-400 text-sm mb-4">Recomendado</div>
                  <div
                    className="bg-[#101825] p-6 rounded-lg cursor-pointer hover:bg-[#030507ff] transition-colors border border-transparent hover:border-[#26d47c]"
                    onClick={() => setCurrentStep("pix-form")}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-[#030507ff] rounded-lg flex items-center justify-center p-2">
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
                  <div className="text-gray-400 text-sm mb-4">Depósito com criptomoeda</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cryptoOptions.map((crypto, index) => (
                      <div key={index} className="bg-[#101825] p-6 rounded-lg opacity-50 cursor-not-allowed">
                        <div className="flex items-center space-x-4">
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
                            <div className="text-gray-400 text-sm">{crypto.time}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === "pix-form" && (
              <div className="max-w-2xl">
                <div className="bg-[#101825] p-8 rounded-lg">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-2">
                      <img
                        src="https://aurumtraderbroker.site/pix.png"
                        alt="PIX"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <h1 className="text-2xl font-semibold text-white">PIX</h1>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-white text-sm font-medium mb-3">Valor</label>
                      <input
                        type="text"
                        value={customAmount ? `R$ ${customAmount}` : `R$ ${selectedAmount}`}
                        onChange={handleCustomAmountChange}
                        className="w-full px-4 py-3 bg-[#2a3441] border border-[#2B3139] text-white rounded-lg focus:border-[#26d47c] focus:outline-none"
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

                    <label className="flex items-start space-x-3 mt-8">
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-1 w-4 h-4 text-[#26d47c] bg-transparent border-2 border-[#848E9C] focus:ring-[#26d47c] focus:ring-2 rounded"
                      />
                      <span className="text-gray-400 text-sm">Eu, por meio deste, aceito os Termos e Condições</span>
                    </label>

                    <div className="flex space-x-4 pt-6">
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
              </div>
            )}
          </div>
        </div>

        {showPixModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#101825] rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Depósito via PIX</h2>
                <button onClick={() => setShowPixModal(false)} className="text-gray-400 hover:text-white text-2xl">
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
                  <div className="text-xs text-gray-400 font-mono break-all mb-3">
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

                <p className="text-center text-gray-400 text-sm">
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
