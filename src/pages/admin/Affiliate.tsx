import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Link as LinkIcon,
  Plus,
  Search,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  HelpCircle,
  Edit2,
  ShoppingCart,
  RefreshCw,
  TrendingUp,
  BarChart3,
  Globe,
  SlidersHorizontal,
  X,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Info,
  ArrowUpRight,
  Trash2,
  Link2,
  FileSpreadsheet,
  Gauge,
  Sparkles,
  MousePointerClick
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { Product } from '../../types';

// Marketplace branding theme configuration
const marketplaceTheme: Record<string, {
  bg: string;
  hover: string;
  text: string;
  border: string;
  badgeBg: string;
  badgeBorder: string;
}> = {
  Shopee: {
    bg: 'bg-[#FF5722]',
    hover: 'hover:bg-[#e64a19]',
    text: 'text-[#FF5722]',
    border: 'border-[#FF5722]/20',
    badgeBg: 'bg-[#FF5722]/10 dark:bg-[#FF5722]/15',
    badgeBorder: 'border-[#FF5722]/20 dark:border-[#FF5722]/30'
  },
  Tokopedia: {
    bg: 'bg-[#03C569]',
    hover: 'hover:bg-[#02a959]',
    text: 'text-[#03C569]',
    border: 'border-[#03C569]/20',
    badgeBg: 'bg-[#03C569]/10 dark:bg-[#03C569]/15',
    badgeBorder: 'border-[#03C569]/20 dark:border-[#03C569]/30'
  },
  'TikTok Shop': {
    bg: 'bg-slate-900 dark:bg-slate-800',
    hover: 'hover:bg-slate-950 dark:hover:bg-slate-700',
    text: 'text-slate-900 dark:text-slate-100',
    border: 'border-slate-900/10 dark:border-slate-800/20',
    badgeBg: 'bg-slate-100 dark:bg-slate-800/60',
    badgeBorder: 'border-slate-200 dark:border-slate-700/60'
  },
  Lazada: {
    bg: 'bg-indigo-600',
    hover: 'hover:bg-indigo-700',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-600/20',
    badgeBg: 'bg-indigo-50 dark:bg-indigo-950/20',
    badgeBorder: 'border-indigo-100 dark:border-indigo-900/30'
  }
};

export const Affiliate: React.FC = () => {
  // Products list & loading state
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Affiliate dynamic click mapping states
  const [productClicks, setProductClicks] = useState<Record<string, number>>({});

  // Search & filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All'); // All, Active, Missing
  const [sortBy, setSortBy] = useState<string>('clicks-desc'); // clicks-desc, clicks-asc, name-asc, price-desc

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Feedback notifications
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Link Generator Tool States
  const [genPlatform, setGenPlatform] = useState<'Shopee' | 'TikTok Shop' | 'Tokopedia' | 'Lazada'>('Shopee');
  const [genRawUrl, setGenRawUrl] = useState('');
  const [genSubId, setGenSubId] = useState('lookverse-cms');
  const [generatedResult, setGeneratedResult] = useState('');
  const [selectedProductToAssign, setSelectedProductToAssign] = useState<string>('');

  // Fast-Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editFormData, setEditFormData] = useState({
    marketplace: 'Shopee' as 'Shopee' | 'TikTok Shop' | 'Tokopedia' | 'Lazada',
    affiliateUrl: '',
    clicksCount: 0
  });

  // Fetch product catalog & seed clicks map
  const loadData = async () => {
    setLoading(true);
    try {
      const allProducts = await dataService.getProducts();
      setProducts(allProducts);

      // Load or seed product level click tracker
      const clicksStr = localStorage.getItem('lookverse_product_clicks');
      let clicksMap: Record<string, number> = {};
      if (clicksStr) {
        clicksMap = JSON.parse(clicksStr);
      } else {
        // Seed with realistic starting variables for demonstration value
        allProducts.forEach((p, idx) => {
          const baseClicks = 42;
          const indexModifier = (idx * 19) % 87;
          const statusModifier = p.status === 'Draft' ? 0 : 35;
          clicksMap[p.id] = baseClicks + indexModifier + statusModifier;
        });
        localStorage.setItem('lookverse_product_clicks', JSON.stringify(clicksMap));
      }
      setProductClicks(clicksMap);
    } catch (e) {
      showToast('error', 'Failed to propagate affiliate database records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert(null);
    }, 4000);
  };

  // Reset pagination on search/filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedPlatform, selectedStatus, sortBy]);

  // Copy target URL helper
  const handleCopy = (id: string, url: string) => {
    if (!url) {
      showToast('error', 'Cannot copy: Destination URL is empty.');
      return;
    }
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast('success', 'AFFILIATE DESTINATION COPIED.');
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Generate affiliate tracking link
  const handleGenerateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!genRawUrl.trim()) {
      showToast('error', 'Please input a raw product URL.');
      return;
    }

    // Simple URL parser/formatter based on platform
    let resultUrl = genRawUrl.trim();
    try {
      const urlObj = new URL(resultUrl);
      const cleanOrigin = urlObj.origin + urlObj.pathname;
      
      // Format with tracking tags
      if (genPlatform === 'Shopee') {
        resultUrl = `${cleanOrigin}?utm_source=affiliate&utm_campaign=${genSubId}`;
      } else if (genPlatform === 'Tokopedia') {
        resultUrl = `${cleanOrigin}?extParam=wh_affiliate%3D${genSubId}`;
      } else if (genPlatform === 'TikTok Shop') {
        resultUrl = `${cleanOrigin}?sub_id=${genSubId}`;
      } else {
        resultUrl = `${cleanOrigin}?laz_track_id=${genSubId}`;
      }
    } catch {
      // Fallback if not a fully qualified URL
      resultUrl = `${resultUrl}&subid=${genSubId}`;
    }

    setGeneratedResult(resultUrl);
    showToast('success', 'TRACKING REDIRECT SECURED.');
  };

  // Fast apply generated link to selected product
  const handleAssignGeneratedLink = () => {
    if (!selectedProductToAssign) {
      showToast('error', 'Please select a catalog product first.');
      return;
    }
    if (!generatedResult) {
      showToast('error', 'Please generate the affiliate redirect first.');
      return;
    }

    const updatedProducts = products.map(p => {
      if (p.id === selectedProductToAssign) {
        return {
          ...p,
          marketplace: genPlatform,
          affiliateUrl: generatedResult
        };
      }
      return p;
    });

    dataService.saveProducts(updatedProducts);
    setProducts(updatedProducts);
    dataService.logActivity(`Affiliate link for "${products.find(p => p.id === selectedProductToAssign)?.name}" updated via generator.`, 'SYNC');
    showToast('success', 'COORDINATES APPLIED TO SPECIMEN.');
    
    // Clear inputs
    setGenRawUrl('');
    setGeneratedResult('');
    setSelectedProductToAssign('');
  };

  // Open fast-edit links modal
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setEditFormData({
      marketplace: product.marketplace || 'Shopee',
      affiliateUrl: product.affiliateUrl || '',
      clicksCount: productClicks[product.id] || 0
    });
    setIsEditModalOpen(true);
  };

  // Submit fast-edit update
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    // Save updated product
    const updatedProducts = products.map(p => {
      if (p.id === editingProduct.id) {
        return {
          ...p,
          marketplace: editFormData.marketplace,
          affiliateUrl: editFormData.affiliateUrl.trim()
        };
      }
      return p;
    });

    dataService.saveProducts(updatedProducts);
    setProducts(updatedProducts);

    // Save updated clicks calibration
    const updatedClicks = { ...productClicks };
    updatedClicks[editingProduct.id] = editFormData.clicksCount;
    setProductClicks(updatedClicks);
    localStorage.setItem('lookverse_product_clicks', JSON.stringify(updatedClicks));

    dataService.logActivity(`Affiliate route updated for "${editingProduct.name}" (${editFormData.marketplace}).`, 'UPDATE');
    showToast('success', 'ROUTE PROFILE UPDATE RE-INDEXED.');
    setIsEditModalOpen(false);
  };

  // Delete/Reset an affiliate link
  const handleResetLink = (product: Product) => {
    const updatedProducts = products.map(p => {
      if (p.id === product.id) {
        return {
          ...p,
          affiliateUrl: ''
        };
      }
      return p;
    });

    dataService.saveProducts(updatedProducts);
    setProducts(updatedProducts);
    dataService.logActivity(`Affiliate route cleared for "${product.name}".`, 'DELETE');
    showToast('success', 'ROUTE RE-INITIALIZED (URL CLEARED).');
  };

  // COMPUTE DYNAMIC AGGREGATES
  const totalTrackedLinks = products.length;
  const activeLinksCount = products.filter(p => p.affiliateUrl && p.affiliateUrl.trim() !== '').length;
  const unconfiguredLinksCount = totalTrackedLinks - activeLinksCount;
  
  const totalClicksCount = Object.values(productClicks).reduce<number>((acc, curr) => acc + (curr as number), 0);
  
  // Calculate platform distributions
  const platformCounts = {
    Shopee: products.filter(p => p.marketplace === 'Shopee').length,
    Tokopedia: products.filter(p => p.marketplace === 'Tokopedia').length,
    'TikTok Shop': products.filter(p => p.marketplace === 'TikTok Shop').length,
    Lazada: products.filter(p => p.marketplace === 'Lazada').length
  };

  const platformClicks = {
    Shopee: products.filter(p => p.marketplace === 'Shopee').reduce<number>((acc, p) => acc + (productClicks[p.id] || 0), 0),
    Tokopedia: products.filter(p => p.marketplace === 'Tokopedia').reduce<number>((acc, p) => acc + (productClicks[p.id] || 0), 0),
    'TikTok Shop': products.filter(p => p.marketplace === 'TikTok Shop').reduce<number>((acc, p) => acc + (productClicks[p.id] || 0), 0),
    Lazada: products.filter(p => p.marketplace === 'Lazada').reduce<number>((acc, p) => acc + (productClicks[p.id] || 0), 0)
  };

  // FILTER & SEARCH LOGIC
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.affiliateUrl || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPlatform = selectedPlatform === 'All' || product.marketplace === selectedPlatform;
    
    const hasUrl = product.affiliateUrl && product.affiliateUrl.trim() !== '';
    const matchesStatus = 
      selectedStatus === 'All' ||
      (selectedStatus === 'Active' && hasUrl) ||
      (selectedStatus === 'Missing' && !hasUrl);

    return matchesSearch && matchesPlatform && matchesStatus;
  });

  // SORT LOGIC
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const clicksA = productClicks[a.id] || 0;
    const clicksB = productClicks[b.id] || 0;

    switch (sortBy) {
      case 'clicks-desc':
        return clicksB - clicksA;
      case 'clicks-asc':
        return clicksA - clicksB;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'price-desc':
        return b.salePrice - a.salePrice;
      default:
        return 0;
    }
  });

  // PAGINATION
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Dynamic Toast Alerts */}
      <AnimatePresence>
        {alert && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 px-5 py-4 rounded-[16px] border shadow-xl flex items-center gap-3 text-xs font-mono font-bold uppercase tracking-wider ${
              alert.type === 'success'
                ? 'bg-emerald-500 text-white border-emerald-600'
                : 'bg-rose-500 text-white border-rose-600'
            }`}
          >
            {alert.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
            <span>{alert.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-admin-border dark:border-admin-dark-border transition-colors duration-300">
        <div className="space-y-1.5">
          <h1 className="text-xl font-black uppercase tracking-tight text-slate-800 dark:text-slate-100 -skew-x-2 flex items-center gap-2">
            <Link2 className="w-6 h-6 text-admin-primary dark:text-admin-secondary shrink-0" />
            <span>Affiliate Router Console_</span>
          </h1>
          <p className="text-xs text-admin-text-secondary dark:text-admin-dark-text-secondary font-medium">
            Monitor, calibrate, and generate direct affiliate links for Shopee, Tokopedia, TikTok Shop, and Lazada campaigns.
          </p>
        </div>
        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 px-3 py-1.5 rounded-[8px] flex items-center gap-2 self-start">
          <RefreshCw className="w-3.5 h-3.5 text-admin-primary animate-spin" />
          <span>REAL-TIME DIRECTORY PORTAL</span>
        </div>
      </div>

      {/* CORE AGGREGATES SCOREBOARD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1: Tracked Routes */}
        <div className="bg-white dark:bg-admin-dark-surface p-6 rounded-[24px] border border-admin-border dark:border-admin-dark-border shadow-sm flex items-center gap-4 transition-colors">
          <div className="w-12 h-12 rounded-[16px] bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 flex items-center justify-center shrink-0">
            <LinkIcon className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest block">Tracked Routes</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-800 dark:text-slate-100">{totalTrackedLinks}</span>
              <span className="text-[10px] font-bold text-slate-400">Total Items</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Link Integrity */}
        <div className="bg-white dark:bg-admin-dark-surface p-6 rounded-[24px] border border-admin-border dark:border-admin-dark-border shadow-sm flex items-center gap-4 transition-colors">
          <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0 ${
            unconfiguredLinksCount > 0 
              ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-500' 
              : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest block">Missing URLs</span>
            <div className="flex items-baseline gap-2">
              <span className={`text-xl font-black ${unconfiguredLinksCount > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                {unconfiguredLinksCount}
              </span>
              <span className="text-[10px] font-bold text-slate-400">Needs Mapping</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Total traffic clicks */}
        <div className="bg-white dark:bg-admin-dark-surface p-6 rounded-[24px] border border-admin-border dark:border-admin-dark-border shadow-sm flex items-center gap-4 transition-colors">
          <div className="w-12 h-12 rounded-[16px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center shrink-0 animate-pulse">
            <MousePointerClick className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest block">Redirect Clicks</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-800 dark:text-slate-100">{totalClicksCount.toLocaleString()}</span>
              <span className="text-[10px] font-bold text-slate-400">Aggregated</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Average Click Score */}
        <div className="bg-white dark:bg-admin-dark-surface p-6 rounded-[24px] border border-admin-border dark:border-admin-dark-border shadow-sm flex items-center gap-4 transition-colors">
          <div className="w-12 h-12 rounded-[16px] bg-pink-50 dark:bg-pink-950/20 text-pink-500 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest block">Average CTR</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-800 dark:text-slate-100">
                {totalTrackedLinks > 0 ? (totalClicksCount / totalTrackedLinks).toFixed(1) : 0}
              </span>
              <span className="text-[10px] font-bold text-slate-400">Clicks / Sneaker</span>
            </div>
          </div>
        </div>

      </div>

      {/* CHANNEL CONTRIBUTION BREAKDOWN */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.keys(marketplaceTheme).map((platform) => {
          const lCount = platformCounts[platform as keyof typeof platformCounts] || 0;
          const cCount = platformClicks[platform as keyof typeof platformClicks] || 0;
          const theme = marketplaceTheme[platform];
          
          // Click ratio percentage
          const clickPct = totalClicksCount > 0 ? Math.round((cCount / totalClicksCount) * 100) : 0;

          return (
            <div
              key={platform}
              className="bg-white dark:bg-admin-dark-surface p-5 rounded-[24px] border border-admin-border dark:border-admin-dark-border shadow-sm space-y-4 flex flex-col justify-between transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-1 text-[9px] font-mono font-black uppercase tracking-widest rounded-full border ${theme.badgeBg} ${theme.text} ${theme.badgeBorder}`}>
                  {platform}
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  {clickPct}% SHARE
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] text-slate-400 font-medium uppercase font-mono tracking-wider">Indexed Links:</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-black text-slate-800 dark:text-slate-100">{lCount}</span>
                  <span className="text-[10px] text-slate-400 font-bold">specimens</span>
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-50 dark:border-slate-800 pt-3">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                  <span>TOTAL TRAFFIC</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{cCount.toLocaleString()} clicks</span>
                </div>
                {/* Visual Progress gauge */}
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${theme.bg} rounded-full transition-all duration-1000`}
                    style={{ width: `${clickPct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* TWO COLUMN INTERACTIVE INTERFACE: Links Director + Live URL Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUMN A: Dynamic Directory (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Filtering & Sorting Container */}
          <div className="bg-white dark:bg-admin-dark-surface p-5 rounded-[24px] border border-admin-border dark:border-admin-dark-border shadow-sm space-y-4 transition-colors">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              
              {/* Directory search console */}
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  placeholder="Search routes by product name, brand or target url..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 pl-10 rounded-[12px] text-xs font-medium placeholder-slate-400 focus:outline-none focus:border-admin-primary transition-all text-slate-800 dark:text-slate-100"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Advanced controls */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                {/* Platform select dropdown */}
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 px-3 py-2 rounded-[10px] focus:outline-none focus:border-admin-primary cursor-pointer font-sans uppercase"
                >
                  <option value="All">Platforms: ALL</option>
                  <option value="Shopee">Shopee Only</option>
                  <option value="Tokopedia">Tokopedia Only</option>
                  <option value="TikTok Shop">TikTok Shop Only</option>
                  <option value="Lazada">Lazada Only</option>
                </select>

                {/* Status select dropdown */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 px-3 py-2 rounded-[10px] focus:outline-none focus:border-admin-primary cursor-pointer font-sans uppercase"
                >
                  <option value="All">Health Status: ALL</option>
                  <option value="Active">Active Route</option>
                  <option value="Missing">No Destination</option>
                </select>

                {/* Sort selector dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 px-3 py-2 rounded-[10px] focus:outline-none focus:border-admin-primary cursor-pointer font-sans uppercase"
                >
                  <option value="clicks-desc">Traffic: Highest</option>
                  <option value="clicks-asc">Traffic: Lowest</option>
                  <option value="name-asc">Alphabetical</option>
                  <option value="price-desc">Retail price: Highest</option>
                </select>
              </div>

            </div>
          </div>

          {/* TABLE OR LIST */}
          {loading ? (
            <div className="py-24 text-center space-y-4 bg-white dark:bg-admin-dark-surface rounded-[24px] border border-admin-border dark:border-admin-dark-border">
              <RefreshCw className="w-8 h-8 text-admin-primary animate-spin mx-auto" />
              <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">PROPAGATING ROUTER SCHEDULER...</p>
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="bg-white dark:bg-admin-dark-surface rounded-[24px] border border-admin-border dark:border-admin-dark-border py-24 text-center space-y-4 max-w-xl mx-auto p-8">
              <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-300 dark:text-slate-700 mx-auto">
                <LinkIcon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-mono font-black uppercase text-slate-700 dark:text-slate-300">NO REDIRECTS MATCHED_</p>
                <p className="text-[11px] text-slate-400 font-medium">Verify your query filter settings or use the builder on the right to assign a new tracked route.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white dark:bg-admin-dark-surface rounded-[24px] border border-admin-border dark:border-admin-dark-border shadow-sm overflow-hidden transition-colors">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/55 dark:bg-slate-900/30 text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">
                        <th className="px-6 py-4">Sneaker Item / Specimen</th>
                        <th className="px-4 py-4">Destination Channel</th>
                        <th className="px-4 py-4">Affiliate Coordinate</th>
                        <th className="px-4 py-4 text-center">Redirect Clicks</th>
                        <th className="px-4 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Route Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                      {paginatedProducts.map((product) => {
                        const count = productClicks[product.id] || 0;
                        const hasUrl = product.affiliateUrl && product.affiliateUrl.trim() !== '';
                        const theme = marketplaceTheme[product.marketplace] || marketplaceTheme.Shopee;

                        return (
                          <motion.tr
                            key={product.id}
                            layout
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors"
                          >
                            {/* Product Info */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3 min-w-[200px]">
                                <div className="w-10 h-10 rounded-[8px] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden shrink-0 flex items-center justify-center p-1">
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop';
                                    }}
                                  />
                                </div>
                                <div className="space-y-0.5">
                                  <p className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1 text-xs hover:text-admin-primary transition-colors">
                                    {product.name}
                                  </p>
                                  <p className="text-[10px] font-mono text-slate-400 uppercase">
                                    {product.brand} // {product.category}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Marketplace Platform */}
                            <td className="px-4 py-4">
                              <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-mono font-bold border shrink-0 ${theme.badgeBg} ${theme.text} ${theme.badgeBorder}`}>
                                {product.marketplace}
                              </span>
                            </td>

                            {/* Affiliate Destination URL */}
                            <td className="px-4 py-4 max-w-[160px]">
                              {hasUrl ? (
                                <div className="flex items-center gap-1.5 group/url">
                                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate select-all">
                                    {product.affiliateUrl}
                                  </span>
                                  <button
                                    onClick={() => handleCopy(product.id, product.affiliateUrl)}
                                    className="text-slate-400 hover:text-admin-primary p-1 shrink-0 bg-slate-50 hover:bg-indigo-50 dark:bg-slate-900 rounded cursor-pointer transition-colors"
                                    title="Copy redirect coordinates"
                                  >
                                    {copiedId === product.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[10px] font-mono text-slate-400 italic">
                                  Undefined_
                                </span>
                              )}
                            </td>

                            {/* Click Count traffic */}
                            <td className="px-4 py-4 text-center">
                              <div className="inline-flex flex-col items-center">
                                <span className="font-mono font-black text-slate-700 dark:text-slate-200">
                                  {count}
                                </span>
                                <div className="h-1 w-10 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden mt-1">
                                  <div 
                                    className="bg-admin-primary h-full rounded-full" 
                                    style={{ width: `${Math.min(100, (count / 150) * 100)}%` }} 
                                  />
                                </div>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="px-4 py-4">
                              {hasUrl ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-mono font-black uppercase tracking-wider text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                                  <Check className="w-2.5 h-2.5" />
                                  <span>Active</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[9px] font-mono font-black uppercase tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                                  <AlertTriangle className="w-2.5 h-2.5 animate-pulse" />
                                  <span>Missing</span>
                                </span>
                              )}
                            </td>

                            {/* Actions Area */}
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => openEditModal(product)}
                                  className="p-1.5 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-[6px] transition-all cursor-pointer"
                                  title="Configure redirect profile"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                {hasUrl && (
                                  <>
                                    <a
                                      href={product.affiliateUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1.5 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-[6px] transition-all"
                                      title="Test route destination"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                    <button
                                      onClick={() => handleResetLink(product)}
                                      className="p-1.5 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-[6px] transition-all cursor-pointer"
                                      title="Reset route URL"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>

                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination bar */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">
                      Showing <span className="font-bold text-slate-700 dark:text-slate-300">{startIndex + 1}</span> - <span className="font-bold text-slate-700 dark:text-slate-300">{Math.min(startIndex + itemsPerPage, sortedProducts.length)}</span> of <span className="font-bold text-slate-700 dark:text-slate-300">{sortedProducts.length}</span> routes
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-[8px] text-slate-500 hover:text-slate-700 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed bg-white dark:bg-slate-900"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-[10px] font-mono font-bold text-slate-500 px-2">
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-[8px] text-slate-500 hover:text-slate-700 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed bg-white dark:bg-slate-900"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* COLUMN B: Live URL Generator & Utilities (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Section: URL Generator Card */}
          <div className="bg-white dark:bg-admin-dark-surface rounded-[24px] border border-admin-border dark:border-admin-dark-border p-6 shadow-sm space-y-5 transition-colors">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-admin-primary dark:text-admin-secondary animate-pulse" />
              <h3 className="font-black text-xs uppercase tracking-[0.18em] text-slate-800 dark:text-slate-100">
                Tracked Deep Link Builder_
              </h3>
            </div>
            
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              Instantly compile clean marketplace hyperlinks into tracked affiliate destination variables integrated with custom tagging sub-IDs.
            </p>

            <form onSubmit={handleGenerateLink} className="space-y-4 pt-2">
              {/* Target Platform Channel */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-black uppercase tracking-wider text-slate-400 block">
                  Marketplace Platform Channel:
                </label>
                <select
                  value={genPlatform}
                  onChange={(e) => setGenPlatform(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 px-3 py-2.5 rounded-[10px] focus:outline-none focus:border-admin-primary transition-all font-bold cursor-pointer font-sans"
                >
                  <option value="Shopee">Shopee</option>
                  <option value="Tokopedia">Tokopedia</option>
                  <option value="TikTok Shop">TikTok Shop</option>
                  <option value="Lazada">Lazada</option>
                </select>
              </div>

              {/* Sub ID code */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-black uppercase tracking-wider text-slate-400 block">
                  Campaign Affiliate Sub-ID / Tag:
                </label>
                <input
                  type="text"
                  required
                  value={genSubId}
                  onChange={(e) => setGenSubId(e.target.value)}
                  placeholder="e.g. lookverse-21"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 px-3.5 py-2.5 rounded-[10px] focus:outline-none focus:border-admin-primary transition-all font-mono font-bold"
                />
              </div>

              {/* Raw Product Link */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-black uppercase tracking-wider text-slate-400 block">
                  Raw Product Destination URL:
                </label>
                <input
                  type="text"
                  required
                  value={genRawUrl}
                  onChange={(e) => setGenRawUrl(e.target.value)}
                  placeholder="https://shopee.co.id/product-slug..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 px-3.5 py-2.5 rounded-[10px] focus:outline-none focus:border-admin-primary transition-all font-sans"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-[10px] bg-admin-primary text-white text-xs font-black uppercase tracking-widest hover:bg-opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-500/10"
              >
                <Link2 className="w-4 h-4" />
                <span>Compile Tracked Route</span>
              </button>
            </form>

            {/* Generated results area */}
            {generatedResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-slate-100 dark:border-slate-800 rounded-[16px] p-4 bg-slate-50/50 dark:bg-slate-900/30 space-y-3 pt-4 border-t"
              >
                <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-wider text-slate-400">
                  <span>Tracked Output Result:</span>
                  <button
                    onClick={() => handleCopy('generator-clip', generatedResult)}
                    className="p-1 text-slate-400 hover:text-admin-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded shrink-0 cursor-pointer"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[10px] font-mono text-slate-600 dark:text-slate-400 break-all select-all leading-normal bg-white dark:bg-slate-950 p-2 rounded border border-slate-150 dark:border-slate-850">
                  {generatedResult}
                </p>

                {/* Specimen target mapping */}
                <div className="space-y-2 pt-1">
                  <span className="text-[8.5px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    Fast Apply to Catalog Specimen:
                  </span>
                  <div className="flex gap-2">
                    <select
                      value={selectedProductToAssign}
                      onChange={(e) => setSelectedProductToAssign(e.target.value)}
                      className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 px-2 py-2 rounded-[8px] focus:outline-none focus:border-admin-primary cursor-pointer font-sans"
                    >
                      <option value="">-- Choose Specimen --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleAssignGeneratedLink}
                      className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[8px] text-[10px] font-black uppercase tracking-wider cursor-pointer"
                    >
                      Apply Link
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

          </div>

          {/* Section: Affiliation Router Disclaimers */}
          <div className="bg-slate-50 dark:bg-slate-900/40 rounded-[24px] border border-slate-100 dark:border-slate-800/80 p-5 space-y-4">
            <div className="flex items-center gap-2 text-admin-primary dark:text-admin-secondary text-xs font-black uppercase tracking-widest">
              <Info className="w-4 h-4 shrink-0" />
              <span>Curation Router Guidelines</span>
            </div>
            <ul className="space-y-3.5 pl-0.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-admin-primary dark:text-admin-secondary font-mono mt-0.5">•</span>
                <span>All routes are audited dynamically. Clicking active affiliate checkout buttons on any product details panel will increment redirect metrics logs automatically.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-admin-primary dark:text-admin-secondary font-mono mt-0.5">•</span>
                <span>Changing a route's platform redirects the branding interface elements (e.g. Shopee vs Lazada tags) on public sneakers pages synchronously.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-admin-primary dark:text-admin-secondary font-mono mt-0.5">•</span>
                <span>Unconfigured route records are tagged with <strong className="text-amber-500 uppercase">Warning flags</strong> to prompt prompt calibration immediately.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

      {/* FAST EDIT SPECIFICATION MODAL (Slide-in / Backdrop layout) */}
      <AnimatePresence>
        {isEditModalOpen && editingProduct && (
          <div className="fixed inset-0 z-50 overflow-y-auto" id="affiliate-edit-modal">
            {/* Backdrop cover */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Modal Body container */}
            <div className="flex min-h-screen items-center justify-center p-4 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="w-full max-w-md bg-white dark:bg-admin-dark-surface rounded-[24px] border border-admin-border dark:border-admin-dark-border shadow-2xl overflow-hidden flex flex-col text-left transition-colors"
              >
                {/* Modal Header */}
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30">
                  <div className="space-y-0.5">
                    <h2 className="text-sm font-mono font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                      Configure Route Specs_
                    </h2>
                    <p className="text-[10px] text-slate-400 uppercase font-bold font-mono tracking-wider">
                      SPECIMEN ID: {editingProduct.id}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="p-1.5 rounded-[8px] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form fields */}
                <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
                  
                  {/* Sneaker Specimen display (Read-only) */}
                  <div className="flex gap-3 bg-slate-50 dark:bg-slate-900/30 p-3 rounded-[12px] border border-slate-100 dark:border-slate-800/60">
                    <div className="w-12 h-12 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-[8px] overflow-hidden p-1 shrink-0 flex items-center justify-center">
                      <img src={editingProduct.image} alt="" className="w-full h-full object-contain" />
                    </div>
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <p className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">{editingProduct.name}</p>
                      <p className="text-[10px] font-mono text-slate-400 uppercase">{editingProduct.brand} // {editingProduct.category}</p>
                    </div>
                  </div>

                  {/* Channel dropdown selection */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 block">
                      Marketplace Redirect Platform_
                    </label>
                    <select
                      value={editFormData.marketplace}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, marketplace: e.target.value as any }))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 px-4 py-3 rounded-[10px] focus:outline-none focus:border-admin-primary transition-all font-bold cursor-pointer font-sans"
                    >
                      <option value="Shopee">Shopee</option>
                      <option value="Tokopedia">Tokopedia</option>
                      <option value="TikTok Shop">TikTok Shop</option>
                      <option value="Lazada">Lazada</option>
                    </select>
                  </div>

                  {/* Affiliate redirection URL */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 block">
                      Target Affiliate Redirect Link_
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={editFormData.affiliateUrl}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, affiliateUrl: e.target.value }))}
                      placeholder="e.g. https://shopee.co.id/product-link-id?affiliate-utm-parameters..."
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 px-4 py-3 rounded-[10px] focus:outline-none focus:border-admin-primary transition-all font-sans font-medium leading-relaxed resize-none"
                    />
                  </div>

                  {/* Traffic clicks Calibration value */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-slate-400">
                      <label className="font-black">Redirect Click Count_</label>
                      <span className="text-admin-primary dark:text-admin-secondary font-bold">Calibration adjustment</span>
                    </div>
                    <input
                      type="number"
                      required
                      min={0}
                      value={editFormData.clicksCount}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, clicksCount: Math.max(0, parseInt(e.target.value) || 0) }))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 px-4 py-3 rounded-[10px] focus:outline-none focus:border-admin-primary transition-all font-mono font-bold"
                    />
                  </div>

                  {/* Modal controls */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="px-4.5 py-2.5 rounded-[10px] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-mono font-bold uppercase cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-[10px] bg-admin-primary hover:bg-opacity-95 text-white text-xs font-black uppercase tracking-wider cursor-pointer transition-all shadow-md shadow-indigo-500/10"
                    >
                      Commit Coordinate Changes
                    </button>
                  </div>

                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Affiliate;
