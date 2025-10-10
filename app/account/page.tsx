"use client"

import { useState, useEffect } from "react"
import { Camera, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

export default function AccountPage() {
  const [formData, setFormData] = useState({
    nickname: "",
    firstName: "",
    lastName: "",
    birthday: "",
    cpf: "",
    email: "",
    country: "Brasil",
    ddi: "+55",
    phone: "",
    address: "",
    profileImage: ""
  })
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      // Pegar usuário autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        console.error("Erro de autenticação:", authError)
        setLoading(false)
        return
      }

      // Buscar perfil do usuário diretamente
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("email, balance")
        .eq("id", user.id)
        .single()

      if (profileError) {
        console.error("Erro ao buscar perfil:", profileError)
        
        // Se não existe, criar perfil
        const { data: newProfile, error: createError } = await supabase
          .from("user_profiles")
          .insert({
            id: user.id,
            email: user.email,
            balance: 0,
            admin: false
          })
          .select("email, balance")
          .single()

        if (!createError && newProfile) {
          setFormData(prev => ({ ...prev, email: newProfile.email || user.email || "" }))
          setBalance(Number(newProfile.balance) || 0)
        } else {
          setFormData(prev => ({ ...prev, email: user.email || "" }))
        }
      } else {
        // Perfil encontrado
        setFormData(prev => ({ ...prev, email: profile.email || user.email || "" }))
        setBalance(Number(profile.balance) || 0)
      }

      // Carregar dados salvos do localStorage
      const savedData = localStorage.getItem("userProfileData")
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        setFormData(prev => ({
          ...prev,
          ...parsedData,
          // Email não vem do localStorage, sempre vem do banco
          email: prev.email
        }))
      }
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setFormData(prev => ({ ...prev, profileImage: base64 }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      // Salvar dados no localStorage (exceto email que vem do banco)
      const dataToSave = {
        nickname: formData.nickname,
        firstName: formData.firstName,
        lastName: formData.lastName,
        birthday: formData.birthday,
        cpf: formData.cpf,
        country: formData.country,
        ddi: formData.ddi,
        phone: formData.phone,
        address: formData.address,
        profileImage: formData.profileImage
      }
      
      localStorage.setItem("userProfileData", JSON.stringify(dataToSave))
      
      // Feedback visual
      await new Promise(resolve => setTimeout(resolve, 500))
      alert("Dados salvos com sucesso!")
    } catch (error) {
      console.error("Error saving data:", error)
      alert("Erro ao salvar dados")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <main className="max-w-4xl mx-auto">
        
        {/* Balance Card */}
        <div className="bg-black text-white rounded-xl p-6 mb-6 shadow-sm">
          <p className="text-gray-300 text-sm mb-1">Saldo disponível</p>
          <p className="text-3xl font-bold">R$ {balance.toFixed(2)}</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-black mb-6">Dados pessoais</h2>

          {/* Avatar */}
          <div className="mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gray-100 border-2 border-gray-200 overflow-hidden">
                  {formData.profileImage ? (
                    <img 
                      src={formData.profileImage} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg width="50" height="50" viewBox="0 0 74 63" fill="none">
                      <path
                        d="M50.3789 23.9045C50.3789 31.5518 44.1814 37.7249 36.5039 37.7249C28.8264 37.7249 22.6289 31.5518 22.6289 23.9045C22.6289 16.2571 28.8264 10.084 36.5039 10.084C44.1814 10.084 50.3789 16.2571 50.3789 23.9045ZM8.75391 56.1522C8.75391 46.9386 27.2539 43.0996 36.5039 43.0996C45.7539 43.0996 64.2539 46.9386 64.2539 56.1522V61.9732C64.2539 65.4489 61.4363 68.2665 57.9606 68.2665H15.0472C11.5715 68.2665 8.75391 65.4489 8.75391 61.9732V56.1522Z"
                        fill="#000000"
                      />
                    </svg>
                  )}
                </div>
                <label className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center border-2 bg-white border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                  <Camera className="w-4 h-4 text-gray-600" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <div className="font-bold text-black">
                  {formData.nickname || formData.firstName || formData.email.split("@")[0] || "Usuário"}
                </div>
                <div className="text-sm text-gray-500">{formData.email}</div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Apelido
              </label>
              <input
                value={formData.nickname}
                onChange={(e) => handleInputChange("nickname", e.target.value)}
                className="w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black bg-white border-2 border-gray-200 text-black"
                placeholder="Como deseja ser chamado?"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome
                </label>
                <input
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className="w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black bg-white border-2 border-gray-200 text-black"
                  placeholder="Seu primeiro nome"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sobrenome
                </label>
                <input
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className="w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black bg-white border-2 border-gray-200 text-black"
                  placeholder="Seu sobrenome"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Data de nascimento
                </label>
                <input
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => handleInputChange("birthday", e.target.value)}
                  className="w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black bg-white border-2 border-gray-200 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  CPF
                </label>
                <input
                  value={formData.cpf}
                  onChange={(e) => handleInputChange("cpf", e.target.value)}
                  className="w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black bg-white border-2 border-gray-200 text-black"
                  placeholder="000.000.000-00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full rounded-lg px-4 py-3 bg-gray-100 border-2 border-gray-200 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                País
              </label>
              <div className="rounded-lg px-4 py-3 bg-gray-100 border-2 border-gray-200 text-gray-500">
                {formData.country}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  DDI
                </label>
                <select
                  value={formData.ddi}
                  onChange={(e) => handleInputChange("ddi", e.target.value)}
                  className="w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black bg-white border-2 border-gray-200 text-black"
                >
                  <option value="+55">BR +55</option>
                  <option value="+1">US +1</option>
                  <option value="+44">UK +44</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Telefone
                </label>
                <input
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black bg-white border-2 border-gray-200 text-black"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Endereço
              </label>
              <input
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black bg-white border-2 border-gray-200 text-black"
                placeholder="Rua, número, bairro, cidade, estado"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full px-8 py-3 rounded-lg font-bold bg-black text-white hover:bg-gray-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar alterações"
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}