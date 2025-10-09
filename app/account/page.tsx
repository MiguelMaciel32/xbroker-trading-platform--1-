"use client"

import { useState } from "react"
import { Camera } from "lucide-react"

export default function AccountPage() {
  const [formData, setFormData] = useState({
    nickname: "",
    firstName: "",
    lastName: "",
    birthday: "",
    cpf: "",
    email: "agatha-brito@gmail.com",
    country: "Brasil",
    ddi: "+55",
    phone: "",
    address: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
  }

  return (
    <div className="min-h-screen text-black font-sans overflow-x-hidden bg-white">
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="rounded-xl p-8 mb-6 bg-white border-2 border-gray-200 shadow-sm">
              <div className="text-2xl font-bold mb-6 text-black">
                Dados pessoais
              </div>

              <div className="mb-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gray-100 border-2 border-gray-200">
                      <svg width="74" height="63" viewBox="0 0 74 63" fill="none" className="w-12 h-12">
                        <path
                          d="M50.3789 23.9045C50.3789 31.5518 44.1814 37.7249 36.5039 37.7249C28.8264 37.7249 22.6289 31.5518 22.6289 23.9045C22.6289 16.2571 28.8264 10.084 36.5039 10.084C44.1814 10.084 50.3789 16.2571 50.3789 23.9045ZM8.75391 56.1522C8.75391 46.9386 27.2539 43.0996 36.5039 43.0996C45.7539 43.0996 64.2539 46.9386 64.2539 56.1522V61.9732C64.2539 65.4489 61.4363 68.2665 57.9606 68.2665H15.0472C11.5715 68.2665 8.75391 65.4489 8.75391 61.9732V56.1522Z"
                          fill="#000000"
                        />
                      </svg>
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center border-2 bg-white border-gray-200 hover:bg-gray-50 transition-colors">
                      <Camera className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <div>
                    <div className="font-bold text-black">{formData.email}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block">
                    <span className="text-sm font-semibold block mb-2 text-gray-700">Apelido</span>
                    <input
                      name="nickname"
                      value={formData.nickname}
                      onChange={(e) => handleInputChange("nickname", e.target.value)}
                      className="w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black bg-white border-2 border-gray-200 text-black transition-all"
                    />
                  </label>
                </div>

                <div>
                  <label className="block">
                    <span className="text-sm font-semibold block mb-2 text-gray-700">Nome</span>
                    <input
                      name="first_name"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className="w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black bg-white border-2 border-gray-200 text-black transition-all"
                    />
                  </label>
                </div>

                <div>
                  <label className="block">
                    <span className="text-sm font-semibold block mb-2 text-gray-700">Sobrenome</span>
                    <input
                      name="last_name"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className="w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black bg-white border-2 border-gray-200 text-black transition-all"
                    />
                  </label>
                </div>

                <div>
                  <label className="block">
                    <span className="text-sm font-semibold block mb-2 text-gray-700">Data de nascimento</span>
                    <input
                      name="birthday"
                      type="date"
                      value={formData.birthday}
                      onChange={(e) => handleInputChange("birthday", e.target.value)}
                      className="w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black bg-white border-2 border-gray-200 text-black transition-all"
                    />
                  </label>
                </div>

                <div>
                  <label className="block">
                    <span className="text-sm font-semibold block mb-2 text-gray-700">CPF</span>
                    <input
                      name="passport_id"
                      value={formData.cpf}
                      onChange={(e) => handleInputChange("cpf", e.target.value)}
                      className="w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black bg-white border-2 border-gray-200 text-black transition-all"
                    />
                  </label>
                </div>

                <div>
                  <label className="block">
                    <span className="text-sm font-semibold block mb-2 text-gray-700">Email</span>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full rounded-lg px-4 py-3 bg-gray-100 border-2 border-gray-200 text-gray-500 cursor-not-allowed"
                    />
                  </label>
                </div>

                <div>
                  <label className="block">
                    <span className="text-sm font-semibold block mb-2 text-gray-700">País</span>
                    <div className="rounded-lg px-4 py-3 bg-gray-100 border-2 border-gray-200 text-gray-500 cursor-not-allowed">
                      {formData.country}
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block">
                    <span className="text-sm font-semibold block mb-2 text-gray-700">DDI</span>
                    <select
                      value={formData.ddi}
                      onChange={(e) => handleInputChange("ddi", e.target.value)}
                      className="w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black bg-white border-2 border-gray-200 text-black transition-all"
                    >
                      <option value="+55">BR +55</option>
                      <option value="+1">US +1</option>
                      <option value="+44">UK +44</option>
                    </select>
                  </label>
                </div>

                <div>
                  <label className="block">
                    <span className="text-sm font-semibold block mb-2 text-gray-700">Telefone</span>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black bg-white border-2 border-gray-200 text-black transition-all"
                    />
                  </label>
                </div>

                <div>
                  <label className="block">
                    <span className="text-sm font-semibold block mb-2 text-gray-700">Endereço</span>
                    <input
                      name="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      className="w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black bg-white border-2 border-gray-200 text-black transition-all"
                    />
                  </label>
                </div>

                <button
                  onClick={handleSubmit}
                  className="px-8 py-3 rounded-lg font-bold bg-black text-white hover:bg-gray-800 transition-all shadow-md"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="rounded-xl p-8 bg-white border-2 border-gray-200 shadow-sm">
              <div className="text-2xl font-bold mb-6 text-black">
                Alteração de senha
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block">
                    <span className="text-sm font-semibold block mb-2 text-gray-700">Senha antiga</span>
                    <input
                      type="password"
                      value={formData.oldPassword}
                      onChange={(e) => handleInputChange("oldPassword", e.target.value)}
                      className="w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black bg-white border-2 border-gray-200 text-black transition-all"
                    />
                  </label>
                </div>

                <div>
                  <label className="block">
                    <span className="text-sm font-semibold block mb-2 text-gray-700">Nova senha</span>
                    <input
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange("newPassword", e.target.value)}
                      className="w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black bg-white border-2 border-gray-200 text-black transition-all"
                    />
                  </label>
                </div>

                <div>
                  <label className="block">
                    <span className="text-sm font-semibold block mb-2 text-gray-700">Confirmar nova senha</span>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className="w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black bg-white border-2 border-gray-200 text-black transition-all"
                    />
                  </label>
                </div>

                <button
                  onClick={handleSubmit}
                  className="px-8 py-3 rounded-lg font-bold bg-black text-white hover:bg-gray-800 transition-all shadow-md"
                >
                  Alterar senha
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}