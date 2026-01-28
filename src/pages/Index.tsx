import { useState, useMemo } from 'react';
import { StockData, WeightConfig, FilterConfig } from '@/types/stock';
import { getStockData, getSectors } from '@/data/mockStocks';
import { WeightSliders } from '@/components/stock/WeightSliders';
import { StockCard } from '@/components/stock/StockCard';
import { StockTable } from '@/components/stock/StockTable';
import { StockFilters } from '@/components/stock/StockFilters';
import { StockDetailModal } from '@/components/stock/StockDetailModal';
import { MarketOverview } from '@/components/stock/MarketOverview';
import { ViewToggle } from '@/components/stock/ViewToggle';
import { BarChart3, RefreshCw, Info } from 'lucide-react';

const defaultWeights: WeightConfig = {
  safety: 25,
  growth: 30,
  value: 25,
  momentum: 20,
};

const defaultFilters: FilterConfig = {
  sector: 'all',
  valuationLabel: 'all',
  investmentCategory: 'all',
  riskLevel: 'all',
  minScore: 0,
};

export default function Index() {
  const [weights, setWeights] = useState<WeightConfig>(defaultWeights);
  const [filters, setFilters] = useState<FilterConfig>(defaultFilters);
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get scored stocks based on current weights
  const stocks = useMemo(() => getStockData(weights), [weights]);
  const sectors = useMemo(() => getSectors(), []);

  // Apply filters
  const filteredStocks = useMemo(() => {
    return stocks.filter(stock => {
      if (filters.sector !== 'all' && stock.sector !== filters.sector) return false;
      if (filters.valuationLabel !== 'all' && stock.valuationLabel !== filters.valuationLabel) return false;
      if (filters.investmentCategory !== 'all' && stock.investmentCategory !== filters.investmentCategory) return false;
      if (filters.riskLevel !== 'all' && stock.riskLevel !== filters.riskLevel) return false;
      if (stock.overallScore < filters.minScore) return false;
      return true;
    });
  }, [stocks, filters]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg gradient-accent flex items-center justify-center shadow-glow-accent">
                <BarChart3 className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">IDX Stock Analyzer</h1>
                <p className="text-xs text-muted-foreground">Indonesian Stock Exchange Analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <ViewToggle view={viewMode} onChange={setViewMode} />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Market Overview */}
        <section className="mb-6">
          <MarketOverview stocks={stocks} />
        </section>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Weights & Filters */}
          <aside className="lg:col-span-1 space-y-4">
            <WeightSliders weights={weights} onChange={setWeights} />
            
            {/* Info Card */}
            <div className="gradient-card border border-border rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-accent mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">How Scoring Works</p>
                  <p className="mb-2">Stocks are scored 0-100 based on your weight preferences.</p>
                  <ul className="space-y-1">
                    <li><span className="text-gain">●</span> 70+ = Strong Buy</li>
                    <li><span className="text-warning">●</span> 50-69 = Hold/Consider</li>
                    <li><span className="text-loss">●</span> &lt;50 = Caution</li>
                  </ul>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4">
            {/* Filters */}
            <StockFilters filters={filters} onChange={setFilters} sectors={sectors} />

            {/* Results Count */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing <span className="text-foreground font-medium">{filteredStocks.length}</span> of {stocks.length} stocks
              </p>
            </div>

            {/* Stock Grid or Table */}
            {viewMode === 'grid' ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredStocks.map((stock) => (
                  <StockCard
                    key={stock.ticker}
                    stock={stock}
                    onClick={() => setSelectedStock(stock)}
                  />
                ))}
              </div>
            ) : (
              <StockTable stocks={filteredStocks} onSelectStock={setSelectedStock} />
            )}

            {filteredStocks.length === 0 && (
              <div className="text-center py-12 gradient-card border border-border rounded-lg">
                <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No stocks match your current filters</p>
                <button
                  onClick={() => setFilters(defaultFilters)}
                  className="mt-3 text-sm text-primary hover:underline"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Stock Detail Modal */}
      <StockDetailModal stock={selectedStock} onClose={() => setSelectedStock(null)} />

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          <p>IDX Stock Analyzer • Data for educational purposes only • Not financial advice</p>
        </div>
      </footer>
    </div>
  );
}
