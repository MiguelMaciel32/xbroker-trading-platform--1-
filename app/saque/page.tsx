"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { AlertCircle, Shield, Camera, CheckCircle, X, ArrowLeft, Upload } from "lucide-react"

export default function WithdrawPage() {
  const [kycVerified, setKycVerified] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [pixKey, setPixKey] = useState("")
  const [pixKeyType, setPixKeyType] = useState("cpf")
  const [showTaxModal, setShowTaxModal] = useState(false)
  const [showKycModal, setShowKycModal] = useState(false)
  const [kycStep, setKycStep] = useState("front")
  const [documentFront, setDocumentFront] = useState<string | null>(null)
  const [documentBack, setDocumentBack] = useState<string | null>(null)
  const [selfie, setSelfie] = useState<string | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    const verified = localStorage.getItem("kycVerified") === "true"
    const savedFront = localStorage.getItem("kycDocumentFront")
    const savedBack = localStorage.getItem("kycDocumentBack")
    const savedSelfie = localStorage.getItem("kycSelfie")
    
    setKycVerified(verified)
    if (savedFront) setDocumentFront(savedFront)
    if (savedBack) setDocumentBack(savedBack)
    if (savedSelfie) setSelfie(savedSelfie)
  }, [])

  const handleWithdraw = () => {
    if (!kycVerified) {
      setShowKycModal(true)
      return
    }
    setShowTaxModal(true)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        if (type === "front") {
          setDocumentFront(result)
          localStorage.setItem("kycDocumentFront", result)
        } else if (type === "back") {
          setDocumentBack(result)
          localStorage.setItem("kycDocumentBack", result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        // Aguardar o vídeo carregar
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play()
              resolve(true)
            }
          }
        })
      }
      setShowCamera(true)
    } catch (err) {
      console.error("Erro ao acessar câmera:", err)
      alert("Não foi possível acessar a câmera. Verifique as permissões.")
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setShowCamera(false)
  }

  const takeSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        const imageData = canvas.toDataURL("image/jpeg")
        setSelfie(imageData)
        localStorage.setItem("kycSelfie", imageData)
        stopCamera()
      }
    }
  }

  const completeKyc = () => {
    localStorage.setItem("kycVerified", "true")
    setKycVerified(true)
    setShowKycModal(false)
    setKycStep("front")
    setDocumentFront(null)
    setDocumentBack(null)
    setSelfie(null)
    alert("Verificação KYC concluída com sucesso!")
  }

  const nextKycStep = () => {
    if (kycStep === "front" && documentFront) {
      setKycStep("back")
    } else if (kycStep === "back" && documentBack) {
      setKycStep("selfie")
      startCamera()
    }
  }

  const processTaxPayment = () => {
    setShowTaxModal(false)
    alert("Taxa paga com sucesso! Seu saque está sendo processado.")
  }

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-8 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">Solicitar Saque</h1>
                <p className="text-sm text-gray-500">Transfira seus fundos via PIX</p>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-xs text-gray-500 mb-1">Saldo disponível</div>
                <div className="text-2xl font-semibold text-gray-900">R$ 10.660,00</div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {!kycVerified && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-amber-900 mb-1">
                    Verificação de identidade necessária
                  </div>
                  <div className="text-sm text-amber-700">
                    Complete o processo KYC para habilitar saques em sua conta
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tipo de Chave PIX
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { value: "cpf", label: "CPF" },
                    { value: "phone", label: "Telefone" },
                    { value: "email", label: "E-mail" },
                    { value: "random", label: "Aleatória" }
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setPixKeyType(type.value)}
                      className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                        pixKeyType === type.value
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chave PIX
                </label>
                <input
                  type="text"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                  placeholder={
                    pixKeyType === "cpf" ? "000.000.000-00" :
                    pixKeyType === "phone" ? "(00) 00000-0000" :
                    pixKeyType === "email" ? "seu@email.com" :
                    "Chave aleatória"
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor do Saque
                </label>
                <input
                  type="text"
                  value={withdrawAmount}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "")
                    setWithdrawAmount(value ? `R$ ${value}` : "")
                  }}
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all text-lg font-medium"
                  placeholder="R$ 0,00"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                {[100, 500, 1000, 5000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setWithdrawAmount(`R$ ${amount}`)}
                    className="py-3 px-3 sm:px-4 rounded-lg border border-gray-300 bg-white text-gray-700 hover:border-gray-900 hover:bg-gray-50 transition-all text-sm font-medium"
                  >
                    R$ {amount}
                  </button>
                ))}
              </div>

              <button
                onClick={handleWithdraw}
                disabled={!withdrawAmount || !pixKey}
                className={`w-full py-3.5 px-6 rounded-lg font-medium transition-all ${
                  withdrawAmount && pixKey
                    ? "bg-gray-900 text-white hover:bg-gray-800"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                Solicitar Saque
              </button>

              <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">Informações importantes</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-1.5 ml-6">
                  <li>Processamento em até 24 horas úteis</li>
                  <li>Valor mínimo de saque: R$ 50,00</li>
                  <li>Taxa de segurança única aplicável</li>
                  <li>Verificação KYC obrigatória</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showTaxModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-gray-900" />
              </div>
            </div>

            <h2 className="text-xl font-semibold text-center mb-3 text-gray-900">
              Taxa de Segurança Anti-Fraude
            </h2>

            <p className="text-gray-600 text-center mb-6 text-sm leading-relaxed">
              Para garantir a segurança da transação, é necessário pagar uma taxa única de{" "}
              <span className="text-gray-900 font-semibold text-base">R$ 497,00</span>
            </p>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
              <p className="text-blue-900 text-sm text-center">
                O valor da taxa será devolvido junto com seu saque via PIX
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={processTaxPayment}
                className="w-full py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all font-medium"
              >
                Pagar Taxa e Processar Saque
              </button>

              <button
                onClick={() => setShowTaxModal(false)}
                className="w-full py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {showKycModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-8 max-w-lg w-full shadow-xl my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Verificação de Identidade</h2>
              <button
                onClick={() => {
                  setShowKycModal(false)
                  stopCamera()
                  setKycStep("front")
                  setDocumentFront(null)
                  setDocumentBack(null)
                  setSelfie(null)
                }}
                className="text-gray-400 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex justify-center gap-2 mb-8">
              <div className={`w-2 h-2 rounded-full transition-colors ${kycStep === "front" || documentFront ? "bg-gray-900" : "bg-gray-300"}`}></div>
              <div className={`w-2 h-2 rounded-full transition-colors ${kycStep === "back" || documentBack ? "bg-gray-900" : "bg-gray-300"}`}></div>
              <div className={`w-2 h-2 rounded-full transition-colors ${kycStep === "selfie" || selfie ? "bg-gray-900" : "bg-gray-300"}`}></div>
            </div>

            {kycStep === "front" && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Documento - Frente</h3>
                  <p className="text-sm text-gray-600">
                    Envie uma foto nítida da frente do seu RG ou CNH
                  </p>
                </div>

                {documentFront ? (
                  <div className="relative">
                    <img src={documentFront} alt="Documento Frente" className="w-full rounded-lg border border-gray-300" />
                    <button
                      onClick={() => {
                        setDocumentFront(null)
                        localStorage.removeItem("kycDocumentFront")
                      }}
                      className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-lg hover:bg-gray-100"
                    >
                      <X className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>
                ) : (
                  <label className="block w-full py-16 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 cursor-pointer transition-all text-center">
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <div className="text-sm text-gray-600">Clique para selecionar arquivo</div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "front")}
                      className="hidden"
                    />
                  </label>
                )}

                {documentFront && (
                  <button
                    onClick={nextKycStep}
                    className="w-full py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all font-medium"
                  >
                    Continuar
                  </button>
                )}
              </div>
            )}

            {kycStep === "back" && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Documento - Verso</h3>
                  <p className="text-sm text-gray-600">
                    Envie uma foto nítida do verso do seu documento
                  </p>
                </div>

                {documentBack ? (
                  <div className="relative">
                    <img src={documentBack} alt="Documento Verso" className="w-full rounded-lg border border-gray-300" />
                    <button
                      onClick={() => {
                        setDocumentBack(null)
                        localStorage.removeItem("kycDocumentBack")
                      }}
                      className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-lg hover:bg-gray-100"
                    >
                      <X className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>
                ) : (
                  <label className="block w-full py-16 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 cursor-pointer transition-all text-center">
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <div className="text-sm text-gray-600">Clique para selecionar arquivo</div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "back")}
                      className="hidden"
                    />
                  </label>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setKycStep("front")}
                    className="flex-1 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
                  >
                    <ArrowLeft className="w-4 h-4 inline mr-2" />
                    Voltar
                  </button>
                  {documentBack && (
                    <button
                      onClick={nextKycStep}
                      className="flex-1 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all font-medium"
                    >
                      Continuar
                    </button>
                  )}
                </div>
              </div>
            )}

            {kycStep === "selfie" && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Foto de Verificação</h3>
                  <p className="text-sm text-gray-600">
                    Tire uma foto do seu rosto para confirmar sua identidade
                  </p>
                </div>

                {selfie ? (
                  <div className="relative">
                    <img src={selfie} alt="Selfie" className="w-full rounded-lg border border-gray-300" />
                    <button
                      onClick={() => {
                        setSelfie(null)
                        localStorage.removeItem("kycSelfie")
                        startCamera()
                      }}
                      className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-lg hover:bg-gray-100"
                    >
                      <X className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>
                ) : showCamera ? (
                  <div className="relative aspect-[4/3] bg-gray-900 rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                      style={{ transform: 'scaleX(-1)' }}
                    />
                    <div className="absolute inset-0 border-2 border-white/20 rounded-lg pointer-events-none" />
                    <button
                      onClick={takeSelfie}
                      className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white rounded-full border-4 border-gray-900 hover:bg-gray-100 transition-all shadow-lg flex items-center justify-center z-10"
                    >
                      <Camera className="w-7 h-7 text-gray-900" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                    <div className="animate-pulse text-sm text-gray-500 mb-2">Iniciando câmera...</div>
                    <div className="text-xs text-gray-400">Aguarde alguns instantes</div>
                  </div>
                )}

                <canvas ref={canvasRef} className="hidden" />

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setKycStep("back")
                      stopCamera()
                    }}
                    className="flex-1 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
                  >
                    <ArrowLeft className="w-4 h-4 inline mr-2" />
                    Voltar
                  </button>
                  {selfie && (
                    <button
                      onClick={completeKyc}
                      className="flex-1 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all font-medium flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Concluir
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}