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

  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`)
  }

  return (
    <div
      className="min-h-screen"
      style={
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
      }
    >
      <div className="flex min-h-screen ">
        <main className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-[425px] px-6">
            <div
              className="rounded-lg border p-8"
              style={{
                backgroundColor: "var(--color-Vessel)",
                borderColor: "var(--color-Line)",
              }}
            >
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-8">
                  <img
                    src="/logo/logo.png"
                    width={60}
                    height={60}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-normal" style={{ color: "var(--color-PrimaryText)" }}>
                  Login
                </h1>
                <div
                  className="h-10 w-10 flex items-center justify-center rounded-lg cursor-pointer hover:bg-[var(--color-Input)]"
                  style={{ backgroundColor: "var(--color-Vessel)" }}
                >
                  <svg color="white" width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M10.077 12.576c.743 0 1.347.604 1.347 1.347v6.73c0 .744-.604 1.347-1.347 1.347h-6.73A1.347 1.347 0 012 20.654v-6.731c0-.743.603-1.347 1.346-1.347h6.731zm4.807 6.635c.233 0 .427.165.472.384l.01.097v1.683a.481.481 0 01-.385.471l-.097.01h-1.682a.481.481 0 01-.472-.385l-.009-.096v-1.683a.48.48 0 01.48-.48h1.683zm4.327-2.163a.48.48 0 01.481.48v1.683h1.683a.48.48 0 01.48.481v1.683a.48.48 0 01-.48.48h-3.846a.481.481 0 01-.472-.384l-.01-.096v-3.846a.48.48 0 01.482-.481h1.682zm-15.48 3.22h5.961v-5.96h-5.96v5.96zm3.942-4.422a.48.48 0 01.481.48v1.924a.48.48 0 01-.48.48H5.75a.48.48 0 01-.48-.48v-1.923a.48.48 0 01.48-.481h1.683zm9.375-3.125a.48.48 0 01.48.48v1.683a.48.48 0 01-.48.481h-1.683v1.683a.48.48 0 01-.48.48h-1.683a.481.481 0 01-.472-.383l-.009-.097v-3.846a.48.48 0 01.48-.48h3.847zm4.327 0c.232 0 .426.165.471.384l.01.097v1.682a.481.481 0 01-.385.472l-.096.01h-1.683a.481.481 0 01-.471-.385l-.01-.097v-1.682a.48.48 0 01.481-.48h1.683zM10.077 2c.743 0 1.347.603 1.347 1.346v6.731c0 .743-.604 1.347-1.347 1.347h-6.73A1.347 1.347 0 012 10.077v-6.73C2 2.602 2.603 2 3.346 2h6.731zm10.577 0C21.396 2 22 2.603 22 3.346v6.731c0 .743-.603 1.347-1.346 1.347h-6.731a1.347 1.347 0 01-1.347-1.347v-6.73c0-.744.604-1.347 1.347-1.347h6.73zM3.73 9.692h5.961v-5.96h-5.96v5.96zm10.577 0h5.96v-5.96h-5.96v5.96zM7.673 5.269a.48.48 0 01.481.481v1.923a.48.48 0 01-.48.481H5.75a.48.48 0 01-.48-.48V5.75a.48.48 0 01.48-.48h1.923zm10.577 0a.48.48 0 01.48.481v1.923a.48.48 0 01-.48.481h-1.923a.48.48 0 01-.481-.48V5.75a.48.48 0 01.48-.48h1.924z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </div>

              {step === "email" ? (
                <form onSubmit={handleEmailSubmit}>
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-PrimaryText)" }}>
                      E-mail
                    </label>
                    <div>
                      <input
                        type="text"
                        placeholder="E-mail (sem o código do país)"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border text-base focus:outline-none focus:ring-1"
                        style={{
                          backgroundColor: "var(--color-Input)",
                          color: "var(--color-PrimaryText)",
                          borderColor: "var(--color-InputLine)",
                        }}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-lg font-medium text-base transition-colors disabled:opacity-50"
                    style={{
                      backgroundColor: "var(--color-BtnBg)",
                      color: "var(--color-TextOnYellow)",
                    }}
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
                      style={{
                        backgroundColor: "var(--color-Input)",
                        color: "var(--color-PrimaryText)",
                        borderColor: "var(--color-InputLine)",
                      }}
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
                    <div
                      className="px-4 py-3 rounded-lg text-sm border mb-4"
                      style={{
                        backgroundColor: "var(--color-ErrorBg)",
                        borderColor: "var(--color-Error)",
                        color: "var(--color-Error)",
                      }}
                    >
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-lg font-medium text-base transition-colors disabled:opacity-50"
                    style={{
                      backgroundColor: "var(--color-BtnBg)",
                      color: "var(--color-TextOnYellow)",
                    }}
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

                  <div className="space-y-3">
                    <button
                      type="button"
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border transition-colors"
                      style={{
                        backgroundColor: "var(--color-Input)",
                        color: "var(--color-PrimaryText)",
                        borderColor: "var(--color-InputLine)",
                      }}
                      onClick={() => handleSocialLogin("google")}
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
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 2.43-4.53 4.12-4.53z"
                        />
                      </svg>
                      Continue com o Google
                    </button>
                  </div>
                </>
              )}
            </div>
            <div className="mt-6"></div>
            <Link
              href="/register"
              className="text-sm ml-24 hover:opacity-80 transition-opacity"
              style={{ color: "var(--color-TextLink)" }}
            >
              Criar uma Conta {platformConfig.platform_name}
            </Link>
          </div>
        </main>
      </div>

      <footer className="flex flex-col items-center pb-8">
        <div className="flex items-center justify-center gap-6 text-sm" style={{ color: "var(--color-SecondaryText)" }}>
          <button className="flex items-center gap-1 hover:opacity-80 transition-opacity">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path
                d="M20.6 18.26h-1.545a1 1 0 00-.767.358l-.075.103-.713 1.111-.713-1.111-.075-.103a1 1 0 00-.767-.358H14.4V14.4h6.2v3.86zm-8 .4a1.4 1.4 0 001.4 1.4h1.508l1.15 1.795a1 1 0 001.684 0l1.15-1.794H21a1.4 1.4 0 001.4-1.4V14a1.4 1.4 0 00-1.4-1.4h-7a1.4 1.4 0 00-1.4 1.4v4.66zM12.393 1.957a.9.9 0 011.206.018l.065.065.369.442c1.672 2.093 2.636 4.657 3.075 7.324l.086.572.008.092a.9.9 0 01-1.775.242l-.017-.09-.08-.526c-.401-2.44-1.268-4.694-2.703-6.49l-.317-.378-.056-.072a.9.9 0 01.14-1.199zM11.541 1.905a.9.9 0 00-1.199.128l-.058.073-.341.485C6.52 7.603 6.537 12.38 7.457 15.926a18.078 18.078 0 001.767 4.345c.294.518.56.926.756 1.208.097.14.178.25.235.326l.088.114.006.008.002.003c.001.001.01-.005.562-.451l-.56.452a.9.9 0 101.4-1.13h.001V20.8l-.012-.014-.048-.063a8.804 8.804 0 01-.196-.27 14.141 14.141 0 01-.669-1.07 16.286 16.286 0 01-1.589-3.91c-.813-3.137-.85-7.36 2.233-11.873l.308-.438.05-.077a.9.9 0 00-.25-1.18z"
                fill="currentColor"
              />
              <path
                d="M1.644 12.025C1.644 6.268 6.312 1.6 12.07 1.6c4.383 0 9.143 3.146 10.165 8.738a.9.9 0 01-1.77.324C19.61 5.992 15.653 3.4 12.07 3.4a8.625 8.625 0 00-1.107 17.18h.104a.9.9 0 01.348 1.729c-.005.002-.01.007-.015.01a.907.907 0 01-.331.08l-.038.001h-.026a.896.896 0 01-.083-.005l-.044-.003-.05-.006a1.265 1.265 0 01-.121-.026c-5.114-.668-9.063-5.039-9.063-10.335z"
                fill="currentColor"
              />
              <path
                d="M20.634 7.67l.091.005a.9.9 0 010 1.79l-.091.006H3.367a.9.9 0 010-1.801h17.267zM10.5 14.53l.092.004a.9.9 0 010 1.791l-.092.005H3.367a.9.9 0 010-1.8H10.5z"
                fill="currentColor"
              />
            </svg>
            Português (Brasil)
          </button>
          <Link href="/cookies" className="hover:opacity-80 transition-opacity">
            Cookies
          </Link>
          <Link href="/terms" className="hover:opacity-80 transition-opacity">
            Termos
          </Link>
          <Link href="/privacy" className="hover:opacity-80 transition-opacity">
            Privacidade
          </Link>
        </div>
      </footer>
    </div>
  )
}
