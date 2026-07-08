import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  TrendingUp,
  MousePointerClick,
  ShoppingCart,
  DollarSign,
  Percent,
  RefreshCw,
  Clock,
  ArrowUpRight,
  TrendingDown,
  Activity,
  Award,
  ExternalLink,
  ChevronRight,
  Search,
  Globe,
  HelpCircle,
  FileSpreadsheet,
  Gauge
} from "lucide-react";

interface SummaryStats {
  totalTrackedLinks: number;
  activeLinksCount: number;
  totalClicksCount: number;
  totalConversions: number;
  avgClicksPerProduct: string;
  estimatedTotalCommissions: number;
}

interface PlatformShare {
  platform: string;
  count: number;
  clicks: number;
  percentage: number;
  revenue: number;
}

interface TopProduct {
  id: string;
  name: string;
  brand: string;
  image: string;
  marketplace: string;
  clicks: number;
  conversions: number;
  commission: number;
}

interface ActivityLog {
  id: string;
  text: string;
  badge: string;
  time: string;
  timestamp: number;
}

export const AnalyticsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [platformShare, setPlatformShare] = useState<PlatformShare[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [activeTab, setActiveTab] = useState<"traffic" | "comms">("traffic");
  const [simulating, setSimulating] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/analytics");
      if (!response.ok) {
        throw new Error("Server analytics error");
      }
      const data = await response.json();
      setSummary(data.summary);
      setPlatformShare(data.platformShare);
      setTopProducts(data.topPerforming);
      setLogs(data.recentLogs);
    } catch (err) {
      console.error("Failed to fetch server analytics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // Poll analytics every 10 seconds for live feel
    const interval = setInterval(fetchAnalytics, 10000);
    return () => clearInterval(interval);
  }, []);

  const triggerMockClick = async (productId: string, productName: string, platform: string) => {
    setSimulating(true);
    try {
      const res = await fetch("/api/analytics/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, productName, platform }),
      });
      if (res.ok) {
        // Fetch new state immediately
        await fetchAnalytics();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSimulating(false);
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "Shopee":
        return { text: "text-[#FF5722]", bg: "bg-[#FF5722]/10", border: "border-[#FF5722]/20", fill: "#FF5722" };
      case "Tokopedia":
        return { text: "text-[#03C569]", bg: "bg-[#03C569]/10", border: "border-[#03C569]/20", fill: "#03C569" };
      case "TikTok Shop":
        return { text: "text-slate-900 dark:text-slate-100", bg: "bg-slate-100 dark:bg-slate-800", border: "border-slate-250 dark:border-slate-700", fill: "#0F0F0F" };
      case "Lazada":
        return { text: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/20", border: "border-indigo-100 dark:border-indigo-900/30", fill: "#4F46E5" };
      default:
        return { text: "text-zinc-500", bg: "bg-zinc-50", border: "border-zinc-200", fill: "#71717A" };
    }
  };

  // 7-day stable timeline chart
  const daysOfWeek = ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon"];
  const getSvgPoints = () => {
    const values = activeTab === "traffic" 
      ? [150, 210, 185, 310, 275, 340, summary?.totalClicksCount || 380]
      : [45.5, 62.0, 55.4, 98.0, 84.5, 125.0, (summary?.estimatedTotalCommissions || 135) / 1000];
    
    const maxVal = Math.max(...values) * 1.15;
    const minVal = 0;
    const width = 600;
    const height = 180;
    const paddingX = 40;
    const paddingY = 20;

    const points = values.map((val, idx) => {
      const x = paddingX + (idx * (width - paddingX * 2)) / (values.length - 1);
      const y = height - paddingY - ((val - minVal) * (height - paddingY * 2)) / (maxVal - minVal);
      return { x, y, val, label: daysOfWeek[idx] };
    });

    const linePath = points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    const fillPath = `${linePath} L ${lastPoint.x} ${height - paddingY} L ${firstPoint.x} ${height - paddingY} Z`;

    return { points, linePath, fillPath, height, width, paddingX, paddingY };
  };

  const { points, linePath, fillPath, height: svgH, width: svgW, paddingY: padY } = getSvgPoints();

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-admin-border dark:border-admin-dark-border transition-colors duration-300">
        <div className="space-y-1.5">
          <h1 className="text-xl font-black uppercase tracking-tight text-slate-800 dark:text-slate-100 -skew-x-2 flex items-center gap-2">
            <Gauge className="w-6 h-6 text-admin-primary dark:text-admin-secondary shrink-0" />
            <span>Merchant Affiliate Analytics_</span>
          </h1>
          <p className="text-xs text-admin-text-secondary dark:text-admin-dark-text-secondary font-medium">
            Full-stack server consolidated data streams, redirect routing statistics, and commission allocations.
          </p>
        </div>
        <div className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-[8px] flex items-center gap-2 self-start">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Full-Stack Stream Sync Enabled</span>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center space-y-4 bg-white dark:bg-admin-dark-surface rounded-[24px] border border-admin-border dark:border-admin-dark-border">
          <RefreshCw className="w-8 h-8 text-admin-primary animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">CONNECTING TO NODE SERVER SERVICE...</p>
        </div>
      ) : (
        <>
          {/* Key Metric Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Clicks */}
            <div className="bg-white dark:bg-admin-dark-surface p-6 rounded-[24px] border border-admin-border dark:border-admin-dark-border shadow-sm flex items-center gap-4 transition-all">
              <div className="w-12 h-12 rounded-[16px] bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 flex items-center justify-center shrink-0">
                <MousePointerClick className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest block">Direct Redirects</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{summary?.totalClicksCount.toLocaleString()}</span>
                  <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1 py-0.5 rounded flex items-center gap-0.5">
                    <TrendingUp className="w-2.5 h-2.5" />
                    +14.2%
                  </span>
                </div>
              </div>
            </div>

            {/* Total Conversions */}
            <div className="bg-white dark:bg-admin-dark-surface p-6 rounded-[24px] border border-admin-border dark:border-admin-dark-border shadow-sm flex items-center gap-4 transition-all">
              <div className="w-12 h-12 rounded-[16px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center shrink-0">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest block">Attributed Sales</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{summary?.totalConversions.toLocaleString()}</span>
                  <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1 py-0.5 rounded flex items-center gap-0.5">
                    <TrendingUp className="w-2.5 h-2.5" />
                    +8.7%
                  </span>
                </div>
              </div>
            </div>

            {/* Est Commission */}
            <div className="bg-white dark:bg-admin-dark-surface p-6 rounded-[24px] border border-admin-border dark:border-admin-dark-border shadow-sm flex items-center gap-4 transition-all">
              <div className="w-12 h-12 rounded-[16px] bg-amber-50 dark:bg-amber-950/20 text-amber-500 flex items-center justify-center shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest block">Est. Commissions</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-black text-slate-800 dark:text-slate-100">
                    IDR {summary?.estimatedTotalCommissions.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>

            {/* Sync rate */}
            <div className="bg-white dark:bg-admin-dark-surface p-6 rounded-[24px] border border-admin-border dark:border-admin-dark-border shadow-sm flex items-center gap-4 transition-all">
              <div className="w-12 h-12 rounded-[16px] bg-pink-50 dark:bg-pink-950/20 text-pink-500 flex items-center justify-center shrink-0">
                <Percent className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest block">Average Conv. CTR</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-800 dark:text-slate-100">
                    {summary && summary.totalClicksCount > 0
                      ? ((summary.totalConversions / summary.totalClicksCount) * 100).toFixed(1)
                      : "0.0"}%
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">rate</span>
                </div>
              </div>
            </div>
          </div>

          {/* Core chart and Platform distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 7-Day interactive area chart */}
            <div className="lg:col-span-2 bg-white dark:bg-admin-dark-surface p-6 rounded-[24px] border border-admin-border dark:border-admin-dark-border shadow-sm transition-all flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-50 dark:border-slate-800/50 pb-5">
                <div className="space-y-1">
                  <h3 className="text-xs font-mono font-black uppercase tracking-widest text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-admin-primary" />
                    <span>Affiliate Performance Monitor</span>
                  </h3>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                    Outbound traffic metric timelines (Last 7 Days)
                  </p>
                </div>

                <div className="flex bg-slate-50 dark:bg-slate-900/50 p-1 rounded-[10px] border border-slate-100 dark:border-slate-800/50 shrink-0">
                  <button
                    onClick={() => setActiveTab("traffic")}
                    className={`px-3 py-1.5 rounded-[8px] text-[10px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer ${
                      activeTab === "traffic"
                        ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm border border-slate-100/50 dark:border-slate-700/50"
                        : "text-slate-400 dark:text-slate-500 hover:text-slate-600"
                    }`}
                  >
                    Traffic clicks
                  </button>
                  <button
                    onClick={() => setActiveTab("comms")}
                    className={`px-3 py-1.5 rounded-[8px] text-[10px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer ${
                      activeTab === "comms"
                        ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm border border-slate-100/50 dark:border-slate-700/50"
                        : "text-slate-400 dark:text-slate-500 hover:text-slate-600"
                    }`}
                  >
                    Commission (k IDR)
                  </button>
                </div>
              </div>

              {/* Svg area chart */}
              <div className="relative py-4 select-none h-56 flex items-center justify-center">
                <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF5722" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#FF5722" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  {[0.25, 0.5, 0.75].map((multiplier, idx) => {
                    const yPos = padY + (svgH - padY * 2) * multiplier;
                    return (
                      <line
                        key={idx}
                        x1="20"
                        y1={yPos}
                        x2={svgW - 20}
                        y2={yPos}
                        stroke="currentColor"
                        className="text-slate-100 dark:text-slate-800/40"
                        strokeDasharray="4,4"
                        strokeWidth="1.5"
                      />
                    );
                  })}

                  <path d={fillPath} fill="url(#areaGrad)" />

                  <line
                    x1="20"
                    y1={svgH - padY}
                    x2={svgW - 20}
                    y2={svgH - padY}
                    stroke="currentColor"
                    className="text-slate-200 dark:text-slate-800"
                    strokeWidth="1.5"
                  />

                  <path
                    d={linePath}
                    fill="none"
                    stroke="#FF5722"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {points.map((p, idx) => (
                    <g key={idx}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="4"
                        fill="#FFF"
                        stroke="#FF5722"
                        strokeWidth="2.5"
                      />
                      <text
                        x={p.x}
                        y={p.y - 10}
                        textAnchor="middle"
                        fill="currentColor"
                        className="text-slate-700 dark:text-slate-300 font-mono text-[9px] font-bold"
                      >
                        {activeTab === "comms" ? `${p.val}k` : Math.round(p.val)}
                      </text>
                      <text
                        x={p.x}
                        y={svgH - 4}
                        textAnchor="middle"
                        fill="currentColor"
                        className="text-slate-400 dark:text-slate-500 font-mono text-[9px] font-bold"
                      >
                        {p.label}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 p-4 rounded-[16px] text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 text-center">
                <span>SERVER TELEMETRY LINK STABLE // AUTOMATIC SEED SYNC SUCCESSFUL</span>
              </div>
            </div>

            {/* Platform contribution share */}
            <div className="bg-white dark:bg-admin-dark-surface p-6 rounded-[24px] border border-admin-border dark:border-admin-dark-border shadow-sm transition-all flex flex-col justify-between">
              <div className="space-y-1 pb-4 border-b border-slate-50 dark:border-slate-800/50">
                <h3 className="text-xs font-mono font-black uppercase tracking-widest text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-500" />
                  <span>Affiliate Platform Share</span>
                </h3>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                  Outbound channels commission & click weights
                </p>
              </div>

              <div className="flex-1 py-4 space-y-4">
                {platformShare.map((share, idx) => {
                  const colors = getPlatformColor(share.platform);
                  return (
                    <div key={idx} className="space-y-2 group/bar">
                      <div className="flex justify-between items-center text-xs">
                        <span className={`font-bold transition-colors uppercase tracking-wide ${colors.text}`}>
                          {share.platform}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-slate-400">
                          <span>{share.clicks} clicks</span>
                          <span className="text-slate-200 dark:text-slate-800">|</span>
                          <span className="text-slate-800 dark:text-slate-200">
                            IDR {Math.round(share.revenue).toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800/50">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${share.percentage}%` }}
                          transition={{ duration: 0.8, delay: idx * 0.1, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: colors.fill }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-50 dark:border-slate-800/50 text-[10px] font-mono text-slate-400 flex justify-between items-center">
                <span>COMMISSION COEFFICIENT:</span>
                <span className="font-bold text-slate-800 dark:text-white">5.0% flat-rate</span>
              </div>
            </div>
          </div>

          {/* Top performing products catalog & click simulators */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Top performing sneakers list */}
            <div className="lg:col-span-2 bg-white dark:bg-admin-dark-surface rounded-[24px] border border-admin-border dark:border-admin-dark-border p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800/50 pb-4">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-mono font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                    Highest Performance Sneakers
                  </h3>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                    Highest conversion items & click counts
                  </p>
                </div>
                <Award className="w-5 h-5 text-amber-500" />
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {topProducts.map((p) => {
                  const colors = getPlatformColor(p.marketplace);
                  return (
                    <div key={p.id} className="py-3 flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[8px] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden shrink-0 flex items-center justify-center p-1">
                          <img src={p.image} alt={p.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1 text-xs">
                            {p.name}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono text-slate-400 uppercase">{p.brand}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold ${colors.bg} ${colors.text} border ${colors.border}`}>
                              {p.marketplace}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="font-mono font-black text-slate-700 dark:text-slate-300 text-xs">{p.clicks} clicks</p>
                          <p className="text-[10px] font-mono text-slate-400 font-bold">{p.conversions} orders</p>
                        </div>

                        {/* Fast click simulator */}
                        <button
                          disabled={simulating}
                          onClick={() => triggerMockClick(p.id, p.name, p.marketplace)}
                          className="px-2.5 py-1.5 bg-admin-primary/10 hover:bg-admin-primary text-admin-primary hover:text-white transition-all rounded-[8px] text-[9px] font-mono font-black uppercase tracking-widest cursor-pointer disabled:opacity-40"
                          title="Simulate visitor click webhook"
                        >
                          Ping click
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Server activity audit traces */}
            <div className="bg-white dark:bg-admin-dark-surface rounded-[24px] border border-admin-border dark:border-admin-dark-border shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800/50 pb-4">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-mono font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                    Server Audit Stream
                  </h3>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                    Outbound route webhooks logs
                  </p>
                </div>
                <Clock className="w-5 h-5 text-slate-300" />
              </div>

              <div className="space-y-3.5 max-h-[250px] overflow-y-auto pr-1">
                {logs.length === 0 ? (
                  <p className="text-center font-mono text-[10px] text-zinc-400 py-10">No live streams registered.</p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="text-[11px] leading-relaxed flex items-start gap-2 border-b border-slate-50 dark:border-slate-800/30 pb-2.5 last:border-none">
                      <span className="px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-500 border border-sky-500/20 text-[8px] font-mono font-bold shrink-0 mt-0.5">
                        {log.badge}
                      </span>
                      <div className="flex-1">
                        <p className="text-slate-600 dark:text-slate-300 font-medium">{log.text}</p>
                        <span className="text-[9px] font-mono text-slate-400 block mt-1">{log.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
