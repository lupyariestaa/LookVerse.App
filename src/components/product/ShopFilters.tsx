import React from 'react';
import { Category, Brand } from '../../types';
import { Star, X, Tag, RotateCcw, Filter } from 'lucide-react';
import Button from '../common/Button';

interface ShopFiltersProps {
  categories: Category[];
  brands: Brand[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
  selectedBadge: string;
  setSelectedBadge: (badge: string) => void;
  selectedRating: number;
  setSelectedRating: (rating: number) => void;
  priceRange: number;
  setPriceRange: (price: number) => void;
  maxPrice: number;
  onReset: () => void;
  onCloseMobile?: () => void;
}

export const ShopFilters: React.FC<ShopFiltersProps> = ({
  categories,
  brands,
  selectedCategory,
  setSelectedCategory,
  selectedBrand,
  setSelectedBrand,
  selectedBadge,
  setSelectedBadge,
  selectedRating,
  setSelectedRating,
  priceRange,
  setPriceRange,
  maxPrice,
  onReset,
  onCloseMobile
}) => {
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const badges = ['New', 'Sale', 'Trending', 'Best Seller'];

  return (
    <div className="space-y-8 bg-white dark:bg-zinc-900/50 p-6 rounded-[16px] border border-zinc-200/60 dark:border-white/5 transition-all">
      {/* Mobile Title with Close button */}
      <div className="flex items-center justify-between lg:hidden pb-4 border-b border-zinc-200 dark:border-white/10">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-brand-orange" />
          <h2 className="text-lg font-sans font-black uppercase tracking-tight">Filters Deck</h2>
        </div>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close filters"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 1. CATEGORIES */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 bg-brand-orange rounded-full"></span>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-black dark:text-brand-white">
            Categories_
          </h3>
        </div>
        <div className="flex flex-col space-y-1.5">
          <button
            onClick={() => setSelectedCategory('')}
            className={`w-full text-left px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-[6px] transition-all flex items-center justify-between ${
              selectedCategory === ''
                ? 'bg-brand-orange text-white'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <span>All Categories</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`w-full text-left px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-[6px] transition-all flex items-center justify-between ${
                selectedCategory === cat.slug
                  ? 'bg-brand-orange text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. BRANDS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 bg-brand-orange rounded-full"></span>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-black dark:text-brand-white">
            Brands_
          </h3>
        </div>
        <div className="flex flex-col space-y-1.5">
          <button
            onClick={() => setSelectedBrand('')}
            className={`w-full text-left px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-[6px] transition-all ${
              selectedBrand === ''
                ? 'bg-brand-orange text-white'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            All Brands
          </button>
          {brands.map((brand) => (
            <button
              key={brand.id}
              onClick={() => setSelectedBrand(brand.slug)}
              className={`w-full text-left px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-[6px] transition-all ${
                selectedBrand === brand.slug
                  ? 'bg-brand-orange text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {brand.name}
            </button>
          ))}
        </div>
      </div>

      {/* 3. PRICE RANGE */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 bg-brand-orange rounded-full"></span>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-black dark:text-brand-white">
            Max Price_
          </h3>
        </div>
        <div className="space-y-3">
          <input
            type="range"
            min="100000"
            max={maxPrice}
            step="50000"
            value={priceRange}
            onChange={(e) => setPriceRange(Number(e.target.value))}
            className="w-full accent-brand-orange h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between items-center text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
            <span>Rp 100K</span>
            <span className="text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded">
              {formatPrice(priceRange)}
            </span>
          </div>
        </div>
      </div>

      {/* 4. BADGES */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 bg-brand-orange rounded-full"></span>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-black dark:text-brand-white">
            Promotions_
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedBadge('')}
            className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-[4px] border transition-all ${
              selectedBadge === ''
                ? 'bg-brand-black dark:bg-white text-white dark:text-brand-black border-brand-black dark:border-white'
                : 'border-zinc-200 dark:border-white/10 text-zinc-500 hover:border-zinc-400 dark:hover:border-zinc-700'
            }`}
          >
            All Promo
          </button>
          {badges.map((badge) => (
            <button
              key={badge}
              onClick={() => setSelectedBadge(badge)}
              className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-[4px] border transition-all ${
                selectedBadge === badge
                  ? 'bg-brand-orange text-white border-brand-orange shadow-sm'
                  : 'border-zinc-200 dark:border-white/10 text-zinc-500 hover:border-zinc-400 dark:hover:border-zinc-700'
              }`}
            >
              {badge}
            </button>
          ))}
        </div>
      </div>

      {/* 5. RATINGS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 bg-brand-orange rounded-full"></span>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-black dark:text-brand-white">
            Minimum Rating_
          </h3>
        </div>
        <div className="flex flex-col space-y-2">
          {[5, 4, 3].map((stars) => (
            <button
              key={stars}
              onClick={() => setSelectedRating(selectedRating === stars ? 0 : stars)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-[6px] text-xs font-bold transition-all ${
                selectedRating === stars
                  ? 'bg-brand-orange/10 border border-brand-orange/30 text-brand-orange'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent'
              }`}
            >
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < stars ? 'fill-amber-400 text-amber-400' : 'text-zinc-300 dark:text-zinc-700'
                    }`}
                  />
                ))}
              </div>
              <span>{stars === 5 ? '5.0 Only' : `& Up`}</span>
            </button>
          ))}
        </div>
      </div>

      {/* RESET BUTTON */}
      <div className="pt-4 border-t border-zinc-200 dark:border-white/10">
        <Button
          variant="outline"
          size="sm"
          className="w-full flex items-center justify-center gap-2 border-zinc-300 hover:border-brand-orange"
          onClick={onReset}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </Button>
      </div>
    </div>
  );
};

export default ShopFilters;
