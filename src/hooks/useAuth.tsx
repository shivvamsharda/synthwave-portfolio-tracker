
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signInWithSolanaWallet: (wallet: any) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signInWithSolanaWallet = async (wallet: any) => {
    try {
      console.log('Starting Solana wallet sign in...', {
        walletName: wallet?.wallet?.adapter?.name || wallet?.adapter?.name,
        walletConnected: wallet?.connected,
        publicKey: wallet?.publicKey?.toString(),
        selectedWallet: wallet?.wallet?.adapter?.name,
        defaultAdapter: wallet?.adapter?.name
      })

      // Use the selected wallet adapter, not the default adapter
      const selectedAdapter = wallet?.wallet?.adapter || wallet?.adapter
      
      if (!selectedAdapter) {
        console.error('No wallet adapter found')
        return { error: { message: 'No wallet adapter available' } as AuthError }
      }

      console.log('Using wallet adapter:', selectedAdapter.name)

      const { data, error } = await supabase.auth.signInWithWeb3({
        chain: 'solana',
        statement: 'I accept the Terms of Service by signing in with my Solana wallet.',
        wallet: selectedAdapter,
      })

      if (error) {
        console.error('Supabase signInWithWeb3 error:', error)
      } else {
        console.log('Supabase signInWithWeb3 success:', data)
      }

      return { error }
    } catch (err) {
      console.error('Unexpected error in signInWithSolanaWallet:', err)
      return { error: err as AuthError }
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithSolanaWallet,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
