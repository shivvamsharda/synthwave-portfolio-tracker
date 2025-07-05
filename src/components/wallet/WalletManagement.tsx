import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Wallet, Copy, ExternalLink, RefreshCw } from "lucide-react"
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
  const { refreshPortfolio, refreshing } = usePortfolio()
  const { toast } = useToast()
  const { user } = useAuth()
  
  const [isAddingWallet, setIsAddingWallet] = useState(false)
  const [newWalletAddress, setNewWalletAddress] = useState("")
  const [newWalletName, setNewWalletName] = useState("")
  const [addingWallet, setAddingWallet] = useState(false)

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
        .single()

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
        description: "Wallet added successfully!",
      })

      // Reset form
      setNewWalletAddress("")
      setNewWalletName("")
      setIsAddingWallet(false)
      
      // Refresh wallets
      await refreshWallets()

    } catch (error) {
      console.error('Error adding wallet:', error)
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
    await deleteWallet(walletId)
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
    const url = `https://explorer.solana.com/address/${address}?cluster=devnet`
    window.open(url, '_blank')
  }

  const handleRefreshAllHoldings = async () => {
    await refreshPortfolio()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Wallet Management</h2>
          <p className="text-muted-foreground">Manage your Solana wallets and refresh holdings</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRefreshAllHoldings}
            disabled={refreshing || wallets.length === 0}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Holdings'}
          </Button>
          <Button onClick={() => setIsAddingWallet(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Wallet
          </Button>
        </div>
      </div>

      {/* Add Wallet Form */}
      {isAddingWallet && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Wallet</CardTitle>
            <CardDescription>
              Enter your Solana wallet address to add it to your portfolio
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
                            This will also remove all associated portfolio data.
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