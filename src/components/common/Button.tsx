import React from 'react';
import { motion } from 'motion/react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  glow = false,
  className = '',
  children,
  disabled,
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-display font-black uppercase tracking-wider transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-brand-orange text-white hover:bg-brand-orange-hover focus:ring-brand-orange',
    secondary: 'bg-brand-white text-brand-black hover:bg-white focus:ring-brand-white',
    outline: 'border-2 border-current hover:bg-brand-orange hover:text-white hover:border-brand-orange focus:ring-brand-orange',
    ghost: 'hover:bg-brand-white/10 dark:hover:bg-brand-black/40 text-current focus:ring-brand-orange',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  const sizes = {
    sm: 'text-[10px] px-4 py-2 tracking-[0.15em] rounded-[4px]',
    md: 'text-xs px-6 py-4 tracking-[0.2em] rounded-[6px]',
    lg: 'text-sm px-10 py-6 tracking-[0.25em] rounded-[8px]',
  };

  const glowStyle = glow && variant === 'primary' ? 'shadow-[0_0_25px_rgba(255,77,0,0.4)]' : '';

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${glowStyle} ${className}`}
      disabled={disabled}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
};
export default Button;
