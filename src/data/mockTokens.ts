
import { IndexToken } from '@/types/tokens'

export const indexTokens: IndexToken[] = [
  {
    id: 'sp500-token',
    name: 'S&P 500 Index Token',
    symbol: 'SPY',
    currentPrice: 425.50,
    change24h: 3.25,
    changePercent24h: 0.77,
    marketCap: 15000000000,
    description: 'Token that tracks the performance of the S&P 500 index',
    indexType: 'SP500'
  },
  {
    id: 'nasdaq-token',
    name: 'NASDAQ Index Token',
    symbol: 'QQQ',
    currentPrice: 378.90,
    change24h: -2.45,
    changePercent24h: -0.64,
    marketCap: 12000000000,
    description: 'Token that tracks the performance of the NASDAQ-100 index',
    indexType: 'NASDAQ'
  },
  {
    id: 'dow-token',
    name: 'Dow Jones Index Token',
    symbol: 'DIA',
    currentPrice: 342.75,
    change24h: 1.85,
    changePercent24h: 0.54,
    marketCap: 8000000000,
    description: 'Token that tracks the performance of the Dow Jones Industrial Average',
    indexType: 'DOW'
  },
  {
    id: 'ftse-token',
    name: 'FTSE 100 Index Token',
    symbol: 'FTSE',
    currentPrice: 285.40,
    change24h: 0.95,
    changePercent24h: 0.33,
    marketCap: 5000000000,
    description: 'Token that tracks the performance of the FTSE 100 index',
    indexType: 'FTSE'
  },
  {
    id: 'nikkei-token',
    name: 'Nikkei 225 Index Token',
    symbol: 'NIK',
    currentPrice: 298.60,
    change24h: -1.20,
    changePercent24h: -0.40,
    marketCap: 4500000000,
    description: 'Token that tracks the performance of the Nikkei 225 index',
    indexType: 'NIKKEI'
  },
  {
    id: 'dax-token',
    name: 'DAX Index Token',
    symbol: 'DAX',
    currentPrice: 195.30,
    change24h: 2.15,
    changePercent24h: 1.11,
    marketCap: 3500000000,
    description: 'Token that tracks the performance of the DAX index',
    indexType: 'DAX'
  }
]
