import { StockData, WeightConfig } from '@/types/stock';

// Normalization helpers
function normalizeMinMax(value: number, min: number, max: number): number {
  if (max === min) return 0.5;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

function normalizeInverse(value: number, min: number, max: number): number {
  return 1 - normalizeMinMax(value, min, max);
}

// Calculate fundamental score based on metrics
export function calculateFundamentalScore(
  stock: Pick<StockData, 'der' | 'roe' | 'pbv' | 'pe' | 'eps'>,
  weights: WeightConfig,
  benchmarks: {
    derRange: [number, number];
    roeRange: [number, number];
    pbvRange: [number, number];
    peRange: [number, number];
  }
): number {
  const totalWeight = weights.safety + weights.growth + weights.value;
  if (totalWeight === 0) return 50;

  // DER: Lower is better (inverse normalization) - Safety metric
  const derScore = normalizeInverse(stock.der, benchmarks.derRange[0], benchmarks.derRange[1]) * 100;
  
  // ROE: Higher is better - Growth metric
  const roeScore = normalizeMinMax(stock.roe, benchmarks.roeRange[0], benchmarks.roeRange[1]) * 100;
  
  // PBV: Lower is better for value investing (inverse)
  const pbvScore = normalizeInverse(stock.pbv, benchmarks.pbvRange[0], benchmarks.pbvRange[1]) * 100;
  
  // P/E: Lower is better for value investing (inverse)
  const peScore = normalizeInverse(stock.pe, benchmarks.peRange[0], benchmarks.peRange[1]) * 100;

  // Weighted average based on user preferences
  const safetyComponent = derScore * (weights.safety / totalWeight);
  const growthComponent = roeScore * (weights.growth / totalWeight);
  const valueComponent = ((pbvScore + peScore) / 2) * (weights.value / totalWeight);

  return Math.round(safetyComponent + growthComponent + valueComponent);
}

// Calculate technical score based on volatility and momentum
export function calculateTechnicalScore(
  stock: Pick<StockData, 'volatility' | 'beta' | 'volume' | 'avgVolume' | 'changePercent'>,
  weights: WeightConfig,
  benchmarks: {
    volatilityRange: [number, number];
    betaRange: [number, number];
    volumeRange: [number, number];
  }
): number {
  const totalWeight = weights.safety + weights.momentum;
  if (totalWeight === 0) return 50;

  // Volatility: Lower is better for safety (inverse)
  const volatilityScore = normalizeInverse(stock.volatility, benchmarks.volatilityRange[0], benchmarks.volatilityRange[1]) * 100;
  
  // Beta: Closer to 1 is neutral, for safety lower is better
  const betaScore = normalizeInverse(stock.beta, benchmarks.betaRange[0], benchmarks.betaRange[1]) * 100;
  
  // Volume ratio: Higher relative volume indicates momentum
  const volumeRatio = stock.avgVolume > 0 ? stock.volume / stock.avgVolume : 1;
  const volumeScore = normalizeMinMax(volumeRatio, 0.5, 2) * 100;

  const safetyComponent = ((volatilityScore + betaScore) / 2) * (weights.safety / totalWeight);
  const momentumComponent = volumeScore * (weights.momentum / totalWeight);

  return Math.round(safetyComponent + momentumComponent);
}

// Determine valuation label based on PBV and P/E
export function getValuationLabel(pbv: number, pe: number): 'Cheap' | 'Fair' | 'Expensive' {
  const pbvThreshold = { cheap: 1.0, expensive: 3.0 };
  const peThreshold = { cheap: 10, expensive: 25 };

  let cheapCount = 0;
  let expensiveCount = 0;

  if (pbv < pbvThreshold.cheap) cheapCount++;
  else if (pbv > pbvThreshold.expensive) expensiveCount++;

  if (pe < peThreshold.cheap) cheapCount++;
  else if (pe > peThreshold.expensive) expensiveCount++;

  if (cheapCount >= 1 && expensiveCount === 0) return 'Cheap';
  if (expensiveCount >= 1 && cheapCount === 0) return 'Expensive';
  return 'Fair';
}

// Determine investment category based on volatility and volume
export function getInvestmentCategory(
  volatility: number,
  avgVolume: number,
  beta: number
): 'Long-term' | 'Swing Trade' | 'Daily Trade' {
  // High volatility + high volume = Day trading
  // Medium volatility = Swing trading
  // Low volatility + low beta = Long-term hold

  if (volatility > 3 && avgVolume > 10000000) return 'Daily Trade';
  if (volatility > 1.5 || beta > 1.3) return 'Swing Trade';
  return 'Long-term';
}

// Determine risk level
export function getRiskLevel(der: number, volatility: number, beta: number): 'Low' | 'Medium' | 'High' {
  let riskPoints = 0;

  if (der > 1.5) riskPoints += 2;
  else if (der > 0.8) riskPoints += 1;

  if (volatility > 3) riskPoints += 2;
  else if (volatility > 1.5) riskPoints += 1;

  if (beta > 1.5) riskPoints += 2;
  else if (beta > 1.2) riskPoints += 1;

  if (riskPoints >= 4) return 'High';
  if (riskPoints >= 2) return 'Medium';
  return 'Low';
}

// Calculate combined risk score (0-100, higher = riskier)
export function calculateRiskScore(der: number, volatility: number, beta: number): number {
  const derNorm = normalizeMinMax(der, 0, 3) * 40;
  const volNorm = normalizeMinMax(volatility, 0, 5) * 35;
  const betaNorm = normalizeMinMax(beta, 0.5, 2) * 25;
  
  return Math.round(derNorm + volNorm + betaNorm);
}

// Full stock scoring with all metrics
export function scoreStock(
  stock: Omit<StockData, 'fundamentalScore' | 'technicalScore' | 'overallScore' | 'valuationLabel' | 'investmentCategory' | 'riskLevel'>,
  weights: WeightConfig,
  benchmarks: {
    derRange: [number, number];
    roeRange: [number, number];
    pbvRange: [number, number];
    peRange: [number, number];
    volatilityRange: [number, number];
    betaRange: [number, number];
    volumeRange: [number, number];
  }
): StockData {
  const fundamentalScore = calculateFundamentalScore(stock, weights, benchmarks);
  const technicalScore = calculateTechnicalScore(stock, weights, benchmarks);
  
  // Overall score weighted 60% fundamental, 40% technical
  const overallScore = Math.round(fundamentalScore * 0.6 + technicalScore * 0.4);
  
  const valuationLabel = getValuationLabel(stock.pbv, stock.pe);
  const investmentCategory = getInvestmentCategory(stock.volatility, stock.avgVolume, stock.beta);
  const riskLevel = getRiskLevel(stock.der, stock.volatility, stock.beta);

  return {
    ...stock,
    fundamentalScore,
    technicalScore,
    overallScore,
    valuationLabel,
    investmentCategory,
    riskLevel,
  };
}
