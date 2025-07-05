import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { useWallet } from './useWallet'
import { supabase } from '@/integrations/supabase/client'
import { solanaService, WalletHoldings } from '@/services/solanaService'
import { useToast } from './use-toast'

interface PortfolioToken {
  id: string
  wallet_address: string
  token_mint: string
  token_symbol: string
  token_name: string
  balance: number
  usd_value: number
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
   * Refresh portfolio by fetching from Solana blockchain
   */
  const refreshPortfolio = async () => {
    if (!user || wallets.length === 0) {
      toast({
        title: "No Wallets",
        description: "Connect a wallet first to refresh portfolio",
        variant: "destructive",
      })
      return
    }

    setRefreshing(true)
    try {
      const walletAddresses = wallets.map(w => w.wallet_address)
      
      toast({
        title: "Refreshing Portfolio",
        description: `Fetching data for ${walletAddresses.length} wallet(s)...`,
      })

      // Fetch holdings from Solana blockchain
      const holdingsArray = await solanaService.getMultipleWalletHoldings(walletAddresses)
      
      // Clear existing portfolio data for this user
      await supabase
        .from('portfolio')
        .delete()
        .eq('user_id', user.id)

      // Insert new portfolio data
      const portfolioData: any[] = []
      
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
            usd_value: 0, // Will be updated when we add price feeds
            last_updated: new Date().toISOString()
          })
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
            usd_value: 0, // Will be updated when we add price feeds
            last_updated: new Date().toISOString()
          })
        })
      })

      if (portfolioData.length > 0) {
        const { error } = await supabase
          .from('portfolio')
          .insert(portfolioData)

        if (error) {
          console.error('Error saving portfolio:', error)
          toast({
            title: "Error",
            description: "Failed to save portfolio data",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Success",
            description: `Updated portfolio with ${portfolioData.length} holdings`,
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
      toast({
        title: "Error",
        description: "Failed to refresh portfolio",
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