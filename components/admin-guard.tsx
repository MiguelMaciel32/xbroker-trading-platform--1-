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
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Shield className="h-16 w-16 text-[#248f32] animate-pulse" />
            <Loader2 className="h-8 w-8 text-white animate-spin absolute top-4 left-4" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-white mb-2">Verificando Permissões</h2>
            <p className="text-gray-400">Aguarde enquanto validamos seu acesso...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAdmin || error) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
        <Card className="bg-[#1e2329] border-[#2b3040] max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-red-500/10 rounded-full w-fit">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <CardTitle className="text-white text-xl">Acesso Restrito</CardTitle>
            <CardDescription className="text-gray-400">
              {error || "Você não tem permissões para acessar esta área"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-[#2b3040] rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">Para acessar esta área você precisa:</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Estar logado no sistema</li>
                <li>• Ter permissões de administrador</li>
                <li>• Contatar o administrador do sistema</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => router.push("/")} className="flex-1 bg-[#248f32] hover:bg-[#1e7129]">
                Voltar ao Início
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="flex-1 border-[#2b3040] text-gray-300 hover:bg-[#2b3040]"
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
