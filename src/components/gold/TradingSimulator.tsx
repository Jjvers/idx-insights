import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnimatedPrice } from './AnimatedPrice';
import type { GoldInstrument } from '@/types/gold';
import type { LiveGoldPrices } from '@/hooks/useGoldPrices';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  TrendingUp, TrendingDown, DollarSign, Play, Pause,
  RotateCcw, Wallet, Target, Shield, ArrowUpRight,
  ArrowDownRight, History, BarChart3, Zap, Minus, Plus
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
  telegramChatId?: string;
}

const INITIAL_BALANCES = [1000, 5000, 10000, 50000, 100000];

export function TradingSimulator({ livePrices, selectedInstrument, telegramChatId }: TradingSimulatorProps) {
  const [balance, setBalance] = useState(10000);
  const [initialBalance, setInitialBalance] = useState(10000);
  const [trades, setTrades] = useState<SimTrade[]>([]);
  const [units, setUnits] = useState(1);
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedPrices, setSimulatedPrices] = useState<SimulationPoint[]>([]);
  const [simPrice, setSimPrice] = useState<number | null>(null);
  const [simSpeed, setSimSpeed] = useState(50); // slider 1-100
  const [volatility, setVolatility] = useState(50); // slider 1-100
  const { toast } = useToast();

  const currentPrice = simPrice || (livePrices
    ? (selectedInstrument === 'XAU/USD' ? livePrices.XAU : livePrices.XAG)
    : 0);

  const openTrades = trades.filter(t => t.status === 'OPEN');
  const closedTrades = trades.filter(t => t.status !== 'OPEN');

  const unrealizedPnl = useMemo(() => {
    return openTrades.reduce((sum, t) => {
      const diff = t.type === 'BUY'
        ? (currentPrice - t.entryPrice) * t.units
        : (t.entryPrice - currentPrice) * t.units;
      return sum + diff;
    }, 0);
  }, [openTrades, currentPrice]);

  const realizedPnl = useMemo(() => closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0), [closedTrades]);

  const equity = balance + unrealizedPnl;
  const totalReturn = ((equity - initialBalance) / initialBalance) * 100;
  const winRate = closedTrades.length > 0
    ? (closedTrades.filter(t => (t.pnl || 0) > 0).length / closedTrades.length) * 100
    : 0;

  // Notify via Telegram
  const notifyTelegram = useCallback(async (message: string) => {
    if (!telegramChatId) return;
    try {
      await supabase.functions.invoke('price-alerts', {
        body: { action: 'notify', alert: { telegramChatId, message } }
      });
    } catch (err) {
      console.error('Telegram notify error:', err);
    }
  }, [telegramChatId]);

  // Check stop loss / take profit
  useEffect(() => {
    if (!currentPrice) return;
    setTrades(prev => prev.map(trade => {
      if (trade.status !== 'OPEN') return trade;

      if (trade.stopLoss) {
        const stopped = trade.type === 'BUY'
          ? currentPrice <= trade.stopLoss
          : currentPrice >= trade.stopLoss;
        if (stopped) {
          const slPnl = trade.type === 'BUY'
            ? (trade.stopLoss - trade.entryPrice) * trade.units
            : (trade.entryPrice - trade.stopLoss) * trade.units;
          setBalance(b => b + slPnl);
          toast({ title: '🛑 Stop Loss Hit', description: `${trade.instrument} ${trade.type} closed. PnL: $${slPnl.toFixed(2)}`, variant: 'destructive' });
          notifyTelegram(`🛑 <b>Stop Loss Hit!</b>\n\n📊 ${trade.instrument} ${trade.type}\n💰 Entry: $${trade.entryPrice.toFixed(2)}\n🛑 SL: $${trade.stopLoss.toFixed(2)}\n📉 PnL: $${slPnl.toFixed(2)}`);
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
          toast({ title: '🎯 Take Profit Hit!', description: `${trade.instrument} ${trade.type} closed. PnL: +$${tpPnl.toFixed(2)}` });
          notifyTelegram(`🎯 <b>Take Profit Hit!</b>\n\n📊 ${trade.instrument} ${trade.type}\n💰 Entry: $${trade.entryPrice.toFixed(2)}\n🎯 TP: $${trade.takeProfit.toFixed(2)}\n📈 PnL: +$${tpPnl.toFixed(2)}`);
          return { ...trade, status: 'CLOSED' as const, exitPrice: trade.takeProfit, pnl: tpPnl, closedAt: new Date() };
        }
      }
      return trade;
    }));
  }, [currentPrice, toast, notifyTelegram]);

  // Price simulation engine with user-controlled speed & volatility
  useEffect(() => {
    if (!isSimulating || !currentPrice) return;

    const speedMs = Math.max(100, 2200 - simSpeed * 20);
    const vol = (volatility / 100) * (selectedInstrument === 'XAU/USD' ? 0.002 : 0.004);

    const interval = setInterval(() => {
      setSimPrice(prev => {
        const base = prev || currentPrice;
        const change = (Math.random() - 0.48) * vol * base;
        const newPrice = Math.max(base * 0.95, base + change); // floor at -5%

        setSimulatedPrices(p => [
          ...p.slice(-150),
          { time: new Date().toLocaleTimeString(), price: newPrice, equity: balance + unrealizedPnl }
        ]);
        return newPrice;
      });
    }, speedMs);

    return () => clearInterval(interval);
  }, [isSimulating, simSpeed, volatility, selectedInstrument, balance, unrealizedPnl, currentPrice]);

  const executeTrade = useCallback(async (type: 'BUY' | 'SELL') => {
    if (!currentPrice) return;

    const sl = parseFloat(stopLoss) || undefined;
    const tp = parseFloat(takeProfit) || undefined;

    // Validation
    if (type === 'BUY') {
      if (sl && sl >= currentPrice) {
        toast({ title: '⚠️ Stop Loss harus di bawah harga saat ini untuk BUY', variant: 'destructive' });
        return;
      }
      if (tp && tp <= currentPrice) {
        toast({ title: '⚠️ Take Profit harus di atas harga saat ini untuk BUY', variant: 'destructive' });
        return;
      }
    } else {
      if (sl && sl <= currentPrice) {
        toast({ title: '⚠️ Stop Loss harus di atas harga saat ini untuk SELL', variant: 'destructive' });
        return;
      }
      if (tp && tp >= currentPrice) {
        toast({ title: '⚠️ Take Profit harus di bawah harga saat ini untuk SELL', variant: 'destructive' });
        return;
      }
    }

    const newTrade: SimTrade = {
      id: `SIM-${Date.now()}`,
      type,
      instrument: selectedInstrument,
      entryPrice: currentPrice,
      units,
      stopLoss: sl,
      takeProfit: tp,
      status: 'OPEN',
      openedAt: new Date(),
    };

    setTrades(prev => [newTrade, ...prev]);
    toast({
      title: `${type === 'BUY' ? '🟢' : '🔴'} ${type} Order Executed`,
      description: `${selectedInstrument} @ $${currentPrice.toFixed(2)} x ${units} units`,
    });

    notifyTelegram(
      `${type === 'BUY' ? '🟢' : '🔴'} <b>${type} Order Executed</b>\n\n` +
      `📊 ${selectedInstrument}\n💰 Price: $${currentPrice.toFixed(2)}\n📦 Units: ${units}\n` +
      `${sl ? `🛑 SL: $${sl.toFixed(2)}\n` : ''}${tp ? `🎯 TP: $${tp.toFixed(2)}\n` : ''}` +
      `\n<i>Paper Trading Simulator</i>`
    );
  }, [currentPrice, units, stopLoss, takeProfit, selectedInstrument, toast, notifyTelegram]);

  const closeTrade = useCallback((tradeId: string) => {
    setTrades(prev => prev.map(t => {
      if (t.id !== tradeId || t.status !== 'OPEN') return t;
      const pnl = t.type === 'BUY'
        ? (currentPrice - t.entryPrice) * t.units
        : (t.entryPrice - currentPrice) * t.units;
      setBalance(b => b + pnl);
      notifyTelegram(
        `📤 <b>Position Closed</b>\n\n📊 ${t.instrument} ${t.type}\n💰 Entry: $${t.entryPrice.toFixed(2)} → Exit: $${currentPrice.toFixed(2)}\n${pnl >= 0 ? '📈' : '📉'} PnL: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`
      );
      return { ...t, status: 'CLOSED' as const, exitPrice: currentPrice, pnl, closedAt: new Date() };
    }));
  }, [currentPrice, notifyTelegram]);

  const closeAllTrades = useCallback(() => {
    openTrades.forEach(t => closeTrade(t.id));
  }, [openTrades, closeTrade]);

  const resetSimulation = () => {
    setBalance(initialBalance);
    setTrades([]);
    setSimulatedPrices([]);
    setSimPrice(null);
    setIsSimulating(false);
  };

  // Quick SL/TP buttons
  const quickSL = (pct: number) => {
    if (!currentPrice) return;
    const sl = currentPrice * (1 - pct / 100);
    setStopLoss(sl.toFixed(2));
  };
  const quickTP = (pct: number) => {
    if (!currentPrice) return;
    const tp = currentPrice * (1 + pct / 100);
    setTakeProfit(tp.toFixed(2));
  };

  return (
    <div className="space-y-4">
      <Card className="border-accent/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent" />
              Trading Simulator
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={String(initialBalance)} onValueChange={v => { setInitialBalance(Number(v)); setBalance(Number(v)); setTrades([]); }}>
                <SelectTrigger className="w-28 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INITIAL_BALANCES.map(b => (
                    <SelectItem key={b} value={String(b)}>${b.toLocaleString()}</SelectItem>
                  ))}
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
                {isSimulating ? 'Pause' : 'Start'}
              </Button>
              <Button size="sm" variant="outline" onClick={resetSimulation} className="gap-1">
                <RotateCcw className="h-4 w-4" /> Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Simulation Controls */}
          <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-muted/20 border border-border">
            <div>
              <Label className="text-xs text-muted-foreground">Kecepatan Simulasi</Label>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-muted-foreground">🐢</span>
                <Slider value={[simSpeed]} onValueChange={v => setSimSpeed(v[0])} min={1} max={100} step={1} className="flex-1" />
                <span className="text-[10px] text-muted-foreground">🐇</span>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Volatilitas</Label>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-muted-foreground">Low</span>
                <Slider value={[volatility]} onValueChange={v => setVolatility(v[0])} min={1} max={100} step={1} className="flex-1" />
                <span className="text-[10px] text-muted-foreground">High</span>
              </div>
            </div>
          </div>

          {/* Portfolio Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground flex items-center gap-1"><Wallet className="h-3 w-3" /> Balance</p>
              <AnimatedPrice value={balance} decimals={2} className="text-lg font-bold" />
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground flex items-center gap-1"><DollarSign className="h-3 w-3" /> Equity</p>
              <AnimatedPrice value={equity} decimals={2} className={`text-lg font-bold ${equity >= initialBalance ? 'text-[hsl(var(--gain))]' : 'text-[hsl(var(--loss))]'}`} />
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">Unrealized P&L</p>
              <p className={`font-mono text-lg font-bold ${unrealizedPnl >= 0 ? 'text-[hsl(var(--gain))]' : 'text-[hsl(var(--loss))]'}`}>
                {unrealizedPnl >= 0 ? '+' : ''}{unrealizedPnl.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">Total Return</p>
              <p className={`font-mono text-lg font-bold ${totalReturn >= 0 ? 'text-[hsl(var(--gain))]' : 'text-[hsl(var(--loss))]'}`}>
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
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={simulatedPrices}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="time" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} interval="preserveStartEnd" />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} width={55} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="price" stroke="hsl(var(--accent))" dot={false} strokeWidth={2} />
                  {openTrades.map(t => (
                    <ReferenceLine key={t.id} y={t.entryPrice} stroke={t.type === 'BUY' ? 'hsl(var(--gain))' : 'hsl(var(--loss))'} strokeDasharray="4 4" label={{ value: `${t.type} $${t.entryPrice.toFixed(0)}`, fontSize: 9, fill: t.type === 'BUY' ? 'hsl(var(--gain))' : 'hsl(var(--loss))' }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Trade Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3 p-3 rounded-lg border border-border bg-muted/10">
              {/* Current Price Display */}
              <div className="text-center p-2 rounded-lg bg-card border border-border">
                <p className="text-xs text-muted-foreground">Harga Saat Ini</p>
                <AnimatedPrice value={currentPrice} decimals={2} className="text-2xl font-bold text-foreground" />
              </div>

              {/* Units with +/- */}
              <div>
                <Label className="text-xs">Units</Label>
                <div className="flex items-center gap-1 mt-1">
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => setUnits(Math.max(1, units - 1))}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input type="number" value={units} onChange={e => setUnits(Math.max(1, parseInt(e.target.value) || 1))} className="h-8 font-mono text-center" />
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => setUnits(units + 1)}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Stop Loss */}
              <div>
                <Label className="text-xs flex items-center gap-1"><Shield className="h-3 w-3" /> Stop Loss</Label>
                <Input type="number" value={stopLoss} onChange={e => setStopLoss(e.target.value)} placeholder="Optional" className="h-8 font-mono mt-1" />
                <div className="flex gap-1 mt-1">
                  {[0.5, 1, 2, 5].map(pct => (
                    <Button key={pct} size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={() => quickSL(pct)}>-{pct}%</Button>
                  ))}
                </div>
              </div>

              {/* Take Profit */}
              <div>
                <Label className="text-xs flex items-center gap-1"><Target className="h-3 w-3" /> Take Profit</Label>
                <Input type="number" value={takeProfit} onChange={e => setTakeProfit(e.target.value)} placeholder="Optional" className="h-8 font-mono mt-1" />
                <div className="flex gap-1 mt-1">
                  {[0.5, 1, 2, 5].map(pct => (
                    <Button key={pct} size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={() => quickTP(pct)}>+{pct}%</Button>
                  ))}
                </div>
              </div>

              {/* Buy/Sell Buttons */}
              <div className="flex gap-2">
                <Button onClick={() => executeTrade('BUY')} className="flex-1 bg-[hsl(var(--gain))] hover:bg-[hsl(var(--gain))]/80 text-white gap-1 h-10">
                  <ArrowUpRight className="h-4 w-4" /> BUY
                </Button>
                <Button onClick={() => executeTrade('SELL')} className="flex-1 bg-[hsl(var(--loss))] hover:bg-[hsl(var(--loss))]/80 text-white gap-1 h-10">
                  <ArrowDownRight className="h-4 w-4" /> SELL
                </Button>
              </div>
            </div>

            {/* Open Positions */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium flex items-center gap-1">
                  <History className="h-4 w-4" /> Open Positions ({openTrades.length})
                </h4>
                {openTrades.length > 1 && (
                  <Button size="sm" variant="outline" onClick={closeAllTrades} className="h-6 text-[10px]">
                    Close All
                  </Button>
                )}
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {openTrades.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Zap className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">Belum ada posisi terbuka</p>
                    <p className="text-[10px]">Mulai simulasi dan buka order pertama!</p>
                  </div>
                ) : (
                  openTrades.map(trade => {
                    const pnl = trade.type === 'BUY'
                      ? (currentPrice - trade.entryPrice) * trade.units
                      : (trade.entryPrice - currentPrice) * trade.units;
                    const pnlPct = ((pnl) / (trade.entryPrice * trade.units)) * 100;
                    return (
                      <div key={trade.id} className="p-2.5 rounded-lg border border-border bg-card">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={trade.type === 'BUY' ? 'bg-[hsl(var(--gain))]/10 text-[hsl(var(--gain))] border-[hsl(var(--gain))]/30' : 'bg-[hsl(var(--loss))]/10 text-[hsl(var(--loss))] border-[hsl(var(--loss))]/30'}>
                              {trade.type}
                            </Badge>
                            <div>
                              <p className="text-xs font-mono">${trade.entryPrice.toFixed(2)} × {trade.units}</p>
                              <div className="flex gap-2 text-[10px] text-muted-foreground">
                                {trade.stopLoss && <span>SL: ${trade.stopLoss.toFixed(2)}</span>}
                                {trade.takeProfit && <span>TP: ${trade.takeProfit.toFixed(2)}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <span className={`font-mono text-sm font-bold ${pnl >= 0 ? 'text-[hsl(var(--gain))]' : 'text-[hsl(var(--loss))]'}`}>
                                {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}
                              </span>
                              <p className={`text-[10px] font-mono ${pnl >= 0 ? 'text-[hsl(var(--gain))]' : 'text-[hsl(var(--loss))]'}`}>
                                {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                              </p>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => closeTrade(trade.id)} className="h-7 px-2 text-xs">
                              Close
                            </Button>
                          </div>
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
              <History className="h-4 w-4" /> Riwayat Trading ({closedTrades.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {closedTrades.slice(0, 30).map(trade => (
                <div key={trade.id} className="flex items-center justify-between p-2 rounded text-xs border border-border/50">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-[10px] ${trade.type === 'BUY' ? 'text-[hsl(var(--gain))]' : 'text-[hsl(var(--loss))]'}`}>
                      {trade.type}
                    </Badge>
                    <span className="font-mono">${trade.entryPrice.toFixed(2)} → ${trade.exitPrice?.toFixed(2)}</span>
                    <span className="text-muted-foreground">×{trade.units}</span>
                    {trade.status === 'STOPPED' && <Badge variant="outline" className="text-[10px] text-[hsl(var(--loss))]">SL</Badge>}
                  </div>
                  <span className={`font-mono font-medium ${(trade.pnl || 0) >= 0 ? 'text-[hsl(var(--gain))]' : 'text-[hsl(var(--loss))]'}`}>
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
