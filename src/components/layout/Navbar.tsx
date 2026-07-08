import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Heart, 
  Search, 
  Home, 
  ShoppingBag, 
  LayoutGrid, 
  Sparkles, 
  User, 
  Plus, 
  ArrowUpRight, 
  Info,
  ShieldCheck,
  Compass
} from 'lucide-react';
import Container from '../common/Container';
import { dataService } from '../../services/dataService';
import { WebsiteSettings } from '../../types';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  
  // States
  const [scrolled, setScrolled] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  
  // Mobile drawer states
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [quickSearchQuery, setQuickSearchQuery] = useState('');

  useEffect(() => {
    const loadSettings = () => {
      try {
        setSettings(dataService.getSettings());
      } catch (err) {
        console.error('Failed to load settings in Navbar', err);
      }
    };
    loadSettings();
    window.addEventListener('storage', loadSettings);
    return () => window.removeEventListener('storage', loadSettings);
  }, []);

  // Handle scroll shadow/glass effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Monitor wishlist size changes
  useEffect(() => {
    const updateWishlistCount = () => {
      try {
        const stored = localStorage.getItem('wishlist');
        if (stored) {
          const arr = JSON.parse(stored);
          setWishlistCount(arr.length);
        } else {
          setWishlistCount(0);
        }
      } catch (e) {
        console.error(e);
      }
    };

    updateWishlistCount();

    window.addEventListener('storage', updateWishlistCount);
    const interval = setInterval(updateWishlistCount, 1000);

    return () => {
      window.removeEventListener('storage', updateWishlistCount);
      clearInterval(interval);
    };
  }, []);

  const navLinks = [
    { name: 'Showcase', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Categories', path: '/categories' },
    { name: 'Brands', path: '/brands' },
    { name: 'AI Specimen Matcher', path: '/specimen-matcher' },
    { name: 'About', path: '/about' },
  ];

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(quickSearchQuery.trim())}`);
      setIsExploreOpen(false);
      setQuickSearchQuery('');
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 border-b ${
          scrolled
            ? 'bg-white/95 dark:bg-brand-black/95 backdrop-blur-md py-4 shadow-md border-zinc-200/50 dark:border-white/5'
            : 'bg-white dark:bg-brand-black py-6 border-zinc-200 dark:border-white/10'
        }`}
      >
        <Container>
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link
              to="/"
              className="text-2xl md:text-3xl font-display font-black tracking-tighter italic text-brand-black dark:text-white group select-none"
            >
              {settings?.siteName || 'LOOKVERSE'}<span className="text-brand-orange group-hover:animate-pulse">{settings?.siteSuffix ?? '_'}</span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex gap-8 lg:gap-10 items-center">
              {navLinks.map(link => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-200 pb-1 relative group ${
                      isActive
                        ? 'text-brand-black dark:text-white'
                        : 'text-zinc-500 hover:text-brand-black dark:hover:text-white'
                    }`}
                  >
                    {link.name}
                    {/* Underline trace */}
                    <span
                      className={`absolute bottom-0 left-0 w-full h-[2px] bg-brand-orange transition-transform duration-300 origin-left ${
                        isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-50'
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* Action Utilities - On mobile we hide these since they exist in the beautiful bottom bar */}
            <div className="flex items-center gap-2 md:gap-4 text-brand-black dark:text-white">
              {/* Desktop search */}
              <Link
                to="/shop?focusSearch=true"
                aria-label="Search"
                className="hidden sm:inline-flex p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors cursor-pointer"
              >
                <Search className="w-5 h-5" />
              </Link>

              {/* Desktop Wishlist */}
              <Link
                to="/wishlist"
                aria-label="Wishlist"
                className="hidden sm:inline-flex p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors relative cursor-pointer"
              >
                <Heart className="w-5 h-5 hover:text-brand-orange transition-colors" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-brand-orange text-white text-[8px] font-mono font-black flex items-center justify-center shadow-[0_0_8px_#FF4D00]">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Theme Toggle (Always visible, very convenient!) */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle Theme"
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors cursor-pointer"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </Container>
      </header>

      {/* =========================================================================
          3. PREMIUM FLOATING CAPSULE NAVIGATION BAR (PILL DESIGN)
          ========================================================================= */}
      <div className="sm:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-fit h-[54px] bg-[#0E0E11]/95 backdrop-blur-md rounded-full border border-zinc-800/80 px-2 flex items-center justify-center gap-1.5 shadow-[0_16px_36px_rgba(0,0,0,0.8)]">
        {[
          { id: 'home', label: 'Home', icon: Home, path: '/' },
          { id: 'shop', label: 'Shop', icon: ShoppingBag, path: '/shop' },
          { id: 'saved', label: 'Saved', icon: Heart, path: '/wishlist', badge: wishlistCount },
          { id: 'menu', label: 'Menu', icon: Menu, action: () => setIsMoreMenuOpen(true) },
        ].map((item) => {
          const isRouteActive = item.path ? (item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)) : false;
          const isActive = item.id === 'menu' ? isMoreMenuOpen : isRouteActive;
          const Icon = item.icon;

          const buttonContent = (
            <div className="flex items-center gap-2">
              <div className={`w-[40px] h-[40px] rounded-full flex items-center justify-center transition-all duration-300 ${
                isActive 
                  ? 'bg-brand-orange text-white shadow-[0_0_14px_rgba(255,77,0,0.5)]' 
                  : 'text-zinc-400 bg-zinc-900/60 hover:bg-zinc-900 hover:text-white'
              }`}>
                <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              </div>
              
              {isActive && (
                <span className="text-white text-[11px] font-black uppercase tracking-wider pr-3 select-none">
                  {item.label}
                </span>
              )}
            </div>
          );

          if (item.action) {
            return (
              <button
                key={item.id}
                onClick={item.action}
                className={`relative flex items-center rounded-full transition-all duration-300 cursor-pointer p-[3px] ${
                  isActive ? 'bg-[#18181C]' : ''
                }`}
              >
                {buttonContent}
              </button>
            );
          }

          return (
            <Link
              key={item.id}
              to={item.path || '/'}
              className={`relative flex items-center rounded-full transition-all duration-300 cursor-pointer p-[3px] ${
                isActive ? 'bg-[#18181C]' : ''
              }`}
            >
              {buttonContent}
              
              {/* Saved items Badge indicator */}
              {item.badge !== undefined && item.badge > 0 && !isActive && (
                <span className="absolute top-0 right-0 min-w-[14px] h-[14px] px-1 rounded-full bg-brand-orange text-white text-[7px] font-mono font-black flex items-center justify-center shadow-[0_0_6px_#FF4D00]">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* =========================================================================
          4. CENTRAL FAB EXPLORE / QUICK SEARCH SLIDE-UP DRAWER
          ========================================================================= */}
      <AnimatePresence>
        {isExploreOpen && (
          <>
            {/* Dark blur backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExploreOpen(false)}
              className="sm:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-50"
            />

            {/* Slide-up Container */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 rounded-t-[20px] z-50 px-5 pt-6 pb-12 space-y-6 max-h-[85vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-orange" />
                  <span className="text-xs font-black uppercase tracking-widest text-brand-black dark:text-white">Quick Specimen Search</span>
                </div>
                <button
                  onClick={() => setIsExploreOpen(false)}
                  className="p-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Interactive Search Bar */}
              <form onSubmit={handleQuickSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search sports kicks, brands..."
                  value={quickSearchQuery}
                  onChange={(e) => setQuickSearchQuery(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 text-brand-black dark:text-white pl-10 pr-4 py-3 rounded-[10px] border border-zinc-200 dark:border-zinc-800 text-xs font-medium focus:outline-none focus:border-brand-orange transition-colors"
                />
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-400" />
                <button
                  type="submit"
                  className="absolute right-2 top-2 px-3 py-1.5 bg-brand-orange text-white text-[9px] font-black uppercase tracking-wider rounded-[6px]"
                >
                  Go
                </button>
              </form>

              {/* Popular quick-tags / hot searches */}
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Trending Brands</span>
                <div className="flex flex-wrap gap-2">
                  {['Nike', 'Adidas', 'Jordan', 'Puma'].map((b) => (
                    <button
                      key={b}
                      onClick={() => {
                        navigate(`/shop?brand=${encodeURIComponent(b)}`);
                        setIsExploreOpen(false);
                      }}
                      className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[6px] text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-brand-orange dark:hover:text-brand-orange transition-colors cursor-pointer"
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Verified Badge */}
              <div className="flex items-center gap-2 bg-brand-orange/5 border border-brand-orange/15 rounded-[10px] p-3">
                <ShieldCheck className="w-4 h-4 text-brand-orange shrink-0" />
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-normal font-medium">
                  Verified Lookverse affiliate engine. All specimen ports link directly to original verified checkouts safely.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* =========================================================================
          5. NATIVE-LOOKING MORE MENU SLIDE-UP DRAWER
          ========================================================================= */}
      <AnimatePresence>
        {isMoreMenuOpen && (
          <>
            {/* Dark blur backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreMenuOpen(false)}
              className="sm:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-50"
            />

            {/* Slide-up Container */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 rounded-t-[20px] z-50 px-5 pt-6 pb-12 space-y-6 max-h-[85vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-brand-orange" />
                  <span className="text-xs font-black uppercase tracking-widest text-brand-black dark:text-white">Lookverse Directory</span>
                </div>
                <button
                  onClick={() => setIsMoreMenuOpen(false)}
                  className="p-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Options List */}
              <div className="grid grid-cols-1 divide-y divide-zinc-100 dark:divide-zinc-900">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsMoreMenuOpen(false)}
                      className="flex items-center justify-between py-4 group cursor-pointer"
                    >
                      <span className={`text-xs font-black uppercase tracking-widest transition-colors ${
                        isActive ? 'text-brand-orange' : 'text-zinc-600 dark:text-zinc-300'
                      }`}>
                        {link.name}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-brand-orange transition-colors" />
                    </Link>
                  );
                })}

                {/* Quick Link to Admin Dashboard */}
                <Link
                  to="/admin/login"
                  onClick={() => setIsMoreMenuOpen(false)}
                  className="flex items-center justify-between py-4 group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-brand-orange" />
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-300">
                      Merchant Dashboard
                    </span>
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-brand-orange/10 text-brand-orange border border-brand-orange/20">
                    PORTAL
                  </span>
                </Link>
              </div>

              {/* Tiny bottom brand signoff */}
              <div className="text-center pt-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                  LOOKVERSE SPORT ENGINE v1.2
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
