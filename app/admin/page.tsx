"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getPlatformConfig, updatePlatformConfig } from "@/lib/platform-config"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Loader2, Save, Settings, Users, Palette, Upload, Check, Eye } from "lucide-react"

export default function AdminPage() {
  const [config, setConfig] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [dragActive, setDragActive] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [savedStates, setSavedStates] = useState<Record<string, boolean>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) return

    setUploading(true)
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const logoUrl = e.target?.result as string
        setPreviewImage(logoUrl)
        await handleSave("platform_logo", logoUrl)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Error uploading logo:", error)
    } finally {
      setUploading(false)
    }
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    handleFileUpload(file)
  }

  useEffect(() => {
    checkAuth()
    loadConfig()
  }, [])

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      // router.push("/login")
      return
    }
    setUser(user)
  }

  const loadConfig = async () => {
    try {
      const platformConfig = await getPlatformConfig()
      setConfig(platformConfig)
    } catch (error) {
      console.error("Error loading config:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (key: string, value: string) => {
    setSaving(true)
    try {
      const success = await updatePlatformConfig(key, value)
      if (success) {
        setConfig((prev) => ({ ...prev, [key]: value }))
        setSavedStates((prev) => ({ ...prev, [key]: true }))
        setTimeout(() => {
          setSavedStates((prev) => ({ ...prev, [key]: false }))
        }, 2000)
        if (key === "platform_logo") {
          window.location.reload()
        }
      }
    } catch (error) {
      console.error("Error saving config:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (key: string, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  const SaveButton = ({ configKey, disabled = false }: { configKey: string; disabled?: boolean }) => (
    <Button
      onClick={() => handleSave(configKey, config[configKey])}
      disabled={saving || disabled}
      className={`bg-[#248f32] hover:bg-[#1e7129] transition-all duration-200 ${
        savedStates[configKey] ? "bg-green-600 scale-105" : ""
      }`}
    >
      {saving ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : savedStates[configKey] ? (
        <Check className="h-4 w-4" />
      ) : (
        <Save className="h-4 w-4" />
      )}
    </Button>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#248f32]" />
          <p className="text-gray-400 animate-pulse">Carregando configurações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#248f32]/20 to-transparent rounded-lg blur-xl"></div>
          <div className="relative bg-[#1e2329]/80 backdrop-blur-sm border border-[#2b3040] rounded-lg p-6">
            <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Painel Administrativo
            </h1>
            <p className="text-gray-400 text-lg">Configure sua plataforma whitelabel com facilidade</p>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="bg-[#1e2329] border-[#2b3040] p-1 rounded-lg shadow-lg">
            <TabsTrigger
              value="general"
              className="data-[state=active]:bg-[#248f32] data-[state=active]:text-white transition-all duration-200 hover:bg-[#2b3040]"
            >
              <Settings className="h-4 w-4 mr-2" />
              Geral
            </TabsTrigger>
            <TabsTrigger
              value="branding"
              className="data-[state=active]:bg-[#248f32] data-[state=active]:text-white transition-all duration-200 hover:bg-[#2b3040]"
            >
              <Palette className="h-4 w-4 mr-2" />
              Visual
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-[#248f32] data-[state=active]:text-white transition-all duration-200 hover:bg-[#2b3040]"
            >
              <Users className="h-4 w-4 mr-2" />
              Usuários
            </TabsTrigger>
            <TabsTrigger
              value="API"
              className="data-[state=active]:bg-[#248f32] data-[state=active]:text-white transition-all duration-200 hover:bg-[#2b3040]"
            >
              <Settings className="h-4 w-4 mr-2" />
              API
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6 animate-in slide-in-from-bottom duration-300">
            <Card className="bg-[#1e2329] border-[#2b3040] shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <CardHeader className="border-b border-[#2b3040]">
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="h-5 w-5 text-[#248f32]" />
                  Configurações Gerais
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Configure o nome da plataforma e links personalizados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {[
                  { key: "platform_name", label: "Nome da Plataforma", placeholder: "Digite o nome da sua plataforma" },
                  { key: "community_name", label: "Nome da Comunidade", placeholder: "Nome da sua comunidade" },
                  { key: "group_link", label: "Link do Grupo", placeholder: "https://t.me/seugrupo" },
                  { key: "group_text", label: "Texto do Grupo", placeholder: "Junte-se ao nosso grupo" },
                  { key: "support_link", label: "Link do Suporte", placeholder: "https://wa.me/5511999999999" },
                  { key: "support_text", label: "Texto do Suporte", placeholder: "Entre em contato conosco" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key} className="space-y-3 group">
                    <Label htmlFor={key} className="text-gray-300 font-medium flex items-center gap-2">
                      {label}
                      {savedStates[key] && <Check className="h-4 w-4 text-green-500" />}
                    </Label>
                    <div className="flex gap-3">
                      <Input
                        id={key}
                        value={config[key] || ""}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        placeholder={placeholder}
                        className="bg-[#2b3040] border-[#3e4651] text-white focus:border-[#248f32] transition-colors duration-200 group-hover:border-[#3e4651]/80"
                      />
                      <SaveButton configKey={key} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branding" className="space-y-6 animate-in slide-in-from-bottom duration-300">
            <Card className="bg-[#1e2329] border-[#2b3040] shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <CardHeader className="border-b border-[#2b3040]">
                <CardTitle className="text-white flex items-center gap-2">
                  <Palette className="h-5 w-5 text-[#248f32]" />
                  Configurações Visuais
                </CardTitle>
                <CardDescription className="text-gray-400">Personalize as cores e logo da plataforma</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-3">
                  <Label className="text-gray-300 font-medium">Logo da Plataforma</Label>
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-8 transition-all duration-300 ${
                      dragActive
                        ? "border-[#248f32] bg-[#248f32]/10 scale-105"
                        : "border-[#3e4651] hover:border-[#248f32]/50 hover:bg-[#2b3040]/50"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      disabled={uploading}
                    />

                    <div className="flex flex-col items-center gap-4">
                      {(previewImage || config.platform_logo) && (
                        <div className="relative group">
                          <img
                            src={previewImage || config.platform_logo}
                            alt="Logo preview"
                            className="h-20 w-20 object-contain bg-white rounded-lg p-2 shadow-lg group-hover:scale-110 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                            <Eye className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      )}

                      <div className="text-center">
                        <Upload
                          className={`h-12 w-12 mx-auto mb-4 transition-colors duration-200 ${
                            dragActive ? "text-[#248f32]" : "text-gray-400"
                          }`}
                        />
                        <p className="text-white font-medium mb-2">
                          {uploading ? "Enviando..." : "Arraste sua logo aqui"}
                        </p>
                        <p className="text-gray-400 text-sm mb-4">ou clique para selecionar um arquivo</p>
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="bg-[#248f32] hover:bg-[#1e7129] transition-all duration-200 hover:scale-105"
                        >
                          {uploading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Upload className="h-4 w-4 mr-2" />
                          )}
                          Selecionar Arquivo
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {[
                  { key: "primary_color", label: "Cor Primária (Botões de Compra)", default: "#248f32" },
                  { key: "secondary_color", label: "Cor Secundária (Botões de Venda)", default: "#d1281f" },
                ].map(({ key, label, default: defaultColor }) => (
                  <div key={key} className="space-y-3 group">
                    <Label className="text-gray-300 font-medium flex items-center gap-2">
                      {label}
                      {savedStates[key] && <Check className="h-4 w-4 text-green-500" />}
                    </Label>
                    <div className="flex gap-3 items-center">
                      <div className="relative">
                        <Input
                          type="color"
                          value={config[key] || defaultColor}
                          onChange={(e) => handleInputChange(key, e.target.value)}
                          className="w-16 h-12 rounded-lg border-2 border-[#3e4651] cursor-pointer hover:scale-110 transition-transform duration-200"
                        />
                        <div
                          className="absolute inset-1 rounded-md shadow-inner"
                          style={{ backgroundColor: config[key] || defaultColor }}
                        />
                      </div>
                      <Input
                        value={config[key] || defaultColor}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        className="bg-[#2b3040] border-[#3e4651] text-white focus:border-[#248f32] transition-colors duration-200 flex-1"
                        placeholder={defaultColor}
                      />
                      <div
                        className="w-12 h-12 rounded-lg border-2 border-[#3e4651] shadow-lg"
                        style={{ backgroundColor: config[key] || defaultColor }}
                      />
                      <SaveButton configKey={key} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6 animate-in slide-in-from-bottom duration-300">
            <Card className="bg-[#1e2329] border-[#2b3040] shadow-xl">
              <CardHeader className="border-b border-[#2b3040]">
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#248f32]" />
                  Gerenciamento de Usuários
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Em breve: adicionar e remover administradores
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Funcionalidade em desenvolvimento...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="API" className="space-y-6 animate-in slide-in-from-bottom duration-300">
            <Card className="bg-[#1e2329] border-[#2b3040] shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <CardHeader className="border-b border-[#2b3040]">
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="h-5 w-5 text-[#248f32]" />
                  API PIX UP E SUITPAY
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Configure as chaves de API para integração de pagamentos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {[
                  { key: "suitpay_api", label: "API SuitPay", placeholder: "Insira sua chave da API SuitPay" },
                  { key: "pixup_api", label: "API PIX UP", placeholder: "Insira sua chave da API PIX UP" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key} className="space-y-3 group">
                    <Label htmlFor={key} className="text-gray-300 font-medium flex items-center gap-2">
                      {label}
                      {savedStates[key] && <Check className="h-4 w-4 text-green-500" />}
                    </Label>
                    <div className="flex gap-3">
                      <Input
                        id={key}
                        value={config[key] || ""}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        placeholder={placeholder}
                        className="bg-[#2b3040] border-[#3e4651] text-white focus:border-[#248f32] transition-colors duration-200 group-hover:border-[#3e4651]/80"
                        type="password"
                      />
                      <SaveButton configKey={key} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
