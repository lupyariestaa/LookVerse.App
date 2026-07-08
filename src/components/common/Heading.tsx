import React from 'react';

interface HeadingProps {
  level?: 1 | 2 | 3 | 4;
  title: string;
  subtitle?: string;
  accentText?: string;
  align?: 'left' | 'center' | 'right';
  slanted?: boolean;
  className?: string;
}

export const Heading: React.FC<HeadingProps> = ({
  level = 2,
  title,
  subtitle,
  accentText,
  align = 'left',
  slanted = false,
  className = ''
}) => {
  const alignment = {
    left: 'text-left items-start',
    center: 'text-center items-center justify-center',
    right: 'text-right items-end',
  };

  const slantedClass = slanted ? '-skew-x-12' : '';

  const renderTitle = () => {
    const fullTitle = (
      <>
        {title}
        {accentText && <span className="text-brand-orange">{accentText}</span>}
      </>
    );

    switch (level) {
      case 1:
        return (
          <h1 className={`text-5xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85] ${slantedClass}`}>
            {fullTitle}
          </h1>
        );
      case 3:
        return (
          <h3 className={`text-xl md:text-2xl font-black tracking-tight uppercase ${slantedClass}`}>
            {fullTitle}
          </h3>
        );
      case 4:
        return (
          <h4 className={`text-lg md:text-xl font-bold uppercase tracking-wide ${slantedClass}`}>
            {fullTitle}
          </h4>
        );
      case 2:
      default:
        return (
          <h2 className={`text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none ${slantedClass}`}>
            {fullTitle}
          </h2>
        );
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${alignment[align]} ${className}`}>
      {subtitle && (
        <div className="flex items-center gap-2">
          {align === 'left' && <div className="h-[1px] w-8 bg-brand-orange"></div>}
          <p className="text-brand-orange text-[10px] md:text-xs font-black uppercase tracking-[0.3em]">
            {subtitle}
          </p>
          {align === 'right' && <div className="h-[1px] w-8 bg-brand-orange"></div>}
        </div>
      )}
      {renderTitle()}
    </div>
  );
};
export default Heading;
