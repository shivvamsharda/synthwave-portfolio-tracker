import React from "react"
import { Header } from "@/components/layout/Header"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { Button } from "@/components/ui/button"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { useWallet } from "@/hooks/useWallet"
import { Copy, ExternalLink, Trash2, Wallet } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface WalletInfo {
  id: string
  wallet_address: string
  wallet_name: string
  is_primary: boolean
  created_at: string
}

interface WalletsPageProps {
  onNavigate?: (page: "dashboard" | "wallets" | "nfts" | "yield" | "settings") => void
}

function WalletCard({ wallet, onDelete }: { wallet: WalletInfo; onDelete: (id: string) => void }) {
  const { toast } = useToast()

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(wallet.wallet_address)
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

  const openExplorer = () => {
    const url = `https://explorer.solana.com/address/${wallet.wallet_address}?cluster=devnet`
    window.open(url, '_blank')
  }

  return (
    <DashboardCard className="p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-gradient-cyber flex items-center justify-center">
            <Wallet className="w-6 h-6 text-background" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{wallet.wallet_name || 'Solana Wallet'}</h3>
            <span className="text-sm font-medium text-secondary">
              Solana
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button size="sm" variant="ghost" onClick={copyAddress}>
            <Copy className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={openExplorer}>
            <ExternalLink className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => onDelete(wallet.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="font-mono text-xs text-muted-foreground break-all bg-muted/20 p-2 rounded">
          {wallet.wallet_address}
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Connected</span>
          <span className="text-foreground font-medium">
            {new Date(wallet.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </DashboardCard>
  )
}

export function WalletsPage({ onNavigate }: WalletsPageProps) {
  const { wallets, loading, deleteWallet } = useWallet()

  const handleDeleteWallet = async (walletId: string) => {
    if (confirm('Are you sure you want to delete this wallet?')) {
      await deleteWallet(walletId)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onNavigate={onNavigate} />
      
      <main className="container px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-glow-primary">Connected Wallets</h1>
            <p className="text-muted-foreground">Manage your Solana wallets and track your SPL tokens</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground">Loading wallets...</p>
          </div>
        ) : wallets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {wallets.map((wallet) => (
              <WalletCard key={wallet.id} wallet={wallet} onDelete={handleDeleteWallet} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-cyber flex items-center justify-center">
              <Wallet className="w-8 h-8 text-background" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Wallets Connected</h3>
            <p className="text-muted-foreground mb-6">Connect your first Solana wallet to get started</p>
          </div>
        )}

        {/* Add Wallet Section */}
        <DashboardCard className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-cyber flex items-center justify-center">
            <Wallet className="w-8 h-8 text-background" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Connect Solana Wallet</h3>
          <p className="text-muted-foreground mb-6">
            Connect your Solana wallet to track all your SPL tokens and view your portfolio
          </p>
          <div className="flex justify-center">
            <WalletMultiButton className="!bg-primary !text-primary-foreground hover:!bg-primary/90 !rounded-md !text-sm !font-medium !px-6 !py-3" />
          </div>
        </DashboardCard>
      </main>
    </div>
  )
}