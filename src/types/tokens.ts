
export interface IndexToken {
  id: string
  symbol: string
  name: string
  description: string
  index_type: 'SP500' | 'NASDAQ' | 'DOW' | 'FTSE' | 'NIKKEI' | 'DAX'
  is_active: boolean
  created_at: string
  token_prices?: TokenPrice[]
}

export interface TokenPrice {
  id: string
  token_id: string
  price_usd: number
  change_24h: number
  change_percent_24h: number
  market_cap: number
  volume_24h: number
  updated_at: string
}

export interface UserAccount {
  id: string
  user_id: string
  wld_balance: number
  usdc_balance: number
  total_deposited_wld: number
  total_deposited_usdc: number
  total_withdrawn_wld: number
  total_withdrawn_usdc: number
  created_at: string
  updated_at: string
}

export interface UserPortfolio {
  id: string
  user_id: string
  token_id: string
  quantity: number
  average_buy_price: number
  total_invested: number
  realized_pnl: number
  created_at: string
  updated_at: string
  index_tokens?: IndexToken
  token_prices?: TokenPrice[]
}

export interface Transaction {
  id: string
  user_id: string
  transaction_type: 'deposit' | 'withdrawal' | 'buy' | 'sell'
  token_id?: string
  quantity?: number
  price_per_token?: number
  total_amount: number
  commission_amount: number
  payment_currency: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  world_id_nullifier?: string
  blockchain_tx_hash?: string
  created_at: string
  completed_at?: string
  metadata: Record<string, any>
  index_tokens?: IndexToken
}

export interface CommissionEarning {
  id: string
  transaction_id: string
  commission_amount: number
  commission_currency: string
  commission_rate: number
  earned_at: string
}
