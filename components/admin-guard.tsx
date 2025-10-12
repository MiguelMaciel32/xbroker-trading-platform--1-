"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { checkAdminAccess } from "@/lib/actions/check-admin"
import { Loader2, Shield, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface AdminGuardProps {
  children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function verifyAdmin() {
      try {
        const result = await checkAdminAccess()

        if (!result.success) {
          setError(result.error || "Erro ao verificar permissões")
          setLoading(false)
          return
        }

        if (!result.isAdmin) {
          setError("Acesso negado: você não tem permissões de administrador")
          setLoading(false)
          return
        }

        setIsAdmin(true)
      } catch (err) {
        setError("Erro interno ao verificar permissões")
        console.error("Erro na verificação de admin:", err)
      } finally {
        setLoading(false)
      }
    }

    verifyAdmin()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Shield className="h-16 w-16 text-white animate-pulse" />
            <Loader2 className="h-8 w-8 text-gray-400 animate-spin absolute top-4 left-4" />
          </div>
          <div className="text-center bg-white">
            <h2 className="text-xl font-semibold text-white mb-2">Verificando Permissões</h2>
            <p className="text-black-400">Aguarde enquanto validamos seu acesso...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAdmin || error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="bg-gray-900 border-gray-700 max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-gray-800 rounded-full w-fit">
              <AlertTriangle className="h-8 w-8 text-gray-400" />
            </div>
            <CardTitle className="text-white text-xl">Acesso Restrito</CardTitle>
            <CardDescription className="text-gray-400">
              {error || "Você não tem permissões para acessar esta área"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">Para acessar esta área você precisa:</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Estar logado no sistema</li>
                <li>• Ter permissões de administrador</li>
                <li>• Contatar o administrador do sistema</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => router.push("/")} className="flex-1 bg-white text-black hover:bg-gray-200">
                Voltar ao Início
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
