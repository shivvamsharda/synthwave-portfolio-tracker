
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProcessedJupiterOrder } from "@/services/jupiterOrderHistoryService"
import { ArrowRight, ExternalLink, Clock, CheckCircle, XCircle, Activity } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface OrderHistoryItemProps {
  order: ProcessedJupiterOrder
}

export function OrderHistoryItem({ order }: OrderHistoryItemProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'Cancelled':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'Active':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-3 h-3" />
      case 'Cancelled':
        return <XCircle className="w-3 h-3" />
      case 'Active':
        return <Activity className="w-3 h-3" />
      default:
        return <Clock className="w-3 h-3" />
    }
  }

  const handleViewTransaction = (txId: string) => {
    window.open(`https://solscan.io/tx/${txId}`, '_blank')
  }

  const formatAmount = (amount: number) => {
    if (amount === 0) return '0'
    if (amount < 0.01) return amount.toExponential(2)
    if (amount < 1000) return amount.toFixed(6)
    if (amount < 1000000) return (amount / 1000).toFixed(2) + 'K'
    return (amount / 1000000).toFixed(2) + 'M'
  }

  const executionRate = order.makingAmount > 0 ? (order.executedAmount / order.makingAmount) * 100 : 0

  return (
    <div className="p-4 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Badge className={`text-xs ${getStatusColor(order.status)}`}>
            {getStatusIcon(order.status)}
            <span className="ml-1">{order.status}</span>
          </Badge>
          {order.tradesCount > 0 && (
            <Badge variant="outline" className="text-xs">
              {order.tradesCount} {order.tradesCount === 1 ? 'trade' : 'trades'}
            </Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          {formatDistanceToNow(order.createdAt, { addSuffix: true })}
        </div>
      </div>

      {/* Token Pair */}
      <div className="flex items-center space-x-2 mb-3">
        <div className="flex items-center space-x-1">
          <span className="font-medium text-sm">{order.inputSymbol}</span>
          <span className="text-xs text-muted-foreground">({formatAmount(order.makingAmount)})</span>
        </div>
        <ArrowRight className="w-3 h-3 text-muted-foreground" />
        <div className="flex items-center space-x-1">
          <span className="font-medium text-sm">{order.outputSymbol}</span>
          <span className="text-xs text-muted-foreground">({formatAmount(order.takingAmount)})</span>
        </div>
      </div>

      {/* Execution Details */}
      {order.status === 'Completed' && order.executedAmount > 0 && (
        <div className="mb-3 p-2 bg-green-50 rounded border border-green-200">
          <div className="flex justify-between items-center text-xs">
            <span className="text-green-700">Executed:</span>
            <span className="font-medium text-green-800">
              {formatAmount(order.executedAmount)} {order.inputSymbol} ({executionRate.toFixed(1)}%)
            </span>
          </div>
          <div className="flex justify-between items-center text-xs mt-1">
            <span className="text-green-700">Received:</span>
            <span className="font-medium text-green-800">
              {formatAmount(order.executedValue)} {order.outputSymbol}
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          Order: {order.orderKey.slice(0, 8)}...
        </div>
        <div className="flex items-center space-x-1">
          {order.openTx && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewTransaction(order.openTx)}
              className="h-6 px-2 text-xs"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Open
            </Button>
          )}
          {order.closeTx && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewTransaction(order.closeTx)}
              className="h-6 px-2 text-xs"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Close
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
