import { useState } from 'react';
import { StockData, SortField, SortDirection } from '@/types/stock';
import { TrendingUp, TrendingDown, ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StockTableProps {
  stocks: StockData[];
  onSelectStock: (stock: StockData) => void;
}

type ColumnConfig = {
  key: SortField;
  label: string;
  align?: 'left' | 'right' | 'center';
  format?: (stock: StockData) => React.ReactNode;
};

const columns: ColumnConfig[] = [
  {
    key: 'ticker',
    label: 'Ticker',
    align: 'left',
    format: (s) => (
      <div>
        <span className="font-semibold text-foreground">{s.ticker}</span>
        <p className="text-xs text-muted-foreground truncate max-w-[120px]">{s.name}</p>
      </div>
    ),
  },
  {
    key: 'price',
    label: 'Price',
    align: 'right',
    format: (s) => (
      <span className="font-mono">{s.price.toLocaleString('id-ID')}</span>
    ),
  },
  {
    key: 'change',
    label: 'Change',
    align: 'right',
    format: (s) => (
      <div className={cn("flex items-center justify-end gap-1 font-mono", s.change >= 0 ? "text-gain" : "text-loss")}>
        {s.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        <span>{s.change >= 0 ? '+' : ''}{s.changePercent.toFixed(2)}%</span>
      </div>
    ),
  },
  {
    key: 'overallScore',
    label: 'Score',
    align: 'center',
    format: (s) => (
      <div className="flex items-center justify-center">
        <span className={cn(
          "px-2 py-0.5 rounded font-mono font-semibold text-sm",
          s.overallScore >= 70 ? "bg-gain/20 text-gain" : s.overallScore >= 50 ? "bg-warning/20 text-warning" : "bg-loss/20 text-loss"
        )}>
          {s.overallScore}
        </span>
      </div>
    ),
  },
  {
    key: 'pe',
    label: 'P/E',
    align: 'right',
    format: (s) => <span className="font-mono">{s.pe > 0 ? s.pe.toFixed(1) : 'N/A'}</span>,
  },
  {
    key: 'pbv',
    label: 'PBV',
    align: 'right',
    format: (s) => <span className="font-mono">{s.pbv.toFixed(2)}</span>,
  },
  {
    key: 'roe',
    label: 'ROE',
    align: 'right',
    format: (s) => (
      <span className={cn("font-mono", s.roe > 0 ? "text-gain" : "text-loss")}>
        {s.roe.toFixed(1)}%
      </span>
    ),
  },
  {
    key: 'der',
    label: 'DER',
    align: 'right',
    format: (s) => (
      <span className={cn("font-mono", s.der < 1 ? "text-gain" : s.der < 2 ? "text-warning" : "text-loss")}>
        {s.der.toFixed(2)}
      </span>
    ),
  },
  {
    key: 'volume',
    label: 'Volume',
    align: 'right',
    format: (s) => (
      <span className="font-mono text-muted-foreground">
        {(s.volume / 1000000).toFixed(1)}M
      </span>
    ),
  },
];

export function StockTable({ stocks, onSelectStock }: StockTableProps) {
  const [sortField, setSortField] = useState<SortField>('overallScore');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedStocks = [...stocks].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc' 
        ? aVal.localeCompare(bVal) 
        : bVal.localeCompare(aVal);
    }
    
    const numA = Number(aVal) || 0;
    const numB = Number(bVal) || 0;
    return sortDirection === 'asc' ? numA - numB : numB - numA;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-3 h-3 text-primary" />
      : <ChevronDown className="w-3 h-3 text-primary" />;
  };

  return (
    <div className="gradient-card border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={cn(
                    "px-4 py-3 font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors",
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center'
                  )}
                >
                  <div className={cn(
                    "flex items-center gap-1",
                    col.align === 'right' && 'justify-end',
                    col.align === 'center' && 'justify-center'
                  )}>
                    <span>{col.label}</span>
                    <SortIcon field={col.key} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedStocks.map((stock, idx) => (
              <tr
                key={stock.ticker}
                onClick={() => onSelectStock(stock)}
                className={cn(
                  "border-b border-border/50 cursor-pointer transition-colors hover:bg-secondary/20",
                  idx % 2 === 0 && "bg-secondary/5"
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-4 py-3",
                      col.align === 'right' && 'text-right',
                      col.align === 'center' && 'text-center'
                    )}
                  >
                    {col.format ? col.format(stock) : String(stock[col.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
