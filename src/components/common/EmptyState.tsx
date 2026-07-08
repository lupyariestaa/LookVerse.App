import React from 'react';
import * as Icons from 'lucide-react';
import Button from './Button';

interface EmptyStateProps {
  icon?: keyof typeof Icons;
  title: string;
  description: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'Inbox',
  title,
  description,
  buttonText,
  onButtonClick
}) => {
  // Dynamically resolve lucide icons
  const LucideIcon = (Icons[icon] as React.ComponentType<any>) || Icons.Inbox;

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 md:p-16 max-w-md mx-auto">
      <div className="w-16 h-16 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange mb-6 animate-pulse">
        <LucideIcon className="w-8 h-8" />
      </div>
      <h3 className="font-display font-black text-xl uppercase tracking-tight text-brand-black dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed mb-6">
        {description}
      </p>
      {buttonText && onButtonClick && (
        <Button variant="primary" size="sm" onClick={onButtonClick}>
          {buttonText}
        </Button>
      )}
    </div>
  );
};
export default EmptyState;
