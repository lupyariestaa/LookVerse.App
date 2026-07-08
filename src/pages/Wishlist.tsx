import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Trash2, 
  User, 
  BarChart3, 
  Sparkles, 
  Search, 
  ArrowRight, 
  Check, 
  UserCheck, 
  Clock, 
  ShoppingBag, 
  HelpCircle, 
  ShieldCheck, 
  Terminal, 
  Zap,
  ChevronRight,
  ExternalLink,
  Plus
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { Product, Brand, Category } from '../types';
import Container from '../components/common/Container';
import Heading from '../components/common/Heading';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ProductCard from '../components/product/ProductCard';

interface UserProfile {
  name: string;
  email: string;
  preferredSize: string;
  preferredBrand: string;
  avatarId: string;
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'SNEAKER SCOUT',
  email: 'scout@lookverse.io',
  preferredSize: 'US 9',
  preferredBrand: '',
  avatarId: '1'
};

const SIZES_AVAILABLE = [
  'US 6', 'US 7', 'US 8', 'US 8.5', 'US 9', 'US 9.5', 'US 10', 'US 10.5', 'US 11', 'US 12', 'US 13'
];

export const Wishlist: React.FC = () => {
  const navigate = useNavigate();
  
  // Tabs & Views state
  const [activeTab, setActiveTab] = useState<'saved' | 'profile' | 'analytics'>('saved');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  
  // Data State
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);
  const [savedProducts, setSavedProducts] = useState<Product[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  
  // Profile & Analytics state
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [clicksCount, setClicksCount] = useState(0);
  const [accessHash, setAccessHash] = useState('');

  // Editable Profile fields
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editSize, setEditSize] = useState('');
  const [editBrand, setEditBrand] = useState('');
  const [editAvatar, setEditAvatar] = useState('1');

  // Load all user preferences and list data on mount
  useEffect(() => {
    // 1. Load wishlist IDs from localStorage
    try {
      const storedWishlist = localStorage.getItem('wishlist');
      if (storedWishlist) {
        setWishlistIds(JSON.parse(storedWishlist));
      }
    } catch (e) {
      console.error('Failed to parse wishlist cache', e);
    }

    // 2. Load recently viewed IDs
    try {
      const storedRecent = localStorage.getItem('recentlyViewed');
      if (storedRecent) {
        setRecentlyViewedIds(JSON.parse(storedRecent));
      }
    } catch (e) {
      console.error('Failed to parse recently viewed cache', e);
    }

    // 3. Load user profile
    try {
      const storedProfile = localStorage.getItem('userProfile');
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        setProfile(parsed);
        setEditName(parsed.name);
        setEditEmail(parsed.email);
        setEditSize(parsed.preferredSize);
        setEditBrand(parsed.preferredBrand);
        setEditAvatar(parsed.avatarId || '1');
      } else {
        setEditName(DEFAULT_PROFILE.name);
        setEditEmail(DEFAULT_PROFILE.email);
        setEditSize(DEFAULT_PROFILE.preferredSize);
        setEditBrand(DEFAULT_PROFILE.preferredBrand);
        setEditAvatar(DEFAULT_PROFILE.avatarId);
      }
    } catch (e) {
      console.error('Failed to parse user profile cache', e);
    }

    // 4. Load click telemetry counters
    try {
      const clicks = Number(localStorage.getItem('affiliateClicks') || '0');
      setClicksCount(clicks);
    } catch (e) {
      console.error('Failed to load affiliate clicks', e);
    }

    // 5. Generate a unique user portal hash key if not present
    let portalHash = localStorage.getItem('portalAccessHash');
    if (!portalHash) {
      portalHash = 'LV-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
      localStorage.setItem('portalAccessHash', portalHash);
    }
    setAccessHash(portalHash);

    // 6. Fetch brands
    const fetchBrands = async () => {
      try {
        const brs = await dataService.getBrands();
        setBrands(brs);
      } catch (err) {
        console.error('Failed to load brands', err);
      }
    };
    fetchBrands();
  }, []);

  // Sync data whenever product or user states update
  useEffect(() => {
    const syncProductsData = async () => {
      try {
        const allProducts = await dataService.getProducts();
        
        // Filter Saved Kicks
        const saved = allProducts.filter(p => wishlistIds.includes(p.id));
        setSavedProducts(saved);

        // Filter Recently Viewed Kicks
        const recent = recentlyViewedIds
          .map(id => allProducts.find(p => p.id === id))
          .filter((p): p is Product => p !== undefined);
        setRecentProducts(recent);

        // Generate personalized recommendations
        let recommended: Product[] = [];
        
        // If they have a preferred brand, pick shoes of that brand
        if (profile.preferredBrand) {
          recommended = allProducts.filter(
            p => p.brand.toLowerCase() === profile.preferredBrand.toLowerCase() && !wishlistIds.includes(p.id)
          );
        }

        // If no matching brand, fallback to hot sales / trending deals that aren't in wishlist
        if (recommended.length === 0) {
          recommended = allProducts.filter(
            p => (p.badge === 'Sale' || p.badge === 'Trending') && !wishlistIds.includes(p.id)
          );
        }

        // Limit recommendations to 3
        setRecommendedProducts(recommended.slice(0, 3));
      } catch (err) {
        console.error('Failed to sync catalog products for dashboard', err);
      }
    };

    syncProductsData();
  }, [wishlistIds, recentlyViewedIds, profile]);

  // Handle visual feedback toasts
  const triggerToast = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  // Toggle favorite state from inside Wishlist page
  const handleFavoriteToggle = (id: string) => {
    let newWishlist = wishlistIds.filter(item => item !== id);
    if (wishlistIds.includes(id)) {
      triggerToast('Removed kick from Personal Lobby');
    } else {
      newWishlist.push(id);
      triggerToast('Added kick back to Lobby');
    }
    setWishlistIds(newWishlist);
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
  };

  // Clear entire saved list
  const handleClearWishlist = () => {
    if (window.confirm('ARE YOU SURE YOU WANT TO FLUSH YOUR ENTIRE SAVED LOBBY?_')) {
      setWishlistIds([]);
      localStorage.setItem('wishlist', JSON.stringify([]));
      triggerToast('Lobby flushed successfully.');
    }
  };

  // Save profile changes to persistent storage
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProfile: UserProfile = {
      name: editName.trim() || 'SNEAKER SCOUT',
      email: editEmail.trim() || 'scout@lookverse.io',
      preferredSize: editSize,
      preferredBrand: editBrand,
      avatarId: editAvatar
    };
    
    setProfile(updatedProfile);
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    triggerToast('Profile parameters updated securely.');
  };

  // Dynamic ranking based on items saved and affiliate clicks
  const getRankStats = () => {
    const score = wishlistIds.length + clicksCount;
    if (score === 0) {
      return { rank: 'UNREGISTERED APPRENTICE_', color: 'text-zinc-400 border-zinc-200/50 dark:border-white/5 bg-zinc-100/50 dark:bg-zinc-950/20' };
    } else if (score < 3) {
      return { rank: 'RECRUIT SNEAKER SCOUT_', color: 'text-brand-orange border-brand-orange/30 bg-brand-orange/5' };
    } else if (score < 7) {
      return { rank: 'VANGUARD INITIATE_', color: 'text-blue-500 border-blue-500/30 bg-blue-500/5' };
    } else {
      return { rank: 'ELITE LOOKVERSE TACTICIAN_', color: 'text-green-500 border-green-500/30 bg-green-500/5' };
    }
  };

  const rankInfo = getRankStats();

  // Filter saved ledger based on inner search query input
  const filteredSaved = savedProducts.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const avatars = [
    { id: '1', emoji: '👟', name: 'Original Sneaker' },
    { id: '2', emoji: '🔥', name: 'Hypebeast Flame' },
    { id: '3', emoji: '⚡', name: 'Volt Specimen' },
    { id: '4', emoji: '🕶️', name: 'Phantoms Agent' }
  ];

  const getAvatarEmoji = (id: string) => {
    return avatars.find(av => av.id === id)?.emoji || '👟';
  };

  return (
    <div className="flex-1 py-16 bg-[#F8FAFC] dark:bg-brand-black transition-colors duration-300">
      
      {/* Visual Toast Feedback */}
      <AnimatePresence>
        {feedbackMsg && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-brand-black border border-white/10 text-white px-6 py-3 rounded-full text-xs font-mono font-black uppercase tracking-widest shadow-[0_20px_40px_rgba(0,0,0,0.3)] flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-brand-orange" />
            <span>{feedbackMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Container>
        <div className="space-y-10">
          
          {/* 1. HEADER HERO */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-zinc-200 dark:border-white/10 pb-8">
            <div className="space-y-2">
              <Heading
                level={2}
                title="Lobby "
                accentText="Dashboard"
                subtitle="Personal Ecosystem"
                align="left"
              />
              <p className="text-zinc-500 dark:text-zinc-400 text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-2">
                <span>PORTAL AUTH_ SECURE_</span>
                <span className="text-brand-orange font-bold font-mono">[{accessHash}]</span>
              </p>
            </div>

            {/* Profile Brief header widget */}
            <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 p-4 rounded-[16px] shadow-sm w-full sm:w-auto">
              <div className="w-12 h-12 rounded-full bg-brand-orange/10 flex items-center justify-center text-2xl border border-brand-orange/20">
                {getAvatarEmoji(profile.avatarId)}
              </div>
              <div>
                <p className="text-xs font-sans font-black uppercase text-brand-black dark:text-white leading-tight">
                  {profile.name}
                </p>
                <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                  SIZE Pref: {profile.preferredSize} • {profile.preferredBrand || 'ALL BRANDS'}
                </p>
              </div>
            </div>
          </div>

          {/* 2. THREE-PANEL TAB NAVIGATION */}
          <div className="flex flex-col sm:flex-row gap-4 border-b border-zinc-200 dark:border-white/10 pb-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab('saved')}
                className={`px-5 py-3 rounded-[8px] text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'saved'
                    ? 'bg-brand-black dark:bg-white text-white dark:text-brand-black shadow-md'
                    : 'text-zinc-500 hover:text-brand-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
                }`}
              >
                <Heart className={`w-4 h-4 ${activeTab === 'saved' ? 'fill-current' : ''}`} />
                <span>Saved Ledger ({wishlistIds.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`px-5 py-3 rounded-[8px] text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-brand-black dark:bg-white text-white dark:text-brand-black shadow-md'
                    : 'text-zinc-500 hover:text-brand-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Personalize Profile</span>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-5 py-3 rounded-[8px] text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-brand-black dark:bg-white text-white dark:text-brand-black shadow-md'
                    : 'text-zinc-500 hover:text-brand-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Futuristic Telemetry</span>
              </button>
            </div>

            {/* Clear Wishlist Button inside tabs row on saved tab */}
            {activeTab === 'saved' && wishlistIds.length > 0 && (
              <button
                onClick={handleClearWishlist}
                className="sm:ml-auto flex items-center justify-center gap-1.5 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-white hover:bg-red-500 border border-red-500/20 hover:border-red-500 rounded-[8px] transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Flush Ledger</span>
              </button>
            )}
          </div>

          {/* 3. DYNAMIC CONTENT VIEWS */}
          <AnimatePresence mode="wait">
            
            {/* VIEW A: SAVED LEDGER */}
            {activeTab === 'saved' && (
              <motion.div
                key="saved-ledger-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-10"
              >
                
                {wishlistIds.length > 0 ? (
                  <div className="space-y-6">
                    {/* Inner filter query */}
                    <div className="relative w-full max-w-md">
                      <input
                        type="text"
                        placeholder="FILTER SAVED KICKS BY NAME/BRAND..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/5 pl-12 pr-4 py-3.5 text-xs font-mono font-bold uppercase tracking-widest text-brand-black dark:text-white rounded-[8px] focus:outline-none focus:border-brand-orange transition-all"
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                        <Search className="w-4 h-4" />
                      </span>
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-brand-orange text-xs font-bold"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Ledger Grid */}
                    {filteredSaved.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-8">
                        {filteredSaved.map(product => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            isFavorite={true}
                            onFavoriteToggle={handleFavoriteToggle}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-[16px]">
                        <p className="text-xs font-mono font-black uppercase text-zinc-400">
                          NO SAVED KICKS MATCH "{searchQuery.toUpperCase()}"_
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Elegant empty layout state */
                  <div className="border border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900/40 rounded-[24px] p-12 md:p-20 flex flex-col items-center text-center space-y-6 shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange border border-brand-orange/20 animate-pulse">
                      <Heart className="w-7 h-7" />
                    </div>
                    
                    <div className="space-y-2 max-w-md">
                      <div className="flex justify-center">
                        <Badge variant="orange" skew>LEDGER DEVOID</Badge>
                      </div>
                      <h3 className="font-sans font-black text-2xl uppercase tracking-tight -skew-x-2">
                        NO SNEAKERS DECKED_
                      </h3>
                      <p className="text-zinc-500 dark:text-zinc-400 text-xs md:text-sm leading-relaxed">
                        Your private lobby database is empty. Scan our verified affiliate showcase decks, filter for prices, and save specimens to construct your personal catalog.
                      </p>
                    </div>

                    <div className="pt-2">
                      <Button variant="primary" size="md" onClick={() => navigate('/shop')}>
                        Go Scouting <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* VIEW B: PERSONALIZE PROFILE */}
            {activeTab === 'profile' && (
              <motion.div
                key="profile-customizer-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
              >
                {/* Form container */}
                <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-[20px] p-6 md:p-8 shadow-sm space-y-6">
                  <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-white/5 pb-4">
                    <span className="w-2 h-4 bg-brand-orange rounded-full"></span>
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-brand-black dark:text-white">
                      Profile Matrix parameters_
                    </h3>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    {/* Display Avatar selection row */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block">
                        Select Personal Avatar Token_
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {avatars.map(av => (
                          <button
                            key={av.id}
                            type="button"
                            onClick={() => setEditAvatar(av.id)}
                            className={`p-4 rounded-[12px] border text-center transition-all flex flex-col items-center gap-2 cursor-pointer ${
                              editAvatar === av.id
                                ? 'border-brand-orange bg-brand-orange/5 text-brand-orange'
                                : 'border-zinc-200 dark:border-white/10 hover:border-zinc-400 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-300'
                            }`}
                          >
                            <span className="text-3xl">{av.emoji}</span>
                            <span className="text-[9px] font-black uppercase tracking-wider">{av.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Name input */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block">
                          Display Name_
                        </label>
                        <input
                          type="text"
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-[#F8FAFC] dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 px-4 py-3.5 text-xs font-mono font-bold uppercase tracking-widest text-brand-black dark:text-white rounded-[6px] focus:outline-none focus:border-brand-orange transition-colors"
                        />
                      </div>

                      {/* Email input */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block">
                          Email Address_
                        </label>
                        <input
                          type="email"
                          required
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="w-full bg-[#F8FAFC] dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 px-4 py-3.5 text-xs font-mono font-bold uppercase tracking-widest text-brand-black dark:text-white rounded-[6px] focus:outline-none focus:border-brand-orange transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Size preferred list */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block">
                          Preferred Shoe Size_
                        </label>
                        <select
                          value={editSize}
                          onChange={(e) => setEditSize(e.target.value)}
                          className="w-full bg-[#F8FAFC] dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 px-4 py-3.5 text-xs font-mono font-bold uppercase tracking-widest text-brand-black dark:text-white rounded-[6px] focus:outline-none focus:border-brand-orange transition-colors appearance-none cursor-pointer"
                        >
                          {SIZES_AVAILABLE.map(sz => (
                            <option key={sz} value={sz}>{sz}</option>
                          ))}
                        </select>
                      </div>

                      {/* Brand selector */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block">
                          Preferred Brand_
                        </label>
                        <select
                          value={editBrand}
                          onChange={(e) => setEditBrand(e.target.value)}
                          className="w-full bg-[#F8FAFC] dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 px-4 py-3.5 text-xs font-mono font-bold uppercase tracking-widest text-brand-black dark:text-white rounded-[6px] focus:outline-none focus:border-brand-orange transition-colors appearance-none cursor-pointer"
                        >
                          <option value="">ALL BRANDS (NO PREFERENCE)</option>
                          {brands.map(b => (
                            <option key={b.id} value={b.slug}>{b.name.toUpperCase()}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-100 dark:border-white/5 flex justify-end">
                      <Button variant="primary" size="md" type="submit" glow>
                        Save Profile Deck <UserCheck className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </form>
                </div>

                {/* Info block */}
                <div className="lg:col-span-4 bg-brand-black text-white rounded-[20px] p-6 shadow-xl border border-white/10 space-y-6">
                  <div className="flex justify-center">
                    <span className="text-6xl bg-white/10 p-4 rounded-full border border-white/20 animate-bounce">
                      {getAvatarEmoji(editAvatar)}
                    </span>
                  </div>

                  <div className="text-center space-y-2">
                    <h4 className="text-lg font-sans font-black uppercase tracking-tight -skew-x-2">
                      {editName || 'LOBBY SCOUT'}
                    </h4>
                    <p className="text-[10px] font-mono font-bold text-brand-orange tracking-[0.2em] uppercase">
                      RANK: {rankInfo.rank}
                    </p>
                  </div>

                  <div className="space-y-4 border-t border-white/10 pt-4 text-xs leading-relaxed text-zinc-400 font-medium">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-4 h-4 text-brand-orange shrink-0" />
                      <span>Parametric settings saved locally in secure browser cache files.</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-brand-orange shrink-0" />
                      <span>Last calibration sync: {new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Zap className="w-4 h-4 text-brand-orange shrink-0" />
                      <span>Dynamic recommendation pipelines automatically adjust parameters.</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* VIEW C: FUTURISTIC TELEMETRY */}
            {activeTab === 'analytics' && (
              <motion.div
                key="telemetry-analytics-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                
                {/* Visual Bento Stats Deck */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Stat Card 1 */}
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 p-6 rounded-[16px] shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[140px]">
                    <div className="absolute top-0 right-0 p-4 opacity-5 text-brand-orange">
                      <Heart className="w-24 h-24 stroke-[4]" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-zinc-400">
                        DECKS REGISTERED_
                      </p>
                      <h4 className="text-4xl font-sans font-black italic text-brand-black dark:text-white">
                        {wishlistIds.length}
                      </h4>
                    </div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                      Saved Kicks in cache databases
                    </p>
                  </div>

                  {/* Stat Card 2 */}
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 p-6 rounded-[16px] shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[140px]">
                    <div className="absolute top-0 right-0 p-4 opacity-5 text-brand-orange">
                      <Zap className="w-24 h-24 stroke-[4]" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-zinc-400">
                        REDIRECT CLICKS_
                      </p>
                      <h4 className="text-4xl font-sans font-black italic text-brand-orange">
                        {clicksCount}
                      </h4>
                    </div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                      Marketplace affiliate links routed
                    </p>
                  </div>

                  {/* Stat Card 3 */}
                  <div className={`border p-6 rounded-[16px] shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[140px] ${rankInfo.color} transition-colors duration-300`}>
                    <div className="absolute top-0 right-0 p-4 opacity-5 text-brand-orange">
                      <Terminal className="w-24 h-24 stroke-[4]" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono font-black uppercase tracking-[0.2em] opacity-60">
                        SCOUT CLASS RANKING_
                      </p>
                      <h4 className="text-xl font-sans font-black uppercase tracking-tight">
                        {rankInfo.rank.replace('_', '')}
                      </h4>
                    </div>
                    <p className="text-[10px] opacity-75 font-bold uppercase tracking-wider">
                      Calculated by interaction volume
                    </p>
                  </div>

                </div>

                {/* Sub telemetry terminal look */}
                <div className="bg-[#0D0E10] text-zinc-300 border border-zinc-800 rounded-[20px] p-6 space-y-4 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <div className="flex items-center gap-2 text-brand-orange font-bold">
                      <Terminal className="w-4 h-4 animate-pulse" />
                      <span>SYS_TELEMETRY_STREAM_</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                      <span className="text-[10px] text-zinc-500">SECURE SHELL</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-zinc-400">
                    <p><span className="text-zinc-600">&gt;&gt;</span> CONNECTING SECURE CLIENT DECK...</p>
                    <p><span className="text-zinc-600">&gt;&gt;</span> PORTAL ID: <span className="text-white">{accessHash}</span></p>
                    <p><span className="text-zinc-600">&gt;&gt;</span> ACTIVE USER: <span className="text-white">{profile.name.toUpperCase()}</span></p>
                    <p><span className="text-zinc-600">&gt;&gt;</span> SAVED_ITEMS_COUNT: <span className="text-brand-orange font-bold">{wishlistIds.length}</span> / CURATED_ECOSYSTEM_CAP: 1.2K+</p>
                    <p><span className="text-zinc-600">&gt;&gt;</span> PREFERRED_SIZE: <span className="text-white">{profile.preferredSize}</span></p>
                    <p><span className="text-zinc-600">&gt;&gt;</span> PREFERRED_BRAND: <span className="text-white">{profile.preferredBrand ? profile.preferredBrand.toUpperCase() : 'DEFAULTS_UNBOUND'}</span></p>
                    <p><span className="text-zinc-600">&gt;&gt;</span> LOCAL_CACHE_HEALTH: <span className="text-green-400 font-bold">OPTIMAL (100% SECURE)</span></p>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

          {/* 4. DYNAMIC PERSONALIZED RECOMMENDATIONS (Always visible or responsive sidebar layout depending on lists) */}
          {recommendedProducts.length > 0 && (
            <div className="pt-12 border-t border-zinc-200 dark:border-white/10 space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <Heading
                  level={3}
                  title="Personalised "
                  accentText="Scout Recommendations"
                  subtitle="Dynamic Calibration Match"
                />
                
                {profile.preferredBrand ? (
                  <Link 
                    to={`/shop?brand=${profile.preferredBrand}`} 
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange hover:text-brand-orange-hover transition-colors flex items-center gap-1.5"
                  >
                    Scout More {profile.preferredBrand.toUpperCase()} <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <Link 
                    to="/shop" 
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange hover:text-brand-orange-hover transition-colors flex items-center gap-1.5"
                  >
                    Browse Entire Shop <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              {/* Grid layout */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-8">
                {recommendedProducts.map(product => (
                  <div key={product.id} className="relative group">
                    <ProductCard
                      product={product}
                      isFavorite={wishlistIds.includes(product.id)}
                      onFavoriteToggle={(id) => {
                        let newWishlist = [...wishlistIds];
                        if (wishlistIds.includes(id)) {
                          newWishlist = newWishlist.filter(item => item !== id);
                          triggerToast('Removed kick from Personal Lobby');
                        } else {
                          newWishlist.push(id);
                          triggerToast('Added kick to Personal Lobby!');
                        }
                        setWishlistIds(newWishlist);
                        localStorage.setItem('wishlist', JSON.stringify(newWishlist));
                      }}
                    />
                    
                    {/* Personalized match badge overlay */}
                    {profile.preferredBrand && product.brand.toLowerCase() === profile.preferredBrand.toLowerCase() && (
                      <div className="absolute top-3 right-3 z-10 pointer-events-none">
                        <Badge variant="orange" skew={false} className="text-[8px] py-0.5 px-2 font-mono">
                          BRAND MATCH
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. RECENTLY VIEWED SPECIMENS DECK */}
          {recentProducts.length > 0 && (
            <div className="pt-12 border-t border-zinc-200 dark:border-white/10 space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <Heading
                  level={3}
                  title="Recently "
                  accentText="Browsed Specimens"
                  subtitle="Portal History cache"
                />
                
                <button
                  onClick={() => {
                    if (window.confirm('DO YOU WANT TO FLUSH RECENT BROWSE HISTORY CACHE?_')) {
                      setRecentlyViewedIds([]);
                      localStorage.setItem('recentlyViewed', JSON.stringify([]));
                      triggerToast('Browse history cache cleared.');
                    }
                  }}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 hover:text-red-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  Clear History Cache
                </button>
              </div>

              {/* Horizontal / Grid view */}
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                {recentProducts.map(product => (
                  <motion.div
                    key={product.id}
                    whileHover={{ y: -4 }}
                    onClick={() => navigate(`/product/${product.slug}`)}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-[12px] p-3 shadow-xs hover:border-brand-orange transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
                  >
                    <div className="relative aspect-square rounded-[8px] overflow-hidden bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-2">
                      <img
                        src={product.image}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain filter group-hover:scale-105 transition-all duration-300"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-[9px] font-mono font-black uppercase text-brand-orange">
                        {product.brand}
                      </p>
                      <h5 className="text-[11px] font-sans font-black uppercase text-brand-black dark:text-white line-clamp-1 leading-tight group-hover:text-brand-orange transition-colors">
                        {product.name}
                      </h5>
                      <p className="text-[10px] font-mono font-semibold text-zinc-500 dark:text-zinc-400">
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          maximumFractionDigits: 0
                        }).format(product.salePrice)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

        </div>
      </Container>
    </div>
  );
};

export default Wishlist;
