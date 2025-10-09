export type SymbolCategory = "MOEDAS" | "CRIPTO" | "MATÉRIAS-PRIMAS" | "AÇÕES"

export interface SymbolConfig {
  id: string
  name: string
  category: SymbolCategory
  payout: number
  initialPrice: number
  drift: number
  volatility: number
  jumpProbabilityPerTick: number
  jumpMinPct: number
  jumpMaxPct: number
  tickIntervalMs: number
  seed: number
}

export const SYMBOLS: SymbolConfig[] = [
  // Existing symbols (com volatilidade reduzida)
  {
    id: "BTC-OTC",
    name: "Bitcoin OTC",
    category: "CRIPTO",
    payout: 82,
    initialPrice: 68000,
    drift: 0.00002,
    volatility: 0.004, // reduzido de 0.009
    jumpProbabilityPerTick: 0.001, // reduzido de 0.003
    jumpMinPct: 0.001, // reduzido de 0.002
    jumpMaxPct: 0.008, // reduzido de 0.015
    tickIntervalMs: 120,
    seed: 101,
  },
  {
    id: "USD-BRL",
    name: "USD/BRL",
    category: "MOEDAS",
    payout: 78,
    initialPrice: 5.35,
    drift: 0.00001,
    volatility: 0.003, // reduzido de 0.006
    jumpProbabilityPerTick: 0.0008, // reduzido de 0.002
    jumpMinPct: 0.0008, // reduzido de 0.0015
    jumpMaxPct: 0.006, // reduzido de 0.012
    tickIntervalMs: 140,
    seed: 202,
  },
  {
    id: "EUR-USD",
    name: "EUR/USD",
    category: "MOEDAS",
    payout: 80,
    initialPrice: 1.085,
    drift: 0.00001,
    volatility: 0.0025, // reduzido de 0.005
    jumpProbabilityPerTick: 0.0008, // reduzido de 0.002
    jumpMinPct: 0.0005, // reduzido de 0.001
    jumpMaxPct: 0.005, // reduzido de 0.01
    tickIntervalMs: 130,
    seed: 303,
  },
  {
    id: "GOLD-OTC",
    name: "Ouro OTC",
    category: "MATÉRIAS-PRIMAS",
    payout: 77,
    initialPrice: 2320,
    drift: 0.000012,
    volatility: 0.0035, // reduzido de 0.007
    jumpProbabilityPerTick: 0.001, // reduzido de 0.0025
    jumpMinPct: 0.0008, // reduzido de 0.0015
    jumpMaxPct: 0.006, // reduzido de 0.012
    tickIntervalMs: 150,
    seed: 404,
  },
  {
    id: "ETH-OTC",
    name: "Ethereum OTC",
    category: "CRIPTO",
    payout: 81,
    initialPrice: 3450,
    drift: 0.00003,
    volatility: 0.005, // reduzido de 0.01
    jumpProbabilityPerTick: 0.0012, // reduzido de 0.003
    jumpMinPct: 0.001, // reduzido de 0.002
    jumpMaxPct: 0.01, // reduzido de 0.02
    tickIntervalMs: 110,
    seed: 505,
  },
  {
    id: "AUD-JPY",
    name: "AUD/JPY",
    category: "MOEDAS",
    payout: 76,
    initialPrice: 95,
    drift: 0.00001,
    volatility: 0.0025, // reduzido de 0.005
    jumpProbabilityPerTick: 0.0008, // reduzido de 0.002
    jumpMinPct: 0.0005, // reduzido de 0.001
    jumpMaxPct: 0.005, // reduzido de 0.01
    tickIntervalMs: 150,
    seed: 606,
  },

  // 13 NEW OTC SYMBOLS
  {
    id: "XAU-USD",
    name: "Ouro/USD",
    category: "MATÉRIAS-PRIMAS",
    payout: 79,
    initialPrice: 2050,
    drift: 0.000015,
    volatility: 0.003,
    jumpProbabilityPerTick: 0.0009,
    jumpMinPct: 0.0007,
    jumpMaxPct: 0.006,
    tickIntervalMs: 135,
    seed: 707,
  },
  {
    id: "GBP-USD",
    name: "GBP/USD",
    category: "MOEDAS",
    payout: 78,
    initialPrice: 1.27,
    drift: 0.00001,
    volatility: 0.003,
    jumpProbabilityPerTick: 0.0009,
    jumpMinPct: 0.0006,
    jumpMaxPct: 0.005,
    tickIntervalMs: 125,
    seed: 808,
  },
  {
    id: "USD-JPY",
    name: "USD/JPY",
    category: "MOEDAS",
    payout: 77,
    initialPrice: 148.5,
    drift: 0.00001,
    volatility: 0.003,
    jumpProbabilityPerTick: 0.0008,
    jumpMinPct: 0.0006,
    jumpMaxPct: 0.005,
    tickIntervalMs: 130,
    seed: 909,
  },
  {
    id: "ADA-OTC",
    name: "Cardano OTC",
    category: "CRIPTO",
    payout: 83,
    initialPrice: 0.58,
    drift: 0.00002,
    volatility: 0.006,
    jumpProbabilityPerTick: 0.0015,
    jumpMinPct: 0.001,
    jumpMaxPct: 0.012,
    tickIntervalMs: 115,
    seed: 1010,
  },
  {
    id: "SOL-OTC",
    name: "Solana OTC",
    category: "CRIPTO",
    payout: 84,
    initialPrice: 98,
    drift: 0.00003,
    volatility: 0.007,
    jumpProbabilityPerTick: 0.0018,
    jumpMinPct: 0.0012,
    jumpMaxPct: 0.015,
    tickIntervalMs: 105,
    seed: 1111,
  },
  {
    id: "XRP-OTC",
    name: "Ripple OTC",
    category: "CRIPTO",
    payout: 81,
    initialPrice: 0.52,
    drift: 0.00002,
    volatility: 0.0055,
    jumpProbabilityPerTick: 0.0015,
    jumpMinPct: 0.001,
    jumpMaxPct: 0.013,
    tickIntervalMs: 110,
    seed: 1212,
  },
  {
    id: "BNB-OTC",
    name: "Binance Coin OTC",
    category: "CRIPTO",
    payout: 82,
    initialPrice: 310,
    drift: 0.00002,
    volatility: 0.0048,
    jumpProbabilityPerTick: 0.0013,
    jumpMinPct: 0.001,
    jumpMaxPct: 0.011,
    tickIntervalMs: 118,
    seed: 1313,
  },
  {
    id: "DOT-OTC",
    name: "Polkadot OTC",
    category: "CRIPTO",
    payout: 80,
    initialPrice: 7.2,
    drift: 0.00002,
    volatility: 0.0052,
    jumpProbabilityPerTick: 0.0014,
    jumpMinPct: 0.001,
    jumpMaxPct: 0.012,
    tickIntervalMs: 112,
    seed: 1414,
  },
  {
    id: "MATIC-OTC",
    name: "Polygon OTC",
    category: "CRIPTO",
    payout: 81,
    initialPrice: 0.89,
    drift: 0.00002,
    volatility: 0.0058,
    jumpProbabilityPerTick: 0.0016,
    jumpMinPct: 0.0011,
    jumpMaxPct: 0.013,
    tickIntervalMs: 108,
    seed: 1515,
  },
  {
    id: "LINK-OTC",
    name: "Chainlink OTC",
    category: "CRIPTO",
    payout: 79,
    initialPrice: 14.5,
    drift: 0.00002,
    volatility: 0.005,
    jumpProbabilityPerTick: 0.0013,
    jumpMinPct: 0.001,
    jumpMaxPct: 0.011,
    tickIntervalMs: 115,
    seed: 1616,
  },
  {
    id: "AVAX-OTC",
    name: "Avalanche OTC",
    category: "CRIPTO",
    payout: 82,
    initialPrice: 36,
    drift: 0.00002,
    volatility: 0.0062,
    jumpProbabilityPerTick: 0.0017,
    jumpMinPct: 0.0012,
    jumpMaxPct: 0.014,
    tickIntervalMs: 107,
    seed: 1717,
  },
  {
    id: "UNI-OTC",
    name: "Uniswap OTC",
    category: "CRIPTO",
    payout: 80,
    initialPrice: 6.8,
    drift: 0.00002,
    volatility: 0.0056,
    jumpProbabilityPerTick: 0.0015,
    jumpMinPct: 0.001,
    jumpMaxPct: 0.012,
    tickIntervalMs: 111,
    seed: 1818,
  },
  {
    id: "ATOM-OTC",
    name: "Cosmos OTC",
    category: "CRIPTO",
    payout: 81,
    initialPrice: 10.2,
    drift: 0.00002,
    volatility: 0.0054,
    jumpProbabilityPerTick: 0.0014,
    jumpMinPct: 0.001,
    jumpMaxPct: 0.012,
    tickIntervalMs: 113,
    seed: 1919,
  },
]

export const SIM_CONFIG = {
  RTP: 96,
  tickIntervalMs: 120,
  seed: 123456,
  keepHistoryMs: 120 * 60 * 1000,
  view: { initialScaleX: 20, minScaleX: 4, maxScaleX: 80 },
  defaultTimeframe: 5,
  defaultSymbol: "BTC-OTC",
  symbols: SYMBOLS,
}
