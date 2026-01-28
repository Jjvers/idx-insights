import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Coins, LineChart, Brain, Calendar, Users, Settings2 } from 'lucide-react';

const timeframes: { value: Timeframe; label: string }[] = [
  { value: '1D', label: '1 Day' },
  { value: '1W', label: '1 Week' },
  { value: '1M', label: '1 Month' },
  { value: '3M', label: '3 Months' }
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
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/20">
                <Coins className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Gold Analysis</h1>
                <p className="text-sm text-muted-foreground">AI-Powered Price Prediction</p>
              </div>
            </div>

            {/* Timeframe Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground mr-2">Timeframe:</span>
              {timeframes.map(tf => (
                <Button
                  key={tf.value}
                  variant={selectedTimeframe === tf.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTimeframe(tf.value)}
                >
                  {tf.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Price Cards */}
        <section className="mb-6">
          <GoldPriceCards 
            selectedInstrument={selectedInstrument}
            onSelectInstrument={setSelectedInstrument}
          />
        </section>

        {/* Main Content Tabs */}
        <Tabs defaultValue="prediction" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="prediction" className="gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Prediction</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="gap-2">
              <LineChart className="h-4 w-4" />
              <span className="hidden sm:inline">Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="experts" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Experts</span>
            </TabsTrigger>
          </TabsList>

          {/* Prediction Tab */}
          <TabsContent value="prediction" className="space-y-6">
            <PredictionPanel 
              instrument={selectedInstrument} 
              timeframe={selectedTimeframe} 
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <GoldChart 
                instrument={selectedInstrument}
                showIndicators={showIndicators}
              />
              <TechnicalPanel instrument={selectedInstrument} />
            </div>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            {/* Chart Settings */}
            <div className="flex flex-wrap items-center gap-4 p-4 bg-card rounded-lg border border-border">
              <div className="flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Chart Overlays:</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  id="sma20" 
                  checked={showIndicators.sma20}
                  onCheckedChange={(checked) => setShowIndicators(prev => ({ ...prev, sma20: checked }))}
                />
                <Label htmlFor="sma20" className="text-sm">SMA 20</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  id="sma50" 
                  checked={showIndicators.sma50}
                  onCheckedChange={(checked) => setShowIndicators(prev => ({ ...prev, sma50: checked }))}
                />
                <Label htmlFor="sma50" className="text-sm">SMA 50</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  id="bollinger" 
                  checked={showIndicators.bollinger}
                  onCheckedChange={(checked) => setShowIndicators(prev => ({ ...prev, bollinger: checked }))}
                />
                <Label htmlFor="bollinger" className="text-sm">Bollinger Bands</Label>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <GoldChart 
                instrument={selectedInstrument}
                showIndicators={showIndicators}
              />
              <div className="space-y-6">
                <TechnicalPanel instrument={selectedInstrument} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FundamentalPanel />
              <ExpertAnalysisList instrument={selectedInstrument} />
            </div>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <EconomicCalendar />
              </div>
              <div className="space-y-6">
                <FundamentalPanel />
              </div>
            </div>
          </TabsContent>

          {/* Experts Tab */}
          <TabsContent value="experts">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ExpertAnalysisList instrument={selectedInstrument} />
              <div className="space-y-6">
                <TechnicalPanel instrument={selectedInstrument} />
                <FundamentalPanel />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Data updates every few hours. Predictions are AI-generated and for informational purposes only.</p>
          <p className="mt-1">Not financial advice. Always do your own research.</p>
        </div>
      </footer>
    </div>
  );
}
