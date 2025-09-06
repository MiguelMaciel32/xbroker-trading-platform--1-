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
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")
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
    <>
      <div
        className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%)",
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10"
            style={{
              background: "radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)",
              animation: "float 6s ease-in-out infinite",
            }}
          />
          <div
            className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10"
            style={{
              background: "radial-gradient(circle, rgba(34, 197, 94, 0.3) 0%, transparent 70%)",
              animation: "float 8s ease-in-out infinite reverse",
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-5"
            style={{
              background: "radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)",
              animation: "pulse 4s ease-in-out infinite",
            }}
          />
        </div>

        <div
          className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative z-10"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 25px 80px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(25px)",
            width: "min(440px, 94vw)",
            padding: "26px 24px",
            position: "relative",
          }}
        >
          <div
            className="absolute inset-0 rounded-2xl opacity-20"
            style={{
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%)",
              pointerEvents: "none",
            }}
          />

          <div className="pt-2 pb-6 px-0 text-center">
            <img src="/logo/logo.png" alt="Logo" className="w-40 mx-auto block" />
          </div>

          <div className="px-0 pb-2">
            <p className="text-center text-gray-300 mb-6 text-sm">Entre ou crie sua conta para começar a negociar</p>

            <div
              className="flex mb-6 rounded-lg overflow-hidden relative"
              style={{
                background: "rgba(0, 0, 0, 0.15)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab("login")}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-200 ${
                  activeTab === "login" ? "text-white" : "text-gray-400 hover:text-white"
                }`}
                style={{
                  background: activeTab === "login" ? "rgba(255, 255, 255, 0.1)" : "transparent",
                  borderRadius: activeTab === "login" ? "6px" : "0",
                }}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("register")}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-200 ${
                  activeTab === "register" ? "text-white" : "text-gray-400 hover:text-white"
                }`}
                style={{
                  background: activeTab === "register" ? "rgba(255, 255, 255, 0.1)" : "transparent",
                  borderRadius: activeTab === "register" ? "6px" : "0",
                }}
              >
                Criar conta
              </button>
            </div>

            {activeTab === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 border-0 focus:ring-1 focus:ring-blue-500 transition-colors"
                    style={{
                      background: "rgba(0, 0, 0, 0.3)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                    required
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Senha</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-20 rounded-lg text-white placeholder-gray-500 border-0 focus:ring-1 focus:ring-blue-500 transition-colors"
                    style={{
                      background: "rgba(0, 0, 0, 0.25)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      backdropFilter: "blur(10px)",
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-11 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? "ocultar" : "mostrar"}
                  </button>
                </div>

                {error && (
                  <div className="p-3 rounded-lg text-sm text-red-400 border border-red-500/20 bg-red-500/10">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !email || !password}
                  className="w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                  style={{
                    background: "#4ade80",
                    boxShadow: "0 4px 15px rgba(74, 222, 128, 0.3)",
                  }}
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="voce@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 border-0 focus:ring-1 focus:ring-blue-500 transition-colors"
                    style={{
                      background: "rgba(0, 0, 0, 0.3)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                    required
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Senha</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="mín. 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    className="w-full px-4 py-3 pr-20 rounded-lg text-white placeholder-gray-500 border-0 focus:ring-1 focus:ring-blue-500 transition-colors"
                    style={{
                      background: "rgba(0, 0, 0, 0.25)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      backdropFilter: "blur(10px)",
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-11 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? "ocultar" : "mostrar"}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Telefone</label>
                    <input
                      type="tel"
                      placeholder="+55 11 99999-9999"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 border-0 focus:ring-1 focus:ring-blue-500 transition-colors"
                      style={{
                        background: "rgba(0, 0, 0, 0.25)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        backdropFilter: "blur(10px)",
                      }}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">País</label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg text-white border-0 focus:ring-1 focus:ring-blue-500 transition-colors"
                      style={{
                        background: "rgba(0, 0, 0, 0.25)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        backdropFilter: "blur(10px)",
                      }}
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
                  <div className="p-3 rounded-lg text-sm text-red-400 border border-red-500/20 bg-red-500/10">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !email || !password || !phone || !country}
                  className="w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                  style={{
                    background: "#4ade80",
                    boxShadow: "0 4px 15px rgba(74, 222, 128, 0.3)",
                  }}
                >
                  {isLoading ? "Criando conta..." : "Criar conta"}
                </button>

                <div className="text-center text-xs text-gray-400 mt-4">
                  Ao continuar, você concorda com nossos Termos & Política de Privacidade.
                </div>
              </form>
            )}
          </div>
        </div>

        {showResetModal && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
            onClick={(e) => e.target === e.currentTarget && setShowResetModal(false)}
          >
            <div
              className="w-full max-w-md rounded-2xl shadow-2xl relative"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow: "0 25px 80px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(25px)",
              }}
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-600">
                <h3 className="text-xl font-semibold text-white">Redefinir senha</h3>
                <button
                  onClick={() => setShowResetModal(false)}
                  className="text-gray-400 hover:text-white transition-colors text-xl"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleResetSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="w-full px-4 py-3 rounded-lg text-gray-400"
                    style={{
                      background: "rgba(0, 0, 0, 0.2)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      backdropFilter: "blur(10px)",
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nova senha</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={6}
                    className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 border-0 focus:ring-1 focus:ring-blue-500 transition-colors"
                    style={{
                      background: "rgba(0, 0, 0, 0.25)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      backdropFilter: "blur(10px)",
                    }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirmar nova senha</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={6}
                    className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 border-0 focus:ring-1 focus:ring-blue-500 transition-colors"
                    style={{
                      background: "rgba(0, 0, 0, 0.25)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      backdropFilter: "blur(10px)",
                    }}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 hover:shadow-lg"
                  style={{
                    background: "#4ade80",
                    boxShadow: "0 4px 15px rgba(74, 222, 128, 0.3)",
                  }}
                >
                  Salvar nova senha
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.05; transform: scale(1); }
          50% { opacity: 0.1; transform: scale(1.1); }
        }
      `}</style>
    </>
  )
}
