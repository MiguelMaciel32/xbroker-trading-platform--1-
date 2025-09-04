"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { ChevronDown, ExternalLink, Camera, Upload, CheckCircle, X, Copy, Download } from "lucide-react"
import TradingHeader from "@/components/trading-header"
import { getUserBalance } from "@/lib/actions/balance"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

export default function SaquePage() {
  const { toast } = useToast()

  const [withdrawalAmount, setWithdrawalAmount] = useState("")
  const [pixKeyType, setPixKeyType] = useState("cpf")
  const [pixKey, setPixKey] = useState("")
  const [accountHolder, setAccountHolder] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [balance, setBalance] = useState(0)
  const [isLoadingBalance, setIsLoadingBalance] = useState(true)
  const [balanceError, setBalanceError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  const [showKycModal, setShowKycModal] = useState(false)
  const [kycStep, setKycStep] = useState(1) // 1: document, 2: facial, 3: verification, 4: completed, 5: fees, 6: qr code
  const [documentPhoto, setDocumentPhoto] = useState<string | null>(null)
  const [facialPhoto, setFacialPhoto] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)
  const [pixPayload, setPixPayload] = useState<string>("")

  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  class PixupBRService {
    static async createPixPayment(data: {
      amount: number
      external_id: string
      payerQuestion?: string
      postbackUrl?: string
      payer?: {
        name?: string
        document?: string
        email?: string
      }
    }) {
      try {
        const response = await fetch("/api/pixupbr/qrcode", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Erro ao criar pagamento PIX")
        }

        return result.data
      } catch (error) {
        console.error("Erro ao criar pagamento PIX:", error)
        throw error
      }
    }
  }

  const fetchBalance = useCallback(async () => {
    try {
      setIsLoadingBalance(true)
      setBalanceError(null)

      const result = await getUserBalance()

      if (!result.success || !result.data) {
        throw new Error(result.error || "Erro na resposta da API")
      }

      setBalance(result.data.balance)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido"
      setBalanceError(errorMessage)
      console.error("Erro ao buscar saldo:", err)
    } finally {
      setIsLoadingBalance(false)
    }
  }, [])

  const handleBalanceUpdate = useCallback((newBalance: number) => {
    setBalance(newBalance)
  }, [])

  useEffect(() => {
    const supabase = createClient()

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()
  }, [])

  useEffect(() => {
    fetchBalance()
  }, [fetchBalance])

  const handleWithdrawal = () => {
    const withdrawalValue = Number.parseFloat(withdrawalAmount)

    if (!withdrawalAmount || !pixKey || !accountHolder || !agreedToTerms) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    if (withdrawalValue <= 0) {
      toast({
        title: "Valor inválido",
        description: "O valor do saque deve ser maior que zero.",
        variant: "destructive",
      })
      return
    }

    if (withdrawalValue > balance) {
      toast({
        title: "Saldo insuficiente",
        description: `Seu saldo atual é R$ ${balance.toFixed(2)}`,
        variant: "destructive",
      })
      return
    }

    if (withdrawalValue < 10) {
      toast({
        title: "Valor mínimo",
        description: "O valor mínimo para saque é R$ 10,00",
        variant: "destructive",
      })
      return
    }

    setShowKycModal(true)
    setKycStep(1)
  }

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setDocumentPhoto(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 480 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      })
      setStream(mediaStream)
      setIsCameraActive(true)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play()
      }
    } catch (error) {
      console.error("Erro ao acessar a câmera:", error)
      toast({
        title: "Erro na câmera",
        description: "Não foi possível acessar a câmera. Verifique as permissões.",
        variant: "destructive",
      })
    }
  }, [toast])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setIsCameraActive(false)
  }, [stream])

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext("2d")

      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0)

        const photoDataUrl = canvas.toDataURL("image/jpeg", 0.8)
        setFacialPhoto(photoDataUrl)
        stopCamera()
        setKycStep(3)
        setIsVerifying(true)

        setTimeout(() => {
          setIsVerifying(false)
          setKycStep(4)
        }, 3000)
      }
    }
  }, [stopCamera])

  const handleFacialCapture = () => {
    if (!isCameraActive) {
      startCamera()
    } else {
      capturePhoto()
    }
  }

  const proceedToFees = () => {
    setKycStep(5)
  }

  const completeWithdrawal = async () => {
    const withdrawalValue = Number.parseFloat(withdrawalAmount)
    const kycFee = 495.0 // Fixed fee of R$ 495.00

    try {
      await handleCreateKycPayment()

      toast({
        title: "Taxa KYC gerada!",
        description: `Pague a taxa KYC de R$ ${kycFee.toFixed(2)} via PIX para processar seu saque.`,
        className: "bg-[#1E2329] border-[#FCD535] text-white",
      })

      setKycStep(6)
    } catch (error) {
      console.error("Erro ao processar taxa KYC:", error)
      toast({
        title: "Erro na taxa KYC",
        description: "Erro ao gerar pagamento da taxa KYC. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleCreateKycPayment = async () => {
    setLoading(true)
    setError(null)
    setQrCode(null)

    try {
      const kycFee = 495.0 // Fixed KYC fee amount

      if (!user?.email) {
        throw new Error("Usuário não encontrado. Faça login para continuar.")
      }

      const payment = await PixupBRService.createPixPayment({
        amount: kycFee, // Use KYC fee amount instead of withdrawal amount
        external_id: `kyc-${user.email}|${Date.now()}`,
        payerQuestion: `Taxa de Verificação KYC - R$ ${kycFee.toFixed(2)}`,
        postbackUrl: `${window.location.origin}/api/pixupbr/webhook`,
        payer: {
          name: user.user_metadata?.full_name || accountHolder,
          document: "12345678901",
          email: user.email,
        },
      })

      const qrCodeString = payment.qrcode

      const qrCodeImageUrl = qrCodeString
        ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeString)}`
        : null

      setQrCode(qrCodeImageUrl)
      setPixPayload(qrCodeString)

      if (!qrCodeImageUrl && !qrCodeString) {
        setError("QR Code não encontrado na resposta da API")
      }
    } catch (error: any) {
      console.error("Erro:", error)
      setError(error.message || "Erro ao criar pagamento PIX para taxa KYC")
    } finally {
      setLoading(false)
    }
  }

  const copyPixCode = () => {
    navigator.clipboard.writeText(pixPayload)
    toast({
      title: "Código copiado!",
      description: "Código PIX copiado para a área de transferência.",
      className: "bg-[#1E2329] border-[#FCD535] text-white",
    })
  }

  const downloadQRCode = () => {
    if (qrCode) {
      const link = document.createElement("a")
      link.download = `qr-code-pix-${Date.now()}.png`
      link.href = qrCode
      link.click()
    }
  }

  const closeKycModal = () => {
    stopCamera()
    setShowKycModal(false)
    setKycStep(1)
    setDocumentPhoto(null)
    setFacialPhoto(null)
    setQrCodeDataUrl(null)
    setPixPayload("")
    setWithdrawalAmount("")
    setPixKey("")
    setAccountHolder("")
    setAgreedToTerms(false)
  }

  return (
    <div className="min-h-screen text-white font-sans overflow-x-hidden" style={{ backgroundColor: "#181A20" }}>
      <TradingHeader onBalanceUpdate={handleBalanceUpdate} />

      <div className="pt-16">
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            <div className="flex-1 max-w-none lg:max-w-2xl">
              <h1 className="text-xl sm:text-2xl font-semibold text-white mb-6 sm:mb-8">Saque BRL</h1>

              <div className="mb-4 sm:mb-6">
                <label className="block text-base sm:text-lg font-medium text-white mb-3 sm:mb-4">Valor do Saque</label>
                <div className="relative">
                  <input
                    type="number"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    placeholder="0.00"
                    min="10"
                    max={balance}
                    className="w-full bg-[#2B3139] border border-[#2B3139] rounded-lg p-3 sm:p-4 text-white placeholder-[#848E9C] focus:border-[#FCD535] focus:outline-none text-sm sm:text-base"
                  />
                  <span className="absolute right-3 sm:right-4 top-3 sm:top-4 text-[#848E9C] text-sm sm:text-base">
                    BRL
                  </span>
                </div>
                <div className="text-[#848E9C] text-xs sm:text-sm mt-2">
                  {isLoadingBalance ? (
                    "Carregando saldo..."
                  ) : balanceError ? (
                    <span className="text-red-400">Erro ao carregar saldo</span>
                  ) : (
                    <>
                      Saldo disponível: R$ {balance.toFixed(2)}
                      <br />
                      <span className="text-yellow-400">Valor mínimo: R$ 10,00</span>
                    </>
                  )}
                </div>
              </div>

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

              <div className="mb-4 sm:mb-6">
                <label className="block text-base sm:text-lg font-medium text-white mb-3 sm:mb-4">
                  Nome do Titular
                </label>
                <input
                  type="text"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  placeholder="Nome completo do titular da conta"
                  className="w-full bg-[#2B3139] border border-[#2B3139] rounded-lg p-3 sm:p-4 text-white placeholder-[#848E9C] focus:border-[#FCD535] focus:outline-none text-sm sm:text-base"
                />
              </div>

              <div className="mb-6 sm:mb-8">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-[#FCD535] bg-[#2B3139] border-[#2B3139] rounded focus:ring-[#FCD535] focus:ring-2 flex-shrink-0"
                  />
                  <span className="text-[#848E9C] text-xs sm:text-sm leading-relaxed">
                    Eu li e concordo com os{" "}
                    <button className="text-[#FCD535] hover:underline">Termos e Condições</button> para saque.
                  </span>
                </label>
              </div>

              <button
                onClick={handleWithdrawal}
                className={`w-full py-3 sm:py-4 rounded-lg font-medium text-black transition-colors text-sm sm:text-base ${
                  withdrawalAmount && pixKey && accountHolder && agreedToTerms && !isLoadingBalance
                    ? "bg-[#FCD535] hover:bg-[#F0C419]"
                    : "bg-[#434C5A] cursor-not-allowed"
                }`}
                disabled={!withdrawalAmount || !pixKey || !accountHolder || !agreedToTerms || isLoadingBalance}
              >
                {isLoadingBalance ? "Carregando..." : "Solicitar Saque"}
              </button>
            </div>

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

      {showKycModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1E2329] rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Verificação KYC</h2>
                <button onClick={closeKycModal} className="text-[#848E9C] hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {kycStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">Envie a foto do seu documento</h3>
                  <p className="text-[#848E9C] text-sm">
                    Envie uma foto clara do seu RG ou CNH para verificação de identidade.
                  </p>

                  <div className="relative border-2 border-dashed border-[#2B3139] rounded-lg p-8 text-center hover:border-[#FCD535] transition-colors cursor-pointer">
                    {documentPhoto ? (
                      <div className="space-y-4">
                        <img
                          src={documentPhoto || "/placeholder.svg"}
                          alt="Documento"
                          className="w-32 h-20 object-cover mx-auto rounded"
                        />
                        <p className="text-[#FCD535] text-sm font-medium">Documento carregado com sucesso!</p>
                        <button
                          onClick={() => setDocumentPhoto(null)}
                          className="text-[#848E9C] hover:text-white text-sm underline"
                        >
                          Trocar documento
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="w-12 h-12 text-[#848E9C] mx-auto" />
                        <p className="text-[#848E9C]">Clique para enviar ou arraste o arquivo</p>
                        <p className="text-[#848E9C] text-xs">Formatos aceitos: JPG, PNG</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleDocumentUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>

                  <button
                    onClick={() => {
                      console.log("[v0] Document photo state:", documentPhoto)
                      if (documentPhoto) {
                        setKycStep(2)
                      }
                    }}
                    disabled={!documentPhoto}
                    className={`w-full py-3 rounded-lg font-medium transition-colors ${
                      documentPhoto
                        ? "bg-[#FCD535] hover:bg-[#F0C419] text-black"
                        : "bg-[#434C5A] text-[#848E9C] cursor-not-allowed"
                    }`}
                  >
                    {documentPhoto ? "Continuar" : "Adicione uma imagem do documento"}
                  </button>
                </div>
              )}

              {kycStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">Verificação Facial</h3>
                  <p className="text-[#848E9C] text-sm">
                    Posicione seu rosto dentro do círculo e clique para capturar.
                  </p>

                  <div className="relative bg-[#2B3139] rounded-lg p-8 text-center">
                    <div className="w-64 h-64 mx-auto border-4 border-[#FCD535] rounded-full overflow-hidden flex items-center justify-center relative bg-gray-900">
                      {isCameraActive ? (
                        <video
                          ref={videoRef}
                          className="w-full h-full object-cover scale-x-[-1]"
                          autoPlay
                          muted
                          playsInline
                          style={{
                            minWidth: "100%",
                            minHeight: "100%",
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                          <Camera className="w-16 h-16 text-[#848E9C]" />
                        </div>
                      )}

                      {isCameraActive && (
                        <div className="absolute inset-4 pointer-events-none flex items-center justify-center">
                          <div className="w-40 h-48 border-2 border-white/60 rounded-full flex items-center justify-center">
                            <div className="text-white text-xs bg-black/70 px-3 py-1 rounded-full">
                              Centralize seu rosto
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-[#848E9C] text-sm mt-4">
                      {isCameraActive
                        ? "Posicione seu rosto no círculo e clique para capturar"
                        : "Clique para ativar a câmera"}
                    </p>
                  </div>

                  <canvas ref={canvasRef} className="hidden" />

                  <button
                    onClick={handleFacialCapture}
                    className="w-full py-3 rounded-lg font-medium bg-[#FCD535] hover:bg-[#F0C419] text-black transition-colors"
                  >
                    {isCameraActive ? "Capturar Foto" : "Ativar Câmera"}
                  </button>

                  {isCameraActive && (
                    <button
                      onClick={stopCamera}
                      className="w-full py-2 rounded-lg font-medium bg-[#434C5A] hover:bg-[#525A6A] text-white transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              )}

              {kycStep === 3 && (
                <div className="space-y-4 text-center">
                  <h3 className="text-lg font-medium text-white">Verificando...</h3>
                  <div className="w-48 h-48 mx-auto">
                    <img
                      src={facialPhoto! || "/placeholder.svg"}
                      alt="Foto facial"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div className="animate-spin w-8 h-8 border-2 border-[#FCD535] border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-[#848E9C] text-sm">Verificando sua identidade...</p>
                </div>
              )}

              {kycStep === 4 && (
                <div className="space-y-4 text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                  <h3 className="text-lg font-medium text-white mb-2">Facial Concluída!</h3>
                  <p className="text-[#848E9C] text-sm">Sua identidade foi verificada com sucesso.</p>

                  <button
                    onClick={proceedToFees}
                    className="w-full py-3 rounded-lg font-medium bg-[#FCD535] hover:bg-[#F0C419] text-black transition-colors"
                  >
                    Prosseguir com Saque
                  </button>
                </div>
              )}

              {kycStep === 5 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">Taxa de Verificação KYC</h3>

                  <div className="bg-[#2B3139] rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[#848E9C]">Valor do saque:</span>
                      <span className="text-white">R$ {withdrawalAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#848E9C]">Taxa KYC:</span>
                      <span className="text-red-400">R$ 495,00</span>
                    </div>
                    <div className="border-t border-[#434C5A] pt-2">
                      <div className="flex justify-between font-medium">
                        <span className="text-white">Valor do saque (após verificação):</span>
                        <span className="text-[#FCD535] font-medium">R$ {withdrawalAmount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                    <p className="text-yellow-400 text-sm">
                      ⚠️ A taxa de verificação KYC é cobrada apenas na primeira verificação.
                    </p>
                  </div>

                  <button
                    onClick={completeWithdrawal}
                    className="w-full py-3 rounded-lg font-medium bg-[#FCD535] hover:bg-[#F0C419] text-black transition-colors"
                  >
                    Gerar PIX para Taxa KYC
                  </button>
                </div>
              )}

              {kycStep === 6 && (
                <div className="space-y-4">
                  <div className="text-center">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">Pague a Taxa KYC</h3>
                    <p className="text-[#848E9C] text-sm">
                      Pague a taxa de verificação KYC de R$ 495,00 via PIX para processar seu saque.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 text-center">
                    {qrCode && <img src={qrCode || "/placeholder.svg"} alt="QR Code PIX" className="mx-auto mb-4" />}
                  </div>

                  <div className="bg-[#2B3139] rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[#848E9C]">Taxa KYC:</span>
                      <span className="text-[#FCD535] font-medium">R$ 495,00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#848E9C]">Pagador:</span>
                      <span className="text-white">{accountHolder}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#848E9C]">Descrição:</span>
                      <span className="text-white text-sm">Taxa de Verificação KYC</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={copyPixCode}
                      className="w-full py-3 rounded-lg font-medium bg-[#FCD535] hover:bg-[#F0C419] text-black transition-colors flex items-center justify-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copiar Código PIX
                    </button>

                    <button
                      onClick={downloadQRCode}
                      className="w-full py-2 rounded-lg font-medium bg-[#2B3139] hover:bg-[#434C5A] text-white transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Baixar QR Code
                    </button>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <p className="text-blue-400 text-sm">
                      💡 Após o pagamento da taxa KYC, seu saque de R$ {withdrawalAmount} será processado
                      automaticamente.
                    </p>
                  </div>

                  <button
                    onClick={closeKycModal}
                    className="w-full py-2 rounded-lg font-medium bg-[#434C5A] hover:bg-[#525A6A] text-white transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
