"use client"

import type React from "react"
import Link from "next/link"
import { Home, CreditCard, ArrowUpDown, FileText, User } from "lucide-react"

import { useState } from "react"
import { ChevronDown, ExternalLink, Plus, Bell, Settings, BarChart3, Clock, Copy, AlertCircle } from "lucide-react"

export default function DepositPage() {
  const [selectedCurrency, setSelectedCurrency] = useState("BRL")
  const [selectedMethod, setSelectedMethod] = useState("pix")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [balance, setBalance] = useState(10001.96)
  const [currentStep, setCurrentStep] = useState(1) // 1 = method selection, 2 = amount input, 3 = QR code/PIX payment
  const [depositAmount, setDepositAmount] = useState("")
  const name = "Nome do seu site"
  const [pixCode] = useState(
    "00020126580014br.gov.bcb.pix013605332e35-0114-4915-bbd2-768536686de2520400005303986540512.005802BR5925GOWD INSTITUICAO DE PAGAM6007MARINGA62290525Widc1h0crc0000015ggyUzPA563047628",
  )

  const SITE_CONFIG = {
    platformName: "TradePro",
    logoUrl: "/placeholder.svg?height=32&width=120&text=TradePro",
  }

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
    return amount >= 10 && amount <= 54690
  }

  const copyPixCode = async () => {
    try {
      await navigator.clipboard.writeText(pixCode)
      // You could add a toast notification here
    } catch (err) {
      console.error("Failed to copy PIX code:", err)
    }
  }

  return (
    <div className="min-h-screen text-white font-sans overflow-x-hidden" style={{ backgroundColor: "#181A20" }}>
      <div
        className="fixed top-0 left-0 right-0 z-30 border-b px-4 py-3"
        style={{ backgroundColor: "#181A20", borderColor: "#2B3139" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <img src="https://media.discordapp.net/attachments/1191807892936986756/1408228383128551534/Captura_de_Tela_2025-08-21_as_20.16.28-removebg-preview.png?ex=68a8fa62&is=68a7a8e2&hm=527693bc110e80e51760a1cfcc0b1e3a4616517b98b7fcf8a9fffa342ba6f059&=&format=webp&quality=lossless&width=1008&height=990" alt={SITE_CONFIG.platformName} className="h-8" />
          </div>
          <div className="flex items-center space-x-4">
            <Bell className="w-5 h-5 text-gray-400" />
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-gray-400 text-sm">Saldo demo</div>
                <div className="text-white font-semibold">R$ {balance.toFixed(2)}</div>
              </div>
              <button   style={{ backgroundColor: "#FCD535", color: "#000000" }}  className="bg-green-500 hover:bg-green-600 text-black font-semibold px-4 py-2 rounded flex items-center">
                <Plus className="w-4 h-4 mr-1" />
                Depósito
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex h-screen pt-[70px]">
        <div
          className="w-16 border-r flex flex-col items-center py-6 space-y-6 fixed left-0 top-[70px] h-[calc(100vh-70px)] z-20"
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

          <Link
            href="/configuracoes"
            className="flex flex-col items-center space-y-1 hover:bg-gray-700 p-3 rounded-lg transition-colors"
          >
            <Settings className="h-6 w-6 text-gray-400" />
          </Link>

          <Link
            href="/account"
            className="flex flex-col items-center space-y-1 hover:bg-gray-700 p-3 rounded-lg transition-colors"
          >
            <User className="h-6 w-6 text-gray-400" />
          </Link>
        </div>

        <div className="flex-1 ml-16">
          {/* Main Content */}
          <div className="flex-1">
            {/* Navigation Header */}
            <header className="fixed top-[70px] left-16 right-0 z-20 bg-[#1E2329] border-b border-[#2B3139]">
              <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                  <nav className="flex items-center space-x-8">
                    <button className="text-white border-b-2 border-[#FCD535] pb-1">Depositar</button>
                    <a href="/saque" className="text-[#848E9C] hover:text-white">
                      Saque
                    </a>
                  </nav>
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-2 text-[#848E9C] hover:text-white">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M5.626 7.578l7.354 7.354 3.819-3.819L9.445 3.76 5.626 7.578zm8.415 8.838l-.114.103a1.5 1.5 0 01-1.893 0l-.114-.102-7.778-7.779-.103-.114a1.5 1.5 0 01-.103 2.008l-4.243 4.242z" />
                        <path d="M14.677 7.154l-.068.061a.9.9 0 01-1.267-1.266l.062-.069 1.06-1.06a.9.9 0 011.274 1.273l-1.06 1.06zM3.717 18.114l-.068.061a.9.9 0 01-1.267-1.266l.062-.069 4.95-4.95a.9.9 0 011.273 1.274l-4.95 4.95zM21.1 19.2l.092.005a.9.9 0 010 1.79L21.1 21h-9.2a.9.9 0 010-1.8h9.2z" />
                      </svg>
                      <span>Ordens</span>
                    </button>
                    <button className="flex items-center space-x-2 text-[#848E9C] hover:text-white">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M5.626 7.578l7.354 7.354 3.819-3.819L9.445 3.76 5.626 7.578zm8.415 8.838l-.114.103a1.5 1.5 0 01-1.893 0l-.114-.102-7.778-7.779-.103-.114a1.5 1.5 0 01-.103 2.008l-4.243 4.242z" />
                        <path d="M14.677 7.154l-.068.061a.9.9 0 01-1.267-1.266l.062-.069 1.06-1.06a.9.9 0 011.274 1.273l-1.06 1.06zM3.717 18.114l-.068.061a.9.9 0 01-1.267-1.266l.062-.069 4.95-4.95a.9.9 0 011.273 1.274l-4.95 4.95zM21.1 19.2l.092.005a.9.9 0 010 1.79L21.1 21h-9.2a.9.9 0 010-1.8h9.2z" />
                      </svg>
                      <span>Recurso</span>
                    </button>
                  </div>
                </div>
              </div>
            </header>

            {/* Deposit Content */}
            <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
              <div className="flex gap-8">
                <div className="flex-1 max-w-2xl">
                  <h1 className="text-2xl font-semibold text-white mb-8">
                    {currentStep === 3 ? "Depositar" : "Depósito BRL"}
                  </h1>

                  {currentStep === 1 ? (
                    <>
                      {/* Currency Selection */}
                      <div className="mb-8">
                        <h2 className="text-lg font-medium text-white mb-4">Moeda</h2>
                        <div className="relative">
                          <button className="w-full bg-[#2B3139] border border-[#2B3139] rounded-lg p-4 flex items-center justify-between hover:bg-[#343A46]">
                            <div className="flex items-center space-x-3">
                              <img
                                src="https://media.discordapp.net/attachments/1191807892936986756/1408210432354680972/image-removebg-preview_1.png?ex=68a8e9aa&is=68a7982a&hm=475378d53bb373bb988e9fd2c2235b560b5e96af71720ab9dd23ca0485cb5fbf&=&format=webp&quality=lossless&width=1000&height=1000"
                                alt="BRL"
                                className="w-6 h-6 rounded-full"
                              />
                              <span className="text-white font-medium">BRL</span>
                              <span className="text-[#848E9C]">Real brasileiro</span>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Recommended Section */}
                      <div className="mb-6">
                        <h2 className="text-lg font-medium text-white mb-4">Recomendado</h2>
                        <button
                          className={`w-full bg-[#2B3139] border-2 ${selectedMethod === "pix" ? "border-[#FCD535]" : "border-[#2B3139]"} rounded-lg p-4 hover:border-[#FCD535] transition-colors`}
                          onClick={() => setSelectedMethod("pix")}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <img
                                src="https://media.discordapp.net/attachments/1191807892936986756/1408210432354680972/image-removebg-preview_1.png?ex=68a8e9aa&is=68a7982a&hm=475378d53bb373bb988e9fd2c2235b560b5e96af71720ab9dd23ca0485cb5fbf&=&format=webp&quality=lossless&width=1000&height=1000"
                                alt="PIX"
                                className="w-7 h-7"
                              />
                              <div className="text-left">
                                <div className="text-white font-medium">Transferência Bancária (PIX)</div>
                                <div className="flex items-center space-x-4 mt-2">
                                  <span className="text-xs bg-[#2B3139] text-white px-2 py-1 rounded">Taxa 0</span>
                                  <span className="text-xs bg-[#2B3139] text-white px-2 py-1 rounded">Instantâneo</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>

                      <div className="mb-8">
                        <label className="flex items-start space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            className="mt-1 w-4 h-4 text-[#FCD535] bg-[#2B3139] border-[#2B3139] rounded focus:ring-[#FCD535] focus:ring-2"
                          />
                          <span className="text-[#848E9C] text-sm leading-relaxed">
                            Eu li e concordo com os{" "}
                            <button className="text-[#FCD535] hover:underline">Termos e Condições</button> para o uso da
                            funcionalidade de Trading Fiduciário.
                          </span>
                        </label>
                      </div>

                      {/* Continue Button */}
                      <button
                        className={`w-full py-4 rounded-lg font-medium text-black transition-colors ${
                          agreedToTerms ? "bg-[#FCD535] hover:bg-[#F0C419]" : "bg-[#434C5A] cursor-not-allowed"
                        }`}
                        disabled={!agreedToTerms}
                        onClick={handleContinue}
                      >
                        Continuar
                      </button>
                    </>
                  ) : currentStep === 2 ? (
                    <>
                      {/* Amount Input */}
                      <div className="mb-8">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-[#848E9C] text-sm">Quantia</label>
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Limite 10-54,690"
                            value={depositAmount}
                            onChange={handleAmountChange}
                            className="w-full bg-[#2B3139] border border-[#2B3139] rounded-lg p-4 pr-16 text-white placeholder-[#848E9C] focus:border-[#FCD535] focus:outline-none"
                          />
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            <span className="text-white font-medium">BRL</span>
                          </div>
                        </div>
                        {depositAmount && !isAmountValid() && (
                          <div className="mt-2 text-red-500 text-sm">
                            Valor deve estar entre R$ 10,00 e R$ 54.690,00
                          </div>
                        )}
                      </div>

                      {/* Payment Details */}
                      <div className="mb-8 space-y-4">
                        <div className="flex justify-between items-center py-2">
                          <span className="text-[#848E9C] text-sm">Pagar com</span>
                          <div className="flex items-center space-x-2">
                            <img
                              src="https://media.discordapp.net/attachments/1191807892936986756/1408210432354680972/image-removebg-preview_1.png?ex=68a8e9aa&is=68a7982a&hm=475378d53bb373bb988e9fd2c2235b560b5e96af71720ab9dd23ca0485cb5fbf&=&format=webp&quality=lossless&width=1000&height=1000"
                              alt="PIX"
                              className="w-8 h-8"
                            />
                            <span className="text-white font-medium">Transferência Bancária (PIX)</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center py-2">
                          <span className="text-[#848E9C] text-sm">Taxa</span>
                          <span className="text-white font-medium">
                            0 <span className="ml-1">BRL</span>
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-2">
                          <span className="text-[#848E9C] text-sm">Recebe</span>
                          <span className="text-white font-medium">
                            {depositAmount || "0"} <span className="ml-1">BRL</span>
                          </span>
                        </div>
                      </div>

                      <button
                        className={`w-full py-4 rounded-lg font-medium text-black transition-colors ${
                          isAmountValid() ? "bg-[#FCD535] hover:bg-[#F0C419]" : "bg-[#434C5A] cursor-not-allowed"
                        }`}
                        disabled={!isAmountValid()}
                        onClick={handleContinue}
                      >
                        Continuar
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center mb-6 text-white text-sm pb-5 border-b border-[#2B3139]">
                        <Clock className="w-5 h-5 mr-2" />
                        Pagar em até <b className="text-base ml-1 font-medium">24 hours</b>
                      </div>

                      <div className="text-[#848E9C] text-sm mb-4">
                        Copie o código PIX ou escaneie o código QR abaixo no aplicativo do seu banco e autorize o
                        pagamento para efetuar o depósito PIX.
                      </div>

                      <div className="flex p-3 bg-[#2B3139] rounded-lg mb-4">
                        <AlertCircle className="w-5 h-5 text-white flex-shrink-0 mr-2 mt-0.5" />
                        <div className="text-sm text-white">
                          Serão aceitos apenas depósitos de conta bancária vinculada ao seu CPF (12634100817).
                        </div>
                      </div>

                      {/* Amount Display */}
                      <div className="flex justify-between items-center font-medium text-lg md:text-2xl text-white mb-3 h-12 md:h-12">
                        <div className="flex items-center">
                          <img
                            src="https://media.discordapp.net/attachments/1191807892936986756/1408220177879011499/c6365403-b0dd-4d9b-98a5-2bbd0d1d8dd6.png?ex=68a8f2bd&is=68a7a13d&hm=3bbb94a54dce4d5df5e2902a18056674de262c6c1f735ec76e6ab55b8169aaa1&=&format=webp&quality=lossless&width=194&height=192"
                            alt="BRL"
                            className="w-6 h-6 mr-2"
                          />
                          <div>BRL</div>
                        </div>
                        <div>R${depositAmount}</div>
                      </div>

                      {/* PIX Code Section */}
                      <div className="border border-[#2B3139] p-4 rounded-lg mb-4">
                        <div className="flex">
                          <img
                            src="https://media.discordapp.net/attachments/1191807892936986756/1408210432354680972/image-removebg-preview_1.png?ex=68a8e9aa&is=68a7982a&hm=475378d53bb373bb988e9fd2c2235b560b5e96af71720ab9dd23ca0485cb5fbf&=&format=webp&quality=lossless&width=1000&height=1000"
                            alt="PIX"
                            className="w-5 h-5 mt-0.5 flex-shrink-0"
                          />
                          <div className="flex-1 pl-2 w-60 md:w-80">
                            <div className="text-sm text-white font-medium mb-2">Código PIX</div>
                            <div className="text-sm text-[#848E9C] mb-2 overflow-hidden truncate">{pixCode}</div>
                            <button
                              onClick={copyPixCode}
                              className="bg-[#2B3139] hover:bg-[#343A46] text-white px-4 py-2 rounded text-sm font-medium flex items-center"
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copiar código PIX
                            </button>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="flex items-center my-3">
                          <div className="flex-grow border-t border-[#2B3139]"></div>
                          <span className="flex-shrink mx-4 text-[#848E9C] text-xs">Ou</span>
                          <div className="flex-grow border-t border-[#2B3139]"></div>
                        </div>

                        {/* QR Code */}
                        <div className="text-sm font-medium text-white text-center mb-3">Escanear código QR PIX</div>
                        <div className="bg-white p-0.5 mx-auto flex items-center justify-center relative">
                          <img
                            className="w-48"
                            src="/placeholder.svg?height=196&width=196&text=QR+Code"
                            alt="QR Code PIX"
                          />
                        </div>
                        <div className="flex items-center justify-center mt-2">
                          <svg className="w-4 h-4 text-[#848E9C] mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3.8 16.377l8.2 3.995 8.2-3.995V3.427H3.8v12.95zm18.2.189l-.004.107a1.5 1.5 0 01-.839 1.242l-8.5 4.14-.159.066a1.5 1.5 0 01-.996 0l-.16-.067-8.5-4.14a1.5 1.5 0 01-.838-1.24L2 16.565V3.126a1.5 1.5 0 011.347-1.492l.153-.008h17a1.5 1.5 0 011.5 1.5v13.44z" />
                            <path d="M16.35 11.087a4.35 4.35 0 10-8.7 0 4.35 4.35 0 008.7 0zm1.8 0a6.15 6.15 0 11-12.3 0 6.15 6.15 0 0112.3 0z" />
                            <path d="M10 11.087l2-2 2 2-2 2-2-2z" />
                          </svg>
                          <div className="text-[#848E9C] text-xs">Fornecido por - GOWD</div>
                        </div>
                      </div>

                      {/* Complete Button */}
                      <div className="w-full pt-3 pb-6 sticky bottom-0" style={{ backgroundColor: "#181A20" }}>
                        <button className="w-full py-4 rounded-lg font-medium text-black bg-[#434C5A] hover:bg-[#4A5568] transition-colors">
                          Concluído
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* FAQ Sidebar */}
                <div className="w-80">
                  <div className="bg-[#1E2329] rounded-lg p-6">
                    {currentStep === 3 ? (
                      <>
                        {/* How It Works Section */}
                        <h3 className="text-lg font-medium text-white mb-5">Como funciona</h3>
                        <div className="space-y-6">
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-[#FCD535] rounded-full flex items-center justify-center text-black text-sm font-medium flex-shrink-0">
                              1
                            </div>
                            <div className="flex-1">
                              <div className="text-white font-medium mb-1">Transferência do Dinheiro</div>
                              <div className="text-[#848E9C] text-sm">Transfira seu dinheiro para a conta {name}</div>
                            </div>
                          </div>

                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-[#2B3139] rounded-full flex items-center justify-center text-[#848E9C] text-sm font-medium flex-shrink-0">
                              2
                            </div>
                            <div className="flex-1">
                              <div className="text-white font-medium mb-1">Processamento da Ordem</div>
                              <div className="text-[#848E9C] text-sm mb-2">
                                Aguarde 1-2 dias úteis para o processamento da ordem
                              </div>
                              <button className="text-[#FCD535] text-sm hover:underline">Ver ordem</button>
                            </div>
                          </div>

                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-[#2B3139] rounded-full flex items-center justify-center text-[#848E9C] text-sm font-medium flex-shrink-0">
                              3
                            </div>
                            <div className="flex-1">
                              <div className="text-white font-medium mb-1">Fundos Recebidos</div>
                              <div className="text-[#848E9C] text-sm mb-2">Recebimento do valor do seu depósito</div>
                              <button className="text-[#FCD535] text-sm hover:underline">Verificar Saldo</button>
                            </div>
                          </div>

                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-[#2B3139] rounded-full flex items-center justify-center text-[#848E9C] text-sm font-medium flex-shrink-0">
                              4
                            </div>
                            <div className="flex-1">
                              <div className="text-white font-medium mb-1">Buy Crypto</div>
                              <div className="text-[#848E9C] text-sm mb-2">Compre criptomoedas com depósito de BRL</div>
                              <button className="text-[#FCD535] text-sm hover:underline">Buy Crypto</button>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg font-medium text-white mb-6">FAQ - Perguntas frequentes</h3>
                        <div className="space-y-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-[#2B3139] rounded-full flex items-center justify-center text-[#848E9C] text-sm font-medium flex-shrink-0">
                              1
                            </div>
                            <div className="flex-1">
                              <button className="text-left text-white hover:text-[#FCD535] flex items-center justify-between w-full group">
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
                            <div className="w-6 h-6 bg-[#2B3139] rounded-full flex items-center justify-center text-[#848E9C] text-sm font-medium flex-shrink-0">
                              2
                            </div>
                            <div className="flex-1">
                              <button className="text-left text-white hover:text-[#FCD535] flex items-center justify-between w-full group">
                                <span>Como depositar BRL na  {name}</span>
                                <ExternalLink className="w-4 h-4 text-[#848E9C] group-hover:text-[#FCD535] flex-shrink-0 ml-2" />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-[#2B3139] rounded-full flex items-center justify-center text-[#848E9C] text-sm font-medium flex-shrink-0">
                              3
                            </div>
                            <div className="flex-1">
                              <button className="text-left text-white hover:text-[#FCD535] flex items-center justify-between w-full group">
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
