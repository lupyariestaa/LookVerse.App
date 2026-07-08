import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'full';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-16 h-16 border-4',
    full: 'w-16 h-16 border-4',
  };

  const spinner = (
    <div className="relative">
      <div className={`${sizes[size]} border-brand-orange/20 border-t-brand-orange rounded-full animate-spin`}></div>
    </div>
  );

  if (size === 'full') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          {spinner}
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange animate-pulse">
            Loading LookVerse...
          </span>
        </div>
      </div>
    );
  }

  return spinner;
};
export default LoadingSpinner;
