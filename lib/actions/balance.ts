"use client"

import { createClient } from "@/lib/supabase/client"

// Tipos para as operações de saldo
interface BalanceData {
  balance: number
  user_id: string
}

interface BalanceResult {
  success: boolean
  data?: BalanceData
  error?: string
}

interface BalanceUpdateRequest {
  balance: number
  operation?: "set" | "add" | "subtract"
}

export async function getUserBalance(): Promise<BalanceResult> {
  try {
    const supabase = await createClient()

    // Verificar se o usuário está autenticado
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Usuário não autenticado" }
    }

    // Buscar o perfil do usuário com o saldo
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("balance")
      .eq("id", user.id)
      .single()

    if (profileError && profileError.code !== "PGRST116") {
      // PGRST116 = not found
      console.error("Erro ao buscar perfil do usuário:", profileError)
      return { success: false, error: "Erro ao buscar dados do usuário" }
    }

    // Se não encontrou o perfil, criar um com saldo inicial
    if (!userProfile) {
      const initialBalance = 10000.0 // Saldo demo inicial

      const { data: newProfile, error: createError } = await supabase
        .from("user_profiles")
        .insert({
          id: user.id,
          email: user.email,
          balance: initialBalance,
        })
        .select("balance")
        .single()

      if (createError) {
        console.error("Erro ao criar perfil do usuário:", createError)
        return { success: false, error: "Erro ao criar perfil do usuário" }
      }

      return {
        success: true,
        data: {
          balance: initialBalance,
          user_id: user.id,
        },
      }
    }

    // Garantir que o balance é um número
    const balance =
      typeof userProfile.balance === "number"
        ? userProfile.balance
        : Number.parseFloat(String(userProfile.balance)) || 0

    return {
      success: true,
      data: {
        balance: balance,
        user_id: user.id,
      },
    }
  } catch (error) {
    console.error("Erro interno:", error)
    return { success: false, error: "Erro interno do servidor" }
  }
}

export async function updateUserBalance(request: BalanceUpdateRequest): Promise<BalanceResult> {
  try {
    const supabase = await createClient()

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Usuário não autenticado" }
    }

    const { balance, operation = "set" } = request

    // Validar entrada
    if (typeof balance !== "number" || isNaN(balance)) {
      return { success: false, error: "Saldo deve ser um número válido" }
    }

    if (!["set", "add", "subtract"].includes(operation)) {
      return { success: false, error: "Operação inválida. Use: set, add ou subtract" }
    }

    let newBalance: number

    if (operation === "add" || operation === "subtract") {
      // Buscar saldo atual para operações de adição/subtração
      const { data: currentProfile, error: fetchError } = await supabase
        .from("user_profiles")
        .select("balance")
        .eq("id", user.id)
        .single()

      if (fetchError) {
        console.error("Erro ao buscar saldo atual:", fetchError)
        return { success: false, error: "Erro ao buscar saldo atual" }
      }

      // Garantir que currentBalance é um número
      const currentBalance =
        typeof currentProfile.balance === "number"
          ? currentProfile.balance
          : Number.parseFloat(String(currentProfile.balance)) || 0

      if (operation === "add") {
        newBalance = currentBalance + balance
      } else {
        // subtract
        newBalance = Math.max(0, currentBalance - balance) // Não permitir saldo negativo
      }
    } else {
      // Operação "set"
      newBalance = Math.max(0, balance) // Não permitir saldo negativo
    }

    // Atualizar o saldo
    const { data: updatedProfile, error: updateError } = await supabase
      .from("user_profiles")
      .update({ balance: newBalance })
      .eq("id", user.id)
      .select("balance")
      .single()

    if (updateError) {
      console.error("Erro ao atualizar saldo:", updateError)
      return { success: false, error: "Erro ao atualizar saldo" }
    }

    // Garantir que o balance retornado é um número
    const finalBalance =
      typeof updatedProfile.balance === "number"
        ? updatedProfile.balance
        : Number.parseFloat(String(updatedProfile.balance)) || 0


    return {
      success: true,
      data: {
        balance: finalBalance,
        user_id: user.id,
      },
    }
  } catch (error) {
    console.error("Erro interno:", error)
    return { success: false, error: "Erro interno do servidor" }
  }
}
