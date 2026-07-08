import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Container from '../common/Container';
import { dataService } from '../../services/dataService';
import { WebsiteSettings } from '../../types';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);

  useEffect(() => {
    const loadSettings = () => {
      try {
        setSettings(dataService.getSettings());
      } catch (err) {
        console.error('Failed to load settings in Footer', err);
      }
    };
    loadSettings();
    window.addEventListener('storage', loadSettings);
    return () => window.removeEventListener('storage', loadSettings);
  }, []);

  const footerLinks = {
    explore: [
      { name: 'Showcase Feed', path: '/' },
      { name: 'Browse Shop', path: '/shop' },
      { name: 'Trending Categories', path: '/categories' },
      { name: 'Popular Brands', path: '/brands' },
    ],
    company: [
      { name: 'About Affiliate', path: '/about' },
      { name: 'Wishlist Ledger', path: '/wishlist' },
      { name: 'Privacy Statement', path: '/about' },
      { name: 'Terms of Showcase', path: '/about' },
    ],
    marketplaces: [
      { name: 'Shopee Indo', url: settings?.shopeeUrl || 'https://shopee.co.id' },
      { name: 'Tokopedia', url: settings?.tokopediaUrl || 'https://tokopedia.com' },
      { name: 'Lazada ID', url: settings?.lazadaUrl || 'https://lazada.co.id' },
      { name: 'TikTok Shop', url: settings?.tiktokShopUrl || 'https://tiktok.com' },
    ]
  };

  return (
    <footer className="bg-zinc-100 dark:bg-brand-black text-brand-black dark:text-brand-white border-t border-zinc-200 dark:border-white/10 transition-colors duration-300">
      <div className="py-16 md:py-20">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
            
            {/* Branding Column */}
            <div className="lg:col-span-2 space-y-6">
              <Link to="/" className="text-3xl font-display font-black tracking-tighter italic">
                {settings?.siteName || 'LOOKVERSE'}<span className="text-brand-orange">{settings?.siteSuffix ?? '_'}</span>
              </Link>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
                {settings?.siteDescription || 'A premium editorial fashion & sneaker discovery deck. Curating high-conversion products from multiple verified affiliate marketplaces in a clean bold landscape.'}
              </p>
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-orange shadow-[0_0_8px_#FF4D00]"></span>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  {settings?.locationString || 'Jakarta, Indonesia • Port 3000'}
                </span>
              </div>
            </div>

            {/* Quick Links Column */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange mb-6">
                {(settings?.siteName || 'LookVerse')} Index
              </p>
              <ul className="space-y-4">
                {footerLinks.explore.map((link, i) => (
                  <li key={i}>
                    <Link
                      to={link.path}
                      className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 hover:text-brand-orange transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Corporate Column */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange mb-6">
                Affiliate Ledger
              </p>
              <ul className="space-y-4">
                {footerLinks.company.map((link, i) => (
                  <li key={i}>
                    <Link
                      to={link.path}
                      className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 hover:text-brand-orange transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Marketplace Integrations Column */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange mb-6">
                Supported Ports
              </p>
              <ul className="space-y-4">
                {footerLinks.marketplaces.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 hover:text-brand-orange transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </Container>
      </div>

      {/* Copy & Status Bottom Bar */}
      <div className="border-t border-zinc-200 dark:border-white/5 py-8 bg-zinc-200/50 dark:bg-zinc-950/20">
        <Container>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-500">
            <div>
              © {currentYear} {settings?.siteName || 'LOOKVERSE'}. DESIGN STYLE: EDITORIAL BOLD.
            </div>
            <div className="flex gap-6">
              <span>EST. {settings?.establishedYear || '2026'}</span>
              <span className="text-brand-orange">{settings?.versionString || 'V1.0.0 RELEASE CANDIDATE'}</span>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
};
export default Footer;
