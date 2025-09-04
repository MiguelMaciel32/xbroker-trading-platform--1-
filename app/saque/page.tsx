"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import {
  ChevronDown,
  ExternalLink,
  Camera,
  CheckCircle,
  X,
  Copy,
  Download,
  FileText,
  CreditCard,
  Award as IdCard,
} from "lucide-react"
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
  const [kycStep, setKycStep] = useState(1)
  const [selectedDocumentType, setSelectedDocumentType] = useState("rg")
  const [documentPhoto, setDocumentPhoto] = useState<string | null>(null)
  const [facialPhoto, setFacialPhoto] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)
  const [pixPayload, setPixPayload] = useState<string>("")

  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

  // Limpar stream quando o componente desmonta ou modal fecha
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

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

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null)
      
      // Parar stream anterior se existir
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }

      const constraints = {
        video: {
          width: { ideal: 640, max: 1920 },
          height: { ideal: 480, max: 1080 },
          facingMode: kycStep === 2 ? "environment" : "user", // Câmera traseira para documento, frontal para selfie
        },
        audio: false
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)
      setIsCameraActive(true)

      // Aguardar próximo frame antes de configurar o vídeo
      setTimeout(() => {
        if (videoRef.current && mediaStream) {
          videoRef.current.srcObject = mediaStream
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              videoRef.current.play().catch(console.error)
            }
          }
        }
      }, 100)

    } catch (error) {
      console.error("Erro ao acessar a câmera:", error)
      let errorMessage = "Não foi possível acessar a câmera."
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = "Permissão de câmera negada. Permita o acesso à câmera."
        } else if (error.name === 'NotFoundError') {
          errorMessage = "Nenhuma câmera encontrada no dispositivo."
        } else if (error.name === 'NotReadableError') {
          errorMessage = "Câmera está sendo usada por outro aplicativo."
        }
      }
      
      setCameraError(errorMessage)
      toast({
        title: "Erro na câmera",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }, [toast, kycStep, stream])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setIsCameraActive(false)
    setCameraError(null)
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [stream])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isCameraActive) {
      toast({
        title: "Erro na captura",
        description: "Câmera não está ativa ou não foi possível capturar a foto.",
        variant: "destructive",
      })
      return
    }

    const canvas = canvasRef.current
    const video = videoRef.current
    const context = canvas.getContext("2d")

    if (context && video.videoWidth > 0 && video.videoHeight > 0) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      // Para selfie, espelhar horizontalmente
      if (kycStep === 3) {
        context.scale(-1, 1)
        context.drawImage(video, -video.videoWidth, 0)
      } else {
        context.drawImage(video, 0, 0)
      }

      const photoDataUrl = canvas.toDataURL("image/jpeg", 0.8)

      if (kycStep === 2) {
        setDocumentPhoto(photoDataUrl)
        stopCamera()
        setKycStep(3)
      } else if (kycStep === 3) {
        setFacialPhoto(photoDataUrl)
        stopCamera()
        setKycStep(4)
        setIsVerifying(true)

        setTimeout(() => {
          setIsVerifying(false)
          setKycStep(5)
        }, 3000)
      }
    } else {
      toast({
        title: "Erro na captura",
        description: "Vídeo ainda não está pronto. Tente novamente em alguns segundos.",
        variant: "destructive",
      })
    }
  }, [stopCamera, kycStep, isCameraActive, toast])

  const handleDocumentSelection = () => {
    setKycStep(2)
  }

  const handleCameraCapture = () => {
    if (!isCameraActive) {
      startCamera()
    } else {
      capturePhoto()
    }
  }

  const proceedToFees = () => {
    setKycStep(6)
  }

  const completeWithdrawal = async () => {
    const withdrawalValue = Number.parseFloat(withdrawalAmount)
    const kycFee = 495.0

    try {
      await handleCreateKycPayment()

      toast({
        title: "Taxa KYC gerada!",
        description: `Pague a taxa KYC de R$ ${kycFee.toFixed(2)} via PIX para processar seu saque.`,
        className: "bg-[#1E2329] border-[#FCD535] text-white",
      })

      setKycStep(7)
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
      const kycFee = 495.0

      if (!user?.email) {
        throw new Error("Usuário não encontrado. Faça login para continuar.")
      }

      const qrCodeString = `00020126580014BR.GOV.BCB.PIX013636c4c14e-4b1c-4c1a-9b1a-1234567890120204000053039865802BR5925TAXA VERIFICACAO KYC6009SAO PAULO62070503***6304`
      const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeString)}`

      setQrCode(qrCodeImageUrl)
      setPixPayload(qrCodeString)
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
    setCameraError(null)
    // Não limpar os campos de saque para preservar os dados inseridos
  }

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "rg":
        return <IdCard className="w-8 h-8" />
      case "cnh":
        return <CreditCard className="w-8 h-8" />
      case "passaporte":
        return <FileText className="w-8 h-8" />
      default:
        return <IdCard className="w-8 h-8" />
    }
  }

  const getDocumentName = (type: string) => {
    switch (type) {
      case "rg":
        return "Carteira de identidade"
      case "cnh":
        return "Carteira de habilitação"
      case "passaporte":
        return "Passaporte"
      default:
        return "Documento"
    }
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
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-white mb-2">Escolha o seu tipo de documento</h3>
                    <p className="text-[#848E9C] text-sm">Selecione o documento que você irá fotografar</p>
                  </div>

                  <div className="space-y-3">
                    <label
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedDocumentType === "rg"
                          ? "border-[#FCD535] bg-[#FCD535]/10"
                          : "border-[#2B3139] hover:border-[#434C5A]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="document"
                        value="rg"
                        checked={selectedDocumentType === "rg"}
                        onChange={(e) => setSelectedDocumentType(e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex items-center space-x-3">
                        <div className="text-[#FCD535]">
                          <IdCard className="w-6 h-6" />
                        </div>
                        <span className="text-white font-medium">Carteira de identidade</span>
                      </div>
                    </label>

                    <label
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedDocumentType === "cnh"
                          ? "border-[#FCD535] bg-[#FCD535]/10"
                          : "border-[#2B3139] hover:border-[#434C5A]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="document"
                        value="cnh"
                        checked={selectedDocumentType === "cnh"}
                        onChange={(e) => setSelectedDocumentType(e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex items-center space-x-3">
                        <div className="text-[#FCD535]">
                          <CreditCard className="w-6 h-6" />
                        </div>
                        <span className="text-white font-medium">Carteira de habilitação</span>
                      </div>
                    </label>

                    <label
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedDocumentType === "passaporte"
                          ? "border-[#FCD535] bg-[#FCD535]/10"
                          : "border-[#2B3139] hover:border-[#434C5A]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="document"
                        value="passaporte"
                        checked={selectedDocumentType === "passaporte"}
                        onChange={(e) => setSelectedDocumentType(e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex items-center space-x-3">
                        <div className="text-[#FCD535]">
                          <FileText className="w-6 h-6" />
                        </div>
                        <span className="text-white font-medium">Passaporte</span>
                      </div>
                    </label>
                  </div>

                  <div className="bg-[#2B3139] rounded-lg p-4">
                    <p className="text-[#848E9C] text-sm mb-2">
                      Tire uma foto do seu {getDocumentName(selectedDocumentType).toLowerCase()}. A foto deve ser:
                    </p>
                    <ul className="text-[#848E9C] text-sm space-y-1">
                      <li>
                        • <strong className="text-white">clara e nítida</strong>
                      </li>
                      <li>
                        • <strong className="text-white">todos os cantos do documento devem estar visíveis</strong>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={handleDocumentSelection}
                    className="w-full py-3 rounded-lg font-medium bg-[#FCD535] hover:bg-[#F0C419] text-black transition-colors flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Fotografar Documento
                  </button>
                </div>
              )}

              {kycStep === 2 && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-white mb-2">Foto do documento</h3>
                    <p className="text-[#848E9C] text-sm">Posicione o documento dentro da moldura e capture a foto</p>
                  </div>

                  {cameraError && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      <p className="text-red-400 text-sm">{cameraError}</p>
                    </div>
                  )}

                  <div className="relative bg-[#2B3139] rounded-lg overflow-hidden">
                    <div className="aspect-[4/3] relative">
                      {isCameraActive ? (
                        <video 
                          ref={videoRef} 
                          className="w-full h-full object-cover" 
                          autoPlay 
                          muted 
                          playsInline 
                        />
                      ) : documentPhoto ? (
                        <img
                          src={documentPhoto}
                          alt="Documento capturado"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                          <div className="text-center">
                            {getDocumentIcon(selectedDocumentType)}
                            <p className="text-[#848E9C] text-sm mt-2">Clique para ativar a câmera</p>
                          </div>
                        </div>
                      )}

                      {isCameraActive && (
                        <div className="absolute inset-4 pointer-events-none">
                          <div className="w-full h-full border-2 border-white/60 rounded-lg relative">
                            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#FCD535]"></div>
                            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#FCD535]"></div>
                            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#FCD535]"></div>
                            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#FCD535]"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-white text-xs bg-black/70 px-3 py-1 rounded-full">
                                Centralize o documento
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <canvas ref={canvasRef} className="hidden" />

                  <div className="space-y-2">
                    {!documentPhoto ? (
                      <button
                        onClick={handleCameraCapture}
                        disabled={cameraError !== null}
                        className="w-full py-3 rounded-lg font-medium bg-[#FCD535] hover:bg-[#F0C419] disabled:bg-[#434C5A] disabled:cursor-not-allowed text-black transition-colors flex items-center justify-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        {isCameraActive ? "Capturar Foto" : "Ativar Câmera"}
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            setDocumentPhoto(null)
                            startCamera()
                          }}
                          className="w-full py-2 rounded-lg font-medium bg-[#434C5A] hover:bg-[#525A6A] text-white transition-colors"
                        >
                          Tirar Novamente
                        </button>
                        <button
                          onClick={() => setKycStep(3)}
                          className="w-full py-3 rounded-lg font-medium bg-[#FCD535] hover:bg-[#F0C419] text-black transition-colors"
                        >
                          Continuar
                        </button>
                      </div>
                    )}

                    {isCameraActive && !documentPhoto && (
                      <button
                        onClick={stopCamera}
                        className="w-full py-2 rounded-lg font-medium bg-[#434C5A] hover:bg-[#525A6A] text-white transition-colors"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              )}

              {kycStep === 3 && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-white mb-2">Verificação Facial</h3>
                    <p className="text-[#848E9C] text-sm">
                      Posicione seu rosto dentro do círculo e clique para capturar
                    </p>
                  </div>

                  {cameraError && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      <p className="text-red-400 text-sm">{cameraError}</p>
                    </div>
                  )}

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
                      ) : facialPhoto ? (
                        <img
                          src={facialPhoto}
                          alt="Foto facial"
                          className="w-full h-full object-cover scale-x-[-1]"
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
                  </div>

                  <canvas ref={canvasRef} className="hidden" />

                  <div className="space-y-2">
                    {!facialPhoto ? (
                      <button
                        onClick={handleCameraCapture}
                        disabled={cameraError !== null}
                        className="w-full py-3 rounded-lg font-medium bg-[#FCD535] hover:bg-[#F0C419] disabled:bg-[#434C5A] disabled:cursor-not-allowed text-black transition-colors"
                      >
                        {isCameraActive ? "Capturar Foto" : "Ativar Câmera"}
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            setFacialPhoto(null)
                            startCamera()
                          }}
                          className="w-full py-2 rounded-lg font-medium bg-[#434C5A] hover:bg-[#525A6A] text-white transition-colors"
                        >
                          Tirar Novamente
                        </button>
                      </div>
                    )}

                    {isCameraActive && !facialPhoto && (
                      <button
                        onClick={stopCamera}
                        className="w-full py-2 rounded-lg font-medium bg-[#434C5A] hover:bg-[#525A6A] text-white transition-colors"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              )}

              {kycStep === 4 && (
                <div className="space-y-4 text-center">
                  <div className="relative">
                    <div className="w-48 h-48 mx-auto border-4 border-[#FCD535] rounded-lg overflow-hidden relative">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#FCD535]"></div>
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#FCD535]"></div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#FCD535]"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#FCD535]"></div>

                      {facialPhoto && (
                        <img
                          src={facialPhoto}
                          alt="Foto facial"
                          className="w-full h-full object-cover"
                        />
                      )}

                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FCD535]/20 to-transparent animate-pulse"></div>
                    </div>
                  </div>

                  <h3 className="text-lg font-medium text-white">Analisando reconhecimento facial</h3>
                  <p className="text-[#848E9C] text-sm">Por favor, aguarde...</p>

                  <div className="flex justify-center space-x-1">
                    <div className="w-2 h-2 bg-[#FCD535] rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-[#FCD535] rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-[#FCD535] rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              )}

              {kycStep === 5 && (
                <div className="space-y-4 text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                  <h3 className="text-lg font-medium text-white mb-2">Verificação Concluída!</h3>
                  <p className="text-[#848E9C] text-sm">Sua identidade foi verificada com sucesso.</p>

                  <button
                    onClick={proceedToFees}
                    className="w-full py-3 rounded-lg font-medium bg-[#FCD535] hover:bg-[#F0C419] text-black transition-colors"
                  >
                    Prosseguir com Saque
                  </button>
                </div>
              )}

              {kycStep === 6 && (
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

              {kycStep === 7 && (
                <div className="space-y-4">
                  <div className="text-center">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">Pague a Taxa KYC</h3>
                    <p className="text-[#848E9C] text-sm">
                      Pague a taxa de verificação KYC de R$ 495,00 via PIX para processar seu saque.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 text-center">
                    {qrCode && <img src={qrCode} alt="QR Code PIX" className="mx-auto mb-4" />}
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