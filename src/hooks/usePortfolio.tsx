
import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { useWallet } from './useWallet'
import { supabase } from '@/integrations/supabase/client'
import { solanaService, WalletHoldings } from '@/services/solanaService'
import { priceService } from '@/services/priceService'
import { PortfolioHistoryService } from '@/services/portfolioHistoryService'
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
  logo_uri?: string
  description?: string
  website?: string
  twitter?: string
  last_updated: string
}

const DATA_REFRESH_THRESHOLD = 5 * 60 * 1000 // 5 minutes in milliseconds

export function usePortfolio() {
  const { user } = useAuth()
  const { wallets } = useWallet()
  const { toast } = useToast()
  
  const [portfolio, setPortfolio] = useState<PortfolioToken[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [dataFreshness, setDataFreshness] = useState<'fresh' | 'stale' | 'cached'>('cached')
  const [isOperationInProgress, setIsOperationInProgress] = useState(false)

  // Load portfolio from database on component mount and when wallets change (NO AUTO-REFRESH)
  useEffect(() => {
    if (user && wallets.length > 0) {
      console.log(`[Portfolio] Loading portfolio for ${wallets.length} wallets:`, wallets.map(w => w.wallet_address))
      loadPortfolioFromDB()
    } else if (user && wallets.length === 0) {
      console.log('[Portfolio] No wallets connected, clearing all portfolio display immediately')
      setPortfolio([])
      setLastUpdated(null)
      setDataFreshness('cached')
      
      // Force cleanup any orphaned data in database with debounce
      const timer = setTimeout(() => {
        if (!isOperationInProgress) {
          setIsOperationInProgress(true)
          cleanupAllOrphanedData().finally(() => {
            setIsOperationInProgress(false)
          })
        }
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [user, wallets])

  // Check data freshness (but don't auto-refresh)
  useEffect(() => {
    if (lastUpdated && wallets.length > 0) {
      const timeSinceUpdate = Date.now() - lastUpdated.getTime()
      if (timeSinceUpdate > DATA_REFRESH_THRESHOLD) {
        console.log('[Portfolio] Data is stale, showing stale indicator (no auto-refresh)')
        setDataFreshness('stale')
      } else {
        setDataFreshness('fresh')
      }
    }
  }, [lastUpdated])

  /**
   * Clean up portfolio data for wallets that are no longer connected
   */
  const cleanupStalePortfolioData = async (currentWalletAddresses: string[]) => {
    if (!user || isOperationInProgress) return

    try {
      console.log('[Portfolio] Starting cleanup for current wallets:', currentWalletAddresses)
      
      const { data: allPortfolioData } = await supabase
        .from('portfolio')
        .select('wallet_address')
        .eq('user_id', user.id)

      if (allPortfolioData) {
        const existingWallets = [...new Set(allPortfolioData.map(p => p.wallet_address))]
        console.log('[Portfolio] Existing wallet addresses in portfolio:', existingWallets)
        
        const staleWallets = existingWallets.filter(addr => !currentWalletAddresses.includes(addr))
        console.log('[Portfolio] Stale wallet addresses to clean up:', staleWallets)
        
        if (staleWallets.length > 0) {
          const { error } = await supabase
            .from('portfolio')
            .delete()
            .eq('user_id', user.id)
            .in('wallet_address', staleWallets)

          if (error) {
            console.error('[Portfolio] Error cleaning up stale portfolio data:', error)
          } else {
            console.log(`[Portfolio] Successfully cleaned up ${staleWallets.length} stale wallet(s) data`)
          }
        }
      }
    } catch (error) {
      console.error('[Portfolio] Error during cleanup:', error)
    }
  }

  /**
   * Load portfolio data from database
   */
  const loadPortfolioFromDB = async () => {
    if (!user || wallets.length === 0 || isOperationInProgress) return

    setLoading(true)
    try {
      const walletAddresses = wallets.map(w => w.wallet_address)
      console.log('[Portfolio] Loading portfolio for wallet addresses:', walletAddresses)
      
      // Clean up stale data FIRST (with debounce protection)
      await cleanupStalePortfolioData(walletAddresses)
      
      const { data, error } = await supabase
        .from('portfolio')
        .select('*')
        .eq('user_id', user.id)
        .in('wallet_address', walletAddresses)
        .order('last_updated', { ascending: false })

      if (error) {
        console.error('[Portfolio] Error loading portfolio:', error)
        toast({
          title: "Error",
          description: "Failed to load portfolio data",
          variant: "destructive",
        })
      } else {
        console.log(`[Portfolio] Loaded ${data?.length || 0} portfolio items`)
        
        const filteredData = data?.filter(item => 
          walletAddresses.includes(item.wallet_address)
        ) || []
        
        console.log(`[Portfolio] After filtering: ${filteredData.length} portfolio items`)
        setPortfolio(filteredData)
        
        if (filteredData && filteredData.length > 0) {
          const mostRecentUpdate = new Date(filteredData[0].last_updated)
          setLastUpdated(mostRecentUpdate)
          
          const timeSinceUpdate = Date.now() - mostRecentUpdate.getTime()
          if (timeSinceUpdate > DATA_REFRESH_THRESHOLD) {
            setDataFreshness('stale')
            console.log('[Portfolio] Portfolio data is stale (no auto-refresh)')
          } else {
            setDataFreshness('fresh')
            console.log('[Portfolio] Portfolio data is fresh')
          }
        } else {
          setDataFreshness('cached')
          console.log('[Portfolio] No portfolio data found')
        }
      }
    } catch (error) {
      console.error('[Portfolio] Error loading portfolio:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Manual refresh portfolio by fetching from Solana blockchain (MANUAL ONLY)
   */
  const refreshPortfolio = async (retryCount = 0) => {
    if (!user || wallets.length === 0) {
      console.log('[Portfolio] Cannot refresh: no user or wallets')
      toast({
        title: "No Wallets",
        description: "Connect a wallet first to refresh portfolio",
        variant: "destructive",
      })
      return
    }

    // Prevent multiple simultaneous refresh operations
    if (refreshing || isOperationInProgress) {
      console.log('[Portfolio] Refresh already in progress, skipping')
      return
    }

    setRefreshing(true)
    setIsOperationInProgress(true)
    setDataFreshness('fresh')
    const maxRetries = 3
    
    try {
      const walletAddresses = wallets.map(w => w.wallet_address)
      console.log(`[Portfolio] Manual refresh for ${walletAddresses.length} wallet(s):`, walletAddresses)
      
      await cleanupStalePortfolioData(walletAddresses)
      
      toast({
        title: "Refreshing Portfolio",
        description: `Fetching fresh data for ${walletAddresses.length} wallet(s)...`,
      })

      let holdingsArray: WalletHoldings[] = []
      
      try {
        holdingsArray = await solanaService.getMultipleWalletHoldings(walletAddresses)
        console.log('[Portfolio] Fresh blockchain data fetched:', holdingsArray.length, 'wallet holdings')
      } catch (error) {
        if (retryCount < maxRetries) {
          console.log(`[Portfolio] Retry attempt ${retryCount + 1} of ${maxRetries}`)
          setRefreshing(false)
          setIsOperationInProgress(false)
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)))
          return refreshPortfolio(retryCount + 1)
        }
        throw error
      }
      
      const portfolioData: any[] = []
      let totalTokensFound = 0
      
      holdingsArray.forEach(holdings => {
        console.log(`[Portfolio] Processing holdings for wallet: ${holdings.walletAddress}`)
        console.log(`[Portfolio] SOL balance: ${holdings.solBalance}, Tokens: ${holdings.tokens.length}`)
        
        if (holdings.solBalance > 0) {
          portfolioData.push({
            user_id: user.id,
            wallet_address: holdings.walletAddress,
            token_mint: 'So11111111111111111111111111111111111111112',
            token_symbol: 'SOL',
            token_name: 'Solana',
            balance: holdings.solBalance,
            usd_value: 0,
            token_price: 0,
            price_change_24h: 0,
            logo_uri: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
            description: 'Solana is a high-performance blockchain platform for decentralized applications and crypto-currencies.',
            website: 'https://solana.com',
            twitter: 'https://twitter.com/solana',
            last_updated: new Date().toISOString()
          })
          totalTokensFound++
        }

        holdings.tokens.forEach(token => {
          portfolioData.push({
            user_id: user.id,
            wallet_address: holdings.walletAddress,
            token_mint: token.mint,
            token_symbol: token.symbol,
            token_name: token.name,
            balance: token.uiAmount,
            usd_value: 0,
            token_price: 0,
            price_change_24h: 0,
            logo_uri: token.logoURI,
            description: token.description,
            website: token.website,
            twitter: token.twitter,
            last_updated: new Date().toISOString()
          })
          totalTokensFound++
        })
      })

      console.log(`[Portfolio] Built portfolio data: ${portfolioData.length} total token entries`)

      if (portfolioData.length > 0) {
        const allMints = portfolioData.map(p => p.token_mint)
        const prices = await priceService.getPrices(allMints)
        
        portfolioData.forEach(item => {
          const priceData = prices[item.token_mint]
          const price = priceData?.usdPrice || 0
          item.usd_value = priceService.calculateUsdValue(item.balance, price)
          item.token_price = price
          item.price_change_24h = priceData?.priceChange24h || 0
        })

        console.log('[Portfolio] Deleting ALL existing portfolio data for current wallets:', walletAddresses)
        const { error: deleteError } = await supabase
          .from('portfolio')
          .delete()
          .eq('user_id', user.id)
          .in('wallet_address', walletAddresses)

        if (deleteError) {
          console.error('[Portfolio] Error deleting existing portfolio data:', deleteError)
          throw deleteError
        }

        console.log('[Portfolio] Successfully deleted all existing data, now inserting fresh data')
        await new Promise(resolve => setTimeout(resolve, 100))

        const { error: insertError } = await supabase
          .from('portfolio')
          .insert(portfolioData)

        if (insertError) {
          console.error('[Portfolio] Error inserting fresh portfolio data:', insertError)
          if (insertError.message?.includes('duplicate key')) {
            console.log('[Portfolio] Duplicate key detected, using upsert as fallback')
            const { error: upsertError } = await supabase
              .from('portfolio')
              .upsert(portfolioData, { 
                onConflict: 'user_id,wallet_address,token_mint',
                ignoreDuplicates: false 
              })
            
            if (upsertError) {
              throw upsertError
            }
          } else {
            throw insertError
          }
        }

        console.log('[Portfolio] Fresh portfolio data saved successfully')
        
        const uniqueTokens = new Set(portfolioData.map(p => p.token_mint)).size
        const totalValue = portfolioData.reduce((sum, token) => sum + (token.usd_value || 0), 0)
        
        console.log(`[Portfolio] Successfully saved ${uniqueTokens} unique tokens, ${totalTokensFound} total holdings`)
        
        await PortfolioHistoryService.savePortfolioSnapshot(
          user.id,
          totalValue,
          totalTokensFound
        )
        
        toast({
          title: "Portfolio Refreshed",
          description: `Fresh blockchain data: ${uniqueTokens} unique tokens, ${totalTokensFound} total holdings`,
        })
        
        await loadPortfolioFromDB()
        
        // Dispatch event ONLY after successful manual refresh (single event)
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('portfolio-updated'))
        }, 500)
      } else {
        console.log('[Portfolio] No holdings found in any wallet')
        toast({
          title: "No Holdings",
          description: "No token holdings found in connected wallets",
        })
        setPortfolio([])
        setLastUpdated(new Date())
        setDataFreshness('fresh')
      }

    } catch (error) {
      console.error('[Portfolio] Error refreshing portfolio:', error)
      
      const errorMessage = retryCount >= maxRetries 
        ? `Failed to refresh portfolio after ${maxRetries} attempts. Please try again later.`
        : "Failed to refresh portfolio"
        
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      
      setDataFreshness('stale')
    } finally {
      setRefreshing(false)
      setIsOperationInProgress(false)
    }
  }

  const clearAllPortfolioData = async () => {
    if (!user || isOperationInProgress) return
    
    setIsOperationInProgress(true)
    try {
      console.log('[Portfolio] Clearing all portfolio data for user')
      const { error } = await supabase
        .from('portfolio')
        .delete()
        .eq('user_id', user.id)
      
      if (error) {
        throw error
      }
      
      console.log('[Portfolio] All portfolio data cleared successfully')
      setPortfolio([])
      setLastUpdated(null)
      setDataFreshness('cached')
      
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('portfolio-updated'))
      }, 500)
      
      return true
    } catch (error) {
      console.error('[Portfolio] Error clearing portfolio data:', error)
      return false
    } finally {
      setIsOperationInProgress(false)
    }
  }

  const cleanupAllOrphanedData = async () => {
    if (!user || isOperationInProgress) return false
    
    setIsOperationInProgress(true)
    try {
      console.log('[Portfolio] Cleaning up ALL orphaned portfolio data and history')
      
      const { data: currentWallets } = await supabase
        .from('wallets')
        .select('wallet_address')
        .eq('user_id', user.id)
      
      const currentWalletAddresses = currentWallets?.map(w => w.wallet_address) || []
      console.log('[Portfolio] Current wallet addresses:', currentWalletAddresses)
      
      if (currentWalletAddresses.length === 0) {
        console.log('[Portfolio] No wallets found, deleting all portfolio and historical data')
        
        const { error: portfolioError } = await supabase
          .from('portfolio')
          .delete()
          .eq('user_id', user.id)
          
        const { error: historyError } = await supabase
          .from('portfolio_history')
          .delete()
          .eq('user_id', user.id)
          
        if (portfolioError) {
          console.error('[Portfolio] Error deleting portfolio data:', portfolioError)
        }
        if (historyError) {
          console.error('[Portfolio] Error deleting portfolio history:', historyError)
        }
        
        if (!portfolioError && !historyError) {
          console.log('[Portfolio] All portfolio and historical data deleted')
          setPortfolio([])
          setLastUpdated(null)
          setDataFreshness('cached')
          
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('portfolio-updated'))
          }, 500)
          
          return true
        }
        
        return false
      } else {
        const { error } = await supabase
          .from('portfolio')
          .delete()
          .eq('user_id', user.id)
          .not('wallet_address', 'in', `(${currentWalletAddresses.map(addr => `"${addr}"`).join(',')})`)
          
        if (error) {
          console.error('[Portfolio] Error deleting orphaned portfolio data:', error)
          return false
        }
        
        console.log('[Portfolio] Orphaned portfolio data cleaned up')
        await loadPortfolioFromDB()
        
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('portfolio-updated'))
        }, 500)
        
        return true
      }
    } catch (error) {
      console.error('[Portfolio] Error during orphaned data cleanup:', error)
      return false
    } finally {
      setIsOperationInProgress(false)
    }
  }

  const getPortfolioStats = () => {
    const totalTokens = portfolio.length
    const totalWallets = new Set(portfolio.map(p => p.wallet_address)).size
    const totalValue = portfolio.reduce((sum, token) => sum + (token.usd_value || 0), 0)
    
    return {
      totalTokens,
      totalWallets,
      totalValue,
      lastUpdated,
      dataFreshness
    }
  }

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
    backgroundRefreshing: false, // Always false now
    lastUpdated,
    dataFreshness,
    
    // Actions
    refreshPortfolio, // Manual only
    refreshPortfolioInBackground: () => {}, // Disabled
    loadPortfolioFromDB,
    clearAllPortfolioData,
    cleanupAllOrphanedData,
    
    // Computed
    portfolioStats: getPortfolioStats(),
    portfolioByWallet: getPortfolioByWallet()
  }
}
