export interface StockData {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  
  // Fundamental metrics
  der: number;        // Debt to Equity Ratio
  roe: number;        // Return on Equity
  pbv: number;        // Price to Book Value
  pe: number;         // Price to Earnings
  eps: number;        // Earnings Per Share
  
  // Technical metrics
  beta: number;
  volatility: number;
  avgVolume: number;
  
  // Historical prices (1 month)
  historicalPrices: number[];
  
  // Computed scores (0-100)
  fundamentalScore: number;
  technicalScore: number;
  overallScore: number;
  
  // Labels
  valuationLabel: 'Cheap' | 'Fair' | 'Expensive';
  investmentCategory: 'Long-term' | 'Swing Trade' | 'Daily Trade';
  riskLevel: 'Low' | 'Medium' | 'High';
}

export interface WeightConfig {
  safety: number;     // Inverse of risk (DER, volatility)
  growth: number;     // ROE, EPS growth
  value: number;      // PBV, P/E ratios
  momentum: number;   // Price momentum, volume
}

export interface ScoringConfig {
  fundamentalWeight: number;
  technicalWeight: number;
}

export type SortField = 'ticker' | 'overallScore' | 'fundamentalScore' | 'technicalScore' | 'price' | 'change' | 'volume' | 'der' | 'roe' | 'pbv' | 'pe';
export type SortDirection = 'asc' | 'desc';

export interface FilterConfig {
  sector: string;
  valuationLabel: string;
  investmentCategory: string;
  riskLevel: string;
  minScore: number;
}
