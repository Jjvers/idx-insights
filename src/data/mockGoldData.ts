import type { 
  GoldPrice, 
  OHLC, 
  FundamentalIndicators, 
  ExpertAnalysis, 
  EconomicEvent,
  GoldInstrument 
} from '@/types/gold';

// Generate realistic OHLC data for the past N days
function generateOHLC(basePrice: number, days: number, volatility: number = 0.015): OHLC[] {
  const data: OHLC[] = [];
  let price = basePrice;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Add some trend + randomness
    const trend = Math.sin(i / 10) * 0.002;
    const change = (Math.random() - 0.5) * 2 * volatility + trend;
    price = price * (1 + change);
    
    const open = price * (1 + (Math.random() - 0.5) * 0.005);
    const close = price;
    const high = Math.max(open, close) * (1 + Math.random() * 0.008);
    const low = Math.min(open, close) * (1 - Math.random() * 0.008);
    const volume = Math.floor(50000 + Math.random() * 100000);
    
    data.push({ date, open, high, low, close, volume });
  }
  
  return data;
}

// XAU/USD - Spot Gold (USD per troy ounce)
export const xauUsdData: OHLC[] = generateOHLC(2650, 90, 0.012);

// Gold Futures (GC)
export const goldFuturesData: OHLC[] = generateOHLC(2670, 90, 0.013);

// Antam Gold (IDR per gram) - local Indonesian gold
export const antamData: OHLC[] = generateOHLC(1350000, 90, 0.008);

// Current prices
export const currentPrices: Record<GoldInstrument, GoldPrice> = {
  'XAU/USD': {
    instrument: 'XAU/USD',
    price: xauUsdData[xauUsdData.length - 1].close,
    change: xauUsdData[xauUsdData.length - 1].close - xauUsdData[xauUsdData.length - 2].close,
    changePercent: ((xauUsdData[xauUsdData.length - 1].close - xauUsdData[xauUsdData.length - 2].close) / xauUsdData[xauUsdData.length - 2].close) * 100,
    high: xauUsdData[xauUsdData.length - 1].high,
    low: xauUsdData[xauUsdData.length - 1].low,
    open: xauUsdData[xauUsdData.length - 1].open,
    volume: xauUsdData[xauUsdData.length - 1].volume,
    timestamp: new Date()
  },
  'GOLD_FUTURES': {
    instrument: 'GOLD_FUTURES',
    price: goldFuturesData[goldFuturesData.length - 1].close,
    change: goldFuturesData[goldFuturesData.length - 1].close - goldFuturesData[goldFuturesData.length - 2].close,
    changePercent: ((goldFuturesData[goldFuturesData.length - 1].close - goldFuturesData[goldFuturesData.length - 2].close) / goldFuturesData[goldFuturesData.length - 2].close) * 100,
    high: goldFuturesData[goldFuturesData.length - 1].high,
    low: goldFuturesData[goldFuturesData.length - 1].low,
    open: goldFuturesData[goldFuturesData.length - 1].open,
    volume: goldFuturesData[goldFuturesData.length - 1].volume,
    timestamp: new Date()
  },
  'ANTAM': {
    instrument: 'ANTAM',
    price: antamData[antamData.length - 1].close,
    change: antamData[antamData.length - 1].close - antamData[antamData.length - 2].close,
    changePercent: ((antamData[antamData.length - 1].close - antamData[antamData.length - 2].close) / antamData[antamData.length - 2].close) * 100,
    high: antamData[antamData.length - 1].high,
    low: antamData[antamData.length - 1].low,
    open: antamData[antamData.length - 1].open,
    volume: antamData[antamData.length - 1].volume,
    timestamp: new Date()
  }
};

export function getOHLCData(instrument: GoldInstrument): OHLC[] {
  switch (instrument) {
    case 'XAU/USD': return xauUsdData;
    case 'GOLD_FUTURES': return goldFuturesData;
    case 'ANTAM': return antamData;
  }
}

// Fundamental indicators (macro data)
export const fundamentalIndicators: FundamentalIndicators = {
  usdIndex: 103.45,
  usdIndexChange: -0.32,
  fedFundsRate: 4.50,
  realYield: 1.85,
  inflation: 2.9,
  goldSilverRatio: 87.5,
  vix: 18.75
};

// Expert analyses
export const expertAnalyses: ExpertAnalysis[] = [
  {
    id: '1',
    expertName: 'Peter Schiff',
    expertTitle: 'CEO, Euro Pacific Capital',
    instrument: 'XAU/USD',
    signal: 'Strong Buy',
    targetPrice: 3000,
    stopLoss: 2500,
    timeframe: '3M',
    analysis: 'Gold is poised for a major breakout as the Fed pivots to rate cuts. Inflation remains sticky, and central bank buying continues at record levels. The path to $3,000 is clear.',
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    accuracy: 72
  },
  {
    id: '2',
    expertName: 'Jan Nieuwenhuijs',
    expertTitle: 'Precious Metals Analyst',
    instrument: 'XAU/USD',
    signal: 'Buy',
    targetPrice: 2850,
    stopLoss: 2550,
    timeframe: '1M',
    analysis: 'Technical setup is bullish with price holding above the 50-day MA. BRICS nations continue diversifying away from USD, providing fundamental support.',
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    accuracy: 68
  },
  {
    id: '3',
    expertName: 'Nicky Shiels',
    expertTitle: 'Head of Metals Strategy, MKS PAMP',
    instrument: 'GOLD_FUTURES',
    signal: 'Neutral',
    targetPrice: 2700,
    timeframe: '1W',
    analysis: 'Short-term consolidation expected after the recent rally. Wait for a pullback to $2,600 support before adding positions. Geopolitical risks remain elevated.',
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    accuracy: 75
  },
  {
    id: '4',
    expertName: 'Ahmad Wijaya',
    expertTitle: 'Senior Analyst, PT Antam',
    instrument: 'ANTAM',
    signal: 'Buy',
    targetPrice: 1450000,
    stopLoss: 1280000,
    timeframe: '1M',
    analysis: 'Harga emas Antam diperkirakan terus menguat seiring pelemahan Rupiah dan tingginya permintaan domestik menjelang musim pernikahan.',
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    accuracy: 70
  }
];

// Economic calendar
export const economicEvents: EconomicEvent[] = [
  {
    id: '1',
    title: 'FOMC Meeting Minutes',
    type: 'Fed Meeting',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    time: '19:00 WIB',
    country: 'US',
    impact: 'High',
    description: 'Federal Reserve meeting minutes release. Key for understanding rate path.'
  },
  {
    id: '2',
    title: 'US CPI (YoY)',
    type: 'CPI Release',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    time: '20:30 WIB',
    country: 'US',
    impact: 'High',
    previous: '2.9%',
    forecast: '2.8%',
    description: 'Consumer Price Index - major inflation indicator affecting gold prices.'
  },
  {
    id: '3',
    title: 'Non-Farm Payrolls',
    type: 'NFP',
    date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    time: '20:30 WIB',
    country: 'US',
    impact: 'High',
    previous: '256K',
    forecast: '180K',
    description: 'US employment data. Strong jobs = hawkish Fed = bearish gold.'
  },
  {
    id: '4',
    title: 'ECB Interest Rate Decision',
    type: 'Other',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    time: '20:15 WIB',
    country: 'EU',
    impact: 'Medium',
    previous: '3.00%',
    forecast: '2.75%',
    description: 'European Central Bank rate decision. Affects EUR/USD and gold.'
  },
  {
    id: '5',
    title: 'US GDP (QoQ)',
    type: 'GDP',
    date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    time: '20:30 WIB',
    country: 'US',
    impact: 'Medium',
    previous: '3.1%',
    forecast: '2.8%',
    description: 'Gross Domestic Product quarterly growth rate.'
  },
  {
    id: '6',
    title: 'China Manufacturing PMI',
    type: 'PMI',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    time: '08:30 WIB',
    country: 'CN',
    impact: 'Medium',
    previous: '50.1',
    forecast: '50.3',
    description: 'China factory activity. Major gold consumer, affects demand outlook.'
  }
];

// News & Sentiment data
export type NewsSentimentType = 'Bullish' | 'Bearish' | 'Neutral';

export interface GoldNews {
  id: string;
  title: string;
  summary: string;
  source: string;
  sentiment: NewsSentimentType;
  impact: 'High' | 'Medium' | 'Low';
  publishedAt: Date;
}

export const mockNews: GoldNews[] = [
  {
    id: '1',
    title: 'Fed Signals Potential Rate Cuts in Coming Months',
    summary: 'Federal Reserve officials hinted at easing monetary policy as inflation shows signs of cooling, boosting gold demand as a hedge against lower yields.',
    source: 'Reuters',
    sentiment: 'Bullish',
    impact: 'High',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: '2',
    title: 'Central Banks Continue Record Gold Purchases in Q1',
    summary: 'Global central banks added 290 tonnes of gold to reserves in Q1, led by China and India, marking the strongest first quarter on record.',
    source: 'World Gold Council',
    sentiment: 'Bullish',
    impact: 'High',
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000)
  },
  {
    id: '3',
    title: 'US Dollar Strengthens After Strong Jobs Report',
    summary: 'The US Dollar Index rose 0.5% following better-than-expected employment data, creating headwinds for gold prices.',
    source: 'Bloomberg',
    sentiment: 'Bearish',
    impact: 'High',
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: '4',
    title: 'Gold ETF Inflows Hit 3-Month High',
    summary: 'Physically-backed gold ETFs recorded significant inflows this week as investors seek safe-haven assets amid geopolitical uncertainties.',
    source: 'Financial Times',
    sentiment: 'Bullish',
    impact: 'Medium',
    publishedAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000)
  },
  {
    id: '5',
    title: 'Rising Treasury Yields Pressure Gold',
    summary: 'US 10-year Treasury yields climbed to 4.5%, increasing the opportunity cost of holding non-yielding gold.',
    source: 'CNBC',
    sentiment: 'Bearish',
    impact: 'Medium',
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: '6',
    title: 'Geopolitical Tensions Boost Safe-Haven Demand',
    summary: 'Escalating tensions in the Middle East drive investors toward gold as a safe-haven asset, supporting prices near all-time highs.',
    source: 'Al Jazeera',
    sentiment: 'Bullish',
    impact: 'Medium',
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    id: '7',
    title: 'India Gold Demand Flat Amid High Prices',
    summary: 'Physical gold demand in India, the world\'s second largest consumer, remains subdued as record prices deter retail buyers.',
    source: 'Economic Times',
    sentiment: 'Neutral',
    impact: 'Low',
    publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
  },
  {
    id: '8',
    title: 'Mining Costs Rise as New Discoveries Slow',
    summary: 'All-in sustaining costs for gold miners have increased 8% year-over-year, providing a higher floor for gold prices.',
    source: 'Mining Journal',
    sentiment: 'Bullish',
    impact: 'Low',
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  }
];
