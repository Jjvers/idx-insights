import type { 
  GoldPrice, 
  OHLC, 
  FundamentalIndicators, 
  ExpertAnalysis, 
  EconomicEvent,
  GoldInstrument,
  CorrelatedAsset
} from '@/types/gold';

// Generate realistic OHLC data for the past N days
function generateOHLC(basePrice: number, days: number, volatility: number = 0.015): OHLC[] {
  const data: OHLC[] = [];
  let price = basePrice;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
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

// XAG/USD - Spot Silver (USD per troy ounce)
export const xagUsdData: OHLC[] = generateOHLC(30, 90, 0.018);

// Current prices (will be overridden by live API data)
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
  'XAG/USD': {
    instrument: 'XAG/USD',
    price: xagUsdData[xagUsdData.length - 1].close,
    change: xagUsdData[xagUsdData.length - 1].close - xagUsdData[xagUsdData.length - 2].close,
    changePercent: ((xagUsdData[xagUsdData.length - 1].close - xagUsdData[xagUsdData.length - 2].close) / xagUsdData[xagUsdData.length - 2].close) * 100,
    high: xagUsdData[xagUsdData.length - 1].high,
    low: xagUsdData[xagUsdData.length - 1].low,
    open: xagUsdData[xagUsdData.length - 1].open,
    volume: xagUsdData[xagUsdData.length - 1].volume,
    timestamp: new Date()
  }
};

// Scale OHLC data so the last candle's close matches live price
export function getOHLCData(instrument: GoldInstrument, livePrice?: number): OHLC[] {
  const raw = instrument === 'XAU/USD' ? xauUsdData : xagUsdData;
  if (!livePrice) return raw;
  
  const lastClose = raw[raw.length - 1].close;
  const scale = livePrice / lastClose;
  
  return raw.map(candle => ({
    date: candle.date,
    open: candle.open * scale,
    high: candle.high * scale,
    low: candle.low * scale,
    close: candle.close * scale,
    volume: candle.volume
  }));
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
    instrument: 'XAG/USD',
    signal: 'Buy',
    targetPrice: 35,
    timeframe: '1M',
    analysis: 'Silver is undervalued relative to gold with the ratio above 85. Industrial demand from solar panels and EVs provides additional tailwind beyond monetary demand.',
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    accuracy: 75
  },
  {
    id: '4',
    expertName: 'Keith Neumeyer',
    expertTitle: 'CEO, First Majestic Silver',
    instrument: 'XAG/USD',
    signal: 'Strong Buy',
    targetPrice: 40,
    stopLoss: 28,
    timeframe: '3M',
    analysis: 'Silver supply deficit continues to widen. Mine production is declining while industrial and investment demand accelerates. The gold-silver ratio suggests silver could outperform.',
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
export type NewsCategory = 'Market' | 'Geopolitical' | 'Macro' | 'Demand';

export interface GoldNews {
  id: string;
  title: string;
  summary: string;
  source: string;
  sentiment: NewsSentimentType;
  impact: 'High' | 'Medium' | 'Low';
  publishedAt: Date;
  category?: NewsCategory;
}

export const mockNews: GoldNews[] = [
  {
    id: '1',
    title: 'Fed Signals Potential Rate Cuts in Coming Months',
    summary: 'Federal Reserve officials hinted at easing monetary policy as inflation shows signs of cooling, boosting gold demand as a hedge against lower yields.',
    source: 'Reuters',
    sentiment: 'Bullish',
    impact: 'High',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    category: 'Macro'
  },
  {
    id: '2',
    title: 'Central Banks Continue Record Gold Purchases in Q1',
    summary: 'Global central banks added 290 tonnes of gold to reserves in Q1, led by China and India, marking the strongest first quarter on record.',
    source: 'World Gold Council',
    sentiment: 'Bullish',
    impact: 'High',
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    category: 'Demand'
  },
  {
    id: '3',
    title: 'US Dollar Strengthens After Strong Jobs Report',
    summary: 'The US Dollar Index rose 0.5% following better-than-expected employment data, creating headwinds for gold prices.',
    source: 'Bloomberg',
    sentiment: 'Bearish',
    impact: 'High',
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    category: 'Macro'
  },
  {
    id: '4',
    title: 'Gold ETF Inflows Hit 3-Month High',
    summary: 'Physically-backed gold ETFs recorded significant inflows this week as investors seek safe-haven assets amid geopolitical uncertainties.',
    source: 'Financial Times',
    sentiment: 'Bullish',
    impact: 'Medium',
    publishedAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000),
    category: 'Demand'
  },
  {
    id: '5',
    title: 'Rising Treasury Yields Pressure Gold',
    summary: 'US 10-year Treasury yields climbed to 4.5%, increasing the opportunity cost of holding non-yielding gold.',
    source: 'CNBC',
    sentiment: 'Bearish',
    impact: 'Medium',
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    category: 'Macro'
  },
  {
    id: '6',
    title: 'Geopolitical Tensions Boost Safe-Haven Demand',
    summary: 'Escalating tensions in the Middle East drive investors toward gold as a safe-haven asset, supporting prices near all-time highs.',
    source: 'Al Jazeera',
    sentiment: 'Bullish',
    impact: 'Medium',
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    category: 'Geopolitical'
  },
  {
    id: '7',
    title: 'India Gold Demand Flat Amid High Prices',
    summary: 'Physical gold demand in India, the world\'s second largest consumer, remains subdued as record prices deter retail buyers.',
    source: 'Economic Times',
    sentiment: 'Neutral',
    impact: 'Low',
    publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    category: 'Demand'
  },
  {
    id: '8',
    title: 'Mining Costs Rise as New Discoveries Slow',
    summary: 'All-in sustaining costs for gold miners have increased 8% year-over-year, providing a higher floor for gold prices.',
    source: 'Mining Journal',
    sentiment: 'Bullish',
    impact: 'Low',
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    category: 'Market'
  }
];

// Geopolitical News
export const geopoliticalNews: GoldNews[] = [
  {
    id: 'geo1',
    title: 'Middle East Tensions Escalate: Iran-Israel Proxy Conflict Intensifies',
    summary: 'Escalating military confrontation between regional powers drives flight to safety. Gold historically rallies 3-5% during acute geopolitical crises as investors seek safe haven.',
    source: 'Al Jazeera',
    sentiment: 'Bullish',
    impact: 'High',
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    category: 'Geopolitical'
  },
  {
    id: 'geo2',
    title: 'US-China Trade War: New Tariffs on Tech Exports',
    summary: 'Fresh round of technology export restrictions rattles global supply chains. Trade uncertainty weakens risk assets and strengthens gold as a monetary hedge.',
    source: 'Reuters',
    sentiment: 'Bullish',
    impact: 'High',
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    category: 'Geopolitical'
  },
  {
    id: 'geo3',
    title: 'BRICS Nations Accelerate De-dollarization Push',
    summary: 'BRICS summit announces new bilateral trade settlement framework bypassing USD. Central banks increasing gold reserves as alternative to dollar-denominated assets.',
    source: 'Bloomberg',
    sentiment: 'Bullish',
    impact: 'High',
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    category: 'Geopolitical'
  },
  {
    id: 'geo4',
    title: 'NATO Expansion: Finland-Sweden Border Exercises Begin',
    summary: 'Increased military exercises near Russia\'s borders heighten geopolitical risk premium. Safe-haven flows moderately support gold prices.',
    source: 'BBC News',
    sentiment: 'Bullish',
    impact: 'Medium',
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    category: 'Geopolitical'
  },
  {
    id: 'geo5',
    title: 'Peace Talks Progress in Ukraine Conflict',
    summary: 'Diplomatic breakthroughs reduce geopolitical risk premium, potentially reducing safe-haven demand for gold in the short term.',
    source: 'Financial Times',
    sentiment: 'Bearish',
    impact: 'Medium',
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    category: 'Geopolitical'
  }
];

// Correlated commodities data
function generateCorrelatedPrices(base: number, days: number, vol: number): number[] {
  const prices: number[] = [];
  let p = base;
  for (let i = 0; i < days; i++) {
    p *= 1 + (Math.random() - 0.48) * vol;
    prices.push(p);
  }
  return prices;
}

export const correlatedAssets: CorrelatedAsset[] = [
  {
    symbol: 'XAG/USD',
    name: 'Silver (Spot)',
    price: 30.45,
    change: 0.38,
    changePercent: 1.26,
    correlation: 0.87,
    lagDays: -2,
    lagDescription: 'Leads gold by ~2 days',
    reasoning: 'Silver sering bergerak duluan (leading indicator) karena pasar silver lebih kecil dan lebih volatile. Ketika silver breakout, gold biasanya menyusul 1-3 hari kemudian. Gold-Silver Ratio saat ini di 87.5 — di atas rata-rata historis 80, menunjukkan silver undervalued relatif terhadap gold.',
    recentPrices: generateCorrelatedPrices(29.5, 30, 0.02)
  },
  {
    symbol: 'HG',
    name: 'Copper (COMEX)',
    price: 4.32,
    change: -0.05,
    changePercent: -1.15,
    correlation: 0.62,
    lagDays: -5,
    lagDescription: 'Leads gold by ~5 days',
    reasoning: 'Copper dikenal sebagai "Dr. Copper" karena kemampuannya memprediksi kondisi ekonomi global. Ketika copper naik, ini sinyal ekonomi membaik → risk-on → gold bisa melemah. Sebaliknya, copper jatuh = fear → gold rally. Copper saat ini turun 1.15%, ini bisa jadi early warning untuk gold rally dalam 3-7 hari ke depan.',
    recentPrices: generateCorrelatedPrices(4.2, 30, 0.025)
  },
  {
    symbol: 'DXY',
    name: 'US Dollar Index',
    price: 103.45,
    change: -0.32,
    changePercent: -0.31,
    correlation: -0.82,
    lagDays: 0,
    lagDescription: 'Inverse correlation (real-time)',
    reasoning: 'DXY dan gold memiliki korelasi negatif kuat (-0.82). Dollar melemah = gold menguat karena gold dihargai dalam USD. DXY turun 0.31% hari ini — ini BULLISH untuk gold. Perhatikan level DXY 103.0 sebagai support kunci: jika tembus, gold bisa rally tajam.',
    recentPrices: generateCorrelatedPrices(104.0, 30, 0.005)
  },
  {
    symbol: 'UST10Y',
    name: '10-Year Treasury Yield',
    price: 4.35,
    change: 0.03,
    changePercent: 0.69,
    correlation: -0.65,
    lagDays: 1,
    lagDescription: 'Leads gold by ~1 day',
    reasoning: 'Yield naik = opportunity cost memegang gold lebih tinggi → bearish gold. Namun, jika yield naik karena inflasi (bukan growth), gold tetap bisa naik. Saat ini real yield (10Y - CPI) = 1.45%, masih moderate. Watch for yield curve inversion as recession signal → bullish gold.',
    recentPrices: generateCorrelatedPrices(4.3, 30, 0.01)
  }
];