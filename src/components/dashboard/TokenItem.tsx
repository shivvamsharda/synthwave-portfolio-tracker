import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"
import { TokenItemProps } from "./types"

export function TokenItem({ token, showWalletInfo = false }: TokenItemProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-all duration-200 border border-border/30">
      <div className="flex items-center space-x-4">
        {/* Token Icon/Logo */}
        <div className="w-10 h-10 rounded-full bg-gradient-cyber flex items-center justify-center text-background font-bold text-sm overflow-hidden">
          {token.logo_uri ? (
            <img 
              src={token.logo_uri} 
              alt={`${token.token_symbol} logo`}
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                const parent = target.parentElement
                if (parent) {
                  parent.innerHTML = token.token_symbol.slice(0, 2)
                  parent.className = "w-10 h-10 rounded-full bg-gradient-cyber flex items-center justify-center text-background font-bold text-sm"
                }
              }}
            />
          ) : (
            token.token_symbol.slice(0, 2)
          )}
        </div>
        
        {/* Token Info */}
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-foreground">{token.token_symbol}</span>
            <span className="text-xs text-muted-foreground max-w-[120px] truncate">{token.token_name}</span>
            {token.walletCount > 1 && (
              <Badge variant="secondary" className="text-xs">
                {token.walletCount} wallets
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground font-mono">
            {token.balance.toLocaleString(undefined, { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 6 
            })}
          </div>
          {showWalletInfo && (
            <div className="text-xs text-muted-foreground">
              {token.wallet_address.slice(0, 4)}...{token.wallet_address.slice(-4)}
            </div>
          )}
          {/* Additional metadata info */}
          {token.description && (
            <div className="text-xs text-muted-foreground max-w-[200px] truncate mt-1" title={token.description}>
              {token.description}
            </div>
          )}
        </div>
      </div>

      {/* Token Stats */}
      <div className="text-right">
        {/* Individual Token Price with Trend */}
        <div className="flex items-center justify-end space-x-1 mb-1">
          <span className="text-sm font-medium text-foreground">
            ${token.token_price?.toFixed(4) || '0.0000'}
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
        <div className="font-semibold font-mono text-lg text-foreground">
          ${token.usd_value?.toFixed(2) || '0.00'}
        </div>
        
        {/* Token Balance */}
        <div className="text-xs text-muted-foreground">
          {token.balance.toLocaleString(undefined, { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 6 
          })} tokens
        </div>
        
        {/* External links */}
        {(token.website || token.twitter) && (
          <div className="flex items-center space-x-1 mt-1">
            {token.website && (
              <a 
                href={token.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                title="Visit website"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182C8.542 6.116 8.332 6.954 8.212 8h3.576c-.12-1.046-.33-1.884-.586-2.556-.24-.559-.499-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.13 1.056.34 1.884.586 2.556.24.559.499.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.497-.623.737-1.182.246-.672.456-1.5.586-2.556zm5.917 0h-1.946c.089 1.546.383 2.97.837 4.118A6.004 6.004 0 0015.917 11zm-13.834 0H4.083c-.089 1.546-.383 2.97-.837 4.118A6.004 6.004 0 004.083 11z" clipRule="evenodd"/>
                </svg>
              </a>
            )}
            {token.twitter && (
              <a 
                href={token.twitter} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                title="Visit Twitter"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M20 4.077a8.232 8.232 0 01-2.36.648 4.12 4.12 0 001.808-2.277 8.243 8.243 0 01-2.606.996A4.103 4.103 0 0013.847 2c-2.27 0-4.103 1.834-4.103 4.103 0 .322.037.635.107.935A11.647 11.647 0 011.392 2.755a4.075 4.075 0 00-.555 2.064c0 1.424.724 2.68 1.825 3.415a4.084 4.084 0 01-1.859-.514v.052c0 1.988 1.414 3.647 3.292 4.023a4.108 4.108 0 01-1.853.07c.522 1.63 2.038 2.816 3.833 2.85A8.235 8.235 0 011 16.077 11.616 11.616 0 006.29 18c7.547 0 11.675-6.252 11.675-11.675 0-.178-.004-.355-.012-.53A8.348 8.348 0 0020 4.077z" clipRule="evenodd"/>
                </svg>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}