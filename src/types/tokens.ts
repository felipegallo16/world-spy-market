
export interface IndexToken {
  id: string
  name: string
  symbol: string
  currentPrice: number
  change24h: number
  changePercent24h: number
  marketCap: number
  description: string
  indexType: 'SP500' | 'NASDAQ' | 'DOW' | 'FTSE' | 'NIKKEI' | 'DAX'
}

export interface UserPortfolio {
  tokenId: string
  symbol: string
  amount: number
  averagePrice: number
  currentValue: number
  profitLoss: number
  profitLossPercent: number
}

export interface Transaction {
  id: string
  type: 'buy' | 'sell'
  tokenId: string
  symbol: string
  amount: number
  price: number
  total: number
  timestamp: Date
  status: 'pending' | 'completed' | 'failed'
}
