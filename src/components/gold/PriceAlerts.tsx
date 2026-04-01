import { useState, useEffect, useCallback } from 'react';
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
  Bell, BellRing, Plus, Trash2, TrendingUp, TrendingDown,
  Send, Volume2, CheckCircle2
} from 'lucide-react';

interface PriceAlert {
  id: string;
  instrument: GoldInstrument;
  targetPrice: number;
  condition: 'above' | 'below';
  telegramChatId?: string;
  message?: string;
  triggered: boolean;
  createdAt: Date;
}

interface PriceAlertsProps {
  livePrices?: LiveGoldPrices | null;
  selectedInstrument: GoldInstrument;
}

export function PriceAlerts({ livePrices, selectedInstrument }: PriceAlertsProps) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [newPrice, setNewPrice] = useState('');
  const [newCondition, setNewCondition] = useState<'above' | 'below'>('above');
  const [newMessage, setNewMessage] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const { toast } = useToast();

  const currentPrice = livePrices
    ? (selectedInstrument === 'XAU/USD' ? livePrices.XAU : livePrices.XAG)
    : 0;

  // Check alerts on price change
  useEffect(() => {
    if (!currentPrice) return;

    setAlerts(prev => prev.map(alert => {
      if (alert.triggered || alert.instrument !== selectedInstrument) return alert;

      const shouldTrigger =
        (alert.condition === 'above' && currentPrice >= alert.targetPrice) ||
        (alert.condition === 'below' && currentPrice <= alert.targetPrice);

      if (shouldTrigger) {
        toast({
          title: '🔔 Price Alert Triggered!',
          description: `${alert.instrument} ${alert.condition === 'above' ? '↑' : '↓'} $${alert.targetPrice.toFixed(2)} — Current: $${currentPrice.toFixed(2)}`,
        });

        // Send Telegram notification
        if (alert.telegramChatId) {
          supabase.functions.invoke('price-alerts', {
            body: {
              action: 'notify',
              alert: {
                telegramChatId: alert.telegramChatId,
                message: `🔔 <b>Price Alert!</b>\n\n📊 ${alert.instrument}\n💰 Current: $${currentPrice.toFixed(2)}\n🎯 Target: $${alert.targetPrice.toFixed(2)} (${alert.condition})\n${alert.message ? `\n📝 ${alert.message}` : ''}`,
              }
            }
          }).catch(console.error);
        }

        return { ...alert, triggered: true };
      }
      return alert;
    }));
  }, [currentPrice, selectedInstrument, toast]);

  const addAlert = () => {
    const price = parseFloat(newPrice);
    if (!price || price <= 0) {
      toast({ title: 'Invalid price', variant: 'destructive' });
      return;
    }

    const alert: PriceAlert = {
      id: `ALERT-${Date.now()}`,
      instrument: selectedInstrument,
      targetPrice: price,
      condition: newCondition,
      telegramChatId: telegramChatId || undefined,
      message: newMessage || undefined,
      triggered: false,
      createdAt: new Date(),
    };

    setAlerts(prev => [alert, ...prev]);
    setNewPrice('');
    setNewMessage('');
    toast({ title: '✅ Alert Created', description: `${selectedInstrument} ${newCondition} $${price.toFixed(2)}` });
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const activeAlerts = alerts.filter(a => !a.triggered);
  const triggeredAlerts = alerts.filter(a => a.triggered);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="h-5 w-5 text-accent" />
          Price Alerts & Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Alert Form */}
        <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs">Target Price ($)</Label>
              <Input
                type="number"
                value={newPrice}
                onChange={e => setNewPrice(e.target.value)}
                placeholder={currentPrice ? currentPrice.toFixed(2) : '0.00'}
                className="h-8 font-mono"
              />
            </div>
            <div>
              <Label className="text-xs">Condition</Label>
              <Select value={newCondition} onValueChange={(v: 'above' | 'below') => setNewCondition(v)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="above">
                    <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-gain" /> Above</span>
                  </SelectItem>
                  <SelectItem value="below">
                    <span className="flex items-center gap-1"><TrendingDown className="h-3 w-3 text-loss" /> Below</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Telegram Chat ID</Label>
              <Input
                value={telegramChatId}
                onChange={e => setTelegramChatId(e.target.value)}
                placeholder="Optional"
                className="h-8 font-mono"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Alert message (optional)"
              className="h-8 text-xs"
            />
            <Button onClick={addAlert} size="sm" className="gap-1 shrink-0">
              <Plus className="h-4 w-4" /> Add Alert
            </Button>
          </div>
        </div>

        {/* Active Alerts */}
        <div>
          <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
            <Volume2 className="h-3 w-3" /> Active ({activeAlerts.length})
          </h4>
          {activeAlerts.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-3">No active alerts</p>
          ) : (
            <div className="space-y-1">
              {activeAlerts.map(alert => {
                const distancePercent = currentPrice
                  ? (((alert.targetPrice - currentPrice) / currentPrice) * 100)
                  : 0;
                return (
                  <div key={alert.id} className="flex items-center justify-between p-2 rounded-lg border border-border bg-card">
                    <div className="flex items-center gap-2">
                      <BellRing className={`h-4 w-4 ${alert.condition === 'above' ? 'text-gain' : 'text-loss'}`} />
                      <div>
                        <p className="text-sm font-mono">
                          {alert.instrument} {alert.condition === 'above' ? '≥' : '≤'} ${alert.targetPrice.toFixed(2)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {distancePercent >= 0 ? '+' : ''}{distancePercent.toFixed(2)}% from current
                          {alert.telegramChatId && ' • 📱 Telegram'}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => removeAlert(alert.id)} className="h-6 w-6 p-0">
                      <Trash2 className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Triggered Alerts */}
        {triggeredAlerts.length > 0 && (
          <div>
            <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Triggered ({triggeredAlerts.length})
            </h4>
            <div className="space-y-1">
              {triggeredAlerts.slice(0, 5).map(alert => (
                <div key={alert.id} className="flex items-center justify-between p-2 rounded-lg border border-border/50 bg-muted/10 opacity-60">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-gain" />
                    <p className="text-xs font-mono">
                      {alert.instrument} {alert.condition === 'above' ? '≥' : '≤'} ${alert.targetPrice.toFixed(2)}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">Triggered</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
