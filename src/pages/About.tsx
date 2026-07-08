import React from 'react';
import Container from '../components/common/Container';
import Heading from '../components/common/Heading';
import Badge from '../components/common/Badge';

export const About: React.FC = () => {
  return (
    <div className="flex-1 py-16 bg-white dark:bg-[#121212] transition-colors duration-300">
      <Container>
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* Header section */}
          <div className="text-center space-y-4 border-b border-zinc-200 dark:border-white/10 pb-8">
            <Heading
              level={2}
              title="About "
              accentText="LookVerse"
              subtitle="Platform Mission"
              align="center"
              slanted={true}
            />
            <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-lg mx-auto leading-relaxed italic">
              Empowering consumers to discover local and international fashion releases through clean, high-performance visual portals.
            </p>
          </div>

          {/* Grid details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            
            <div className="space-y-4 border border-zinc-200 dark:border-white/10 rounded-[12px] p-6 hover:border-brand-orange/40 transition-colors">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange">
                Affiliate Strategy
              </span>
              <h3 className="font-display font-black text-lg uppercase tracking-tight">
                Not a Direct Store
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed">
                LookVerse is a visual aggregate. We curatively display sneakers, streetwear, outer jackets, and premium apparel. Once you select a product, you are seamlessly routed directly to verified marketplace listings on Shopee, Tokopedia, Lazada, and TikTok Shop.
              </p>
            </div>

            <div className="space-y-4 border border-zinc-200 dark:border-white/10 rounded-[12px] p-6 hover:border-brand-orange/40 transition-colors">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange">
                Design Identity
              </span>
              <h3 className="font-display font-black text-lg uppercase tracking-tight">
                Editorial Bold Style
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed">
                Built with dark-mode optimized colors (off-white, coal, neon orange), slanted structural tags, and high-contrast typography, LookVerse delivers a professional, premium interactive magazine aesthetic for streetwear and footwear.
              </p>
            </div>

          </div>

          {/* Core Values banner */}
          <div className="bg-brand-black text-white rounded-[16px] p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <Badge variant="orange" skew>ACTIVE DECK</Badge>
            </div>
            <div className="max-w-md space-y-4">
              <h4 className="font-display font-black text-2xl uppercase tracking-tighter italic">
                Our Golden Value
              </h4>
              <p className="text-zinc-400 text-xs leading-relaxed italic border-l-2 border-brand-orange pl-4">
                "Craftsmanship over default templates. Speed, aesthetics, and privacy. Curating trust in the Indonesian fashion ecosystem."
              </p>
            </div>
          </div>

        </div>
      </Container>
    </div>
  );
};
export default About;
