import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TELEGRAM_GATEWAY_URL = 'https://connector-gateway.lovable.dev/telegram';

async function sendTelegramAlert(message: string, chatId: string) {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  const TELEGRAM_API_KEY = Deno.env.get('TELEGRAM_API_KEY');
  
  if (!LOVABLE_API_KEY || !TELEGRAM_API_KEY) {
    console.log('Telegram keys not configured, skipping notification');
    return;
  }

  try {
    const res = await fetch(`${TELEGRAM_GATEWAY_URL}/sendMessage`, {
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
    if (!res.ok) {
      const errText = await res.text();
      console.error('Telegram send failed:', res.status, errText);
    }
  } catch (err) {
    console.error('Telegram alert error:', err);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Fetch current gold prices from GoldAPI
    const GOLDAPI_API_KEY = Deno.env.get("GOLDAPI_API_KEY");
    if (!GOLDAPI_API_KEY) {
      throw new Error("GOLDAPI_API_KEY is not configured");
    }

    const [xauRes, xagRes] = await Promise.all([
      fetch("https://www.goldapi.io/api/XAU/USD", {
        headers: { "x-access-token": GOLDAPI_API_KEY, "Content-Type": "application/json" },
      }),
      fetch("https://www.goldapi.io/api/XAG/USD", {
        headers: { "x-access-token": GOLDAPI_API_KEY, "Content-Type": "application/json" },
      }),
    ]);

    let xauPrice = 0;
    let xagPrice = 0;
    let xauChange = 0;
    let xagChange = 0;

    if (xauRes.ok) {
      const xauData = await xauRes.json();
      xauPrice = xauData.price || 0;
      xauChange = xauData.chp || 0;
    }
    if (xagRes.ok) {
      const xagData = await xagRes.json();
      xagPrice = xagData.price || 0;
      xagChange = xagData.chp || 0;
    }

    console.log(`Check-alerts: XAU=$${xauPrice} (${xauChange}%), XAG=$${xagPrice} (${xagChange}%)`);

    // Check for significant price movements (>1% change)
    const significantMove = Math.abs(xauChange) > 1 || Math.abs(xagChange) > 1;

    // Parse body for any stored alerts + chatId
    let alerts: any[] = [];
    let chatId = '';
    try {
      const body = await req.json();
      alerts = body.alerts || [];
      chatId = body.chatId || '';
    } catch {
      // cron calls with empty body, that's fine
    }

    const triggered: any[] = [];

    // Check custom alerts
    for (const alert of alerts) {
      const price = alert.instrument === 'XAU/USD' ? xauPrice : xagPrice;
      if (!price) continue;

      const shouldTrigger =
        (alert.condition === 'above' && price >= alert.targetPrice) ||
        (alert.condition === 'below' && price <= alert.targetPrice);

      if (shouldTrigger) {
        triggered.push({ ...alert, currentPrice: price });
        
        const targetChatId = alert.telegramChatId || chatId;
        if (targetChatId) {
          const emoji = alert.condition === 'above' ? '📈' : '📉';
          await sendTelegramAlert(
            `${emoji} <b>🔔 Server Alert Triggered!</b>\n\n` +
            `📊 ${alert.instrument}\n` +
            `💰 Current: $${price.toFixed(2)}\n` +
            `🎯 Target: $${alert.targetPrice.toFixed(2)} (${alert.condition})\n` +
            `${alert.message ? `\n📝 ${alert.message}` : ''}\n\n` +
            `<i>⏰ Auto-checked by server cron job</i>`,
            targetChatId
          );
        }
      }
    }

    // Send significant movement alerts
    if (significantMove && chatId) {
      const moves: string[] = [];
      if (Math.abs(xauChange) > 1) {
        const emoji = xauChange > 0 ? '🟢📈' : '🔴📉';
        moves.push(`${emoji} XAU/USD: $${xauPrice.toFixed(2)} (${xauChange > 0 ? '+' : ''}${xauChange.toFixed(2)}%)`);
      }
      if (Math.abs(xagChange) > 1) {
        const emoji = xagChange > 0 ? '🟢📈' : '🔴📉';
        moves.push(`${emoji} XAG/USD: $${xagPrice.toFixed(2)} (${xagChange > 0 ? '+' : ''}${xagChange.toFixed(2)}%)`);
      }
      
      await sendTelegramAlert(
        `⚡ <b>Significant Price Movement!</b>\n\n${moves.join('\n')}\n\n<i>⏰ Auto-detected by server monitoring</i>`,
        chatId
      );
    }

    return new Response(JSON.stringify({
      success: true,
      prices: { XAU: xauPrice, XAG: xagPrice },
      changes: { XAU: xauChange, XAG: xagChange },
      triggered: triggered.length,
      significantMove,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Check-alerts error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
