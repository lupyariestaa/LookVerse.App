import React from 'react';

interface SectionProps {
  id?: string;
  className?: string;
  bg?: 'default' | 'surface' | 'dark' | 'orange';
  children: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({
  id,
  className = '',
  bg = 'default',
  children
}) => {
  const backgrounds = {
    default: 'bg-transparent text-brand-black dark:text-brand-white',
    surface: 'bg-surface-light dark:bg-surface-dark text-brand-black dark:text-brand-white',
    dark: 'bg-brand-black text-brand-white',
    orange: 'bg-brand-orange text-white',
  };

  return (
    <section
      id={id}
      className={`py-12 md:py-24 transition-colors duration-300 overflow-hidden relative ${backgrounds[bg]} ${className}`}
    >
      {children}
    </section>
  );
};
export default Section;
