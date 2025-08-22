"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      setError("Senhas não coincidem")
      return
    }

    if (formData.password.length < 6) {
      setError("Senha deve ter pelo menos 6 caracteres")
      return
    }

    if (!formData.acceptTerms) {
      setError("Você deve aceitar os termos de uso")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
          },
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/trading`,
        },
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user) {
        if (data.user.email_confirmed_at) {
          router.push("/trading")
          router.refresh()
        } else {
          setSuccess("Conta criada com sucesso! Verifique seu email para confirmar a conta e fazer login.")
        }
      }
    } catch (err) {
      setError("Erro inesperado. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundColor: "#181A20",
        color: "#EAECEF",
      }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8 ml-34">
          <svg height="24" width="120" viewBox="0 0 120 24" xmlns="http://www.w3.org/2000/svg">
                    <path
                      fill="#F0B90B"
                      d="M5.41406 12L2.71875 14.6953L0 12L2.71875 9.28125L5.41406 12ZM12 5.41406L16.6406 10.0547L19.3594 7.33594L12 0L4.64062 7.35938L7.35938 10.0781L12 5.41406ZM21.2812 9.28125L18.5859 12L21.3047 14.7188L24.0234 12L21.2812 9.28125ZM12 18.5859L7.35938 13.9219L4.64062 16.6406L12 24L19.3594 16.6406L16.6406 13.9219L12 18.5859ZM12 14.6953L14.7188 11.9766L12 9.28125L9.28125 12L12 14.6953ZM40.5938 14.9766V14.9297C40.5938 13.1719 39.6562 12.2812 38.1328 11.6953C39.0703 11.1797 39.8672 10.3359 39.8672 8.85938V8.8125C39.8672 6.75 38.2031 5.41406 35.5312 5.41406H29.4141V18.5625H35.6719C38.6484 18.5859 40.5938 17.3672 40.5938 14.9766ZM36.9844 9.35156C36.9844 10.3359 36.1875 10.7344 34.8984 10.7344H32.2266V7.94531H35.0859C36.3047 7.94531 36.9844 8.4375 36.9844 9.30469V9.35156ZM37.7109 14.6016C37.7109 15.5859 36.9375 16.0312 35.6719 16.0312H32.2266V13.1484H35.5781C37.0547 13.1484 37.7109 13.6875 37.7109 14.5781V14.6016ZM46.6641 18.5625V5.41406H43.7578V18.5625H46.6641ZM62.2266 18.5859V5.41406H59.3672V13.5234L53.2031 5.41406H50.5312V18.5625H53.3906V10.2188L59.7656 18.5859H62.2266ZM78.2578 18.5859L72.6094 5.34375H69.9375L64.2891 18.5859H67.2656L68.4609 15.6328H74.0156L75.2109 18.5859H78.2578ZM72.9844 13.0781H69.4922L71.25 8.8125L72.9844 13.0781ZM92.0625 18.5859V5.41406H89.2031V13.5234L83.0391 5.41406H80.3672V18.5625H83.2266V10.2188L89.6016 18.5859H92.0625ZM106.992 16.4531L105.141 14.6016C104.109 15.5391 103.195 16.1484 101.672 16.1484C99.4219 16.1484 97.8516 14.2734 97.8516 12.0234V11.9531C97.8516 9.70312 99.4453 7.85156 101.672 7.85156C102.984 7.85156 104.016 8.41406 105.047 9.32812L106.898 7.19531C105.68 6 104.203 5.15625 101.719 5.15625C97.6875 5.15625 94.8516 8.22656 94.8516 11.9531V12C94.8516 15.7734 97.7344 18.7734 101.602 18.7734C104.133 18.7969 105.633 17.9062 106.992 16.4531ZM119.344 18.5625V16.0078H112.195V13.2422H118.406V10.6641H112.195V7.99219H119.25V5.41406H109.336V18.5625H119.344Z"
                    />
                  </svg>
        </div>

        <div
          className="rounded-lg p-8 shadow-xl border"
          style={{
            backgroundColor: "#1E2329",
            borderColor: "#2B3139",
          }}
        >
          <div className="flex items-center justify-between mb-8 pb-4 border-b" style={{ borderColor: "#2B3139" }}>
            <div className="flex gap-6">
              <Link href="/login" className="hover:opacity-80" style={{ color: "#848E9C" }}>
                Entrar
              </Link>
              <span className="font-semibold border-b-2 pb-1" style={{ color: "#EAECEF", borderColor: "#F0B90B" }}>
                Registre-se
              </span>
            </div>
           
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div
                className="px-4 py-3 rounded-lg text-sm border"
                style={{
                  backgroundColor: "rgba(246, 70, 93, 0.1)",
                  borderColor: "rgba(246, 70, 93, 0.3)",
                  color: "#F6465D",
                }}
              >
                {error}
              </div>
            )}

            {success && (
              <div
                className="px-4 py-3 rounded-lg text-sm border"
                style={{
                  backgroundColor: "rgba(14, 203, 129, 0.1)",
                  borderColor: "rgba(14, 203, 129, 0.3)",
                  color: "#0ECB81",
                }}
              >
                {success}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#EAECEF" }}>
                Nome Completo
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Digite seu nome completo"
                className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-1 border"
                style={{
                  backgroundColor: "#1A1D23",
                  color: "#EAECEF",
                  borderColor: "#2B3139",
                }}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#EAECEF" }}>
                E-mail
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Digite seu e-mail"
                className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-1 border"
                style={{
                  backgroundColor: "#1A1D23",
                  color: "#EAECEF",
                  borderColor: "#2B3139",
                }}
                required
              />
              <p className="text-xs mt-2" style={{ color: "#848E9C" }}>
                Não é possível alterar o e-mail no futuro. Ao especificar um e-mail inexistente ou incorreto, a retirada
                de fundos da conta será impossível.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#EAECEF" }}>
                Senha
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Digite sua senha"
                className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-1 border"
                style={{
                  backgroundColor: "#1A1D23",
                  color: "#EAECEF",
                  borderColor: "#2B3139",
                }}
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#EAECEF" }}>
                Confirmar Senha
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                placeholder="Confirme sua senha"
                className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-1 border"
                style={{
                  backgroundColor: "#1A1D23",
                  color: "#EAECEF",
                  borderColor: "#2B3139",
                }}
                required
                minLength={6}
              />
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="acceptTerms"
                checked={formData.acceptTerms}
                onChange={(e) => handleInputChange("acceptTerms", e.target.checked)}
                className="mt-1 w-4 h-4 rounded focus:ring-2"
                style={{
                  backgroundColor: "#1A1D23",
                  borderColor: "#2B3139",
                }}
              />
              <label htmlFor="acceptTerms" className="text-sm" style={{ color: "#EAECEF" }}>
                Aceito os{" "}
                <Link href="/terms" className="hover:opacity-80" style={{ color: "#F0B90B" }}>
                  termos de uso
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || !formData.acceptTerms}
              className="w-full font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "#FCD535",
                color: "#202630",
              }}
            >
              {isLoading ? "Criando conta..." : "Criar Conta"}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: "#2B3139" }}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span
                  className="px-4"
                  style={{
                    backgroundColor: "#1E2329",
                    color: "#848E9C",
                  }}
                >
                  ou
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg transition-colors border hover:bg-opacity-80"
                style={{
                  backgroundColor: "#1A1D23",
                  color: "#EAECEF",
                  borderColor: "#2B3139",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue com o Google
              </button>
            </div>
          </form>

          <div className="text-center mt-6">
            <a
              href="https://wa.me/5547988982977?text=Ola%20preciso%20de%20suporte"
              target="_blank"
              rel="noreferrer"
              className="text-sm hover:opacity-80"
              style={{ color: "#F0B90B" }}
            >
              Suporte
            </a>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 mt-8 text-sm" style={{ color: "#848E9C" }}>
          <button className="flex items-center gap-1 hover:opacity-80">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            Português (Brasil)
          </button>
          <Link href="/cookies" className="hover:opacity-80">
            Cookies
          </Link>
          <Link href="/terms" className="hover:opacity-80">
            Termos
          </Link>
          <Link href="/privacy" className="hover:opacity-80">
            Privacidade
          </Link>
        </div>
      </div>
    </div>
  )
}
