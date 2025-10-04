"use client"

import { useState } from "react"
import { CheckCircle } from "lucide-react"

export default function SaquePage() {
  const [withdrawalAmount, setWithdrawalAmount] = useState("200")
  const [pixKey, setPixKey] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [balance, setBalance] = useState(5000)
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(false)
  const predefinedAmounts = [200, 1000, 2000, 100, 500, 1500, 4000]

  const handleAmountSelect = (amount: number) => {
    setWithdrawalAmount(amount.toString())
  }

  const showToast = (title: string, description: string, variant: "default" | "destructive" = "default") => {
    console.log(`Toast: ${title} - ${description}`)
  }

  const handleWithdrawal = () => {
    const withdrawalValue = Number.parseFloat(withdrawalAmount)

    if (!withdrawalAmount || !pixKey || !agreedToTerms) {
      showToast("Campos obrigatórios", "Por favor, preencha todos os campos obrigatórios.", "destructive")
      return
    }

    if (withdrawalValue <= 0) {
      showToast("Valor inválido", "O valor do saque deve ser maior que zero.", "destructive")
      return
    }

    if (withdrawalValue > balance) {
      showToast("Saldo insuficiente", `Seu saldo atual é R$ ${balance.toFixed(2)}`, "destructive")
      return
    }

    if (withdrawalValue < 10) {
      showToast("Valor mínimo", "O valor mínimo para saque é R$ 10,00", "destructive")
      return
    }

    setWithdrawalSuccess(true)
  }

  return (
    <div className="min-h-screen bg-[#141d2f] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="text-sm text-[#848E9C] mb-2">
            <span className="hover:text-white cursor-pointer">Método de saque</span>
            <span className="mx-2">›</span>
            <span className="text-white font-medium">PIX</span>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {withdrawalSuccess ? (
            <div className="bg-[#101825] rounded-lg p-8 text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-[#26d47c]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Solicitação de Saque Enviada!</h2>
              <p className="text-[#848E9C] mb-2">
                Sua solicitação de saque de <span className="text-white font-semibold">R$ {withdrawalAmount}</span> foi
                enviada com sucesso.
              </p>
              <p className="text-[#848E9C] mb-6">
                O valor será creditado na chave PIX <span className="text-white font-semibold">{pixKey}</span> em até 72
                horas.
              </p>
              <button
                onClick={() => setWithdrawalSuccess(false)}
                className="py-3 px-8 bg-[#26d47c] text-black font-medium rounded-lg hover:bg-[#22c470] transition-colors"
              >
                Fazer Novo Saque
              </button>
            </div>
          ) : (
            <div className="bg-[#101825] rounded-lg p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    src="https://aurumtraderbroker.site/pix.png"
                    alt="PIX Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <h2 className="text-2xl font-bold text-white">PIX</h2>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-6">
                <p className="text-blue-400 text-sm">
                  Após a solicitação, o valor do saque será creditado em sua conta em até 72 horas.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-medium mb-3">Valor do saque</label>
                  <input
                    type="text"
                    value={`R$ ${withdrawalAmount}`}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^\d]/g, "")
                      setWithdrawalAmount(value)
                    }}
                    className="w-full p-3 bg-[#1a2332] border border-[#2B3139] rounded-lg text-white focus:border-[#26d47c] focus:outline-none"
                  />

                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {predefinedAmounts.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => handleAmountSelect(amount)}
                        className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                          withdrawalAmount === amount.toString()
                            ? "bg-[#26d47c] text-black"
                            : "bg-[#2B3139] text-white hover:bg-[#434C5A]"
                        }`}
                      >
                        R$ {amount.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-3">Chave PIX para receber</label>
                  <input
                    type="text"
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                    placeholder="CPF, e-mail, telefone..."
                    className="w-full p-3 bg-[#1a2332] border border-[#2B3139] rounded-lg text-white placeholder-[#848E9C] focus:border-[#26d47c] focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-4 h-4 text-[#26d47c] bg-[#2B3139] border-[#434C5A] rounded focus:ring-[#26d47c] focus:ring-2"
                  />
                  <span className="text-[#848E9C] text-sm">Eu, por meio deste, aceito os Termos e Condições</span>
                </label>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => window.history.back()}
                  className="flex-1 py-3 px-6 bg-transparent border border-[#434C5A] text-white rounded-lg hover:bg-[#2B3139] transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={handleWithdrawal}
                  className="flex-1 py-3 px-6 bg-[#26d47c] text-black font-medium rounded-lg hover:bg-[#22c470] transition-colors"
                >
                  Confirmar Saque
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
