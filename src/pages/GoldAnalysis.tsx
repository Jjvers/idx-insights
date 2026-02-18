import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { GoldPriceCards } from '@/components/gold/GoldPriceCards';
import { GoldChart } from '@/components/gold/GoldChart';
import { TechnicalPanel } from '@/components/gold/TechnicalPanel';
import { FundamentalPanel } from '@/components/gold/FundamentalPanel';
import { PredictionPanel } from '@/components/gold/PredictionPanel';
import { EconomicCalendar } from '@/components/gold/EconomicCalendar';
import { ExpertAnalysisList } from '@/components/gold/ExpertAnalysisList';
import { NewsSentiment } from '@/components/gold/NewsSentiment';
import { CorrelatedAssets } from '@/components/gold/CorrelatedAssets';
import { useGoldPrices } from '@/hooks/useGoldPrices';
import type { GoldInstrument, Timeframe } from '@/types/gold';
import { Coins, Brain, Calendar, Users, Settings2, TrendingUp, BarChart3, Newspaper, Link2, RefreshCw } from 'lucide-react';

const timeframes: { value: Timeframe; label: string }[] = [
  { value: '1D', label: '1D' },
  { value: '1W', label: '1W' },
  { value: '1M', label: '1M' },
  { value: '3M', label: '3M' }
];

export default function GoldAnalysis() {
  const [selectedInstrument, setSelectedInstrument] = useState<GoldInstrument>('XAU/USD');
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('1W');
  const { prices: livePrices, isLoading: pricesLoading, refetch: refetchPrices } = useGoldPrices();
  const [showIndicators, setShowIndicators] = useState({
    sma20: true,
    sma50: true,
    ema12: false,
    ema26: false,
    bollinger: false,
    fibonacci: false
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-accent/20">
                  <Coins className="h-5 w-5 text-accent" />
                </div>
                <h1 className="text-lg font-bold text-foreground leading-tight">Gold Analysis</h1>
              </div>

              {livePrices && (
                <div className="hidden md:flex items-center gap-3 text-xs font-mono">
                  <span className="text-muted-foreground">XAU: <span className="text-foreground font-semibold">${livePrices.XAU.toFixed(2)}</span></span>
                  <span className="text-muted-foreground">XAG: <span className="text-foreground">${livePrices.XAG.toFixed(2)}</span></span>
                  <span className="text-muted-foreground">Au/Ag: <span className="text-foreground">{livePrices.goldSilverRatio.toFixed(1)}</span></span>
                  <button onClick={refetchPrices} className="p-1 hover:bg-secondary rounded transition-colors">
                    <RefreshCw className={`h-3 w-3 text-muted-foreground ${pricesLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              )}
            </div>

            {/* Timeframe Selector */}
            <div className="flex items-center gap-1 bg-muted/50 p-0.5 rounded-lg">
              {timeframes.map(tf => (
                <Button
                  key={tf.value}
                  variant={selectedTimeframe === tf.value ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 px-3 text-xs"
                  onClick={() => setSelectedTimeframe(tf.value)}
                >
                  {tf.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Indicator Toolbar - TradingView style */}
      <div className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Settings2 className="h-3.5 w-3.5" />
              Overlays:
            </span>
            
            {/* Trend Indicators */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Switch id="sma20" checked={showIndicators.sma20}
                  onCheckedChange={(c) => setShowIndicators(p => ({ ...p, sma20: c }))}
                  className="h-4 w-7" />
                <Label htmlFor="sma20" className="text-xs cursor-pointer text-gain">SMA20</Label>
              </div>
              <div className="flex items-center gap-1.5">
                <Switch id="sma50" checked={showIndicators.sma50}
                  onCheckedChange={(c) => setShowIndicators(p => ({ ...p, sma50: c }))}
                  className="h-4 w-7" />
                <Label htmlFor="sma50" className="text-xs cursor-pointer text-loss">SMA50</Label>
              </div>
              <div className="flex items-center gap-1.5">
                <Switch id="ema12" checked={showIndicators.ema12}
                  onCheckedChange={(c) => setShowIndicators(p => ({ ...p, ema12: c }))}
                  className="h-4 w-7" />
                <Label htmlFor="ema12" className="text-xs cursor-pointer" style={{ color: 'hsl(var(--accent))' }}>EMA12</Label>
              </div>
              <div className="flex items-center gap-1.5">
                <Switch id="ema26" checked={showIndicators.ema26}
                  onCheckedChange={(c) => setShowIndicators(p => ({ ...p, ema26: c }))}
                  className="h-4 w-7" />
                <Label htmlFor="ema26" className="text-xs cursor-pointer text-warning">EMA26</Label>
              </div>
            </div>

            <div className="h-4 w-px bg-border" />

            {/* Other Overlays */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Switch id="bollinger" checked={showIndicators.bollinger}
                  onCheckedChange={(c) => setShowIndicators(p => ({ ...p, bollinger: c }))}
                  className="h-4 w-7" />
                <Label htmlFor="bollinger" className="text-xs cursor-pointer">Bollinger</Label>
              </div>
              <div className="flex items-center gap-1.5">
                <Switch id="fibonacci" checked={showIndicators.fibonacci}
                  onCheckedChange={(c) => setShowIndicators(p => ({ ...p, fibonacci: c }))}
                  className="h-4 w-7" />
                <Label htmlFor="fibonacci" className="text-xs cursor-pointer text-warning">Fibonacci</Label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-4">
        {/* Price Cards */}
        <section className="mb-4">
          <GoldPriceCards 
            selectedInstrument={selectedInstrument}
            onSelectInstrument={setSelectedInstrument}
            livePrices={livePrices}
            isLoading={pricesLoading}
          />
        </section>

        {/* Main Content Tabs */}
        <Tabs defaultValue="prediction" className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="prediction" className="gap-1.5 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">AI Prediction</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="gap-1.5">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Technical</span>
            </TabsTrigger>
            <TabsTrigger value="fundamental" className="gap-1.5">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Fundamental</span>
            </TabsTrigger>
            <TabsTrigger value="news" className="gap-1.5">
              <Newspaper className="h-4 w-4" />
              <span className="hidden sm:inline">News</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-1.5">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="correlation" className="gap-1.5">
              <Link2 className="h-4 w-4" />
              <span className="hidden sm:inline">Correlation</span>
            </TabsTrigger>
            <TabsTrigger value="experts" className="gap-1.5">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Experts</span>
            </TabsTrigger>
          </TabsList>

          {/* Prediction Tab */}
          <TabsContent value="prediction" className="space-y-4 mt-4">
            <PredictionPanel 
              instrument={selectedInstrument} 
              timeframe={selectedTimeframe} 
            />
            <CorrelatedAssets />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <GoldChart instrument={selectedInstrument} showIndicators={showIndicators} />
              <TechnicalPanel instrument={selectedInstrument} />
            </div>
          </TabsContent>

          {/* Technical Analysis Tab */}
          <TabsContent value="analysis" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <GoldChart instrument={selectedInstrument} showIndicators={showIndicators} />
              <TechnicalPanel instrument={selectedInstrument} />
            </div>
          </TabsContent>

          {/* Fundamental Tab */}
          <TabsContent value="fundamental" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <GoldChart instrument={selectedInstrument} showIndicators={showIndicators} />
              <FundamentalPanel />
            </div>
            <ExpertAnalysisList instrument={selectedInstrument} />
          </TabsContent>

          {/* News & Sentiment Tab */}
          <TabsContent value="news" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <NewsSentiment />
              </div>
              <FundamentalPanel />
            </div>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <EconomicCalendar />
              </div>
              <FundamentalPanel />
            </div>
          </TabsContent>

          {/* Correlation Tab */}
          <TabsContent value="correlation" className="space-y-4 mt-4">
            <CorrelatedAssets />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <GoldChart instrument={selectedInstrument} showIndicators={showIndicators} />
              <FundamentalPanel />
            </div>
          </TabsContent>

          {/* Experts Tab */}
          <TabsContent value="experts" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ExpertAnalysisList instrument={selectedInstrument} />
              <div className="space-y-4">
                <TechnicalPanel instrument={selectedInstrument} />
                <FundamentalPanel />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-border mt-8 py-4">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          <p>Data updates periodically. AI predictions are for informational purposes only.</p>
          <p className="mt-1">Not financial advice. Always do your own research before trading.</p>
        </div>
      </footer>
    </div>
  );
}
