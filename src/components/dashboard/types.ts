export interface Token {
  symbol: string
  name: string
  balance: string
  value: string
  change24h: number
  price: string
  allocation: number
}

export interface TokenListProps {
  onNavigate?: (page: "dashboard" | "wallets" | "nfts" | "yield" | "settings") => void
}

export interface TokenItemProps {
  token: any
  showWalletInfo?: boolean
}

export interface ProcessedPortfolio {
  aggregated: any[] | { native: any[], spl: any[] }
  byWallet: Record<string, any[]>
  statistics: {
    totalTokens: number
    uniqueTokens: number
    totalValue: number
  }
}