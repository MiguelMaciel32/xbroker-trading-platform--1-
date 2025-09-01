"use client"

import type React from "react"
import Link from "next/link"
import { CreditCard, ArrowUpDown, User } from "lucide-react"
import { ExternalLink, Plus, Bell, Settings, BarChart3, Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

class PixupBRService {
  static async createPixPayment(data: {
    amount: number
    external_id: string
    payerQuestion?: string
    postbackUrl?: string
    payer?: {
      name?: string
      document?: string
      email?: string
    }
  }) {
    try {
      const response = await fetch("/api/pixupbr/qrcode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao criar pagamento PIX")
      }

      return result.data
    } catch (error) {
      console.error("Erro ao criar pagamento PIX:", error)
      throw error
    }
  }
}

export default function DepositPage() {
  const [selectedCurrency, setSelectedCurrency] = useState("BRL")
  const [selectedMethod, setSelectedMethod] = useState("pix")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [balance, setBalance] = useState(10001.96)
  const [currentStep, setCurrentStep] = useState(1)
  const [depositAmount, setDepositAmount] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [pixKey, setPixKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const name = "Nome do seu site"
  const [pixCode] = useState(
    "00020126580014br.gov.bcb.pix013605332e35-0114-4915-bbd2-768536686de2520400005303986540512.005802BR5925GOWD INSTITUICAO DE PAGAM6007MARINGA62290525Widc1h0crc0000015ggyUzPA563047628",
  )

  const SITE_CONFIG = {
    platformName: "TradePro",
    logoUrl: "/placeholder.svg?height=32&width=120&text=TradePro",
  }

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

  const handleContinue = () => {
    if (currentStep === 1 && agreedToTerms) {
      setCurrentStep(2)
    } else if (currentStep === 2 && isAmountValid()) {
      setCurrentStep(3)
    }
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.,]/g, "")
    setDepositAmount(value)
  }

  const isAmountValid = () => {
    const amount = Number.parseFloat(depositAmount.replace(",", "."))
    return amount >= 1 && amount <= 54690
  }

  const copyPixCode = async () => {
    try {
      await navigator.clipboard.writeText(pixKey || pixCode)
    } catch (err) {
      console.error("Failed to copy PIX code:", err)
    }
  }

  const handleCreatePayment = async () => {
    setLoading(true)
    setError(null)
    setQrCode(null)
    setPixKey(null)

    try {
      const amountValue = Number.parseFloat(depositAmount.replace(",", "."))

      if (!amountValue || amountValue < 1 || amountValue > 54690) {
        throw new Error("Valor inválido. O valor deve estar entre R$ 100,00 e R$ 54.690,00")
      }

      if (!user?.email) {
        throw new Error("Usuário não encontrado. Faça login para continuar.")
      }

      const payment = await PixupBRService.createPixPayment({
        amount: amountValue,
        external_id: `${user.email}|${Date.now()}`,
        payerQuestion: `Depósito de R$ ${depositAmount}`,
        postbackUrl: `${window.location.origin}/api/pixupbr/webhook`,
        payer: {
          name: user.user_metadata?.full_name || "Usuário",
          document: "12345678901",
          email: user.email,
        },
      })

      if (currentStep === 1 && agreedToTerms) {
        setCurrentStep(2)
      } else if (currentStep === 2 && isAmountValid()) {
        setCurrentStep(3)
      }

      const qrCodeString = payment.qrcode
      const pixKeyValue = payment.qrcode

      const qrCodeImageUrl = qrCodeString
        ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeString)}`
        : null

      setQrCode(qrCodeImageUrl)
      setPixKey(qrCodeString)

      if (!qrCodeImageUrl && !qrCodeString) {
        setError("QR Code não encontrado na resposta da API")
      }
    } catch (error: any) {
      console.error("Erro:", error)
      setError(error.message || "Erro ao criar pagamento PIX")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen text-white font-sans overflow-x-hidden" style={{ backgroundColor: "#181A20" }}>
      <div
        className="fixed top-0 left-0 right-0 z-30 border-b px-4 py-3"
        style={{ backgroundColor: "#181A20", borderColor: "#2B3139" }}
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
            <div className="flex items-center space-x-2 md:space-x-3">

              <button
                style={{ backgroundColor: "#FCD535", color: "#000000" }}
                className="bg-green-500 hover:bg-green-600 text-black font-semibold px-2 py-1 md:px-4 md:py-2 text-sm md:text-base flex items-center"
              >
                <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                <span className="hidden sm:inline">Depósito</span>
                <span className="sm:hidden">+</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 pt-16 pb-6 space-y-4" style={{ backgroundColor: "#181A20" }}>
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
              style={{ backgroundColor: "#FCD535", color: "#000" }}
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

            {/* <Link
              href="/configuracoes"
              className="flex items-center space-x-3 px-6 py-3 hover:bg-gray-700 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Settings className="h-5 w-5 text-gray-400" />
              <span className="text-white">Configurações</span>
            </Link> */}

            {/* <Link
              href="/account"
              className="flex items-center space-x-3 px-6 py-3 hover:bg-gray-700 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <User className="h-5 w-5 text-gray-400" />
              <span className="text-white">Conta</span>
            </Link> */}
          </div>
        </div>
      )}

      <div className="flex h-screen pt-[70px]">
        <div
          className="hidden lg:block w-16 border-r flex-col items-center py-6 space-y-6 fixed left-0 top-[70px] h-[calc(100vh-70px)] z-20"
          style={{ backgroundColor: "#181A20", borderColor: "#2B3139" }}
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
            style={{ backgroundColor: "#FCD535", color: "#000" }}
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

          {/* <Link
            href="/configuracoes"
            className="flex flex-col items-center space-y-1 hover:bg-gray-700 p-3 rounded-lg transition-colors"
          >
            <Settings className="h-6 w-6 text-gray-400" />
          </Link> */}

          <Link
            href="/account"
            className="flex flex-col items-center space-y-1 hover:bg-gray-700 p-3 rounded-lg transition-colors"
          >
            <User className="h-6 w-6 text-gray-400" />
          </Link>
        </div>

        <div className="flex-1 w-full">
          <header className="bg-[#1E2329] border-b border-[#2B3139]">
            <div className="w-full px-4 lg:px-6 py-3 sm:py-4">
              <div className="flex items-center justify-between">
                <nav className="flex items-center space-x-4 sm:space-x-8">
                  <a href="/deposit" className="text-white border-b-2 border-[#FCD535] pb-1 text-sm sm:text-base ">
                    Depositar
                  </a>
                  <button className="text-[#848E9C] hover:text-white text-sm sm:text-base">Saque</button>
                </nav>
              </div>
            </div>
          </header>

          <div className="flex-1">
            <div className="w-full px-4 lg:px-6 py-6 md:py-8">
              <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 max-w-full">
                <div className="flex-1 w-full">
                  <h1 className="text-xl md:text-2xl font-semibold text-white mb-6 md:mb-8">
                    {currentStep === 3 ? "Depositar" : "Depósito BRL"}
                  </h1>

                  {loading && (
                    <div className="bg-[#1E2329] p-6 mb-6 text-center">
                      <div className="text-white">Gerando QR Code...</div>
                    </div>
                  )}

                  {error && <div className="bg-red-600 p-4 mb-6 text-white">{error}</div>}

                  {currentStep === 1 && (
                    <div className="bg-[#1E2329] p-3 sm:p-4 md:p-6 mb-6">
                      <h2 className="text-lg font-medium text-white mb-4">Selecione o método de pagamento</h2>

                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-4 bg-[#2B3139] border border-[#FCD535] cursor-pointer">
                          <div className="w-4 h-4 border-2 border-[#FCD535] rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-[#FCD535] rounded-full"></div>
                          </div>
                          <img
                            src="https://ngzbprsxlhoprawybxji.supabase.co/storage/v1/object/public/ate/pix.png"
                            alt="PIX"
                            className="w-8 h-8"
                          />
                          <div className="flex-1">
                            <div className="text-white font-medium">PIX</div>
                            <div className="text-[#848E9C] text-sm">Transferência instantânea</div>
                          </div>
                          <div className="text-[#FCD535] text-sm">Recomendado</div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <label className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            className="mt-1 w-4 h-4 text-[#FCD535] bg-transparent border-2 border-[#848E9C] focus:ring-[#FCD535] focus:ring-2"
                          />
                          <span className="text-[#848E9C] text-sm">
                            Eu li e concordo com os{" "}
                            <a href="#" className="text-[#FCD535] hover:underline">
                              Termos de Uso
                            </a>{" "}
                            e{" "}
                            <a href="#" className="text-[#FCD535] hover:underline">
                              Política de Privacidade
                            </a>
                          </span>
                        </label>
                      </div>

                      <button
                        onClick={handleContinue}
                        disabled={!agreedToTerms}
                        className={`w-full mt-6 py-3 px-4 font-medium text-black ${
                          agreedToTerms
                            ? "bg-[#FCD535] hover:bg-[#E5C02F]"
                            : "bg-[#2B3139] text-[#848E9C] cursor-not-allowed"
                        } transition-colors`}
                      >
                        Continuar
                      </button>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="bg-[#1E2329] p-3 sm:p-4 md:p-6 mb-6">
                      <h2 className="text-lg font-medium text-white mb-4">Insira o valor do depósito</h2>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-[#848E9C] text-sm mb-2">Valor (BRL)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#848E9C]">
                              R$
                            </span>
                            <input
                              type="text"
                              value={depositAmount}
                              onChange={handleAmountChange}
                              placeholder="0,00"
                              className="w-full pl-10 pr-4 py-3 bg-[#2B3139] border border-[#2B3139] text-white placeholder-[#848E9C] focus:border-[#FCD535] focus:outline-none"
                            />
                          </div>
                          <div className="text-[#848E9C] text-xs mt-1">Mínimo: R$ 100,00 | Máximo: R$ 54.690,00</div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          {["1", "500", "900"].map((amount) => (
                            <button
                              key={amount}
                              onClick={() => setDepositAmount(amount)}
                              className="py-2 px-3 bg-[#2B3139] text-[#848E9C] hover:bg-[#FCD535] hover:text-black transition-colors text-sm"
                            >
                              R$ {amount}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={handleCreatePayment}
                        disabled={!isAmountValid() || loading}
                        className={`w-full mt-6 py-3 px-4 font-medium text-black ${
                          isAmountValid() && !loading
                            ? "bg-[#FCD535] hover:bg-[#E5C02F]"
                            : "bg-[#2B3139] text-[#848E9C] cursor-not-allowed"
                        } transition-colors`}
                      >
                        {loading ? "Processando..." : "Continuar"}
                      </button>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="bg-[#1E2329] p-3 sm:p-4 md:p-6 mb-6">
                      <div className="text-center mb-6">
                        <h2 className="text-lg font-medium text-white mb-2">Escaneie o QR Code</h2>
                        <p className="text-[#848E9C] text-sm">
                          Use o aplicativo do seu banco para escanear o código PIX
                        </p>
                      </div>

                      <div className="flex justify-center mb-6">
                        <div className="w-48 h-48 bg-white p-4 flex items-center justify-center">
                          <img
                            src={qrCode || "https://via.placeholder.com/200?text=QR+Code"}
                            alt="QR Code PIX"
                            className="w-full h-full"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-[#848E9C] text-sm mb-2">Código PIX</label>
                          <div className="flex">
                            <input
                              type="text"
                              value={pixKey || "Carregando..."}
                              readOnly
                              className="flex-1 px-3 py-2 bg-[#2B3139] border border-[#2B3139] text-white text-xs"
                            />
                            <button
                              onClick={copyPixCode}
                              className="px-4 py-2 bg-[#FCD535] text-black hover:bg-[#E5C02F] transition-colors text-sm font-medium"
                            >
                              Copiar
                            </button>
                          </div>
                        </div>

                        <div className="bg-[#2B3139] p-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-[#848E9C]">Valor:</span>
                            <span className="text-white">R$ {depositAmount}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-[#848E9C]">Taxa:</span>
                            <span className="text-white">R$ 0,00</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setCurrentStep(1)
                          setDepositAmount("")
                          setAgreedToTerms(false)
                          setQrCode(null)
                          setPixKey(null)
                          setError(null)
                        }}
                        className="w-full mt-6 py-3 px-4 bg-[#2B3139] text-white hover:bg-[#3B4149] transition-colors font-medium"
                      >
                        Fazer outro depósito
                      </button>
                    </div>
                  )}
                </div>

                <div className="w-full lg:w-80 mt-4 sm:mt-8 lg:mt-0">
                  <div className="bg-[#1E2329] p-3 sm:p-4 md:p-6">
                    {currentStep === 3 ? (
                      <>
                        <h3 className="text-base md:text-lg font-medium text-white mb-4 md:mb-5">Como funciona</h3>
                        <div className="space-y-4 md:space-y-6">
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-[#FCD535] flex items-center justify-center text-black text-sm font-medium flex-shrink-0">
                              1
                            </div>
                            <div className="flex-1">
                              <div className="text-white font-medium mb-1 text-sm md:text-base">
                                Transferência do Dinheiro
                              </div>
                              <div className="text-[#848E9C] text-xs md:text-sm">
                                Transfira seu dinheiro para a conta {name}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-[#2B3139] flex items-center justify-center text-[#848E9C] text-sm font-medium flex-shrink-0">
                              2
                            </div>
                            <div className="flex-1">
                              <div className="text-white font-medium mb-1 text-sm md:text-base">
                                Processamento da Ordem
                              </div>
                              <div className="text-[#848E9C] text-xs md:text-sm mb-2">
                                Aguarde 1-2 dias úteis para o processamento da ordem
                              </div>
                              <button className="text-[#FCD535] text-xs md:text-sm hover:underline">Ver ordem</button>
                            </div>
                          </div>

                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-[#2B3139] flex items-center justify-center text-[#848E9C] text-sm font-medium flex-shrink-0">
                              3
                            </div>
                            <div className="flex-1">
                              <div className="text-white font-medium mb-1 text-sm md:text-base">Fundos Recebidos</div>
                              <div className="text-[#848E9C] text-xs md:text-sm mb-2">
                                Recebimento do valor do seu depósito
                              </div>
                              <button className="text-[#FCD535] text-xs md:text-sm hover:underline">
                                Verificar Saldo
                              </button>
                            </div>
                          </div>

                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-[#2B3139] flex items-center justify-center text-[#848E9C] text-sm font-medium flex-shrink-0">
                              4
                            </div>
                            <div className="flex-1">
                              <div className="text-white font-medium mb-1 text-sm md:text-base">Buy Crypto</div>
                              <div className="text-[#848E9C] text-xs md:text-sm mb-2">
                                Compre criptomoedas com depósito de BRL
                              </div>
                              <button className="text-[#FCD535] text-xs md:text-sm hover:underline">Buy Crypto</button>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <h3 className="text-base md:text-lg font-medium text-white mb-4 md:mb-6">
                          FAQ - Perguntas frequentes
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-[#2B3139] flex items-center justify-center text-[#848E9C] text-sm font-medium flex-shrink-0">
                              1
                            </div>
                            <div className="flex-1">
                              <button className="text-left text-white hover:text-[#FCD535] flex items-center justify-between w-full group text-sm md:text-base">
                                <span>Posso Depositar Reais de qualquer conta bancária no Brasil?</span>
                                <svg
                                  className="w-4 h-4 text-[#848E9C] group-hover:text-[#FCD535] flex-shrink-0 ml-2"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M12 5v14M5 12h14" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-[#2B3139] flex items-center justify-center text-[#848E9C] text-sm font-medium flex-shrink-0">
                              2
                            </div>
                            <div className="flex-1">
                              <button className="text-left text-white hover:text-[#FCD535] flex items-center justify-between w-full group text-sm md:text-base">
                                <span>Como depositar BRL na {name}</span>
                                <ExternalLink className="w-4 h-4 text-[#848E9C] group-hover:text-[#FCD535] flex-shrink-0 ml-2" />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-[#2B3139] flex items-center justify-center text-[#848E9C] text-sm font-medium flex-shrink-0">
                              3
                            </div>
                            <div className="flex-1">
                              <button className="text-left text-white hover:text-[#FCD535] flex items-center justify-between w-full group text-sm md:text-base">
                                <span>Quais são os limites de transação?</span>
                                <ExternalLink className="w-4 h-4 text-[#848E9C] group-hover:text-[#FCD535] flex-shrink-0 ml-2" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
