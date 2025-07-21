
import { DashboardCard } from "@/components/ui/dashboard-card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RefreshCw, History, Plus, Wallet } from "lucide-react"
import { useJupiterOrderHistory } from "@/hooks/useJupiterOrderHistory"
import { OrderHistoryItem } from "./OrderHistoryItem"
import { Skeleton } from "@/components/ui/skeleton"
import { useWallet } from "@/hooks/useWallet"

interface OrderHistoryProps {
  onNavigate?: (page: "dashboard" | "wallets" | "nfts" | "yield" | "analytics" | "settings") => void
}

export function OrderHistory({ onNavigate }: OrderHistoryProps) {
  const { orders, loading, error, lastUpdated, refreshOrderHistory } = useJupiterOrderHistory()
  const { wallets } = useWallet()

  // Group orders by wallet
  const ordersByWallet = orders.reduce((acc, order) => {
    const walletAddress = order.userPubkey
    if (!acc[walletAddress]) {
      acc[walletAddress] = []
    }
    acc[walletAddress].push(order)
    return acc
  }, {} as Record<string, typeof orders>)

  // Get wallet name from wallet list
  const getWalletName = (address: string) => {
    const wallet = wallets.find(w => w.wallet_address === address)
    return wallet?.wallet_name || `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-4 border border-border rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex items-center space-x-2 mb-3">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-3 w-3" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-8 w-full mb-2" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      ))}
    </div>
  )

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <History className="w-12 h-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">No Order History</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-48">
        Connect your wallets to see Jupiter order history
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onNavigate?.("wallets")}
        className="text-primary hover:text-primary"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Wallet
      </Button>
    </div>
  )

  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <RefreshCw className="w-6 h-6 text-red-600" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">Failed to Load</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-48">
        Unable to fetch order history. Please try again.
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={refreshOrderHistory}
        className="text-primary hover:text-primary"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Retry
      </Button>
    </div>
  )

  return (
    <DashboardCard className="p-6 flex flex-col" style={{ height: '400px' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Order History</h3>
          <p className="text-xs text-muted-foreground">
            Jupiter trigger orders
            {lastUpdated && (
              <span className="ml-2">
                • Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={refreshOrderHistory}
          disabled={loading}
          className="text-primary hover:text-primary"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorState />
        ) : orders.length === 0 ? (
          <EmptyState />
        ) : (
          <ScrollArea className="h-full">
            <div className="space-y-4 pr-4">
              {Object.entries(ordersByWallet).map(([walletAddress, walletOrders]) => (
                <div key={walletAddress} className="space-y-3">
                  {/* Wallet Header */}
                  <div className="flex items-center space-x-2 px-3 py-2 bg-muted/20 rounded-lg">
                    <Wallet className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {getWalletName(walletAddress)}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {walletOrders.length} order{walletOrders.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  {/* Orders for this wallet */}
                  <div className="space-y-2 ml-4">
                    {walletOrders.map((order) => (
                      <OrderHistoryItem key={order.orderKey} order={order} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </DashboardCard>
  )
}
