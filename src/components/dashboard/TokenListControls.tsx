import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, BarChart3, Wallet } from "lucide-react"

interface TokenListControlsProps {
  sortBy: 'balance' | 'value' | 'symbol'
  setSortBy: (value: 'balance' | 'value' | 'symbol') => void
  groupView: 'flat' | 'grouped'
  setGroupView: (value: 'flat' | 'grouped') => void
  showWalletBreakdown: boolean
  setShowWalletBreakdown: (value: boolean) => void
}

export function TokenListControls({
  sortBy,
  setSortBy,
  groupView,
  setGroupView,
  showWalletBreakdown,
  setShowWalletBreakdown
}: TokenListControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-muted/10 rounded-lg">
      <div className="flex items-center space-x-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="value">By Value</SelectItem>
            <SelectItem value="balance">By Balance</SelectItem>
            <SelectItem value="symbol">By Symbol</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2">
        <BarChart3 className="w-4 h-4 text-muted-foreground" />
        <Select value={groupView} onValueChange={(value: any) => setGroupView(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="grouped">Grouped</SelectItem>
            <SelectItem value="flat">Flat View</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowWalletBreakdown(!showWalletBreakdown)}
        className="ml-auto"
      >
        <Wallet className="w-4 h-4 mr-2" />
        {showWalletBreakdown ? 'Hide' : 'Show'} Wallet Breakdown
      </Button>
    </div>
  )
}