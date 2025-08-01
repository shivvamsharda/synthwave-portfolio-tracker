
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { useNavigate } from "react-router-dom"
import { Settings, Menu, X, LogOut, Home, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface HeaderProps {
  onNavigate?: (page: "dashboard" | "wallets" | "nfts" | "yield" | "analytics" | "settings") => void
}

export function Header({ onNavigate }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { signOut } = useAuth()
  const navigateToRoute = useNavigate()
  const { toast } = useToast()

  const navigate = (page: "dashboard" | "wallets" | "nfts" | "yield" | "analytics" | "settings") => {
    onNavigate?.(page)
    setIsMobileMenuOpen(false)
  }

  const handleHomeClick = () => {
    navigateToRoute("/")
    setIsMobileMenuOpen(false)
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const copyContractAddress = async () => {
    const contractAddress = "51d8RGGrp9E2aVZtjHGtQpbxDQo53wCUvDcsXZuAbonk"
    try {
      await navigator.clipboard.writeText(contractAddress)
      toast({
        title: "Copied!",
        description: "Contract address copied to clipboard",
      })
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive",
      })
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-background/80 border-b border-border/50 shadow-navbar">
      <div className="container flex h-20 items-center px-6">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-4 cursor-pointer" onClick={() => navigate("dashboard")}>
            <img 
              src="https://iktftsxuuiyeabxgdxzo.supabase.co/storage/v1/object/public/platform-logos//cryptic.png" 
              alt="Cryptic" 
              className="w-16 h-16 object-contain"
            />
            <div>
              <span className="nav-title gradient-text">
                Cryptic
              </span>
              <div className="text-xs text-muted-foreground font-medium">Crypto Analytics Platform</div>
            </div>
          </div>
          
          {/* Contract Address Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={copyContractAddress}
            className="hidden lg:flex items-center space-x-2 text-xs font-mono bg-primary/5 border-primary/20 hover:bg-primary/10 transition-all duration-200"
          >
            <span className="text-muted-foreground">CA:</span>
            <span className="text-primary font-medium">51d8RGGrp9E2aVZtjHGtQpbxDQo53wCUvDcsXZuAbonk</span>
            <Copy className="w-3 h-3 ml-2" />
          </Button>
        </div>

        {/* Centered Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2 flex-1 justify-center">
          <Button 
            variant="ghost" 
            onClick={handleHomeClick} 
            className="nav-item text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200 px-4 py-2 rounded-xl"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate("dashboard")} 
            className="nav-item text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200 px-4 py-2 rounded-xl"
          >
            Dashboard
          </Button>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          {/* Sign Out */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="hidden md:flex text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all duration-200"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4" />
          </Button>

          {/* Settings */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="hidden md:flex hover:bg-muted/50 rounded-xl transition-all duration-200"
            onClick={() => navigate("settings")}
          >
            <Settings className="w-4 h-4" />
          </Button>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden hover:bg-muted/50 rounded-xl"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl">
          <nav className="container px-6 py-6 space-y-2">
            <Button 
              variant="ghost" 
              onClick={handleHomeClick} 
              className="w-full justify-start hover:bg-primary/5 hover:text-primary rounded-xl nav-item"
            >
              <Home className="w-4 h-4 mr-3" />
              Home
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate("dashboard")} 
              className="w-full justify-start hover:bg-primary/5 hover:text-primary rounded-xl nav-item"
            >
              Dashboard
            </Button>
            <div className="border-t border-border/30 pt-4 mt-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate("settings")} 
                className="w-full justify-start hover:bg-primary/5 hover:text-primary rounded-xl nav-item"
              >
                <Settings className="w-4 h-4 mr-3" />
                Settings
              </Button>
              <Button 
                variant="ghost" 
                onClick={handleSignOut} 
                className="w-full justify-start text-muted-foreground hover:bg-destructive/5 hover:text-destructive rounded-xl nav-item"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
