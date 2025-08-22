"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getPlatformConfig, updatePlatformConfig } from "@/lib/platform-config"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Loader2, Save, Settings, Users, Palette } from "lucide-react"

export default function AdminPage() {
  const [config, setConfig] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

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
        // Refresh the page to apply changes
        window.location.reload()
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#131722] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#131722] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Painel Administrativo</h1>
          <p className="text-gray-400">Configure sua plataforma whitelabel</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="bg-[#1e2329] border-[#2b3040]">
            <TabsTrigger value="general" className="data-[state=active]:bg-[#FFF]">
              <Settings className="h-4 w-4 mr-2" />
              Geral
            </TabsTrigger>
            <TabsTrigger value="branding" className="data-[state=active]:bg-[#FFF]">
              <Palette className="h-4 w-4 mr-2" />
              Visual
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-[#FFF]">
              <Users className="h-4 w-4 mr-2" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="API" className="data-[state=active]:bg-[#FFF]">
              <Users className="h-4 w-4 mr-2" />
              Api
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card className="bg-[#1e2329] border-[#2b3040]">
              <CardHeader>
                <CardTitle className="text-white">Configurações Gerais</CardTitle>
                <CardDescription className="text-gray-400">
                  Configure o nome da plataforma e links personalizados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="platform_name" className="text-gray-300">
                    Nome da Plataforma
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="platform_name"
                      value={config.platform_name || ""}
                      onChange={(e) => handleInputChange("platform_name", e.target.value)}
                      className="bg-[#2b3040] border-[#3e4651] text-white"
                    />
                    <Button
                      onClick={() => handleSave("platform_name", config.platform_name)}
                      disabled={saving}
                      className="bg-[#248f32] hover:bg-[#1e7129]"
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="community_name" className="text-gray-300">
                    Nome da Comunidade
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="community_name"
                      value={config.community_name || ""}
                      onChange={(e) => handleInputChange("community_name", e.target.value)}
                      className="bg-[#2b3040] border-[#3e4651] text-white"
                    />
                    <Button
                      onClick={() => handleSave("community_name", config.community_name)}
                      disabled={saving}
                      className="bg-[#248f32] hover:bg-[#1e7129]"
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="support_link" className="text-gray-300">
                    Link do Suporte
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="support_link"
                      value={config.support_link || ""}
                      onChange={(e) => handleInputChange("support_link", e.target.value)}
                      placeholder="https://wa.me/5511999999999"
                      className="bg-[#2b3040] border-[#3e4651] text-white"
                    />
                    <Button
                      onClick={() => handleSave("support_link", config.support_link)}
                      disabled={saving}
                      className="bg-[#248f32] hover:bg-[#1e7129]"
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="support_text" className="text-gray-300">
                    Texto do Suporte
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="support_text"
                      value={config.support_text || ""}
                      onChange={(e) => handleInputChange("support_text", e.target.value)}
                      className="bg-[#2b3040] border-[#3e4651] text-white"
                    />
                    <Button
                      onClick={() => handleSave("support_text", config.support_text)}
                      disabled={saving}
                      className="bg-[#248f32] hover:bg-[#1e7129]"
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branding" className="space-y-6">
            <Card className="bg-[#1e2329] border-[#2b3040]">
              <CardHeader>
                <CardTitle className="text-white">Configurações Visuais</CardTitle>
                <CardDescription className="text-gray-400">Personalize as cores e logo da plataforma</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="primary_color" className="text-gray-300">
                    Cor Primária (Botões de Compra)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary_color"
                      type="color"
                      value={config.primary_color || "#248f32"}
                      onChange={(e) => handleInputChange("primary_color", e.target.value)}
                      className="bg-[#2b3040] border-[#3e4651] w-20 h-10"
                    />
                    <Input
                      value={config.primary_color || "#248f32"}
                      onChange={(e) => handleInputChange("primary_color", e.target.value)}
                      className="bg-[#2b3040] border-[#3e4651] text-white flex-1"
                    />
                    <Button
                      onClick={() => handleSave("primary_color", config.primary_color)}
                      disabled={saving}
                      className="bg-[#248f32] hover:bg-[#1e7129]"
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondary_color" className="text-gray-300">
                    Cor Secundária (Botões de Venda)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary_color"
                      type="color"
                      value={config.secondary_color || "#d1281f"}
                      onChange={(e) => handleInputChange("secondary_color", e.target.value)}
                      className="bg-[#2b3040] border-[#3e4651] w-20 h-10"
                    />
                    <Input
                      value={config.secondary_color || "#d1281f"}
                      onChange={(e) => handleInputChange("secondary_color", e.target.value)}
                      className="bg-[#2b3040] border-[#3e4651] text-white flex-1"
                    />
                    <Button
                      onClick={() => handleSave("secondary_color", config.secondary_color)}
                      disabled={saving}
                      className="bg-[#248f32] hover:bg-[#1e7129]"
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="bg-[#1e2329] border-[#2b3040]">
              <CardHeader>
                <CardTitle className="text-white">Gerenciamento de Usuários</CardTitle>
                <CardDescription className="text-gray-400">
                  Em breve: adicionar e remover administradores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">Funcionalidade em desenvolvimento...</p>
              </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="API" className="space-y-6">
            <Card className="bg-[#1e2329] border-[#2b3040]">
              <CardHeader>
                <CardTitle className="text-white">API PIX UP E SUITPAY</CardTitle>
              </CardHeader>
              <CardContent>
              <div className="space-y-2">
                  <Label htmlFor="platform_name" className="text-gray-300">
                    API SuitPay
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="platform_name"
                      value={config.platform_name || ""}
                      onChange={(e) => handleInputChange("platform_name", e.target.value)}
                      className="bg-[#2b3040] border-[#3e4651] text-white"
                    />
                    <Button
                      onClick={() => handleSave("platform_name", config.platform_name)}
                      disabled={saving}
                      className="bg-[#248f32] hover:bg-[#1e7129]"
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    </Button>
                  </div>
                   <div className="space-y-2">
                  <Label htmlFor="platform_name" className="text-gray-300">
                    API PIX UP
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="platform_name"
                      value={config.PIXUP || ""}
                      onChange={(e) => handleInputChange("platform_name", e.target.value)}
                      className="bg-[#2b3040] border-[#3e4651] text-white"
                    />
                    <Button
                      onClick={() => handleSave("platform_name", config.platform_name)}
                      disabled={saving}
                      className="bg-[#248f32] hover:bg-[#1e7129]"
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    </Button>
                  </div>
                  </div>
                  </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
