import React from 'react';
import { X } from 'lucide-react';

interface BadgeProps {
  variant?: 'orange' | 'white' | 'dark' | 'outline' | 'green' | 'blue';
  skew?: boolean;
  className?: string;
  onClose?: () => void;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'orange',
  skew = true,
  className = '',
  onClose,
  children
}) => {
  const baseStyle = 'inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] px-2.5 py-1 select-none';
  
  const variants = {
    orange: 'bg-brand-orange text-white',
    white: 'bg-brand-white text-brand-black border border-zinc-200 dark:border-white/10',
    dark: 'bg-brand-black text-brand-white border border-white/10',
    outline: 'border border-current text-current',
    green: 'bg-green-600 text-white',
    blue: 'bg-blue-600 text-white',
  };

  const skewStyle = skew ? 'transform -skew-x-12' : '';

  return (
    <span className={`${baseStyle} ${variants[variant]} ${skewStyle} ${className}`}>
      <span className={`inline-flex items-center gap-1.5 ${skew ? 'transform skew-x-12' : ''}`}>
        {children}
        {onClose && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="hover:scale-125 hover:text-red-400 transition-transform cursor-pointer ml-1 p-0.5 rounded-full"
            aria-label="Remove filter badge"
          >
            <X className="w-3 h-3" strokeWidth={3} />
          </button>
        )}
      </span>
    </span>
  );
};
export default Badge;
