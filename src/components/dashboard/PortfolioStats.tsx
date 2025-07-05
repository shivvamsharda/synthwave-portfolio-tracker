import { GlassCard } from "@/components/ui/glass-card"

interface StatCardProps {
  title: string
  value: string
  change: string
  changeType: "positive" | "negative"
  icon?: React.ReactNode
}

function StatCard({ title, value, change, changeType, icon }: StatCardProps) {
  return (
    <GlassCard className="p-6 hover:shadow-neon-primary/20 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold font-mono text-glow-primary">{value}</p>
          <p className={`text-sm font-medium ${
            changeType === "positive" ? "text-primary" : "text-destructive"
          }`}>
            {change}
          </p>
        </div>
        {icon && (
          <div className="text-primary/60">
            {icon}
          </div>
        )}
      </div>
    </GlassCard>
  )
}

export function PortfolioStats() {
  // Mock data - will be replaced with real portfolio data
  const stats = [
    {
      title: "Total Portfolio Value",
      value: "$127,456.78",
      change: "+$12,345 (10.7%)",
      changeType: "positive" as const
    },
    {
      title: "24h P&L",
      value: "+$3,421.12",
      change: "+2.8%",
      changeType: "positive" as const
    },
    {
      title: "7d P&L",
      value: "+$8,967.45",
      change: "+7.6%",
      changeType: "positive" as const
    },
    {
      title: "Total Assets",
      value: "24",
      change: "+3 this week",
      changeType: "positive" as const
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          changeType={stat.changeType}
        />
      ))}
    </div>
  )
}