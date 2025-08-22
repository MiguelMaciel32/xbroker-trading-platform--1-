"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ChevronDown,
  ExternalLink,
  Plus,
  Bell,
  Settings,
  BarChart3,
  Home,
  CreditCard,
  ArrowUpDown,
  FileText,
  User,
} from "lucide-react"

export default function SaquePage() {
  const [withdrawalAmount, setWithdrawalAmount] = useState("")
  const [pixKey, setPixKey] = useState("")
  const [pixKeyType, setPixKeyType] = useState("cpf")
  const [accountHolder, setAccountHolder] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [balance, setBalance] = useState(10001.96)

  const SITE_CONFIG = {
    platformName: "TradePro",
    logoUrl: "https://media.discordapp.net/attachments/1191807892936986756/1408228383128551534/Captura_de_Tela_2025-08-21_as_20.16.28-removebg-preview.png?ex=68a8fa62&is=68a7a8e2&hm=527693bc110e80e51760a1cfcc0b1e3a4616517b98b7fcf8a9fffa342ba6f059&=&format=webp&quality=lossless&width=1008&height=990",
  }

  const handleWithdrawal = () => {
    if (withdrawalAmount && pixKey && accountHolder && agreedToTerms) {
      alert(`Solicitação de saque de R$ ${withdrawalAmount} enviada para análise!`)
    }
  }

  return (
    <div className="min-h-screen text-white font-sans overflow-x-hidden" style={{ backgroundColor: "#181A20" }}>
      {/* Fixed Header */}
      <div
        className="fixed top-0 left-0 right-0 z-30 border-b px-4 py-3"
        style={{ backgroundColor: "#181A20", borderColor: "#2B3139" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <img src={SITE_CONFIG.logoUrl || "/placeholder.svg"} alt={SITE_CONFIG.platformName} className="h-8" />
          </div>
          <div className="flex items-center space-x-4">
            <Bell className="w-5 h-5 text-gray-400" />
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-gray-400 text-sm">Saldo demo</div>
                <div className="text-white font-semibold">R$ {balance.toFixed(2)}</div>
              </div>
              <button className="bg-green-500 hover:bg-green-600 text-black font-semibold px-4 py-2 rounded flex items-center">
                <Plus className="w-4 h-4 mr-1" />
                Depósito
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex h-screen pt-[70px]">
        {/* Fixed Sidebar */}
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
            className="flex flex-col items-center space-y-1 hover:bg-gray-700 p-3 rounded-lg transition-colors"
          >
            <CreditCard className="h-6 w-6 text-gray-400" />
          </Link>

          <Link
            href="/saque"
            className="flex flex-col items-center space-y-1 p-3 rounded-lg transition-colors"
            style={{ backgroundColor: "#FCD535", color: "#000" }}
          >
            <ArrowUpDown className="h-6 w-6" />
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
          {/* Navigation Header */}
          <header className="fixed top-[70px] left-16 right-0 z-20 bg-[#1E2329] border-b border-[#2B3139]">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <nav className="flex items-center space-x-8">
                  <a href="/deposit" className="text-[#848E9C] hover:text-white">
                    Depositar
                  </a>
                  <button className="text-white border-b-2 border-[#FCD535] pb-1">Saque</button>
                </nav>
               
              </div>
            </div>
          </header>

          {/* Withdrawal Content */}
          <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
            <div className="flex gap-8">
              <div className="flex-1 max-w-2xl">
                <h1 className="text-2xl font-semibold text-white mb-8">Saque BRL</h1>

                {/* Withdrawal Amount */}
                <div className="mb-6">
                  <label className="block text-lg font-medium text-white mb-4">Valor do Saque</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={withdrawalAmount}
                      onChange={(e) => setWithdrawalAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-[#2B3139] border border-[#2B3139] rounded-lg p-4 text-white placeholder-[#848E9C] focus:border-[#FCD535] focus:outline-none"
                    />
                    <span className="absolute right-4 top-4 text-[#848E9C]">BRL</span>
                  </div>
                  <div className="text-[#848E9C] text-sm mt-2">Saldo disponível: R$ {balance.toFixed(2)}</div>
                </div>

                {/* PIX Key Type */}
                <div className="mb-6">
                  <label className="block text-lg font-medium text-white mb-4">Tipo de Chave PIX</label>
                  <div className="relative">
                    <select
                      value={pixKeyType}
                      onChange={(e) => setPixKeyType(e.target.value)}
                      className="w-full bg-[#2B3139] border border-[#2B3139] rounded-lg p-4 text-white focus:border-[#FCD535] focus:outline-none appearance-none"
                    >
                      <option value="cpf">CPF</option>
                      <option value="email">E-mail</option>
                      <option value="telefone">Telefone</option>
                      <option value="aleatoria">Chave Aleatória</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-4 h-5 w-5 text-[#848E9C] pointer-events-none" />
                  </div>
                </div>

                {/* PIX Key */}
                <div className="mb-6">
                  <label className="block text-lg font-medium text-white mb-4">Chave PIX</label>
                  <input
                    type="text"
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                    placeholder={
                      pixKeyType === "cpf"
                        ? "000.000.000-00"
                        : pixKeyType === "email"
                          ? "seu@email.com"
                          : pixKeyType === "telefone"
                            ? "(11) 99999-9999"
                            : "Chave aleatória"
                    }
                    className="w-full bg-[#2B3139] border border-[#2B3139] rounded-lg p-4 text-white placeholder-[#848E9C] focus:border-[#FCD535] focus:outline-none"
                  />
                </div>

                {/* Account Holder */}
                <div className="mb-6">
                  <label className="block text-lg font-medium text-white mb-4">Nome do Titular</label>
                  <input
                    type="text"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    placeholder="Nome completo do titular da conta"
                    className="w-full bg-[#2B3139] border border-[#2B3139] rounded-lg p-4 text-white placeholder-[#848E9C] focus:border-[#FCD535] focus:outline-none"
                  />
                </div>

                {/* Terms Checkbox */}
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
                      <button className="text-[#FCD535] hover:underline">Termos e Condições</button> para saque.
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleWithdrawal}
                  className={`w-full py-4 rounded-lg font-medium text-black transition-colors ${
                    withdrawalAmount && pixKey && accountHolder && agreedToTerms
                      ? "bg-[#FCD535] hover:bg-[#F0C419]"
                      : "bg-[#434C5A] cursor-not-allowed"
                  }`}
                  disabled={!withdrawalAmount || !pixKey || !accountHolder || !agreedToTerms}
                >
                  Solicitar Saque
                </button>
              </div>

              {/* FAQ Sidebar */}
              <div className="w-80">
                <div className="bg-[#1E2329] rounded-lg p-6">
                  <h3 className="text-lg font-medium text-white mb-6">FAQ - Perguntas frequentes</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-[#2B3139] rounded-full flex items-center justify-center text-[#848E9C] text-sm font-medium flex-shrink-0">
                        1
                      </div>
                      <div className="flex-1">
                        <button className="text-left text-white hover:text-[#FCD535] flex items-center justify-between w-full group">
                          <span>Quanto tempo demora para processar um saque?</span>
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
                          <span>Quais são as taxas de saque?</span>
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
                          <span>Qual é o valor mínimo para saque?</span>
                          <ExternalLink className="w-4 h-4 text-[#848E9C] group-hover:text-[#FCD535] flex-shrink-0 ml-2" />
                        </button>
                      </div>
                    </div>
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
