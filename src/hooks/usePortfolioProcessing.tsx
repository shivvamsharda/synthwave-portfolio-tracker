import { useMemo } from "react"
import { ProcessedPortfolio } from "@/components/dashboard/types"

export function usePortfolioProcessing(
  portfolio: any[], 
  sortBy: 'balance' | 'value' | 'symbol', 
  groupView: 'flat' | 'grouped'
): ProcessedPortfolio {
  return useMemo(() => {
    if (!portfolio.length) return { 
      aggregated: [], 
      byWallet: {}, 
      statistics: { totalTokens: 0, uniqueTokens: 0, totalValue: 0 } 
    }

    // Filter out tokens without valid pricing data
    const tokensWithPrices = portfolio.filter(token => 
      token.usd_value > 0 && token.token_price > 0
    )

    // Aggregate tokens across wallets
    const tokenMap = new Map()
    const byWallet: Record<string, any[]> = {}

    tokensWithPrices.forEach(token => {
      const key = token.token_mint
      
      // Group by wallet
      if (!byWallet[token.wallet_address]) {
        byWallet[token.wallet_address] = []
      }
      byWallet[token.wallet_address].push(token)

      // Aggregate tokens
      if (tokenMap.has(key)) {
        const existing = tokenMap.get(key)
        existing.balance += token.balance
        existing.usd_value += (token.usd_value || 0)
        existing.walletCount += 1
        existing.wallets.push(token.wallet_address)
      } else {
        tokenMap.set(key, {
          ...token,
          walletCount: 1,
          wallets: [token.wallet_address]
        })
      }
    })

    let aggregated = Array.from(tokenMap.values())

    // Sort tokens
    aggregated.sort((a, b) => {
      switch (sortBy) {
        case 'balance':
          return b.balance - a.balance
        case 'value':
          return (b.usd_value || 0) - (a.usd_value || 0)
        case 'symbol':
          return a.token_symbol.localeCompare(b.token_symbol)
        default:
          return 0
      }
    })

    // Group by token type
    const grouped = {
      native: aggregated.filter(token => token.token_symbol === 'SOL'),
      spl: aggregated.filter(token => token.token_symbol !== 'SOL')
    }

    const statistics = {
      totalTokens: portfolio.length,
      uniqueTokens: aggregated.length,
      totalValue: aggregated.reduce((sum, token) => sum + (token.usd_value || 0), 0)
    }

    return {
      aggregated: groupView === 'flat' ? aggregated : grouped,
      byWallet,
      statistics
    }
  }, [portfolio, sortBy, groupView])
}