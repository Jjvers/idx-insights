import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { GoldInstrument, Timeframe, PredictionScenario } from '@/types/gold';
import { useGoldPrediction } from '@/hooks/useGoldPrediction';
import { 
  TrendingUp, TrendingDown, Minus, Brain, 
  Target, AlertTriangle, CheckCircle2, Loader2, RefreshCw,
  ArrowUpRight, ArrowDownRight, Shield, Crosshair, Zap,
  BarChart3, Activity, Layers, Info, ArrowRightLeft, GitBranch
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PredictionPanelProps {
  instrument: GoldInstrument;
  timeframe: Timeframe;
}

const signalStyles = {
  'Strong Buy': { bg: 'bg-gain', text: 'text-gain-foreground', icon: TrendingUp, gradient: 'from-gain to-gain/80' },
  'Buy': { bg: 'bg-gain/80', text: 'text-gain-foreground', icon: TrendingUp, gradient: 'from-gain/80 to-gain/60' },
  'Neutral': { bg: 'bg-muted', text: 'text-muted-foreground', icon: Minus, gradient: 'from-muted to-muted/80' },
  'Sell': { bg: 'bg-loss/80', text: 'text-loss-foreground', icon: TrendingDown, gradient: 'from-loss/80 to-loss/60' },
  'Strong Sell': { bg: 'bg-loss', text: 'text-loss-foreground', icon: TrendingDown, gradient: 'from-loss to-loss/80' }
};

const formatPrice = (price: number, _instrument: GoldInstrument): string => {
  return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

function ScoreBar({ label, score, icon: Icon }: { label: string; score: number; icon?: React.ElementType }) {
  const getScoreColor = (s: number) => {
    if (s >= 70) return 'bg-gain';
    if (s >= 50) return 'bg-accent';
    if (s >= 30) return 'bg-yellow-500';
    return 'bg-loss';
  };

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-1.5">
          {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
          <span className="text-muted-foreground">{label}</span>
        </div>
        <span className="font-mono text-foreground font-medium">{score}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${getScoreColor(score)} transition-all duration-500`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function ScenarioCard({ scenario, instrument, index }: { scenario: PredictionScenario; instrument: GoldInstrument; index: number }) {
  const isBullish = scenario.name.toLowerCase().includes('bull') || scenario.name.toLowerCase().includes('accumul');
  const riskColors = {
    Low: 'bg-gain/10 text-gain border-gain/30',
    Medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
    High: 'bg-loss/10 text-loss border-loss/30'
  };

  return (
    <div className={`p-4 rounded-xl border ${isBullish ? 'border-gain/30 bg-gain/5' : 'border-loss/30 bg-loss/5'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isBullish ? 'bg-gain/20' : 'bg-loss/20'}`}>
            <span className="text-sm font-bold">{String.fromCharCode(65 + index)}</span>
          </div>
          <div>
            <h4 className={`text-sm font-bold ${isBullish ? 'text-gain' : 'text-loss'}`}>{scenario.name}</h4>
            <Badge variant="outline" className={riskColors[scenario.riskLevel]}>
              Risk: {scenario.riskLevel}
            </Badge>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-xl font-bold font-mono ${isBullish ? 'text-gain' : 'text-loss'}`}>
            {scenario.probability}%
          </p>
          <p className="text-[10px] text-muted-foreground">probability</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{scenario.description}</p>

      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">Target:</span>
        <span className={`font-mono text-sm font-medium ${isBullish ? 'text-gain' : 'text-loss'}`}>
          {formatPrice(scenario.priceTarget, instrument)}
        </span>
      </div>

      <div className="space-y-1">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Triggers:</span>
        {scenario.triggers.map((t, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${isBullish ? 'bg-gain' : 'bg-loss'}`} />
            <span className="text-xs text-muted-foreground">{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function IndicatorReasoningCard({ icon: Icon, label, reasoning, color }: { 
  icon: React.ElementType; label: string; reasoning: string; color: string 
}) {
  return (
    <div className="p-3 rounded-lg bg-muted/30 border border-border">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-xs font-semibold text-foreground">{label}</span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{reasoning}</p>
    </div>
  );
}

export function PredictionPanel({ instrument, timeframe }: PredictionPanelProps) {
  const { prediction, isLoading, error, generatePrediction } = useGoldPrediction(instrument, timeframe);

  if (!prediction && !isLoading) {
    return (
      <Card className="col-span-full border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full" />
            <div className="relative p-4 bg-card border border-border rounded-full">
              <Brain className="h-12 w-12 text-accent" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">AI Prediction Engine</h3>
          <p className="text-sm text-muted-foreground text-center mb-6 max-w-lg">
            Generate AI predictions with per-indicator reasoning, scenario analysis (A/B options), 
            gap detection, and correlated asset signals.
          </p>
          <Button onClick={generatePrediction} size="lg" className="gap-2">
            <Zap className="h-4 w-4" />
            Generate {timeframe} Prediction for {instrument}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-accent" />
            Analyzing {instrument}...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" />
          </div>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="col-span-full border-destructive/50">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <p className="text-destructive font-medium mb-2">Prediction Failed</p>
          <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">{error}</p>
          <Button onClick={generatePrediction} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!prediction) return null;

  const SignalIcon = signalStyles[prediction.signal].icon;
  const isPositive = prediction.predictedChange >= 0;
  const avgScore = (prediction.technicalScore + prediction.fundamentalScore + prediction.sentimentScore) / 3;
  const bullishProb = Math.round(Math.min(Math.max(avgScore, 5), 95));
  const bearishProb = 100 - bullishProb;

  return (
    <Card className="col-span-full border-accent/30 shadow-glow-accent">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-accent/20">
              <Brain className="h-5 w-5 text-accent" />
            </div>
            AI Prediction
            <Badge variant="outline" className="ml-2">{timeframe}</Badge>
          </CardTitle>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(prediction.generatedAt, { addSuffix: true })}
            </span>
            <Button variant="ghost" size="sm" onClick={generatePrediction} disabled={isLoading} className="h-8">
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Probability Bar */}
        <div className="mb-6 p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-foreground">Probability Analysis</h4>
            <Badge className={bullishProb > 50 ? 'bg-gain text-gain-foreground' : 'bg-loss text-loss-foreground'}>
              {prediction.signal}
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center min-w-[60px]">
              <TrendingDown className="h-5 w-5 text-loss mx-auto mb-1" />
              <p className="text-xl font-bold font-mono text-loss">{bearishProb}%</p>
              <p className="text-[10px] text-muted-foreground">Bearish</p>
            </div>
            <div className="flex-1">
              <div className="h-4 rounded-full overflow-hidden flex bg-muted">
                <div className="bg-loss h-full transition-all duration-700 rounded-l-full" style={{ width: `${bearishProb}%` }} />
                <div className="bg-gain h-full transition-all duration-700 rounded-r-full" style={{ width: `${bullishProb}%` }} />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-muted-foreground">Sell Zone</span>
                <span className="text-[10px] text-muted-foreground">Neutral</span>
                <span className="text-[10px] text-muted-foreground">Buy Zone</span>
              </div>
            </div>
            <div className="text-center min-w-[60px]">
              <TrendingUp className="h-5 w-5 text-gain mx-auto mb-1" />
              <p className="text-xl font-bold font-mono text-gain">{bullishProb}%</p>
              <p className="text-[10px] text-muted-foreground">Bullish</p>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className={`p-4 rounded-xl bg-gradient-to-br ${signalStyles[prediction.signal].gradient} relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <SignalIcon className={`h-6 w-6 ${signalStyles[prediction.signal].text}`} />
                <span className={`text-xl font-bold ${signalStyles[prediction.signal].text}`}>{prediction.signal}</span>
              </div>
              <p className="text-sm opacity-90">Trend: <span className="font-medium">{prediction.trend}</span></p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm opacity-90">Confidence:</span>
                <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white/80 rounded-full" style={{ width: `${prediction.confidence}%` }} />
                </div>
                <span className="text-sm font-bold">{prediction.confidence}%</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-accent" />
              <span className="text-sm text-muted-foreground">Price Target</span>
            </div>
            <p className="text-2xl font-bold font-mono text-foreground mb-1">{formatPrice(prediction.predictedPrice, instrument)}</p>
            <div className={`flex items-center gap-1 text-sm font-mono ${isPositive ? 'text-gain' : 'text-loss'}`}>
              {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              {isPositive ? '+' : ''}{prediction.predictedChangePercent.toFixed(2)}%
            </div>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Crosshair className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Current Price</span>
            </div>
            <p className="text-2xl font-bold font-mono text-foreground mb-1">{formatPrice(prediction.currentPrice, instrument)}</p>
            <p className="text-sm text-muted-foreground">{instrument}</p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-accent" />
              <span className="text-sm text-muted-foreground">Risk/Reward</span>
            </div>
            <p className="text-2xl font-bold font-mono text-foreground mb-1">1:{prediction.riskReward.toFixed(1)}</p>
            <Badge variant="outline" className={prediction.riskReward >= 2 ? 'bg-gain/10 text-gain border-gain/30' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'}>
              {prediction.riskReward >= 2 ? 'Favorable' : 'Moderate'}
            </Badge>
          </div>
        </div>

        {/* Scenarios A/B */}
        {prediction.scenarios && prediction.scenarios.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-accent" />
              Scenario Analysis (Option A vs B)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prediction.scenarios.map((scenario, i) => (
                <ScenarioCard key={i} scenario={scenario} instrument={instrument} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Gap Analysis */}
        {prediction.gapAnalysis && prediction.gapAnalysis.hasGap && (
          <div className="mb-6 p-4 rounded-xl bg-accent/5 border border-accent/20">
            <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4 text-accent" />
              Gap Analysis (Market Open/Close)
            </h4>
            <div className="flex items-center gap-4 mb-2">
              <Badge className={prediction.gapAnalysis.gapType === 'Up' ? 'bg-gain text-gain-foreground' : 'bg-loss text-loss-foreground'}>
                {prediction.gapAnalysis.gapType} Gap
              </Badge>
              <span className="font-mono text-sm text-foreground">
                {formatPrice(prediction.gapAnalysis.gapSize, instrument)} ({prediction.gapAnalysis.gapPercent.toFixed(3)}%)
              </span>
              <Badge variant="outline">
                {prediction.gapAnalysis.filled ? '✅ Filled' : '⏳ Unfilled'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <Info className="h-3 w-3 inline mr-1" />
              {prediction.gapAnalysis.reasoning}
            </p>
          </div>
        )}

        {/* Scores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 p-4 bg-muted/30 rounded-xl">
          <ScoreBar label="Technical" score={prediction.technicalScore} icon={Activity} />
          <ScoreBar label="Fundamental" score={prediction.fundamentalScore} icon={Shield} />
          <ScoreBar label="Sentiment" score={prediction.sentimentScore} icon={Brain} />
        </div>

        {/* Indicator Reasoning */}
        {prediction.indicatorReasoning && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <Info className="h-4 w-4 text-accent" />
              Reasoning per Indicator (Kenapa?)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <IndicatorReasoningCard icon={Activity} label="RSI (Momentum)" reasoning={prediction.indicatorReasoning.rsi} color="text-accent" />
              <IndicatorReasoningCard icon={BarChart3} label="MACD (Konfirmasi)" reasoning={prediction.indicatorReasoning.macd} color="text-gain" />
              <IndicatorReasoningCard icon={TrendingUp} label="Moving Averages (Tren)" reasoning={prediction.indicatorReasoning.movingAverages} color="text-loss" />
              <IndicatorReasoningCard icon={Layers} label="Fibonacci (Entry Level)" reasoning={prediction.indicatorReasoning.fibonacci} color="text-warning" />
              <IndicatorReasoningCard icon={Target} label="Bollinger Bands (Volatilitas)" reasoning={prediction.indicatorReasoning.bollinger} color="text-muted-foreground" />
              <IndicatorReasoningCard icon={Shield} label="Fundamental (Makro)" reasoning={prediction.indicatorReasoning.fundamental} color="text-accent" />
            </div>
          </div>
        )}

        {/* Analysis Summary */}
        <div className="mb-6">
          <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-accent" />
            Analysis Summary
          </p>
          <div className="space-y-2">
            {prediction.reasoning.map((reason, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-medium text-accent">{i + 1}</span>
                </div>
                <span className="text-sm text-muted-foreground leading-relaxed">{reason}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Key Levels */}
        {prediction.keyLevels && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
            <div className="p-4 rounded-lg bg-gain/5 border border-gain/20">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gain" />Support Levels
              </p>
              <div className="space-y-2">
                {prediction.keyLevels.support.map((level, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">S{i + 1}</span>
                    <span className="font-mono text-sm font-medium text-gain">{formatPrice(level, instrument)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-loss/5 border border-loss/20">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-loss" />Resistance Levels
              </p>
              <div className="space-y-2">
                {prediction.keyLevels.resistance.map((level, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">R{i + 1}</span>
                    <span className="font-mono text-sm font-medium text-loss">{formatPrice(level, instrument)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 p-3 bg-muted/30 rounded-lg border border-border">
          <p className="text-xs text-muted-foreground text-center">
            <AlertTriangle className="h-3 w-3 inline mr-1" />
            AI predictions are for informational purposes only. Not financial advice.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
