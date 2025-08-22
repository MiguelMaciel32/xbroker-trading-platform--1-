import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-4">
          <img src="/placeholder.svg?height=80&width=200" alt="XBroker" className="mx-auto h-20" />
          <h1 className="text-4xl font-bold text-white">XBroker</h1>
          <p className="text-slate-300">Plataforma de Trading Profissional</p>
        </div>

        <div className="space-y-4">
          <Link href="/login" className="block">
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg">Fazer Login</Button>
          </Link>

          <Link href="/register" className="block">
            <Button
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-800 py-3 text-lg bg-transparent"
            >
              Criar Conta
            </Button>
          </Link>

          <Link href="/trading" className="block">
            <Button variant="ghost" className="w-full text-slate-400 hover:text-white py-3">
              Ver Demo →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
