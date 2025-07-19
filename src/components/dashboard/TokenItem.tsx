import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, RefreshCw, ExternalLink, Globe } from "lucide-react"
import { TokenItemProps } from "./types"
import { useState } from "react"

export function TokenItem({ token, showWalletInfo = false }: TokenItemProps) {
  const [imageError, setImageError] = useState(false)
  
  // Data validation and formatting
  const formatBalance = (balance: number) => {
    if (balance === 0) return '0.00'
    if (balance < 0.01) return balance.toFixed(8)
    if (balance < 1) return balance.toFixed(6)
    return balance.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 6 
    })
  }

  const formatPrice = (price: number) => {
    if (!price || price === 0) return '0.0000'
    if (price < 0.01) return price.toFixed(8)
    return price.toFixed(4)
  }

  const formatUsdValue = (value: number) => {
    if (!value || value === 0) return '0.00'
    if (value < 0.01) return '<$0.01'
    return value.toFixed(2)
  }

  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-all duration-200 border border-border/30">
      <div className="flex items-center space-x-4">
        {/* Token Icon/Logo */}
        <div className="w-10 h-10 rounded-full bg-gradient-cyber flex items-center justify-center text-background font-bold text-sm overflow-hidden">
          {token.logo_uri && !imageError ? (
            <img 
              src={token.logo_uri} 
              alt={`${token.token_symbol || 'Token'} logo`}
              className="w-full h-full object-cover rounded-full"
              onError={() => setImageError(true)}
            />
          ) : (
            <span>{token.token_symbol ? token.token_symbol.slice(0, 2).toUpperCase() : '??'}</span>
          )}
        </div>
        
        {/* Token Info */}
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-semibold text-foreground">
              {token.token_symbol || 'UNKNOWN'}
            </span>
            <span className="text-xs text-muted-foreground max-w-[120px] truncate">
              {token.token_name || 'Unknown Token'}
            </span>
            {token.walletCount > 1 && (
              <Badge variant="secondary" className="text-xs">
                {token.walletCount} wallets
              </Badge>
            )}
          </div>
          
          <div className="text-sm text-muted-foreground font-mono mb-1">
            {formatBalance(token.balance)} {token.token_symbol}
          </div>
          
          {showWalletInfo && token.wallet_address && (
            <div className="text-xs text-muted-foreground font-mono">
              {token.wallet_address.slice(0, 4)}...{token.wallet_address.slice(-4)}
            </div>
          )}
          
          {/* Token metadata */}
          {token.description && (
            <div className="text-xs text-muted-foreground max-w-[250px] truncate mt-1" title={token.description}>
              {token.description}
            </div>
          )}
          
          {/* Last updated indicator */}
          {token.last_updated && (
            <div className="text-xs text-muted-foreground/70 mt-1">
              Updated: {new Date(token.last_updated).toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      {/* Token Stats */}
      <div className="text-right">
        {/* Individual Token Price with Trend */}
        <div className="flex items-center justify-end space-x-2 mb-1">
          <span className="text-sm font-medium text-foreground">
            ${formatPrice(token.token_price)}
          </span>
          {token.price_change_24h !== undefined && token.price_change_24h !== 0 && (
            <div className={`flex items-center space-x-1 ${
              token.price_change_24h > 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {token.price_change_24h > 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span className="text-xs font-medium">
                {Math.abs(token.price_change_24h).toFixed(2)}%
              </span>
            </div>
          )}
        </div>
        
        {/* Total Value */}
        <div className="font-semibold font-mono text-lg text-foreground mb-1">
          ${formatUsdValue(token.usd_value)}
        </div>
        
        {/* External links */}
        {(token.website || token.twitter) && (
          <div className="flex items-center justify-end space-x-2 mt-2">
            {token.website && (
              <a 
                href={token.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors p-1 rounded hover:bg-muted/20"
                title="Visit website"
              >
                <Globe className="w-3 h-3" />
              </a>
            )}
            {token.twitter && (
              <a 
                href={token.twitter} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors p-1 rounded hover:bg-muted/20"
                title="Visit Twitter"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
        
        {/* Data freshness indicator */}
        {token.last_updated && (
          <div className="text-xs text-muted-foreground/50 mt-1">
            {(() => {
              const updateTime = new Date(token.last_updated).getTime()
              const now = Date.now()
              const diffMinutes = Math.floor((now - updateTime) / (1000 * 60))
              
              if (diffMinutes < 1) return 'Just now'
              if (diffMinutes < 60) return `${diffMinutes}m ago`
              const diffHours = Math.floor(diffMinutes / 60)
              if (diffHours < 24) return `${diffHours}h ago`
              return `${Math.floor(diffHours / 24)}d ago`
            })()}
          </div>
        )}
      </div>
    </div>
  )
}