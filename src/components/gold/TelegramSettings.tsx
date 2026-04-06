import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  TELEGRAM_BOT_USERNAME,
  getTelegramSetupHint,
  isValidTelegramChatId,
  normalizeTelegramChatId,
  sendTelegramNotification,
} from '@/lib/api/telegram';
import {
  Send, Bot, CheckCircle2, Copy, ExternalLink, MessageSquare, Settings, Info, AlertCircle, Users
} from 'lucide-react';

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
    const normalizedChatId = normalizeTelegramChatId(inputChatId);

    if (!normalizedChatId) {
      toast({ title: '❌ Chat ID kosong', description: 'Masukkan Chat ID atau Group ID Telegram', variant: 'destructive' });
      return;
    }

    if (!isValidTelegramChatId(normalizedChatId)) {
      toast({
        title: '❌ Format Chat ID tidak valid',
        description: 'Gunakan angka dari @userinfobot, misalnya 123456789 atau -100123456789',
        variant: 'destructive'
      });
      return;
    }

    onChatIdChange(normalizedChatId);
    setInputChatId(normalizedChatId);
    setIsConnected(true);
    localStorage.setItem('telegram_chat_id', normalizedChatId);
    toast({ title: '💾 Chat ID tersimpan', description: `ID ${normalizedChatId} tersimpan. Lanjut klik "Kirim Pesan Test".` });
  };

  const testConnection = async () => {
    const normalizedChatId = normalizeTelegramChatId(inputChatId);

    if (!normalizedChatId) {
      toast({ title: '❌ Masukkan Chat ID dulu', variant: 'destructive' });
      return;
    }

    if (!isValidTelegramChatId(normalizedChatId)) {
      toast({
        title: '❌ Format Chat ID tidak valid',
        description: 'Gunakan angka dari @userinfobot, bukan username atau link Telegram.',
        variant: 'destructive'
      });
      return;
    }

    setIsTesting(true);
    try {
      await sendTelegramNotification(
        normalizedChatId,
        '🤖 <b>Gold AI Prediction Bot Connected!</b>\n\n✅ Koneksi Telegram berhasil!\n\nKamu akan menerima notifikasi:\n📊 Pergerakan harga emas & perak real-time\n🎯 Take Profit & Stop Loss tercapai\n📈 Sinyal trading & alert harga\n🔔 Price alerts otomatis dari server\n⚡ Order eksekusi simulator\n\n<i>Powered by GO-IDX Analyze Platform</i>'
      );
      onChatIdChange(normalizedChatId);
      setInputChatId(normalizedChatId);
      setIsConnected(true);
      localStorage.setItem('telegram_chat_id', normalizedChatId);
      toast({ title: '✅ Pesan test terkirim!', description: 'Cek Telegram kamu' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Telegram notification failed';
      setIsConnected(false);
      console.error('Telegram test error:', message);
      toast({ title: '❌ Gagal mengirim', description: getTelegramSetupHint(message), variant: 'destructive' });
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
    navigator.clipboard.writeText(`https://t.me/${TELEGRAM_BOT_USERNAME}`);
    toast({ title: '📋 Link bot di-copy!' });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-lg">
              <Send className="h-5 w-5 text-[hsl(199,89%,48%)]" />
              Telegram Settings
            </span>
            {isConnected && (
              <Badge className="bg-[hsl(var(--gain))]/20 text-[hsl(var(--gain))] border-[hsl(var(--gain))]/30">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Configured
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
               Klik tombol di bawah untuk membuka bot <code>@{TELEGRAM_BOT_USERNAME}</code> di Telegram, lalu tekan <b>Start</b>.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                 onClick={() => window.open(`https://t.me/${TELEGRAM_BOT_USERNAME}`, '_blank')}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                 Buka @{TELEGRAM_BOT_USERNAME}
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
              Step 2: Dapatkan Chat ID
            </h4>
            <div className="text-xs text-muted-foreground mb-3 space-y-2">
              <p><b>Cara mendapatkan Chat ID:</b></p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Buka Telegram, cari bot <code>@userinfobot</code></li>
                <li>Klik <b>Start</b> pada bot tersebut</li>
                <li>Bot akan membalas dengan informasi kamu, termasuk <b>Id</b> (angka)</li>
                <li>Copy angka <b>Id</b> tersebut dan paste di bawah</li>
              </ol>
              <div className="mt-2 p-2 rounded bg-card border border-border">
                <p className="font-medium text-foreground mb-1">📱 Contoh balasan @userinfobot:</p>
                <pre className="text-[10px] text-muted-foreground font-mono leading-relaxed">
{`@username
Id: 123456789
First: John
Last: Doe
Lang: en`}
                </pre>
                <p className="text-[10px] mt-1">👆 Copy angka setelah "Id:" → <code>123456789</code></p>
              </div>
              <div className="mt-2 p-2 rounded bg-card border border-border">
                <p className="font-medium text-foreground mb-1">👥 Untuk grup Telegram:</p>
                <ol className="list-decimal pl-4 space-y-0.5 text-[11px]">
                  <li>Tambahkan <code>@{TELEGRAM_BOT_USERNAME}</code> ke dalam grup</li>
                  <li>Tambahkan juga <code>@userinfobot</code> ke grup (sementara)</li>
                  <li>Kirim pesan apapun di grup</li>
                  <li>Bot <code>@userinfobot</code> akan membalas dengan Group ID (biasanya mulai dengan <code>-</code>)</li>
                  <li>Copy Group ID dan paste di bawah</li>
                  <li>Remove <code>@userinfobot</code> dari grup (sudah tidak diperlukan)</li>
                </ol>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 mt-2"
                onClick={() => window.open('https://t.me/userinfobot', '_blank')}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Buka @userinfobot
              </Button>
            </div>
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
                { icon: '🤖', label: 'Alert otomatis dari server (cron)' },
                { icon: '📰', label: 'Berita pasar penting' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>{item.icon}</span> {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* Important Info */}
          <div className="p-3 rounded-lg border border-[hsl(var(--warning))]/30 bg-[hsl(var(--warning))]/5">
            <h4 className="text-xs font-medium mb-1 flex items-center gap-1 text-[hsl(var(--warning))]">
              <AlertCircle className="h-3.5 w-3.5" />
              Penting
            </h4>
            <ul className="text-[11px] text-muted-foreground space-y-1">
              <li>• Server-side cron job berjalan setiap menit untuk cek alert</li>
              <li>• Notifikasi dikirim otomatis tanpa perlu web terbuka</li>
                <li>• Pastikan bot <code>@{TELEGRAM_BOT_USERNAME}</code> sudah di-Start</li>
              <li>• Untuk grup: pastikan bot sudah ditambahkan sebagai member</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
