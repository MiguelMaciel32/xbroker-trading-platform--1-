"use client"

import { useState } from "react"
import { ChevronDown, ExternalLink } from "lucide-react"

export default function SaquePage() {
  const [withdrawalAmount, setWithdrawalAmount] = useState("")
  const [pixKey, setPixKey] = useState("")
  const [pixKeyType, setPixKeyType] = useState("cpf")
  const [accountHolder, setAccountHolder] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [balance, setBalance] = useState(10001.96)

  const handleWithdrawal = () => {
    if (withdrawalAmount && pixKey && accountHolder && agreedToTerms) {
      alert(`Solicitação de saque de R$ ${withdrawalAmount} enviada para análise!`)
    }
  }

  return (
    <div className="min-h-screen text-white font-sans overflow-x-hidden" style={{ backgroundColor: "#181A20" }}>
      {/* Navigation Header */}
      <header className="bg-[#1E2329] border-b border-[#2B3139]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <nav className="flex items-center space-x-4 sm:space-x-8">
              <a href="/deposit" className="text-[#848E9C] hover:text-white text-sm sm:text-base">
                Depositar
              </a>
              <button className="text-white border-b-2 border-[#FCD535] pb-1 text-sm sm:text-base">Saque</button>
            </nav>
          </div>
        </div>
      </header>

      {/* Withdrawal Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="flex-1 max-w-none lg:max-w-2xl">
            <h1 className="text-xl sm:text-2xl font-semibold text-white mb-6 sm:mb-8">Saque BRL</h1>

            {/* Withdrawal Amount */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-base sm:text-lg font-medium text-white mb-3 sm:mb-4">Valor do Saque</label>
              <div className="relative">
                <input
                  type="number"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#2B3139] border border-[#2B3139] rounded-lg p-3 sm:p-4 text-white placeholder-[#848E9C] focus:border-[#FCD535] focus:outline-none text-sm sm:text-base"
                />
                <span className="absolute right-3 sm:right-4 top-3 sm:top-4 text-[#848E9C] text-sm sm:text-base">
                  BRL
                </span>
              </div>
              <div className="text-[#848E9C] text-xs sm:text-sm mt-2">Saldo disponível: R$ {balance.toFixed(2)}</div>
            </div>

            {/* PIX Key Type */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-base sm:text-lg font-medium text-white mb-3 sm:mb-4">
                Tipo de Chave PIX
              </label>
              <div className="relative">
                <select
                  value={pixKeyType}
                  onChange={(e) => setPixKeyType(e.target.value)}
                  className="w-full bg-[#2B3139] border border-[#2B3139] rounded-lg p-3 sm:p-4 text-white focus:border-[#FCD535] focus:outline-none appearance-none text-sm sm:text-base"
                >
                  <option value="cpf">CPF</option>
                  <option value="email">E-mail</option>
                  <option value="telefone">Telefone</option>
                  <option value="aleatoria">Chave Aleatória</option>
                </select>
                <ChevronDown className="absolute right-3 sm:right-4 top-3 sm:top-4 h-4 w-4 sm:h-5 sm:w-5 text-[#848E9C] pointer-events-none" />
              </div>
            </div>

            {/* PIX Key */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-base sm:text-lg font-medium text-white mb-3 sm:mb-4">Chave PIX</label>
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
                className="w-full bg-[#2B3139] border border-[#2B3139] rounded-lg p-3 sm:p-4 text-white placeholder-[#848E9C] focus:border-[#FCD535] focus:outline-none text-sm sm:text-base"
              />
            </div>

            {/* Account Holder */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-base sm:text-lg font-medium text-white mb-3 sm:mb-4">Nome do Titular</label>
              <input
                type="text"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                placeholder="Nome completo do titular da conta"
                className="w-full bg-[#2B3139] border border-[#2B3139] rounded-lg p-3 sm:p-4 text-white placeholder-[#848E9C] focus:border-[#FCD535] focus:outline-none text-sm sm:text-base"
              />
            </div>

            {/* Terms Checkbox */}
            <div className="mb-6 sm:mb-8">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-[#FCD535] bg-[#2B3139] border-[#2B3139] rounded focus:ring-[#FCD535] focus:ring-2 flex-shrink-0"
                />
                <span className="text-[#848E9C] text-xs sm:text-sm leading-relaxed">
                  Eu li e concordo com os <button className="text-[#FCD535] hover:underline">Termos e Condições</button>{" "}
                  para saque.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleWithdrawal}
              className={`w-full py-3 sm:py-4 rounded-lg font-medium text-black transition-colors text-sm sm:text-base ${
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
          <div className="w-full lg:w-80 mt-6 lg:mt-0">
            <div className="bg-[#1E2329] rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-medium text-white mb-4 sm:mb-6">FAQ - Perguntas frequentes</h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#2B3139] rounded-full flex items-center justify-center text-[#848E9C] text-sm font-medium flex-shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <button className="text-left text-white hover:text-[#FCD535] flex items-center justify-between w-full group text-sm sm:text-base">
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
                    <button className="text-left text-white hover:text-[#FCD535] flex items-center justify-between w-full group text-sm sm:text-base">
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
                    <button className="text-left text-white hover:text-[#FCD535] flex items-center justify-between w-full group text-sm sm:text-base">
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
  )
}
