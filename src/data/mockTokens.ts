
import { IndexToken } from '@/types/tokens'

export const indexTokens: IndexToken[] = [
  {
    id: 'sp500-token',
    name: 'Ahorro S&P 500 🇺🇸',
    symbol: 'SPY',
    currentPrice: 8.50,
    change24h: 0.25,
    changePercent24h: 3.03,
    marketCap: 15000000000,
    description: '¡Invierte como Warren Buffett! 📈 Este token te permite ahorrar siguiendo las 500 empresas más grandes de Estados Unidos. Es como comprar un pedacito de Apple, Microsoft y Google al mismo tiempo. Perfecto para empezar a ahorrar de forma inteligente.',
    indexType: 'SP500'
  },
  {
    id: 'nasdaq-token',
    name: 'Ahorro Tecnológico NASDAQ 💻',
    symbol: 'QQQ',
    currentPrice: 6.90,
    change24h: -0.15,
    changePercent24h: -2.13,
    marketCap: 12000000000,
    description: '¡El futuro en tus manos! 🚀 Invierte en las empresas tecnológicas más innovadoras como Tesla, Amazon y Netflix. Ideal si crees que la tecnología seguirá cambiando el mundo. Tu dinero crece con la innovación.',
    indexType: 'NASDAQ'
  },
  {
    id: 'dow-token',
    name: 'Ahorro Clásico Dow Jones 🏛️',
    symbol: 'DIA',
    currentPrice: 4.75,
    change24h: 0.12,
    changePercent24h: 2.59,
    marketCap: 8000000000,
    description: 'La tradición que funciona 💼 Invierte en las 30 empresas más estables y confiables de Estados Unidos. Como Coca-Cola, McDonald\'s y Disney. Perfecto para quienes buscan estabilidad y crecimiento constante.',
    indexType: 'DOW'
  },
  {
    id: 'ftse-token',
    name: 'Ahorro Británico FTSE 🇬🇧',
    symbol: 'FTSE',
    currentPrice: 5.40,
    change24h: 0.08,
    changePercent24h: 1.51,
    marketCap: 5000000000,
    description: 'Elegancia británica en inversiones ☕ Diversifica tu ahorro con las mejores empresas del Reino Unido. Desde bancos hasta empresas de lujo, una forma elegante de hacer crecer tu dinero globalmente.',
    indexType: 'FTSE'
  },
  {
    id: 'nikkei-token',
    name: 'Ahorro Japonés Nikkei 🇯🇵',
    symbol: 'NIK',
    currentPrice: 7.60,
    change24h: -0.05,
    changePercent24h: -0.65,
    marketCap: 4500000000,
    description: 'Innovación y disciplina japonesa 🎯 Invierte en gigantes como Toyota, Sony y Nintendo. Japón combina tradición con tecnología de punta. Una excelente forma de diversificar hacia Asia.',
    indexType: 'NIKKEI'
  },
  {
    id: 'dax-token',
    name: 'Ahorro Alemán DAX 🇩🇪',
    symbol: 'DAX',
    currentPrice: 3.30,
    change24h: 0.18,
    changePercent24h: 5.77,
    marketCap: 3500000000,
    description: 'Ingeniería alemana para tu dinero ⚙️ Invierte en la precisión y calidad alemana con empresas como BMW, SAP y Adidas. Alemania es sinónimo de calidad y eficiencia. ¡Tu ahorro en buenas manos!',
    indexType: 'DAX'
  }
]
