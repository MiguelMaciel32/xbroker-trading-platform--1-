import { createClient } from "@/lib/supabase/client"

export interface UserProfile {
  id: string
  email: string
  balance: number
  created_at: string
  updated_at: string
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase.from("user_profiles").select("*").eq("id", user.id).single()

  if (error) {
    console.error("Error fetching user profile:", error)
    return null
  }

  return data
}

export async function updateUserBalance(newBalance: number): Promise<boolean> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  const { error } = await supabase
    .from("user_profiles")
    .update({
      balance: newBalance,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) {
    console.error("Error updating balance:", error)
    return false
  }

  return true
}

export async function createUserProfile(userId: string, email: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase.from("user_profiles").insert({
    id: userId,
    email: email,
    balance: 1000.0,
  })

  if (error) {
    console.error("Error creating user profile:", error)
    return false
  }

  return true
}
