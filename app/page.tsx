import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Smartphone, Monitor, Download, Apple, Play, Globe, ChevronRight, Plus, Minus } from "lucide-react"

export default function BinanceLandingPage() {
  const cryptoData = [
    { symbol: "BTC", name: "Bitcoin", price: "$108,529.99", change: "-3.61%", isNegative: true, icon: "₿" },
    { symbol: "ETH", name: "Ethereum", price: "$4,349.77", change: "-3.20%", isNegative: true, icon: "Ξ" },
    { symbol: "BNB", name: "BNB", price: "$857.74", change: "-2.05%", isNegative: true, icon: "BNB" },
    { symbol: "XRP", name: "XRP", price: "$2.83", change: "-5.03%", isNegative: true, icon: "XRP" },
    { symbol: "SOL", name: "Solana", price: "$204.01", change: "-3.08%", isNegative: true, icon: "◎" },
  ]

  const newListings = [
    { symbol: "MITO", name: "Mitosis", price: "$0.2266", change: "+34.88%", isNegative: false },
    { symbol: "DOLO", name: "Dolomite", price: "$0.2146", change: "-7.10%", isNegative: true },
    { symbol: "PLUME", name: "PLUME", price: "$0.08017", change: "-4.22%", isNegative: true },
    { symbol: "BFUSD", name: "BFUSD", price: "$0.9995", change: "+0.03%", isNegative: false },
    { symbol: "PROVE", name: "Succinct", price: "$1.00", change: "-7.54%", isNegative: true },
  ]

  const newsItems = [
    "Juiz Adia Decisão sobre a Demissão de Membro do Conselho do Federal Reserve",
    "BNB Cai Abaixo de 860 USDT com uma Diminuição de 1,17% em 24 Horas",
    "Gigante dos Jogos Japonesa Gumi Inc. Planeja Grande Investimento em XRP para Impulsionar a Expansão da Blockchain",
    "Binance listará Mitosis (MITO) em várias plataformas",
  ]

  const faqItems = [
    {
      question: "O que é uma corretora de criptomoedas?",
      answer:
        "As corretoras de criptomoedas são mercados digitais que permitem aos usuários comprar e vender criptomoedas como o Bitcoin, Ethereum e Tether. A corretora Binance é a maior corretora de criptomoedas por volume de trades.",
    },
    {
      question: "Quais produtos a Binance oferece?",
      answer:
        "A Binance é a maior corretora de criptomoedas do mundo, atendendo a 235 milhões de usuários registrados em mais de 180 países. Com taxas baixas e mais de 350 criptomoedas para negociar, a Binance é a corretora preferida para trades de Bitcoin, Altcoins e outros ativos virtuais.",
    },
    {
      question: "Como comprar Bitcoin e outras criptomoedas na Binance",
      answer:
        "Existem várias maneiras de comprar criptomoedas na Binance. Você pode usar um cartão de crédito/débito, saldo em dinheiro ou Apple Pay/Google Pay para comprar criptomoedas na Binance.",
    },
    {
      question: "Como rastrear os preços das criptomoedas?",
      answer:
        "A maneira mais fácil de rastrear os últimos preços de criptomoedas, volumes de trading, altcoins em alta e capitalização de mercado é o Diretório de Criptomoedas da Binance.",
    },
    {
      question: "Como fazer trade de criptomoedas na Binance",
      answer:
        "Você pode negociar centenas de criptomoedas na Binance através dos mercados Spot e de Margem. Para começar a fazer trading, os usuários precisam registrar uma conta, concluir a verificação de identidade, comprar/depositar criptomoedas e começar a fazer trading.",
    },
    {
      question: "Como ganhar com criptomoedas na Binance",
      answer:
        "Os usuários podem ganhar recompensas em mais de 180 criptomoedas usando um dos produtos oferecidos na Binance Earn. Nossa plataforma oferece dezenas de ativos digitais como Bitcoin, Ethereum, e stablecoins.",
    },
  ]

  return (
    <div className="min-h-screen bg-[#1E2329] text-foreground">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-6xl lg:text-8xl font-bold leading-tight">
                <div className="text-[#F0B90B]">286,926,466</div>
                <div className="text-[#EAECEF]">USUÁRIOS CONFIAM EM NÓS</div>
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

            <div className="space-y-4">
              <p className="text-[#848E9C]">Ou continue com</p>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 border-[#2B3139] bg-transparent hover:bg-[#252A32]"
                >
                  <svg className="h-6 w-6" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 border-[#2B3139] bg-transparent hover:bg-[#252A32]"
                >
                  <Apple className="h-6 w-6" />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[#848E9C]">Baixar aplicativo</p>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent border-[#2B3139] hover:bg-[#252A32]"
                >
                  <Smartphone className="h-4 w-4" />
                  QR Code
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Crypto Price Table */}
            <Card className="bg-[#1E2329] border-[#2B3139]">
              <CardContent className="p-6">
                <Tabs defaultValue="popular" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-transparent">
                    <TabsTrigger
                      value="popular"
                      className="data-[state=active]:bg-transparent data-[state=active]:text-[#EAECEF] data-[state=active]:border-b-2 data-[state=active]:border-[#F0B90B] text-[#848E9C]"
                    >
                      Popular
                    </TabsTrigger>
                    <TabsTrigger
                      value="new"
                      className="data-[state=active]:bg-transparent data-[state=active]:text-[#EAECEF] data-[state=active]:border-b-2 data-[state=active]:border-[#F0B90B] text-[#848E9C]"
                    >
                      Nova Listagem
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="popular" className="space-y-4">
                    {cryptoData.map((crypto) => (
                      <div
                        key={crypto.symbol}
                        className="flex items-center justify-between py-2 hover:bg-[#252A32] rounded-lg px-2 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
                            <img
                              src={`/abstract-geometric-shapes.png?height=28&width=28&query=${crypto.name} cryptocurrency logo`}
                              alt={crypto.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
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
                    <Button
                      variant="ghost"
                      className="w-full justify-between text-[#848E9C] hover:text-[#EAECEF] hover:bg-transparent"
                    >
                      Ver todas as 350+ moedas
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </TabsContent>

                  <TabsContent value="new" className="space-y-4">
                    {newListings.map((crypto) => (
                      <div
                        key={crypto.symbol}
                        className="flex items-center justify-between py-2 hover:bg-[#252A32] rounded-lg px-2 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
                            <img
                              src={`/abstract-geometric-shapes.png?height=28&width=28&query=${crypto.name} cryptocurrency logo`}
                              alt={crypto.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
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
                    <Button
                      variant="ghost"
                      className="w-full justify-between text-[#848E9C] hover:text-[#EAECEF] hover:bg-transparent"
                    >
                      Ver mais moedas
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* News Section */}
            <Card className="bg-[#1E2329] border-[#2B3139]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-[#EAECEF]">Notícias</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#848E9C] hover:text-[#EAECEF] hover:bg-transparent"
                  >
                    Ver todas as notícias
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <div className="space-y-4">
                  {newsItems.map((item, index) => (
                    <div
                      key={index}
                      className="text-sm text-[#EAECEF] hover:text-[#F0B90B] cursor-pointer transition-colors line-clamp-2"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <Tabs defaultValue="desktop" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8 bg-transparent">
                <TabsTrigger
                  value="desktop"
                  className="data-[state=active]:bg-transparent data-[state=active]:text-[#EAECEF] data-[state=active]:border-b-2 data-[state=active]:border-[#F0B90B] text-[#848E9C]"
                >
                  Desktop
                </TabsTrigger>
                <TabsTrigger
                  value="lite"
                  className="data-[state=active]:bg-transparent data-[state=active]:text-[#EAECEF] data-[state=active]:border-b-2 data-[state=active]:border-[#F0B90B] text-[#848E9C]"
                >
                  Lite
                </TabsTrigger>
                <TabsTrigger
                  value="pro"
                  className="data-[state=active]:bg-transparent data-[state=active]:text-[#EAECEF] data-[state=active]:border-b-2 data-[state=active]:border-[#F0B90B] text-[#848E9C]"
                >
                  Pro
                </TabsTrigger>
              </TabsList>

              <TabsContent value="desktop">
                <div className="bg-[#1E2329] rounded-lg p-8 border border-[#2B3139]">
                  <img
                    src="/cryptocurrency-trading-desktop-interface-dark-them.png"
                    alt="Desktop Trading Interface"
                    className="w-full h-auto rounded-lg"
                  />
                </div>
              </TabsContent>

              <TabsContent value="lite">
                <div className="bg-[#1E2329] rounded-lg p-8 border border-[#2B3139]">
                  <img
                    src="/simple-cryptocurrency-trading-interface-mobile.png"
                    alt="Lite Trading Interface"
                    className="w-full h-auto rounded-lg"
                  />
                </div>
              </TabsContent>

              <TabsContent value="pro">
                <div className="bg-[#1E2329] rounded-lg p-8 border border-[#2B3139]">
                  <img
                    src="/advanced-cryptocurrency-trading-interface-charts.png"
                    alt="Pro Trading Interface"
                    className="w-full h-auto rounded-lg"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#EAECEF]">
              Faça trades de onde estiver. Em qualquer lugar, a qualquer hora.
            </h2>

            <div className="flex gap-4 lg:hidden">
              <Button className="flex-1 gap-2 bg-[#FCD535] text-[#202630] hover:bg-[#F0B90B]">
                <Apple className="h-5 w-5" />
                App Store
              </Button>
              <Button className="flex-1 gap-2 bg-[#FCD535] text-[#202630] hover:bg-[#F0B90B]">
                <Play className="h-5 w-5" />
                Google Play
              </Button>
            </div>

            <div className="hidden lg:block space-y-8">
              <div className="flex items-center gap-6">
                <Card className="p-6 border-[#2B3139] bg-[#1E2329]">
                  <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center">
                    <div className="w-24 h-24 bg-black rounded-sm flex items-center justify-center">
                      <div className="w-6 h-6 bg-[#FCD535] rounded-sm"></div>
                    </div>
                  </div>
                </Card>
                <div>
                  <p className="text-[#848E9C] mb-2">Escaneie para baixar o App</p>
                  <p className="text-xl font-semibold text-[#EAECEF]">iOS e Android</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="flex flex-col gap-2 h-20 bg-transparent border-[#2B3139] hover:bg-[#252A32] text-[#EAECEF]"
                >
                  <Apple className="h-8 w-8" />
                  <span>MacOS</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col gap-2 h-20 bg-transparent border-[#2B3139] hover:bg-[#252A32] text-[#EAECEF]"
                >
                  <Monitor className="h-8 w-8" />
                  <span>Windows</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col gap-2 h-20 bg-transparent border-[#2B3139] hover:bg-[#252A32] text-[#EAECEF]"
                >
                  <Globe className="h-8 w-8" />
                  <span>Linux</span>
                </Button>
              </div>

              <Button variant="ghost" className="gap-2 text-[#848E9C] hover:text-[#EAECEF] hover:bg-transparent">
                <Download className="h-5 w-5" />
                Mais opções de download
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-4xl lg:text-5xl font-bold text-center mb-16 text-[#EAECEF]">Perguntas Frequentes</h2>

        <div className="max-w-4xl mx-auto space-y-4">
          {faqItems.map((item, index) => (
            <Card key={index} className="bg-[#1E2329] border-[#2B3139]">
              <CardContent className="p-6">
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-transparent border border-[#2B3139] rounded-lg flex items-center justify-center text-[#EAECEF] font-semibold">
                        {index + 1}
                      </div>
                      <h3 className="text-lg font-semibold text-[#EAECEF]">{item.question}</h3>
                    </div>
                    <Plus className="h-5 w-5 group-open:hidden text-[#EAECEF]" />
                    <Minus className="h-5 w-5 hidden group-open:block text-[#EAECEF]" />
                  </summary>
                  <div className="mt-4 pl-12 text-[#848E9C]">{item.answer}</div>
                </details>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-[#EAECEF]">Comece a ganhar hoje mesmo</h2>
          <Button size="lg" className="bg-[#FCD535] text-[#202630] hover:bg-[#F0B90B] px-8 py-4 text-lg">
            Inscreva-se Agora
          </Button>
        </div>
      </section>
    </div>
  )
}
