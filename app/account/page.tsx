"use client"

import { useState } from "react"
import Link from "next/link"
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

  const [language, setLanguage] = useState("Português(BR)")
  const [timezone, setTimezone] = useState("(UTC+03:00)")

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen text-white font-sans overflow-x-hidden bg-[#141d2f]">

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-6">
          <div className="flex-1">
            <form className="rounded-lg p-6 mb-6 bg-[#101825]">
              <div className="text-lg font-semibold mb-6 text-white">
                Dados pessoais:
              </div>

              <div className="mb-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center bg-[#1a2332]">
                      <svg width="74" height="63" viewBox="0 0 74 63" fill="none" className="w-12 h-12">
                        <path
                          d="M50.3789 23.9045C50.3789 31.5518 44.1814 37.7249 36.5039 37.7249C28.8264 37.7249 22.6289 31.5518 22.6289 23.9045C22.6289 16.2571 28.8264 10.084 36.5039 10.084C44.1814 10.084 50.3789 16.2571 50.3789 23.9045ZM8.75391 56.1522C8.75391 46.9386 27.2539 43.0996 36.5039 43.0996C45.7539 43.0996 64.2539 46.9386 64.2539 56.1522V61.9732C64.2539 65.4489 61.4363 68.2665 57.9606 68.2665H15.0472C11.5715 68.2665 8.75391 65.4489 8.75391 61.9732V56.1522Z"
                          fill="#26d47c"
                        />
                      </svg>
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center border-2 bg-[#1a2332] border-[#101825]">
                      <Camera className="w-4 h-4 text-[#848E9C]" />
                    </button>
                  </div>
                  <div>
                    <div className="font-medium text-white">{formData.email}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block">
                    <span className="text-sm block mb-2 text-[#848E9C]">Apelido</span>
                    <input
                      name="nickname"
                      value={formData.nickname}
                      onChange={(e) => handleInputChange("nickname", e.target.value)}
                      className="w-full rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#26d47c] bg-[#1a2332] border border-[#2B3139] text-white"
                      required
                    />
                  </label>
                </div>

                <div>
                  <label className="block">
                    <span className="text-sm block mb-2 text-[#848E9C]">Nome</span>
                    <input
                      name="first_name"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className="w-full rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#26d47c] bg-[#1a2332] border border-[#2B3139] text-white"
                      required
                    />
                  </label>
                </div>

                <div>
                  <label className="block">
                    <span className="text-sm block mb-2 text-[#848E9C]">Sobrenome</span>
                    <input
                      name="last_name"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className="w-full rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#26d47c] bg-[#1a2332] border border-[#2B3139] text-white"
                      required
                    />
                  </label>
                </div>

                <div>
                  <label className="block">
                    <span className="text-sm block mb-2 text-[#848E9C]">Data de nascimento</span>
                    <input
                      name="birthday"
                      type="date"
                      value={formData.birthday}
                      onChange={(e) => handleInputChange("birthday", e.target.value)}
                      className="w-full rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#26d47c] bg-[#1a2332] border border-[#2B3139] text-white"
                      required
                    />
                  </label>
                </div>

                <div>
                  <label className="block">
                    <span className="text-sm block mb-2 text-[#848E9C]">CPF</span>
                    <input
                      name="passport_id"
                      value={formData.cpf}
                      onChange={(e) => handleInputChange("cpf", e.target.value)}
                      className="w-full rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#26d47c] bg-[#1a2332] border border-[#2B3139] text-white"
                      required
                    />
                  </label>
                </div>

                <div>
                  <label className="block">
                    <span className="text-sm block mb-2 text-[#848E9C]">Email</span>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full rounded px-3 py-2 focus:outline-none bg-[#2a3441] border border-[#2B3139] text-[#848E9C] cursor-not-allowed"
                    />
                  </label>
                </div>

                <div>
                  <label className="block">
                    <span className="text-sm block mb-2 text-[#848E9C]">País</span>
                    <div className="rounded px-3 py-2 bg-[#2a3441] border border-[#2B3139] text-[#848E9C] cursor-not-allowed">
                      {formData.country}
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block">
                    <span className="text-sm block mb-2 text-[#848E9C]">DDI</span>
                    <select
                      value={formData.ddi}
                      onChange={(e) => handleInputChange("ddi", e.target.value)}
                      className="w-full rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#26d47c] bg-[#1a2332] border border-[#2B3139] text-white"
                    >
                      <option value="+55">BR +55</option>
                      <option value="+1">US +1</option>
                      <option value="+44">UK +44</option>
                    </select>
                  </label>
                </div>

                <div>
                  <label className="block">
                    <span className="text-sm block mb-2 text-[#848E9C]">Telefone</span>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="w-full rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#26d47c] bg-[#1a2332] border border-[#2B3139] text-white"
                      required
                    />
                  </label>
                </div>

                <div>
                  <label className="block">
                    <span className="text-sm block mb-2 text-[#848E9C]">Endereço</span>
                    <input
                      name="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      className="w-full rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#26d47c] bg-[#1a2332] border border-[#2B3139] text-white"
                      required
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2 rounded font-medium bg-[#26d47c] text-black hover:bg-[#22c55e] transition-colors"
                >
                  Salvar
                </button>
              </div>
            </form>

         
          </div>

          <div className="flex-1">
            <div className="space-y-6">
              <div className="rounded-lg p-6 bg-[#101825]">
                <div className="text-lg font-semibold mb-6 text-white">
                  Alteração de senha:
                </div>
                <form className="space-y-4">
                  <div>
                    <label className="block">
                      <span className="text-sm block mb-2 text-[#848E9C]">Senha antiga</span>
                      <input
                        name="old_password"
                        type="password"
                        value={formData.oldPassword}
                        onChange={(e) => handleInputChange("oldPassword", e.target.value)}
                        className="w-full rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#26d47c] bg-[#1a2332] border border-[#2B3139] text-white"
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block">
                      <span className="text-sm block mb-2 text-[#848E9C]">Nova senha</span>
                      <input
                        name="new_password"
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => handleInputChange("newPassword", e.target.value)}
                        className="w-full rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#26d47c] bg-[#1a2332] border border-[#2B3139] text-white"
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block">
                      <span className="text-sm block mb-2 text-[#848E9C]">Confirmar nova senha</span>
                      <input
                        name="confirm_password"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        className="w-full rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#26d47c] bg-[#1a2332] border border-[#2B3139] text-white"
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2 rounded font-medium bg-[#26d47c] text-black hover:bg-[#22c55e] transition-colors"
                  >
                    Alterar senha
                  </button>
                </form>
              </div>

        
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}