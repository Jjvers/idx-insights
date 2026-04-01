import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TELEGRAM_GATEWAY_URL = 'https://connector-gateway.lovable.dev/telegram';

interface TradeSignal {
  action: 'BUY' | 'SELL' | 'CLOSE';
  instrument: string; // XAU_USD or XAG_USD
  units: number;
  price?: number;
  stopLoss?: number;
  takeProfit?: number;
  reason?: string;
  telegramChatId?: string;
  notifyEmail?: string;
}

async function sendTelegramNotification(message: string, chatId: string) {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  const TELEGRAM_API_KEY = Deno.env.get('TELEGRAM_API_KEY');
  
  if (!LOVABLE_API_KEY || !TELEGRAM_API_KEY) {
    console.warn('Telegram keys not configured, skipping notification');
    return;
  }

  try {
    const response = await fetch(`${TELEGRAM_GATEWAY_URL}/sendMessage`, {
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

    if (!response.ok) {
      const data = await response.json();
      console.error(`Telegram notification failed [${response.status}]:`, data);
    }
  } catch (err) {
    console.error('Telegram notification error:', err);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signal: TradeSignal = await req.json();

    if (!signal.action || !signal.instrument || !signal.units) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Missing required fields: action, instrument, units" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Format instrument for OANDA (XAU_USD -> XAU/USD display)
    const displayInstrument = signal.instrument.replace('_', '/');
    const timestamp = new Date().toISOString();

    // Build trade execution result (simulation or live)
    const tradeResult = {
      orderId: `ORD-${Date.now()}`,
      action: signal.action,
      instrument: signal.instrument,
      units: signal.units,
      price: signal.price || 0,
      stopLoss: signal.stopLoss,
      takeProfit: signal.takeProfit,
      status: 'EXECUTED',
      timestamp,
    };

    // Send Telegram notification if chatId provided
    if (signal.telegramChatId) {
      const emoji = signal.action === 'BUY' ? '🟢' : signal.action === 'SELL' ? '🔴' : '⚪';
      const telegramMsg = `${emoji} <b>Trade ${signal.action}</b>\n\n` +
        `📊 <b>${displayInstrument}</b>\n` +
        `💰 Units: ${signal.units}\n` +
        `${signal.price ? `📈 Price: $${signal.price.toFixed(2)}\n` : ''}` +
        `${signal.stopLoss ? `🛑 Stop Loss: $${signal.stopLoss.toFixed(2)}\n` : ''}` +
        `${signal.takeProfit ? `🎯 Take Profit: $${signal.takeProfit.toFixed(2)}\n` : ''}` +
        `${signal.reason ? `\n📝 <i>${signal.reason}</i>\n` : ''}` +
        `\n🕐 ${timestamp}`;
      
      await sendTelegramNotification(telegramMsg, signal.telegramChatId);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      trade: tradeResult 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Trading webhook error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
