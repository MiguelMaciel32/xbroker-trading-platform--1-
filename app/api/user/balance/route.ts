// app/api/user/balance/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/client"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Verificar se o usuário está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      )
    }

    // Buscar o perfil do usuário com o saldo
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("balance")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("Erro ao buscar perfil do usuário:", profileError)
      return NextResponse.json(
        { error: "Erro ao buscar dados do usuário" },
        { status: 500 }
      )
    }

    // Se não encontrou o perfil, criar um com saldo inicial
    if (!userProfile) {
      const initialBalance = 10000 // Saldo demo inicial
      
      const { data: newProfile, error: createError } = await supabase
        .from("user_profiles")
        .insert({
          id: user.id,
          email: user.email,
          balance: initialBalance
        })
        .select("balance")
        .single()

      if (createError) {
        console.error("Erro ao criar perfil do usuário:", createError)
        return NextResponse.json(
          { error: "Erro ao criar perfil do usuário" },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: {
          balance: initialBalance,
          user_id: user.id
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        balance: Number(userProfile.balance) || 0,
        user_id: user.id
      }
    })

  } catch (error) {
    console.error("Erro interno:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// Endpoint para atualizar o saldo (opcional)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { balance, operation = "set" } = body

    if (typeof balance !== "number") {
      return NextResponse.json(
        { error: "Saldo deve ser um número válido" },
        { status: 400 }
      )
    }

    let updateData: any = {}

    if (operation === "add") {
      // Adicionar ao saldo atual
      const { data: currentProfile } = await supabase
        .from("user_profiles")
        .select("balance")
        .eq("id", user.id)
        .single()

      const currentBalance = Number(currentProfile?.balance) || 0
      updateData.balance = currentBalance + Number(balance)
    } else if (operation === "subtract") {
      // Subtrair do saldo atual
      const { data: currentProfile } = await supabase
        .from("user_profiles")
        .select("balance")
        .eq("id", user.id)
        .single()

      const currentBalance = Number(currentProfile?.balance) || 0
      updateData.balance = Math.max(0, currentBalance - Number(balance)) // Não permitir saldo negativo
    } else {
      // Definir saldo específico
      updateData.balance = Number(balance)
    }

    const { data: updatedProfile, error: updateError } = await supabase
      .from("user_profiles")
      .update(updateData)
      .eq("id", user.id)
      .select("balance")
      .single()

    if (updateError) {
      console.error("Erro ao atualizar saldo:", updateError)
      return NextResponse.json(
        { error: "Erro ao atualizar saldo" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        balance: Number(updatedProfile.balance),
        user_id: user.id
      }
    })

  } catch (error) {
    console.error("Erro interno:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}