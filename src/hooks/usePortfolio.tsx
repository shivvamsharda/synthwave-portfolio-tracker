import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { useWallet } from './useWallet'
import { supabase } from '@/integrations/supabase/client'
import { solanaService, WalletHoldings } from '@/services/solanaService'
import { priceService } from '@/services/priceService'
import { useToast } from './use-toast'

interface PortfolioToken {
  id: string
  wallet_address: string
  token_mint: string
  token_symbol: string
  token_name: string
  balance: number
  usd_value: number
  token_price?: number
  price_change_24h?: number
  last_updated: string
}

export function usePortfolio() {
  const { user } = useAuth()
  const { wallets } = useWallet()
  const { toast } = useToast()
  
  const [portfolio, setPortfolio] = useState<PortfolioToken[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Load portfolio from database on component mount
  useEffect(() => {
    if (user && wallets.length > 0) {
      loadPortfolioFromDB()
    }
  }, [user, wallets])

  /**
   * Load portfolio data from database (fast load)
   */
  const loadPortfolioFromDB = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('portfolio')
        .select('*')
        .eq('user_id', user.id)
        .order('last_updated', { ascending: false })

      if (error) {
        console.error('Error loading portfolio:', error)
        toast({
          title: "Error",
          description: "Failed to load portfolio data",
          variant: "destructive",
        })
      } else {
        setPortfolio(data || [])
        if (data && data.length > 0) {
          setLastUpdated(new Date(data[0].last_updated))
        }
      }
    } catch (error) {
      console.error('Error loading portfolio:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Refresh portfolio by fetching from Solana blockchain with retry logic
   */
  const refreshPortfolio = async (retryCount = 0) => {
    if (!user || wallets.length === 0) {
      toast({
        title: "No Wallets",
        description: "Connect a wallet first to refresh portfolio",
        variant: "destructive",
      })
      return
    }

    setRefreshing(true)
    const maxRetries = 3
    
    try {
      const walletAddresses = wallets.map(w => w.wallet_address)
      
      toast({
        title: "Refreshing Portfolio",
        description: `Fetching data for ${walletAddresses.length} wallet(s)...`,
      })

      // Fetch holdings from Solana blockchain with retry logic
      let holdingsArray: any[] = []
      
      try {
        holdingsArray = await solanaService.getMultipleWalletHoldings(walletAddresses)
      } catch (error) {
        if (retryCount < maxRetries) {
          console.log(`Retry attempt ${retryCount + 1} of ${maxRetries}`)
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)))
          return refreshPortfolio(retryCount + 1)
        }
        throw error
      }
      
      // Update portfolio data using upsert to handle duplicates
      const portfolioData: any[] = []
      let totalTokensFound = 0
      
      holdingsArray.forEach(holdings => {
        // Add SOL balance
        if (holdings.solBalance > 0) {
          portfolioData.push({
            user_id: user.id,
            wallet_address: holdings.walletAddress,
            token_mint: 'So11111111111111111111111111111111111111112', // SOL mint
            token_symbol: 'SOL',
            token_name: 'Solana',
            balance: holdings.solBalance,
            usd_value: 0, // Will be updated with prices below
            last_updated: new Date().toISOString()
          })
          totalTokensFound++
        }

        // Add SPL tokens
        holdings.tokens.forEach(token => {
          portfolioData.push({
            user_id: user.id,
            wallet_address: holdings.walletAddress,
            token_mint: token.mint,
            token_symbol: token.symbol,
            token_name: token.name,
            balance: token.uiAmount,
            usd_value: 0, // Will be updated with prices below
            last_updated: new Date().toISOString()
          })
          totalTokensFound++
        })
      })

      // Fetch prices for all tokens
      const allMints = portfolioData.map(p => p.token_mint)
      const prices = await priceService.getPrices(allMints)
      
      // Update portfolio data with prices and price changes
      portfolioData.forEach(item => {
        const priceData = prices[item.token_mint]
        const price = priceData?.usdPrice || 0
        item.usd_value = priceService.calculateUsdValue(item.balance, price)
        item.token_price = price
        item.price_change_24h = priceData?.priceChange24h || 0
      })

      if (portfolioData.length > 0) {
        console.log('Attempting to upsert portfolio data:', portfolioData.length, 'items')
        console.log('User ID:', user.id)
        console.log('Sample portfolio item:', portfolioData[0])
        
        // Use upsert to handle duplicate entries
        const { error } = await supabase
          .from('portfolio')
          .upsert(portfolioData, {
            onConflict: 'user_id,wallet_address,token_mint'
          })

        if (error) {
          console.error('Error saving portfolio:', error)
          toast({
            title: "Error",
            description: `Failed to save portfolio data: ${error.message}`,
            variant: "destructive",
          })
        } else {
          const uniqueTokens = new Set(portfolioData.map(p => p.token_mint)).size
          toast({
            title: "Success",
            description: `Updated portfolio: ${uniqueTokens} unique tokens, ${totalTokensFound} total holdings`,
          })
          
          // Reload from database to show updated data
          await loadPortfolioFromDB()
        }
      } else {
        toast({
          title: "No Holdings",
          description: "No token holdings found in connected wallets",
        })
      }

    } catch (error) {
      console.error('Error refreshing portfolio:', error)
      
      const errorMessage = retryCount >= maxRetries 
        ? `Failed to refresh portfolio after ${maxRetries} attempts. Please try again later.`
        : "Failed to refresh portfolio"
        
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setRefreshing(false)
    }
  }

  /**
   * Get portfolio summary stats
   */
  const getPortfolioStats = () => {
    const totalTokens = portfolio.length
    const totalWallets = new Set(portfolio.map(p => p.wallet_address)).size
    const totalValue = portfolio.reduce((sum, token) => sum + (token.usd_value || 0), 0)
    
    return {
      totalTokens,
      totalWallets,
      totalValue,
      lastUpdated
    }
  }

  /**
   * Get portfolio grouped by wallet
   */
  const getPortfolioByWallet = () => {
    const grouped = portfolio.reduce((acc, token) => {
      if (!acc[token.wallet_address]) {
        acc[token.wallet_address] = []
      }
      acc[token.wallet_address].push(token)
      return acc
    }, {} as Record<string, PortfolioToken[]>)

    return grouped
  }

  return {
    // Data
    portfolio,
    loading,
    refreshing,
    lastUpdated,
    
    // Actions
    refreshPortfolio,
    loadPortfolioFromDB,
    
    // Computed
    portfolioStats: getPortfolioStats(),
    portfolioByWallet: getPortfolioByWallet()
  }
}