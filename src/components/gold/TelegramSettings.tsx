import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Send, Bot, CheckCircle2, Copy, ExternalLink, MessageSquare, Settings
} from 'lucide-react';

const BOT_USERNAME = 'GoldAnalysisBot'; // Users should update this to their actual bot username

interface TelegramSettingsProps {
  chatId: string;
  onChatIdChange: (id: string) => void;
}

export function TelegramSettings({ chatId, onChatIdChange }: TelegramSettingsProps) {
  const [inputChatId, setInputChatId] = useState(chatId);
  const [isTesting, setIsTesting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setInputChatId(chatId);
    setIsConnected(!!chatId);
  }, [chatId]);

  const saveChatId = () => {
    if (!inputChatId.trim()) {
      toast({ title: '❌ Chat ID kosong', description: 'Masukkan Chat ID atau Group ID Telegram', variant: 'destructive' });
      return;
    }
    onChatIdChange(inputChatId.trim());
    setIsConnected(true);
    localStorage.setItem('telegram_chat_id', inputChatId.trim());
    toast({ title: '✅ Telegram Terhubung!', description: `Chat ID: ${inputChatId.trim()} tersimpan` });
  };

  const testConnection = async () => {
    if (!inputChatId.trim()) {
      toast({ title: '❌ Masukkan Chat ID dulu', variant: 'destructive' });
      return;
    }
    setIsTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('price-alerts', {
        body: {
          action: 'notify',
          alert: {
            telegramChatId: inputChatId.trim(),
            message: '🤖 <b>Gold Analysis Bot Connected!</b>\n\n✅ Koneksi Telegram berhasil!\n\nKamu akan menerima notifikasi:\n📊 Pergerakan harga emas & perak\n🎯 Take Profit & Stop Loss\n📈 Sinyal trading\n🔔 Price alerts\n\n<i>Powered by Gold Analysis Platform</i>',
          }
        }
      });
      if (error) throw error;
      toast({ title: '✅ Pesan test terkirim!', description: 'Cek Telegram kamu' });
    } catch (err) {
      toast({ title: '❌ Gagal mengirim', description: 'Pastikan Chat ID benar dan bot sudah di-start', variant: 'destructive' });
    } finally {
      setIsTesting(false);
    }
  };

  const disconnect = () => {
    onChatIdChange('');
    setInputChatId('');
    setIsConnected(false);
    localStorage.removeItem('telegram_chat_id');
    toast({ title: 'Telegram terputus' });
  };

  const copyBotLink = () => {
    navigator.clipboard.writeText(`https://t.me/${BOT_USERNAME}`);
    toast({ title: '📋 Link bot di-copy!' });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-lg">
            <Send className="h-5 w-5 text-[hsl(199,89%,48%)]" />
            Telegram Settings
          </span>
          {isConnected && (
            <Badge className="bg-[hsl(var(--gain))]/20 text-[hsl(var(--gain))] border-[hsl(var(--gain))]/30">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Connected
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Step 1: Bot Setup */}
        <div className="p-3 rounded-lg border border-border bg-muted/20">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
            <Bot className="h-4 w-4 text-accent" />
            Step 1: Mulai Bot Telegram
          </h4>
          <p className="text-xs text-muted-foreground mb-3">
            Klik tombol di bawah untuk membuka bot di Telegram, lalu tekan <b>Start</b>.
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => window.open(`https://t.me/${BOT_USERNAME}`, '_blank')}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Buka Bot di Telegram
            </Button>
            <Button size="sm" variant="ghost" onClick={copyBotLink} className="gap-1">
              <Copy className="h-3.5 w-3.5" /> Copy Link
            </Button>
          </div>
        </div>

        {/* Step 2: Get Chat ID */}
        <div className="p-3 rounded-lg border border-border bg-muted/20">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4 text-accent" />
            Step 2: Masukkan Chat ID
          </h4>
          <p className="text-xs text-muted-foreground mb-3">
            Untuk <b>personal</b>: kirim <code>/start</code> ke bot, lalu lihat Chat ID di balasan.<br/>
            Untuk <b>grup</b>: tambahkan bot ke grup, lalu kirim <code>/chatid</code>. ID grup biasanya mulai dengan <code>-</code>.
          </p>
          <div className="flex gap-2">
            <Input
              value={inputChatId}
              onChange={e => setInputChatId(e.target.value)}
              placeholder="e.g. 123456789 atau -100123456789"
              className="h-9 font-mono text-sm"
            />
            <Button size="sm" onClick={saveChatId} className="gap-1 shrink-0">
              <CheckCircle2 className="h-3.5 w-3.5" /> Simpan
            </Button>
          </div>
        </div>

        {/* Step 3: Test */}
        <div className="p-3 rounded-lg border border-border bg-muted/20">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
            <Settings className="h-4 w-4 text-accent" />
            Step 3: Test Koneksi
          </h4>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={testConnection}
              disabled={isTesting || !inputChatId.trim()}
              className="gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              {isTesting ? 'Mengirim...' : 'Kirim Pesan Test'}
            </Button>
            {isConnected && (
              <Button size="sm" variant="destructive" onClick={disconnect} className="gap-1">
                Disconnect
              </Button>
            )}
          </div>
        </div>

        {/* Notification Types */}
        <div className="p-3 rounded-lg border border-border bg-muted/10">
          <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Notifikasi yang akan diterima:</h4>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { icon: '📈', label: 'Harga naik/turun signifikan' },
              { icon: '🎯', label: 'Take Profit tercapai' },
              { icon: '🛑', label: 'Stop Loss tercapai' },
              { icon: '🔔', label: 'Price alert terpicu' },
              { icon: '📊', label: 'Sinyal trading baru' },
              { icon: '⚡', label: 'Order eksekusi simulator' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>{item.icon}</span> {item.label}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
