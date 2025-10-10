// app/api/user/profile/route.ts
import { NextResponse, NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  try {
    // Pegar o token do header Authorization
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: "Token não fornecido" },
        { status: 401 }
      )
    }

    // Criar cliente Supabase com service role (apenas para verificar token)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Verificar o token e pegar usuário
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.error("Auth error:", authError)
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    // Get user profile data from user_profiles table
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("email, balance, created_at, updated_at")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("Error fetching profile:", profileError)
      
      // Se não existe perfil, criar um novo
      const { data: newProfile, error: createError } = await supabase
        .from("user_profiles")
        .insert({
          id: user.id,
          email: user.email,
          balance: 0,
          admin: false
        })
        .select("email, balance, created_at, updated_at")
        .single()

      if (createError) {
        console.error("Error creating profile:", createError)
        return NextResponse.json(
          { error: "Erro ao criar perfil" },
          { status: 500 }
        )
      }

      return NextResponse.json({
        email: newProfile.email || user.email,
        balance: Number(newProfile.balance) || 0,
        created_at: newProfile.created_at,
        updated_at: newProfile.updated_at
      })
    }

    return NextResponse.json({
      email: profile.email || user.email,
      balance: Number(profile.balance) || 0,
      created_at: profile.created_at,
      updated_at: profile.updated_at
    })
  } catch (error) {
    console.error("Error in profile API:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Pegar o token do header Authorization
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: "Token não fornecido" },
        { status: 401 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { email } = body

    // Update email in auth
    if (email && email !== user.email) {
      const { error: updateError } = await supabase.auth.updateUser({
        email: email
      })

      if (updateError) {
        return NextResponse.json(
          { error: "Erro ao atualizar email" },
          { status: 400 }
        )
      }

      // Update email in user_profiles table
      await supabase
        .from("user_profiles")
        .update({ email: email, updated_at: new Date().toISOString() })
        .eq("id", user.id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}