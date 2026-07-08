import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ShoppingBag, 
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { Product, Category, Brand } from '../types';
import Container from '../components/common/Container';
import Heading from '../components/common/Heading';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ProductCard from '../components/product/ProductCard';
import ShopFilters from '../components/product/ShopFilters';
import ProductSkeleton from '../components/product/ProductSkeleton';

export const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Static lists
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  
  // Filter States (Synchronized with search params on load)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [selectedBadge, setSelectedBadge] = useState(searchParams.get('badge') || '');
  const [selectedRating, setSelectedRating] = useState(Number(searchParams.get('rating')) || 0);
  
  // Price filter
  const MAX_PRICE_CAP = 3000000; // 3 Million IDR
  const [priceRange, setPriceRange] = useState(Number(searchParams.get('maxPrice')) || MAX_PRICE_CAP);

  // Sorting
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'popular');

  // Page level states
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Search input typing state (for instant search or manual query submit)
  const [searchTypedValue, setSearchTypedValue] = useState(searchParams.get('q') || '');

  // Wishlist caching synchronization
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('wishlist');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load static filters metadata once
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [cats, brs] = await Promise.all([
          dataService.getCategories(),
          dataService.getBrands()
        ]);
        setCategories(cats);
        setBrands(brs);
      } catch (err) {
        console.error('Failed to load filters metadata', err);
      }
    };
    loadMetadata();
  }, []);

  // Synchronize component states when URL searchParams update
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const brand = searchParams.get('brand') || '';
    const badge = searchParams.get('badge') || '';
    const rating = Number(searchParams.get('rating')) || 0;
    const maxPrice = Number(searchParams.get('maxPrice')) || MAX_PRICE_CAP;
    const sort = searchParams.get('sort') || 'popular';

    setSearchQuery(q);
    setSearchTypedValue(q);
    setSelectedCategory(category);
    setSelectedBrand(brand);
    setSelectedBadge(badge);
    setSelectedRating(rating);
    setPriceRange(maxPrice);
    setSortBy(sort);

    // If focusSearch is passed in url, automatically focus the input field
    if (searchParams.get('focusSearch') === 'true' && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 300);
    }
  }, [searchParams]);

  // Handle setting parameters to the URL bar so state is persistent and shareable
  const updateURLParams = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === '' || val === '0') {
        newParams.delete(key);
      } else {
        newParams.set(key, val);
      }
    });
    // Reset to page 1 on filter changes
    newParams.delete('page');
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  // Fetch and Filter Products (Runs whenever filter state updates)
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setIsLoading(true);
      
      // Artificial short loading delay (500ms) to provide elegant visual transitions with skeleton cards
      const delayPromise = new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        // Query basic filtering from dataService
        const result = await dataService.getProducts({
          category: selectedCategory || undefined,
          brand: selectedBrand || undefined,
          search: searchQuery || undefined,
          maxPrice: priceRange,
          sort: sortBy
        });

        // Extend filtering for badge and minimum ratings in frontend
        let filteredResult = [...result];

        if (selectedBadge) {
          filteredResult = filteredResult.filter(p => p.badge === selectedBadge);
        }

        if (selectedRating > 0) {
          filteredResult = filteredResult.filter(p => p.rating >= selectedRating);
        }

        await delayPromise;
        setProducts(filteredResult);
      } catch (err) {
        console.error('Failed to query catalog products', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [searchQuery, selectedCategory, selectedBrand, selectedBadge, selectedRating, priceRange, sortBy]);

  // Wishlist toggle syncing
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

  // Instant search input typing
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTypedValue(val);
    
    // Defer direct search update to enable smooth input typing
    const delayDebounce = setTimeout(() => {
      updateURLParams({ q: val });
    }, 400);

    return () => clearTimeout(delayDebounce);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateURLParams({ q: searchTypedValue });
  };

  const clearSearch = () => {
    setSearchTypedValue('');
    updateURLParams({ q: null });
  };

  // Master Reset
  const handleResetFilters = () => {
    setSearchTypedValue('');
    setSearchParams(new URLSearchParams()); // clear all
    setCurrentPage(1);
  };

  // Pagination logic
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNum: number) => {
    if (pageNum < 1 || pageNum > totalPages) return;
    setCurrentPage(pageNum);
    // Smooth scroll back to top of catalog grid on page change
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  return (
    <div className="flex-1 py-16 bg-[#F8FAFC] dark:bg-brand-black transition-colors duration-300">
      <Container>
        <div className="space-y-10">
          
          {/* 1. HEADER HERO */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-zinc-200 dark:border-white/10 pb-8">
            <div className="space-y-2">
              <Heading
                level={2}
                title="KICK "
                accentText="SHOWCASE"
                subtitle="The Verified Directory"
                align="left"
              />
              <p className="text-zinc-500 dark:text-zinc-400 text-xs font-mono font-bold uppercase tracking-widest">
                PORTALS ACTIVE: {products.length} CURATED ITEMS LOADED_
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Dynamic Badges indicators */}
              {selectedCategory && (
                <Badge variant="orange" skew onClose={() => updateURLParams({ category: null })}>
                  CAT: {selectedCategory}
                </Badge>
              )}
              {selectedBrand && (
                <Badge variant="dark" skew onClose={() => updateURLParams({ brand: null })}>
                  BRAND: {selectedBrand}
                </Badge>
              )}
              {selectedBadge && (
                <Badge variant="orange" skew onClose={() => updateURLParams({ badge: null })}>
                  PROMO: {selectedBadge}
                </Badge>
              )}
              {selectedRating > 0 && (
                <Badge variant="dark" skew onClose={() => updateURLParams({ rating: null })}>
                  RATINGS: {selectedRating}★+
                </Badge>
              )}
              {priceRange < MAX_PRICE_CAP && (
                <Badge variant="white" skew onClose={() => updateURLParams({ maxPrice: null })}>
                  MAX: Rp {priceRange / 1000}K
                </Badge>
              )}
            </div>
          </div>

          {/* 2. DISCOVERY CONTROLS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Instant Search Bar */}
            <form onSubmit={handleSearchSubmit} className="md:col-span-6 relative w-full">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="SEARCH PORTAL (NAME, BRAND, SHELF)..."
                value={searchTypedValue}
                onChange={handleSearchChange}
                className="w-full bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/5 pl-12 pr-10 py-3.5 text-xs font-mono font-bold uppercase tracking-widest text-brand-black dark:text-white rounded-[8px] focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/40 transition-all shadow-sm"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                <Search className="w-4 h-4" />
              </span>
              {searchTypedValue && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-brand-orange transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>

            {/* Mobile filters button & sorting selector */}
            <div className="md:col-span-6 flex items-center justify-between gap-4 w-full">
              
              {/* Trigger Mobile Filter Drawer */}
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="flex lg:hidden items-center gap-2 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/5 px-5 py-3.5 rounded-[8px] text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 hover:border-brand-orange transition-all shrink-0 shadow-sm"
              >
                <SlidersHorizontal className="w-4 h-4 text-brand-orange" />
                <span>Filters</span>
              </button>

              {/* Sorting Trigger dropdown */}
              <div className="relative flex-1 sm:flex-initial sm:w-64 ml-auto">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                  <ArrowUpDown className="w-4 h-4 text-brand-orange" />
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => updateURLParams({ sort: e.target.value })}
                  className="w-full bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/5 pl-12 pr-4 py-3.5 text-xs font-mono font-bold uppercase tracking-widest text-brand-black dark:text-white rounded-[8px] focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/40 transition-all shadow-sm appearance-none cursor-pointer"
                >
                  <option value="popular">SORT: MOST POPULAR_</option>
                  <option value="rating">SORT: HIGHEST RATING_</option>
                  <option value="price-low">SORT: PRICE LOW-HIGH_</option>
                  <option value="price-high">SORT: PRICE HIGH-LOW_</option>
                  <option value="discount">SORT: BIGGEST DISCOUNT_</option>
                  <option value="newest">SORT: NEW ARRIVALS_</option>
                </select>
              </div>

            </div>
          </div>

          {/* 3. CATALOG CONTENT DIVISION */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            
            {/* Desktop Filters Sidebar (Hidden on Mobile) */}
            <aside className="hidden lg:block lg:col-span-1 sticky top-24">
              <ShopFilters
                categories={categories}
                brands={brands}
                selectedCategory={selectedCategory}
                setSelectedCategory={(cat) => updateURLParams({ category: cat })}
                selectedBrand={selectedBrand}
                setSelectedBrand={(brand) => updateURLParams({ brand: brand })}
                selectedBadge={selectedBadge}
                setSelectedBadge={(badge) => updateURLParams({ badge: badge })}
                selectedRating={selectedRating}
                setSelectedRating={(rating) => updateURLParams({ rating: String(rating) })}
                priceRange={priceRange}
                setPriceRange={(price) => updateURLParams({ maxPrice: String(price) })}
                maxPrice={MAX_PRICE_CAP}
                onReset={handleResetFilters}
              />
            </aside>

            {/* Catalog Grid Area */}
            <div className="lg:col-span-3 space-y-12">
              
              {/* Loader Skeletons or Product Grid */}
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="skeletons-loading-grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6"
                  >
                    {[...Array(itemsPerPage)].map((_, i) => (
                      <ProductSkeleton key={i} />
                    ))}
                  </motion.div>
                ) : paginatedProducts.length > 0 ? (
                  <motion.div
                    key="catalog-loaded-grid"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6"
                  >
                    {paginatedProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isFavorite={wishlist.includes(product.id)}
                        onFavoriteToggle={handleFavoriteToggle}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="catalog-empty-layout"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center text-center p-12 md:p-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-[24px] space-y-6 shadow-sm"
                  >
                    <div className="w-20 h-20 bg-brand-orange/10 rounded-full flex items-center justify-center text-brand-orange border border-brand-orange/20 animate-bounce">
                      <ShoppingBag className="w-10 h-10" />
                    </div>

                    <div className="space-y-2 max-w-md">
                      <div className="flex justify-center">
                        <Badge variant="orange" skew>0 PRODUCTS MATCHED</Badge>
                      </div>
                      <h3 className="text-2xl font-sans font-black uppercase tracking-tight -skew-x-3">
                        NO KICKS FOUND_
                      </h3>
                      <p className="text-zinc-500 dark:text-zinc-400 text-xs md:text-sm leading-relaxed">
                        We scanned our entire database deck but couldn't locate items matching your requested query parameters. Try widening your price ranges, removing search text, or resetting filter states.
                      </p>
                    </div>

                    <div className="pt-2">
                      <Button variant="primary" size="md" onClick={handleResetFilters}>
                        Reset Catalog Filters
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 4. FUTURISTIC PAGINATION INTERFACE */}
              {!isLoading && totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-200 dark:border-white/10 pt-8">
                  <p className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                    SHOWING {paginatedProducts.length} OF {products.length} PRODUCTS
                  </p>

                  <div className="flex items-center gap-2">
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`p-2.5 rounded-[6px] border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer ${
                        currentPage === 1
                          ? 'opacity-40 cursor-not-allowed'
                          : 'hover:border-brand-orange hover:text-brand-orange bg-white dark:bg-zinc-900'
                      }`}
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Numeric Pages Status */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 px-5 py-2.5 rounded-[6px] text-xs font-mono font-black text-brand-black dark:text-white flex items-center gap-1">
                      <span>PAGE</span>
                      <span className="text-brand-orange">{String(currentPage).padStart(2, '0')}</span>
                      <span className="text-zinc-400 dark:text-zinc-600">/</span>
                      <span>{String(totalPages).padStart(2, '0')}</span>
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`p-2.5 rounded-[6px] border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer ${
                        currentPage === totalPages
                          ? 'opacity-40 cursor-not-allowed'
                          : 'hover:border-brand-orange hover:text-brand-orange bg-white dark:bg-zinc-900'
                      }`}
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </Container>

      {/* 5. MOBILE DRAWER FILTER BACKDROP (AnimatePresence slide in) */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
            {/* Backdrop cover overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            ></motion.div>

            {/* Slide-out Panel container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-sm h-full bg-white dark:bg-zinc-950 p-6 shadow-2xl overflow-y-auto flex flex-col"
            >
              <ShopFilters
                categories={categories}
                brands={brands}
                selectedCategory={selectedCategory}
                setSelectedCategory={(cat) => updateURLParams({ category: cat })}
                selectedBrand={selectedBrand}
                setSelectedBrand={(brand) => updateURLParams({ brand: brand })}
                selectedBadge={selectedBadge}
                setSelectedBadge={(badge) => updateURLParams({ badge: badge })}
                selectedRating={selectedRating}
                setSelectedRating={(rating) => updateURLParams({ rating: String(rating) })}
                priceRange={priceRange}
                setPriceRange={(price) => updateURLParams({ maxPrice: String(price) })}
                maxPrice={MAX_PRICE_CAP}
                onReset={handleResetFilters}
                onCloseMobile={() => setIsMobileFilterOpen(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Shop;
