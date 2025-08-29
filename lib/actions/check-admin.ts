"use client"

import { createClient } from "@/lib/supabase/client"

interface AdminCheckResult {
  success: boolean
  isAdmin: boolean
  error?: string
  user?: {
    id: string
    email: string
  }
}

export async function checkAdminAccess(): Promise<AdminCheckResult> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, isAdmin: false, error: "Usuário não autenticado" }
    }

    // console.log("Usuário autenticado:", user.email, user.id)

    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("admin, email")
      .eq("id", user.id)
      .single()

    //   console.log("Perfil do usuário:", userProfile, profileError)
    if (profileError) {
      console.error("Erro ao buscar dados do perfil:", profileError)
      return {
        success: false,
        isAdmin: false,
        error: "Erro ao verificar permissões do usuário",
      }
    }

    const isAdmin = userProfile?.admin === true

    return {
      success: true,
      isAdmin,
      user: {
        id: user.id,
        email: user.email || (userProfile?.email as string) || "",
      },
    }
  } catch (error) {
    console.error("Erro interno na verificação de admin:", error)
    return {
      success: false,
      isAdmin: false,
      error: "Erro interno do servidor",
    }
  }
}
