import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Requirements = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* Screen-only toolbar */}
      <div className="print:hidden sticky top-0 z-50 bg-background/95 backdrop-blur border-b px-6 py-3 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>
        <Button size="sm" onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-2" /> Save as PDF
        </Button>
      </div>

      {/* Document */}
      <article className="max-w-[210mm] mx-auto bg-white text-black px-[20mm] py-[15mm] print:p-0 print:max-w-none text-[11pt] leading-relaxed font-['Times_New_Roman',serif]">

        {/* Cover Page */}
        <section className="min-h-[250mm] flex flex-col justify-center items-center text-center print:break-after-page">
          <p className="text-sm tracking-[0.3em] uppercase text-gray-500 mb-4">Software Requirements Specification</p>
          <h1 className="text-4xl font-bold mb-2 tracking-tight">GO-IDX Analyze</h1>
          <p className="text-lg text-gray-600 mb-8">Gold & Market Intelligence Platform</p>
          <div className="w-24 h-0.5 bg-black mx-auto mb-8" />
          <div className="text-sm text-gray-500 space-y-1">
            <p>Version 1.0</p>
            <p>February 2026</p>
            <p className="mt-4">Prepared for Academic Presentation</p>
          </div>
        </section>

        {/* TOC */}
        <section className="print:break-after-page">
          <h2 className="text-2xl font-bold border-b-2 border-black pb-2 mb-6">Table of Contents</h2>
          <ol className="space-y-2 text-sm">
            {[
              "Introduction & Project Overview",
              "System Architecture",
              "Functional Requirements",
              "Use Case Diagram & Descriptions",
              "Non-Functional Requirements",
              "Data Flow & Technical Stack",
              "AI & Machine Learning Features",
              "Risk Analysis & Mitigation",
            ].map((item, i) => (
              <li key={i} className="flex justify-between border-b border-dotted border-gray-300 pb-1">
                <span>{i + 1}. {item}</span>
                <span className="text-gray-400">{i + 2}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* 1. Introduction */}
        <section className="print:break-after-page mt-12 print:mt-0">
          <h2 className="text-2xl font-bold border-b-2 border-black pb-2 mb-4">1. Introduction & Project Overview</h2>

          <h3 className="text-lg font-semibold mt-6 mb-2">1.1 Purpose</h3>
          <p>
            GO-IDX Analyze is an AI-powered gold market intelligence platform designed to provide retail investors
            and traders with institutional-grade analysis tools. The system combines technical analysis, fundamental
            data, sentiment analysis, and machine learning to generate actionable trading signals.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-2">1.2 Scope</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Real-time gold price monitoring (XAU/USD, Futures, Antam)</li>
            <li>Multi-indicator technical analysis (EMA, RSI, MACD, Fibonacci, Bollinger)</li>
            <li>AI-driven prediction with scenario analysis (Option A/B)</li>
            <li>Correlated asset tracking with leading/lagging indicator detection</li>
            <li>Geopolitical & macroeconomic news sentiment analysis</li>
            <li>Session gap (market open/close) exploitation analysis</li>
          </ul>

          <h3 className="text-lg font-semibold mt-6 mb-2">1.3 Target Users</h3>
          <table className="w-full border-collapse border border-gray-400 text-sm mt-2">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 px-3 py-2 text-left">User Type</th>
                <th className="border border-gray-400 px-3 py-2 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-400 px-3 py-2">Retail Trader</td><td className="border border-gray-400 px-3 py-2">Individual investor seeking data-driven gold trading decisions</td></tr>
              <tr><td className="border border-gray-400 px-3 py-2">Analyst</td><td className="border border-gray-400 px-3 py-2">Market professional requiring multi-factor analysis tools</td></tr>
              <tr><td className="border border-gray-400 px-3 py-2">Student/Researcher</td><td className="border border-gray-400 px-3 py-2">Academic studying market behavior and AI prediction models</td></tr>
            </tbody>
          </table>
        </section>

        {/* 2. System Architecture */}
        <section className="print:break-after-page mt-12 print:mt-0">
          <h2 className="text-2xl font-bold border-b-2 border-black pb-2 mb-4">2. System Architecture</h2>

          <h3 className="text-lg font-semibold mt-6 mb-2">2.1 High-Level Architecture</h3>
          <div className="border border-gray-300 rounded p-4 bg-gray-50 text-sm font-mono whitespace-pre leading-6">
{`┌──────────────────────────────────────────────┐
│              FRONTEND (React + Vite)         │
│  ┌─────────┐ ┌──────────┐ ┌───────────────┐ │
│  │Dashboard │ │  Charts  │ │  Prediction   │ │
│  │  Page    │ │ Component│ │    Panel      │ │
│  └────┬─────┘ └────┬─────┘ └──────┬────────┘ │
│       │             │              │          │
│       └─────────────┼──────────────┘          │
│                     │                         │
│            ┌────────▼─────────┐               │
│            │  TanStack Query  │               │
│            │  (State Mgmt)    │               │
│            └────────┬─────────┘               │
└─────────────────────┼────────────────────────┘
                      │ HTTPS
┌─────────────────────┼────────────────────────┐
│           BACKEND (Lovable Cloud)             │
│            ┌────────▼─────────┐               │
│            │  Edge Function   │               │
│            │ gold-prediction  │               │
│            └────────┬─────────┘               │
│                     │                         │
│         ┌───────────┼───────────┐             │
│         ▼           ▼           ▼             │
│   ┌──────────┐ ┌─────────┐ ┌────────┐        │
│   │ AI Model │ │ Market  │ │Database│        │
│   │(Gemini)  │ │  APIs   │ │        │        │
│   └──────────┘ └─────────┘ └────────┘        │
└──────────────────────────────────────────────┘`}
          </div>

          <h3 className="text-lg font-semibold mt-6 mb-2">2.2 Technology Stack</h3>
          <table className="w-full border-collapse border border-gray-400 text-sm">
            <thead><tr className="bg-gray-100">
              <th className="border border-gray-400 px-3 py-2 text-left">Layer</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Technology</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Purpose</th>
            </tr></thead>
            <tbody>
              {[
                ["Frontend", "React 18 + TypeScript", "UI Components & State"],
                ["Styling", "Tailwind CSS + shadcn/ui", "Design System"],
                ["Charts", "Recharts", "Candlestick & Indicator Visualization"],
                ["State", "TanStack Query v5", "Server State Management"],
                ["Backend", "Lovable Cloud Edge Functions", "API & AI Processing"],
                ["AI Model", "Google Gemini 2.5 Flash", "Prediction & Reasoning"],
                ["Routing", "React Router v6", "SPA Navigation"],
                ["Build", "Vite", "Dev Server & Bundling"],
              ].map(([layer, tech, purpose], i) => (
                <tr key={i}>
                  <td className="border border-gray-400 px-3 py-2 font-medium">{layer}</td>
                  <td className="border border-gray-400 px-3 py-2">{tech}</td>
                  <td className="border border-gray-400 px-3 py-2">{purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* 3. Functional Requirements */}
        <section className="print:break-after-page mt-12 print:mt-0">
          <h2 className="text-2xl font-bold border-b-2 border-black pb-2 mb-4">3. Functional Requirements</h2>

          {[
            {
              id: "FR-01", name: "AI Prediction Engine", priority: "Critical",
              desc: "Generate probabilistic buy/sell signals with scenario analysis (Option A: Bullish, Option B: Bearish/Distribution), including risk/reward ratio, confidence level, and per-indicator reasoning.",
              acceptance: ["Displays Bullish/Bearish probability bar", "Shows Option A & B scenarios with triggers and targets", "Provides reasoning for each technical indicator", "Calculates risk/reward ratio"],
            },
            {
              id: "FR-02", name: "Interactive Candlestick Chart", priority: "Critical",
              desc: "Display OHLC candlestick chart with volume overlay and toggleable technical indicator overlays.",
              acceptance: ["Renders candlestick with green/red coloring", "Supports multiple timeframes (5m, 15m, 1H, 4H, 1D)", "Overlays EMA, SMA, Bollinger Bands, Fibonacci levels"],
            },
            {
              id: "FR-03", name: "Technical Indicators Panel", priority: "High",
              desc: "Calculate and display key technical indicators with interpretation.",
              acceptance: ["EMA (12/26) with crossover detection", "RSI (14) with overbought/oversold zones", "MACD (12,26,9) with histogram", "Fibonacci retracement levels", "Bollinger Bands (20,2)"],
            },
            {
              id: "FR-04", name: "News & Sentiment Analysis", priority: "High",
              desc: "Aggregate and categorize market news with sentiment scoring, including geopolitical events impact analysis.",
              acceptance: ["Categorizes: Market, Geopolitics, Economic, Technical", "Sentiment gauge (Bullish/Bearish/Neutral)", "Geopolitical impact assessment on gold as safe haven"],
            },
            {
              id: "FR-05", name: "Correlated Assets Tracker", priority: "Medium",
              desc: "Monitor assets correlated with gold (Silver, Copper, DXY, Treasury Yields) and detect leading/lagging patterns.",
              acceptance: ["Shows correlation coefficient for each asset", "Identifies leading vs lagging indicators", "Provides AI reasoning for correlation behavior"],
            },
            {
              id: "FR-06", name: "Session Gap Analysis", priority: "Medium",
              desc: "Detect price gaps between market sessions and analyze gap-fill probability.",
              acceptance: ["Detects gaps between close and open prices", "Calculates gap-fill probability", "Provides trading implications for gap behavior"],
            },
          ].map((fr) => (
            <div key={fr.id} className="mb-6 border border-gray-300 rounded p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold">{fr.id}: {fr.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded ${fr.priority === 'Critical' ? 'bg-red-100 text-red-800' : fr.priority === 'High' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                  {fr.priority}
                </span>
              </div>
              <p className="text-sm mb-2">{fr.desc}</p>
              <p className="text-xs font-semibold mb-1">Acceptance Criteria:</p>
              <ul className="text-sm list-disc pl-5 space-y-0.5">
                {fr.acceptance.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </div>
          ))}
        </section>

        {/* 4. Use Cases */}
        <section className="print:break-after-page mt-12 print:mt-0">
          <h2 className="text-2xl font-bold border-b-2 border-black pb-2 mb-4">4. Use Case Descriptions</h2>

          <h3 className="text-lg font-semibold mt-6 mb-2">4.1 Use Case Diagram</h3>
          <div className="border border-gray-300 rounded p-4 bg-gray-50 text-sm font-mono whitespace-pre leading-6">
{`                    ┌─────────────────────────────┐
                    │      GO-IDX Analyze          │
                    │         System               │
                    │                              │
  ┌──────┐         │  ┌───────────────────────┐   │
  │      │─────────┼─►│ UC-01: View Prediction │   │
  │      │         │  └───────────────────────┘   │
  │      │         │  ┌───────────────────────┐   │
  │      │─────────┼─►│ UC-02: View Chart      │   │
  │ User │         │  └───────────────────────┘   │
  │      │         │  ┌───────────────────────┐   │
  │      │─────────┼─►│ UC-03: View Indicators │   │
  │      │         │  └───────────────────────┘   │
  │      │         │  ┌───────────────────────┐   │
  │      │─────────┼─►│ UC-04: View News       │   │
  │      │         │  └───────────────────────┘   │
  │      │         │  ┌───────────────────────┐   │
  │      │─────────┼─►│ UC-05: Change Timeframe│   │
  │      │         │  └───────────────────────┘   │
  │      │         │  ┌───────────────────────┐   │
  │      │─────────┼─►│ UC-06: View Correlation│   │
  └──────┘         │  └───────────────────────┘   │
                   │                               │
                   │  ── Internal System ──        │
                   │  • Fetch Price API            │
                   │  • Calculate Indicators       │
                   │  • Run AI Model               │
                   │  • Analyze Sentiment          │
                   │  • Detect Session Gaps         │
                   └───────────────────────────────┘`}
          </div>

          <h3 className="text-lg font-semibold mt-8 mb-2">4.2 UC-01: View AI Prediction (Primary)</h3>
          <table className="w-full border-collapse border border-gray-400 text-sm">
            <tbody>
              {[
                ["Use Case ID", "UC-01"],
                ["Name", "View AI Prediction"],
                ["Actor", "User (Trader / Analyst)"],
                ["Precondition", "Latest price data available, indicators calculated, AI model ready"],
                ["Main Flow", "1. User opens dashboard\n2. System fetches latest market data\n3. System calculates technical indicators\n4. System runs AI prediction model\n5. System displays: probability bar, signal, scenarios A/B, reasoning"],
                ["Postcondition", "User receives data-driven trading decision with confidence level"],
                ["Alternative Flow", "If API fails → show cached prediction with timestamp warning"],
              ].map(([k, v], i) => (
                <tr key={i}>
                  <td className="border border-gray-400 px-3 py-2 font-medium w-1/4 align-top">{k}</td>
                  <td className="border border-gray-400 px-3 py-2 whitespace-pre-line">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="text-lg font-semibold mt-8 mb-2">4.3 UC-02: View Gold Price Chart</h3>
          <table className="w-full border-collapse border border-gray-400 text-sm">
            <tbody>
              {[
                ["Use Case ID", "UC-02"],
                ["Actor", "User"],
                ["Main Flow", "1. User selects timeframe (5m/15m/1H/4H/1D)\n2. System renders candlestick chart\n3. User toggles indicators (EMA, RSI, MACD, Fibonacci)\n4. Chart updates with selected overlays"],
                ["Postcondition", "User sees visual price action with technical overlays"],
              ].map(([k, v], i) => (
                <tr key={i}>
                  <td className="border border-gray-400 px-3 py-2 font-medium w-1/4 align-top">{k}</td>
                  <td className="border border-gray-400 px-3 py-2 whitespace-pre-line">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* 5. NFR */}
        <section className="print:break-after-page mt-12 print:mt-0">
          <h2 className="text-2xl font-bold border-b-2 border-black pb-2 mb-4">5. Non-Functional Requirements</h2>

          <table className="w-full border-collapse border border-gray-400 text-sm">
            <thead><tr className="bg-gray-100">
              <th className="border border-gray-400 px-3 py-2 text-left">ID</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Category</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Requirement</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Target</th>
            </tr></thead>
            <tbody>
              {[
                ["NFR-01", "Performance", "Dashboard initial load time", "< 3 seconds"],
                ["NFR-02", "Performance", "AI prediction response time", "< 10 seconds"],
                ["NFR-03", "Availability", "System uptime", "99.5%"],
                ["NFR-04", "Usability", "Mobile responsive design", "All screens ≥ 320px"],
                ["NFR-05", "Security", "API key protection", "Server-side only via Edge Functions"],
                ["NFR-06", "Scalability", "Concurrent users supported", "1,000+ simultaneous"],
                ["NFR-07", "Maintainability", "Code coverage", "> 60% for core logic"],
                ["NFR-08", "Compatibility", "Browser support", "Chrome, Firefox, Safari, Edge"],
              ].map(([id, cat, req, target], i) => (
                <tr key={i}>
                  <td className="border border-gray-400 px-3 py-2 font-medium">{id}</td>
                  <td className="border border-gray-400 px-3 py-2">{cat}</td>
                  <td className="border border-gray-400 px-3 py-2">{req}</td>
                  <td className="border border-gray-400 px-3 py-2">{target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* 6. Data Flow */}
        <section className="print:break-after-page mt-12 print:mt-0">
          <h2 className="text-2xl font-bold border-b-2 border-black pb-2 mb-4">6. Data Flow</h2>

          <h3 className="text-lg font-semibold mt-6 mb-2">6.1 Prediction Data Flow</h3>
          <div className="border border-gray-300 rounded p-4 bg-gray-50 text-sm font-mono whitespace-pre leading-6">
{`User clicks "Generate Prediction"
        │
        ▼
┌──────────────────┐
│ useGoldPrediction│  React Hook (TanStack Query)
│ Hook             │
└────────┬─────────┘
         │ POST /gold-prediction
         ▼
┌──────────────────┐
│  Edge Function   │  Lovable Cloud
│  gold-prediction │
└────────┬─────────┘
         │
    ┌────┼────────────────┐
    ▼    ▼                ▼
┌──────┐ ┌─────────┐ ┌────────┐
│Market│ │Indicator │ │  News  │
│ Data │ │  Calc    │ │Sentiment│
└──┬───┘ └────┬────┘ └───┬────┘
   │          │           │
   └──────────┼───────────┘
              ▼
     ┌────────────────┐
     │  AI Model      │
     │ (Gemini 2.5)   │
     │                │
     │ Generates:     │
     │ • Probability  │
     │ • Scenarios A/B│
     │ • Reasoning    │
     │ • Gap Analysis │
     └────────┬───────┘
              │
              ▼
     ┌────────────────┐
     │ PredictionPanel│  React Component
     │ Component      │
     └────────────────┘`}
          </div>

          <h3 className="text-lg font-semibold mt-8 mb-2">6.2 Indicator Calculation Flow</h3>
          <div className="border border-gray-300 rounded p-4 bg-gray-50 text-sm font-mono whitespace-pre leading-6">
{`Raw OHLCV Data
    │
    ├──► EMA(12) & EMA(26) ──► Crossover Signal
    │
    ├──► RSI(14) ──► Overbought/Oversold Zone
    │
    ├──► MACD(12,26,9) ──► Histogram + Signal Line
    │
    ├──► Bollinger(20,2) ──► Squeeze / Expansion
    │
    └──► Fibonacci ──► Retracement Levels (23.6%, 38.2%, 50%, 61.8%)`}
          </div>
        </section>

        {/* 7. AI Features */}
        <section className="print:break-after-page mt-12 print:mt-0">
          <h2 className="text-2xl font-bold border-b-2 border-black pb-2 mb-4">7. AI & Machine Learning Features</h2>

          <h3 className="text-lg font-semibold mt-6 mb-2">7.1 Prediction Model</h3>
          <table className="w-full border-collapse border border-gray-400 text-sm">
            <tbody>
              {[
                ["Model", "Google Gemini 2.5 Flash (via Lovable AI)"],
                ["Input", "Technical indicators, sentiment scores, correlated asset data, fundamental data"],
                ["Output", "Bullish/Bearish probability, signal strength, scenario analysis, per-indicator reasoning"],
                ["Approach", "Multi-factor weighted analysis with AI-generated reasoning chain"],
              ].map(([k, v], i) => (
                <tr key={i}>
                  <td className="border border-gray-400 px-3 py-2 font-medium w-1/4">{k}</td>
                  <td className="border border-gray-400 px-3 py-2">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="text-lg font-semibold mt-6 mb-2">7.2 Correlated Asset Detection</h3>
          <p className="mb-2">The system tracks commodities and indices that historically move in correlation with gold:</p>
          <table className="w-full border-collapse border border-gray-400 text-sm">
            <thead><tr className="bg-gray-100">
              <th className="border border-gray-400 px-3 py-2 text-left">Asset</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Type</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Correlation</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Reasoning</th>
            </tr></thead>
            <tbody>
              {[
                ["Silver (XAG)", "Leading", "+0.85", "Industrial + monetary demand often moves ahead of gold"],
                ["Copper", "Leading", "+0.62", "Economic bellwether; rising copper signals risk-on sentiment"],
                ["DXY (USD Index)", "Inverse", "-0.78", "Strong dollar weakens gold priced in USD"],
                ["10Y Treasury", "Inverse", "-0.65", "Higher yields increase opportunity cost of holding gold"],
              ].map(([asset, type, corr, reason], i) => (
                <tr key={i}>
                  <td className="border border-gray-400 px-3 py-2 font-medium">{asset}</td>
                  <td className="border border-gray-400 px-3 py-2">{type}</td>
                  <td className="border border-gray-400 px-3 py-2">{corr}</td>
                  <td className="border border-gray-400 px-3 py-2">{reason}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="text-lg font-semibold mt-6 mb-2">7.3 Session Gap Analysis</h3>
          <p>
            The system detects price discrepancies between market session close and open ("gaps"). 
            Historically, ~70-80% of gaps get filled, making them exploitable signals. The AI evaluates 
            gap direction, size relative to ATR, and fill probability to generate trading implications.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-2">7.4 Scenario Analysis (Option A / B)</h3>
          <p className="mb-2">Every prediction includes two competing scenarios:</p>
          <table className="w-full border-collapse border border-gray-400 text-sm">
            <thead><tr className="bg-gray-100">
              <th className="border border-gray-400 px-3 py-2 text-left">Aspect</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Option A (Bullish)</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Option B (Bearish)</th>
            </tr></thead>
            <tbody>
              {[
                ["Scenario", "Breakout / Accumulation", "Distribution / Correction"],
                ["Triggers", "Support hold, volume surge, bullish divergence", "Resistance rejection, declining volume, bearish cross"],
                ["Target", "Next resistance / Fibonacci extension", "Next support / Fibonacci retracement"],
                ["Probability", "AI-calculated based on current data", "Complementary probability"],
              ].map(([aspect, a, b], i) => (
                <tr key={i}>
                  <td className="border border-gray-400 px-3 py-2 font-medium">{aspect}</td>
                  <td className="border border-gray-400 px-3 py-2">{a}</td>
                  <td className="border border-gray-400 px-3 py-2">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* 8. Risks */}
        <section className="mt-12 print:mt-0">
          <h2 className="text-2xl font-bold border-b-2 border-black pb-2 mb-4">8. Risk Analysis & Mitigation</h2>

          <table className="w-full border-collapse border border-gray-400 text-sm">
            <thead><tr className="bg-gray-100">
              <th className="border border-gray-400 px-3 py-2 text-left">Risk</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Impact</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Probability</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Mitigation</th>
            </tr></thead>
            <tbody>
              {[
                ["API rate limiting", "High", "Medium", "Implement caching layer, fallback to mock data"],
                ["AI hallucination in predictions", "High", "Low", "Cross-validate with rule-based indicators"],
                ["Market data delay", "Medium", "Medium", "Display last-updated timestamp, warn users"],
                ["Model overconfidence", "High", "Medium", "Always show both scenarios, include disclaimer"],
                ["Browser performance (heavy charts)", "Medium", "Low", "Lazy load indicators, virtualize data points"],
              ].map(([risk, impact, prob, mitigation], i) => (
                <tr key={i}>
                  <td className="border border-gray-400 px-3 py-2">{risk}</td>
                  <td className="border border-gray-400 px-3 py-2">{impact}</td>
                  <td className="border border-gray-400 px-3 py-2">{prob}</td>
                  <td className="border border-gray-400 px-3 py-2">{mitigation}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-10 pt-6 border-t border-gray-300 text-center text-sm text-gray-500">
            <p className="font-semibold text-black mb-1">Disclaimer</p>
            <p>
              GO-IDX Analyze is an analytical tool for educational and informational purposes only. 
              It does not constitute financial advice. Users should conduct their own research and 
              consult qualified financial advisors before making investment decisions. Past performance 
              and AI predictions do not guarantee future results.
            </p>
            <p className="mt-4">— End of Document —</p>
          </div>
        </section>
      </article>
    </>
  );
};

export default Requirements;
