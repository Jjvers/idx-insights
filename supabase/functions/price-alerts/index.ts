import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TELEGRAM_GATEWAY_URL = 'https://connector-gateway.lovable.dev/telegram';

interface PriceAlert {
  id: string;
  instrument: string;
  targetPrice: number;
  condition: 'above' | 'below';
  currentPrice: number;
  telegramChatId?: string;
  message?: string;
}

async function sendTelegramAlert(message: string, chatId: string) {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  const TELEGRAM_API_KEY = Deno.env.get('TELEGRAM_API_KEY');
  
  if (!LOVABLE_API_KEY || !TELEGRAM_API_KEY) return;

  try {
    await fetch(`${TELEGRAM_GATEWAY_URL}/sendMessage`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': TELEGRAM_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });
  } catch (err) {
    console.error('Telegram alert error:', err);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, alert } = await req.json();

    if (action === 'check') {
      // Check if alert should be triggered
      const { alerts, prices } = await req.json();
      const triggered: PriceAlert[] = [];

      for (const a of (alerts || [])) {
        const currentPrice = prices?.[a.instrument] || 0;
        if (
          (a.condition === 'above' && currentPrice >= a.targetPrice) ||
          (a.condition === 'below' && currentPrice <= a.targetPrice)
        ) {
          triggered.push({ ...a, currentPrice });
          
          if (a.telegramChatId) {
            const emoji = a.condition === 'above' ? '📈' : '📉';
            const msg = `${emoji} <b>Price Alert Triggered!</b>\n\n` +
              `📊 ${a.instrument}\n` +
              `💰 Current: $${currentPrice.toFixed(2)}\n` +
              `🎯 Target: $${a.targetPrice.toFixed(2)} (${a.condition})\n` +
              `${a.message ? `\n📝 ${a.message}` : ''}`;
            await sendTelegramAlert(msg, a.telegramChatId);
          }
        }
      }

      return new Response(JSON.stringify({ success: true, triggered }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === 'notify') {
      // Send manual notification
      if (alert?.telegramChatId) {
        await sendTelegramAlert(
          alert.message || 'Gold Price Alert',
          alert.telegramChatId
        );
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, message: 'Alert registered' }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Price alerts error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
