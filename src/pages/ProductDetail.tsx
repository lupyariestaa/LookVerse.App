import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  ExternalLink, 
  Star, 
  ShieldCheck, 
  Check, 
  Truck, 
  Info, 
  Sparkles, 
  ChevronRight, 
  ChevronDown,
  Copy, 
  QrCode, 
  ShoppingCart,
  BadgeAlert,
  HelpCircle
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { Product } from '../types';
import Container from '../components/common/Container';
import Heading from '../components/common/Heading';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ProductCard from '../components/product/ProductCard';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  
  // Collapsible section states
  const [isStoryExpanded, setIsStoryExpanded] = useState(true);
  const [isHighlightsExpanded, setIsHighlightsExpanded] = useState(true);
  const [isSpecsExpanded, setIsSpecsExpanded] = useState(true);

  // Interaction & UX States
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Load wishlist cache
  useEffect(() => {
    try {
      const stored = localStorage.getItem('wishlist');
      if (stored) {
        setWishlist(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse wishlist cache', e);
    }
  }, []);

  // Fetch product detail and related items
  useEffect(() => {
    if (!slug) return;

    const fetchProductDetails = async () => {
      setIsLoading(true);
      try {
        const foundProduct = await dataService.getProductBySlug(slug);
        if (foundProduct) {
          setProduct(foundProduct);
          setActiveImage(foundProduct.image);
          
          // Pre-select first size if available
          if (foundProduct.specifications?.['Sizes Available']) {
            const sizes = foundProduct.specifications['Sizes Available'].split(',').map(s => s.trim());
            if (sizes.length > 0) {
              setSelectedSize(sizes[0]);
            }
          }

          // Fetch related items
          const related = await dataService.getRelatedProducts(slug, 3);
          setRelatedProducts(related);

          // Save to recently viewed cache
          try {
            const recentStr = localStorage.getItem('recentlyViewed');
            let recent: string[] = recentStr ? JSON.parse(recentStr) : [];
            recent = recent.filter(id => id !== foundProduct.id);
            recent.unshift(foundProduct.id);
            localStorage.setItem('recentlyViewed', JSON.stringify(recent.slice(0, 6)));
          } catch (e) {
            console.error('Error updating recently viewed items cache', e);
          }
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error('Error fetching product details', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetails();
    // Scroll to top on route change
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug]);

  // Favorite Heart Toggle action
  const handleFavoriteToggle = () => {
    if (!product) return;
    let newWishlist = [...wishlist];
    const id = product.id;
    if (wishlist.includes(id)) {
      newWishlist = wishlist.filter(item => item !== id);
      triggerToast('Removed from favorites deck');
    } else {
      newWishlist.push(id);
      triggerToast('Added to favorites deck');
    }
    setWishlist(newWishlist);
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
  };

  const triggerToast = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  // Copy product shareable link
  const handleCopyLink = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    triggerToast('Product link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  // Price formatting
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Marketplace colors and theme identifiers
  const getMarketplaceBranding = (mp: string) => {
    switch (mp) {
      case 'Shopee':
        return {
          bg: 'bg-[#FF5722]',
          hover: 'hover:bg-[#e64a19]',
          text: 'text-[#FF5722]',
          border: 'border-[#FF5722]/20',
          gradient: 'from-[#FF5722] to-[#FF8A65]'
        };
      case 'Tokopedia':
        return {
          bg: 'bg-[#03C569]',
          hover: 'hover:bg-[#02a959]',
          text: 'text-[#03C569]',
          border: 'border-[#03C569]/20',
          gradient: 'from-[#03C569] to-[#26E387]'
        };
      case 'TikTok Shop':
        return {
          bg: 'bg-black dark:bg-zinc-800',
          hover: 'hover:bg-zinc-900 dark:hover:bg-zinc-700',
          text: 'text-black dark:text-white',
          border: 'border-black/20 dark:border-white/10',
          gradient: 'from-black to-zinc-700'
        };
      case 'Lazada':
        return {
          bg: 'bg-gradient-to-r from-[#000080] to-[#E6196D]',
          hover: 'opacity-90',
          text: 'text-[#E6196D]',
          border: 'border-[#E6196D]/20',
          gradient: 'from-[#000080] to-[#E6196D]'
        };
      default:
        return {
          bg: 'bg-brand-orange',
          hover: 'hover:bg-brand-orange-hover',
          text: 'text-brand-orange',
          border: 'border-brand-orange/20',
          gradient: 'from-brand-orange to-[#ff6a22]'
        };
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 py-20 flex items-center justify-center bg-[#F8FAFC] dark:bg-brand-black min-h-[70vh]">
        <div className="space-y-4 text-center">
          <div className="relative inline-flex">
            <span className="flex h-12 w-12 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75"></span>
              <span className="relative inline-flex rounded-full h-12 w-12 bg-brand-orange"></span>
            </span>
          </div>
          <p className="text-xs font-mono font-black uppercase tracking-[0.25em] text-zinc-500">
            CONNECTING CATALOG PORTAL_
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex-1 py-20 bg-[#F8FAFC] dark:bg-brand-black min-h-[70vh] flex items-center">
        <Container>
          <div className="max-w-md mx-auto text-center space-y-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 p-8 rounded-[16px] shadow-sm">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <BadgeAlert className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-sans font-black uppercase tracking-tight -skew-x-3">
                PRODUCT NOT FOUND_
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                The product identifier you selected does not exist or has been removed from our curated affiliate directories.
              </p>
            </div>
            <div className="pt-2">
              <Button variant="primary" size="sm" onClick={() => navigate('/shop')}>
                Return to Shop Showcase
              </Button>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  const brandStyle = getMarketplaceBranding(product.marketplace);
  const sizeList = product.specifications?.['Sizes Available']
    ? product.specifications['Sizes Available'].split(',').map(s => s.trim())
    : [];

  return (
    <div className="flex-1 pt-12 pb-24 sm:pb-12 bg-[#F8FAFC] dark:bg-brand-black transition-colors duration-300">
      
      {/* feedback message popup */}
      <AnimatePresence>
        {feedbackMsg && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-brand-black border border-white/10 text-white px-6 py-3 rounded-full text-xs font-mono font-black uppercase tracking-widest shadow-[0_20px_40px_rgba(0,0,0,0.3)] flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-brand-orange animate-pulse" />
            <span>{feedbackMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Container>
        <div className="space-y-8">
          
          {/* 1. BREADCRUMBS & NAVIGATION ROW */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-white/10 pb-6">
            
            {/* Dynamic Breadcrumbs */}
            <nav className="flex items-center space-x-2 text-[10px] font-mono font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              <Link to="/" className="hover:text-brand-orange transition-colors">
                LOBBY
              </Link>
              <ChevronRight className="w-3 h-3 text-zinc-400" />
              <Link to="/shop" className="hover:text-brand-orange transition-colors">
                KICKS
              </Link>
              <ChevronRight className="w-3 h-3 text-zinc-400" />
              <span className="text-brand-black dark:text-white truncate max-w-[120px] sm:max-w-none">
                {product.name}
              </span>
            </nav>

            {/* Back button */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400 hover:text-brand-orange dark:hover:text-white transition-colors cursor-pointer self-start"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>RETREAT PORTAL</span>
            </button>
          </div>

          {/* 2. PRIMARY PRODUCT METRICS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            
            {/* COLUMN A: Dynamic Gallery (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Active Image Canvas */}
              <div className="relative aspect-square md:aspect-[4/3] rounded-[20px] overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 flex items-center justify-center p-4 shadow-sm group">
                
                {/* Promo label indicator */}
                {product.badge && (
                  <div className="absolute top-5 left-5 z-10">
                    <Badge variant="orange" skew>{product.badge}</Badge>
                  </div>
                )}

                {/* Rating overlay badge */}
                <div className="absolute bottom-5 left-5 z-10 flex items-center gap-1.5 bg-brand-black/80 backdrop-blur-xs px-3 py-1.5 rounded-full text-white text-[10px] font-black tracking-widest border border-white/10">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>{product.rating}</span>
                  <span className="text-zinc-500">|</span>
                  <span>({product.reviewCount} REVIEWERS)</span>
                </div>

                <motion.img
                  key={activeImage}
                  src={activeImage}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full object-contain mix-blend-normal select-none pointer-events-none drop-shadow-md"
                />

                {/* Action Floating Buttons */}
                <div className="absolute top-5 right-5 flex flex-col gap-2 z-10">
                  {/* Share button */}
                  <button
                    onClick={handleCopyLink}
                    className="p-3 rounded-full bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:text-brand-orange border border-zinc-200 dark:border-white/10 shadow-sm transition-transform active:scale-95"
                    title="Copy share link"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  {/* QR Specimen */}
                  <button
                    onClick={() => setShowQrModal(true)}
                    className="p-3 rounded-full bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:text-brand-orange border border-zinc-200 dark:border-white/10 shadow-sm transition-transform active:scale-95"
                    title="Generate QR code"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Dynamic Thumbnail list */}
              {product.gallery && product.gallery.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {product.gallery.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`relative aspect-square rounded-[12px] overflow-hidden bg-white dark:bg-zinc-900 border transition-all ${
                        activeImage === img
                          ? 'border-brand-orange ring-1 ring-brand-orange/40 scale-95'
                          : 'border-zinc-200 dark:border-white/10 opacity-70 hover:opacity-100 hover:border-zinc-400 dark:hover:border-zinc-700'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} Thumbnail ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain p-1"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* COLUMN B: Specimen Information Deck (lg:col-span-5) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Product branding & Name details */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-orange bg-brand-orange/10 px-2.5 py-1 rounded">
                    {product.brand} deck
                  </span>
                  <span className="text-zinc-400 text-xs">•</span>
                  <span className="text-zinc-500 dark:text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em]">
                    {product.category} SPECIMEN
                  </span>
                </div>

                <h1 className="text-3xl md:text-4xl font-sans font-black uppercase tracking-tight leading-[1.1] text-brand-black dark:text-white -skew-x-2">
                  {product.name}
                </h1>
              </div>

              {/* Pricing breakdown section */}
              <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-white/5 p-6 rounded-[16px] shadow-sm space-y-4">
                <div className="flex items-baseline gap-4">
                  <span className="text-3xl md:text-4xl font-sans font-black tracking-tight text-brand-orange">
                    {formatPrice(product.salePrice)}
                  </span>
                  
                  {product.discount > 0 && (
                    <span className="text-zinc-400 dark:text-zinc-500 line-through text-sm font-bold">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}

                  {product.discount > 0 && (
                    <Badge variant="orange" skew={false} className="text-[9px] py-0.5 px-2">
                      {product.discount}% OFF
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs border-t border-zinc-100 dark:border-white/5 pt-3 font-medium">
                  <Truck className="w-4 h-4 text-green-500 shrink-0" />
                  <span>Free shipping options available on target platform.</span>
                </div>
              </div>

              {/* Sizes Available */}
              {sizeList.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-zinc-500">
                    <span>Select Size_</span>
                    <span className="text-brand-orange text-[10px] font-bold">US / IND SIZE</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sizeList.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 text-xs font-mono font-bold rounded-[6px] border transition-all ${
                          selectedSize === size
                            ? 'bg-brand-black dark:bg-white text-white dark:text-brand-black border-brand-black dark:border-white'
                            : 'border-zinc-200 dark:border-white/10 hover:border-zinc-400 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* MARKETPLACE PORTAL CARD (Direct checkout buttons) */}
              <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-white/5 p-6 rounded-[16px] shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-brand-orange rounded-full"></span>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-black dark:text-brand-white">
                    Verified Checkout Links_
                  </h3>
                </div>

                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  We scanned the web directories to find the safest direct routes to checkout. Clicking the button redirects you to verified official stores.
                </p>

                <div className="space-y-3 pt-2">
                  {/* Primary Target Button */}
                  <a
                    href={product.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      try {
                        const clicks = Number(localStorage.getItem('affiliateClicks') || '0');
                        localStorage.setItem('affiliateClicks', String(clicks + 1));
                        
                        // Increment product-level clicks
                        const productClicksStr = localStorage.getItem('lookverse_product_clicks') || '{}';
                        const productClicks = JSON.parse(productClicksStr);
                        productClicks[product.id] = (productClicks[product.id] || 0) + 1;
                        localStorage.setItem('lookverse_product_clicks', JSON.stringify(productClicks));
                      } catch (err) {
                        console.error('Failed to update clicks counter', err);
                      }
                    }}
                    className={`w-full py-4 px-6 rounded-[8px] flex items-center justify-center gap-3 text-white text-xs font-black uppercase tracking-[0.2em] transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-md ${brandStyle.bg} ${brandStyle.hover}`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Checkout on {product.marketplace}</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </a>

                  {/* Wishlist action */}
                  <button
                    onClick={handleFavoriteToggle}
                    className={`w-full py-3.5 px-6 rounded-[8px] flex items-center justify-center gap-2 border text-xs font-black uppercase tracking-[0.25em] transition-all cursor-pointer ${
                      wishlist.includes(product.id)
                        ? 'bg-red-50 dark:bg-red-950/20 text-red-500 border-red-200 dark:border-red-900/30'
                        : 'border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300 hover:border-brand-orange hover:text-brand-orange'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                    <span>{wishlist.includes(product.id) ? 'WISHLIST RECORDED' : 'ADD TO FAVORITES DECK'}</span>
                  </button>
                </div>

                {/* Affiliate Disclosure Badge */}
                <div className="flex gap-2.5 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-white/5 p-3 rounded-[8px] text-[10px] text-zinc-500 dark:text-zinc-400 leading-normal font-medium mt-4">
                  <Info className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                  <span>
                    <strong>AFFILIATE DISCLOSURE:</strong> As an affiliate curator, we may earn commissions on qualifying purchases routed through our verified portal tags. This supports our continuous high-end sneakers scouting.
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* 3. LOWER SPECIFICATIONS & HIGHLIGHTS DIVISION */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-8 border-t border-zinc-200 dark:border-white/10">
            
            {/* COLUMN A: Highlights & Story Collapsible (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Story & Aesthetics Collapsible Card */}
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-[12px] overflow-hidden bg-white dark:bg-zinc-900/40">
                <button
                  onClick={() => setIsStoryExpanded(!isStoryExpanded)}
                  className="w-full flex items-center justify-between p-5 text-left font-black uppercase tracking-[0.15em] text-xs text-brand-black dark:text-brand-white focus:outline-none cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-brand-orange rounded-full"></span>
                    <span>Story & Aesthetics_</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${isStoryExpanded ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence initial={false}>
                  {isStoryExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 pt-0 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-sans font-medium border-t border-zinc-100 dark:border-zinc-800/60">
                        {product.description}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Highlights Bullet List Collapsible Card */}
              {product.highlights && product.highlights.length > 0 && (
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-[12px] overflow-hidden bg-white dark:bg-zinc-900/40">
                  <button
                    onClick={() => setIsHighlightsExpanded(!isHighlightsExpanded)}
                    className="w-full flex items-center justify-between p-5 text-left font-black uppercase tracking-[0.15em] text-xs text-brand-black dark:text-brand-white focus:outline-none cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-brand-orange rounded-full"></span>
                      <span>Highlights Specimen_</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${isHighlightsExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isHighlightsExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="p-5 pt-0 border-t border-zinc-100 dark:border-zinc-800/60">
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pl-1">
                            {product.highlights.map((highlight, idx) => (
                              <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                                <Check className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                                <span>{highlight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* COLUMN B: Specifications Table Deck Collapsible Card (lg:col-span-5) */}
            <div className="lg:col-span-5">
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-[12px] overflow-hidden bg-white dark:bg-zinc-900/40">
                <button
                  onClick={() => setIsSpecsExpanded(!isSpecsExpanded)}
                  className="w-full flex items-center justify-between p-5 text-left font-black uppercase tracking-[0.15em] text-xs text-brand-black dark:text-brand-white focus:outline-none cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-brand-orange rounded-full"></span>
                    <span>Technical Specifications_</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${isSpecsExpanded ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence initial={false}>
                  {isSpecsExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 pt-0 border-t border-zinc-100 dark:border-zinc-800/60">
                        {product.specifications ? (
                          <div className="overflow-hidden rounded-[8px] border border-zinc-100 dark:border-zinc-800/40">
                            <table className="w-full text-xs text-left">
                              <tbody>
                                {Object.entries(product.specifications).map(([key, value], idx) => (
                                  <tr 
                                    key={key} 
                                    className={`border-b border-zinc-100 dark:border-white/5 last:border-0 ${
                                      idx % 2 === 0 ? 'bg-zinc-50/50 dark:bg-zinc-900/30' : ''
                                    }`}
                                  >
                                    <td className="px-4 py-2.5 font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 w-1/3">
                                      {key}
                                    </td>
                                    <td className="px-4 py-2.5 font-mono font-semibold text-brand-black dark:text-brand-white">
                                      {value}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-zinc-500 text-xs italic p-4">No additional technical specifications provided.</div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>

          {/* 4. RELATED PRODUCTS DIVISION */}
          {relatedProducts.length > 0 && (
            <div className="pt-12 border-t border-zinc-200 dark:border-white/10 space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <Heading
                  level={3}
                  title="Related "
                  accentText="Deck"
                  subtitle="Synchronous Categories"
                />
                <Link 
                  to={`/shop?category=${product.category}`} 
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange hover:text-brand-orange-hover transition-colors flex items-center gap-1.5"
                >
                  Explore Segment <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-8">
                {relatedProducts.map((related) => (
                  <ProductCard
                    key={related.id}
                    product={related}
                    isFavorite={wishlist.includes(related.id)}
                    onFavoriteToggle={(id) => {
                      let newWishlist = [...wishlist];
                      if (wishlist.includes(id)) {
                        newWishlist = wishlist.filter(item => item !== id);
                      } else {
                        newWishlist.push(id);
                      }
                      setWishlist(newWishlist);
                      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
                    }}
                  />
                ))}
              </div>
            </div>
          )}

        </div>
      </Container>

      {/* 5. INTERACTIVE QR POPUP DRAWER (Modal style) */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop cover overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQrModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xs"
            ></motion.div>

            {/* QR Card panel */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-[20px] p-8 shadow-2xl text-center space-y-6 z-10"
            >
              <div className="space-y-1">
                <h3 className="text-lg font-sans font-black uppercase tracking-tight text-brand-black dark:text-white -skew-x-2">
                  SPECIMEN QR PORT_
                </h3>
                <p className="text-[10px] font-mono font-black uppercase tracking-widest text-zinc-400">
                  SCAN TO OPEN AFFILIATE DIRECTORY
                </p>
              </div>

              {/* Simulated Elegant Vector QR Code */}
              <div className="w-48 h-48 bg-white border border-zinc-200 dark:border-white/5 rounded-[12px] p-4 flex flex-col items-center justify-center mx-auto relative group">
                {/* Simulated scan lines */}
                <div className="absolute inset-x-4 h-0.5 bg-brand-orange animate-bounce top-1/4"></div>
                
                {/* Simulated QR block matrix */}
                <div className="grid grid-cols-5 gap-2 w-full h-full opacity-90">
                  {[...Array(25)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`rounded-[3px] ${
                        i % 7 === 0 || i % 6 === 0 || i === 0 || i === 4 || i === 20 || i === 24
                          ? 'bg-brand-black' 
                          : i % 3 === 0 
                          ? 'bg-brand-orange' 
                          : 'bg-zinc-200'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal font-medium px-4">
                  Scan this QR code with your mobile camera scanner to instantly open this sneaker specification dossier and check out.
                </p>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1" 
                    onClick={() => setShowQrModal(false)}
                  >
                    Close
                  </Button>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="flex-1" 
                    onClick={handleCopyLink}
                  >
                    Copy Link
                  </Button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* 6. IMMERSIVE BOTTOM MOBILE TREND NAVI BAR */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-white/10 px-4 py-3 pb-safe-bottom flex items-center justify-between gap-3 shadow-[0_-10px_30px_rgba(0,0,0,0.08)]">
        {/* Price Tag Info */}
        <div className="flex flex-col">
          <span className="text-[9px] font-mono font-black uppercase text-zinc-400">specimen price</span>
          <span className="text-sm font-black text-brand-orange">{formatPrice(product.salePrice)}</span>
        </div>

        {/* Actions Container */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          {/* Wishlist toggle */}
          <button
            onClick={handleFavoriteToggle}
            className={`p-3 rounded-[8px] border flex items-center justify-center transition-all ${
              wishlist.includes(product.id)
                ? 'bg-red-50 dark:bg-red-950/20 text-red-500 border-red-200 dark:border-red-900/30'
                : 'border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800'
            }`}
          >
            <Heart className={`w-4 h-4 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
          </button>

          {/* Checkout Direct Link */}
          <a
            href={product.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              try {
                const clicks = Number(localStorage.getItem('affiliateClicks') || '0');
                localStorage.setItem('affiliateClicks', String(clicks + 1));
              } catch (e) {}
            }}
            className={`px-4 py-3 rounded-[8px] flex items-center justify-center gap-1.5 text-white text-[11px] font-black uppercase tracking-[0.15em] flex-1 text-center shadow-md ${brandStyle.bg} ${brandStyle.hover}`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>BUY ON {product.marketplace.toUpperCase()}</span>
          </a>
        </div>
      </div>

    </div>
  );
};

export default ProductDetail;
