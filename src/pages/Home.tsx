import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  Flame, 
  Sparkles, 
  TrendingUp, 
  Percent, 
  Send, 
  Check, 
  Clock,
  ShieldCheck,
  Zap,
  Tag,
  Heart,
  Star,
  ShoppingCart,
  ArrowUpRight
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { Product, Category, Brand } from '../types';
import Container from '../components/common/Container';
import Heading from '../components/common/Heading';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ProductCard from '../components/product/ProductCard';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [flashDeals, setFlashDeals] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  
  // Newsletter state
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  
  // Timer countdown simulation
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

  // Load wishlist cache to sync favorite heart visual state
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('wishlist');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    // Dynamic countdown timer
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 24, minutes: 0, seconds: 0 }; // Restart
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const allProducts = await dataService.getProducts();
        
        // Filter Trending Products (Max 3)
        setTrendingProducts(allProducts.filter(p => p.badge === 'Trending' || p.rating >= 4.8).slice(0, 3));
        
        // Filter Flash Deals (highest discount, Max 3)
        setFlashDeals([...allProducts].sort((a, b) => b.discount - a.discount).slice(0, 3));
        
        // Filter New Arrivals (Max 3)
        setNewArrivals(allProducts.filter(p => p.badge === 'New' || p.id.includes('classic')).slice(0, 3));
        
        // Categories & Brands
        const allCategories = await dataService.getCategories();
        setCategories(allCategories.slice(0, 4)); // top 4
        
        const allBrands = await dataService.getBrands();
        setBrands(allBrands);
      } catch (err) {
        console.error('Failed to load landing data', err);
      }
    };

    fetchHomeData();
  }, []);

  const handleFavoriteToggle = (id: string) => {
    let newWishlist = [...wishlist];
    if (wishlist.includes(id)) {
      newWishlist = wishlist.filter(item => item !== id);
    } else {
      newWishlist.push(id);
    }
    setWishlist(newWishlist);
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 5000); // reset state after 5 seconds
  };

  return (
    <div className="flex-1 space-y-20 bg-[#F8FAFC] dark:bg-brand-black transition-colors duration-300">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center bg-[#0A0A0A] text-white pt-12 overflow-hidden border-b border-white/10">
        {/* Editorial Watermark background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none overflow-hidden">
          <h1 className="text-[20rem] md:text-[32rem] font-sans font-black leading-none -skew-x-12 whitespace-nowrap">
            KICKS APPAREL SNEAKERS
          </h1>
        </div>

        <Container className="relative z-10 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Headline Details */}
            <div className="lg:col-span-7 space-y-8 text-left">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-[2px] w-12 bg-brand-orange"></div>
                  <p className="text-brand-orange font-black uppercase tracking-[0.4em] text-xs md:text-sm">
                    AFFILIATE SHOWCASE V1.0_
                  </p>
                </div>
                
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-sans font-black tracking-tighter leading-[0.85] uppercase -skew-x-6">
                  PHANTOM<br />
                  <span className="text-brand-orange">VOLT '24</span>
                </h1>
              </div>

              <p className="text-base md:text-xl text-zinc-400 max-w-lg leading-relaxed italic border-l-2 border-brand-orange/40 pl-6">
                Discover curated high-performance sneakers and modern streetwear. Connecting you directly with Shopee, Tokopedia, Lazada, and TikTok Shop affiliate portals.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Button variant="primary" size="lg" glow onClick={() => navigate('/shop')}>
                  Browse Showcase <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button variant="outline" size="lg" onClick={() => navigate('/about')}>
                  Explore Manifesto
                </Button>
              </div>

              {/* Verified Trust Badges */}
              <div className="flex flex-wrap gap-6 pt-6 opacity-60 text-[10px] font-black uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-orange" />
                  <span>100% Verified Partners</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-brand-orange" />
                  <span>Instant Routing Portals</span>
                </div>
              </div>
            </div>

            {/* Graphic Illustration side */}
            <div className="lg:col-span-5 relative flex items-center justify-center py-12 lg:py-0">
              {/* Spinning / Tilting Abstract Geometric Background */}
              <motion.div
                animate={{ rotate: -25 }}
                whileHover={{ scale: 1.05, rotate: -20 }}
                transition={{ duration: 0.5 }}
                className="relative w-72 h-44 sm:w-96 sm:h-56 bg-gradient-to-br from-brand-orange to-[#992e00] rounded-br-[120px] rounded-tl-[60px] rotate-[-25deg] shadow-[0_40px_100px_rgba(255,77,0,0.4)] flex items-center justify-center group cursor-pointer"
              >
                <div className="absolute -inset-4 border border-white/10 rounded-br-[120px] rounded-tl-[60px] rotate-[6deg] -z-10 group-hover:rotate-[2deg] transition-all duration-300"></div>
                
                {/* Embedded Big Editorial Text */}
                <div className="absolute -bottom-10 -left-6 text-white/5 font-sans font-black text-[10rem] italic select-none pointer-events-none">
                  KICK
                </div>

                {/* Simulated product image showcasing clean sneaker visual */}
                <img
                  src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop"
                  alt="Phantom Volt '24 Extreme Sneaker Preview"
                  className="w-[120%] max-w-none h-auto object-contain transform rotate-[15deg] group-hover:rotate-[10deg] -translate-y-4 group-hover:-translate-y-8 transition-all duration-500 select-none pointer-events-none drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]"
                />

                <div className="absolute bottom-4 left-6">
                  <Badge variant="white" skew>Volt Extreme</Badge>
                </div>
              </motion.div>

              {/* Small statistics indicator */}
              <div className="absolute top-[10%] right-0 space-y-4 hidden sm:block text-right">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-brand-orange">CONVERSION RATE</p>
                  <p className="text-4xl font-sans font-black italic text-white">92.4%</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-brand-orange">CURATED ITEMS</p>
                  <p className="text-4xl font-sans font-black italic text-white">1.2K+</p>
                </div>
              </div>
            </div>

          </div>
        </Container>
      </section>

      {/* 2. FEATURED CATEGORIES SECTION */}
      <section className="py-8">
        <Container>
          <div className="space-y-10">
            {/* Heading row */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <Heading
                level={2}
                title="Curated "
                accentText="Shelves"
                subtitle="Browse Segmentations"
              />
              <Link 
                to="/categories" 
                className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange hover:text-brand-orange-hover transition-colors flex items-center gap-1.5"
              >
                View All Segments <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Grid display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((cat, idx) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  onClick={() => navigate(`/shop?category=${cat.slug}`)}
                  className="group relative h-72 rounded-[16px] overflow-hidden bg-[#0A0A0A] shadow-md border border-zinc-200/50 dark:border-white/5 cursor-pointer"
                >
                  {/* Category Image Overlay */}
                  <img
                    src={cat.image}
                    alt={cat.name}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-40 group-hover:scale-105 transition-all duration-500"
                  />

                  {/* Dark transparent gradient for text contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>

                  {/* Category Content */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-end space-y-2 text-white">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-[4px] bg-brand-orange text-white">
                        <Tag className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange">
                        Discover Deck
                      </span>
                    </div>

                    <h3 className="text-xl font-sans font-black uppercase tracking-tight -skew-x-3">
                      {cat.name}
                    </h3>

                    <p className="text-[11px] text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2">
                      {cat.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* 3. TRENDING PRODUCTS */}
      <section className="py-8 bg-zinc-100/50 dark:bg-zinc-950/20 transition-colors duration-300">
        <Container>
          <div className="space-y-12">
            {/* Header Title */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <Heading
                level={2}
                title="Trending "
                accentText="Releases"
                subtitle="The Curated Hotlist"
              />
              <Link 
                to="/shop" 
                className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange hover:text-brand-orange-hover transition-colors flex items-center gap-1.5"
              >
                Go to Shop <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Trending list */}
            {trendingProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-8">
                {trendingProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isFavorite={wishlist.includes(product.id)}
                    onFavoriteToggle={handleFavoriteToggle}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-zinc-500">Loading premium hotlist...</div>
            )}
          </div>
        </Container>
      </section>

      {/* 4. FLASH DEALS PREVIEW WITH LIVE TIMER */}
      <section className="py-8">
        <Container>
          <div className="bg-brand-black text-white rounded-[24px] overflow-hidden border border-white/10 glow-orange relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.01] pointer-events-none select-none overflow-hidden">
              <h1 className="text-[20rem] font-black italic -skew-x-12 whitespace-nowrap">
                FLASH DEALS
              </h1>
            </div>

            <div className="relative z-10 p-8 md:p-12 space-y-12">
              {/* Header with ticking clock */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-[4px] bg-brand-orange text-white animate-pulse">
                      <Flame className="w-4 h-4" />
                    </span>
                    <span className="text-brand-orange text-xs font-black uppercase tracking-[0.3em]">
                      Limited Flash Port
                    </span>
                  </div>
                  <h3 className="text-3xl md:text-5xl font-sans font-black uppercase tracking-tighter -skew-x-3">
                    FLASH DEALS <span className="text-brand-orange">SHOWDOWN</span>
                  </h3>
                </div>

                {/* Interactive Ticking Clock UI */}
                <div className="flex items-center gap-3 bg-zinc-900 border border-white/10 px-6 py-3 rounded-[12px]">
                  <Clock className="w-4 h-4 text-brand-orange animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mr-2">ENDS IN:</span>
                  <div className="flex gap-1 text-xs font-mono font-black text-brand-orange">
                    <span className="bg-brand-black px-2 py-1.5 rounded">{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className="animate-pulse">:</span>
                    <span className="bg-brand-black px-2 py-1.5 rounded">{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className="animate-pulse">:</span>
                    <span className="bg-brand-black px-2 py-1.5 rounded">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  </div>
                </div>
              </div>

              {/* Discount Kicks Grid */}
              {flashDeals.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                  {flashDeals.map(product => {
                    const isFav = wishlist.includes(product.id);
                    const formattedOriginalPrice = new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    }).format(product.originalPrice);
                    const formattedSalePrice = new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    }).format(product.salePrice);

                    // Marketplace specific background colors & styles
                    let mktBg = 'bg-orange-600 hover:bg-orange-700';
                    if (product.marketplace === 'Tokopedia') {
                      mktBg = 'bg-emerald-600 hover:bg-emerald-700';
                    } else if (product.marketplace === 'TikTok Shop') {
                      mktBg = 'bg-zinc-800 hover:bg-zinc-700';
                    } else if (product.marketplace === 'Lazada') {
                      mktBg = 'bg-blue-600 hover:bg-blue-700';
                    } else {
                      mktBg = 'bg-[#FF4D00] hover:bg-[#FF4D00]/90';
                    }

                    return (
                      <div key={product.id} className="relative">
                        {/* 1. DESKTOP/TABLET VIEW (Visible on sm and larger) */}
                        <div className="hidden sm:block bg-zinc-900/40 border border-white/5 rounded-[8px] p-1 sm:p-2 hover:border-brand-orange/30 transition-colors">
                          <ProductCard
                            product={product}
                            isFavorite={isFav}
                            onFavoriteToggle={handleFavoriteToggle}
                          />
                        </div>

                        {/* 2. MOBILE VIEW (Full-width 100% card with immersive product & offer details) */}
                        <div className="block sm:hidden bg-zinc-950 border border-zinc-800 rounded-[12px] overflow-hidden p-4 space-y-4 shadow-xl">
                          {/* Upper section: Left visual asset and right product summary info */}
                          <div className="flex gap-4">
                            {/* Left Col: Image with action overlays */}
                            <div className="relative w-28 h-28 shrink-0 bg-zinc-900 rounded-[8px] overflow-hidden border border-zinc-800">
                              <img
                                src={product.image}
                                alt={product.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                              
                              {/* Glowing offer badge */}
                              {product.discount > 0 && (
                                <div className="absolute top-1 left-1 bg-brand-orange text-white text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-[3px] shadow-sm">
                                  {product.discount}% OFF
                                </div>
                              )}
                              
                              {/* Quick-toggle Favorite */}
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleFavoriteToggle(product.id);
                                }}
                                className="absolute top-1 right-1 p-1.5 rounded-full bg-black/70 text-white hover:text-brand-orange transition-colors"
                              >
                                <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-brand-orange text-brand-orange' : 'text-zinc-300'}`} />
                              </button>
                            </div>

                            {/* Right Col: Primary brand, title, ratings, and price info */}
                            <div className="flex-1 flex flex-col justify-between min-w-0">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[9px] font-black uppercase tracking-widest text-brand-orange">
                                    {product.brand}
                                  </span>
                                  <div className="flex items-center gap-1 bg-zinc-900 px-1.5 py-0.5 rounded text-[9px] font-bold text-yellow-500 border border-zinc-800">
                                    <Star className="w-2.5 h-2.5 fill-yellow-500 text-yellow-500" />
                                    <span>{product.rating}</span>
                                  </div>
                                </div>

                                <Link
                                  to={`/product/${product.slug}`}
                                  className="block text-xs font-bold text-white hover:text-brand-orange leading-snug tracking-tight line-clamp-2"
                                >
                                  {product.name}
                                </Link>

                                <div className="pt-1 flex items-center gap-1.5">
                                  <span className="inline-block text-[8px] font-black uppercase tracking-[0.1em] text-zinc-400 border border-zinc-800 px-1.5 py-0.5 rounded bg-zinc-900">
                                    {product.marketplace}
                                  </span>
                                  <span className="text-[8px] text-zinc-500 flex items-center gap-0.5">
                                    <ShieldCheck className="w-2.5 h-2.5 text-brand-orange" /> Verified Port
                                  </span>
                                </div>
                              </div>

                              {/* Price segment */}
                              <div className="pt-2 flex items-baseline gap-1.5">
                                <span className="text-xs font-black text-brand-orange font-mono">
                                  {formattedSalePrice}
                                </span>
                                {product.originalPrice > product.salePrice && (
                                  <span className="text-[9px] line-through text-zinc-500 font-bold font-mono">
                                    {formattedOriginalPrice}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Middle section: Promising feature bullet points to boost confidence */}
                          {product.highlights && product.highlights.length > 0 && (
                            <div className="border-t border-zinc-900 pt-3 space-y-1.5">
                              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                                Promo Specifications & Highlights
                              </span>
                              <div className="grid grid-cols-1 gap-1">
                                {product.highlights.slice(0, 2).map((highlight, idx) => (
                                  <div key={idx} className="flex items-start gap-1.5 text-[10px] text-zinc-300 font-medium">
                                    <Zap className="w-3 h-3 text-brand-orange shrink-0 mt-0.5" />
                                    <span className="line-clamp-1">{highlight}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Lower section: Dual call to action buttons (Details vs Direct Purchase) */}
                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-900">
                            <Link
                              to={`/product/${product.slug}`}
                              className="text-center py-2 rounded-[6px] border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 text-[9.5px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-1"
                            >
                              <span>Inspect</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </Link>

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
                              className={`text-center py-2 rounded-[6px] text-white text-[9.5px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-1 shadow-md ${mktBg}`}
                            >
                              <ShoppingCart className="w-3 h-3" />
                              <span>BUY ON {product.marketplace.toUpperCase()}</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-zinc-500">Retrieving flash deals...</div>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* 5. NEW ARRIVALS */}
      <section className="py-8 bg-zinc-100/50 dark:bg-zinc-950/20 transition-colors duration-300">
        <Container>
          <div className="space-y-12">
            {/* Header title */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <Heading
                level={2}
                title="New "
                accentText="Arrivals"
                subtitle="Fresh Off The Deck"
              />
              <Link 
                to="/shop?badge=New" 
                className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange hover:text-brand-orange-hover transition-colors flex items-center gap-1.5"
              >
                Inspect New Releases <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* New Arrivals list */}
            {newArrivals.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {newArrivals.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isFavorite={wishlist.includes(product.id)}
                    onFavoriteToggle={handleFavoriteToggle}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-zinc-500">Scouting fresh apparel...</div>
            )}
          </div>
        </Container>
      </section>

      {/* 6. POPULAR BRANDS PREVIEW */}
      <section className="py-8">
        <Container>
          <div className="space-y-10">
            {/* Header details */}
            <Heading
              level={2}
              title="Verified "
              accentText="Partners"
              subtitle="The Brand Ecosystem"
              align="center"
            />

            {/* Logo track */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {brands.map((brand, idx) => (
                <motion.div
                  key={brand.id}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => navigate(`/shop?brand=${brand.slug}`)}
                  className="flex flex-col items-center justify-center p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-[12px] shadow-sm hover:border-brand-orange/40 dark:hover:shadow-[0_10px_25px_rgba(255,77,0,0.1)] transition-all cursor-pointer text-center space-y-3 group"
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center">
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] group-hover:text-brand-orange transition-colors">
                    {brand.name}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* 7. MANIFESTO CTA */}
      <section className="py-12 bg-[#0A0A0A] text-white overflow-hidden relative border-t border-b border-white/10">
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.01] pointer-events-none select-none overflow-hidden">
          <h1 className="text-[25rem] font-black italic -skew-x-12 whitespace-nowrap">
            LOOKVERSE MANIFESTO
          </h1>
        </div>

        <Container className="relative z-10 py-12">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="flex justify-center gap-2">
              <Badge variant="orange" skew>STATEMENT DECK</Badge>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-sans font-black uppercase tracking-tighter leading-none -skew-x-6">
              THE SNEAKER MANIFESTO_
            </h2>
            
            <p className="text-lg md:text-xl text-zinc-400 leading-relaxed italic border-l-2 border-brand-orange pl-6 max-w-xl mx-auto">
              "We curate high-conversion, professional apparel indexes. Providing you direct fast routes to checkout securely on top marketplaces. No logins, no cards, just pure design discovery."
            </p>

            <div className="pt-4">
              <Button variant="primary" size="lg" glow onClick={() => navigate('/shop')}>
                Explore Entire Catalog
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* 8. NEWSLETTER SECTION */}
      <section className="py-8 pb-16">
        <Container>
          <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-[24px] overflow-hidden shadow-xl p-8 md:p-12 relative">
            <div className="absolute top-0 right-0 p-4">
              <span className="w-3 h-3 rounded-full bg-brand-orange shadow-[0_0_8px_#FF4D00] inline-block"></span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* text info */}
              <div className="lg:col-span-6 space-y-4">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-brand-orange">
                  Stay Tuned
                </span>
                <h3 className="text-2xl md:text-3xl font-sans font-black uppercase tracking-tight -skew-x-3">
                  Unlock Weekly Release Logs_
                </h3>
                <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Join our sneaker mailing lobby. Receive immediate alerts when limited drops, Shopee flash deal codes, or local streetwear discounts go live.
                </p>
              </div>

              {/* Form Input */}
              <div className="lg:col-span-6">
                <AnimatePresence mode="wait">
                  {!subscribed ? (
                    <motion.form
                      key="newsletter-form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubscribe}
                      className="flex flex-col sm:flex-row gap-2"
                    >
                      <input
                        type="email"
                        required
                        placeholder="ENTER YOUR ACTIVE EMAIL_"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-white/10 px-5 py-4 text-xs font-mono font-bold uppercase tracking-widest text-brand-black dark:text-white rounded-[6px] focus:outline-none focus:border-brand-orange transition-colors"
                      />
                      <Button variant="primary" size="md" type="submit">
                        Subscribe <Send className="w-3.5 h-3.5 ml-2" />
                      </Button>
                    </motion.form>
                  ) : (
                    <motion.div
                      key="subscribed-feedback"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-brand-orange/10 border border-brand-orange/30 p-6 rounded-[12px] flex items-center gap-4 text-brand-black dark:text-brand-white"
                    >
                      <div className="w-10 h-10 rounded-full bg-brand-orange flex items-center justify-center text-white shrink-0">
                        <Check className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black uppercase tracking-wider">PORT REGISTERED_</h4>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          Welcome to the lobby. Check your inbox shortly for verify.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </Container>
      </section>

    </div>
  );
};
export default Home;
