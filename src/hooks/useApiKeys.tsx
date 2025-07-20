
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

interface ApiKeys {
  helius?: string
  birdeye?: string
  coingecko?: string
  santiment?: string
  lunarcrush?: string
  solanaRpcUrl?: string
}

export function useApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApiKeys()
  }, [])

  const fetchApiKeys = async () => {
    try {
      // Try to fetch API keys from Supabase secrets via edge function
      const { data, error } = await supabase.functions.invoke('get-api-keys')
      
      if (error) {
        console.error('Error fetching API keys:', error)
        setApiKeys({})
      } else {
        setApiKeys(data || {})
      }
    } catch (error) {
      console.error('Error fetching API keys:', error)
      setApiKeys({})
    } finally {
      setLoading(false)
    }
  }

  const hasApiKey = (provider: keyof ApiKeys): boolean => {
    return !!(apiKeys[provider] && apiKeys[provider]?.trim().length > 0)
  }

  const getApiKey = (provider: keyof ApiKeys): string | undefined => {
    return apiKeys[provider]
  }

  return {
    apiKeys,
    loading,
    hasApiKey,
    getApiKey,
    refetch: fetchApiKeys
  }
}
