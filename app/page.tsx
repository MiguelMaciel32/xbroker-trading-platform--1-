import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Zap, BarChart3, Globe } from "lucide-react"

export default function BinanceLandingPage() {
  const cryptoData = [
    {
      symbol: "BTC",
      name: "Bitcoin",
      price: "$108,529.99",
      change: "-3.61%",
      isNegative: true,
      image: "/cryptos/btc.png",
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      price: "$4,349.77",
      change: "-3.20%",
      isNegative: true,
      image: "/cryptos/eth.png"
    },
    {
      symbol: "BNB",
      name: "BNB",
      price: "$857.74",
      change: "-2.05%",
      isNegative: true,
      image: "/cryptos/bnb.png",
    },
  ]

  const newCryptoData = [
    {
      symbol: "MITO",
      name: "Mitosis",
      price: "$0.2272",
      change: "+35.24%",
      isNegative: false,
      image: "/cryptos/mito.png",
    },
    {
      symbol: "DOLO",
      name: "Dolomite",
      price: "$0.2147",
      change: "-7.81%",
      isNegative: true,
      image: "/cryptos/dolo.png",
    },
    {
      symbol: "PLUME",
      name: "Plume",
      price: "$0.08025",
      change: "-3.95%",
      isNegative: true,
      image: "/cryptos/plume.png",
    },
  ]

  const faqItems = [
    {
      question: "O que é uma corretora de criptomoedas?",
      answer:
        "As corretoras de criptomoedas são mercados digitais que permitem comprar e vender ativos como Bitcoin, Ethereum e BNB.",
    },
    {
      question: "Quais produtos a Quantium Broker oferece?",
      answer: "Negociação spot, futuros, staking, empréstimos e muito mais.",
    },
    {
      question: "Como começar a negociar?",
      answer: "Cadastre-se, verifique sua conta, deposite fundos e comece a negociar com nossa plataforma intuitiva.",
    },
    {
      question: "A plataforma é segura?",
      answer: "Sim, utilizamos criptografia de nível bancário e armazenamento offline para proteger seus ativos.",
    },
  ]

  const features = [
    {
      icon: Shield,
      title: "Segurança Avançada",
      description: "Proteção de nível bancário com autenticação de dois fatores e armazenamento offline.",
    },
    {
      icon: Zap,
      title: "Negociação Rápida",
      description: "Execute ordens em milissegundos com nossa tecnologia de alta performance.",
    },
    {
      icon: BarChart3,
      title: "Ferramentas Profissionais",
      description: "Gráficos avançados, indicadores técnicos e análise de mercado em tempo real.",
    },
    {
      icon: Globe,
      title: "Suporte Global",
      description: "Atendimento 24/7 em português e suporte para mais de 100 países.",
    },
  ]

  const stats = [
    { number: "286M+", label: "Usuários Registrados" },
    { number: "$2.1T+", label: "Volume Negociado" },
    { number: "350+", label: "Criptomoedas Listadas" },
    { number: "180+", label: "Países Atendidos" },
  ]

  const services = [
    {
      title: "Spot Trading",
      description: "Negocie mais de 350 criptomoedas com spreads baixos",
      image: "/trading-chart.png",
    },
    {
      title: "Futuros",
      description: "Alavancagem até 125x em contratos perpétuos",
      image: "/futures-trading.png",
    },
    {
      title: "Staking",
      description: "Ganhe recompensas passivas com seus ativos",
      image: "/staking-rewards.png",
    },
  ]

  return (
    <div className="min-h-screen bg-[#181A20] text-[#EAECEF] flex flex-col">
      {/* HEADER */}
      <header className="w-full fixed top-0 left-0 z-50 bg-[#181A20] border-b border-[#2B3139]">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="text-2xl font-bold text-[#F0B90B]">Quantium Broker</div>
          <div className="flex gap-4">
            <Button variant="ghost" className="text-[#EAECEF] hover:text-[#F0B90B]">
              Login
            </Button>
            <Button className="bg-[#FCD535] text-[#202630] hover:bg-[#F0B90B]">Cadastre-se</Button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 pt-24">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div className="space-y-8">
              <h1 className="text-6xl font-bold leading-tight">
                <span className="text-[#F0B90B]">286,926,466</span> <br />
                USUÁRIOS CONFIAM EM NÓS
              </h1>
              <div className="flex flex-col sm:flex-row gap-4 max-w-lg">
                <Input
                  placeholder="E-mail/Telefone"
                  className="flex-1 h-14 bg-[#2B3139] border-[#2B3139] text-[#EAECEF] placeholder:text-[#848E9C]"
                />
                <Button className="h-14 px-8 bg-[#FCD535] text-[#202630] hover:bg-[#F0B90B] font-semibold">
                  Comece Agora
                </Button>
              </div>
            </div>

            {/* Right (Crypto List) */}
            <Card className="bg-[#1E2329] border-[#2B3139]">
              <CardContent className="p-6">
                <Tabs defaultValue="popular" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-transparent">
                    <TabsTrigger
                      value="popular"
                      className="rounded-lg data-[state=active]:bg-[#FCD535] data-[state=active]:text-[#202630] text-[#EAECEF] hover:text-[#F0B90B]"
                    >
                      Popular
                    </TabsTrigger>
                    <TabsTrigger
                      value="new"
                      className="rounded-lg data-[state=active]:bg-[#FCD535] data-[state=active]:text-[#202630] text-[#EAECEF] hover:text-[#F0B90B]"
                    >
                      Nova Listagem
                    </TabsTrigger>
                  </TabsList>

                  {/* Popular */}
                  <TabsContent value="popular" className="space-y-4">
                    {cryptoData.map((crypto) => (
                      <div
                        key={crypto.symbol}
                        className="flex items-center justify-between py-2 hover:bg-[#252A32] rounded-lg px-2"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <img
                            src={crypto.image || "/placeholder.svg"}
                            alt={crypto.name}
                            className="w-7 h-7 rounded-full"
                          />
                          <div>
                            <div className="font-semibold text-[#EAECEF]">{crypto.symbol}</div>
                            <div className="text-sm text-[#848E9C]">{crypto.name}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-[#EAECEF]">{crypto.price}</div>
                          <div className={`text-sm ${crypto.isNegative ? "text-[#F6465D]" : "text-[#0ECB81]"}`}>
                            {crypto.change}
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  {/* Nova Listagem */}
                  <TabsContent value="new" className="space-y-4">
                    {newCryptoData.map((crypto) => (
                      <div
                        key={crypto.symbol}
                        className="flex items-center justify-between py-2 hover:bg-[#252A32] rounded-lg px-2"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <img
                            src={crypto.image || "/placeholder.svg"}
                            alt={crypto.name}
                            className="w-7 h-7 rounded-full"
                          />
                          <div>
                            <div className="font-semibold text-[#EAECEF]">{crypto.symbol}</div>
                            <div className="text-sm text-[#848E9C]">{crypto.name}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-[#EAECEF]">{crypto.price}</div>
                          <div className={`text-sm ${crypto.isNegative ? "text-[#F6465D]" : "text-[#0ECB81]"}`}>
                            {crypto.change}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="text-center">
                      <a href="#" className="text-sm text-[#848E9C] hover:text-[#F0B90B] transition">
                        Ver mais moedas →
                      </a>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="bg-[#1E2329] py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-4xl lg:text-5xl font-bold text-[#F0B90B] mb-2">{stat.number}</div>
                  <div className="text-[#848E9C] text-lg">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6">Por que escolher a Quantium Broker?</h2>
            <p className="text-xl text-[#848E9C] max-w-3xl mx-auto">
              A plataforma de criptomoedas mais confiável do mundo, com tecnologia de ponta e segurança incomparável.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => {
              const IconComponent = feature.icon
              return (
                <Card key={i} className="bg-[#1E2329] border-[#2B3139] hover:border-[#F0B90B] transition-colors">
                  <CardContent className="p-8 text-center">
                    <div className="flex justify-center mb-4">
                      <IconComponent className="w-12 h-12 text-[#F0B90B]" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4 text-[#EAECEF]">{feature.title}</h3>
                    <p className="text-[#848E9C]">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

   

      
       

        <section className="container mx-auto px-4 py-20">
          <div className="text-center bg-gradient-to-r from-[#F0B90B] to-[#FCD535] rounded-2xl p-16">
            <h2 className="text-5xl font-bold text-[#202630] mb-6">Comece sua Jornada Crypto Hoje</h2>
            <p className="text-xl text-[#202630] mb-8 opacity-80">
              Junte-se a milhões de usuários que confiam na Quantium Broker
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
              <Input
                placeholder="Seu melhor e-mail"
                className="flex-1 h-14 bg-white border-white text-[#202630] placeholder:text-[#202630] placeholder:opacity-60"
              />
              <Button className="h-14 px-8 bg-[#202630] text-[#F0B90B] hover:bg-[#181A20] font-semibold">
                Cadastrar Grátis
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-4xl font-bold text-center mb-12">Perguntas Frequentes</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqItems.map((item, i) => (
              <Card key={i} className="bg-[#1E2329] border-[#2B3139]">
                <CardContent className="p-6">
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer list-none">
                      <h3 className="text-lg text-white font-semibold">{item.question}</h3>
                      <span className="text-[#848E9C] group-open:hidden">+</span>
                      <span className="text-[#848E9C] hidden group-open:block">−</span>
                    </summary>
                    <div className="mt-4 text-[#848E9C]">{item.answer}</div>
                  </details>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#1E2329] border-t border-[#2B3139] py-8">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[#848E9C] text-sm">© 2025 Quantium Broker Clone. Todos os direitos reservados.</p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-[#848E9C] hover:text-[#F0B90B]">
              Sobre
            </a>
            <a href="#" className="text-[#848E9C] hover:text-[#F0B90B]">
              Ajuda
            </a>
            <a href="#" className="text-[#848E9C] hover:text-[#F0B90B]">
              Termos
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
