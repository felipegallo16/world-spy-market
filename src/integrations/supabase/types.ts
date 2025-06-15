export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      commission_earnings: {
        Row: {
          commission_amount: number
          commission_currency: string
          commission_rate: number
          earned_at: string
          id: string
          transaction_id: string
        }
        Insert: {
          commission_amount: number
          commission_currency: string
          commission_rate: number
          earned_at?: string
          id?: string
          transaction_id: string
        }
        Update: {
          commission_amount?: number
          commission_currency?: string
          commission_rate?: number
          earned_at?: string
          id?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_earnings_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      index_tokens: {
        Row: {
          created_at: string
          description: string | null
          id: string
          index_type: Database["public"]["Enums"]["index_type"]
          is_active: boolean
          name: string
          symbol: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          index_type: Database["public"]["Enums"]["index_type"]
          is_active?: boolean
          name: string
          symbol: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          index_type?: Database["public"]["Enums"]["index_type"]
          is_active?: boolean
          name?: string
          symbol?: string
        }
        Relationships: []
      }
      token_prices: {
        Row: {
          change_24h: number | null
          change_percent_24h: number | null
          id: string
          market_cap: number | null
          price_usd: number
          token_id: string
          updated_at: string
          volume_24h: number | null
        }
        Insert: {
          change_24h?: number | null
          change_percent_24h?: number | null
          id?: string
          market_cap?: number | null
          price_usd: number
          token_id: string
          updated_at?: string
          volume_24h?: number | null
        }
        Update: {
          change_24h?: number | null
          change_percent_24h?: number | null
          id?: string
          market_cap?: number | null
          price_usd?: number
          token_id?: string
          updated_at?: string
          volume_24h?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "token_prices_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: true
            referencedRelation: "index_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          blockchain_tx_hash: string | null
          commission_amount: number
          completed_at: string | null
          created_at: string
          id: string
          metadata: Json | null
          payment_currency: string
          price_per_token: number | null
          quantity: number | null
          status: Database["public"]["Enums"]["transaction_status"]
          token_id: string | null
          total_amount: number
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
          world_id_nullifier: string | null
        }
        Insert: {
          blockchain_tx_hash?: string | null
          commission_amount?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          payment_currency: string
          price_per_token?: number | null
          quantity?: number | null
          status?: Database["public"]["Enums"]["transaction_status"]
          token_id?: string | null
          total_amount: number
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
          world_id_nullifier?: string | null
        }
        Update: {
          blockchain_tx_hash?: string | null
          commission_amount?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          payment_currency?: string
          price_per_token?: number | null
          quantity?: number | null
          status?: Database["public"]["Enums"]["transaction_status"]
          token_id?: string | null
          total_amount?: number
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
          world_id_nullifier?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "index_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      user_accounts: {
        Row: {
          created_at: string
          id: string
          total_deposited_usdc: number
          total_deposited_wld: number
          total_withdrawn_usdc: number
          total_withdrawn_wld: number
          updated_at: string
          usdc_balance: number
          user_id: string
          wld_balance: number
        }
        Insert: {
          created_at?: string
          id?: string
          total_deposited_usdc?: number
          total_deposited_wld?: number
          total_withdrawn_usdc?: number
          total_withdrawn_wld?: number
          updated_at?: string
          usdc_balance?: number
          user_id: string
          wld_balance?: number
        }
        Update: {
          created_at?: string
          id?: string
          total_deposited_usdc?: number
          total_deposited_wld?: number
          total_withdrawn_usdc?: number
          total_withdrawn_wld?: number
          updated_at?: string
          usdc_balance?: number
          user_id?: string
          wld_balance?: number
        }
        Relationships: []
      }
      user_portfolios: {
        Row: {
          average_buy_price: number
          created_at: string
          id: string
          quantity: number
          realized_pnl: number
          token_id: string
          total_invested: number
          updated_at: string
          user_id: string
        }
        Insert: {
          average_buy_price?: number
          created_at?: string
          id?: string
          quantity?: number
          realized_pnl?: number
          token_id: string
          total_invested?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          average_buy_price?: number
          created_at?: string
          id?: string
          quantity?: number
          realized_pnl?: number
          token_id?: string
          total_invested?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_portfolios_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "index_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      index_type: "SP500" | "NASDAQ" | "DOW" | "FTSE" | "NIKKEI" | "DAX"
      transaction_status: "pending" | "completed" | "failed" | "cancelled"
      transaction_type: "deposit" | "withdrawal" | "buy" | "sell"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      index_type: ["SP500", "NASDAQ", "DOW", "FTSE", "NIKKEI", "DAX"],
      transaction_status: ["pending", "completed", "failed", "cancelled"],
      transaction_type: ["deposit", "withdrawal", "buy", "sell"],
    },
  },
} as const
