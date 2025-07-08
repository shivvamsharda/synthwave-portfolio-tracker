export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      portfolio: {
        Row: {
          balance: number | null
          description: string | null
          id: string
          last_updated: string | null
          logo_uri: string | null
          price_change_24h: number | null
          token_mint: string
          token_name: string | null
          token_price: number | null
          token_symbol: string | null
          twitter: string | null
          usd_value: number | null
          user_id: string
          wallet_address: string
          website: string | null
        }
        Insert: {
          balance?: number | null
          description?: string | null
          id?: string
          last_updated?: string | null
          logo_uri?: string | null
          price_change_24h?: number | null
          token_mint: string
          token_name?: string | null
          token_price?: number | null
          token_symbol?: string | null
          twitter?: string | null
          usd_value?: number | null
          user_id: string
          wallet_address: string
          website?: string | null
        }
        Update: {
          balance?: number | null
          description?: string | null
          id?: string
          last_updated?: string | null
          logo_uri?: string | null
          price_change_24h?: number | null
          token_mint?: string
          token_name?: string | null
          token_price?: number | null
          token_symbol?: string | null
          twitter?: string | null
          usd_value?: number | null
          user_id?: string
          wallet_address?: string
          website?: string | null
        }
        Relationships: []
      }
      portfolio_history: {
        Row: {
          created_at: string
          id: string
          snapshot_date: string
          total_assets: number | null
          total_value: number
          total_value_change_24h: number | null
          total_value_change_percentage_24h: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          snapshot_date?: string
          total_assets?: number | null
          total_value?: number
          total_value_change_24h?: number | null
          total_value_change_percentage_24h?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          snapshot_date?: string
          total_assets?: number | null
          total_value?: number
          total_value_change_24h?: number | null
          total_value_change_percentage_24h?: number | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      token_flow_analysis: {
        Row: {
          analysis_date: string
          created_at: string
          destination_token: string | null
          flow_direction: string
          id: string
          source_token: string | null
          time_period: string
          token_mint: string
          total_volume: number
          unique_wallets: number
        }
        Insert: {
          analysis_date: string
          created_at?: string
          destination_token?: string | null
          flow_direction: string
          id?: string
          source_token?: string | null
          time_period: string
          token_mint: string
          total_volume: number
          unique_wallets: number
        }
        Update: {
          analysis_date?: string
          created_at?: string
          destination_token?: string | null
          flow_direction?: string
          id?: string
          source_token?: string | null
          time_period?: string
          token_mint?: string
          total_volume?: number
          unique_wallets?: number
        }
        Relationships: []
      }
      token_holders: {
        Row: {
          balance: number
          created_at: string
          holder_rank: number | null
          id: string
          last_updated: string
          percentage_of_supply: number | null
          token_mint: string
          usd_value: number | null
          wallet_address: string
        }
        Insert: {
          balance: number
          created_at?: string
          holder_rank?: number | null
          id?: string
          last_updated?: string
          percentage_of_supply?: number | null
          token_mint: string
          usd_value?: number | null
          wallet_address: string
        }
        Update: {
          balance?: number
          created_at?: string
          holder_rank?: number | null
          id?: string
          last_updated?: string
          percentage_of_supply?: number | null
          token_mint?: string
          usd_value?: number | null
          wallet_address?: string
        }
        Relationships: []
      }
      token_metadata: {
        Row: {
          created_at: string | null
          decimals: number | null
          description: string | null
          id: string
          is_verified: boolean | null
          logo_uri: string | null
          name: string | null
          symbol: string | null
          token_mint: string
          twitter: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          created_at?: string | null
          decimals?: number | null
          description?: string | null
          id?: string
          is_verified?: boolean | null
          logo_uri?: string | null
          name?: string | null
          symbol?: string | null
          token_mint: string
          twitter?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string | null
          decimals?: number | null
          description?: string | null
          id?: string
          is_verified?: boolean | null
          logo_uri?: string | null
          name?: string | null
          symbol?: string | null
          token_mint?: string
          twitter?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      token_transactions: {
        Row: {
          amount_from: number | null
          amount_to: number | null
          block_height: number | null
          created_at: string
          id: string
          timestamp: string
          token_mint_from: string | null
          token_mint_to: string | null
          transaction_hash: string
          transaction_type: string
          wallet_address: string
        }
        Insert: {
          amount_from?: number | null
          amount_to?: number | null
          block_height?: number | null
          created_at?: string
          id?: string
          timestamp: string
          token_mint_from?: string | null
          token_mint_to?: string | null
          transaction_hash: string
          transaction_type: string
          wallet_address: string
        }
        Update: {
          amount_from?: number | null
          amount_to?: number | null
          block_height?: number | null
          created_at?: string
          id?: string
          timestamp?: string
          token_mint_from?: string | null
          token_mint_to?: string | null
          transaction_hash?: string
          transaction_type?: string
          wallet_address?: string
        }
        Relationships: []
      }
      wallet_snapshots: {
        Row: {
          balance: number
          created_at: string
          id: string
          snapshot_date: string
          token_mint: string
          transaction_hash: string | null
          usd_value: number | null
          wallet_address: string
        }
        Insert: {
          balance: number
          created_at?: string
          id?: string
          snapshot_date: string
          token_mint: string
          transaction_hash?: string | null
          usd_value?: number | null
          wallet_address: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          snapshot_date?: string
          token_mint?: string
          transaction_hash?: string | null
          usd_value?: number | null
          wallet_address?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean | null
          updated_at: string
          user_id: string
          wallet_address: string
          wallet_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          updated_at?: string
          user_id: string
          wallet_address: string
          wallet_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          updated_at?: string
          user_id?: string
          wallet_address?: string
          wallet_name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_portfolio_stats: {
        Args: { user_uuid: string }
        Returns: {
          total_value: number
          total_value_24h_ago: number
          total_value_7d_ago: number
          value_change_24h: number
          value_change_24h_percentage: number
          value_change_7d: number
          value_change_7d_percentage: number
          total_assets: number
          total_unique_tokens: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
