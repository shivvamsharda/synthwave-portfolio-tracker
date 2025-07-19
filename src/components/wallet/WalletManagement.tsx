
import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Wallet, Copy, ExternalLink, RefreshCw, AlertCircle } from "lucide-react"
import { useWallet } from "@/hooks/useWallet"
import { usePortfolio } from "@/hooks/usePortfolio"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"

interface WalletManagementProps {
  onClose?: () => void
}

export function WalletManagement({ onClose }: WalletManagementProps) {
  const { wallets, loading, deleteWallet, refreshWallets } = useWallet()
  const { refreshPortfolio, refreshing, dataFreshness, clearAllPortfolioData } = usePortfolio()
  const { toast } = useToast()
  const { user } = useAuth()
  
  const [clearingData, setClearingData] = useState(false)
  
  const [isAddingWallet, setIsAddingWallet] = useState(false)
  const [newWalletAddress, setNewWalletAddress] = useState("")
  const [newWalletName, setNewWalletName] = useState("")
  const [addingWallet, setAddingWallet] = useState(false)

  // Force refresh on page load if wallets exist
  useEffect(() => {
    if (wallets.length > 0) {
      console.log('[WalletManagement] Page loaded with wallets, ensuring fresh data')
      // Small delay to let other components initialize
      const timer = setTimeout(() => {
        if (dataFreshness === 'cached' || dataFreshness === 'stale') {
          console.log('[WalletManagement] Auto-refreshing portfolio on page load')
          refreshPortfolio()
        }
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [wallets.length, dataFreshness])

  const handleAddWallet = async () => {
    if (!newWalletAddress.trim() || !user) {
      toast({
        title: "Error",
        description: "Please enter a valid wallet address",
        variant: "destructive",
      })
      return
    }

    // Basic Solana address validation (44 characters, base58)
    if (newWalletAddress.length < 32 || newWalletAddress.length > 44) {
      toast({
        title: "Error",
        description: "Invalid Solana wallet address format",
        variant: "destructive",
      })
      return
    }

    setAddingWallet(true)
    try {
      // Check if wallet already exists
      const { data: existingWallet } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .eq('wallet_address', newWalletAddress.trim())
        .maybeSingle()

      if (existingWallet) {
        toast({
          title: "Error",
          description: "This wallet is already added to your account",
          variant: "destructive",
        })
        return
      }

      // Add new wallet
      const { error } = await supabase
        .from('wallets')
        .insert({
          user_id: user.id,
          wallet_address: newWalletAddress.trim(),
          wallet_name: newWalletName.trim() || 'Solana Wallet',
          is_primary: wallets.length === 0
        })

      if (error) {
        throw error
      }

      toast({
        title: "Success",
        description: "Wallet added successfully! Fetching portfolio data...",
      })

      // Reset form
      setNewWalletAddress("")
      setNewWalletName("")
      setIsAddingWallet(false)
      
      // Refresh wallets list first
      await refreshWallets()
      
      // Force immediate portfolio refresh after wallet addition
      setTimeout(() => {
        console.log('[WalletManagement] Force refreshing portfolio after wallet addition')
        refreshPortfolio()
      }, 500)

    } catch (error) {
      console.error('[WalletManagement] Error adding wallet:', error)
      toast({
        title: "Error",
        description: "Failed to add wallet",
        variant: "destructive",
      })
    } finally {
      setAddingWallet(false)
    }
  }

  const handleDeleteWallet = async (walletId: string, walletAddress: string) => {
    console.log(`[WalletManagement] Deleting wallet: ${walletAddress}`)
    
    // Delete wallet from wallets table
    await deleteWallet(walletId)
    
    // Clean up portfolio data for deleted wallet immediately
    if (user) {
      try {
        console.log(`[WalletManagement] Cleaning up portfolio data for deleted wallet: ${walletAddress}`)
        const { error } = await supabase
          .from('portfolio')
          .delete()
          .eq('user_id', user.id)
          .eq('wallet_address', walletAddress)
        
        if (error) {
          console.error('[WalletManagement] Error cleaning up portfolio data:', error)
        } else {
          console.log(`[WalletManagement] Successfully cleaned up portfolio data for: ${walletAddress}`)
        }
        
        // Force refresh portfolio with remaining wallets after a brief delay
        setTimeout(() => {
          console.log('[WalletManagement] Refreshing portfolio after wallet deletion')
          refreshPortfolio()
        }, 500)
        
      } catch (error) {
        console.error('[WalletManagement] Error during portfolio cleanup:', error)
      }
    }
  }

  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address)
      toast({
        title: "Success",
        description: "Wallet address copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy address",
        variant: "destructive",
      })
    }
  }

  const openExplorer = (address: string) => {
    const url = `https://explorer.solana.com/address/${address}`
    window.open(url, '_blank')
  }

  const handleRefreshAllHoldings = async () => {
    console.log('[WalletManagement] Manually refreshing all holdings')
    await refreshPortfolio()
  }

  const handleClearAllPortfolioData = async () => {
    if (!user) return
    
    setClearingData(true)
    try {
      const success = await clearAllPortfolioData()
      
      if (success) {
        toast({
          title: "Success",
          description: "All portfolio data cleared. Refresh to fetch fresh data.",
        })
      } else {
        throw new Error("Failed to clear data")
      }
      
    } catch (error) {
      console.error('[WalletManagement] Error clearing portfolio data:', error)
      toast({
        title: "Error",
        description: "Failed to clear portfolio data",
        variant: "destructive",
      })
    } finally {
      setClearingData(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Wallet Management</h2>
          <p className="text-muted-foreground">Manage your Solana wallets and refresh holdings</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={handleRefreshAllHoldings}
            disabled={refreshing || wallets.length === 0}
            variant={dataFreshness === 'stale' ? "default" : "outline"}
            size="sm"
            className={dataFreshness === 'stale' ? "bg-amber-500 hover:bg-amber-600 text-white" : ""}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : dataFreshness === 'stale' ? 'Refresh Required' : 'Refresh Holdings'}
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={clearingData || wallets.length === 0}
                className="border-red-200 text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear All Portfolio Data</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove ALL portfolio data from the database. This action cannot be undone. 
                  You can refresh afterwards to fetch fresh data from your connected wallets.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearAllPortfolioData}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={clearingData}
                >
                  {clearingData ? 'Clearing...' : 'Clear All Data'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <Button onClick={() => setIsAddingWallet(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Wallet
          </Button>
        </div>
      </div>

      {/* Data freshness warning */}
      {dataFreshness === 'stale' && !refreshing && wallets.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Portfolio data may be outdated</span>
            </div>
            <p className="text-sm text-amber-700 mt-1">
              Your portfolio data is more than 5 minutes old. Click "Refresh Required" to get the latest balances from the blockchain.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add Wallet Form */}
      {isAddingWallet && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Wallet</CardTitle>
            <CardDescription>
              Enter your Solana wallet address to add it to your portfolio. Portfolio data will be automatically fetched.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wallet-name">Wallet Name (Optional)</Label>
              <Input
                id="wallet-name"
                placeholder="My Solana Wallet"
                value={newWalletName}
                onChange={(e) => setNewWalletName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wallet-address">Wallet Address *</Label>
              <Input
                id="wallet-address"
                placeholder="Enter Solana wallet address (44 characters)"
                value={newWalletAddress}
                onChange={(e) => setNewWalletAddress(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddWallet}
                disabled={addingWallet || !newWalletAddress.trim()}
                className="flex-1"
              >
                {addingWallet ? "Adding..." : "Add Wallet"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingWallet(false)
                  setNewWalletAddress("")
                  setNewWalletName("")
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Wallets List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading wallets...</p>
        </div>
      ) : wallets.length > 0 ? (
        <div className="grid gap-4">
          {wallets.map((wallet) => (
            <Card key={wallet.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">
                          {wallet.wallet_name || 'Solana Wallet'}
                        </h3>
                        {wallet.is_primary && (
                          <Badge variant="secondary" className="text-xs">
                            Primary
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-mono text-muted-foreground break-all bg-muted/20 p-2 rounded text-xs">
                        {wallet.wallet_address}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Added: {new Date(wallet.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyAddress(wallet.wallet_address)}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openExplorer(wallet.wallet_address)}
                      className="h-8 w-8 p-0"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Wallet</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove this wallet from your portfolio? 
                            This will also remove all associated portfolio data and refresh your portfolio automatically.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteWallet(wallet.id, wallet.wallet_address)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/20 flex items-center justify-center">
              <Wallet className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Wallets Added</h3>
            <p className="text-muted-foreground mb-4">
              Add your first Solana wallet to start tracking your portfolio
            </p>
            <Button onClick={() => setIsAddingWallet(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Wallet
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
