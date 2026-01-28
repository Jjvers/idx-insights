import { Grid3X3, List } from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewMode = 'grid' | 'table';

interface ViewToggleProps {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
      <button
        onClick={() => onChange('grid')}
        className={cn(
          "p-2 rounded transition-colors",
          view === 'grid' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Grid3X3 className="w-4 h-4" />
      </button>
      <button
        onClick={() => onChange('table')}
        className={cn(
          "p-2 rounded transition-colors",
          view === 'table' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  );
}
