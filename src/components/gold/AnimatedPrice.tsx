import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedPriceProps {
  value: number;
  prefix?: string;
  decimals?: number;
  className?: string;
  showFlash?: boolean;
}

export function AnimatedPrice({ value, prefix = '$', decimals = 2, className, showFlash = true }: AnimatedPriceProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);
  const prevValue = useRef(value);
  const animFrame = useRef<number>();

  useEffect(() => {
    if (value === prevValue.current) return;

    const direction = value > prevValue.current ? 'up' : 'down';
    if (showFlash) {
      setFlash(direction);
      const t = setTimeout(() => setFlash(null), 600);
      // Animate number tick
      const start = prevValue.current;
      const diff = value - start;
      const duration = 400;
      const startTime = performance.now();

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(start + diff * eased);
        if (progress < 1) {
          animFrame.current = requestAnimationFrame(animate);
        }
      };

      animFrame.current = requestAnimationFrame(animate);
      prevValue.current = value;
      return () => {
        clearTimeout(t);
        if (animFrame.current) cancelAnimationFrame(animFrame.current);
      };
    } else {
      setDisplayValue(value);
      prevValue.current = value;
    }
  }, [value, showFlash]);

  const formatted = `${prefix}${displayValue.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;

  return (
    <span
      className={cn(
        'transition-colors duration-300 font-mono tabular-nums',
        flash === 'up' && 'text-[hsl(var(--gain))]',
        flash === 'down' && 'text-[hsl(var(--loss))]',
        className
      )}
    >
      {formatted}
      {flash && (
        <span className="inline-block ml-0.5 text-[0.6em] animate-bounce">
          {flash === 'up' ? '▲' : '▼'}
        </span>
      )}
    </span>
  );
}
