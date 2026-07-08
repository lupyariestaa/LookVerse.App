import React from 'react';

export const ProductSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-[12px] overflow-hidden shadow-sm animate-pulse">
      {/* Aspect Square image skeleton */}
      <div className="relative aspect-square bg-zinc-200 dark:bg-zinc-800"></div>

      {/* Content area */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          {/* Brand/Rating row */}
          <div className="flex justify-between items-center">
            <div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            <div className="h-3 w-12 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          </div>

          {/* Title line 1 & 2 */}
          <div className="space-y-2">
            <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            <div className="h-4 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          </div>
        </div>

        {/* Price/Marketplace row */}
        <div className="flex items-baseline justify-between pt-4 border-t border-zinc-100 dark:border-white/5">
          <div className="space-y-1">
            <div className="h-3 w-10 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          </div>
          <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default ProductSkeleton;
