"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [country, setCountry] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<"login" | "register">("register")
  const [showPassword, setShowPassword] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user) {
        try {
          const { error: profileError } = await supabase.from("user_profiles").upsert({
            id: data.user.id,
            email: data.user.email,
          })

          if (profileError) {
            console.error("Error creating user profile:", profileError)
          }
        } catch (profileErr) {
          console.error("Error creating user profile:", profileErr)
        }

        router.push("/trading")
        router.refresh()
      }
    } catch (err) {
      setError("Erro inesperado. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            phone,
            country,
          },
        },
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          setError("Conta criada, mas erro ao fazer login automático. Tente fazer login manualmente.")
          setActiveTab("login")
          return
        }

        try {
          const { error: profileError } = await supabase.from("user_profiles").upsert({
            id: data.user.id,
            email: data.user.email,
            phone,
            country,
          })

          if (profileError) {
            console.error("Error creating user profile:", profileError)
          }
        } catch (profileErr) {
          console.error("Error creating user profile:", profileErr)
        }

        router.push("/trading")
        router.refresh()
      }
    } catch (err) {
      setError("Erro inesperado. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = () => {
    if (!email.trim()) {
      alert("Digite seu e-mail no formulário de login antes de redefinir a senha.")
      return
    }
    setShowResetModal(true)
  }

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      alert("As senhas não coincidem.")
      return
    }
    setShowResetModal(false)
    setNewPassword("")
    setConfirmPassword("")
    alert("Funcionalidade de redefinir senha será implementada em breve.")
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-black">Aurum Broker</h1>
          </div>
          <p className="text-gray-600 mt-3 text-sm">Entre ou crie sua conta para começar a negociar</p>
        </div>

        <div className="bg-gray-100 rounded-xl p-1 mb-6 flex">
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "login"
                ? "bg-white text-black shadow-sm"
                : "text-gray-600 hover:text-black"
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "register"
                ? "bg-white text-black shadow-sm"
                : "text-gray-600 hover:text-black"
            }`}
          >
            Criar conta
          </button>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-xl p-8 shadow-sm">
          {activeTab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-black font-semibold mb-2 text-sm">Email</label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-black placeholder-gray-400 focus:border-black focus:outline-none transition-colors"
                  required
                />
              </div>

              <div className="relative">
                <label className="block text-black font-semibold mb-2 text-sm">Senha</label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-24 bg-white border-2 border-gray-200 rounded-lg text-black placeholder-gray-400 focus:border-black focus:outline-none transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-sm text-gray-500 hover:text-black transition-colors font-medium"
                >
                  {showPassword ? "ocultar" : "mostrar"}
                </button>
              </div>

              {error && (
                <div className="p-3 rounded-lg text-sm text-red-600 bg-red-50 border border-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !email || !password}
                className={`w-full py-3 px-4 rounded-lg font-bold transition-all ${
                  isLoading || !email || !password
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-800 shadow-md"
                }`}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="text-sm text-gray-600 hover:text-black transition-colors font-medium"
                >
                  Esqueceu a senha?
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-black font-semibold mb-2 text-sm">Email</label>
                <input
                  type="email"
                  placeholder="voce@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-black placeholder-gray-400 focus:border-black focus:outline-none transition-colors"
                  required
                />
              </div>

              <div className="relative">
                <label className="block text-black font-semibold mb-2 text-sm">Senha</label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="mín. 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  className="w-full px-4 py-3 pr-24 bg-white border-2 border-gray-200 rounded-lg text-black placeholder-gray-400 focus:border-black focus:outline-none transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-sm text-gray-500 hover:text-black transition-colors font-medium"
                >
                  {showPassword ? "ocultar" : "mostrar"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-black font-semibold mb-2 text-sm">Telefone</label>
                  <input
                    type="tel"
                    placeholder="+55 11 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-black placeholder-gray-400 focus:border-black focus:outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-black font-semibold mb-2 text-sm">País</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-black focus:border-black focus:outline-none transition-colors"
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="BR">Brasil</option>
                    <option value="US">Estados Unidos</option>
                    <option value="AR">Argentina</option>
                    <option value="CL">Chile</option>
                    <option value="CO">Colômbia</option>
                    <option value="UY">Uruguai</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg text-sm text-red-600 bg-red-50 border border-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !email || !password || !phone || !country}
                className={`w-full py-3 px-4 rounded-lg font-bold transition-all ${
                  isLoading || !email || !password || !phone || !country
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-800 shadow-md"
                }`}
              >
                {isLoading ? "Criando conta..." : "Criar conta"}
              </button>

              <div className="text-center text-xs text-gray-500 pt-2">
                Ao continuar, você concorda com nossos Termos & Política de Privacidade.
              </div>
            </form>
          )}
        </div>
      </div>

      {showResetModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setShowResetModal(false)}
        >
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b-2 border-gray-200">
              <h3 className="text-xl font-bold text-black">Redefinir senha</h3>
              <button
                onClick={() => setShowResetModal(false)}
                className="text-gray-400 hover:text-black text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleResetSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-black font-semibold mb-2 text-sm">E-mail</label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-lg text-gray-600"
                />
              </div>

              <div>
                <label className="block text-black font-semibold mb-2 text-sm">Nova senha</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                  placeholder="mín. 6 caracteres"
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-black placeholder-gray-400 focus:border-black focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-black font-semibold mb-2 text-sm">Confirmar nova senha</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                  placeholder="mín. 6 caracteres"
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-black placeholder-gray-400 focus:border-black focus:outline-none transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-lg font-bold bg-black text-white hover:bg-gray-800 transition-all shadow-md"
              >
                Salvar nova senha
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}