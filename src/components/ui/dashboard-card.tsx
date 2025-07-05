import * as React from "react"
import { cn } from "@/lib/utils"

export interface DashboardCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "bordered"
}

const DashboardCard = React.forwardRef<HTMLDivElement, DashboardCardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "dashboard-card",
      elevated: "dashboard-card shadow-lg",
      bordered: "dashboard-card border-2"
    }

    return (
      <div
        ref={ref}
        className={cn(variants[variant], className)}
        {...props}
      />
    )
  }
)
DashboardCard.displayName = "DashboardCard"

export { DashboardCard }