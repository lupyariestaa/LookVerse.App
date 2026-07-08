import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Heart, Star, ArrowUpRight } from 'lucide-react';
import { Product } from '../../types';
import Badge from '../common/Badge';

interface ProductCardProps {
  product: Product;
  isFavorite?: boolean;
  onFavoriteToggle?: (id: string, e: React.MouseEvent) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isFavorite = false,
  onFavoriteToggle
}) => {
  const formattedSalePrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(product.salePrice);

  const formattedOriginalPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(product.originalPrice);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle(product.id, e);
    }
  };

  return (
    <div
      className="group relative flex flex-col w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[8px] overflow-hidden transition-all duration-300 hover:border-brand-orange dark:hover:border-brand-orange"
    >
      {/* Product Image Wrapper */}
      <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-950">
        <img
          src={product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Floating Badges (Product Badge, e.g. Sale, New, Best Seller) */}
        {product.badge && (
          <div className="absolute top-2 left-2 z-10">
            <Badge variant={product.badge === 'Sale' ? 'orange' : 'dark'} skew>
              {product.badge}
            </Badge>
          </div>
        )}

        {/* Floating Favorite Button (Desktop Only) */}
        <button
          onClick={handleFavoriteClick}
          className="hidden sm:block absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md hover:bg-brand-orange hover:text-white dark:hover:bg-brand-orange text-brand-black dark:text-brand-white transition-all duration-200 cursor-pointer"
          aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`w-4 h-4 transition-transform duration-300 ${
              isFavorite ? 'fill-current text-brand-orange hover:text-white' : ''
            }`}
          />
        </button>

        {/* Floating Quick view overlay on hover (Desktop Only) */}
        <div className="hidden sm:flex absolute inset-0 bg-brand-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-center justify-center">
          <Link
            to={`/product/${product.slug}`}
            className="flex items-center gap-2 bg-brand-orange text-white text-xs font-black uppercase tracking-widest px-5 py-3 rounded-[4px] transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
          >
            Inspect Kick <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Product Content */}
      <div className="flex-1 p-2.5 sm:p-5 flex flex-col justify-between space-y-2 sm:space-y-4">
        <div className="space-y-1 sm:space-y-1.5">
          {/* Brand & Rating row (Desktop Only) */}
          <div className="hidden sm:flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-orange">
              {product.brand}
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
                {product.rating} ({product.reviewCount})
              </span>
            </div>
          </div>

          {/* Title - Compact on mobile (text-[11px] or 10px, 2 lines max, truncated if overflowed) */}
          <Link
            to={`/product/${product.slug}`}
            className="block text-[11px] sm:text-sm font-bold leading-tight sm:leading-snug tracking-tight text-brand-black dark:text-brand-white hover:text-brand-orange transition-colors line-clamp-2 h-7.5 sm:h-auto overflow-hidden"
          >
            {product.name}
          </Link>
        </div>

        {/* Pricing / Foot area */}
        <div className="flex items-baseline justify-between gap-1 sm:gap-2 border-t border-zinc-100 dark:border-white/5 pt-2 sm:pt-4">
          <div className="flex flex-col">
            {product.originalPrice > product.salePrice && (
              <span className="text-[9px] sm:text-[10px] line-through text-zinc-400 font-bold">
                {formattedOriginalPrice}
              </span>
            )}
            <span className="text-[11.5px] sm:text-sm font-black text-brand-orange font-mono">
              {formattedSalePrice}
            </span>
          </div>

          {/* Direct Affiliate Platform Badge (Desktop Only) */}
          <span className="hidden sm:inline-block text-[9px] font-black uppercase tracking-[0.15em] text-zinc-400 border border-zinc-200 dark:border-white/10 px-2 py-0.5 rounded-[3px]">
            {product.marketplace}
          </span>
        </div>
      </div>
    </div>
  );
};
export default ProductCard;
