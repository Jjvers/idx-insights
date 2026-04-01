import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { GoldInstrument } from '@/types/gold';
import type { LiveGoldPrices } from '@/hooks/useGoldPrices';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  TrendingUp, TrendingDown, DollarSign, Play, Pause,
  RotateCcw, Wallet, Target, Shield, ArrowUpRight,
  ArrowDownRight, History, BarChart3, Zap
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface SimTrade {
  id: string;
  type: 'BUY' | 'SELL';
  instrument: GoldInstrument;
  entryPrice: number;
  exitPrice?: number;
  units: number;
  stopLoss?: number;
  takeProfit?: number;
  pnl?: number;
  status: 'OPEN' | 'CLOSED' | 'STOPPED';
  openedAt: Date;
  closedAt?: Date;
}

interface SimulationPoint {
  time: string;
  price: number;
  equity: number;
}

interface TradingSimulatorProps {
  livePrices?: LiveGoldPrices | null;
  selectedInstrument: GoldInstrument;
}

export function TradingSimulator({ livePrices, selectedInstrument }: TradingSimulatorProps) {
  const [balance, setBalance] = useState(10000);
  const [initialBalance] = useState(10000);
  const [trades, setTrades] = useState<SimTrade[]>([]);
  const [units, setUnits] = useState('1');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedPrices, setSimulatedPrices] = useState<SimulationPoint[]>([]);
  const [simPrice, setSimPrice] = useState<number | null>(null);
  const [simSpeed, setSimSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [telegramChatId, setTelegramChatId] = useState('');
  const { toast } = useToast();

  const currentPrice = simPrice || (livePrices
    ? (selectedInstrument === 'XAU/USD' ? livePrices.XAU : livePrices.XAG)
    : 0);

  const openTrades = trades.filter(t => t.status === 'OPEN');
  const closedTrades = trades.filter(t => t.status !== 'OPEN');

  // Calculate unrealized PnL
  const unrealizedPnl = useMemo(() => {
    return openTrades.reduce((sum, t) => {
      const diff = t.type === 'BUY'
        ? (currentPrice - t.entryPrice) * t.units
        : (t.entryPrice - currentPrice) * t.units;
      return sum + diff;
    }, 0);
  }, [openTrades, currentPrice]);

  const realizedPnl = useMemo(() => {
    return closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  }, [closedTrades]);

  const equity = balance + unrealizedPnl;
  const totalReturn = ((equity - initialBalance) / initialBalance) * 100;
  const winRate = closedTrades.length > 0
    ? (closedTrades.filter(t => (t.pnl || 0) > 0).length / closedTrades.length) * 100
    : 0;

  // Check stop loss / take profit
  useEffect(() => {
    if (!currentPrice) return;
    setTrades(prev => prev.map(trade => {
      if (trade.status !== 'OPEN') return trade;
      
      const pnl = trade.type === 'BUY'
        ? (currentPrice - trade.entryPrice) * trade.units
        : (trade.entryPrice - currentPrice) * trade.units;

      if (trade.stopLoss) {
        const stopped = trade.type === 'BUY'
          ? currentPrice <= trade.stopLoss
          : currentPrice >= trade.stopLoss;
        if (stopped) {
          const slPnl = trade.type === 'BUY'
            ? (trade.stopLoss - trade.entryPrice) * trade.units
            : (trade.entryPrice - trade.stopLoss) * trade.units;
          setBalance(b => b + slPnl);
          toast({ title: '🛑 Stop Loss Hit', description: `${trade.instrument} ${trade.type} closed at SL. PnL: $${slPnl.toFixed(2)}`, variant: 'destructive' });
          return { ...trade, status: 'STOPPED' as const, exitPrice: trade.stopLoss, pnl: slPnl, closedAt: new Date() };
        }
      }

      if (trade.takeProfit) {
        const tpHit = trade.type === 'BUY'
          ? currentPrice >= trade.takeProfit
          : currentPrice <= trade.takeProfit;
        if (tpHit) {
          const tpPnl = trade.type === 'BUY'
            ? (trade.takeProfit - trade.entryPrice) * trade.units
            : (trade.entryPrice - trade.takeProfit) * trade.units;
          setBalance(b => b + tpPnl);
          toast({ title: '🎯 Take Profit Hit!', description: `${trade.instrument} ${trade.type} closed at TP. PnL: +$${tpPnl.toFixed(2)}` });
          return { ...trade, status: 'CLOSED' as const, exitPrice: trade.takeProfit, pnl: tpPnl, closedAt: new Date() };
        }
      }

      return trade;
    }));
  }, [currentPrice, toast]);

  // Price simulation engine
  useEffect(() => {
    if (!isSimulating || !currentPrice) return;
    
    const speedMs = simSpeed === 'slow' ? 2000 : simSpeed === 'normal' ? 1000 : 400;
    const volatility = selectedInstrument === 'XAU/USD' ? 0.0008 : 0.0015;

    const interval = setInterval(() => {
      setSimPrice(prev => {
        const base = prev || currentPrice;
        const change = (Math.random() - 0.48) * volatility * base;
        const newPrice = base + change;
        
        setSimulatedPrices(p => [
          ...p.slice(-100),
          {
            time: new Date().toLocaleTimeString(),
            price: newPrice,
            equity: balance + unrealizedPnl
          }
        ]);
        
        return newPrice;
      });
    }, speedMs);

    return () => clearInterval(interval);
  }, [isSimulating, simSpeed, selectedInstrument, balance, unrealizedPnl, currentPrice]);

  const executeTrade = useCallback(async (type: 'BUY' | 'SELL') => {
    if (!currentPrice) return;
    
    const tradeUnits = parseFloat(units) || 1;
    const sl = parseFloat(stopLoss) || undefined;
    const tp = parseFloat(takeProfit) || undefined;

    const newTrade: SimTrade = {
      id: `SIM-${Date.now()}`,
      type,
      instrument: selectedInstrument,
      entryPrice: currentPrice,
      units: tradeUnits,
      stopLoss: sl,
      takeProfit: tp,
      status: 'OPEN',
      openedAt: new Date(),
    };

    setTrades(prev => [newTrade, ...prev]);
    toast({
      title: `${type === 'BUY' ? '🟢' : '🔴'} ${type} Order Executed`,
      description: `${selectedInstrument} @ $${currentPrice.toFixed(2)} x ${tradeUnits} units`,
    });

    // Send webhook notification if telegram chat ID is set
    if (telegramChatId) {
      try {
        await supabase.functions.invoke('trading-webhook', {
          body: {
            action: type,
            instrument: selectedInstrument.replace('/', '_'),
            units: tradeUnits,
            price: currentPrice,
            stopLoss: sl,
            takeProfit: tp,
            reason: 'Paper trade simulation',
            telegramChatId,
          }
        });
      } catch (err) {
        console.error('Webhook notification failed:', err);
      }
    }
  }, [currentPrice, units, stopLoss, takeProfit, selectedInstrument, telegramChatId, toast]);

  const closeTrade = useCallback((tradeId: string) => {
    setTrades(prev => prev.map(t => {
      if (t.id !== tradeId || t.status !== 'OPEN') return t;
      const pnl = t.type === 'BUY'
        ? (currentPrice - t.entryPrice) * t.units
        : (t.entryPrice - currentPrice) * t.units;
      setBalance(b => b + pnl);
      return { ...t, status: 'CLOSED' as const, exitPrice: currentPrice, pnl, closedAt: new Date() };
    }));
  }, [currentPrice]);

  const resetSimulation = () => {
    setBalance(10000);
    setTrades([]);
    setSimulatedPrices([]);
    setSimPrice(null);
    setIsSimulating(false);
  };

  return (
    <div className="space-y-4">
      {/* Simulator Header */}
      <Card className="border-accent/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent" />
              Trading Simulator (Paper Trading)
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={simSpeed} onValueChange={(v: 'slow' | 'normal' | 'fast') => setSimSpeed(v)}>
                <SelectTrigger className="w-24 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slow">Slow</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="fast">Fast</SelectItem>
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant={isSimulating ? 'destructive' : 'default'}
                onClick={() => {
                  if (!isSimulating && !simPrice) setSimPrice(currentPrice);
                  setIsSimulating(!isSimulating);
                }}
                className="gap-1"
              >
                {isSimulating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isSimulating ? 'Pause' : 'Start Sim'}
              </Button>
              <Button size="sm" variant="outline" onClick={resetSimulation} className="gap-1">
                <RotateCcw className="h-4 w-4" /> Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Portfolio Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground flex items-center gap-1"><Wallet className="h-3 w-3" /> Balance</p>
              <p className="font-mono text-lg font-bold">${balance.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground flex items-center gap-1"><DollarSign className="h-3 w-3" /> Equity</p>
              <p className={`font-mono text-lg font-bold ${equity >= initialBalance ? 'text-gain' : 'text-loss'}`}>
                ${equity.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">Unrealized P&L</p>
              <p className={`font-mono text-lg font-bold ${unrealizedPnl >= 0 ? 'text-gain' : 'text-loss'}`}>
                {unrealizedPnl >= 0 ? '+' : ''}{unrealizedPnl.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">Total Return</p>
              <p className={`font-mono text-lg font-bold ${totalReturn >= 0 ? 'text-gain' : 'text-loss'}`}>
                {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
              </p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground flex items-center gap-1"><BarChart3 className="h-3 w-3" /> Win Rate</p>
              <p className="font-mono text-lg font-bold">{winRate.toFixed(0)}%</p>
              <p className="text-[10px] text-muted-foreground">{closedTrades.length} trades</p>
            </div>
          </div>

          {/* Simulated Price Chart */}
          {simulatedPrices.length > 2 && (
            <div className="h-40 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={simulatedPrices}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="time" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} interval="preserveStartEnd" />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} width={55} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="price" stroke="hsl(var(--accent))" dot={false} strokeWidth={2} />
                  {openTrades.map(t => (
                    <ReferenceLine key={t.id} y={t.entryPrice} stroke={t.type === 'BUY' ? 'hsl(var(--gain))' : 'hsl(var(--loss))'} strokeDasharray="4 4" />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Trade Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Label className="text-xs">Units</Label>
                  <Input type="number" value={units} onChange={e => setUnits(e.target.value)} className="h-8 font-mono" />
                </div>
                <div className="flex-1">
                  <Label className="text-xs flex items-center gap-1"><Shield className="h-3 w-3" /> Stop Loss</Label>
                  <Input type="number" value={stopLoss} onChange={e => setStopLoss(e.target.value)} placeholder="Optional" className="h-8 font-mono" />
                </div>
                <div className="flex-1">
                  <Label className="text-xs flex items-center gap-1"><Target className="h-3 w-3" /> Take Profit</Label>
                  <Input type="number" value={takeProfit} onChange={e => setTakeProfit(e.target.value)} placeholder="Optional" className="h-8 font-mono" />
                </div>
              </div>
              <div>
                <Label className="text-xs">Telegram Chat ID (for notifications)</Label>
                <Input value={telegramChatId} onChange={e => setTelegramChatId(e.target.value)} placeholder="e.g. 123456789" className="h-8 font-mono" />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => executeTrade('BUY')} className="flex-1 bg-[hsl(var(--gain))] hover:bg-[hsl(var(--gain))]/80 text-[hsl(var(--primary-foreground))] gap-1">
                  <ArrowUpRight className="h-4 w-4" /> BUY
                </Button>
                <Button onClick={() => executeTrade('SELL')} className="flex-1 bg-[hsl(var(--loss))] hover:bg-[hsl(var(--loss))]/80 text-[hsl(var(--destructive-foreground))] gap-1">
                  <ArrowDownRight className="h-4 w-4" /> SELL
                </Button>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Current Price</p>
                <p className="font-mono text-xl font-bold text-foreground">
                  ${currentPrice.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Open Positions */}
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                <History className="h-4 w-4" /> Open Positions ({openTrades.length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {openTrades.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No open positions</p>
                ) : (
                  openTrades.map(trade => {
                    const pnl = trade.type === 'BUY'
                      ? (currentPrice - trade.entryPrice) * trade.units
                      : (trade.entryPrice - currentPrice) * trade.units;
                    return (
                      <div key={trade.id} className="flex items-center justify-between p-2 rounded-lg border border-border bg-muted/20">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={trade.type === 'BUY' ? 'bg-gain/10 text-gain border-gain/30' : 'bg-loss/10 text-loss border-loss/30'}>
                            {trade.type}
                          </Badge>
                          <div>
                            <p className="text-xs font-mono">${trade.entryPrice.toFixed(2)} × {trade.units}</p>
                            {trade.stopLoss && <p className="text-[10px] text-muted-foreground">SL: ${trade.stopLoss.toFixed(2)}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-sm ${pnl >= 0 ? 'text-gain' : 'text-loss'}`}>
                            {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}
                          </span>
                          <Button size="sm" variant="ghost" onClick={() => closeTrade(trade.id)} className="h-6 px-2 text-xs">
                            Close
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trade History */}
      {closedTrades.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-1">
              <History className="h-4 w-4" /> Trade History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {closedTrades.slice(0, 20).map(trade => (
                <div key={trade.id} className="flex items-center justify-between p-2 rounded text-xs border border-border/50">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-[10px] ${trade.type === 'BUY' ? 'text-gain' : 'text-loss'}`}>
                      {trade.type}
                    </Badge>
                    <span className="font-mono">${trade.entryPrice.toFixed(2)} → ${trade.exitPrice?.toFixed(2)}</span>
                    {trade.status === 'STOPPED' && <Badge variant="outline" className="text-[10px] text-loss">SL</Badge>}
                  </div>
                  <span className={`font-mono font-medium ${(trade.pnl || 0) >= 0 ? 'text-gain' : 'text-loss'}`}>
                    {(trade.pnl || 0) >= 0 ? '+' : ''}${trade.pnl?.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
