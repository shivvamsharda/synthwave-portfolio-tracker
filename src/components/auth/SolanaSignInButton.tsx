
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"

export function SolanaSignInButton() {
  const wallet = useWallet()
  const { signInWithSolanaWallet } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  // Automatically sign in when wallet connects
  useEffect(() => {
    const handleAutoSignIn = async () => {
      if (wallet.connected && wallet.wallet && !loading) {
        console.log('Wallet connected, auto-signing in...', {
          connected: wallet.connected,
          hasWallet: !!wallet.wallet,
          walletName: wallet.wallet?.adapter?.name,
          publicKey: wallet.publicKey?.toString()
        })

        setLoading(true)
        try {
          console.log('Attempting automatic Solana sign in...')
          const { error } = await signInWithSolanaWallet(wallet)
          
          if (error) {
            console.error('Auto sign in error:', error)
            toast({
              title: "Sign In Failed",
              description: `${error.message || 'Unknown error'} - Check console for details`,
              variant: "destructive",
            })
          } else {
            console.log('Auto sign in successful!')
            toast({
              title: "Success",
              description: "Successfully signed in with Solana wallet",
            })
          }
        } catch (error) {
          console.error('Unexpected error in auto sign-in:', error)
          toast({
            title: "Error",
            description: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'} - Check console for details`,
            variant: "destructive",
          })
        } finally {
          setLoading(false)
        }
      }
    }

    handleAutoSignIn()
  }, [wallet.connected, wallet.wallet, signInWithSolanaWallet, toast, loading])

  return (
    <div className="w-full space-y-3">
      <div className="text-center">
        <h3 className="text-lg font-medium text-foreground mb-1">Login with Solana</h3>
        <p className="text-sm text-muted-foreground">Connect your wallet to continue</p>
      </div>
      
      {loading ? (
        <Button 
          variant="outline"
          className="w-full"
          disabled
        >
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Signing In...
        </Button>
      ) : (
        <div className="flex justify-center">
          <WalletMultiButton className="!bg-gradient-primary !text-primary-foreground !border-0 !rounded-lg !h-11 !font-medium hover:!opacity-90 transition-opacity !mx-auto !block" />
        </div>
      )}
    </div>
  )
}
