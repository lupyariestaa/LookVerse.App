import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Image as ImageIcon,
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Eye
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { Banner } from '../../types';

export const Banners: React.FC = () => {
  // Banner states
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Alerts/Toasts
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal Triggers
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [deletingBannerId, setDeletingBannerId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image: '',
    buttonText: '',
    buttonLink: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const b = await dataService.getBanners();
      setBanners(b);
    } catch (e) {
      showToast('error', 'Failed to retrieve editorial banners.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert(null);
    }, 4000);
  };

  // Search filter
  const filteredBanners = banners.filter(banner => {
    return (
      banner.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      banner.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      banner.buttonText.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Handle Form Inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Open Form modal
  const openFormModal = (banner: Banner | null = null) => {
    setEditingBanner(banner);
    if (banner) {
      setFormData({
        title: banner.title,
        subtitle: banner.subtitle,
        image: banner.image,
        buttonText: banner.buttonText,
        buttonLink: banner.buttonLink
      });
    } else {
      setFormData({
        title: '',
        subtitle: '',
        image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=1200&auto=format&fit=crop',
        buttonText: 'Discover Now',
        buttonLink: '/shop'
      });
    }
    setIsFormOpen(true);
  };

  // Submit Banner Form
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showToast('error', 'Campaign title is required.');
      return;
    }
    if (!formData.image.trim()) {
      showToast('error', 'Banner cover image URL is required.');
      return;
    }

    let updatedBanners = [...banners];
    const payload: Banner = {
      id: editingBanner ? editingBanner.id : `banner-${Date.now()}`,
      title: formData.title.trim(),
      subtitle: formData.subtitle.trim(),
      image: formData.image.trim(),
      buttonText: formData.buttonText.trim() || 'Discover Now',
      buttonLink: formData.buttonLink.trim() || '/shop'
    };

    if (editingBanner) {
      // Update
      updatedBanners = updatedBanners.map(b => (b.id === editingBanner.id ? payload : b));
      dataService.logActivity(`Promo Campaign "${payload.title}" updated successfully.`, 'UPDATE');
      showToast('success', 'CAMPAIGN BANNER RE-CONFIGURED.');
    } else {
      // Create
      updatedBanners = [...updatedBanners, payload];
      dataService.logActivity(`Promo Campaign "${payload.title}" launched and published.`, 'PUBLISH');
      showToast('success', 'NEW HERO CAMPAIGN BANNER LAUNCHED.');
    }

    dataService.saveBanners(updatedBanners);
    setBanners(updatedBanners);
    setIsFormOpen(false);
  };

  // Open Delete modal
  const openDeleteModal = (id: string) => {
    // Prevent leaving the site with zero promotional banners for safety
    if (banners.length <= 1) {
      showToast('error', 'CRITICAL CONSTRAINT: Website must maintain at least one promotional banner.');
      return;
    }
    setDeletingBannerId(id);
    setIsDeleteOpen(true);
  };

  // Confirm Delete Banner
  const confirmDeleteBanner = () => {
    if (!deletingBannerId) return;

    const targetBanner = banners.find(b => b.id === deletingBannerId);
    const updated = banners.filter(b => b.id !== deletingBannerId);

    dataService.saveBanners(updated);
    setBanners(updated);

    if (targetBanner) {
      dataService.logActivity(`Promo Campaign "${targetBanner.title}" taken offline.`, 'DELETE');
    }

    setIsDeleteOpen(false);
    setDeletingBannerId(null);
    showToast('success', 'PROMO CAMPAIGN ARCHIVED.');
  };

  const presetSliderCovers = [
    { name: 'Kicks Red', url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=1200&auto=format&fit=crop' },
    { name: 'Streetwear', url: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=1200&auto=format&fit=crop' },
    { name: 'Activewear', url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop' },
    { name: 'Aesthetic Loft', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop' }
  ];

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Alert Banner / Toast notification */}
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

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-admin-border dark:border-admin-dark-border transition-colors duration-300">
        <div className="space-y-1.5">
          <h1 className="text-xl font-black uppercase tracking-tight text-slate-800 dark:text-slate-100 -skew-x-2">
            Editorial Banners_
          </h1>
          <p className="text-xs text-admin-text-secondary dark:text-admin-dark-text-secondary font-medium">
            Publish, modify, and prioritize promotional slider banner campaigns showcased in real-time on the main landing homepage.
          </p>
        </div>
        <button
          onClick={() => openFormModal()}
          className="px-4 py-2.5 rounded-[10px] bg-admin-primary text-white text-xs font-black uppercase tracking-widest hover:bg-opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-500/10"
        >
          <Plus className="w-4 h-4" />
          <span>New Banner</span>
        </button>
      </div>

      {/* Control filters and search console */}
      <div className="bg-white dark:bg-admin-dark-surface p-5 rounded-[20px] border border-admin-border dark:border-admin-dark-border shadow-sm space-y-4 transition-colors duration-300">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Search Box */}
          <div className="relative flex-1 w-full max-w-md">
            <input
              type="text"
              placeholder="Search campaigns by title, taglines or buttons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3 pl-10 rounded-[12px] text-xs font-medium placeholder-slate-400 focus:outline-none focus:border-admin-primary transition-all text-slate-800 dark:text-slate-100"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="text-[10px] font-mono text-slate-400 uppercase">
            Active Campaigns: <span className="text-slate-700 dark:text-slate-200 font-bold">{banners.length}</span>
          </div>
        </div>
      </div>

      {/* Campaign List Grid */}
      {loading ? (
        <div className="py-24 text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-admin-primary animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">PROPAGATING CAMPAIGN DATA...</p>
        </div>
      ) : filteredBanners.length === 0 ? (
        <div className="bg-white dark:bg-admin-dark-surface rounded-[24px] border border-admin-border dark:border-admin-dark-border shadow-sm py-24 text-center space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-900/30 flex items-center justify-center text-slate-300 mx-auto">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-mono font-black uppercase text-slate-700 dark:text-slate-300">NO CAMPAIGNS PLANNED_</p>
            <p className="text-[11px] text-slate-400 font-medium">Re-filter search parameters or add a banner using the header menu.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredBanners.map((banner) => {
            return (
              <motion.div
                key={banner.id}
                layout
                className="bg-white dark:bg-admin-dark-surface rounded-[24px] border border-admin-border dark:border-admin-dark-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col group"
              >
                {/* HIGH-FIDELITY PREVIEW MOCKUP BOARD */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Live Homepage Mockup Preview_</span>
                  </div>
                  <span>ID: {banner.id}</span>
                </div>

                {/* Banner Render Simulator */}
                <div className="h-64 relative bg-slate-100 dark:bg-slate-950 overflow-hidden shrink-0">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=1200&auto=format&fit=crop';
                    }}
                  />
                  {/* Real-time slider styling identical gradient layer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent" />
                  
                  {/* Simulated Content Layer */}
                  <div className="absolute inset-0 p-8 flex flex-col justify-center items-start text-left max-w-[80%] space-y-3">
                    <h2 className="text-white font-black text-xl md:text-2xl tracking-tight uppercase -skew-x-2 drop-shadow-md">
                      {banner.title || "CAMPAIGN NAME PLACEHOLDER"}
                    </h2>
                    <p className="text-white/85 text-[11px] font-medium leading-relaxed line-clamp-2 drop-shadow-sm font-sans">
                      {banner.subtitle || "Tell a story or showcase discounts to attract visitor link clicks immediately."}
                    </p>
                    <div className="pt-2">
                      <span className="inline-flex items-center gap-1 px-4.5 py-2.5 rounded-[8px] bg-white text-slate-950 text-[10px] font-mono font-black uppercase tracking-wider shadow-md hover:bg-slate-50">
                        <span>{banner.buttonText || "Discover Now"}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Controls Section */}
                <div className="p-6 bg-white dark:bg-admin-dark-surface space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                      <span>Destination Anchor Link:</span>
                      <a
                        href={banner.buttonLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-admin-primary dark:text-admin-secondary hover:underline flex items-center gap-0.5"
                      >
                        <span>{banner.buttonLink}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-50 dark:border-slate-800/60 flex items-center justify-end gap-3">
                    <button
                      onClick={() => openFormModal(banner)}
                      className="px-3.5 py-2 rounded-[10px] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold uppercase flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Configure Specs</span>
                    </button>
                    <button
                      onClick={() => openDeleteModal(banner.id)}
                      className="px-3.5 py-2 rounded-[10px] border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 text-xs font-mono font-bold uppercase flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Take Offline</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* FORM MODAL: Add & Edit Banner */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto" id="banner-form-modal">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Modal Body */}
            <div className="flex min-h-screen items-center justify-center p-4 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="w-full max-w-lg bg-white dark:bg-admin-dark-surface rounded-[24px] border border-admin-border dark:border-admin-dark-border shadow-2xl overflow-hidden flex flex-col text-left transition-colors duration-300"
              >
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30">
                  <div className="space-y-1">
                    <h2 className="text-sm font-mono font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                      {editingBanner ? 'Curate Campaign_' : 'Register New Campaign_'}
                    </h2>
                    <p className="text-[10px] text-slate-400 uppercase font-medium tracking-wider">
                      {editingBanner ? `EDITING HERO SLIDE // ID: ${editingBanner.id}` : 'ENTER HERO PROMOTION DETAILS'}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="p-1.5 rounded-[8px] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form fields */}
                <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 block">
                      Campaign Main Title_
                    </label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g. MID SEASON BLAST '26"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 px-4 py-3 rounded-[10px] focus:outline-none focus:border-admin-primary transition-colors font-bold uppercase"
                    />
                  </div>

                  {/* Subtitle Tagline */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 block">
                      Sub-title Tagline / Context_
                    </label>
                    <textarea
                      name="subtitle"
                      rows={2}
                      value={formData.subtitle}
                      onChange={handleInputChange}
                      placeholder="e.g. Get up to 70% off selected streetwear and hoodies from local top brand Erigo."
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 px-4 py-3 rounded-[10px] focus:outline-none focus:border-admin-primary transition-colors font-medium leading-relaxed resize-none"
                    />
                  </div>

                  {/* Image cover */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 block">
                      Banner Cover Image URL_
                    </label>
                    <input
                      type="url"
                      name="image"
                      required
                      value={formData.image}
                      onChange={handleInputChange}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 px-4 py-3 rounded-[10px] focus:outline-none focus:border-admin-primary transition-colors font-medium"
                    />
                  </div>

                  {/* Preloaded quick cover presets */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                      Quick Cover Presets:
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {presetSliderCovers.map((img) => (
                        <button
                          key={img.name}
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, image: img.url }))}
                          className={`h-11 rounded-[6px] overflow-hidden border transition-all cursor-pointer relative ${
                            formData.image === img.url ? 'border-admin-primary ring-2 ring-indigo-500/10' : 'border-slate-150'
                          }`}
                        >
                          <img src={img.url} alt={img.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 hover:bg-black/10 transition-colors flex items-center justify-center">
                            <span className="text-[7.5px] font-mono text-white font-black uppercase tracking-wider">{img.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Button and Anchor Links */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 block">
                        Action Button Text_
                      </label>
                      <input
                        type="text"
                        name="buttonText"
                        required
                        value={formData.buttonText}
                        onChange={handleInputChange}
                        placeholder="e.g. Shop Now"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 px-4 py-3 rounded-[10px] focus:outline-none focus:border-admin-primary transition-colors font-bold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 block">
                        Action Redirect Destination Link_
                      </label>
                      <input
                        type="text"
                        name="buttonLink"
                        required
                        value={formData.buttonLink}
                        onChange={handleInputChange}
                        placeholder="e.g. /shop or custom URL"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 px-4 py-3 rounded-[10px] focus:outline-none focus:border-admin-primary transition-colors font-mono"
                      />
                    </div>
                  </div>

                  {/* Modal Action Buttons */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-4.5 py-2.5 rounded-[10px] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-mono font-bold uppercase cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-[10px] bg-admin-primary hover:bg-opacity-95 text-white text-xs font-black uppercase tracking-wider cursor-pointer transition-colors shadow-md shadow-indigo-500/10"
                    >
                      {editingBanner ? 'Save Campaign Specs' : 'Deploy Campaign'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM DELETE MODAL */}
      <AnimatePresence>
        {isDeleteOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto" id="banner-delete-modal">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsDeleteOpen(false)} />
            <div className="flex min-h-screen items-center justify-center p-4 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-sm bg-white dark:bg-admin-dark-surface rounded-[24px] border border-admin-border dark:border-admin-dark-border shadow-2xl p-6 text-center space-y-5"
              >
                <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/20 text-red-500 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6 animate-bounce" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-mono font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
                    DESTRUCTIVE OPERATION COMMAND_
                  </h3>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">
                    Are you absolutely sure you want to permanently delete this Editorial Campaign Banner? This will remove the banner from the landing page.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setIsDeleteOpen(false)}
                    className="px-4 py-2.5 rounded-[10px] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-mono font-bold uppercase cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                  >
                    Abort Action
                  </button>
                  <button
                    onClick={confirmDeleteBanner}
                    className="px-4.5 py-2.5 rounded-[10px] bg-red-500 hover:bg-red-600 text-white text-xs font-black uppercase tracking-wider cursor-pointer transition-colors shadow-md shadow-red-500/10"
                  >
                    Confirm Decommission
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Banners;
