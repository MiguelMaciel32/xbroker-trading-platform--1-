"use client"

import { useState, useEffect } from "react"
import { getUserBalance, updateUserBalance } from "@/lib/actions/balance"

export default function DepositPage() {
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [currentStep, setCurrentStep] = useState("methods")
  const [selectedAmount, setSelectedAmount] = useState(60)
  const [customAmount, setCustomAmount] = useState("")
  const [showPixModal, setShowPixModal] = useState(false)
  const [pixData, setPixData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [txid, setTxid] = useState("")
  const [userBalance, setUserBalance] = useState(0)
  const [isLoadingBalance, setIsLoadingBalance] = useState(true)

  const predefinedAmounts = [60, 250, 1000, 2000, 100, 500, 1500, 4000]

  const cryptoOptions = [
    {
      name: "Bitcoin (BTC)",
      icon: "https://aurumtraderbroker.site/Bitcoin-Logo.png",
      time: "5-60 min",
    },
    { 
      name: "Ethereum (ETH)", 
      icon: "https://aurumtraderbroker.site/eth_w.webp", 
      time: "5-60 min",
    },
    { 
      name: "Cardano (ADA)", 
      icon: "https://aurumtraderbroker.site/cardano.png", 
      time: "5-60 min",
    },
    {
      name: "Litecoin (LTC)",
      icon: "https://aurumtraderbroker.site/litecoin.png",
      time: "5-60 min",
    },
    {
      name: "Binance Coin (BNB)",
      icon: "https://aurumtraderbroker.site/1681906406binance-icon-png.png",
      time: "5-60 min",
    },
    {
      name: "DogeCoin",
      icon: "https://aurumtraderbroker.site/hd-dogecoin-logo-icon-coin-png-701751694779734rtff9rbuve.png",
      time: "5-60 min",
    },
  ]

  // Buscar saldo do usuário ao carregar a página
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setIsLoadingBalance(true)
        const result = await getUserBalance()
        
        if (result.success && result.data) {
          setUserBalance(result.data.balance)
        }
      } catch (err) {
        console.error("Erro ao buscar saldo:", err)
      } finally {
        setIsLoadingBalance(false)
      }
    }

    fetchBalance()
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

  const handleContinueToPayment = async () => {
    if (agreedToTerms && selectedAmount > 0) {
      setIsLoading(true)
      setError("")
      
      try {
        const response = await fetch("http://localhost:3001/api/pix", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "token": process.env.NEXT_PUBLIC_CASPERS_API_KEY || ""
          },
          body: JSON.stringify({
            action: "criar",
            nome: "nicolas",
            cpf: "48402124062",
            valor: selectedAmount
          })
        })

        if (!response.ok) {
          throw new Error("Erro ao gerar PIX")
        }

        const data = await response.json()
        setPixData(data)
        setTxid(data.txid)
        setShowPixModal(true)
      } catch (err) {
        setError("Erro ao gerar PIX. Tente novamente.")
        console.error("Error creating PIX:", err)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const copyPixCode = async () => {
    const pixCode = pixData?.pixCopiaECola || ""
    try {
      await navigator.clipboard.writeText(pixCode)
      alert("Código PIX copiado!")
    } catch (err) {
      console.error("Failed to copy PIX code:", err)
    }
  }

  const handlePaymentConfirmed = async () => {
    try {
      // Atualizar o saldo adicionando o valor depositado
      const result = await updateUserBalance({
        balance: selectedAmount,
        operation: "add"
      })

      if (result.success && result.data) {
        setUserBalance(result.data.balance)
        setShowPixModal(false)
        setTxid("")
        setPixData(null)
        setSelectedAmount(60)
        setCustomAmount("")
        setAgreedToTerms(false)
        setCurrentStep("methods")
        
        alert(`Pagamento confirmado! Seu depósito de R$ ${selectedAmount.toFixed(2)} foi processado com sucesso. Novo saldo: R$ ${result.data.balance.toFixed(2)}`)
      }
    } catch (err) {
      console.error("Erro ao atualizar saldo:", err)
      alert("Pagamento confirmado, mas houve um erro ao atualizar o saldo. Por favor, recarregue a página.")
    }
  }

  const checkPaymentStatus = async (txidToCheck: string) => {
    try {
      const response = await fetch("http://localhost:3001/api/pix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "token": process.env.NEXT_PUBLIC_CASPERS_API_KEY || ""
        },
        body: JSON.stringify({
          action: "verificar",
          txid: txidToCheck
        })
      })

      if (!response.ok) {
        throw new Error("Erro ao verificar pagamento")
      }

      const data = await response.json()
      
      if (data.status === "CONCLUIDA" || data.pixStatus === "CONCLUIDA") {
        await handlePaymentConfirmed()
      }
    } catch (err) {
      console.error("Error checking payment status:", err)
    }
  }

  // Effect para verificar status do pagamento a cada 3 segundos
  useEffect(() => {
    let timeout: NodeJS.Timeout
    let isActive = true

    const verifyPayment = async () => {
      if (!isActive || !txid) return
      
      await checkPaymentStatus(txid)
      
      if (isActive && showPixModal && txid) {
        timeout = setTimeout(verifyPayment, 3000)
      }
    }

    if (showPixModal && txid) {
      verifyPayment()
    }

    return () => {
      isActive = false
      if (timeout) {
        clearTimeout(timeout)
      }
    }
  }, [showPixModal, txid])

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto px-4 py-8">
        {/* Exibir saldo atual do usuário */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="bg-gradient-to-r from-black to-gray-800 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm font-medium mb-1">Saldo Atual</p>
                <p className="text-3xl font-bold">
                  {isLoadingBalance ? (
                    <span className="animate-pulse">Carregando...</span>
                  ) : (
                    `R$ ${userBalance.toFixed(2)}`
                  )}
                </p>
              </div>
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {currentStep !== "methods" && (
          <div className="mb-6">
            <div className="text-sm text-gray-500">
              <span className="cursor-pointer hover:text-black transition-colors" onClick={() => setCurrentStep("methods")}>
                Método de pagamento
              </span>
              {currentStep === "pix-form" && (
                <>
                  <span className="mx-2">›</span>
                  <span className="text-black font-medium">PIX</span>
                </>
              )}
            </div>
          </div>
        )}

        <div className="max-w-2xl mx-auto">
          {currentStep === "methods" && (
            <div>
              <h1 className="text-3xl font-bold text-black mb-8">Método de pagamento</h1>

              <div className="mb-8">
                <div className="text-gray-500 text-sm font-medium mb-4">Recomendado</div>
                <div
                  className="bg-white border-2 border-gray-200 p-6 rounded-xl cursor-pointer hover:border-black hover:shadow-lg transition-all"
                  onClick={() => setCurrentStep("pix-form")}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center p-2.5">
                      <img
                        src="https://aurumtraderbroker.site/pix.png"
                        alt="PIX"
                        className="w-full h-full object-contain brightness-0 invert"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-black font-bold text-lg">PIX</div>
                      <div className="text-gray-600 text-sm font-medium">Instantâneo</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-gray-500 text-sm font-medium mb-4">Depósito com criptomoeda</div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cryptoOptions.map((crypto, index) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 p-6 rounded-xl opacity-40 cursor-not-allowed">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <img
                            src={crypto.icon || "/placeholder.svg"}
                            alt={crypto.name}
                            className="w-8 h-8 object-contain"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="text-black font-semibold text-sm">{crypto.name}</div>
                          <div className="text-gray-500 text-xs">{crypto.time}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === "pix-form" && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center p-2.5">
                  <img
                    src="https://aurumtraderbroker.site/pix.png"
                    alt="PIX"
                    className="w-full h-full object-contain brightness-0 invert"
                  />
                </div>
                <h2 className="text-3xl font-bold text-black">PIX</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-black font-semibold mb-3">Valor</label>
                  <input
                    type="text"
                    value={customAmount ? `R$ ${customAmount}` : `R$ ${selectedAmount}`}
                    onChange={handleCustomAmountChange}
                    className="w-full p-4 bg-white border-2 border-gray-200 text-black rounded-lg focus:border-black focus:outline-none transition-colors font-medium"
                    placeholder="R$ 0,00"
                  />
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {predefinedAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => handleAmountSelect(amount)}
                      className={`py-3 px-4 rounded-lg border-2 transition-all font-semibold ${
                        selectedAmount === amount
                          ? "bg-black text-white border-black shadow-md"
                          : "bg-white text-black border-gray-200 hover:border-black hover:shadow-sm"
                      }`}
                    >
                      R$ {amount.toLocaleString()}
                    </button>
                  ))}
                </div>

                {/* Mostrar novo saldo após depósito */}
                {selectedAmount > 0 && (
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-green-800 font-medium">Novo saldo após depósito:</span>
                      <span className="text-green-900 font-bold text-lg">
                        R$ {(userBalance + selectedAmount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                <label className="flex items-start gap-3 mt-8 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 w-5 h-5 accent-black cursor-pointer"
                  />
                  <span className="text-gray-600 text-sm">Eu, por meio deste, aceito os Termos e Condições</span>
                </label>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-4 pt-6">
                  <button
                    onClick={() => setCurrentStep("methods")}
                    className="px-8 py-3 bg-white border-2 border-gray-200 text-black rounded-lg hover:border-black transition-all font-semibold"
                    disabled={isLoading}
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleContinueToPayment}
                    disabled={!agreedToTerms || selectedAmount === 0 || isLoading}
                    className={`flex-1 py-3 px-8 rounded-lg font-bold transition-all ${
                      agreedToTerms && selectedAmount > 0 && !isLoading
                        ? "bg-black text-white hover:bg-gray-800 shadow-md"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {isLoading ? "Gerando PIX..." : "Seguir para pagamento"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {showPixModal && pixData && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-black">Depósito via PIX</h2>
                <button 
                  onClick={() => {
                    setShowPixModal(false)
                    setTxid("")
                    setPixData(null)
                  }} 
                  className="text-gray-400 hover:text-black text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
                >
                  ✕
                </button>
              </div>

              <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-black font-medium">Aurum Broker</span>
                  <span className="text-black font-bold">
                    R$ {selectedAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="flex justify-center mb-6">
                <div className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-sm">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(pixData?.pixCopiaECola || "")}`}
                    alt="QR Code PIX"
                    className="w-[220px] h-[220px]"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
                  <div className="text-xs text-gray-600 font-mono break-all mb-3 leading-relaxed">
                    {pixData?.pixCopiaECola || "Código PIX"}
                  </div>
                  <button
                    onClick={copyPixCode}
                    className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all font-semibold"
                  >
                    Copiar Código PIX
                  </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <p className="text-xs text-blue-800 text-center">
                    🔄 Verificando pagamento automaticamente...
                  </p>
                </div>

                <p className="text-center text-gray-600 text-sm leading-relaxed">
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