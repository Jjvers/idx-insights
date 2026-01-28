import { WeightConfig } from '@/types/stock';
import { Slider } from '@/components/ui/slider';
import { Shield, TrendingUp, DollarSign, Zap } from 'lucide-react';

interface WeightSlidersProps {
  weights: WeightConfig;
  onChange: (weights: WeightConfig) => void;
}

const weightInfo = [
  {
    key: 'safety' as const,
    label: 'Safety Priority',
    description: 'Lower debt & volatility stocks score higher',
    icon: Shield,
    color: 'text-gain',
  },
  {
    key: 'growth' as const,
    label: 'Growth Focus',
    description: 'Higher ROE & earnings growth stocks score higher',
    icon: TrendingUp,
    color: 'text-accent',
  },
  {
    key: 'value' as const,
    label: 'Value Hunting',
    description: 'Lower P/E & PBV stocks score higher',
    icon: DollarSign,
    color: 'text-warning',
  },
  {
    key: 'momentum' as const,
    label: 'Momentum Trading',
    description: 'Higher volume & price action stocks score higher',
    icon: Zap,
    color: 'text-purple-400',
  },
];

export function WeightSliders({ weights, onChange }: WeightSlidersProps) {
  const handleChange = (key: keyof WeightConfig, value: number[]) => {
    onChange({ ...weights, [key]: value[0] });
  };

  const totalWeight = weights.safety + weights.growth + weights.value + weights.momentum;

  return (
    <div className="gradient-card border border-border rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Scoring Weights</h3>
        <span className="text-xs text-muted-foreground font-mono">
          Total: {totalWeight}%
        </span>
      </div>

      <div className="space-y-5">
        {weightInfo.map(({ key, label, description, icon: Icon, color }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-sm font-medium text-foreground">{label}</span>
              </div>
              <span className="text-sm font-mono text-muted-foreground">
                {weights[key]}%
              </span>
            </div>
            <Slider
              value={[weights[key]]}
              onValueChange={(value) => handleChange(key, value)}
              max={100}
              step={5}
              className="mb-1"
            />
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        ))}
      </div>

      {/* Preset Buttons */}
      <div className="mt-5 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground mb-2">Quick Presets</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onChange({ safety: 40, growth: 30, value: 20, momentum: 10 })}
            className="px-3 py-1.5 text-xs rounded bg-secondary hover:bg-secondary/80 transition-colors"
          >
            Conservative
          </button>
          <button
            onClick={() => onChange({ safety: 20, growth: 40, value: 25, momentum: 15 })}
            className="px-3 py-1.5 text-xs rounded bg-secondary hover:bg-secondary/80 transition-colors"
          >
            Balanced
          </button>
          <button
            onClick={() => onChange({ safety: 10, growth: 30, value: 20, momentum: 40 })}
            className="px-3 py-1.5 text-xs rounded bg-secondary hover:bg-secondary/80 transition-colors"
          >
            Aggressive
          </button>
          <button
            onClick={() => onChange({ safety: 15, growth: 20, value: 50, momentum: 15 })}
            className="px-3 py-1.5 text-xs rounded bg-secondary hover:bg-secondary/80 transition-colors"
          >
            Value Investor
          </button>
        </div>
      </div>
    </div>
  );
}
