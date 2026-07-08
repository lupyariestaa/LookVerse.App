import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { dataService } from '../services/dataService';
import { Brand } from '../types';
import Container from '../components/common/Container';
import Heading from '../components/common/Heading';

export const Brands: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const data = await dataService.getBrands();
        setBrands(data);
      } catch (err) {
        console.error('Failed to load brands', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBrands();
  }, []);

  return (
    <div className="flex-1 py-16 bg-[#F8FAFC] dark:bg-brand-black transition-colors duration-300 min-h-[70vh]">
      <Container>
        <div className="space-y-12">
          
          {/* Header section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-zinc-200 dark:border-white/10 pb-8">
            <div className="space-y-2">
              <Heading
                level={2}
                title="Verified "
                accentText="Brands"
                subtitle="Partner Indexes"
                align="left"
              />
              <p className="text-zinc-500 dark:text-zinc-400 text-xs font-mono font-bold uppercase tracking-widest">
                {brands.length} OFFICIALLY CURATED CHANNELS ACTIVE_
              </p>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs md:text-sm max-w-sm leading-relaxed font-medium">
              Discover authentic fashion models curated from our leading local and international brand partners.
            </p>
          </div>

          {isLoading ? (
            <div className="py-20 flex items-center justify-center">
              <span className="flex h-10 w-10 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75"></span>
                <span className="relative inline-flex rounded-full h-10 w-10 bg-brand-orange"></span>
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {brands.map((brand, idx) => (
                <motion.div
                  key={brand.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  whileHover={{ y: -6 }}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-[20px] overflow-hidden flex flex-col justify-between shadow-sm hover:border-brand-orange dark:hover:border-brand-orange/60 transition-all group"
                >
                  <div className="p-6 space-y-4">
                    {/* Brand Banner/Logo representation */}
                    <div className="relative aspect-[16/9] w-full bg-zinc-50 dark:bg-zinc-950 rounded-[12px] overflow-hidden flex items-center justify-center p-4">
                      <img
                        src={brand.logo}
                        alt={`${brand.name} logo`}
                        referrerPolicy="no-referrer"
                        className="max-h-full max-w-full object-contain mix-blend-normal filter group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="text-[9px] font-mono font-black uppercase text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded">
                          PARTNER_ID: {brand.id.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-sans font-black text-xl uppercase tracking-tight text-brand-black dark:text-white -skew-x-2">
                        {brand.name}
                      </h3>
                      <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed font-medium">
                        {brand.description}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-2 border-t border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/40 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                      DISCOVER_COLLECTION
                    </span>
                    <Link
                      to={`/shop?brand=${brand.slug}`}
                      className="text-xs font-black uppercase tracking-wider text-brand-orange hover:text-brand-orange-hover flex items-center gap-1.5 transition-colors"
                    >
                      <span>Explore Shelf</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

        </div>
      </Container>
    </div>
  );
};

export default Brands;
