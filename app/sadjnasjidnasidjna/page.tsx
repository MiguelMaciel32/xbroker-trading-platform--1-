"use client"

import type React from "react"
import { AdminGuard } from "@/components/admin-guard"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getPlatformConfig, updatePlatformConfig } from "@/lib/platform-config"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Loader2, Save, Settings, Users, Palette, Upload, Check, Eye, Edit2, MessageCircle } from "lucide-react"
import { LiveChat } from "@/components/live-chat"

interface User {
  id: string
  email: string
  balance: number
  created_at: string
  updated_at: string
}

function AdminPage() {
  const [config, setConfig] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [dragActive, setDragActive] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [savedStates, setSavedStates] = useState<Record<string, boolean>>({})
  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [editingBalance, setEditingBalance] = useState<string | null>(null)
  const [newBalance, setNewBalance] = useState<string>("")
  const [supportUsers, setSupportUsers] = useState<any[]>([])
  const [loadingSupportUsers, setLoadingSupportUsers] = useState(false)
  const [selectedSupportUser, setSelectedSupportUser] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const loadUsers = async () => {
    setLoadingUsers(true)
    try {
      const { data, error } = await supabase.from("user_profiles").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("[v0] Error loading users:", error)
        throw error
      }

      setUsers((data as unknown as User[]) || [])
    } catch (error) {
      console.error("[v0] Error loading users:", error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const updateUserBalance = async (userId: string, balance: number) => {
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({
          balance,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (error) {
        console.error("Error updating balance:", error)
        throw error
      }

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? {
                ...user,
                balance,
                updated_at: new Date().toISOString(),
              }
            : user,
        ),
      )

      console.log("[v0] Balance updated successfully")
      return true
    } catch (error) {
      console.error("Error updating balance:", error)
      return false
    }
  }

  const handleBalanceEdit = (userId: string, currentBalance: number) => {
    setEditingBalance(userId)
    setNewBalance(currentBalance.toString())
  }

  const handleBalanceSave = async (userId: string) => {
    const balance = Number.parseFloat(newBalance)
    if (isNaN(balance)) {
      alert("Por favor, insira um valor válido")
      return
    }

    const success = await updateUserBalance(userId, balance)
    if (success) {
      setEditingBalance(null)
      setNewBalance("")
    } else {
      alert("Erro ao atualizar saldo")
    }
  }

  const handleBalanceCancel = () => {
    setEditingBalance(null)
    setNewBalance("")
  }

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

  const loadSupportUsers = async () => {
    setLoadingSupportUsers(true)
    try {
      const { data, error } = await supabase
        .from("support_messages")
        .select(`
          user_id,
          user_profiles!support_messages_user_id_fkey(email),
          created_at
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("[v0] Error loading support users:", error)
        throw error
      }

      // Group by user_id and get unique users
      const uniqueUsers = Array.from(new Map((data || []).map((item: any) => [item.user_id, item])).values())

      setSupportUsers(uniqueUsers)
    } catch (error) {
      console.error("[v0] Error loading support users:", error)
    } finally {
      setLoadingSupportUsers(false)
    }
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

  useEffect(() => {
    checkAuth()
    loadConfig()
    loadUsers()
    loadSupportUsers()
  }, [])

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return
    }
    setUser(user)
  }

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
    <AdminGuard>
      <div className="p-6 animate-in fade-in duration-500 bg-white min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h1 className="text-4xl font-bold text-black mb-2">Painel Administrativo</h1>
              <p className="text-gray-600 text-lg">Configure sua plataforma whitelabel com facilidade</p>
            </div>
          </div>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="bg-gray-100 border border-gray-200 p-1 rounded-lg">
              <TabsTrigger value="general" className="data-[state=active]:bg-black data-[state=active]:text-white">
                <Settings className="h-4 w-4 mr-2" />
                Geral
              </TabsTrigger>
              <TabsTrigger value="branding" className="data-[state=active]:bg-black data-[state=active]:text-white">
                <Palette className="h-4 w-4 mr-2" />
                Visual
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-black data-[state=active]:text-white">
                <Users className="h-4 w-4 mr-2" />
                Usuários
              </TabsTrigger>
              <TabsTrigger value="support" className="data-[state=active]:bg-black data-[state=active]:text-white">
                <MessageCircle className="h-4 w-4 mr-2" />
                Suporte
              </TabsTrigger>
              <TabsTrigger value="API" className="data-[state=active]:bg-black data-[state=active]:text-white">
                <Settings className="h-4 w-4 mr-2" />
                API
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6 animate-in slide-in-from-bottom duration-300">
              <Card className="bg-white border-gray-200">
                <CardHeader className="border-b border-gray-200">
                  <CardTitle className="text-black flex items-center gap-2">
                    <Settings className="h-5 w-5 text-black" />
                    Configurações Gerais
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Configure o nome da plataforma e links personalizados
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {[
                    {
                      key: "platform_name",
                      label: "Nome da Plataforma",
                      placeholder: "Digite o nome da sua plataforma",
                    },
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
              <Card className="bg-white border-gray-200">
                <CardHeader className="border-b border-gray-200">
                  <CardTitle className="text-black flex items-center gap-2">
                    <Palette className="h-5 w-5 text-black" />
                    Configurações Visuais
                  </CardTitle>
                  <CardDescription className="text-gray-600">Personalize as cores e logo da plataforma</CardDescription>
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
                          <p className="text-black font-medium mb-2">
                            {uploading ? "Enviando..." : "Arraste sua logo aqui"}
                          </p>
                          <p className="text-gray-600 text-sm mb-4">ou clique para selecionar um arquivo</p>
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
                      <Label htmlFor={key} className="text-gray-300 font-medium flex items-center gap-2">
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
                          className="w-12 h-12 rounded-lg border-2 border-[#2b3040] shadow-lg"
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
              <Card className="bg-white border-gray-200">
                <CardHeader className="border-b border-gray-200">
                  <CardTitle className="text-black flex items-center gap-2">
                    <Users className="h-5 w-5 text-black" />
                    Gerenciamento de Usuários
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Visualize todos os usuários e gerencie seus saldos
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {loadingUsers ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-black" />
                        <p className="text-gray-500">Carregando usuários...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-black">
                          Total de usuários: <span className="font-semibold text-black">{users.length}</span>
                        </p>
                        <Button
                          onClick={loadUsers}
                          variant="outline"
                          size="sm"
                          className="border-gray-300 text-black hover:bg-gray-100 bg-transparent"
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Atualizar Lista
                        </Button>
                      </div>

                      <div className="rounded-lg border border-gray-200 overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-gray-200 hover:bg-gray-100">
                              <TableHead className="text-gray-600">Nome</TableHead>
                              <TableHead className="text-gray-600">Email</TableHead>
                              <TableHead className="text-gray-600">Data de Cadastro</TableHead>
                              <TableHead className="text-gray-600">Saldo</TableHead>
                              <TableHead className="text-gray-600">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {users.map((user) => (
                              <TableRow key={user.id} className="border-gray-200 hover:bg-gray-100">
                                <TableCell className="text-black">{user.email?.split("@")[0] || "Usuário"}</TableCell>
                                <TableCell className="text-gray-600">{user.email}</TableCell>
                                <TableCell className="text-gray-600">
                                  {new Date(user.created_at).toLocaleDateString("pt-BR")}
                                </TableCell>
                                <TableCell className="text-black">
                                  {editingBalance === user.id ? (
                                    <div className="flex items-center gap-2">
                                      <Input
                                        type="number"
                                        step="0.01"
                                        value={newBalance}
                                        onChange={(e) => setNewBalance(e.target.value)}
                                        className="w-24 bg-gray-100 border-gray-300 text-black"
                                        placeholder="0.00"
                                      />
                                      <Button
                                        size="sm"
                                        onClick={() => handleBalanceSave(user.id)}
                                        className="bg-[#248f32] hover:bg-[#1e7129] px-2"
                                      >
                                        <Check className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleBalanceCancel}
                                        className="border-gray-300 text-black hover:bg-gray-100 px-2 bg-transparent"
                                      >
                                        ✕
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono">R$ {(user.balance || 0).toFixed(2)}</span>
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {editingBalance !== user.id && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleBalanceEdit(user.id, user.balance || 0)}
                                      className="border-gray-300 text-black hover:bg-gray-100"
                                    >
                                      <Edit2 className="h-3 w-3 mr-1" />
                                      Editar Saldo
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {users.length === 0 && (
                        <div className="text-center py-12">
                          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 text-lg">Nenhum usuário encontrado</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="support" className="space-y-6 animate-in slide-in-from-bottom duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Users List */}
                <div className="lg:col-span-1">
                  <Card className="bg-white border-gray-200">
                    <CardHeader className="border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-black flex items-center gap-2">
                          <MessageCircle className="h-5 w-5 text-black" />
                          Conversas
                        </CardTitle>
                        <Button
                          onClick={loadSupportUsers}
                          variant="outline"
                          size="sm"
                          className="border-gray-300 text-black hover:bg-gray-100 bg-transparent"
                        >
                          Atualizar
                        </Button>
                      </div>
                      <CardDescription className="text-gray-600">
                        Total: {supportUsers.length} conversas
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      {loadingSupportUsers ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-black" />
                        </div>
                      ) : supportUsers.length === 0 ? (
                        <div className="text-center py-8">
                          <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">Nenhuma conversa encontrada</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[600px] overflow-y-auto">
                          {supportUsers.map((item: any) => (
                            <Card
                              key={item.user_id}
                              className={`cursor-pointer transition-all ${
                                selectedSupportUser === item.user_id
                                  ? "bg-gray-100 border-black"
                                  : "bg-white border-gray-200 hover:border-gray-400"
                              }`}
                              onClick={() => setSelectedSupportUser(item.user_id)}
                            >
                              <CardContent className="p-4">
                                <p className="text-black font-medium mb-1">
                                  {item.user_profiles?.email || "Usuário desconhecido"}
                                </p>
                                <p className="text-gray-500 text-xs">
                                  {new Date(item.created_at).toLocaleString("pt-BR")}
                                </p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Chat Area */}
                <div className="lg:col-span-2">
                  <Card className="bg-white border-gray-200">
                    <CardHeader className="border-b border-gray-200">
                      <CardTitle className="text-black">
                        {selectedSupportUser ? "Chat de Suporte" : "Selecione uma conversa"}
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        {selectedSupportUser
                          ? "Responda ao cliente em tempo real"
                          : "Escolha uma conversa para ver as mensagens"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {selectedSupportUser && user ? (
                        <LiveChat userId={selectedSupportUser} isAdmin={true} adminId={user.id} />
                      ) : (
                        <div className="flex items-center justify-center h-[600px]">
                          <div className="text-center">
                            <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Selecione uma conversa para iniciar o atendimento</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="API" className="space-y-6 animate-in slide-in-from-bottom duration-300">
              <Card className="bg-white border-gray-200">
                <CardHeader className="border-b border-gray-200">
                  <CardTitle className="text-black flex items-center gap-2">
                    <Settings className="h-5 w-5 text-black" />
                    API PIX UP E SUITPAY
                  </CardTitle>
                  <CardDescription className="text-gray-600">
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
                          className="bg-gray-100 border-gray-300 text-black focus:border-[#248f32] transition-colors duration-200 group-hover:border-gray-400"
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
    </AdminGuard>
  )
}

export default AdminPage
