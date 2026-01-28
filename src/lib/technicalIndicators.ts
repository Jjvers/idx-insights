import type { OHLC, TechnicalIndicators, MACDResult, BollingerBands } from '@/types/gold';

// Simple Moving Average
export function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0;
  const slice = prices.slice(-period);
  return slice.reduce((sum, p) => sum + p, 0) / period;
}

// Exponential Moving Average
export function calculateEMA(prices: number[], period: number): number {
  if (prices.length === 0) return 0;
  if (prices.length < period) return calculateSMA(prices, prices.length);
  
  const multiplier = 2 / (period + 1);
  let ema = calculateSMA(prices.slice(0, period), period);
  
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }
  
  return ema;
}

// RSI (Relative Strength Index)
export function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50;
  
  const changes = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }
  
  const recentChanges = changes.slice(-period);
  let gains = 0;
  let losses = 0;
  
  recentChanges.forEach(change => {
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  });
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

// MACD (Moving Average Convergence Divergence)
export function calculateMACD(prices: number[]): MACDResult {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macd = ema12 - ema26;
  
  // Signal line is 9-period EMA of MACD
  const macdHistory = [];
  for (let i = 26; i <= prices.length; i++) {
    const slice = prices.slice(0, i);
    const e12 = calculateEMA(slice, 12);
    const e26 = calculateEMA(slice, 26);
    macdHistory.push(e12 - e26);
  }
  
  const signal = calculateEMA(macdHistory, 9);
  const histogram = macd - signal;
  
  return { macd, signal, histogram };
}

// Bollinger Bands
export function calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2): BollingerBands {
  const sma = calculateSMA(prices, period);
  const slice = prices.slice(-period);
  
  const squaredDiffs = slice.map(p => Math.pow(p - sma, 2));
  const variance = squaredDiffs.reduce((sum, d) => sum + d, 0) / period;
  const std = Math.sqrt(variance);
  
  return {
    upper: sma + (stdDev * std),
    middle: sma,
    lower: sma - (stdDev * std)
  };
}

// Average True Range (ATR)
export function calculateATR(ohlc: OHLC[], period: number = 14): number {
  if (ohlc.length < 2) return 0;
  
  const trueRanges = [];
  for (let i = 1; i < ohlc.length; i++) {
    const current = ohlc[i];
    const previous = ohlc[i - 1];
    
    const tr = Math.max(
      current.high - current.low,
      Math.abs(current.high - previous.close),
      Math.abs(current.low - previous.close)
    );
    trueRanges.push(tr);
  }
  
  return calculateSMA(trueRanges.slice(-period), period);
}

// Average Directional Index (ADX) - simplified
export function calculateADX(ohlc: OHLC[], period: number = 14): number {
  if (ohlc.length < period + 1) return 25;
  
  // Simplified ADX calculation
  const prices = ohlc.map(d => d.close);
  const highs = ohlc.map(d => d.high);
  const lows = ohlc.map(d => d.low);
  
  let plusDM = 0;
  let minusDM = 0;
  
  for (let i = 1; i < Math.min(period + 1, ohlc.length); i++) {
    const upMove = highs[i] - highs[i - 1];
    const downMove = lows[i - 1] - lows[i];
    
    if (upMove > downMove && upMove > 0) plusDM += upMove;
    if (downMove > upMove && downMove > 0) minusDM += downMove;
  }
  
  const atr = calculateATR(ohlc.slice(-period - 1), period);
  if (atr === 0) return 25;
  
  const plusDI = (plusDM / atr) * 100;
  const minusDI = (minusDM / atr) * 100;
  const diSum = plusDI + minusDI;
  
  if (diSum === 0) return 25;
  
  return Math.abs(plusDI - minusDI) / diSum * 100;
}

// Calculate all technical indicators
export function calculateAllIndicators(ohlc: OHLC[]): TechnicalIndicators {
  const closes = ohlc.map(d => d.close);
  
  return {
    rsi: calculateRSI(closes),
    macd: calculateMACD(closes),
    sma20: calculateSMA(closes, 20),
    sma50: calculateSMA(closes, 50),
    sma200: calculateSMA(closes, 200),
    ema12: calculateEMA(closes, 12),
    ema26: calculateEMA(closes, 26),
    bollingerBands: calculateBollingerBands(closes),
    atr: calculateATR(ohlc),
    adx: calculateADX(ohlc)
  };
}

// Generate signal based on indicators
export function generateSignal(indicators: TechnicalIndicators, currentPrice: number): {
  signal: 'Strong Buy' | 'Buy' | 'Neutral' | 'Sell' | 'Strong Sell';
  score: number;
  reasons: string[];
} {
  let score = 50;
  const reasons: string[] = [];
  
  // RSI analysis
  if (indicators.rsi < 30) {
    score += 15;
    reasons.push('RSI oversold (<30) - bullish reversal potential');
  } else if (indicators.rsi > 70) {
    score -= 15;
    reasons.push('RSI overbought (>70) - bearish reversal potential');
  } else if (indicators.rsi < 45) {
    score += 5;
    reasons.push('RSI in lower range - mild bullish');
  } else if (indicators.rsi > 55) {
    score -= 5;
    reasons.push('RSI in upper range - mild bearish');
  }
  
  // MACD analysis
  if (indicators.macd.histogram > 0 && indicators.macd.macd > indicators.macd.signal) {
    score += 10;
    reasons.push('MACD bullish crossover');
  } else if (indicators.macd.histogram < 0 && indicators.macd.macd < indicators.macd.signal) {
    score -= 10;
    reasons.push('MACD bearish crossover');
  }
  
  // Moving average analysis
  if (currentPrice > indicators.sma20 && currentPrice > indicators.sma50) {
    score += 10;
    reasons.push('Price above SMA20 & SMA50 - uptrend');
  } else if (currentPrice < indicators.sma20 && currentPrice < indicators.sma50) {
    score -= 10;
    reasons.push('Price below SMA20 & SMA50 - downtrend');
  }
  
  // Golden/Death cross
  if (indicators.sma50 > indicators.sma200) {
    score += 5;
    reasons.push('Golden cross (SMA50 > SMA200) - long-term bullish');
  } else if (indicators.sma50 < indicators.sma200) {
    score -= 5;
    reasons.push('Death cross (SMA50 < SMA200) - long-term bearish');
  }
  
  // Bollinger Bands
  if (currentPrice <= indicators.bollingerBands.lower) {
    score += 10;
    reasons.push('Price at lower Bollinger Band - oversold');
  } else if (currentPrice >= indicators.bollingerBands.upper) {
    score -= 10;
    reasons.push('Price at upper Bollinger Band - overbought');
  }
  
  // ADX (trend strength)
  if (indicators.adx > 25) {
    reasons.push(`Strong trend detected (ADX: ${indicators.adx.toFixed(1)})`);
  } else {
    reasons.push('Weak trend / consolidation phase');
  }
  
  // Clamp score
  score = Math.max(0, Math.min(100, score));
  
  // Determine signal
  let signal: 'Strong Buy' | 'Buy' | 'Neutral' | 'Sell' | 'Strong Sell';
  if (score >= 70) signal = 'Strong Buy';
  else if (score >= 55) signal = 'Buy';
  else if (score >= 45) signal = 'Neutral';
  else if (score >= 30) signal = 'Sell';
  else signal = 'Strong Sell';
  
  return { signal, score, reasons };
}

// Calculate support and resistance levels
export function calculateKeyLevels(ohlc: OHLC[]): { support: number[]; resistance: number[] } {
  if (ohlc.length < 10) {
    const current = ohlc[ohlc.length - 1]?.close || 2000;
    return {
      support: [current * 0.98, current * 0.95],
      resistance: [current * 1.02, current * 1.05]
    };
  }
  
  const highs = ohlc.map(d => d.high);
  const lows = ohlc.map(d => d.low);
  const closes = ohlc.map(d => d.close);
  
  // Find local maxima and minima
  const resistanceLevels: number[] = [];
  const supportLevels: number[] = [];
  
  for (let i = 2; i < ohlc.length - 2; i++) {
    // Local high
    if (highs[i] > highs[i-1] && highs[i] > highs[i-2] && 
        highs[i] > highs[i+1] && highs[i] > highs[i+2]) {
      resistanceLevels.push(highs[i]);
    }
    // Local low
    if (lows[i] < lows[i-1] && lows[i] < lows[i-2] && 
        lows[i] < lows[i+1] && lows[i] < lows[i+2]) {
      supportLevels.push(lows[i]);
    }
  }
  
  // Get unique levels sorted by proximity to current price
  const currentPrice = closes[closes.length - 1];
  
  const uniqueResistance = [...new Set(resistanceLevels)]
    .filter(r => r > currentPrice)
    .sort((a, b) => a - b)
    .slice(0, 3);
    
  const uniqueSupport = [...new Set(supportLevels)]
    .filter(s => s < currentPrice)
    .sort((a, b) => b - a)
    .slice(0, 3);
  
  // Fallback if not enough levels found
  if (uniqueResistance.length < 2) {
    uniqueResistance.push(currentPrice * 1.02, currentPrice * 1.05);
  }
  if (uniqueSupport.length < 2) {
    uniqueSupport.push(currentPrice * 0.98, currentPrice * 0.95);
  }
  
  return {
    support: uniqueSupport.slice(0, 3),
    resistance: uniqueResistance.slice(0, 3)
  };
}
