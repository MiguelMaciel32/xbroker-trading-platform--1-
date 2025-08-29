import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/client"

interface PixupWebhookPayload {
  requestBody: {
    transactionType: string
    transactionId: string
    external_id: string
    amount: number
    paymentType: string
    status: "PAID" | "CANCELLED" | "EXPIRED" | string
    dateApproval?: string
    creditParty: {
      name: string
      email: string
      taxId: string
    }
    debitParty: {
      bank: string
      taxId: string
    }
  }
}

async function findUserByEmailFromExternalId(external_id: string): Promise<{ userId: string; email: string } | null> {
  try {
    const emailMatch = external_id.split("|")[0]

    if (!emailMatch || !emailMatch.includes("@")) {
      console.log("Email não encontrado no external_id:", external_id)
      return null
    }

    const supabase = createClient()

    const { data: profile, error } = await supabase
      .from("user_profiles")
      .select("id, email")
      .eq("email", emailMatch)
      .single()

    if (error) {
      console.error("Erro ao buscar usuário por email do external_id:", error)
      return null
    }

    return { userId: profile.id as string, email: profile.email as string }
  } catch (error) {
    console.error("Erro na busca do usuário pelo external_id:", error)
    return null
  }
}

async function findUserByEmail(email: string): Promise<string | null> {
  try {
    const supabase = createClient()

    const { data: profile, error } = await supabase.from("user_profiles").select("id").eq("email", email).single()

    if (error) {
      console.error("Erro ao buscar usuário por email:", error)
      return null
    }

    return (profile?.id as string) || null
  } catch (error) {
    console.error("Erro na busca do usuário:", error)
    return null
  }
}

async function updateUserBalanceInDB(userId: string, amount: number): Promise<boolean> {
  try {
    const supabase = createClient()

    const { data: currentProfile, error: fetchError } = await supabase
      .from("user_profiles")
      .select("balance")
      .eq("id", userId)
      .single()

    if (fetchError) {
      console.error("Erro ao buscar saldo atual:", fetchError)
      return false
    }

    const currentBalance =
      typeof currentProfile.balance === "number"
        ? currentProfile.balance
        : Number.parseFloat(String(currentProfile.balance)) || 0

    const newBalance = currentBalance + amount

    const { error: updateError } = await supabase.from("user_profiles").update({ balance: newBalance }).eq("id", userId)

    if (updateError) {
      console.error("Erro ao atualizar saldo:", updateError)
      return false
    }

    console.log(`Saldo atualizado com sucesso: ${currentBalance} + ${amount} = ${newBalance} para usuário ${userId}`)
    return true
  } catch (error) {
    console.error("Erro em updateUserBalanceInDB:", error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: PixupWebhookPayload = await request.json()

    console.log("Webhook PIX recebido:", JSON.stringify(body, null, 2))

    const { requestBody } = body
    const { status, amount, creditParty, transactionId, external_id } = requestBody

    switch (status) {
      case "PAID":
        console.log(`Pagamento aprovado - Transação: ${transactionId}, External ID: ${external_id}`)
        console.log(`Valor: R$ ${amount}, Cliente: ${creditParty.name} (${creditParty.email})`)

        const userInfo = await findUserByEmailFromExternalId(external_id)
        let userId: string | null = userInfo?.userId || null
        let userEmail = userInfo?.email || creditParty.email

        if (!userId) {
          console.log("Usuário não encontrado pelo external_id, tentando pelo email do creditParty...")
          userId = await findUserByEmail(creditParty.email)
          userEmail = creditParty.email
        }

        if (!userId) {
          console.error(
            "Usuário não encontrado com nenhum método. External ID:",
            external_id,
            "Email creditParty:",
            creditParty.email,
          )
          return NextResponse.json(
            {
              error: "Usuário não encontrado",
              message: "Não foi possível encontrar o usuário com as informações fornecidas",
            },
            { status: 404 },
          )
        }

        const success = await updateUserBalanceInDB(userId, amount)
        if (!success) {
          return NextResponse.json(
            {
              error: "Falha ao atualizar saldo",
              message: "Erro interno ao processar o pagamento",
            },
            { status: 500 },
          )
        }

        console.log(`Saldo do usuário ${userEmail} (ID: ${userId}) aumentado em R$ ${amount}`)
        break
      case "CANCELLED":
        console.log(`Pagamento cancelado - Transação: ${transactionId}`)
        break
      case "EXPIRED":
        console.log(`Pagamento expirado - Transação: ${transactionId}`)
        break
      default:
        console.log(`Status desconhecido: ${status}`)
    }

    return NextResponse.json({
      success: true,
      message: "Webhook processado com sucesso",
    })
  } catch (error) {
    console.error("Erro no processamento do webhook PIX:", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message: "Falha ao processar webhook",
      },
      { status: 500 },
    )
  }
}
