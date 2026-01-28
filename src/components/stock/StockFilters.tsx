import { FilterConfig } from '@/types/stock';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Filter, X } from 'lucide-react';

interface StockFiltersProps {
  filters: FilterConfig;
  onChange: (filters: FilterConfig) => void;
  sectors: string[];
}

export function StockFilters({ filters, onChange, sectors }: StockFiltersProps) {
  const updateFilter = <K extends keyof FilterConfig>(key: K, value: FilterConfig[K]) => {
    onChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = 
    filters.sector !== 'all' || 
    filters.valuationLabel !== 'all' || 
    filters.investmentCategory !== 'all' || 
    filters.riskLevel !== 'all' ||
    filters.minScore > 0;

  const resetFilters = () => {
    onChange({
      sector: 'all',
      valuationLabel: 'all',
      investmentCategory: 'all',
      riskLevel: 'all',
      minScore: 0,
    });
  };

  return (
    <div className="gradient-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Sector */}
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Sector</label>
          <Select value={filters.sector} onValueChange={(v) => updateFilter('sector', v)}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="All Sectors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sectors</SelectItem>
              {sectors.map((sector) => (
                <SelectItem key={sector} value={sector}>{sector}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Valuation */}
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Valuation</label>
          <Select value={filters.valuationLabel} onValueChange={(v) => updateFilter('valuationLabel', v)}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Cheap">Cheap</SelectItem>
              <SelectItem value="Fair">Fair</SelectItem>
              <SelectItem value="Expensive">Expensive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Investment Category */}
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Category</label>
          <Select value={filters.investmentCategory} onValueChange={(v) => updateFilter('investmentCategory', v)}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Long-term">Long-term</SelectItem>
              <SelectItem value="Swing Trade">Swing Trade</SelectItem>
              <SelectItem value="Daily Trade">Daily Trade</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Risk Level */}
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Risk Level</label>
          <Select value={filters.riskLevel} onValueChange={(v) => updateFilter('riskLevel', v)}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Low">Low Risk</SelectItem>
              <SelectItem value="Medium">Medium Risk</SelectItem>
              <SelectItem value="High">High Risk</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Min Score */}
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">
            Min Score: <span className="font-mono">{filters.minScore}</span>
          </label>
          <Slider
            value={[filters.minScore]}
            onValueChange={(v) => updateFilter('minScore', v[0])}
            max={100}
            step={5}
            className="mt-2"
          />
        </div>
      </div>
    </div>
  );
}
