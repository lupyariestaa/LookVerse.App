import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Footprints, Shirt, Sparkles, Briefcase, Watch, ArrowRight, Layers } from 'lucide-react';
import { dataService } from '../services/dataService';
import { Category } from '../types';
import Container from '../components/common/Container';
import Heading from '../components/common/Heading';

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await dataService.getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Footprints':
        return <Footprints className="w-6 h-6 text-brand-orange" />;
      case 'Shirt':
        return <Shirt className="w-6 h-6 text-brand-orange" />;
      case 'Sparkles':
        return <Sparkles className="w-6 h-6 text-brand-orange" />;
      case 'Briefcase':
        return <Briefcase className="w-6 h-6 text-brand-orange" />;
      case 'Watch':
        return <Watch className="w-6 h-6 text-brand-orange" />;
      default:
        return <Layers className="w-6 h-6 text-brand-orange" />;
    }
  };

  return (
    <div className="flex-1 py-16 bg-[#F8FAFC] dark:bg-brand-black transition-colors duration-300 min-h-[70vh]">
      <Container>
        <div className="space-y-12">
          
          {/* Header section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-zinc-200 dark:border-white/10 pb-8">
            <div className="space-y-2">
              <Heading
                level={2}
                title="Curated "
                accentText="Categories"
                subtitle="Fashion Segments"
                align="left"
              />
              <p className="text-zinc-500 dark:text-zinc-400 text-xs font-mono font-bold uppercase tracking-widest">
                {categories.length} CURATED SEGMENTS DISPATCHED_
              </p>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs md:text-sm max-w-sm leading-relaxed font-medium">
              Explore products organized cleanly by segment. Engineered for fluid navigation and instant discoverability.
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
              {categories.map((category, idx) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  whileHover={{ y: -6 }}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-[20px] overflow-hidden flex flex-col justify-between shadow-sm hover:border-brand-orange dark:hover:border-brand-orange/60 transition-all group"
                >
                  <div className="p-6 space-y-4">
                    {/* Category Illustration or Image */}
                    <div className="relative aspect-[16/9] w-full rounded-[12px] overflow-hidden bg-zinc-100 dark:bg-zinc-950">
                      <img
                        src={category.image}
                        alt={category.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover filter group-hover:scale-105 transition-transform duration-500 brightness-95 dark:brightness-75"
                      />
                      {/* Floating Category Icon badge */}
                      <div className="absolute top-4 left-4 bg-white dark:bg-zinc-900 p-2.5 rounded-full shadow-md border border-zinc-200/50 dark:border-white/10 flex items-center justify-center">
                        {getCategoryIcon(category.icon)}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-sans font-black text-xl uppercase tracking-tight text-brand-black dark:text-white -skew-x-2">
                        {category.name}
                      </h3>
                      <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed font-medium">
                        {category.description}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-2 border-t border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/40 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                      SEGMENT_PORTAL
                    </span>
                    <Link
                      to={`/shop?category=${category.slug}`}
                      className="text-xs font-black uppercase tracking-wider text-brand-orange hover:text-brand-orange-hover flex items-center gap-1.5 transition-colors"
                    >
                      <span>Explore Segment</span>
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

export default Categories;
