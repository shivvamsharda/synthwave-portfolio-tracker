import { useState } from "react"
import { AuthGuard } from "@/components/auth/AuthGuard"
import { Dashboard } from "@/components/dashboard/Dashboard"
import { WalletsPage } from "@/components/pages/WalletsPage"
import { YieldPage } from "@/components/pages/YieldPage"
import heroImage from "@/assets/crypto-hero.jpg"

type PageType = "dashboard" | "wallets" | "nfts" | "yield" | "analytics" | "settings"

export function CryptoPortfolioApp() {
  const [currentPage, setCurrentPage] = useState<PageType>("dashboard")

  const renderPage = () => {
    switch(currentPage) {
      case "dashboard":
        return <Dashboard onNavigate={setCurrentPage} />
      case "wallets":
        return <WalletsPage onNavigate={setCurrentPage} />
      case "yield":
        return <YieldPage onNavigate={setCurrentPage} />
      case "analytics":
        return (
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-primary">Token Analytics</h1>
              <p className="text-muted-foreground">Advanced analytics and insights for your tokens</p>
              <button 
                onClick={() => setCurrentPage("dashboard")}
                className="btn-primary px-6 py-3 rounded-lg font-medium"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )
      case "nfts":
        return (
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-primary">NFT Gallery</h1>
              <p className="text-muted-foreground">Coming Soon - Your NFT collection showcase</p>
              <button 
                onClick={() => setCurrentPage("dashboard")}
                className="btn-primary px-6 py-3 rounded-lg font-medium"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )
      case "settings":
        return (
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-primary">Settings</h1>
              <p className="text-muted-foreground">Customize your crypto portfolio experience</p>
              <button 
                onClick={() => setCurrentPage("dashboard")}
                className="btn-primary px-6 py-3 rounded-lg font-medium"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )
      default:
        return <Dashboard onNavigate={setCurrentPage} />
    }
  }

  return (
    <AuthGuard>
      <div className="relative">
        {/* Hero Background */}
        <div 
          className="fixed inset-0 z-0 opacity-10 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative z-10">
          {renderPage()}
        </div>
      </div>
    </AuthGuard>
  )
}