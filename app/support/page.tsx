"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LiveChat } from "@/components/live-chat"
import { Loader2, MessageCircle } from "lucide-react"

export default function SupportPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white p-4">
        <Card className="bg-white border-gray-200 w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-black">Acesso Negado</CardTitle>
            <CardDescription className="text-gray-600">
              Você precisa estar logado para acessar o suporte.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-6">
      <div className="max-w-5xl mx-auto h-full">
        <div className="mb-4 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-black mb-2">Suporte ao Cliente</h1>
          <p className="text-sm md:text-base text-gray-600">
            Entre em contato conosco para qualquer dúvida ou problema
          </p>
        </div>

        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg md:text-xl text-black flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-gray-700" />
              Chat ao Vivo
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">
              Converse em tempo real com nossa equipe de suporte
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <LiveChat userId={user.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
