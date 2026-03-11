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
          <p className="text-lg text-gray-600 mb-2">Gold Investment Decision Support System</p>
          <p className="text-sm text-gray-500 mb-8">Multi-Criteria Evaluation & Market Intelligence Platform</p>
          <div className="w-24 h-0.5 bg-black mx-auto mb-8" />
          <div className="text-sm text-gray-500 space-y-1">
            <p>Version 2.0</p>
            <p>March 2026</p>
            <p className="mt-4">Prepared for Software Engineering Course</p>
            <p>Academic Presentation & Documentation</p>
          </div>
        </section>

        {/* TOC */}
        <section className="print:break-after-page">
          <h2 className="text-2xl font-bold border-b-2 border-black pb-2 mb-6">Table of Contents</h2>
          <ol className="space-y-2 text-sm">
            {[
              "Introduction",
              "Literature Review",
              "System Overview",
              "System Architecture",
              "Requirements Analysis",
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

        {/* ============================================ */}
        {/* CHAPTER 1: INTRODUCTION */}
        {/* ============================================ */}
        <section className="print:break-after-page mt-12 print:mt-0">
          <h2 className="text-2xl font-bold border-b-2 border-black pb-2 mb-4">1. Introduction</h2>

          <h3 className="text-lg font-semibold mt-6 mb-2">1.1 Background</h3>
          <p className="mb-3">
            Gold has been widely regarded as one of the most reliable investment instruments throughout history. It serves as a safe-haven asset, especially during times of economic turbulence, geopolitical tension, and inflationary pressure. Investors across the globe turn to gold as a hedge against currency devaluation, stock market crashes, and global uncertainty.
          </p>
          <p className="mb-3">
            However, making sound investment decisions in the gold market is not straightforward. It requires evaluating multiple factors simultaneously — such as price stability, historical volatility, return potential, liquidity, and broader macroeconomic conditions. Many retail investors still rely on fragmented information from various sources, subjective gut feelings, or overly simplified indicators, which often leads to inconsistent decisions and unnecessary risk exposure.
          </p>
          <p className="mb-3">
            To address this gap, a structured and objective decision-making framework is needed. A Multi-Criteria Decision Support System (DSS) offers a systematic way to evaluate and rank investment options based on measurable, weighted criteria that the user can define. This project — <strong>GO-IDX Analyze</strong> — proposes a web-based Gold Investment Decision Support System that combines real-time market data, technical analysis, AI-powered insights, and multi-criteria evaluation to help users make more rational and transparent investment decisions.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-2">1.2 Problem Statement</h3>
          <p className="mb-3">
            Although gold market data is widely accessible through various platforms and news outlets, investors still face several key challenges when trying to make well-informed decisions:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-3">
            <li><strong>Multi-criteria complexity:</strong> Evaluating multiple factors at once — such as price stability, return potential, volatility, and liquidity — is cognitively demanding and often overwhelming for individual investors.</li>
            <li><strong>Lack of transparency:</strong> Many existing platforms provide recommendations without clearly explaining the underlying methodology, which reduces user trust and makes it difficult to validate the results.</li>
            <li><strong>Subjective bias:</strong> Investment decisions are frequently influenced by emotions, media hype, or personal biases rather than a structured, data-driven evaluation process.</li>
            <li><strong>Limited customization:</strong> Few tools allow users to define and adjust their own evaluation criteria and weights according to their individual risk appetite and investment goals.</li>
          </ul>
          <p className="mb-3">
            Based on these challenges, the core research question addressed in this project is: <em>"How can a system provide an objective, transparent, and measurable mechanism to evaluate and rank gold investment options using multiple user-defined criteria, supported by real-time data and AI-powered analysis?"</em>
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-2">1.3 Project Objectives</h3>
          <p className="mb-2">The main objectives of this project are:</p>
          <ol className="list-decimal pl-6 space-y-2 mb-3">
            <li>To design and develop a web-based Gold Investment Decision Support System that integrates real-time market data with structured evaluation logic.</li>
            <li>To implement a multi-criteria scoring mechanism using data normalization, weighted evaluation, and AI-enhanced analysis.</li>
            <li>To provide transparent ranking results where users can see exactly how each criterion contributes to the final score.</li>
            <li>To minimize decision bias by replacing subjective judgment with a structured, quantitative, and repeatable evaluation framework.</li>
            <li>To present results through a clear, interactive, and user-friendly dashboard interface that supports both novice and experienced investors.</li>
          </ol>

          <h3 className="text-lg font-semibold mt-6 mb-2">1.4 Scope of the System</h3>
          <p className="mb-2">This system focuses on providing structured decision support for gold investment evaluation. The scope is defined as follows:</p>
          <p className="font-semibold mb-1">The system includes:</p>
          <ul className="list-disc pl-6 space-y-1 mb-3">
            <li>Real-time gold (XAU/USD) and silver (XAG/USD) price monitoring via external APIs</li>
            <li>Multi-criteria evaluation with user-defined weighting of criteria (stability, return potential, liquidity, volatility)</li>
            <li>Normalization of criteria values for fair cross-comparison</li>
            <li>Weighted scoring and automated ranking mechanism</li>
            <li>Technical analysis indicators (EMA, RSI, MACD, Fibonacci, Bollinger Bands)</li>
            <li>AI-powered prediction with scenario analysis and confidence scoring</li>
            <li>News sentiment analysis categorized by geopolitical, macroeconomic, and market factors</li>
            <li>Risk labeling, recommendation output, and interactive dashboard visualization</li>
          </ul>
          <p className="font-semibold mb-1">The system does NOT include:</p>
          <ul className="list-disc pl-6 space-y-1 mb-3">
            <li>Direct trading or order execution functionality</li>
            <li>Licensed financial advisory services</li>
            <li>Guaranteed return predictions or profit promises</li>
            <li>Automated investment execution or portfolio management</li>
          </ul>
          <p className="italic text-sm text-gray-600">This project is intended for analytical and educational purposes only.</p>

          <h3 className="text-lg font-semibold mt-6 mb-2">1.5 Target Users</h3>
          <table className="w-full border-collapse border border-gray-400 text-sm mt-2">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 px-3 py-2 text-left">User Type</th>
                <th className="border border-gray-400 px-3 py-2 text-left">Description</th>
                <th className="border border-gray-400 px-3 py-2 text-left">Primary Needs</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-400 px-3 py-2 font-medium">Retail Investors</td>
                <td className="border border-gray-400 px-3 py-2">Individuals who want a structured and rational approach to evaluating gold investment options</td>
                <td className="border border-gray-400 px-3 py-2">Objective scoring, transparent rankings, risk assessment</td>
              </tr>
              <tr>
                <td className="border border-gray-400 px-3 py-2 font-medium">Students & Researchers</td>
                <td className="border border-gray-400 px-3 py-2">Individuals studying decision support systems, financial analysis, or multi-criteria evaluation methods</td>
                <td className="border border-gray-400 px-3 py-2">Methodology transparency, data visualization, academic reference</td>
              </tr>
              <tr>
                <td className="border border-gray-400 px-3 py-2 font-medium">Beginner Investors</td>
                <td className="border border-gray-400 px-3 py-2">Users who require a simplified yet objective framework to assist in their first investment decisions</td>
                <td className="border border-gray-400 px-3 py-2">Easy-to-understand interface, guided evaluation, educational tooltips</td>
              </tr>
              <tr>
                <td className="border border-gray-400 px-3 py-2 font-medium">Market Analysts</td>
                <td className="border border-gray-400 px-3 py-2">Professionals who need multi-factor analysis tools with technical depth</td>
                <td className="border border-gray-400 px-3 py-2">Technical indicators, AI predictions, correlated asset tracking</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* ============================================ */}
        {/* CHAPTER 2: LITERATURE REVIEW */}
        {/* ============================================ */}
        <section className="print:break-after-page mt-12 print:mt-0">
          <h2 className="text-2xl font-bold border-b-2 border-black pb-2 mb-4">2. Literature Review</h2>

          <h3 className="text-lg font-semibold mt-6 mb-2">2.1 Decision Support Systems (DSS)</h3>
          <p className="mb-3">
            A Decision Support System (DSS) is an information system designed to assist decision-makers in solving semi-structured or unstructured problems by combining data, analytical models, and user-friendly interfaces. According to Sprague and Carlson (1982), a DSS should support rather than replace human judgment, providing tools that help users analyze situations and evaluate alternatives more effectively.
          </p>
          <p className="mb-3">
            In the context of financial investments, DSS has been widely adopted to help investors navigate complex decisions. Turban et al. (2011) categorize DSS into several types: data-driven, model-driven, knowledge-driven, and communication-driven systems. This project falls under the model-driven category, as it uses mathematical models — specifically multi-criteria scoring and normalization — to evaluate and rank investment alternatives.
          </p>
          <p className="mb-3">
            The key advantage of using a DSS in investment decisions is its ability to reduce cognitive overload. Instead of mentally juggling multiple factors, the user can offload the comparison logic to the system while still maintaining control over the criteria weights and preferences. This creates a balance between automation and human oversight, which is essential for building trust in the system's outputs.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-2">2.2 Multi-Criteria Decision Making (MCDM)</h3>
          <p className="mb-3">
            Multi-Criteria Decision Making (MCDM) is a branch of operations research that deals with evaluating and selecting alternatives based on multiple, often conflicting, criteria. MCDM methods are particularly useful when no single criterion can fully capture the quality of an alternative, and a trade-off analysis is required.
          </p>
          <p className="mb-3">
            Several well-established MCDM methods exist in the literature. The Simple Additive Weighting (SAW) method, also known as the Weighted Sum Model, is one of the most widely used due to its simplicity and interpretability. It works by normalizing criterion values and then computing a weighted sum to produce a final score for each alternative. Fishburn (1967) demonstrated that SAW is effective when criteria are independent and preferences can be expressed as linear weights.
          </p>
          <p className="mb-3">
            Other notable MCDM methods include TOPSIS (Technique for Order Preference by Similarity to Ideal Solution), which ranks alternatives based on their geometric distance from an ideal and anti-ideal solution (Hwang & Yoon, 1981); and AHP (Analytic Hierarchy Process), which uses pairwise comparisons to derive priority weights (Saaty, 1980). While these methods offer greater mathematical rigor, SAW remains a practical choice for systems targeting non-expert users due to its transparency and ease of explanation.
          </p>
          <p className="mb-3">
            In this project, a modified SAW approach is adopted, enhanced with AI-generated insights to provide not just a numerical score but also qualitative reasoning behind the evaluation results.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-2">2.3 Normalization Methods</h3>
          <p className="mb-3">
            Normalization is a critical preprocessing step in any MCDM system. Since evaluation criteria are often measured on different scales (e.g., price in USD, volatility as a percentage, liquidity as a volume count), raw values cannot be compared directly. Normalization transforms these values into a common scale — typically [0, 1] — to enable fair comparison.
          </p>
          <p className="mb-3">
            The most common normalization approaches include:
          </p>
          <table className="w-full border-collapse border border-gray-400 text-sm mb-3">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 px-3 py-2 text-left">Method</th>
                <th className="border border-gray-400 px-3 py-2 text-left">Formula</th>
                <th className="border border-gray-400 px-3 py-2 text-left">When to Use</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-400 px-3 py-2 font-medium">Min-Max</td>
                <td className="border border-gray-400 px-3 py-2 font-mono text-xs">(x - min) / (max - min)</td>
                <td className="border border-gray-400 px-3 py-2">When the range of values is known and bounded</td>
              </tr>
              <tr>
                <td className="border border-gray-400 px-3 py-2 font-medium">Max Normalization</td>
                <td className="border border-gray-400 px-3 py-2 font-mono text-xs">x / max(x)</td>
                <td className="border border-gray-400 px-3 py-2">When all values are positive and a proportional scale is preferred</td>
              </tr>
              <tr>
                <td className="border border-gray-400 px-3 py-2 font-medium">Z-Score</td>
                <td className="border border-gray-400 px-3 py-2 font-mono text-xs">(x - μ) / σ</td>
                <td className="border border-gray-400 px-3 py-2">When data follows a normal distribution</td>
              </tr>
              <tr>
                <td className="border border-gray-400 px-3 py-2 font-medium">Vector Normalization</td>
                <td className="border border-gray-400 px-3 py-2 font-mono text-xs">x / √(Σx²)</td>
                <td className="border border-gray-400 px-3 py-2">Used in TOPSIS for distance-based calculations</td>
              </tr>
            </tbody>
          </table>
          <p className="mb-3">
            This project primarily uses Min-Max normalization for benefit criteria (higher is better) and inverse Min-Max for cost criteria (lower is better, such as volatility). This approach ensures intuitive interpretation: a normalized score closer to 1 always indicates a more desirable outcome.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-2">2.4 Related Systems / Existing Platforms</h3>
          <p className="mb-3">
            Several existing platforms provide gold market data and analysis, but they differ significantly from the approach taken in this project:
          </p>
          <table className="w-full border-collapse border border-gray-400 text-sm mb-3">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 px-3 py-2 text-left">Platform</th>
                <th className="border border-gray-400 px-3 py-2 text-left">Features</th>
                <th className="border border-gray-400 px-3 py-2 text-left">Limitations</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-400 px-3 py-2 font-medium">TradingView</td>
                <td className="border border-gray-400 px-3 py-2">Advanced charting, community scripts, multi-asset support</td>
                <td className="border border-gray-400 px-3 py-2">No built-in MCDM scoring; relies on user expertise for interpretation</td>
              </tr>
              <tr>
                <td className="border border-gray-400 px-3 py-2 font-medium">Kitco</td>
                <td className="border border-gray-400 px-3 py-2">Real-time gold prices, news aggregation, expert commentary</td>
                <td className="border border-gray-400 px-3 py-2">Information-only platform; no structured evaluation or ranking mechanism</td>
              </tr>
              <tr>
                <td className="border border-gray-400 px-3 py-2 font-medium">GoldPrice.org</td>
                <td className="border border-gray-400 px-3 py-2">Price tracking in multiple currencies, historical charts</td>
                <td className="border border-gray-400 px-3 py-2">Minimal analysis tools; no AI features or multi-criteria comparison</td>
              </tr>
              <tr>
                <td className="border border-gray-400 px-3 py-2 font-medium">Bloomberg Terminal</td>
                <td className="border border-gray-400 px-3 py-2">Comprehensive market data, analytics, and trading tools</td>
                <td className="border border-gray-400 px-3 py-2">Expensive ($20K+/year); not accessible to retail or beginner investors</td>
              </tr>
            </tbody>
          </table>
          <p className="mb-3">
            GO-IDX Analyze differentiates itself by combining real-time market data with a transparent multi-criteria evaluation engine, AI-powered predictions, and an accessible web-based interface — all at no cost to the end user. The system bridges the gap between overly simplified price trackers and prohibitively expensive professional terminals.
          </p>
        </section>

        {/* ============================================ */}
        {/* CHAPTER 3: SYSTEM OVERVIEW */}
        {/* ============================================ */}
        <section className="print:break-after-page mt-12 print:mt-0">
          <h2 className="text-2xl font-bold border-b-2 border-black pb-2 mb-4">3. System Overview</h2>

          <h3 className="text-lg font-semibold mt-6 mb-2">3.1 System Description</h3>
          <p className="mb-3">
            GO-IDX Analyze is a web-based Gold Investment Decision Support System designed to help users evaluate and rank gold investment opportunities using a structured, multi-criteria approach. The system pulls real-time price data for gold (XAU/USD) and silver (XAG/USD) from the MetalpriceAPI, calculates a comprehensive set of technical indicators, runs AI-powered predictions, and presents everything through an interactive dashboard.
          </p>
          <p className="mb-3">
            Rather than simply predicting whether gold prices will go up or down, the system focuses on objective comparison and transparent evaluation. Users can see exactly how each technical indicator contributes to the overall assessment, what the AI model considers when generating its prediction, and how different scenarios (bullish vs. bearish) stack up against each other.
          </p>
          <p className="mb-3">
            The architecture follows a clean separation of concerns: the frontend handles all user interaction and visualization using React and Recharts, while the backend — powered by Lovable Cloud edge functions — manages API integrations, AI model communication, and data processing. This design ensures that sensitive API keys are never exposed to the client, and the system can scale independently across its layers.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-2">3.2 System Features</h3>
          <p className="mb-2">The main features of the system are organized into six core modules:</p>

          <div className="space-y-4 mb-4">
            <div className="border-l-4 border-gray-800 pl-4">
              <p className="font-semibold">1. Real-Time Price Monitoring</p>
              <p className="text-sm">Live XAU/USD and XAG/USD prices fetched from MetalpriceAPI with auto-refresh every 5 minutes. Displays current price, open, high, low, change amount, and percentage change with visual indicators.</p>
            </div>
            <div className="border-l-4 border-gray-800 pl-4">
              <p className="font-semibold">2. Multi-Criteria Evaluation Engine</p>
              <p className="text-sm">Normalizes raw market data across different scales and applies weighted scoring to produce an objective, quantitative evaluation. Technical indicators serve as the criteria, and their signals are aggregated into a composite score.</p>
            </div>
            <div className="border-l-4 border-gray-800 pl-4">
              <p className="font-semibold">3. Interactive Chart Visualization</p>
              <p className="text-sm">Candlestick charts with OHLC data that scale dynamically based on live prices. Supports multiple timeframes and toggling between chart types (candlestick, area). The final candle always reflects the current market price.</p>
            </div>
            <div className="border-l-4 border-gray-800 pl-4">
              <p className="font-semibold">4. AI-Powered Prediction & Scenario Analysis</p>
              <p className="text-sm">Uses Google Gemini AI to generate probabilistic buy/sell signals with dual scenario analysis (Option A: Bullish, Option B: Bearish). Each prediction includes confidence levels, risk/reward ratios, and per-indicator reasoning.</p>
            </div>
            <div className="border-l-4 border-gray-800 pl-4">
              <p className="font-semibold">5. News & Sentiment Analysis</p>
              <p className="text-sm">AI-generated market news categorized into Geopolitical, Macroeconomic, Demand, and Market categories. Each news item includes sentiment scoring (Bullish/Bearish/Neutral) with an overall market sentiment gauge.</p>
            </div>
            <div className="border-l-4 border-gray-800 pl-4">
              <p className="font-semibold">6. Transparent Explanation Panel</p>
              <p className="text-sm">Users can drill down into any evaluation result to see detailed breakdowns of how each criterion was scored, normalized, and weighted. This transparency builds trust and supports educational use.</p>
            </div>
          </div>

          <h3 className="text-lg font-semibold mt-6 mb-2">3.3 System Limitations</h3>
          <p className="mb-2">While the system provides robust decision support, it has several important limitations that users should be aware of:</p>
          <ul className="list-disc pl-6 space-y-2 mb-3">
            <li><strong>No trading execution:</strong> The system does not execute trades, place orders, or connect to any brokerage. It is purely an analytical tool.</li>
            <li><strong>No financial guarantee:</strong> Rankings and predictions are based on mathematical models and AI analysis. They do not guarantee investment returns and should not be treated as financial advice.</li>
            <li><strong>Data dependency:</strong> The accuracy of evaluations depends on the quality, timeliness, and availability of data from external APIs. API outages or rate limits may temporarily affect functionality.</li>
            <li><strong>Weight sensitivity:</strong> Ranking results are directly influenced by the criteria weights selected. Different weight configurations will produce different rankings, which is by design but requires user awareness.</li>
            <li><strong>AI limitations:</strong> The AI model (Gemini) generates predictions based on pattern recognition and provided context. It may occasionally produce overconfident or inconsistent outputs, which is why both bullish and bearish scenarios are always presented.</li>
            <li><strong>Not a substitute for professional advice:</strong> The platform is intended for analytical and educational purposes. Users should always consult qualified financial professionals before making investment decisions.</li>
          </ul>
        </section>

        {/* ============================================ */}
        {/* CHAPTER 4: SYSTEM ARCHITECTURE */}
        {/* ============================================ */}
        <section className="print:break-after-page mt-12 print:mt-0">
          <h2 className="text-2xl font-bold border-b-2 border-black pb-2 mb-4">4. System Architecture</h2>

          <h3 className="text-lg font-semibold mt-6 mb-2">4.1 Overall Architecture</h3>
          <p className="mb-3">
            The system follows a modern three-tier web architecture consisting of a Presentation Layer (frontend), an Application Layer (backend edge functions), and a Data Layer (external APIs and AI models). Communication between the frontend and backend occurs over HTTPS, with the backend serving as a secure proxy for external API calls and AI model interactions.
          </p>
          <div className="border border-gray-300 rounded p-4 bg-gray-50 text-sm font-mono whitespace-pre leading-6 mb-4">
{`┌──────────────────────────────────────────────────────┐
│           PRESENTATION LAYER (Frontend)              │
│                                                      │
│  React 18 + TypeScript + Vite                        │
│  ┌──────────┐ ┌───────────┐ ┌─────────────────────┐ │
│  │Dashboard │ │  Charts   │ │   Prediction Panel  │ │
│  │  Page    │ │ (Recharts)│ │   + News Sentiment  │ │
│  └─────┬────┘ └─────┬─────┘ └──────────┬──────────┘ │
│        └─────────────┼──────────────────┘            │
│                      │                               │
│             ┌────────▼──────────┐                    │
│             │  TanStack Query   │  State Management  │
│             │  + Custom Hooks   │  & Cache Layer     │
│             └────────┬──────────┘                    │
└──────────────────────┼───────────────────────────────┘
                       │ HTTPS (REST)
┌──────────────────────┼───────────────────────────────┐
│           APPLICATION LAYER (Backend)                │
│           Lovable Cloud Edge Functions               │
│                                                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│  │ gold-prices  │ │gold-prediction│ │  gold-news   │ │
│  │              │ │              │ │              │ │
│  │ MetalpriceAPI│ │ AI Gateway   │ │ AI Gateway   │ │
│  │ Integration  │ │ + Analysis   │ │ + Sentiment  │ │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ │
└─────────┼────────────────┼────────────────┼──────────┘
          │                │                │
┌─────────┼────────────────┼────────────────┼──────────┐
│              DATA LAYER (External Services)          │
│                                                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│  │MetalpriceAPI │ │ Google Gemini│ │ Google Gemini│ │
│  │ (XAU, XAG)   │ │ 2.5 Flash   │ │ 2.5 Flash   │ │
│  │ Live Prices  │ │ Predictions  │ │ News Gen     │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ │
└──────────────────────────────────────────────────────┘`}
          </div>

          <h3 className="text-lg font-semibold mt-6 mb-2">4.2 Frontend Architecture</h3>
          <p className="mb-3">
            The frontend is built as a Single Page Application (SPA) using React 18 with TypeScript. The component architecture follows a hierarchical structure where the main page component (<code>GoldAnalysis</code>) orchestrates several specialized child components, each responsible for a specific analytical domain.
          </p>
          <table className="w-full border-collapse border border-gray-400 text-sm mb-3">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 px-3 py-2 text-left">Component</th>
                <th className="border border-gray-400 px-3 py-2 text-left">Responsibility</th>
                <th className="border border-gray-400 px-3 py-2 text-left">Data Source</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["GoldAnalysis (Page)", "Main layout, instrument selection, live price ticker", "useGoldPrices hook"],
                ["GoldPriceCards", "XAU/USD and XAG/USD price cards with O/H/L/C", "Live prices from parent"],
                ["GoldChart", "Candlestick & area charts with scaled OHLC data", "Mock data + live price scaling"],
                ["TechnicalPanel", "RSI, MACD, EMA, Fibonacci, Bollinger indicators", "technicalIndicators.ts + live price"],
                ["PredictionPanel", "AI prediction with scenario analysis A/B", "useGoldPrediction hook"],
                ["NewsSentiment", "News feed with sentiment gauge", "useGoldNews hook"],
                ["FundamentalPanel", "Economic calendar & fundamental data", "Static mock data"],
                ["CorrelatedAssets", "Silver, DXY, Treasury correlation tracking", "Static mock data"],
              ].map(([comp, resp, data], i) => (
                <tr key={i}>
                  <td className="border border-gray-400 px-3 py-2 font-mono text-xs">{comp}</td>
                  <td className="border border-gray-400 px-3 py-2">{resp}</td>
                  <td className="border border-gray-400 px-3 py-2">{data}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="text-lg font-semibold mt-6 mb-2">4.3 Backend Architecture</h3>
          <p className="mb-3">
            The backend consists of three serverless edge functions deployed on Lovable Cloud. Each function is a Deno-based TypeScript handler that runs on-demand when invoked by the frontend. This architecture eliminates the need for a persistent server, reduces infrastructure costs, and ensures that API keys are never exposed to the client.
          </p>
          <table className="w-full border-collapse border border-gray-400 text-sm mb-3">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 px-3 py-2 text-left">Edge Function</th>
                <th className="border border-gray-400 px-3 py-2 text-left">Endpoint</th>
                <th className="border border-gray-400 px-3 py-2 text-left">Purpose</th>
                <th className="border border-gray-400 px-3 py-2 text-left">External Service</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-400 px-3 py-2 font-mono text-xs">gold-prices</td>
                <td className="border border-gray-400 px-3 py-2 font-mono text-xs">POST /gold-prices</td>
                <td className="border border-gray-400 px-3 py-2">Fetch live XAU/USD & XAG/USD prices</td>
                <td className="border border-gray-400 px-3 py-2">MetalpriceAPI</td>
              </tr>
              <tr>
                <td className="border border-gray-400 px-3 py-2 font-mono text-xs">gold-prediction</td>
                <td className="border border-gray-400 px-3 py-2 font-mono text-xs">POST /gold-prediction</td>
                <td className="border border-gray-400 px-3 py-2">Generate AI prediction with scenarios</td>
                <td className="border border-gray-400 px-3 py-2">Lovable AI (Gemini)</td>
              </tr>
              <tr>
                <td className="border border-gray-400 px-3 py-2 font-mono text-xs">gold-news</td>
                <td className="border border-gray-400 px-3 py-2 font-mono text-xs">POST /gold-news</td>
                <td className="border border-gray-400 px-3 py-2">Generate categorized market news</td>
                <td className="border border-gray-400 px-3 py-2">Lovable AI (Gemini)</td>
              </tr>
            </tbody>
          </table>

          <h3 className="text-lg font-semibold mt-6 mb-2">4.4 Component Interaction Diagram</h3>
          <div className="border border-gray-300 rounded p-4 bg-gray-50 text-sm font-mono whitespace-pre leading-6">
{`User Interaction Flow:

  ┌─────────┐     ┌──────────────┐     ┌─────────────────┐
  │  User   │────►│ GoldAnalysis │────►│ useGoldPrices   │
  │ (Browser)│     │  (Page)      │     │ (Auto-refresh)  │
  └─────────┘     └──────┬───────┘     └────────┬────────┘
                         │                      │
              ┌──────────┼──────────┐           │ POST /gold-prices
              ▼          ▼          ▼           ▼
        ┌──────────┐ ┌────────┐ ┌──────┐  ┌──────────┐
        │PriceCards│ │ Chart  │ │Tech  │  │Edge Func │
        │(XAU/XAG)│ │(OHLC)  │ │Panel │  │gold-price│
        └──────────┘ └────────┘ └──────┘  └────┬─────┘
                                               │
  User clicks "Generate Prediction"            ▼
        │                              ┌──────────────┐
        ▼                              │MetalpriceAPI │
  ┌──────────────┐                     └──────────────┘
  │useGoldPredict│
  │  (Hook)      │──► POST /gold-prediction
  └──────┬───────┘          │
         │                  ▼
         ▼           ┌──────────────┐
  ┌──────────────┐   │  Lovable AI  │
  │Prediction    │   │  (Gemini)    │
  │Panel (UI)    │   └──────────────┘
  └──────────────┘`}
          </div>
        </section>

        {/* ============================================ */}
        {/* CHAPTER 5: REQUIREMENTS ANALYSIS */}
        {/* ============================================ */}
        <section className="print:break-after-page mt-12 print:mt-0">
          <h2 className="text-2xl font-bold border-b-2 border-black pb-2 mb-4">5. Requirements Analysis</h2>

          <h3 className="text-lg font-semibold mt-6 mb-2">5.1 Functional Requirements</h3>
          <p className="mb-3">
            Functional requirements define the specific behaviors and capabilities the system must exhibit. Each requirement is assigned a priority level (Critical, High, or Medium) and includes acceptance criteria that must be met for the requirement to be considered fulfilled.
          </p>

          {[
            {
              id: "FR-01", name: "Real-Time Price Display", priority: "Critical",
              desc: "The system must fetch and display live gold (XAU/USD) and silver (XAG/USD) prices from an external API. Prices must include current price, open, high, low, change amount, and percentage change. Data must auto-refresh at a configurable interval (default: 5 minutes).",
              acceptance: ["Displays live XAU/USD and XAG/USD prices with LIVE badge", "Shows Open, High, Low values scaled to current live price", "Auto-refreshes every 5 minutes without user interaction", "Displays change amount and percentage with color-coded indicators (green/red)", "Handles API errors gracefully with fallback to last known values"],
            },
            {
              id: "FR-02", name: "Interactive Candlestick Chart", priority: "Critical",
              desc: "The system must render an interactive OHLC candlestick chart that dynamically scales based on the live price feed. Users should be able to switch between chart types (candlestick, area) and select different timeframes.",
              acceptance: ["Renders candlestick chart with green (bullish) and red (bearish) candles", "Supports multiple timeframes (5m, 15m, 1H, 4H, 1D)", "Final candle reflects the current live market price", "Area chart alternative with gradient fill", "Responsive design that works on both desktop and mobile"],
            },
            {
              id: "FR-03", name: "Technical Indicators Panel", priority: "High",
              desc: "The system must calculate and display key technical indicators based on the current live price. Each indicator must include its calculated value, interpretation (bullish/bearish/neutral), and a brief explanation of what it means.",
              acceptance: ["EMA (12/26) with crossover detection and signal", "RSI (14) with overbought (>70) / oversold (<30) zone identification", "MACD (12,26,9) with histogram visualization and signal line crossover", "Fibonacci retracement levels calculated from recent high/low", "Bollinger Bands (20,2) with squeeze/expansion detection", "All indicators recalculate when live price updates"],
            },
            {
              id: "FR-04", name: "AI-Powered Prediction Engine", priority: "Critical",
              desc: "The system must generate AI-powered market predictions using the Google Gemini model via the Lovable AI gateway. Predictions must be based on current live prices and calculated technical indicators, producing probabilistic assessments with dual-scenario analysis.",
              acceptance: ["Generates bullish/bearish probability percentages", "Provides Option A (Bullish) and Option B (Bearish) scenarios with triggers and targets", "Includes per-indicator reasoning explaining each signal's contribution", "Calculates risk/reward ratio for the primary recommendation", "Shows confidence level and signal strength", "Uses actual live price data, not hardcoded values"],
            },
            {
              id: "FR-05", name: "News & Sentiment Analysis", priority: "High",
              desc: "The system must provide AI-generated market news categorized by type (Geopolitical, Macroeconomic, Demand, Market) with individual sentiment scoring. An overall sentiment gauge must aggregate all news items into a single market sentiment indicator.",
              acceptance: ["Generates 6-8 categorized news items based on current market conditions", "Each news item has title, description, category tag, and sentiment label", "Overall sentiment gauge shows Bullish/Bearish/Neutral with visual indicator", "News refreshable on demand via button click", "Categories include Geopolitical, Macro, Demand, and Market"],
            },
            {
              id: "FR-06", name: "Correlated Assets Tracker", priority: "Medium",
              desc: "The system must display assets that are historically correlated with gold (Silver, DXY, Treasury Yields) along with their correlation coefficients and leading/lagging indicator classification.",
              acceptance: ["Shows correlation coefficient for each tracked asset", "Identifies whether each asset is a leading or lagging indicator", "Provides AI reasoning for the correlation behavior", "Visual indicators for positive vs inverse correlation"],
            },
            {
              id: "FR-07", name: "Instrument Selection", priority: "High",
              desc: "The system must allow users to switch between gold (XAU/USD) and silver (XAG/USD) instruments. Switching instruments must update all dependent components: price cards, charts, technical indicators, and predictions.",
              acceptance: ["Instrument selector in dashboard header", "Switching updates price cards, chart, and technical panel", "Selected instrument persists during the session", "Live price ticker in header shows both instruments simultaneously"],
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

          <h3 className="text-lg font-semibold mt-8 mb-2">5.2 Non-Functional Requirements</h3>
          <p className="mb-3">
            Non-functional requirements specify the quality attributes and operational constraints the system must satisfy. These requirements address how the system performs its functions rather than what functions it performs.
          </p>
          <table className="w-full border-collapse border border-gray-400 text-sm">
            <thead><tr className="bg-gray-100">
              <th className="border border-gray-400 px-3 py-2 text-left">ID</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Category</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Requirement</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Target Metric</th>
            </tr></thead>
            <tbody>
              {[
                ["NFR-01", "Performance", "Dashboard initial load time (first contentful paint)", "< 3 seconds on 4G connection"],
                ["NFR-02", "Performance", "AI prediction response time (end-to-end)", "< 15 seconds including API latency"],
                ["NFR-03", "Performance", "Live price refresh interval", "Every 5 minutes (configurable)"],
                ["NFR-04", "Availability", "System uptime during market hours", "99.5% monthly uptime"],
                ["NFR-05", "Usability", "Mobile responsive design", "All screens functional ≥ 320px width"],
                ["NFR-06", "Usability", "Learning curve for new users", "< 5 minutes to understand core features"],
                ["NFR-07", "Security", "API key protection", "All keys server-side only via Edge Functions"],
                ["NFR-08", "Security", "Data transmission encryption", "HTTPS/TLS for all API communications"],
                ["NFR-09", "Scalability", "Concurrent users supported", "1,000+ simultaneous sessions"],
                ["NFR-10", "Maintainability", "Component modularity", "Each feature in separate component file"],
                ["NFR-11", "Compatibility", "Browser support", "Chrome 90+, Firefox 88+, Safari 14+, Edge 90+"],
                ["NFR-12", "Reliability", "Graceful degradation on API failure", "Show cached/fallback data with warning"],
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

          <h3 className="text-lg font-semibold mt-8 mb-2">5.3 User Requirements</h3>
          <p className="mb-3">
            User requirements describe the system from the end-user's perspective — what they need to be able to do and what experience they expect. These are derived from the target user profiles identified in Section 1.5.
          </p>
          <table className="w-full border-collapse border border-gray-400 text-sm">
            <thead><tr className="bg-gray-100">
              <th className="border border-gray-400 px-3 py-2 text-left">ID</th>
              <th className="border border-gray-400 px-3 py-2 text-left">User Story</th>
              <th className="border border-gray-400 px-3 py-2 text-left">User Type</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Priority</th>
            </tr></thead>
            <tbody>
              {[
                ["UR-01", "As a retail investor, I want to see live gold prices so that I can monitor the market in real-time without switching between multiple platforms.", "Retail Investor", "Critical"],
                ["UR-02", "As a beginner, I want the system to explain what each technical indicator means so that I can learn while making decisions.", "Beginner", "High"],
                ["UR-03", "As an analyst, I want to see AI-generated predictions with detailed reasoning so that I can validate the analysis against my own assessment.", "Analyst", "Critical"],
                ["UR-04", "As a student, I want to see how the scoring and ranking mechanism works so that I can reference it in my academic work.", "Student", "Medium"],
                ["UR-05", "As a retail investor, I want to compare gold and silver side by side so that I can decide which precious metal better suits my portfolio.", "Retail Investor", "High"],
                ["UR-06", "As a beginner, I want the dashboard to be simple and not overwhelming so that I don't feel intimidated by complex financial data.", "Beginner", "High"],
                ["UR-07", "As an analyst, I want to see correlated assets and their relationship with gold so that I can understand broader market dynamics.", "Analyst", "Medium"],
                ["UR-08", "As any user, I want the system to clearly state that it is not financial advice so that I understand the limitations of the tool.", "All Users", "Critical"],
              ].map(([id, story, type, priority], i) => (
                <tr key={i}>
                  <td className="border border-gray-400 px-3 py-2 font-medium">{id}</td>
                  <td className="border border-gray-400 px-3 py-2">{story}</td>
                  <td className="border border-gray-400 px-3 py-2">{type}</td>
                  <td className="border border-gray-400 px-3 py-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${priority === 'Critical' ? 'bg-red-100 text-red-800' : priority === 'High' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                      {priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="text-lg font-semibold mt-8 mb-2">5.4 System Constraints</h3>
          <p className="mb-3">
            System constraints define the boundaries, limitations, and external dependencies that shape the system's design and implementation. These constraints must be acknowledged and planned for during development.
          </p>
          <table className="w-full border-collapse border border-gray-400 text-sm">
            <thead><tr className="bg-gray-100">
              <th className="border border-gray-400 px-3 py-2 text-left">ID</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Constraint</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Category</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Impact & Mitigation</th>
            </tr></thead>
            <tbody>
              {[
                ["SC-01", "MetalpriceAPI free tier limits requests to 100/month", "External API", "Implement 5-minute refresh interval and client-side caching to minimize API calls. Show cached data when limit is reached."],
                ["SC-02", "System runs entirely on client-side with serverless backend", "Architecture", "No persistent server means no WebSocket support for real-time streaming. Polling is used instead with configurable intervals."],
                ["SC-03", "AI model (Gemini) has token limits and may produce variable outputs", "AI/ML", "Structured JSON prompts with strict output schema. Fallback to rule-based analysis if AI response is malformed."],
                ["SC-04", "Frontend-only SPA with no native mobile app", "Platform", "Responsive design ensures mobile usability, but some complex charts may have reduced interactivity on small screens."],
                ["SC-05", "No user authentication or data persistence", "Data", "User preferences and session data are not saved between visits. Each session starts fresh with default settings."],
                ["SC-06", "Historical data uses scaled mock data, not actual historical API data", "Data Quality", "Mock OHLC data is scaled proportionally to match the live price, providing realistic but not historically accurate chart patterns."],
                ["SC-07", "Edge functions have a 60-second execution timeout", "Infrastructure", "AI predictions must complete within this window. Timeout handling returns partial results or cached predictions."],
                ["SC-08", "Project built on React + Vite stack (no SSR/SSG support)", "Technology", "SEO is limited to client-side rendering. Meta tags are set statically in index.html for basic search engine visibility."],
              ].map(([id, constraint, cat, impact], i) => (
                <tr key={i}>
                  <td className="border border-gray-400 px-3 py-2 font-medium">{id}</td>
                  <td className="border border-gray-400 px-3 py-2">{constraint}</td>
                  <td className="border border-gray-400 px-3 py-2">{cat}</td>
                  <td className="border border-gray-400 px-3 py-2">{impact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ============================================ */}
        {/* CHAPTER 6: DATA FLOW & TECHNICAL STACK */}
        {/* ============================================ */}
        <section className="print:break-after-page mt-12 print:mt-0">
          <h2 className="text-2xl font-bold border-b-2 border-black pb-2 mb-4">6. Data Flow & Technical Stack</h2>

          <h3 className="text-lg font-semibold mt-6 mb-2">6.1 Technology Stack</h3>
          <table className="w-full border-collapse border border-gray-400 text-sm">
            <thead><tr className="bg-gray-100">
              <th className="border border-gray-400 px-3 py-2 text-left">Layer</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Technology</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Version</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Purpose</th>
            </tr></thead>
            <tbody>
              {[
                ["Frontend Framework", "React", "18.3", "Component-based UI rendering"],
                ["Language", "TypeScript", "5.x", "Type safety and developer productivity"],
                ["Build Tool", "Vite", "5.x", "Fast HMR dev server and optimized production builds"],
                ["Styling", "Tailwind CSS + shadcn/ui", "3.x / Latest", "Utility-first CSS with pre-built accessible components"],
                ["Charts", "Recharts", "2.15", "Declarative charting library for React"],
                ["State Management", "TanStack Query", "5.x", "Server state caching, refetching, and synchronization"],
                ["Routing", "React Router", "6.x", "Client-side SPA navigation"],
                ["Backend", "Lovable Cloud (Deno Edge Functions)", "Latest", "Serverless API endpoints and AI gateway"],
                ["AI Model", "Google Gemini 2.5 Flash", "Latest", "Natural language prediction and news generation"],
                ["Price API", "MetalpriceAPI", "v1", "Live precious metal spot prices"],
              ].map(([layer, tech, ver, purpose], i) => (
                <tr key={i}>
                  <td className="border border-gray-400 px-3 py-2 font-medium">{layer}</td>
                  <td className="border border-gray-400 px-3 py-2">{tech}</td>
                  <td className="border border-gray-400 px-3 py-2">{ver}</td>
                  <td className="border border-gray-400 px-3 py-2">{purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="text-lg font-semibold mt-8 mb-2">6.2 Price Data Flow</h3>
          <div className="border border-gray-300 rounded p-4 bg-gray-50 text-sm font-mono whitespace-pre leading-6 mb-4">
{`Page Load / 5-min Interval
         │
         ▼
┌──────────────────┐
│ useGoldPrices    │  React Hook (TanStack Query)
│ Hook             │  refetchInterval: 300000ms
└────────┬─────────┘
         │ supabase.functions.invoke('gold-prices')
         ▼
┌──────────────────┐
│  Edge Function   │  Lovable Cloud (Deno)
│  gold-prices     │
└────────┬─────────┘
         │ GET metalpriceapi.com/v1/latest
         ▼
┌──────────────────┐
│  MetalpriceAPI   │  Returns: XAU, XAG rates
└────────┬─────────┘
         │ Transform & calculate changes
         ▼
┌──────────────────┐
│  Frontend State  │  Distributes to:
│  (livePrices)    │  → GoldPriceCards (O/H/L/C)
│                  │  → GoldChart (scaled OHLC)
│                  │  → TechnicalPanel (indicators)
│                  │  → Header ticker
└──────────────────┘`}
          </div>

          <h3 className="text-lg font-semibold mt-8 mb-2">6.3 AI Prediction Data Flow</h3>
          <div className="border border-gray-300 rounded p-4 bg-gray-50 text-sm font-mono whitespace-pre leading-6 mb-4">
{`User clicks "Generate AI Prediction"
         │
         ▼
┌──────────────────┐
│ useGoldPrediction│  Sends: instrument, livePrice,
│ Hook             │  indicators, market context
└────────┬─────────┘
         │ POST /gold-prediction
         ▼
┌──────────────────┐
│  Edge Function   │  Constructs structured prompt
│  gold-prediction │  with current market data
└────────┬─────────┘
         │ POST to Lovable AI Gateway
         ▼
┌──────────────────┐
│  Google Gemini   │  Analyzes indicators,
│  2.5 Flash       │  generates JSON response
└────────┬─────────┘
         │ Structured JSON output
         ▼
┌──────────────────┐
│ PredictionPanel  │  Displays:
│ Component        │  • Probability bar (Bull/Bear)
│                  │  • Signal & confidence
│                  │  • Scenario A (Bullish)
│                  │  • Scenario B (Bearish)
│                  │  • Per-indicator reasoning
│                  │  • Risk/Reward ratio
└──────────────────┘`}
          </div>

          <h3 className="text-lg font-semibold mt-8 mb-2">6.4 Indicator Calculation Flow</h3>
          <div className="border border-gray-300 rounded p-4 bg-gray-50 text-sm font-mono whitespace-pre leading-6">
{`Live Price (XAU or XAG)
     │
     ├──► Scale Factor = livePrice / mockLastClose
     │
     ├──► Scaled OHLCV Data (30 candles)
     │         │
     │         ├──► EMA(12) & EMA(26) ──► Crossover Signal
     │         │
     │         ├──► RSI(14) ──► Overbought/Oversold Zone
     │         │
     │         ├──► MACD(12,26,9) ──► Histogram + Signal
     │         │
     │         ├──► Bollinger(20,2) ──► Squeeze / Expansion
     │         │
     │         └──► Fibonacci ──► Retracement (23.6%, 38.2%, 50%, 61.8%)
     │
     └──► All indicators passed to AI Prediction Engine`}
          </div>
        </section>

        {/* ============================================ */}
        {/* CHAPTER 7: AI & ML FEATURES */}
        {/* ============================================ */}
        <section className="print:break-after-page mt-12 print:mt-0">
          <h2 className="text-2xl font-bold border-b-2 border-black pb-2 mb-4">7. AI & Machine Learning Features</h2>

          <h3 className="text-lg font-semibold mt-6 mb-2">7.1 Prediction Model</h3>
          <p className="mb-3">
            The prediction engine leverages Google's Gemini 2.5 Flash model through the Lovable AI gateway. Unlike traditional machine learning models that require training on historical datasets, this approach uses a large language model's reasoning capabilities to analyze current market conditions and generate structured predictions. The model receives a carefully constructed prompt containing live price data, calculated technical indicators, and market context, then produces a JSON-structured response with probabilistic assessments.
          </p>
          <table className="w-full border-collapse border border-gray-400 text-sm">
            <tbody>
              {[
                ["Model", "Google Gemini 2.5 Flash (via Lovable AI Gateway)"],
                ["Approach", "Prompt-based multi-factor analysis with structured JSON output"],
                ["Input Data", "Live price (XAU/XAG), RSI, MACD, EMA crossover, Bollinger Band position, Fibonacci levels, market sentiment"],
                ["Output", "Bullish/Bearish probability %, signal strength, dual scenario analysis (A/B), per-indicator reasoning, risk/reward ratio"],
                ["Latency", "5-15 seconds depending on model load and prompt complexity"],
                ["Fallback", "If AI response is malformed or times out, system falls back to rule-based indicator aggregation"],
              ].map(([k, v], i) => (
                <tr key={i}>
                  <td className="border border-gray-400 px-3 py-2 font-medium w-1/4">{k}</td>
                  <td className="border border-gray-400 px-3 py-2">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="text-lg font-semibold mt-6 mb-2">7.2 Scenario Analysis (Option A / B)</h3>
          <p className="mb-2">Every prediction includes two competing scenarios to prevent overconfidence and encourage balanced decision-making:</p>
          <table className="w-full border-collapse border border-gray-400 text-sm">
            <thead><tr className="bg-gray-100">
              <th className="border border-gray-400 px-3 py-2 text-left">Aspect</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Option A (Bullish)</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Option B (Bearish)</th>
            </tr></thead>
            <tbody>
              {[
                ["Scenario", "Breakout / Accumulation / Continuation", "Distribution / Correction / Reversal"],
                ["Triggers", "Support hold, volume surge, bullish divergence, positive sentiment", "Resistance rejection, declining volume, bearish cross, negative sentiment"],
                ["Target", "Next resistance level / Fibonacci extension", "Next support level / Fibonacci retracement"],
                ["Probability", "AI-calculated based on current indicator alignment", "Complementary probability (100% - Option A)"],
                ["Risk/Reward", "Calculated from entry to target vs. entry to stop-loss", "Inverse risk/reward from bearish perspective"],
              ].map(([aspect, a, b], i) => (
                <tr key={i}>
                  <td className="border border-gray-400 px-3 py-2 font-medium">{aspect}</td>
                  <td className="border border-gray-400 px-3 py-2">{a}</td>
                  <td className="border border-gray-400 px-3 py-2">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="text-lg font-semibold mt-6 mb-2">7.3 News Sentiment Engine</h3>
          <p className="mb-3">
            The news sentiment module uses the same Gemini AI model to generate contextually relevant market news based on current gold and silver prices. Each news item is categorized and scored for sentiment, providing users with a quick overview of the factors that might be influencing the market.
          </p>
          <table className="w-full border-collapse border border-gray-400 text-sm mb-3">
            <thead><tr className="bg-gray-100">
              <th className="border border-gray-400 px-3 py-2 text-left">Category</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Description</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Example Topics</th>
            </tr></thead>
            <tbody>
              {[
                ["Geopolitical", "Events related to international relations, conflicts, and political instability", "Trade wars, sanctions, military conflicts, elections"],
                ["Macroeconomic", "Economic indicators, central bank policies, and fiscal events", "Interest rate decisions, inflation data, GDP reports, employment figures"],
                ["Demand", "Physical and industrial demand dynamics for precious metals", "Central bank buying, jewelry demand, ETF flows, mining supply"],
                ["Market", "Technical market events and trading-specific factors", "Options expiry, margin calls, liquidity events, institutional positioning"],
              ].map(([cat, desc, examples], i) => (
                <tr key={i}>
                  <td className="border border-gray-400 px-3 py-2 font-medium">{cat}</td>
                  <td className="border border-gray-400 px-3 py-2">{desc}</td>
                  <td className="border border-gray-400 px-3 py-2">{examples}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="text-lg font-semibold mt-6 mb-2">7.4 Correlated Asset Detection</h3>
          <p className="mb-2">The system tracks assets that historically move in correlation with gold to provide broader market context:</p>
          <table className="w-full border-collapse border border-gray-400 text-sm">
            <thead><tr className="bg-gray-100">
              <th className="border border-gray-400 px-3 py-2 text-left">Asset</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Type</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Correlation</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Reasoning</th>
            </tr></thead>
            <tbody>
              {[
                ["Silver (XAG/USD)", "Leading (+)", "+0.85", "Industrial and monetary demand often moves ahead of gold during risk-on periods"],
                ["DXY (USD Index)", "Inverse (-)", "-0.78", "Strong dollar weakens gold which is priced in USD globally"],
                ["10Y US Treasury", "Inverse (-)", "-0.65", "Higher yields increase the opportunity cost of holding non-yielding gold"],
                ["S&P 500 (SPX)", "Variable", "-0.30 to +0.20", "Relationship varies: negative during crisis (flight to safety), positive during liquidity expansion"],
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
        </section>

        {/* ============================================ */}
        {/* CHAPTER 8: RISK ANALYSIS */}
        {/* ============================================ */}
        <section className="mt-12 print:mt-0">
          <h2 className="text-2xl font-bold border-b-2 border-black pb-2 mb-4">8. Risk Analysis & Mitigation</h2>

          <p className="mb-3">
            Every software project carries inherent risks that can affect its delivery, performance, and user trust. This section identifies the key risks associated with GO-IDX Analyze and outlines the mitigation strategies implemented to minimize their impact.
          </p>

          <table className="w-full border-collapse border border-gray-400 text-sm">
            <thead><tr className="bg-gray-100">
              <th className="border border-gray-400 px-3 py-2 text-left">Risk ID</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Risk Description</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Impact</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Probability</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Mitigation Strategy</th>
            </tr></thead>
            <tbody>
              {[
                ["R-01", "API rate limiting exhausts monthly quota", "High", "Medium", "5-minute polling interval, client-side caching, graceful fallback to last known values with timestamp warning"],
                ["R-02", "AI model produces hallucinated or inaccurate predictions", "High", "Low-Medium", "Always present dual scenarios (A/B), cross-validate with rule-based indicators, display confidence levels and disclaimers"],
                ["R-03", "Market data delay causes stale price display", "Medium", "Medium", "Display last-updated timestamp prominently, auto-refresh with visual countdown, warn users of potential delays"],
                ["R-04", "AI model overconfidence in one-sided predictions", "High", "Medium", "Force complementary scenario generation, cap maximum confidence at 85%, include mandatory risk disclaimer"],
                ["R-05", "Edge function timeout (>60s) during AI processing", "Medium", "Low", "Implement request timeout handling, return partial results or cached prediction, notify user of delay"],
                ["R-06", "Browser performance degradation with heavy chart rendering", "Medium", "Low", "Lazy load chart components, limit visible data points, use React.memo for expensive renders"],
                ["R-07", "User misinterprets predictions as guaranteed financial advice", "Critical", "Medium", "Prominent disclaimers on every prediction, clear 'educational purposes only' labeling, no action-oriented language like 'buy now'"],
                ["R-08", "External API service discontinuation or pricing changes", "High", "Low", "Modular API integration design allowing easy swap of data providers, fallback to alternative free APIs"],
              ].map(([id, risk, impact, prob, mitigation], i) => (
                <tr key={i}>
                  <td className="border border-gray-400 px-3 py-2 font-medium">{id}</td>
                  <td className="border border-gray-400 px-3 py-2">{risk}</td>
                  <td className="border border-gray-400 px-3 py-2">{impact}</td>
                  <td className="border border-gray-400 px-3 py-2">{prob}</td>
                  <td className="border border-gray-400 px-3 py-2">{mitigation}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Disclaimer & End */}
          <div className="mt-10 pt-6 border-t border-gray-300 text-center text-sm text-gray-500">
            <p className="font-semibold text-black mb-1">Disclaimer</p>
            <p>
              GO-IDX Analyze is an analytical tool developed for educational and informational purposes only. 
              It does not constitute financial advice, investment recommendation, or solicitation to trade. 
              Users should conduct their own independent research and consult qualified financial advisors 
              before making any investment decisions. The developers and contributors of this project assume 
              no liability for any financial losses resulting from the use of this system. Past performance 
              and AI-generated predictions do not guarantee future results.
            </p>
            <p className="mt-6 font-semibold text-black">— End of Document —</p>
            <p className="mt-2 text-xs text-gray-400">GO-IDX Analyze v2.0 | Software Requirements Specification | March 2026</p>
          </div>
        </section>
      </article>
    </>
  );
};

export default Requirements;
