import { useState } from "react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { Button } from "@/components/ui/button"
import { Mail, CheckCircle, ArrowLeft } from "lucide-react"

interface EmailConfirmationPageProps {
  email: string
  onBack: () => void
}

export function EmailConfirmationPage({ email, onBack }: EmailConfirmationPageProps) {
  const [isResendingEmail, setIsResendingEmail] = useState(false)

  const handleResendEmail = async () => {
    setIsResendingEmail(true)
    // Add resend logic here if needed
    setTimeout(() => setIsResendingEmail(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <DashboardCard className="w-full max-w-md p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 bg-gradient-primary rounded-full flex items-center justify-center">
          <Mail className="w-8 h-8 text-primary-foreground" />
        </div>
        
        <div className="mb-4">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Check Your Email
          </h1>
        </div>
        
        <p className="text-muted-foreground mb-6">
          We've sent a confirmation link to{" "}
          <span className="font-semibold text-foreground">{email}</span>
        </p>
        
        <p className="text-sm text-muted-foreground mb-8">
          Click the link in your email to verify your account and complete the signup process. 
          The email might take a few minutes to arrive.
        </p>

        <div className="space-y-3">
          <Button
            onClick={handleResendEmail}
            variant="outline"
            className="w-full"
            disabled={isResendingEmail}
          >
            {isResendingEmail ? "Sending..." : "Resend Email"}
          </Button>
          
          <Button
            onClick={onBack}
            variant="ghost"
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </Button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-border/30">
          <p className="text-xs text-muted-foreground">
            Didn't receive the email? Check your spam folder or try resending.
          </p>
        </div>
      </DashboardCard>
    </div>
  )
}