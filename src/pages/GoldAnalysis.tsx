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
import type { GoldInstrument, Timeframe } from '@/types/gold';
import { Coins, LineChart, Brain, Calendar, Users, Settings2, TrendingUp, BarChart3 } from 'lucide-react';
import { NavLink } from '@/components/NavLink';

const timeframes: { value: Timeframe; label: string }[] = [
  { value: '1D', label: '1D' },
  { value: '1W', label: '1W' },
  { value: '1M', label: '1M' },
  { value: '3M', label: '3M' }
];

export default function GoldAnalysis() {
  const [selectedInstrument, setSelectedInstrument] = useState<GoldInstrument>('XAU/USD');
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('1W');
  const [showIndicators, setShowIndicators] = useState({
    sma20: true,
    sma50: true,
    bollinger: false
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header - TradingView style */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-accent/20">
                  <Coins className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground leading-tight">Gold Analysis</h1>
                </div>
              </div>

              {/* Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                <NavLink to="/" className="px-3 py-1.5 text-sm text-foreground bg-secondary rounded-md">
                  Gold
                </NavLink>
                <NavLink to="/stocks" className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  IDX Stocks
                </NavLink>
              </nav>
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

      <main className="container mx-auto px-4 py-4">
        {/* Price Cards */}
        <section className="mb-4">
          <GoldPriceCards 
            selectedInstrument={selectedInstrument}
            onSelectInstrument={setSelectedInstrument}
          />
        </section>

        {/* Main Content Tabs */}
        <Tabs defaultValue="prediction" className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
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
              <TabsTrigger value="calendar" className="gap-1.5">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Calendar</span>
              </TabsTrigger>
              <TabsTrigger value="experts" className="gap-1.5">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Experts</span>
              </TabsTrigger>
            </TabsList>

            {/* Chart Overlay Controls */}
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Settings2 className="h-3.5 w-3.5" />
                Overlays:
              </span>
              <div className="flex items-center gap-1.5">
                <Switch 
                  id="sma20" 
                  checked={showIndicators.sma20}
                  onCheckedChange={(checked) => setShowIndicators(prev => ({ ...prev, sma20: checked }))}
                  className="h-4 w-7"
                />
                <Label htmlFor="sma20" className="text-xs cursor-pointer text-gain">SMA20</Label>
              </div>
              <div className="flex items-center gap-1.5">
                <Switch 
                  id="sma50" 
                  checked={showIndicators.sma50}
                  onCheckedChange={(checked) => setShowIndicators(prev => ({ ...prev, sma50: checked }))}
                  className="h-4 w-7"
                />
                <Label htmlFor="sma50" className="text-xs cursor-pointer text-loss">SMA50</Label>
              </div>
              <div className="flex items-center gap-1.5">
                <Switch 
                  id="bollinger" 
                  checked={showIndicators.bollinger}
                  onCheckedChange={(checked) => setShowIndicators(prev => ({ ...prev, bollinger: checked }))}
                  className="h-4 w-7"
                />
                <Label htmlFor="bollinger" className="text-xs cursor-pointer">BB</Label>
              </div>
            </div>
          </div>

          {/* Prediction Tab */}
          <TabsContent value="prediction" className="space-y-4 mt-4">
            <PredictionPanel 
              instrument={selectedInstrument} 
              timeframe={selectedTimeframe} 
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <GoldChart 
                instrument={selectedInstrument}
                showIndicators={showIndicators}
              />
              <TechnicalPanel instrument={selectedInstrument} />
            </div>
          </TabsContent>

          {/* Technical Analysis Tab */}
          <TabsContent value="analysis" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <GoldChart 
                instrument={selectedInstrument}
                showIndicators={showIndicators}
              />
              <TechnicalPanel instrument={selectedInstrument} />
            </div>
          </TabsContent>

          {/* Fundamental Tab */}
          <TabsContent value="fundamental" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <GoldChart 
                instrument={selectedInstrument}
                showIndicators={showIndicators}
              />
              <FundamentalPanel />
            </div>
            <ExpertAnalysisList instrument={selectedInstrument} />
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

      {/* Footer */}
      <footer className="border-t border-border mt-8 py-4">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          <p>Data updates periodically. AI predictions are for informational purposes only.</p>
          <p className="mt-1">Not financial advice. Always do your own research before trading.</p>
        </div>
      </footer>
    </div>
  );
}
