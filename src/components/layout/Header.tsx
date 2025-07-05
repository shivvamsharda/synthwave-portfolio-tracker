import { useState } from "react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Wallet, Settings, Menu, X } from "lucide-react"

interface HeaderProps {
  onNavigate?: (page: "dashboard" | "wallets" | "nfts" | "yield" | "settings") => void
}

export function Header({ onNavigate }: HeaderProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleConnectWallet = () => {
    // Mock wallet connection - will integrate with real wallet adapters
    setIsConnected(!isConnected)
  }

  const navigate = (page: "dashboard" | "wallets" | "nfts" | "yield" | "settings") => {
    onNavigate?.(page)
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 backdrop-blur-md bg-background/80">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate("dashboard")}>
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg font-mono">₿</span>
          </div>
          <span className="text-xl font-bold text-glow-primary font-mono">
            CRYPTOFOLIO
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <button 
            onClick={() => navigate("dashboard")}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Dashboard
          </button>
          <button 
            onClick={() => navigate("wallets")}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Wallets
          </button>
          <button 
            onClick={() => navigate("nfts")}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            NFTs
          </button>
          <button 
            onClick={() => navigate("yield")}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Yield
          </button>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Wallet Connection */}
          <Button
            onClick={handleConnectWallet}
            className={isConnected ? "btn-neon-primary" : "btn-neon-accent"}
            size="sm"
          >
            <Wallet className="w-4 h-4 mr-2" />
            {isConnected ? "0x1234...5678" : "Connect Wallet"}
          </Button>

          {/* Settings */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="hidden md:flex"
            onClick={() => navigate("settings")}
          >
            <Settings className="w-4 h-4" />
          </Button>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <GlassCard className="md:hidden m-4 p-4 animate-slide-up">
          <nav className="flex flex-col space-y-4">
            <button 
              onClick={() => navigate("dashboard")}
              className="text-muted-foreground hover:text-primary transition-colors text-left"
            >
              Dashboard
            </button>
            <button 
              onClick={() => navigate("wallets")}
              className="text-muted-foreground hover:text-primary transition-colors text-left"
            >
              Wallets
            </button>
            <button 
              onClick={() => navigate("nfts")}
              className="text-muted-foreground hover:text-primary transition-colors text-left"
            >
              NFTs
            </button>
            <button 
              onClick={() => navigate("yield")}
              className="text-muted-foreground hover:text-primary transition-colors text-left"
            >
              Yield
            </button>
            <button 
              onClick={() => navigate("settings")}
              className="text-muted-foreground hover:text-primary transition-colors text-left flex items-center"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </button>
          </nav>
        </GlassCard>
      )}
    </header>
  )
}