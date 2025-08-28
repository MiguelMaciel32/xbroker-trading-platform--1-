export class PixupBRService {
  static async createPixPayment(data: {
    amount: number
    external_id: string
    payerQuestion?: string
    postbackUrl?: string
    payer?: {
      name?: string
      document?: string
      email?: string
    }
  }) {
    try {
      const response = await fetch("/api/pixupbr/qrcode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao criar pagamento PIX")
      }

      return result.data
    } catch (error) {
      console.error("Erro ao criar pagamento PIX:", error)
      throw error
    }
  }
}
