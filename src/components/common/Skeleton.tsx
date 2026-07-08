import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle' | 'card';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rect' }) => {
  const baseClass = 'animate-pulse bg-zinc-200 dark:bg-zinc-800';

  if (variant === 'circle') {
    return <div className={`${baseClass} rounded-full ${className}`} />;
  }

  if (variant === 'text') {
    return <div className={`${baseClass} h-4 w-full rounded-[4px] ${className}`} />;
  }

  if (variant === 'card') {
    return (
      <div className="border border-brand-black/10 dark:border-white/10 rounded-[12px] p-4 flex flex-col gap-4 w-full">
        <div className={`${baseClass} h-48 w-full rounded-[8px]`} />
        <div className={`${baseClass} h-4 w-3/4 rounded-[4px]`} />
        <div className={`${baseClass} h-6 w-1/2 rounded-[4px]`} />
        <div className="flex justify-between items-center pt-2">
          <div className={`${baseClass} h-8 w-24 rounded-[4px]`} />
          <div className={`${baseClass} h-8 w-8 rounded-full`} />
        </div>
      </div>
    );
  }

  return <div className={`${baseClass} rounded-[8px] ${className}`} />;
};
export default Skeleton;
