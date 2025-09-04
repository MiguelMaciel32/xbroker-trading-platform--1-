"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"

interface PlatformConfig {
  platform_name: string
  platform_logo: string
}

interface PlatformConfigRow {
  key: string
  value: string
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState<"email" | "password">("email")
  const [platformConfig, setPlatformConfig] = useState<PlatformConfig>({
    platform_name: "Trading Platform",
    platform_logo:
      "https://media.discordapp.net/attachments/1191807892936986756/1408228383128551534/Captura_de_Tela_2025-08-21_as_20.16.28-removebg-preview.png?ex=68a8fa62&is=68a7a8e2&hm=527693bc110e80e51760a1cfcc0b1e3a4616517b98b7fcf8a9fffa342ba6f059&=&format=webp&quality=lossless&width=1008&height=990",
  })
  const router = useRouter()

  useEffect(() => {
    const fetchPlatformConfig = async () => {
      try {
        const { data, error } = await supabase
          .from("platform_config")
          .select("key, value")
          .in("key", ["platform_name", "platform_logo"])

        if (error) {
          console.error("Error fetching platform config:", error)
          return
        }

        const config: Record<string, string> = {}
        data?.forEach((item) => {
          const configItem = item as PlatformConfigRow
          config[configItem.key] = configItem.value
        })

        setPlatformConfig({
          platform_name: config.platform_name || "Trading Platform",
          platform_logo:
            config.platform_logo ||
            "https://media.discordapp.net/attachments/1191807892936986756/1408228383128551534/Captura_de_Tela_2025-08-21_as_20.16.28-removebg-preview.png?ex=68a8fa62&is=68a7a8e2&hm=527693bc110e80e51760a1cfcc0b1e3a4616517b98b7fcf8a9fffa342ba6f059&=&format=webp&quality=lossless&width=1008&height=990",
        })
      } catch (err) {
        console.error("Error fetching platform config:", err)
      }
    }

    fetchPlatformConfig()
  }, [])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStep("password")
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
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

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    setError("")

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/trading`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })

      if (error) {
        setError(error.message)
        setIsGoogleLoading(false)
      }
      // O redirecionamento vai acontecer automaticamente, então não precisa setIsGoogleLoading = false aqui
    } catch (err) {
      setError("Erro ao fazer login com Google. Tente novamente.")
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={
        {
          overflow: "auto",
          "--color-BasicBg": "#181A20",
          "--color-SecondaryBg": "#0B0E11",
          "--color-Input": "#2B3139",
          "--color-InputLine": "#474D57",
          "--color-CardBg": "#1E2329",
          "--color-Vessel": "#1E2329",
          "--color-Line": "#2B3139",
          "--color-DisableBtn": "#2B3139",
          "--color-DisableText": "#5E6673",
          "--color-TertiaryText": "#848E9C",
          "--color-SecondaryText": "#B7BDC6",
          "--color-PrimaryText": "#EAECEF",
          "--color-RedGreenBgText": "#FFFFFF",
          "--color-EmphasizeText": "#FF693D",
          "--color-TextOnGray": "#EAECEF",
          "--color-TextOnYellow": "#202630",
          "--color-IconNormal": "#848E9C",
          "--color-LiteBg1": "#202630",
          "--color-LiteBg2": "#191A1F",
          "--color-BtnBg": "#FCD535",
          "--color-PrimaryYellow": "#F0B90B",
          "--color-TextLink": "#F0B90B",
          "--color-TradeBg": "#0B0E11",
          "--color-TextToast": "#A37200",
          "--color-DepthSellBg": "#35141D",
          "--color-SellHover": "#FF707E",
          "--color-Sell": "#F6465D",
          "--color-TextSell": "#F6465D",
          "--color-DepthBuyBg": "#102821",
          "--color-BuyHover": "#32D993",
          "--color-Buy": "#2EBD85",
          "--color-TextBuy": "#2EBD85",
          "--color-Error": "#F6465D",
          "--color-SuccessBg": "#102821",
          "--color-Success": "#2EBD85",
          "--color-TagBg": "#474D57",
          "--color-Grid": "#2B3139",
          "--color-Placeholder": "#474D57",
          "--color-ToastBg": "#707A8A",
          "--color-TwoColorIcon": "#CACED3",
          "--color-ErrorBg": "rgba(246, 70, 93, 0.1)",
          "--color-BadgeBg": "rgba(240,185,11,0.1)",
          "--color-Popup": "#2B3139",
          "--color-Mask": "rgba(11, 14, 17, 0.6)",
          "--color-WidgetSecondaryBg": "rgba(193, 204, 219, 0.08)",
          "--color-ContainerBg": "#1E2329",
          "--color-YellowAlpha10": "rgba(252, 213, 53, 0.1)",
          "--color-YellowAlpha20": "rgba(252, 213, 53, 0.2)",
          "--color-RedAlpha10": "rgba(246, 70, 93, 0.1)",
          "--color-RedAlpha20": "rgba(246, 70, 93, 0.2)",
          "--color-GreenAlpha10": "rgba(46, 189, 133, 0.1)",
          "--color-GreenAlpha20": "rgba(46, 189, 133, 0.2)",
          backgroundColor: "var(--color-BasicBg)",
        } as React.CSSProperties
      }>
      <div className="flex min-h-screen">
        <main className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-[425px] px-6">
            <div className="rounded-lg border p-8" style={{ backgroundColor: "var(--color-Vessel)", borderColor: "var(--color-Line)" }}>
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-8">
                  <img src="/logo/logo.png" width={60} height={60} alt="Logo" />
                </div>
              </div>

              <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-normal" style={{ color: "var(--color-PrimaryText)" }}>
                  Login
                </h1>
              </div>

              {step === "email" ? (
                <form onSubmit={handleEmailSubmit}>
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-PrimaryText)" }}>
                      E-mail
                    </label>
                    <input
                      type="text"
                      placeholder="Digite seu E-mail"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border text-base focus:outline-none focus:ring-1"
                      style={{ backgroundColor: "var(--color-Input)", color: "var(--color-PrimaryText)", borderColor: "var(--color-InputLine)" }}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-lg font-medium text-base transition-colors disabled:opacity-50"
                    style={{ backgroundColor: "var(--color-BtnBg)", color: "var(--color-TextOnYellow)" }}
                    disabled={!email}
                  >
                    Próximo
                  </button>
                </form>
              ) : (
                <form onSubmit={handlePasswordSubmit}>
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-PrimaryText)" }}>
                      Senha
                    </label>
                    <input
                      type="password"
                      placeholder="Digite sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border text-base focus:outline-none focus:ring-1"
                      style={{ backgroundColor: "var(--color-Input)", color: "var(--color-PrimaryText)", borderColor: "var(--color-InputLine)" }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setStep("email")}
                      className="text-sm mt-2 hover:opacity-80"
                      style={{ color: "var(--color-TertiaryText)" }}
                    >
                      ← Voltar ao e-mail
                    </button>
                  </div>

                  {error && (
                    <div className="px-4 py-3 rounded-lg text-sm border mb-4" style={{ backgroundColor: "var(--color-ErrorBg)", borderColor: "var(--color-Error)", color: "var(--color-Error)" }}>
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-lg font-medium text-base transition-colors disabled:opacity-50"
                    style={{ backgroundColor: "var(--color-BtnBg)", color: "var(--color-TextOnYellow)" }}
                    disabled={isLoading || !password}
                  >
                    {isLoading ? "Entrando..." : "Entrar"}
                  </button>
                </form>
              )}

              {step === "email" && (
                <>
                  <div className="my-6 flex items-center">
                    <div className="h-px flex-1" style={{ backgroundColor: "var(--color-Line)" }}></div>
                    <div className="px-4 text-sm" style={{ color: "var(--color-TertiaryText)" }}>
                      ou
                    </div>
                    <div className="h-px flex-1" style={{ backgroundColor: "var(--color-Line)" }}></div>
                  </div>

                 
                </>
              )}
            </div>
            <div className="mt-6"></div>
            <Link href="/register" className="text-sm ml-24 hover:opacity-80 transition-opacity" style={{ color: "var(--color-TextLink)" }}>
              Criar uma Conta {platformConfig.platform_name}
            </Link>
          </div>
        </main>
      </div>
    </div>
  )
}
