import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Save,
  Settings as SettingsIcon,
  RotateCcw,
  Sparkles,
  Globe,
  Mail,
  Phone,
  Sliders,
  Eye,
  Info,
  CheckCircle,
  AlertTriangle,
  Smartphone,
  ExternalLink,
  Share2,
  Trash2,
  HelpCircle
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { WebsiteSettings } from '../../types';

export const Settings: React.FC = () => {
  // Config State
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'seo' | 'social' | 'advanced'>('general');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Validation tracking
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch current configs on load
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const current = dataService.getSettings();
        setSettings(current);
      } catch (err) {
        setAlert({ type: 'error', message: 'Failed to synchronize with localized systems.' });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const triggerToast = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert(null);
    }, 4000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!settings) return;
    const { name, value, type } = e.target;
    
    // Clear validation error if typed
    if (errors[name]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setSettings({ ...settings, [name]: checked });
    } else {
      setSettings({ ...settings, [name]: value });
    }
  };

  const validate = (): boolean => {
    if (!settings) return false;
    const nextErrors: Record<string, string> = {};

    if (!settings.siteName.trim()) nextErrors.siteName = 'Website Name cannot be empty';
    if (!settings.establishedYear.match(/^\d{4}$/)) nextErrors.establishedYear = 'Must be a 4-digit numeric year';
    if (!settings.email.trim() || !settings.email.includes('@')) nextErrors.email = 'Please provide a valid support email address';
    
    // Validate URLs loosely
    const urlFields = ['shopeeUrl', 'tokopediaUrl', 'lazadaUrl', 'tiktokShopUrl', 'instagramUrl', 'youtubeUrl', 'twitterUrl', 'whatsappUrl'];
    urlFields.forEach(field => {
      const val = settings[field as keyof WebsiteSettings];
      if (typeof val === 'string' && val.trim() !== '') {
        if (!val.startsWith('http://') && !val.startsWith('https://')) {
          nextErrors[field] = 'Must begin with http:// or https://';
        }
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    if (!validate()) {
      triggerToast('error', 'Configuration specifications failed validation diagnostics.');
      return;
    }

    try {
      dataService.saveSettings(settings);
      dataService.logActivity(`Global website settings calibrated for "${settings.siteName}".`, 'CONFIG');
      
      // Dispatch a storage event to force header/footer reload across the iframe instantly
      window.dispatchEvent(new Event('storage'));
      
      triggerToast('success', 'CONFIGURATION PROTOCOL RE-INDEXED SUCCESSFULLY.');
    } catch (err) {
      triggerToast('error', 'Failed to save configuration.');
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you absolutely sure you want to restore default LookVerse coordinates? All custom branding configurations will be overwritten.')) {
      try {
        localStorage.removeItem('lookverse_settings');
        const defaultSettings = dataService.getSettings();
        setSettings(defaultSettings);
        dataService.logActivity('Website configurations re-initialized to factory default settings.', 'CONFIG');
        
        // Dispatch storage event to update layout
        window.dispatchEvent(new Event('storage'));
        
        triggerToast('success', 'FACTORY COORDINATES RESTORED AND SAVED.');
      } catch (err) {
        triggerToast('error', 'Failed to re-initialize factory records.');
      }
    }
  };

  if (loading || !settings) {
    return (
      <div className="py-24 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-admin-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">LOADING WEB CONFIGURATORS...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in relative pb-16">
      {/* Dynamic Toast Alerts */}
      <AnimatePresence>
        {alert && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 px-5 py-4 rounded-[16px] border shadow-xl flex items-center gap-3 text-xs font-mono font-bold uppercase tracking-wider ${
              alert.type === 'success'
                ? 'bg-emerald-500 text-white border-emerald-600'
                : 'bg-rose-500 text-white border-rose-600'
            }`}
          >
            {alert.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
            <span>{alert.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-admin-border dark:border-admin-dark-border transition-colors duration-300">
        <div className="space-y-1.5">
          <h1 className="text-xl font-black uppercase tracking-tight text-slate-800 dark:text-slate-100 -skew-x-2 flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-admin-primary dark:text-admin-secondary shrink-0" />
            <span>Website Settings_</span>
          </h1>
          <p className="text-xs text-admin-text-secondary dark:text-admin-dark-text-secondary font-medium">
            Control the public-facing platform metadata, SEO configurations, footer text, logos, social bookmarks, and contacts.
          </p>
        </div>
        
        {/* Actions Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="px-3.5 py-2.5 rounded-[10px] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-white"
            title="Restore default LookVerse parameters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Factory</span>
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-[10px] bg-admin-primary text-white text-xs font-black uppercase tracking-widest hover:bg-opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-500/10"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      {/* TWO COLUMN GRID: Inputs customizer (col-span-8) + Real-time Visual Simulator (col-span-4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Input settings split by Tabs */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Navigation Tab rail */}
          <div className="flex border-b border-slate-150 dark:border-slate-800/80 bg-white dark:bg-admin-dark-surface p-1.5 rounded-[16px] border shadow-xs gap-1 overflow-x-auto">
            {[
              { id: 'general', label: 'Branding', icon: Sparkles },
              { id: 'contact', label: 'Contacts', icon: Mail },
              { id: 'seo', label: 'SEO Engine', icon: Globe },
              { id: 'social', label: 'Social links', icon: Share2 },
              { id: 'advanced', label: 'Operations', icon: Sliders }
            ].map(tab => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-[10px] font-mono font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-admin-primary text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Area */}
          <form onSubmit={handleSave} className="bg-white dark:bg-admin-dark-surface rounded-[24px] border border-admin-border dark:border-admin-dark-border p-6 shadow-sm space-y-6 transition-colors">
            
            {/* TAB CONTENT: GENERAL BRANDING */}
            {activeTab === 'general' && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-slate-100 dark:border-slate-800/60 pb-3">
                  <h3 className="font-mono font-black text-xs uppercase tracking-widest text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-orange animate-pulse" />
                    <span>Editorial Identity & Theme Configuration</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Website Name */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-black uppercase tracking-wider text-slate-400 block">
                      Website Name:
                    </label>
                    <input
                      type="text"
                      name="siteName"
                      required
                      value={settings.siteName}
                      onChange={handleInputChange}
                      placeholder="e.g. LOOKVERSE"
                      className={`w-full bg-slate-50 dark:bg-slate-900 border ${
                        errors.siteName ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 dark:border-slate-800 focus:border-admin-primary'
                      } px-4 py-2.5 rounded-[12px] text-xs font-bold text-slate-800 dark:text-slate-100 transition-all`}
                    />
                    {errors.siteName && <p className="text-[9px] font-mono font-bold text-rose-500 uppercase">{errors.siteName}</p>}
                  </div>

                  {/* Suffix character */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-black uppercase tracking-wider text-slate-400 block">
                      Accent Suffix Decorator:
                    </label>
                    <input
                      type="text"
                      name="siteSuffix"
                      value={settings.siteSuffix}
                      onChange={handleInputChange}
                      placeholder="e.g. _"
                      maxLength={3}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-[12px] text-xs font-mono font-bold text-slate-800 dark:text-slate-100 focus:border-admin-primary transition-all"
                    />
                  </div>

                  {/* Established year */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-black uppercase tracking-wider text-slate-400 block">
                      Established Year (4 digits):
                    </label>
                    <input
                      type="text"
                      name="establishedYear"
                      required
                      value={settings.establishedYear}
                      onChange={handleInputChange}
                      placeholder="e.g. 2026"
                      className={`w-full bg-slate-50 dark:bg-slate-900 border ${
                        errors.establishedYear ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 dark:border-slate-800 focus:border-admin-primary'
                      } px-4 py-2.5 rounded-[12px] text-xs font-mono font-bold text-slate-800 dark:text-slate-100 transition-all`}
                    />
                    {errors.establishedYear && <p className="text-[9px] font-mono font-bold text-rose-500 uppercase">{errors.establishedYear}</p>}
                  </div>

                  {/* Version indicator */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-black uppercase tracking-wider text-slate-400 block">
                      Release Tag / Version Label:
                    </label>
                    <input
                      type="text"
                      name="versionString"
                      value={settings.versionString}
                      onChange={handleInputChange}
                      placeholder="e.g. V1.0.0 RELEASE CANDIDATE"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-[12px] text-xs font-mono font-bold text-slate-800 dark:text-slate-100 focus:border-admin-primary transition-all"
                    />
                  </div>
                </div>

                {/* Slogan location */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono font-black uppercase tracking-wider text-slate-400 block">
                    Regional Location Slogan:
                  </label>
                  <input
                    type="text"
                    name="locationString"
                    value={settings.locationString}
                    onChange={handleInputChange}
                    placeholder="e.g. Jakarta, Indonesia • Port 3000"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-[12px] text-xs font-sans font-semibold text-slate-800 dark:text-slate-100 focus:border-admin-primary transition-all"
                  />
                </div>

                {/* Brand description editorial */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono font-black uppercase tracking-wider text-slate-400 block">
                    Editorial Brand Bio / Description:
                  </label>
                  <textarea
                    name="siteDescription"
                    rows={4}
                    value={settings.siteDescription}
                    onChange={handleInputChange}
                    placeholder="A concise editorial pitch regarding the sneakers database showcase..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3 rounded-[12px] text-xs font-medium text-slate-700 dark:text-slate-200 focus:border-admin-primary transition-all leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* TAB CONTENT: CONTACTS */}
            {activeTab === 'contact' && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-slate-100 dark:border-slate-800/60 pb-3">
                  <h3 className="font-mono font-black text-xs uppercase tracking-widest text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-brand-orange" />
                    <span>Public Contact Channels</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Public support email */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-black uppercase tracking-wider text-slate-400 block">
                      Administrative Contact Email:
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={settings.email}
                      onChange={handleInputChange}
                      placeholder="support@lookverse.com"
                      className={`w-full bg-slate-50 dark:bg-slate-900 border ${
                        errors.email ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 dark:border-slate-800 focus:border-admin-primary'
                      } px-4 py-2.5 rounded-[12px] text-xs font-medium text-slate-800 dark:text-slate-100 transition-all`}
                    />
                    {errors.email && <p className="text-[9px] font-mono font-bold text-rose-500 uppercase">{errors.email}</p>}
                  </div>

                  {/* Phone label */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-black uppercase tracking-wider text-slate-400 block">
                      Support Hotline / Phone:
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={settings.phone}
                      onChange={handleInputChange}
                      placeholder="+62 812-3456-7890"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-[12px] text-xs font-mono font-bold text-slate-800 dark:text-slate-100 focus:border-admin-primary transition-all"
                    />
                  </div>
                </div>

                {/* Whatsapp trigger link */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono font-black uppercase tracking-wider text-slate-400 block">
                    Direct WhatsApp Redirection URL:
                  </label>
                  <input
                    type="text"
                    name="whatsappUrl"
                    value={settings.whatsappUrl}
                    onChange={handleInputChange}
                    placeholder="https://wa.me/6281234567890"
                    className={`w-full bg-slate-50 dark:bg-slate-900 border ${
                      errors.whatsappUrl ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                    } px-4 py-2.5 rounded-[12px] text-xs font-mono text-slate-800 dark:text-slate-100 focus:border-admin-primary transition-all`}
                  />
                  {errors.whatsappUrl && <p className="text-[9px] font-mono font-bold text-rose-500 uppercase">{errors.whatsappUrl}</p>}
                  <p className="text-[9.5px] text-slate-400 font-medium">Use a standard fast click link to direct clients directly to secure chats.</p>
                </div>
              </div>
            )}

            {/* TAB CONTENT: SEO ENGINE */}
            {activeTab === 'seo' && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-slate-100 dark:border-slate-800/60 pb-3">
                  <h3 className="font-mono font-black text-xs uppercase tracking-widest text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-brand-orange" />
                    <span>Search Engine Optimization (SEO) & Analytics</span>
                  </h3>
                </div>

                {/* Meta Title */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono font-black uppercase tracking-wider text-slate-400 block">
                    Browser Header Meta-Title:
                  </label>
                  <input
                    type="text"
                    name="metaTitle"
                    value={settings.metaTitle}
                    onChange={handleInputChange}
                    placeholder="e.g. LookVerse - Premium Fashion Curation Hub"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-[12px] text-xs font-medium text-slate-800 dark:text-slate-100 focus:border-admin-primary transition-all"
                  />
                </div>

                {/* Google Analytics ID */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono font-black uppercase tracking-wider text-slate-400 block">
                    Google Analytics Tracking ID (G-XXXXXXX):
                  </label>
                  <input
                    type="text"
                    name="googleAnalyticsId"
                    value={settings.googleAnalyticsId}
                    onChange={handleInputChange}
                    placeholder="G-LVERSE2026"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-[12px] text-xs font-mono font-bold text-slate-800 dark:text-slate-100 focus:border-admin-primary transition-all"
                  />
                </div>

                {/* Meta Keywords */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono font-black uppercase tracking-wider text-slate-400 block">
                    Meta Search Keywords (Comma separated):
                  </label>
                  <textarea
                    name="metaKeywords"
                    rows={3}
                    value={settings.metaKeywords}
                    onChange={handleInputChange}
                    placeholder="sneakers, footwear, lookverse affiliate..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3 rounded-[12px] text-xs font-medium text-slate-700 dark:text-slate-200 focus:border-admin-primary transition-all leading-normal"
                  />
                </div>
              </div>
            )}

            {/* TAB CONTENT: SOCIAL & MARKETPLACE PORTALS */}
            {activeTab === 'social' && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-slate-100 dark:border-slate-800/60 pb-3">
                  <h3 className="font-mono font-black text-xs uppercase tracking-widest text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-brand-orange" />
                    <span>Social Media Handles & Affiliate Portals</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Shopee URL */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-black uppercase tracking-wider text-[#FF5722] block">
                      Shopee Affiliate Portal:
                    </label>
                    <input
                      type="text"
                      name="shopeeUrl"
                      value={settings.shopeeUrl}
                      onChange={handleInputChange}
                      placeholder="https://shopee.co.id"
                      className={`w-full bg-slate-50 dark:bg-slate-900 border ${
                        errors.shopeeUrl ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                      } px-4 py-2.5 rounded-[12px] text-xs font-mono text-slate-800 dark:text-slate-100 focus:border-admin-primary`}
                    />
                    {errors.shopeeUrl && <p className="text-[9px] font-mono font-bold text-rose-500 uppercase">{errors.shopeeUrl}</p>}
                  </div>

                  {/* Tokopedia URL */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-black uppercase tracking-wider text-[#03C569] block">
                      Tokopedia Shop Link:
                    </label>
                    <input
                      type="text"
                      name="tokopediaUrl"
                      value={settings.tokopediaUrl}
                      onChange={handleInputChange}
                      placeholder="https://tokopedia.com"
                      className={`w-full bg-slate-50 dark:bg-slate-900 border ${
                        errors.tokopediaUrl ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                      } px-4 py-2.5 rounded-[12px] text-xs font-mono text-slate-800 dark:text-slate-100 focus:border-admin-primary`}
                    />
                    {errors.tokopediaUrl && <p className="text-[9px] font-mono font-bold text-rose-500 uppercase">{errors.tokopediaUrl}</p>}
                  </div>

                  {/* Lazada URL */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-black uppercase tracking-wider text-indigo-500 block">
                      Lazada Affiliate Channel:
                    </label>
                    <input
                      type="text"
                      name="lazadaUrl"
                      value={settings.lazadaUrl}
                      onChange={handleInputChange}
                      placeholder="https://lazada.co.id"
                      className={`w-full bg-slate-50 dark:bg-slate-900 border ${
                        errors.lazadaUrl ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                      } px-4 py-2.5 rounded-[12px] text-xs font-mono text-slate-800 dark:text-slate-100 focus:border-admin-primary`}
                    />
                    {errors.lazadaUrl && <p className="text-[9px] font-mono font-bold text-rose-500 uppercase">{errors.lazadaUrl}</p>}
                  </div>

                  {/* TikTok Shop URL */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 block">
                      TikTok Creator Port:
                    </label>
                    <input
                      type="text"
                      name="tiktokShopUrl"
                      value={settings.tiktokShopUrl}
                      onChange={handleInputChange}
                      placeholder="https://tiktok.com"
                      className={`w-full bg-slate-50 dark:bg-slate-900 border ${
                        errors.tiktokShopUrl ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                      } px-4 py-2.5 rounded-[12px] text-xs font-mono text-slate-800 dark:text-slate-100 focus:border-admin-primary`}
                    />
                    {errors.tiktokShopUrl && <p className="text-[9px] font-mono font-bold text-rose-500 uppercase">{errors.tiktokShopUrl}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-50 dark:border-slate-800/60 pt-5">
                  {/* Instagram */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-black uppercase tracking-wider text-slate-400 block">
                      Instagram Link:
                    </label>
                    <input
                      type="text"
                      name="instagramUrl"
                      value={settings.instagramUrl}
                      onChange={handleInputChange}
                      placeholder="https://instagram.com"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-[10px] text-xs font-mono"
                    />
                  </div>

                  {/* Youtube */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-black uppercase tracking-wider text-slate-400 block">
                      YouTube Channel:
                    </label>
                    <input
                      type="text"
                      name="youtubeUrl"
                      value={settings.youtubeUrl}
                      onChange={handleInputChange}
                      placeholder="https://youtube.com"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-[10px] text-xs font-mono"
                    />
                  </div>

                  {/* Twitter / X */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-black uppercase tracking-wider text-slate-400 block">
                      Twitter / X Feed:
                    </label>
                    <input
                      type="text"
                      name="twitterUrl"
                      value={settings.twitterUrl}
                      onChange={handleInputChange}
                      placeholder="https://twitter.com"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-[10px] text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: OPERATIONS (ADVANCED TOGGLES) */}
            {activeTab === 'advanced' && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-slate-100 dark:border-slate-800/60 pb-3">
                  <h3 className="font-mono font-black text-xs uppercase tracking-widest text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-brand-orange" />
                    <span>System Operational Switches</span>
                  </h3>
                </div>

                <div className="space-y-5">
                  {/* Default Theme Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-black uppercase tracking-wider text-slate-400 block">
                      Standard Default Theme Interface:
                    </label>
                    <select
                      name="defaultTheme"
                      value={settings.defaultTheme}
                      onChange={handleInputChange}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-[12px] focus:outline-none focus:border-admin-primary cursor-pointer w-full font-sans uppercase"
                    >
                      <option value="dark">Editorial Charcoal Dark</option>
                      <option value="light">Swiss Minimalist Light</option>
                    </select>
                  </div>

                  {/* Operational Switch A: Maintenance Mode */}
                  <div className="flex items-center justify-between p-4 rounded-[16px] border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                    <div className="space-y-1 pr-4">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Public Maintenance Lockout Mode</span>
                      </span>
                      <p className="text-[10px] text-slate-400 leading-normal font-medium">
                        Redirect public storefront routes to a clean, non-disruptive maintenance card while maintaining active administrative dashboards.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        name="enableMaintenanceMode"
                        checked={settings.enableMaintenanceMode}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>

                  {/* Operational Switch B: Click logging */}
                  <div className="flex items-center justify-between p-4 rounded-[16px] border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                    <div className="space-y-1 pr-4">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Dynamic Redirection Metrics Loggers</span>
                      </span>
                      <p className="text-[10px] text-slate-400 leading-normal font-medium">
                        Monitor, index and save affiliate out-clicks into local tracking records. Highly recommended to keep enabled.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        name="enableClickLogging"
                        checked={settings.enableClickLogging}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>

                </div>
              </div>
            )}

            {/* Bottom Form Actions */}
            <div className="flex justify-between items-center border-t border-slate-50 dark:border-slate-850 pt-5">
              <span className="text-[9.5px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>PENDING RE-INDEX ON SUBMISSION</span>
              </span>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-[10px] bg-admin-primary text-white text-xs font-black uppercase tracking-widest hover:bg-opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>

          </form>

        </div>

        {/* RIGHT COLUMN: Real-time Visual Simulator */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Simulation Wrapper */}
          <div className="bg-white dark:bg-admin-dark-surface rounded-[24px] border border-admin-border dark:border-admin-dark-border p-5 shadow-sm space-y-5 transition-colors">
            
            <div className="flex items-center gap-2 border-b border-slate-50 dark:border-slate-800/80 pb-3">
              <Eye className="w-4 h-4 text-brand-orange" />
              <h3 className="font-black text-xs uppercase tracking-[0.18em] text-slate-800 dark:text-slate-100">
                Live Layout Simulation_
              </h3>
            </div>

            <p className="text-[10.5px] text-slate-400 leading-normal font-medium">
              Real-time representation of how user-facing UI nodes behave based on the current inputs:
            </p>

            {/* Brand Logo Header Sim */}
            <div className="space-y-1.5 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-[16px] border border-slate-100 dark:border-slate-800/60">
              <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Logo Navigation Deck Sim:</span>
              <div className="bg-white dark:bg-brand-black p-3.5 rounded-[10px] border border-slate-150 dark:border-slate-800 flex items-center justify-between text-xs transition-colors">
                <div className="font-display font-black italic text-brand-black dark:text-white select-none text-base">
                  {settings.siteName || 'LOOKVERSE'}
                  <span className="text-brand-orange">{settings.siteSuffix || '_'}</span>
                </div>
                <div className="flex gap-2 text-[9px] font-black uppercase text-zinc-400">
                  <span>Home</span>
                  <span>Shop</span>
                </div>
              </div>
            </div>

            {/* Brand Footer Sim */}
            <div className="space-y-1.5 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-[16px] border border-slate-100 dark:border-slate-800/60">
              <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Footer Column simulation:</span>
              <div className="bg-white dark:bg-brand-black p-4 rounded-[10px] border border-slate-150 dark:border-slate-800 space-y-3 text-[11px] transition-colors">
                <div className="font-display font-black italic text-brand-black dark:text-white text-base">
                  {settings.siteName || 'LOOKVERSE'}
                  <span className="text-brand-orange">{settings.siteSuffix || '_'}</span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed font-medium">
                  {settings.siteDescription || 'No description configured.'}
                </p>
                <div className="flex items-center gap-2 pt-1 border-t border-slate-50 dark:border-slate-800 text-[8px] font-mono font-bold text-zinc-500">
                  <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse"></span>
                  <span className="truncate">{settings.locationString || 'No location set.'}</span>
                </div>
              </div>
            </div>

            {/* Copyright sim */}
            <div className="space-y-1.5 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-[16px] border border-slate-100 dark:border-slate-800/60">
              <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Footer Bottom Sim:</span>
              <div className="bg-white dark:bg-brand-black p-3.5 rounded-[10px] border border-slate-150 dark:border-slate-800 text-[8px] font-mono font-black uppercase text-zinc-400 flex justify-between gap-2 items-center transition-colors">
                <span className="truncate">© {settings.establishedYear || new Date().getFullYear()} {settings.siteName || 'LOOKVERSE'}.</span>
                <span className="text-brand-orange text-right shrink-0">{settings.versionString || 'V1.0'}</span>
              </div>
            </div>

            {/* Metadata tags preview */}
            <div className="space-y-1.5 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-[16px] border border-slate-100 dark:border-slate-800/60">
              <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest block">SEO Crawler Metatags:</span>
              <div className="text-[9.5px] font-mono text-slate-500 space-y-1.5 leading-relaxed bg-white dark:bg-brand-black p-3 rounded-[10px] border border-slate-150 dark:border-slate-800 break-all select-all transition-colors">
                <p><strong>&lt;title&gt;</strong> {settings.metaTitle || 'None'}</p>
                <p className="line-clamp-1"><strong>&lt;meta keywords&gt;</strong> {settings.metaKeywords || 'None'}</p>
                <p><strong>&lt;gtag ID&gt;</strong> {settings.googleAnalyticsId || 'None'}</p>
              </div>
            </div>

          </div>

          {/* Section: Configuration Help Card */}
          <div className="bg-indigo-50/50 dark:bg-indigo-950/10 rounded-[24px] border border-indigo-100/40 dark:border-indigo-900/20 p-5 space-y-3.5">
            <div className="flex items-center gap-2 text-admin-primary dark:text-admin-secondary text-xs font-black uppercase tracking-widest">
              <Info className="w-4 h-4 shrink-0" />
              <span>Why config matters_</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Updating these indices automatically updates the LookVerse public frontend client-side wrapper dynamically. All social links bind themselves inside the public Footer navigation node synchronously.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Settings;
