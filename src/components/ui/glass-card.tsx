import * as React from "react"
import { cn } from "@/lib/utils"

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glow" | "neon"
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "glass-card",
      glow: "glass-card shadow-neon-primary",
      neon: "glass-card shadow-neon-primary animate-glow-pulse"
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
GlassCard.displayName = "GlassCard"

export { GlassCard }