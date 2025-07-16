import { Button } from "@/components/ui/button"
import { Wallet, Loader2 } from "lucide-react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

export function SolanaSignInButton() {
  const wallet = useWallet()
  const { signInWithSolanaWallet } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleSolanaSignIn = async () => {
    console.log('Wallet state:', {
      connected: wallet.connected,
      hasWallet: !!wallet.wallet,
      walletName: wallet.wallet?.adapter?.name,
      publicKey: wallet.publicKey?.toString()
    })

    if (!wallet.connected || !wallet.wallet) {
      toast({
        title: "Wallet Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      console.log('Attempting Solana sign in...')
      const { error } = await signInWithSolanaWallet(wallet)
      
      if (error) {
        console.error('Sign in error:', error)
        toast({
          title: "Sign In Failed",
          description: `${error.message || 'Unknown error'} - Check console for details`,
          variant: "destructive",
        })
      } else {
        console.log('Sign in successful!')
        toast({
          title: "Success",
          description: "Successfully signed in with Solana wallet",
        })
      }
    } catch (error) {
      console.error('Unexpected error in handleSolanaSignIn:', error)
      toast({
        title: "Error",
        description: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'} - Check console for details`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!wallet.connected) {
    return (
      <div className="w-full">
        <WalletMultiButton className="!w-full !bg-gradient-primary !text-primary-foreground !border-0 !rounded-lg !h-11 !font-medium hover:!opacity-90 transition-opacity" />
      </div>
    )
  }

  return (
    <Button 
      onClick={handleSolanaSignIn}
      variant="outline"
      className="w-full"
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Signing In...
        </>
      ) : (
        <>
          <Wallet className="w-4 h-4 mr-2" />
          Sign in with Solana
        </>
      )}
    </Button>
  )
}