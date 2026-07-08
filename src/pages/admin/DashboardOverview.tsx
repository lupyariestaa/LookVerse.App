import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag,
  Layers,
  Award,
  Image as ImageIcon,
  TrendingUp,
  Activity,
  Plus,
  ArrowUpRight,
  Sparkles,
  Clock,
  ArrowRight,
  ExternalLink,
  Settings,
  ShieldAlert,
  User,
  RotateCcw
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { Product, Category, Brand, Banner } from '../../types';

interface ActivityLog {
  id: string;
  text: string;
  time: string;
  badge: string;
  timestamp: number;
}

export const DashboardOverview: React.FC = () => {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState('Administrator');
  const [loading, setLoading] = useState(true);

  // Database Counts
  const [counts, setCounts] = useState({
    products: 0,
    categories: 0,
    brands: 0,
    banners: 0
  });

  // Category list and dynamic distribution
  const [categoryBreakdown, setCategoryBreakdown] = useState<{ name: string; count: number; percentage: number; color: string }[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Chart Interactive State
  const [chartMetric, setChartMetric] = useState<'clicks' | 'conversions' | 'revenue'>('clicks');
  const [hoveredPoint, setHoveredPoint] = useState<{ index: number; x: number; y: number; val: string; label: string } | null>(null);

  // 7-Day simulated but stable metrics data
  const chartData = {
    clicks: {
      values: [120, 155, 210, 180, 245, 310, 280],
      unit: 'clicks',
      color: '#FF4D00',
      accentColor: 'rgba(255, 77, 0, 0.2)',
      label: 'Referral Clicks'
    },
    conversions: {
      values: [8, 12, 19, 14, 25, 33, 29],
      unit: 'orders',
      color: '#10B981',
      accentColor: 'rgba(16, 185, 129, 0.2)',
      label: 'Affiliate Conversions'
    },
    revenue: {
      values: [35.5, 48.0, 78.5, 56.2, 92.0, 145.4, 118.0],
      unit: 'USD',
      color: '#F59E0B',
      accentColor: 'rgba(245, 158, 11, 0.2)',
      label: 'Est. Commission'
    }
  };

  const daysOfWeek = ['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon'];

  // Calculate Relative Time
  const formatRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return 'Just now';
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(diff / 86400000);
    return `${days}d ago`;
  };

  const loadDashboardData = async () => {
    try {
      const p = await dataService.getProducts();
      const c = await dataService.getCategories();
      const b = await dataService.getBrands();
      const bn = await dataService.getBanners();

      setCounts({
        products: p.length,
        categories: c.length,
        brands: b.length,
        banners: bn.length
      });

      // Calculate Category distribution
      const categoryCounts: Record<string, number> = {};
      p.forEach(product => {
        const cat = product.category;
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });

      const colors = [
        'bg-indigo-500 text-indigo-500',
        'bg-emerald-500 text-emerald-500',
        'bg-amber-500 text-amber-500',
        'bg-rose-500 text-rose-500',
        'bg-sky-500 text-sky-500'
      ];

      const breakdown = c.map((cat, idx) => {
        const count = categoryCounts[cat.name] || 0;
        const percentage = p.length > 0 ? Math.round((count / p.length) * 100) : 0;
        return {
          name: cat.name,
          count,
          percentage,
          color: colors[idx % colors.length]
        };
      }).sort((x, y) => y.count - x.count);

      setCategoryBreakdown(breakdown);

      // Load name
      setAdminName(localStorage.getItem('adminName') || 'Administrator');

      // Load activities
      setActivityLogs(dataService.getActivityLogs() as ActivityLog[]);
    } catch (e) {
      console.error('Error loading dashboard stats', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    // Trigger standard relative time refresh every 30 seconds
    const interval = setInterval(() => {
      setActivityLogs(dataService.getActivityLogs() as ActivityLog[]);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Compute SVG Points for the Area Chart dynamically
  const getSvgPoints = () => {
    const data = chartData[chartMetric].values;
    const maxVal = Math.max(...data) * 1.15; // padding top
    const minVal = 0;
    const width = 550;
    const height = 180;
    const paddingX = 40;
    const paddingY = 20;

    const points = data.map((val, idx) => {
      const x = paddingX + (idx * (width - paddingX * 2)) / (data.length - 1);
      const y = height - paddingY - ((val - minVal) * (height - paddingY * 2)) / (maxVal - minVal);
      return { x, y, val: val.toString(), label: daysOfWeek[idx] };
    });

    const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    
    // Add bottom corners for closed fill area
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    const fillPath = `${linePath} L ${lastPoint.x} ${height - paddingY} L ${firstPoint.x} ${height - paddingY} Z`;

    return { points, linePath, fillPath, height, width, paddingX, paddingY };
  };

  const { points, linePath, fillPath, height: svgH, width: svgW, paddingY: padY } = getSvgPoints();

  const handleQuickAction = (route: string) => {
    navigate(route);
  };

  const triggerMockClick = () => {
    // Generate simulated visitor click action
    const names = [
      'Nike Air Max 90',
      'Adidas Samba OG',
      'New Balance 550',
      'Air Jordan 1 Low Retro',
      'Puma 180 Core'
    ];
    const randomProduct = names[Math.floor(Math.random() * names.length)];
    const platforms = ['Shopee', 'TikTok Shop', 'Tokopedia', 'Lazada'];
    const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)];
    
    dataService.logActivity(`Affiliate tracking click registered for "${randomProduct}" outbound to ${randomPlatform}`, 'SYNC');
    
    // Refresh activities
    setActivityLogs(dataService.getActivityLogs() as ActivityLog[]);
    
    // Increment a click temporarily in our interactive chart for visual feedback
    const index = points.length - 1; // today
    chartData.clicks.values[index] += 1;
  };

  const statCards = [
    {
      title: 'Total Products',
      value: counts.products,
      change: 'Dynamic index count',
      icon: ShoppingBag,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/10',
      route: '/admin/products'
    },
    {
      title: 'Active Categories',
      value: counts.categories,
      change: 'LookVerse taxon taxonomy',
      icon: Layers,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/10',
      route: '/admin/categories'
    },
    {
      title: 'Partner Brands',
      value: counts.brands,
      change: 'Affiliated label count',
      icon: Award,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/10',
      route: '/admin/brands'
    },
    {
      title: 'Promo Banners',
      value: counts.banners,
      change: 'Scheduled campaigns',
      icon: ImageIcon,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/10',
      route: '/admin/banners'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-admin-dark-surface p-6 rounded-[24px] border border-admin-border dark:border-admin-dark-border shadow-sm transition-all duration-300 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl translate-x-12 -translate-y-12 transition-transform duration-700 group-hover:scale-125" />
        <div className="space-y-1.5 relative z-10">
          <h1 className="text-xl font-black uppercase tracking-tight text-slate-800 dark:text-slate-100 -skew-x-2 flex items-center gap-2">
            Welcome back, <span className="text-admin-primary dark:text-admin-secondary">{adminName}</span>_
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse shrink-0" />
          </h1>
          <p className="text-xs text-admin-text-secondary dark:text-admin-dark-text-secondary max-w-2xl font-medium leading-relaxed">
            All LookVerse affiliate sync gateways, asset streams, and database indices are operating at normal latency. Review parameters below.
          </p>
        </div>
        <div className="flex items-center gap-2.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest shrink-0 shadow-sm relative z-10">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>System Live // TIER-1 SECURED</span>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={() => handleQuickAction(stat.route)}
            className="bg-white dark:bg-admin-dark-surface p-6 rounded-[20px] border border-admin-border dark:border-admin-dark-border shadow-sm hover:shadow-md hover:border-indigo-500/30 dark:hover:border-indigo-400/30 transition-all duration-300 cursor-pointer group relative overflow-hidden"
            id={`stat-card-${index}`}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {stat.title}
                </p>
                <p className="text-3xl font-black text-slate-800 dark:text-slate-100 leading-none">
                  {loading ? (
                    <span className="inline-block w-12 h-8 bg-slate-100 dark:bg-slate-800 animate-pulse rounded" />
                  ) : (
                    stat.value
                  )}
                </p>
              </div>
              <div className={`w-11 h-11 rounded-[12px] flex items-center justify-center shrink-0 border transition-transform duration-300 group-hover:scale-110 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            
            <div className="mt-5 pt-4 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between text-[10px] font-mono">
              <div className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-bold">{stat.change}</span>
              </div>
              <span className="text-admin-primary dark:text-admin-secondary opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all font-bold">
                MANAGE &rarr;
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Analytics & Traffic Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interactive SVG Area Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-admin-dark-surface p-6 rounded-[24px] border border-admin-border dark:border-admin-dark-border shadow-sm transition-all duration-300 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-50 dark:border-slate-800/50 pb-5">
            <div className="space-y-1">
              <h3 className="text-xs font-mono font-black uppercase tracking-widest text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-admin-primary" />
                <span>Affiliate Metric Stream</span>
              </h3>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                Consolidated outgoing traffic indices (Last 7 Days)
              </p>
            </div>

            {/* Metric Selector Tabs */}
            <div className="flex bg-slate-50 dark:bg-slate-900/50 p-1 rounded-[10px] border border-slate-100 dark:border-slate-800/50 shrink-0">
              {(['clicks', 'conversions', 'revenue'] as const).map(metric => (
                <button
                  key={metric}
                  onClick={() => {
                    setChartMetric(metric);
                    setHoveredPoint(null);
                  }}
                  className={`px-3 py-1.5 rounded-[8px] text-[10px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer ${
                    chartMetric === metric
                      ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm border border-slate-100/50 dark:border-slate-700/50'
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
                  }`}
                >
                  {metric}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive SVG Line Graph Canvas */}
          <div className="relative py-4 select-none h-56 flex items-center justify-center">
            
            {/* Hover Tooltip Overlay */}
            <AnimatePresence>
              {hoveredPoint && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute z-20 bg-slate-900/95 dark:bg-slate-950/95 text-white p-2.5 rounded-[8px] border border-slate-800 text-[10px] font-mono shadow-xl space-y-0.5 pointer-events-none"
                  style={{
                    left: `${(hoveredPoint.x / svgW) * 100}%`,
                    top: `${(hoveredPoint.y / svgH) * 100 - 35}%`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  <div className="text-slate-400 uppercase font-black tracking-widest">{hoveredPoint.label}</div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: chartData[chartMetric].color }} />
                    <span className="font-bold text-white text-xs">
                      {chartMetric === 'revenue' ? `$${parseFloat(hoveredPoint.val).toFixed(2)}` : hoveredPoint.val}
                    </span>
                    <span className="text-slate-400 uppercase font-bold text-[9px]">{chartData[chartMetric].unit}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <svg
              viewBox={`0 0 ${svgW} ${svgH}`}
              className="w-full h-full overflow-visible"
            >
              <defs>
                <linearGradient id={`areaGradient-${chartMetric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartData[chartMetric].color} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={chartData[chartMetric].color} stopOpacity={0.00} />
                </linearGradient>
                <linearGradient id="horizontalGrid" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="rgba(241,245,249,0)" />
                  <stop offset="50%" stopColor="rgba(226,232,240,0.5)" />
                  <stop offset="100%" stopColor="rgba(241,245,249,0)" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid Lines */}
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

              {/* Area Under Curve */}
              <motion.path
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={`area-${chartMetric}`}
                transition={{ duration: 0.5 }}
                d={fillPath}
                fill={`url(#areaGradient-${chartMetric})`}
              />

              {/* Grid Axis Base Line */}
              <line
                x1="20"
                y1={svgH - padY}
                x2={svgW - 20}
                y2={svgH - padY}
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-800"
                strokeWidth="1.5"
              />

              {/* Main Glowing Curve Path */}
              <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                key={`line-${chartMetric}`}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                d={linePath}
                fill="none"
                stroke={chartData[chartMetric].color}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Nodes and Labels */}
              {points.map((p, idx) => (
                <g key={idx} className="cursor-pointer group/node">
                  {/* Outer active ring */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="8"
                    fill="transparent"
                    className="hover:fill-current"
                    style={{ color: chartData[chartMetric].accentColor }}
                    onMouseEnter={() => setHoveredPoint({ index: idx, x: p.x, y: p.y, val: p.val, label: p.label })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {/* Point core */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="4.5"
                    fill={chartMetric === 'clicks' && idx === points.length - 1 ? '#FFF' : chartData[chartMetric].color}
                    stroke={idx === points.length - 1 ? chartData[chartMetric].color : '#FFF'}
                    strokeWidth="2"
                    className="transition-all duration-200"
                  />
                  {/* Axis Label */}
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

          {/* Quick Stats Summary Footer */}
          <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 p-4 rounded-[16px] flex flex-wrap gap-6 justify-between items-center text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span>TOTAL TRAFFIC SYNCED: <span className="text-slate-800 dark:text-slate-100">{chartData.clicks.values.reduce((a, b) => a + b, 0)} CLICKS</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>CONV_ RATE: <span className="text-slate-800 dark:text-slate-100">
                {((chartData.conversions.values.reduce((a, b) => a + b, 0) / chartData.clicks.values.reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%
              </span></span>
            </div>
            <button
              onClick={triggerMockClick}
              className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white px-2.5 py-1.5 rounded-[8px] text-[9px] font-mono uppercase tracking-widest cursor-pointer border border-indigo-600 shadow-sm"
              title="Test real-time webhook parsing"
            >
              <RotateCcw className="w-3 h-3 animate-spin" style={{ animationDuration: '6s' }} />
              <span>PING WEBHOOK_</span>
            </button>
          </div>

        </div>

        {/* Categories Taxonomy distribution */}
        <div className="bg-white dark:bg-admin-dark-surface p-6 rounded-[24px] border border-admin-border dark:border-admin-dark-border shadow-sm transition-all duration-300 flex flex-col justify-between">
          <div className="space-y-1 pb-4 border-b border-slate-50 dark:border-slate-800/50">
            <h3 className="text-xs font-mono font-black uppercase tracking-widest text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-500" />
              <span>Category Distribution</span>
            </h3>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
              Product volume mapping inside LookVerse catalog
            </p>
          </div>

          <div className="flex-1 py-4 space-y-4.5">
            {loading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="w-20 h-3 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                    <span className="w-8 h-3 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                </div>
              ))
            ) : categoryBreakdown.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <ShieldAlert className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-[10px] font-mono text-slate-400 uppercase">NO ACTIVE CATEGORY TAXA FOUND.</p>
              </div>
            ) : (
              categoryBreakdown.map((item, idx) => (
                <div key={idx} className="space-y-2 group/bar">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 group-hover/bar:text-admin-primary dark:group-hover/bar:text-admin-secondary transition-colors uppercase tracking-wide">
                      {item.name}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-slate-400">
                      <span>{item.count} items</span>
                      <span className="text-slate-200 dark:text-slate-800 font-normal">|</span>
                      <span className="text-slate-800 dark:text-slate-200">{item.percentage}%</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800/50">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.1, ease: 'easeOut' }}
                      className={`h-full rounded-full ${item.color.split(' ')[0]}`}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-4 border-t border-slate-50 dark:border-slate-800/50">
            <button
              onClick={() => handleQuickAction('/admin/categories')}
              className="w-full p-2.5 rounded-[12px] bg-slate-50 dark:bg-slate-900 text-[10px] font-mono font-black text-center text-slate-500 hover:text-admin-primary dark:hover:text-admin-secondary hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-100 dark:border-slate-800/50 cursor-pointer uppercase tracking-wider"
            >
              Taxonomy Mapping Details_
            </button>
          </div>
        </div>

      </div>

      {/* Split Widget Area: Logs vs Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Recent Activity Logs */}
        <div className="lg:col-span-2 bg-white dark:bg-admin-dark-surface rounded-[24px] border border-admin-border dark:border-admin-dark-border shadow-sm p-6 space-y-6 transition-all duration-300">
          <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800/50 pb-4">
            <div className="space-y-1">
              <h3 className="text-xs font-mono font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                Operator Security & Audit Stream_
              </h3>
              <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
                VERIFIED OPERATOR AUDIT TRACE
              </p>
            </div>
            <span className="px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-[9px] font-mono font-black tracking-widest">
              SECURED TRACE
            </span>
          </div>

          <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1">
            {activityLogs.length === 0 ? (
              <div className="py-8 text-center text-slate-400 font-mono text-xs">
                No recorded operator trace. Initiate operations to audit log.
              </div>
            ) : (
              activityLogs.map((activity, index) => (
                <div
                  key={activity.id || index}
                  className="flex items-start justify-between text-xs py-2 border-b border-slate-50 dark:border-slate-800/20 last:border-none last:pb-0 group"
                >
                  <div className="flex items-start gap-3">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-black uppercase tracking-wider border shrink-0 mt-0.5 ${
                      activity.badge === 'ADD' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      activity.badge === 'UPDATE' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' :
                      activity.badge === 'DELETE' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                      activity.badge === 'PUBLISH' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                      activity.badge === 'SYNC' ? 'bg-sky-500/10 text-sky-500 border-sky-500/20' :
                      'bg-slate-500/10 text-slate-500 border-slate-500/20'
                    }`}>
                      {activity.badge}
                    </span>
                    <span className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors">
                      {activity.text}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 shrink-0 flex items-center gap-1.5 ml-4 mt-0.5 font-bold">
                    <Clock className="w-3 h-3 text-slate-300" />
                    {activity.timestamp ? formatRelativeTime(activity.timestamp) : activity.time}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Quick Actions Console */}
        <div className="bg-white dark:bg-admin-dark-surface rounded-[24px] border border-admin-border dark:border-admin-dark-border shadow-sm p-6 space-y-6 transition-all duration-300">
          <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800/50 pb-4">
            <h3 className="text-xs font-mono font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
              CONSOLE HOTLINKS_
            </h3>
            <Activity className="w-4 h-4 text-slate-300" />
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {[
              { label: 'Register New Product', desc: 'Curate a new affiliate item', icon: Plus, route: '/admin/products' },
              { label: 'Operator Security Access', desc: 'Verify and reset secure credentials', icon: User, route: '/admin/profile' },
              { label: 'Banners & Promotions', desc: 'Refresh showcase campaigns', icon: ImageIcon, route: '/admin/banners' },
              { label: 'System Configuration', desc: 'Modify system SEO metrics', icon: Settings, route: '/admin/settings' }
            ].map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action.route)}
                className="p-3.5 rounded-[16px] border border-slate-100 dark:border-slate-800 hover:border-indigo-500/40 dark:hover:border-indigo-400/40 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 text-left transition-all cursor-pointer group flex items-start gap-4"
              >
                <div className="w-8.5 h-8.5 rounded-[10px] bg-slate-50 dark:bg-slate-900 group-hover:bg-indigo-500/10 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 flex items-center justify-center shrink-0 transition-colors text-slate-400 border border-slate-100/50 dark:border-slate-800">
                  <action.icon className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wide group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {action.label}
                  </p>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                    {action.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default DashboardOverview;
