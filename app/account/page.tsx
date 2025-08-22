"use client"

import { useState } from "react"
import Link from "next/link"
import { BarChart3, CreditCard, ArrowUpDown, FileText, Settings, User, Camera, Plus, Bell } from "lucide-react"

export default function AccountPage() {
  const [formData, setFormData] = useState({
    nickname: "",
    firstName: "",
    lastName: "",
    birthday: "",
    cpf: "",
    email: "agatha-brito@tuamaeaquelaursa.com",
    country: "Brasil",
    ddi: "+55",
    phone: "",
    address: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [language, setLanguage] = useState("Português(BR)")
  const [timezone, setTimezone] = useState("(UTC+03:00)")
  const [balance] = useState(10001.96)

  const SITE_CONFIG = {
    platformName: "TradePro",
    logoUrl: "https://media.discordapp.net/attachments/1191807892936986756/1408228383128551534/Captura_de_Tela_2025-08-21_as_20.16.28-removebg-preview.png?ex=68a8fa62&is=68a7a8e2&hm=527693bc110e80e51760a1cfcc0b1e3a4616517b98b7fcf8a9fffa342ba6f059&=&format=webp&quality=lossless&width=1008&height=990",
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen text-white font-sans overflow-x-hidden" style={{ backgroundColor: "#181A20" }}>
      <div
        className="fixed top-0 left-0 right-0 z-30 border-b px-4 py-3"
        style={{ backgroundColor: "#181A20", borderColor: "#2B3139" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <img src={SITE_CONFIG.logoUrl || "/placeholder.svg"} alt={SITE_CONFIG.platformName} className="h-8" />
          </div>
          <div className="flex items-center space-x-4">
            <Bell className="w-5 h-5 text-gray-400" />
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-gray-400 text-sm">Saldo demo</div>
                <div className="text-white font-semibold">R$ {balance.toFixed(2)}</div>
              </div>
              <button className="bg-green-500 hover:bg-green-600 text-black font-semibold px-4 py-2 rounded flex items-center">
                <Plus className="w-4 h-4 mr-1" />
                Depósito
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-screen pt-[70px]">
        <div
          className="w-16 border-r flex flex-col items-center py-6 space-y-6 fixed left-0 top-[70px] h-[calc(100vh-70px)] z-20"
          style={{ backgroundColor: "#181A20", borderColor: "#2B3139" }}
        >
          <Link
            href="/trading"
            className="flex flex-col items-center space-y-1 hover:bg-gray-700 p-3 rounded-lg transition-colors"
          >
            <BarChart3 className="h-6 w-6 text-gray-400" />
          </Link>

          <Link
            href="/deposit"
            className="flex flex-col items-center space-y-1 hover:bg-gray-700 p-3 rounded-lg transition-colors"
          >
            <CreditCard className="h-6 w-6 text-gray-400" />
          </Link>

          <Link
            href="/saque"
            className="flex flex-col items-center space-y-1 hover:bg-gray-700 p-3 rounded-lg transition-colors"
          >
            <ArrowUpDown className="h-6 w-6 text-gray-400" />
          </Link>


          <div className="flex-1"></div>

          <Link
            href="/configuracoes"
            className="flex flex-col items-center space-y-1 hover:bg-gray-700 p-3 rounded-lg transition-colors"
          >
            <Settings className="h-6 w-6 text-gray-400" />
          </Link>

          <Link
            href="/account"
            className="flex flex-col items-center space-y-1 p-3 rounded-lg transition-colors"
            style={{ backgroundColor: "#FCD535", color: "#000" }}
          >
            <User className="h-6 w-6" />
          </Link>
        </div>

        {/* Main Page Container */}
        <div className="flex-1 ml-16">
          <header className="fixed top-[70px] left-16 right-0 z-20 bg-[#1E2329] border-b border-[#2B3139]">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <nav className="flex items-center space-x-8">
                  <Link href="/deposit" className="text-[#848E9C] hover:text-white">
                    Depósito
                  </Link>
                  <Link href="/saque" className="text-[#848E9C] hover:text-white">
                    Retirada
                  </Link>
                  <button className="text-[#848E9C] hover:text-white">Transações</button>
                  <button className="text-[#848E9C] hover:text-white">Operações</button>
                  <button className="text-white border-b-2 border-[#FCD535] pb-1">Perfil</button>
                </nav>
                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-2 text-[#848E9C] hover:text-white">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M5.626 7.578l7.354 7.354 3.819-3.819L9.445 3.76 5.626 7.578zm8.415 8.838l-.114.103a1.5 1.5 0 01-1.893 0l-.114-.102-7.778-7.779-.103-.114a1.5 1.5 0 01-.103 2.008l-4.243 4.242z" />
                      <path d="M14.677 7.154l-.068.061a.9.9 0 01-1.267-1.266l.062-.069 1.06-1.06a.9.9 0 011.274 1.273l-1.06 1.06zM3.717 18.114l-.068.061a.9.9 0 01-1.267-1.266l.062-.069 4.95-4.95a.9.9 0 011.273 1.274l-4.95 4.95zM21.1 19.2l.092.005a.9.9 0 010 1.79L21.1 21h-9.2a.9.9 0 010-1.8h9.2z" />
                    </svg>
                    <span>Ordens</span>
                  </button>
                  <button className="flex items-center space-x-2 text-[#848E9C] hover:text-white">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M5.626 7.578l7.354 7.354 3.819-3.819L9.445 3.76 5.626 7.578zm8.415 8.838l-.114.103a1.5 1.5 0 01-1.893 0l-.114-.102-7.778-7.779-.103-.114a1.5 1.5 0 01-.103 2.008l-4.243 4.242z" />
                      <path d="M14.677 7.154l-.068.061a.9.9 0 01-1.267-1.266l.062-.069 1.06-1.06a.9.9 0 011.274 1.273l-1.06 1.06zM3.717 18.114l-.068.061a.9.9 0 01-1.267-1.266l.062-.069 4.95-4.95a.9.9 0 011.273 1.274l-4.95 4.95zM21.1 19.2l.092.005a.9.9 0 010 1.79L21.1 21h-9.2a.9.9 0 010-1.8h9.2z" />
                    </svg>
                    <span>Recurso</span>
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-6 py-8 pt-24">
            <div className="flex gap-6">
              {/* Left Column */}
              <div className="flex-1">
                {/* Personal Data Form */}
                <form className="rounded-lg p-6 mb-6" style={{ backgroundColor: "#1E2329" }}>
                  <div className="text-lg font-semibold mb-6" style={{ color: "#EAECEF" }}>
                    Dados pessoais:
                  </div>

                  {/* Avatar Section */}
                  <div className="mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div
                          className="w-20 h-20 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: "#2B3139" }}
                        >
                          <svg width="74" height="63" viewBox="0 0 74 63" fill="none" className="w-12 h-12">
                            <path
                              d="M50.3789 23.9045C50.3789 31.5518 44.1814 37.7249 36.5039 37.7249C28.8264 37.7249 22.6289 31.5518 22.6289 23.9045C22.6289 16.2571 28.8264 10.084 36.5039 10.084C44.1814 10.084 50.3789 16.2571 50.3789 23.9045ZM8.75391 56.1522C8.75391 46.9386 27.2539 43.0996 36.5039 43.0996C45.7539 43.0996 64.2539 46.9386 64.2539 56.1522V61.9732C64.2539 65.4489 61.4363 68.2665 57.9606 68.2665H15.0472C11.5715 68.2665 8.75391 65.4489 8.75391 61.9732V56.1522Z"
                              fill="#026FD3"
                            />
                          </svg>
                        </div>
                        <button
                          className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center border-2"
                          style={{
                            backgroundColor: "#2B3139",
                            borderColor: "#1E2329",
                          }}
                        >
                          <Camera className="w-4 h-4" style={{ color: "#848E9C" }} />
                        </button>
                      </div>
                      <div>
                        <div className="font-medium" style={{ color: "#EAECEF" }}>
                          {formData.email}
                        </div>
                        <div className="text-sm" style={{ color: "#848E9C" }}>
                          ID: 49363
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block">
                        <span className="text-sm block mb-2" style={{ color: "#848E9C" }}>
                          Apelido
                        </span>
                        <input
                          name="nickname"
                          value={formData.nickname}
                          onChange={(e) => handleInputChange("nickname", e.target.value)}
                          className="w-full rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          style={{
                            backgroundColor: "#2B3139",
                            border: "1px solid #434C5A",
                            color: "#EAECEF",
                          }}
                          required
                        />
                      </label>
                    </div>

                    <div className="form__control">
                      <label className="block">
                        <span className="text-sm block mb-2" style={{ color: "#848E9C" }}>
                          Nome
                        </span>
                        <input
                          name="first_name"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          className="w-full rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          style={{
                            backgroundColor: "#2B3139",
                            border: "1px solid #434C5A",
                            color: "#EAECEF",
                          }}
                          required
                        />
                      </label>
                    </div>

                    <div className="form__control">
                      <label className="block">
                        <span className="text-sm block mb-2" style={{ color: "#848E9C" }}>
                          Sobrenome
                        </span>
                        <input
                          name="last_name"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          className="w-full rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          style={{
                            backgroundColor: "#2B3139",
                            border: "1px solid #434C5A",
                            color: "#EAECEF",
                          }}
                          required
                        />
                      </label>
                    </div>

                    <div className="form__control">
                      <label className="block">
                        <span className="text-sm block mb-2" style={{ color: "#848E9C" }}>
                          Data de nascimento
                        </span>
                        <input
                          name="birthday"
                          type="date"
                          value={formData.birthday}
                          onChange={(e) => handleInputChange("birthday", e.target.value)}
                          className="w-full rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          style={{
                            backgroundColor: "#2B3139",
                            border: "1px solid #434C5A",
                            color: "#EAECEF",
                          }}
                          required
                        />
                      </label>
                    </div>

                    <div className="form__control">
                      <label className="block">
                        <span className="text-sm block mb-2" style={{ color: "#848E9C" }}>
                          CPF
                        </span>
                        <input
                          name="passport_id"
                          value={formData.cpf}
                          onChange={(e) => handleInputChange("cpf", e.target.value)}
                          className="w-full rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          style={{
                            backgroundColor: "#2B3139",
                            border: "1px solid #434C5A",
                            color: "#EAECEF",
                          }}
                          required
                        />
                      </label>
                    </div>

                    <div className="form__control">
                      <label className="block">
                        <span className="text-sm block mb-2" style={{ color: "#848E9C" }}>
                          Email
                        </span>
                        <input
                          type="email"
                          value={formData.email}
                          disabled
                          className="w-full rounded px-3 py-2 focus:outline-none"
                          style={{
                            backgroundColor: "#374151",
                            border: "1px solid #434C5A",
                            color: "#848E9C",
                            cursor: "not-allowed",
                          }}
                        />
                      </label>
                    </div>

                    <div className="form__control">
                      <label className="block">
                        <span className="text-sm block mb-2" style={{ color: "#848E9C" }}>
                          País
                        </span>
                        <div
                          className="rounded px-3 py-2"
                          style={{
                            backgroundColor: "#374151",
                            border: "1px solid #434C5A",
                            color: "#848E9C",
                            cursor: "not-allowed",
                          }}
                        >
                          {formData.country}
                        </div>
                      </label>
                    </div>

                    <div className="form__control">
                      <label className="block">
                        <span className="text-sm block mb-2" style={{ color: "#848E9C" }}>
                          DDI
                        </span>
                        <select
                          value={formData.ddi}
                          onChange={(e) => handleInputChange("ddi", e.target.value)}
                          className="w-full rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          style={{
                            backgroundColor: "#2B3139",
                            border: "1px solid #434C5A",
                            color: "#EAECEF",
                          }}
                        >
                          <option value="+55">BR +55</option>
                          <option value="+1">US +1</option>
                          <option value="+44">UK +44</option>
                        </select>
                      </label>
                    </div>

                    <div className="form__control">
                      <label className="block">
                        <span className="text-sm block mb-2" style={{ color: "#848E9C" }}>
                          Telefone
                        </span>
                        <input
                          name="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          className="w-full rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          style={{
                            backgroundColor: "#2B3139",
                            border: "1px solid #434C5A",
                            color: "#EAECEF",
                          }}
                          required
                        />
                      </label>
                    </div>

                    <div className="form__control">
                      <label className="block">
                        <span className="text-sm block mb-2" style={{ color: "#848E9C" }}>
                          Endereço
                        </span>
                        <input
                          name="address"
                          value={formData.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          className="w-full rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          style={{
                            backgroundColor: "#2B3139",
                            border: "1px solid #434C5A",
                            color: "#EAECEF",
                          }}
                          required
                        />
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-2 rounded font-medium"
                      style={{ backgroundColor: "#FCD535", color: "#000000" }}
                    >
                      Salvar
                    </button>
                  </div>
                </form>

                {/* Document Verification */}
                <div className="rounded-lg p-6" style={{ backgroundColor: "#1E2329" }}>
                  <div className="text-lg font-semibold mb-6" style={{ color: "#EAECEF" }}>
                    Documentos de verificação:
                  </div>
                  <div className="rounded-lg p-4" style={{ backgroundColor: "#2B3139" }}>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="text-yellow-500">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="font-medium" style={{ color: "#EAECEF" }}>
                        Verificação de documentos
                      </div>
                    </div>
                    <div className="text-sm" style={{ color: "#848E9C" }}>
                      Antes de iniciar a verificação de seus documentos, é preciso completar os dados do seu perfil.
                      <br />
                      <ul className="mt-2 space-y-1">
                        <li>• Nome</li>
                        <li>• Sobrenome</li>
                        <li>• CPF</li>
                        <li>• Data de Nascimento</li>
                        <li>• Endereço</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="flex-1">
                <div className="space-y-6">
                  {/* Password Change */}
                  <div className="rounded-lg p-6" style={{ backgroundColor: "#1E2329" }}>
                    <div className="text-lg font-semibold mb-6" style={{ color: "#EAECEF" }}>
                      Alteração de senha:
                    </div>
                    <form className="space-y-4">
                      <div className="form__control">
                        <label className="block">
                          <span className="text-sm block mb-2" style={{ color: "#848E9C" }}>
                            Senha antiga
                          </span>
                          <input
                            name="old_password"
                            type="password"
                            value={formData.oldPassword}
                            onChange={(e) => handleInputChange("oldPassword", e.target.value)}
                            className="w-full rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            style={{
                              backgroundColor: "#2B3139",
                              border: "1px solid #434C5A",
                              color: "#EAECEF",
                            }}
                          />
                        </label>
                      </div>

                      <div className="form__control">
                        <label className="block">
                          <span className="text-sm block mb-2" style={{ color: "#848E9C" }}>
                            Nova senha
                          </span>
                          <input
                            name="new_password"
                            type="password"
                            value={formData.newPassword}
                            onChange={(e) => handleInputChange("newPassword", e.target.value)}
                            className="w-full rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            style={{
                              backgroundColor: "#2B3139",
                              border: "1px solid #434C5A",
                              color: "#EAECEF",
                            }}
                          />
                        </label>
                      </div>

                      <div className="form__control">
                        <label className="block">
                          <span className="text-sm block mb-2" style={{ color: "#848E9C" }}>
                            Confirmar nova senha
                          </span>
                          <input
                            name="confirm_password"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                            className="w-full rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            style={{
                              backgroundColor: "#2B3139",
                              border: "1px solid #434C5A",
                              color: "#EAECEF",
                            }}
                          />
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="px-6 py-2 rounded font-medium"
                        style={{ backgroundColor: "#FCD535", color: "#000000" }}
                      >
                        Alterar senha
                      </button>
                    </form>
                  </div>

                  {/* Settings */}
                  <div className="rounded-lg p-6" style={{ backgroundColor: "#1E2329" }}>
                    <div className="space-y-4">
                      <div className="form__control">
                        <label className="block">
                          <span className="text-sm block mb-2" style={{ color: "#848E9C" }}>
                            Idioma
                          </span>
                          <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            style={{
                              backgroundColor: "#2B3139",
                              border: "1px solid #434C5A",
                              color: "#EAECEF",
                            }}
                          >
                            <option value="Espanhol">Espanhol</option>
                            <option value="Inglês">Inglês</option>
                            <option value="Português(BR)">Português(BR)</option>
                          </select>
                        </label>
                      </div>

                      <div className="form__control">
                        <label className="block">
                          <span className="text-sm block mb-2" style={{ color: "#848E9C" }}>
                            Fuso horário
                          </span>
                          <select
                            value={timezone}
                            onChange={(e) => setTimezone(e.target.value)}
                            className="w-full rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            style={{
                              backgroundColor: "#2B3139",
                              border: "1px solid #434C5A",
                              color: "#EAECEF",
                            }}
                          >
                            <option value="(UTC+03:00)">(UTC+03:00)</option>
                            <option value="(UTC-03:00)">(UTC-03:00)</option>
                            <option value="(UTC+00:00)">(UTC+00:00)</option>
                          </select>
                        </label>
                      </div>

                      <button
                        type="button"
                        className="px-6 py-2 rounded font-medium w-full"
                        style={{ backgroundColor: "#FCD535", color: "#000000" }}
                      >
                        Termos e Políticas
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
